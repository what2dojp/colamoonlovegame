import { createGame } from "../src/engine/game.js";
import { GAME_CONFIG } from "../src/config/game.config.js";
import { nightScore, pickNightPartner } from "../src/engine/session.js";
import { migrateSave } from "../src/engine/save.js";
import { pairKey } from "../src/engine/save.js";
import { EVENT_BY_ID } from "../data/seasons/qixi-2026/events.js";
import { eventPresentation } from "../src/ui/presentation.js";

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

function playForced(game, eventId, choiceId) {
  const started = game.startEvent(eventId, { force: true });
  assert(started.ok, `should start ${eventId}`);
  const chosen = game.choose(choiceId);
  assert(chosen.ok, `should choose ${choiceId} on ${eventId}`);
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

const SHURA_IDS = [
  "EVENT_shura_nini_meteor_01",
  "EVENT_shura_nini_meteor_02",
  "EVENT_shura_pepsi_meteor_01",
  "EVENT_shura_pepsi_meteor_02",
  "EVENT_shura_nini_pepsi_01",
  "EVENT_shura_nini_pepsi_02",
  "EVENT_shura_jupiter_mars_01",
  "EVENT_shura_jupiter_mars_02",
];
for (const id of SHURA_IDS) {
  assert(EVENT_BY_ID[id], `${id} exists`);
}
assert(
  afterIntro.pool.every((item) => !SHURA_IDS.includes(item.id)),
  "no shura events in pool right after intro"
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
assert(afterIntro.charactersView.length === 5, "moon is not a sixth playable character");
const dangerSum = afterIntro.charactersView.reduce((sum, c) => sum + c.danger, 0);
assert(afterIntro.derived.fireIndex === dangerSum, "fireIndex is the sum of five dangers");
assert(afterIntro.derived.dangers.nini === afterIntro.charactersView.find((c) => c.id === "nini").danger, "nini danger matches");
assert(afterIntro.derived.fireLevel === "low", "ordinary intro fire stays visually calm");
for (const c of afterIntro.charactersView) {
  assert(typeof c.danger === "number", `${c.id} has danger`);
  assert(["calm", "solo", "uneasy", "jealous", "crisis"].includes(c.audienceStatus.key), `${c.id} audience status is public`);
  assert(!String(c.audienceStatus.label).includes("_"), `${c.id} status is not a flag key`);
  assert(!JSON.stringify(c.audienceStatus).includes("public_jealous"), "audience status does not leak public_jealous");
  assert(!JSON.stringify(c.audienceStatus).includes("foreshadow_"), "audience status does not leak foreshadow flags");
  assert(!JSON.stringify(c.audienceStatus).includes("secret_"), "audience status does not leak secret flags");
}
const fireBefore = afterIntro.derived.fireIndex;
game.setStat("nini", "jealousy", 90);
assert(game.getState().derived.fireIndex > fireBefore, "fireIndex updates when a character danger rises");
assert(
  game.getState().derived.fireIndex ===
    game.getState().charactersView.reduce((sum, c) => sum + c.danger, 0),
  "updated fireIndex still equals the five-danger sum"
);
game.setStat("nini", "jealousy", afterIntro.characters.nini.jealousy);
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
assert(jealous.getState().currentEvent.id === "EVENT_nini_lockbox_01", "forceEvent jumped to nini lockbox crisis");

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

assert(EVENT_BY_ID.EVENT_shura_nini_meteor_01.weight >= 16 && EVENT_BY_ID.EVENT_shura_nini_meteor_01.weight <= 22, "nini-meteor 01 is CONFLICT weight");
assert(EVENT_BY_ID.EVENT_shura_nini_meteor_02.weight >= 22 && EVENT_BY_ID.EVENT_shura_nini_meteor_02.weight <= 28, "nini-meteor 02 is CRISIS weight");
assert(EVENT_BY_ID.EVENT_shura_pepsi_meteor_01.weight >= 16 && EVENT_BY_ID.EVENT_shura_pepsi_meteor_01.weight <= 22, "pepsi-meteor 01 is CONFLICT weight");
assert(EVENT_BY_ID.EVENT_shura_pepsi_meteor_02.weight >= 22 && EVENT_BY_ID.EVENT_shura_pepsi_meteor_02.weight <= 28, "pepsi-meteor 02 is CRISIS weight");
assert(EVENT_BY_ID.EVENT_shura_nini_pepsi_01.weight >= 16 && EVENT_BY_ID.EVENT_shura_nini_pepsi_01.weight <= 22, "nini-pepsi 01 is CONFLICT weight");
assert(EVENT_BY_ID.EVENT_shura_nini_pepsi_02.weight >= 22 && EVENT_BY_ID.EVENT_shura_nini_pepsi_02.weight <= 28, "nini-pepsi 02 is CRISIS weight");
assert(EVENT_BY_ID.EVENT_shura_jupiter_mars_01.weight >= 16 && EVENT_BY_ID.EVENT_shura_jupiter_mars_01.weight <= 22, "jupiter-mars 01 is CONFLICT weight");
assert(EVENT_BY_ID.EVENT_shura_jupiter_mars_02.weight >= 22 && EVENT_BY_ID.EVENT_shura_jupiter_mars_02.weight <= 28, "jupiter-mars 02 is CRISIS weight");
assert(EVENT_BY_ID.EVENT_office_simmer.weight < EVENT_BY_ID.EVENT_shura_nini_meteor_01.weight, "simmer cannot cover shura");
assert(EVENT_BY_ID.EVENT_office_simmer.weight < EVENT_BY_ID.EVENT_shura_jupiter_mars_02.weight, "simmer cannot cover shura crisis");

const nostalgiaOnly = createGame({ persist: false, rng: () => 0 });
playIntro(nostalgiaOnly);
playForced(nostalgiaOnly, "EVENT_meteor_nostalgia_01", "believe");
assert(
  !nostalgiaOnly.getState().pool.some((item) => item.id === "EVENT_shura_nini_meteor_01"),
  "nostalgia alone does not open nini-meteor shura"
);
assert(
  !nostalgiaOnly.getState().pool.some((item) => item.id === "EVENT_shura_pepsi_meteor_01"),
  "nostalgia alone does not open pepsi-meteor shura"
);

const obsessionOnly = createGame({ persist: false, rng: () => 0 });
playIntro(obsessionOnly);
playForced(obsessionOnly, "EVENT_nini_obsession_01", "stay");
assert(obsessionOnly.getState().flags.nini_allowed_stay, "obsession stay writes nini_allowed_stay");
assert(
  !obsessionOnly.getState().pool.some((item) => item.id === "EVENT_shura_nini_meteor_01"),
  "nini stay without nostalgia does not open nini-meteor shura"
);

const niniMeteorPrereq = createGame({ persist: false, rng: () => 0 });
playIntro(niniMeteorPrereq);
playForced(niniMeteorPrereq, "EVENT_nini_obsession_01", "stay");
playForced(niniMeteorPrereq, "EVENT_meteor_nostalgia_01", "believe");
assert(
  niniMeteorPrereq.getState().pool.some((item) => item.id === "EVENT_shura_nini_meteor_01"),
  "obsession plus nostalgia opens nini-meteor shura"
);

const letterMisread = createGame({ persist: false, rng: () => 0 });
playIntro(letterMisread);
letterMisread.intervene("letter", "nini", { force: true });
letterMisread.choose("misread");
assert(letterMisread.getState().flags.letter_misread_by_meteor, "letter_misread_by_meteor is read by nini-meteor shura");
assert(letterMisread.getState().currentEvent.id === "EVENT_shura_nini_meteor_01", "letter misread forces nini-meteor shura");
assert(letterMisread.getState().flags.nini_meteor_both_lines_hardened, "unattended shura hardens both lines on enter");
letterMisread.choose("pull_moon");
assert(
  letterMisread.getState().currentSession.unresolvedEventIds.includes("EVENT_shura_nini_meteor_01"),
  "pulling moon leaves nini-meteor 01 unresolved"
);
assert(letterMisread.getState().currentEvent.id === "EVENT_shura_nini_meteor_02", "unresolved nini-meteor 01 forceEvents 02");
assert(letterMisread.getState().flags.moon_refuses_nini_meteor_claim, "third choice writes refuse-definition flag");

const helpNini = createGame({ persist: false, rng: () => 0 });
playIntro(helpNini);
helpNini.intervene("letter", "nini", { force: true });
helpNini.choose("misread");
helpNini.choose("help_nini");
assert(helpNini.getState().currentEvent.id === "EVENT_nini_lockbox_01", "helping nini forceEvents lockbox");
assert(
  !helpNini.getState().currentSession.unresolvedEventIds.includes("EVENT_shura_nini_meteor_01"),
  "helping nini resolves 01"
);
assert(helpNini.getState().currentSession.weightMods.EVENT_nini_lockbox_01 > 0, "helping nini raises lockbox weight");

const skipShura = createGame({ persist: false, rng: () => 0 });
playIntro(skipShura);
skipShura.startEvent("EVENT_shura_nini_meteor_01", { force: true });
skipShura.skipEvent();
assert(
  skipShura.getState().currentSession.unresolvedEventIds.includes("EVENT_shura_nini_meteor_01"),
  "skip uses 不干預 and leaves 01 unresolved"
);
assert(skipShura.getState().currentEvent.id === "EVENT_shura_nini_meteor_02", "skip 不干預 continues into 02");

const chemistryOnly = createGame({ persist: false, rng: () => 0 });
playIntro(chemistryOnly);
playForced(chemistryOnly, "EVENT_mars_chemistry_01", "engage");
assert(
  !chemistryOnly.getState().pool.some((item) => item.id === "EVENT_shura_jupiter_mars_01"),
  "mars chemistry alone does not open jupiter-mars shura"
);

const doorIntrusion = createGame({ persist: false, rng: () => 0 });
playIntro(doorIntrusion);
doorIntrusion.intervene("encounter", "jupiter", { force: true });
doorIntrusion.choose("stay");
assert(doorIntrusion.getState().currentEvent.id === "EVENT_jupiter_quiet_date", "encounter lands on quiet date");
assert(doorIntrusion.getState().flags.solo_active_jupiter, "quiet date writes solo_active_jupiter");
assert(
  !doorIntrusion.getState().pool.some((item) => item.id === "EVENT_shura_jupiter_mars_01"),
  "jupiter solo itself does not open doorway shura"
);
doorIntrusion.intervene("sabotage", "jupiter", { force: true });
doorIntrusion.choose("break");
assert(doorIntrusion.getState().flags.date_broken_jupiter, "300 break writes date_broken_jupiter");
assert(
  doorIntrusion.getState().pool.some((item) => item.id === "EVENT_shura_jupiter_mars_01"),
  "broken jupiter date opens doorway shura"
);

const jupiterDoor = createGame({ persist: false, rng: () => 0 });
playIntro(jupiterDoor);
jupiterDoor.startEvent("EVENT_shura_jupiter_mars_01", { force: true });
jupiterDoor.choose("help_jupiter");
assert(jupiterDoor.getState().currentEvent.id === "EVENT_jupiter_packing_01", "helping jupiter forceEvents packing");
assert(jupiterDoor.getState().flags.jupiter_packing_started, "packing onEnter marks packing started");
jupiterDoor.choose("watch");
assert(
  jupiterDoor.getState().pool.some((item) => item.id === "EVENT_shura_jupiter_mars_02"),
  "packing started keeps blessing-vs-harm shura available"
);

const pepsiLetter = createGame({ persist: false, rng: () => 0 });
playIntro(pepsiLetter);
pepsiLetter.intervene("letter", "pepsi", { force: true });
pepsiLetter.choose("misread");
assert(pepsiLetter.getState().flags.letter_misread_by_meteor, "pepsi letter misread is read by pepsi-meteor shura");
assert(pepsiLetter.getState().currentEvent.id === "EVENT_shura_pepsi_meteor_01", "pepsi letter misread forces pepsi-meteor shura");
pepsiLetter.choose("interrupt");
assert(
  pepsiLetter.getState().currentSession.unresolvedEventIds.includes("EVENT_shura_pepsi_meteor_01"),
  "interrupting the comparison leaves pepsi-meteor 01 unresolved"
);

const admitPepsi = createGame({ persist: false, rng: () => 0 });
playIntro(admitPepsi);
admitPepsi.startEvent("EVENT_shura_pepsi_meteor_02", { force: true });
admitPepsi.choose("admit_pepsi");
assert(admitPepsi.getState().flags.destiny_denied_meteor, "denying meteor is not just affection");
assert(admitPepsi.getState().currentEvent.id === "EVENT_meteor_never_broke_up_01", "denied meteor enters never-broke-up crisis");

const niniPepsiDoNothing = createGame({ persist: false, rng: () => 0 });
playIntro(niniPepsiDoNothing);
niniPepsiDoNothing.startEvent("EVENT_shura_nini_pepsi_01", { force: true });
assert(niniPepsiDoNothing.getState().flags.pepsi_did_not_counter, "unattended nini-pepsi makes pepsi not counter");
niniPepsiDoNothing.choose("do_nothing");
assert(
  niniPepsiDoNothing.getState().currentSession.unresolvedEventIds.includes("EVENT_shura_nini_pepsi_01"),
  "doing nothing leaves nini-pepsi unresolved"
);
assert(niniPepsiDoNothing.getState().currentEvent.id === "EVENT_shura_nini_pepsi_02", "unresolved nini-pepsi 01 forceEvents 02");
niniPepsiDoNothing.choose("pepsi_back");
assert(niniPepsiDoNothing.getState().flags.pepsi_backed_off, "pepsi backing off cracks her line");
assert(niniPepsiDoNothing.getState().currentEvent.id === "EVENT_pepsi_identity_01", "pepsi line crack forceEvents identity");

const stopJupiterLeave = createGame({ persist: false, rng: () => 0 });
playIntro(stopJupiterLeave);
stopJupiterLeave.startEvent("EVENT_shura_jupiter_mars_02", { force: true });
stopJupiterLeave.choose("stop_leave");
assert(stopJupiterLeave.getState().flags.crisis_blocked_jupiter, "stopping jupiter leave blocks her leaving crisis");
assert(stopJupiterLeave.getState().flags.jupiter_stayed, "jupiter staying is a plot flag");

const publicJealousShura = createGame({ persist: false, rng: () => 0 });
playIntro(publicJealousShura);
publicJealousShura.intervene("jealousy", "nini", { force: true });
publicJealousShura.choose("burn");
assert(publicJealousShura.getState().flags.public_jealous_nini, "public_jealous_nini is written");
assert(
  publicJealousShura.getState().pool.some((item) => item.id === "EVENT_shura_nini_meteor_02"),
  "public_jealous_nini is read by nini-meteor 02"
);

const CHAR_IDS = ["nini", "meteor", "pepsi", "jupiter", "mars"];
const CRISIS_IDS = [
  "EVENT_nini_lockbox_01",
  "EVENT_nini_dependence_01",
  "EVENT_meteor_never_broke_up_01",
  "EVENT_pepsi_identity_01",
  "EVENT_jupiter_packing_01",
  "EVENT_jupiter_hope_low_01",
  "EVENT_mars_too_close_01",
];
const DAILY_KINDS = ["sweet", "nature", "overstep", "foreshadow"];
const SOLO_BY_CHAR = {
  nini: "EVENT_nini_solo_01",
  meteor: "EVENT_meteor_solo_01",
  pepsi: "EVENT_pepsi_solo_01",
  jupiter: "EVENT_jupiter_quiet_date",
  mars: "EVENT_mars_solo_01",
};

const poolAfterIntro = createGame({ persist: false, rng: () => 0 });
playIntro(poolAfterIntro);
const introPoolIds = poolAfterIntro.getState().pool.map((item) => item.id);
assert(
  introPoolIds.every((id) => !SHURA_IDS.includes(id)),
  "ordinary play after intro has no shura in the pool"
);
assert(
  introPoolIds.every((id) => !CRISIS_IDS.includes(id)),
  "ordinary play after intro has no character crisis in the pool"
);
for (const id of CHAR_IDS) {
  for (const kind of DAILY_KINDS) {
    const eventId = `EVENT_${id}_${kind}_01`;
    assert(EVENT_BY_ID[eventId], `${eventId} exists`);
    assert(introPoolIds.includes(eventId), `${eventId} is in the ordinary pool`);
  }
  assert(introPoolIds.includes(SOLO_BY_CHAR[id]), `${id} solo is in the ordinary pool`);
}

const foreshadowOnly = createGame({ persist: false, rng: () => 0 });
playIntro(foreshadowOnly);
playForced(foreshadowOnly, "EVENT_nini_foreshadow_01", "wonder");
assert(foreshadowOnly.getState().flags.foreshadow_nini_missing, "foreshadow writes foreshadow_nini_missing");
assert(
  !foreshadowOnly.getState().pool.some((item) => CRISIS_IDS.includes(item.id)),
  "one foreshadow flag does not unlock a crisis"
);
assert(
  !foreshadowOnly.getState().pool.some((item) => SHURA_IDS.includes(item.id)),
  "one foreshadow flag does not unlock shura"
);

const peekMemory = createGame({ persist: false, rng: () => 0 });
playIntro(peekMemory);
peekMemory.intervene("peek", "nini", { force: true });
peekMemory.choose("memory");
assert(peekMemory.getState().flags.memory_unlocked_nini, "100 memory writes memory_unlocked");
assert(peekMemory.getState().currentEvent.id === "EVENT_memory_nini", "100 memory forceEvents nini memory");
assert(!SHURA_IDS.includes(peekMemory.getState().currentEvent.id), "100 memory is not shura");

const keepSecret = createGame({ persist: false, rng: () => 0 });
playIntro(keepSecret);
keepSecret.intervene("peek", "nini", { force: true });
keepSecret.choose("secret");
keepSecret.choose("keep");
assert(keepSecret.getState().flags.secret_nini, "100 keep writes secret_nini");
assert(
  !keepSecret.getState().pool.some((item) => item.id === "EVENT_nini_lockbox_01"),
  "100 keep only raises weight, it does not put lockbox into the pool"
);

const sparkVsBurn = createGame({ persist: false, rng: () => 0 });
playIntro(sparkVsBurn);
sparkVsBurn.intervene("intervene", "pepsi", { force: true });
sparkVsBurn.choose("jealousy");
sparkVsBurn.choose("spark");
assert(sparkVsBurn.getState().currentEvent.id === "EVENT_pepsi_jealousy_01", "300 spark is pepsi jealousy, not identity");
assert(
  !sparkVsBurn.getState().pool.some((item) => item.id === "EVENT_pepsi_identity_01"),
  "300 spark does not unlock pepsi identity crisis"
);

const rewriteReset = createGame({ persist: false, rng: () => 0 });
playIntro(rewriteReset);
rewriteReset.setStat("nini", "obsession", 90);
rewriteReset.setStat("meteor", "destiny", 90);
rewriteReset.intervene("rewrite", "nini", { force: true });
rewriteReset.choose("push");
assert(rewriteReset.getState().currentEvent.id === "EVENT_rewrite_nini", "1000 lands on rewrite scene");
assert(rewriteReset.getState().characters.nini.obsession === 38, "1000 resets nini obsession to initial");
assert(rewriteReset.getState().characters.nini.obsession !== 90, "1000 core reset is actually felt");

const meteorReset = createGame({ persist: false, rng: () => 0 });
playIntro(meteorReset);
meteorReset.setStat("meteor", "destiny", 99);
meteorReset.intervene("rewrite", "meteor", { force: true });
meteorReset.choose("push");
assert(meteorReset.getState().characters.meteor.destiny === 74, "1000 resets meteor destiny to initial");

const rewriteShura = createGame({ persist: false, rng: () => 0 });
playIntro(rewriteShura);
rewriteShura.intervene("rewrite", "pepsi", { force: true });
rewriteShura.choose("push");
assert(rewriteShura.getState().flags.fate_rewritten_pepsi, "rewrite writes fate_rewritten_pepsi");
assert(
  rewriteShura.getState().pool.some((item) => item.id === "EVENT_shura_pepsi_meteor_02"),
  "rewrite on pepsi is read by pepsi-meteor 02"
);

assert(eventPresentation(EVENT_BY_ID.EVENT_nini_sweet_01).label.includes("甜蜜"), "sweet cards are labeled 甜蜜");
assert(eventPresentation(EVENT_BY_ID.EVENT_nini_nature_01).label.includes("性格"), "nature cards are labeled 性格");
assert(eventPresentation(EVENT_BY_ID.EVENT_nini_overstep_01).label.includes("越界"), "overstep cards are labeled 越界");
assert(eventPresentation(EVENT_BY_ID.EVENT_nini_foreshadow_01).label === "", "foreshadow is not shown as 伏筆");
assert(!eventPresentation(EVENT_BY_ID.EVENT_nini_foreshadow_01).label.includes("伏筆"), "no 伏筆 leak");
assert(eventPresentation(EVENT_BY_ID.EVENT_nini_solo_01).label.includes("獨處"), "solo cards are labeled 獨處");
assert(eventPresentation(EVENT_BY_ID.EVENT_nini_lockbox_01).kind === "crisis", "lockbox is crisis tone");
assert(eventPresentation(EVENT_BY_ID.EVENT_shura_nini_meteor_01).kind === "shura", "shura tone is distinct");
assert(eventPresentation(EVENT_BY_ID.EVENT_memory_nini).label.includes("回憶"), "memory cards are labeled 回憶");
assert(eventPresentation(EVENT_BY_ID.EVENT_letter_nini).label.includes("情書"), "letter cards are labeled 情書");

const soloUi = createGame({ persist: false, rng: () => 0 });
playIntro(soloUi);
soloUi.intervene("encounter", "mars", { force: true });
soloUi.choose("stay");
assert(soloUi.getState().soloActive === "mars", "200 still writes the live solo");
assert(soloUi.getState().charactersView.find((c) => c.id === "mars").audienceStatus.key === "solo", "mars card becomes 獨處中");
assert(soloUi.getState().charactersView.find((c) => c.id === "mars").audienceStatus.label.includes("獨處"), "solo status is readable");
assert(
  !JSON.stringify(soloUi.getState().charactersView.find((c) => c.id === "mars").audienceStatus).includes("solo_active_mars"),
  "solo UI does not expose the flag key"
);

console.log("mvp smoke ok", {
  event: game.getState().currentEvent.id,
  fate: game.getState().fate,
  fire: game.getState().derived.fireIndex,
  settlement: persistB.getState().settlement.label,
  archive: persistB.getState().archive["qixi-2026"].nightPartner,
});
