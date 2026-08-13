import { createGame } from "../src/engine/game.js";
import { GAME_CONFIG } from "../src/config/game.config.js";
import { nightScore, pickNightPartner } from "../src/engine/session.js";
import { migrateSave } from "../src/engine/save.js";
import { pairKey } from "../src/engine/save.js";
import { EVENT_BY_ID } from "../data/seasons/qixi-2026/events.js";

const assert = (cond, message) => {
  if (!cond) throw new Error(message);
};

function playIntro(game) {
  game.choose("listen");
  game.choose("open");
  game.choose("tease");
  game.choose("understood");
  game.choose("receive");
  game.choose("fight");
  game.choose("observe");
}

const game = createGame({ persist: false, rng: () => 0 });
assert(game.getState().currentEvent.id === "EVENT_001_prologue", "should open on prologue");
assert(game.getState().fate === GAME_CONFIG.startingFate, "no in-game fate balance required");
assert(game.getState().charactersView.length === 5, "five characters");
assert(game.intervene("letter", "nini").ok === false, "interventions locked at start");
assert(game.getState().settlement.label === "今晚尚未結算", "no story ending at start");

playIntro(game);

const afterIntro = game.getState();
assert(afterIntro.flags.interventionsUnlocked, "interventions unlock after realization");
assert(afterIntro.flags.dynamic_pool_unlocked, "dynamic pool unlocks after five meet");
assert(afterIntro.currentEvent.id === "EVENT_008_office_hub", "land on hub");
assert(afterIntro.settlement.type === "open", "session not settled after intro");
assert(afterIntro.pool.length > 0, "pool has candidates after intro");
assert(
  afterIntro.pool.every((item) => !String(item.id).startsWith("EVENT_00")),
  "intro events are not in the random pool"
);

assert(afterIntro.characters.nini.dependence != null, "nini has dependence");
assert(afterIntro.characters.meteor.destiny != null, "meteor destiny key");
assert(afterIntro.characters.meteor.destinyBelief == null, "old destinyBelief removed");
assert(afterIntro.characters.pepsi.resonance != null, "pepsi resonance key");
assert(afterIntro.characters.pepsi.similarity != null, "pepsi similarity key");
assert(afterIntro.characters.pepsi.jealousy == null, "pepsi has no jealousy");
assert(afterIntro.characters.jupiter.patience != null, "jupiter patience key");
assert(afterIntro.characters.jupiter.restraint == null, "old restraint removed");
assert(afterIntro.characters.mars.chemistry != null, "mars chemistry");
assert(afterIntro.characters.mars.jealousy == null, "mars has no personal jealousy");
assert(afterIntro.relationships["mars-moon"] || afterIntro.relationships["moon-mars"], "moon-mars tension exists");
assert(afterIntro.charactersView.find((c) => c.id === "nini").uniquePrimary === "obsession", "nini uniquePrimary");
assert(afterIntro.charactersView.find((c) => c.id === "meteor").uniquePrimary === "destiny", "meteor uniquePrimary");
assert(afterIntro.charactersView.find((c) => c.id === "pepsi").uniquePrimary === "resonance", "pepsi uniquePrimary");
assert(afterIntro.charactersView.find((c) => c.id === "jupiter").uniquePrimary === "devotion", "jupiter uniquePrimary");
assert(afterIntro.charactersView.find((c) => c.id === "mars").uniquePrimary === "chemistry", "mars uniquePrimary");
for (const id of [
  "EVENT_nini_dependence_01",
  "EVENT_meteor_pride_01",
  "EVENT_pepsi_understanding_01",
  "EVENT_jupiter_hope_low_01",
  "EVENT_mars_kings_01",
  "EVENT_nini_solo_01",
  "EVENT_nini_lockbox_01",
  "EVENT_meteor_never_broke_up_01",
  "EVENT_pepsi_identity_01",
  "EVENT_jupiter_packing_01",
  "EVENT_mars_too_close_01",
]) {
  assert(EVENT_BY_ID[id], `${id} exists`);
}
assert(EVENT_BY_ID.EVENT_office_simmer.weight === 5, "simmer weight dropped from 30 to 5");
assert(!EVENT_BY_ID.EVENT_office_simmer.repeatable, "simmer is not infinitely repeatable");
assert(EVENT_BY_ID.EVENT_office_simmer_2.weight === 5, "second simmer exists at weight 5");
assert(EVENT_BY_ID.EVENT_nini_lockbox_01.weight >= 22, "crisis heavier than simmer");
assert(afterIntro.interventions.length === 5, "five host intervention buttons");
assert(
  afterIntro.interventions.map((item) => item.cost).join(",") === "100,200,300,500,1000",
  "host permission prices 100/200/300/500/1000"
);
assert(
  afterIntro.pool.find((item) => item.id === "EVENT_office_simmer")?.weight === 5,
  "simmer is in pool at weight 5"
);
for (const [id, weights] of Object.entries(GAME_CONFIG.nightScoreWeights)) {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  assert(Math.abs(sum - 1) < 1e-9, `${id} night weights must sum to 1`);
}

