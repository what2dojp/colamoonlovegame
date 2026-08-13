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
assert(game.getState().fate === GAME_CONFIG.startingFate, "starting fate");
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
]) {
  assert(EVENT_BY_ID[id], `${id} exists`);
}
for (const [id, weights] of Object.entries(GAME_CONFIG.nightScoreWeights)) {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  assert(Math.abs(sum - 1) < 1e-9, `${id} night weights must sum to 1`);
}

const beforeFate = afterIntro.fate;
const iv = game.intervene("encounter", "jupiter");
assert(iv.ok, "encounter should run");
assert(game.getState().fate === beforeFate - 150, "encounter costs 150");
assert(game.getState().currentEvent.id === "IV_encounter", "encounter event started");
assert(game.getState().currentEvent.description.includes("西打木星"), "event interpolates target");
assert(
  game.getState().currentSession.weightMods.EVENT_jupiter_quiet_date > 0,
  "encounter raises quiet date weight"
);

game.choose("stay");
assert(game.getState().flags.encounter_jupiter, "encounter flag");
assert(game.getState().characters.jupiter.affection >= 58 + 5 + 8, "jupiter affection from intro+encounter");

const next = game.nextEvent();
assert(next.ok, "nextEvent draws from pool");
assert(game.getState().currentEvent.id !== "EVENT_001_prologue", "pool draw is not intro");
assert(!GAME_CONFIG.currentSeason.includes("ending"), "season is ongoing");
const poolId = game.getState().currentEvent.id;
assert(poolId.startsWith("EVENT_") || poolId.startsWith("IV_"), "drew an event");

game.simulateDonation({ amount: 100, message: "test", from: "mock" });
assert(game.getState().fate > 0, "donation adds fate");
game.addFate(25);
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