const beforeFate = afterIntro.fate;
const iv = game.intervene("encounter", "jupiter");
assert(iv.ok, "encounter should run");
assert(game.getState().fate === beforeFate, "encounter does not deduct fate");
assert(game.getState().currentEvent.id === "IV_encounter", "encounter event started");
assert(game.getState().currentEvent.description.includes("西打木星"), "event interpolates target");
assert(
  game.getState().currentSession.weightMods.EVENT_jupiter_quiet_date > 0,
  "jupiter encounter raises jupiter solo weight"
);
assert(
  !game.getState().currentSession.weightMods.EVENT_nini_solo_01,
  "jupiter encounter does not boost nini solo"
);

game.choose("stay");
assert(game.getState().flags.encounter_jupiter, "encounter flag");
assert(game.getState().flags.solo_active_jupiter, "jupiter solo_active after encounter");
assert(game.getState().currentEvent.id === "EVENT_jupiter_quiet_date", "encounter forces jupiter solo");

const noSolo = createGame({ persist: false, rng: () => 0 });
playIntro(noSolo);
const sabotageDenied = noSolo.intervene("sabotage", "nini", { force: true });
assert(sabotageDenied.ok === false, "sabotage refused without solo_active");

const niniEnc = createGame({ persist: false, rng: () => 0 });
playIntro(niniEnc);
niniEnc.intervene("encounter", "nini", { force: true });
assert(
  niniEnc.getState().currentSession.weightMods.EVENT_nini_solo_01 > 0,
  "nini encounter raises nini solo, not jupiter date"
);
assert(
  !niniEnc.getState().currentSession.weightMods.EVENT_jupiter_quiet_date,
  "nini encounter does not raise jupiter quiet date"
);
niniEnc.choose("stay");
assert(niniEnc.getState().currentEvent.id === "EVENT_nini_solo_01", "nini encounter forces nini solo");
assert(niniEnc.getState().flags.solo_active_nini, "solo_active_nini set");
const smashed = niniEnc.intervene("sabotage", "mars", { force: true });
assert(smashed.ok, "sabotage allowed during nini solo");
assert(niniEnc.getState().pendingTargetId === "nini" || niniEnc.getState().currentEvent.id === "IV_sabotage", "sabotage retargets to active solo");
niniEnc.choose("break");
assert(niniEnc.getState().flags.date_broken_nini, "date_broken_nini written");
assert(niniEnc.getState().currentEvent.id === "EVENT_nini_lockbox_01", "nini sabotage forces lockbox crisis");

const letterGame = createGame({ persist: false, rng: () => 0 });
playIntro(letterGame);
letterGame.intervene("letter", "nini", { force: true });
letterGame.choose("private");
assert(letterGame.getState().flags.letter_to_nini, "letter_to_nini written");
assert(letterGame.getState().currentEvent.id === "EVENT_letter_nini", "letter forces follow-up event");

const forceGame = createGame({ persist: false, rng: () => 0 });
playIntro(forceGame);
forceGame.intervene("force", "nini", { force: true });
forceGame.choose("center");
assert(forceGame.getState().currentEvent.id === "EVENT_nini_lockbox_01", "force from hub sends target into crisis, not spotlight");

const pepsiBurn = createGame({ persist: false, rng: () => 0 });
playIntro(pepsiBurn);
pepsiBurn.intervene("jealousy", "pepsi", { force: true });
pepsiBurn.choose("burn");
assert(pepsiBurn.getState().currentEvent.id === "EVENT_pepsi_identity_01", "pepsi jealousy burns into identity crisis");
assert(pepsiBurn.getState().flags.public_jealous_pepsi, "public_jealous_pepsi written for later shura");

const peekGame = createGame({ persist: false, rng: () => 0 });
playIntro(peekGame);
peekGame.intervene("peek", "nini", { force: true });
peekGame.choose("secret");
assert(peekGame.getState().currentEvent.id === "IV_peek", "peek menu opens secret");
peekGame.choose("keep");
assert(peekGame.getState().flags.secret_nini, "secret_nini written");
assert(
  peekGame.getState().currentSession.weightMods.EVENT_nini_lockbox_01 > 0,
  "secret_nini raises lockbox weight"
);

const next = game.nextEvent();
assert(next.ok, "nextEvent draws from pool");
assert(game.getState().currentEvent.id !== "EVENT_001_prologue", "pool draw is not intro");
assert(!GAME_CONFIG.currentSeason.includes("ending"), "season is ongoing");
const poolId = game.getState().currentEvent.id;
assert(poolId.startsWith("EVENT_") || poolId.startsWith("IV_"), "drew an event");

game.simulateDonation({ amount: 100, message: "test", from: "mock" });
assert(game.getState().fate >= 0, "donation helper still exists but is not required for interventions");
game.setStat("pepsi", "resonance", 12);
assert(game.getState().characters.pepsi.resonance === 12, "admin setStat official key");
game.setStat("pepsi", "jealousy", 12);
assert(game.getState().characters.pepsi.jealousy == null, "pepsi jealousy is not an official stat");

const jealous = createGame({ persist: false, rng: () => 0 });
playIntro(jealous);
const niniWeightBefore =
  jealous.getState().pool.find((item) => item.id === "EVENT_nini_jealousy_01")?.effectiveWeight || 0;
jealous.intervene("jealousy", "nini", { force: true });
assert(jealous.getState().flags.jealousy_triggered_nini, "jealousy flag set");
assert(jealous.getState().characters.nini.jealousy >= 42, "jealousy +20 on enter");
assert(
  jealous.getState().currentSession.weightMods.EVENT_nini_jealousy_01 >= 40,
  "jealousy intervention boosts pool weight"
);
jealous.choose("burn");
assert(jealous.getState().currentEvent.id === "EVENT_nini_jealousy_01", "forceEvent jumped to nini jealousy");

const pepsiIv = createGame({ persist: false, rng: () => 0 });
playIntro(pepsiIv);
const pepsiUnderstanding = pepsiIv.getState().characters.pepsi.understanding;
pepsiIv.intervene("jealousy", "pepsi", { force: true });
assert(pepsiIv.getState().characters.pepsi.jealousy == null, "pepsi jealousy still unofficial after IV");
assert(
  pepsiIv.getState().characters.pepsi.understanding > pepsiUnderstanding,
  "pepsi jealousy IV redirects into understanding"
);
assert(pepsiIv.getState().flags.jealousy_triggered_pepsi, "pepsi jealousy flag still unlocks her event");

const marsIv = createGame({ persist: false, rng: () => 0 });
playIntro(marsIv);
const marsProvocation = marsIv.getState().characters.mars.provocation;
marsIv.intervene("jealousy", "mars", { force: true });
assert(marsIv.getState().characters.mars.jealousy == null, "mars jealousy still unofficial after IV");
assert(
  marsIv.getState().characters.mars.provocation > marsProvocation,
  "mars jealousy IV redirects into provocation"
);
assert(
  (jealous.getState().pool.find((item) => item.id === "EVENT_nini_jealousy_01")?.effectiveWeight || 0) >=
    niniWeightBefore,
  "weight change is visible in pool"
);

const earlyEnd = createGame({ persist: false });
assert(earlyEnd.getState().currentEvent.id === "EVENT_001_prologue", "start intro");
earlyEnd.endSession();
assert(earlyEnd.getState().currentEvent.id === "FINAL_night_partner", "can end during event 1");
assert(earlyEnd.getState().currentEvent.title.includes("過夜"), "final title");
assert(earlyEnd.getState().currentSession.nightPartner, "partner computed");
assert(!earlyEnd.getState().flags.jupiter_route, "no route flag");
assert(!earlyEnd.getState().flags.story_completed, "no story completed flag");
earlyEnd.choose("close_night");
assert(earlyEnd.getState().settlement.status === "settled", "settled after final choice");
assert(earlyEnd.getState().settlement.label === "本次事件狀態：暫時休戰", "truce copy");
assert(earlyEnd.getState().currentSession.progressCard.title === "七夕事件進度卡", "progress card name");
assert(earlyEnd.getState().archive["qixi-2026"].nightPartner, "archive night partner");
assert(earlyEnd.getState().flags.qixi_2026_night_partner, "season night partner flag");

const partnerGame = createGame({ persist: false });
playIntro(partnerGame);
partnerGame.setStat("jupiter", "affection", 99);
partnerGame.setStat("jupiter", "devotion", 90);
partnerGame.setStat("nini", "affection", 10);
partnerGame.setStat("meteor", "affection", 10);
partnerGame.setStat("pepsi", "affection", 10);
partnerGame.setStat("mars", "affection", 10);
assert(pickNightPartner(partnerGame.getState()) === "jupiter", "high jupiter night score wins");
partnerGame.endSession();
partnerGame.choose("close_night");
assert(partnerGame.getState().flags.qixi_2026_night_partner === "jupiter", "jupiter night flag");
assert(partnerGame.getState().archive["qixi-2026"].nightPartner === "jupiter", "archive jupiter");
assert(!partnerGame.getState().flags.jupiter_route, "still no route flag");

const chemistryGame = createGame({ persist: false });
playIntro(chemistryGame);
chemistryGame.setStat("nini", "affection", 95);
chemistryGame.setStat("nini", "obsession", 10);
chemistryGame.setStat("nini", "jealousy", 10);
chemistryGame.setStat("nini", "trust", 50);
chemistryGame.setStat("nini", "dependence", 10);
chemistryGame.setStat("mars", "affection", 50);
chemistryGame.setStat("mars", "chemistry", 95);
chemistryGame.setStat("mars", "provocation", 80);
chemistryGame.setStat("mars", "pride", 80);
chemistryGame.setTension(pairKey("moon", "mars"), 80);
assert(nightScore(chemistryGame.getState(), "mars") > nightScore(chemistryGame.getState(), "nini"), "chemistry can beat higher affection");
assert(pickNightPartner(chemistryGame.getState()) === "mars", "night score is not max affection");

const tie = createGame({ persist: false });
playIntro(tie);
for (const c of tie.getState().charactersView) {
  for (const key of c.stats) tie.setStat(c.id, key, 50);
}
for (const key of Object.keys(tie.getState().relationships)) {
  tie.setTension(key, 50);
}
tie.intervene("letter", "mars", { force: true });
tie.choose("private");
assert(pickNightPartner(tie.getState()) === "mars", "tie-break uses last major interaction");

const migrated = migrateSave({
  version: 2,
  currentSeason: "qixi-2026",
  characters: {
    nini: { affection: 50, obsession: 30, jealousy: 20, trust: 60 },
    meteor: { affection: 50, destinyBelief: 77, nostalgia: 80, jealousy: 20, pride: 40 },
    pepsi: { affection: 40, soulResonance: 70, destinyBelief: 61, understanding: 90, jealousy: 33 },
    jupiter: { affection: 40, devotion: 70, restraint: 55, jealousy: 10, hope: 40 },
    mars: { affection: 20, chemistry: 40, provocation: 70, pride: 80, jealousy: 99 },
  },
  flags: { qixi_2026_night_partner: "jupiter" },
  archive: { "qixi-2026": { nightPartner: "jupiter", progressCard: { title: "七夕事件進度卡", status: "暫時休戰" } } },
  currentSession: { status: "active", phase: "dynamic" },
});
assert(migrated.characters.meteor.destiny === 77, "destinyBelief migrated");
assert(migrated.characters.meteor.destinyBelief == null, "old meteor key dropped");
assert(migrated.characters.pepsi.resonance === 70, "soulResonance migrated");
assert(migrated.characters.pepsi.destiny === 61, "pepsi destinyBelief migrated");
assert(migrated.characters.pepsi.jealousy == null, "pepsi jealousy not official");
assert(migrated.characters.jupiter.patience === 55, "restraint migrated to patience");
assert(migrated.characters.nini.dependence != null, "nini dependence filled");
assert(migrated.characters.mars.jealousy == null, "mars jealousy not official");
assert(migrated.relationships[pairKey("moon", "mars")], "moon-mars relationship filled");
assert(migrated.archive["qixi-2026"].nightPartner === "jupiter", "archive survives migration");
assert(migrated.currentSession.progressCard !== undefined || migrated.archive["qixi-2026"].progressCard, "progress card kept");

const store = {};
globalThis.localStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, value) => {
    store[key] = String(value);
  },
  removeItem: (key) => {
    delete store[key];
  },
};
globalThis.window = { addEventListener() {} };

const persistA = createGame({ persist: true });
playIntro(persistA);
persistA.setStat("jupiter", "affection", 88);
persistA.endSession();
persistA.choose("close_night");
assert(persistA.getState().currentSession.progressCard, "card saved in session");
assert(persistA.getState().archive["qixi-2026"].progressCard.status === "暫時休戰", "card archived");

const persistB = createGame({ persist: true });
assert(persistB.getState().archive["qixi-2026"].nightPartner === "jupiter", "next session reads archive");
assert(persistB.getState().flags.qixi_2026_night_partner === "jupiter", "next session reads flag");
persistB.resetSession();
assert(persistB.getState().currentEvent.id === "EVENT_001_prologue", "reset session restarts tonight");
assert(persistB.getState().archive["qixi-2026"].nightPartner === "jupiter", "reset keeps archive");
assert(persistB.getState().flags.qixi_2026_night_partner === "jupiter", "reset keeps night partner flag");

console.log("mvp smoke ok", {
  event: game.getState().currentEvent.id,
  fate: game.getState().fate,
  fire: game.getState().derived.fireIndex,
  settlement: persistB.getState().settlement.label,
  archive: persistB.getState().archive["qixi-2026"].nightPartner,
});
