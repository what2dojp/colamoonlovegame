import { createGame } from "../src/engine/game.js";
import { GAME_CONFIG } from "../src/config/game.config.js";
import { nightScore, pickNightPartner } from "../src/engine/session.js";
import { inspectSave, migrateSave, pairKey } from "../src/engine/save.js";
import { EVENT_BY_ID, EVENTS } from "../data/seasons/qixi-2026/events.js";
import { CHARACTERS, CHARACTER_BY_ID, resolveCharacterStatKey } from "../data/characters.js";
import { audienceText, eventPresentation, fireMoodLabel } from "../src/ui/presentation.js";

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
assert(game.getState().derived.fireIndex === 0, "fire index starts at 0");
assert(
  game.getState().charactersView.every((c) => c.danger === 0 && Object.values(c.values).every((n) => n === 0)),
  "all five start at 0"
);
assert(audienceText("月月看著百事月月") === "可樂月月看著百事月月", "standalone 月月 becomes 可樂月月");
assert(audienceText("可樂月月今晚決定") === "可樂月月今晚決定", "可樂月月 is not doubled");

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
  "EVENT_shura_nini_jupiter_01",
  "EVENT_shura_nini_mars_01",
  "EVENT_shura_meteor_jupiter_01",
  "EVENT_shura_meteor_mars_01",
  "EVENT_shura_pepsi_jupiter_01",
  "EVENT_shura_pepsi_mars_01",
];
for (const id of SHURA_IDS) {
  assert(EVENT_BY_ID[id], `${id} exists`);
}
assert(
  afterIntro.pool.every((item) => !SHURA_IDS.includes(item.id)),
  "no shura events in pool right after intro"
);

assert(afterIntro.characters.nini.dependence != null, "nini keeps plot auxiliary dependence");
assert(afterIntro.characters.nini.trust != null, "nini keeps plot auxiliary trust");
assert(afterIntro.characters.meteor.destiny != null, "meteor destiny key");
assert(afterIntro.characters.meteor.destinyBelief == null, "old destinyBelief removed");
assert(afterIntro.characters.pepsi.resonance != null, "pepsi resonance key");
assert(afterIntro.characters.pepsi.similarity != null, "pepsi similarity key");
assert(afterIntro.characters.pepsi.jealousy == null, "pepsi has no jealousy");
assert(afterIntro.characters.pepsi.understanding == null, "pepsi understanding is not a real stat");
assert(afterIntro.characters.jupiter.patience != null, "jupiter patience key");
assert(afterIntro.characters.jupiter.restraint == null, "old restraint removed");
assert(afterIntro.characters.mars.chemistry != null, "mars chemistry");
assert(afterIntro.characters.mars.jealousy == null, "mars has no personal jealousy");
assert(afterIntro.characters.mars.tension == null, "mars has no personal tension");
assert(afterIntro.relationships["mars-moon"] || afterIntro.relationships["moon-mars"], "moon-mars tension exists");
assert(JSON.stringify(CHARACTER_BY_ID.nini.coreStats) === JSON.stringify(["affection", "obsession", "jealousy"]), "nini core stats");
assert(JSON.stringify(CHARACTER_BY_ID.meteor.coreStats) === JSON.stringify(["affection", "destiny", "nostalgia", "jealousy"]), "meteor core stats");
assert(JSON.stringify(CHARACTER_BY_ID.pepsi.coreStats) === JSON.stringify(["affection", "resonance", "similarity", "destiny"]), "pepsi core stats");
assert(JSON.stringify(CHARACTER_BY_ID.jupiter.coreStats) === JSON.stringify(["affection", "devotion", "patience", "jealousy"]), "jupiter core stats");
assert(JSON.stringify(CHARACTER_BY_ID.jupiter.auxiliaryStats) === JSON.stringify(["hope"]), "jupiter hope is auxiliary");
assert(JSON.stringify(CHARACTER_BY_ID.mars.coreStats) === JSON.stringify(["affection", "chemistry", "provocation"]), "mars core stats");
assert(!CHARACTER_BY_ID.pepsi.stats.includes("jealousy"), "pepsi schema excludes jealousy");
assert(!CHARACTER_BY_ID.nini.coreStats.includes("trust"), "nini trust is not core");
assert(!CHARACTER_BY_ID.nini.coreStats.includes("dependence"), "nini dependence is not core");
assert(!CHARACTER_BY_ID.meteor.coreStats.includes("pride"), "meteor pride is not core");
assert(!CHARACTER_BY_ID.mars.coreStats.includes("pride"), "mars pride is not core");
assert(!CHARACTER_BY_ID.mars.stats.includes("tension"), "mars schema excludes personal tension");
assert(JSON.stringify(afterIntro.charactersView.find((c) => c.id === "nini").audienceStats) === JSON.stringify(["affection", "obsession"]), "nini audience stats");
assert(JSON.stringify(afterIntro.charactersView.find((c) => c.id === "pepsi").audienceStats) === JSON.stringify(["affection", "resonance"]), "pepsi audience stats");
assert(Number.isInteger(afterIntro.nightScores.nini), "night score is an integer");
assert(afterIntro.nightScores.nini >= 0 && afterIntro.nightScores.nini <= 100, "night score stays 0-100");
assert(afterIntro.charactersView.find((c) => c.id === "nini").uniquePrimary === "obsession", "nini uniquePrimary");
assert(afterIntro.charactersView.find((c) => c.id === "meteor").uniquePrimary === "destiny", "meteor uniquePrimary");
assert(afterIntro.charactersView.find((c) => c.id === "pepsi").uniquePrimary === "resonance", "pepsi uniquePrimary");
assert(afterIntro.charactersView.find((c) => c.id === "jupiter").uniquePrimary === "devotion", "jupiter uniquePrimary");
assert(afterIntro.charactersView.find((c) => c.id === "mars").uniquePrimary === "chemistry", "mars uniquePrimary");
assert(afterIntro.charactersView.find((c) => c.id === "jupiter").name === "芬達木星", "jupiter display name is 芬達木星");
assert(afterIntro.charactersView.find((c) => c.id === "mars").name === "西打火星", "mars display name is 西打火星");
assert(afterIntro.currentEvent.choices.length === 1, "hub no longer asks continue vs stop");
assert(afterIntro.currentEvent.choices[0].label === "抽出下一張", "hub only draws the next card");
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
assert(!("trust" in GAME_CONFIG.nightScoreWeights.nini), "nini night score ignores trust");
assert(!("dependence" in GAME_CONFIG.nightScoreWeights.nini), "nini night score ignores dependence");
assert(!("pride" in GAME_CONFIG.nightScoreWeights.meteor), "meteor night score ignores pride");
assert(!("understanding" in GAME_CONFIG.nightScoreWeights.pepsi), "pepsi night score has no understanding");
assert(!("jealousy" in GAME_CONFIG.nightScoreWeights.pepsi), "pepsi night score has no jealousy");
assert(!("hope" in GAME_CONFIG.nightScoreWeights.jupiter), "jupiter night score ignores hope");
assert(!("pride" in GAME_CONFIG.nightScoreWeights.mars), "mars night score ignores pride");
assert("relationshipTension" in GAME_CONFIG.nightScoreWeights.mars, "mars night score uses relationship tension");

const dumpedEvents = JSON.stringify(EVENTS);
assert(
  !/characters\.[A-Za-z]+\.(destinyBelief|soulResonance|understanding|restraint)\b/.test(dumpedEvents),
  "event effects no longer write legacy stat keys"
);
assert(!/characters\.[A-Za-z]+\.tension\b/.test(dumpedEvents), "events do not use personal tension stats");
assert(!CHARACTERS.some((c) => c.stats.includes("destinyBelief") || c.stats.includes("understanding") || c.stats.includes("restraint") || c.stats.includes("soulResonance")), "character schema has no leftover keys");

const trustScore = createGame({ persist: false, rng: () => 0 });
playIntro(trustScore);
trustScore.setStat("nini", "affection", 40);
trustScore.setStat("nini", "obsession", 40);
trustScore.setStat("nini", "jealousy", 20);
const niniBeforeAux = nightScore(trustScore.getState(), "nini");
trustScore.setStat("nini", "trust", 100);
trustScore.setStat("nini", "dependence", 100);
assert(nightScore(trustScore.getState(), "nini") === niniBeforeAux, "nini auxiliary stats do not change Night Score");

const beforeFate = afterIntro.fate;
const iv = game.intervene("encounter", "jupiter");
assert(iv.ok, "encounter should run");
assert(game.getState().fate === beforeFate, "encounter does not deduct fate");
assert(game.getState().currentEvent.id === "IV_encounter", "encounter event started");
assert(game.getState().currentEvent.description.includes("芬達木星"), "event interpolates target");
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
assert(niniEnc.getState().lastResult.kind === "sabotage", "300 interrupt uses the paid overlay");
assert(niniEnc.getState().lastResult.originalSoloCharacter === "nini", "300 keeps B as the interrupted solo");
assert(niniEnc.getState().lastResult.interruptingId === "mars", "300 keeps A as 西打火星");
assert(niniEnc.getState().lastResult.interruptLine, "300 shows the reason A pulled 可樂月月 away");
assert(niniEnc.getState().flags.date_broken_nini, "date_broken_nini written");
assert(niniEnc.getState().currentEvent.characters.includes("mars"), "300 next card is a 西打火星 event");
assert(!String(niniEnc.getState().currentEvent.id).includes("shura"), "300 does not jump to shura");
assert(niniEnc.getState().currentEvent.id !== "EVENT_nini_lockbox_01", "300 no longer forceEvents nini lockbox");

const letterGame = createGame({ persist: false, rng: () => 0 });
playIntro(letterGame);
letterGame.intervene("letter", "nini", { force: true });
letterGame.choose("private");
assert(letterGame.getState().flags.letter_to_nini, "letter_to_nini written");
assert(letterGame.getState().currentEvent.id === "EVENT_letter_nini", "letter forces follow-up event");

const forceGame = createGame({ persist: false, rng: () => 0 });
playIntro(forceGame);
const hubForce = forceGame.intervene("force", "nini", { force: true });
assert(hubForce.ok === false, "500 from hub without a lead character is refused");
forceGame.intervene("encounter", "jupiter", { force: true });
forceGame.choose("stay");
forceGame.intervene("force", "mars", { force: true });
assert(forceGame.getState().currentEvent.id === "EVENT_shura_jupiter_mars_01", "500 mars joins jupiter solo → 木星×火星修羅場");
assert(forceGame.getState().lastResult.kind === "force", "500 shows 局勢變化 result");
assert(forceGame.getState().lastResult.overlayTitle === "局勢突然改變", "500 overlay is 局勢突然改變");
assert(forceGame.getState().lastResult.originalSoloCharacter === "jupiter", "500 stores A as 芬達木星");
assert(forceGame.getState().lastResult.joiningCharacter === "mars", "500 stores B as 西打火星");
assert(forceGame.getState().lastResult.name === "西打火星", "500 names the joining character");
assert(!JSON.stringify(forceGame.getState().lastResult.intervalCopy || "").includes("EVENT_"), "500 interval copy has no event id");
assert(/歡迎來到戀愛修羅場/.test(forceGame.getState().lastResult.intervalCopy || ""), "500 interval welcomes the shura");

const sweetForce = createGame({ persist: false, rng: () => 0 });
playIntro(sweetForce);
sweetForce.startEvent("EVENT_jupiter_sweet_01", { force: true });
assert(sweetForce.getState().eventLeadId === "jupiter", "sweet card lead is 芬達木星");
assert(sweetForce.intervene("force", "mars", { force: true }).ok, "500 works on a sweet card without solo");
assert(sweetForce.getState().currentEvent.id === "EVENT_shura_jupiter_mars_01", "jupiter sweet + mars join → 木星×火星修羅場");
assert(sweetForce.getState().lastResult.originalCharacter === "jupiter", "500 A is the current card character");
assert(sweetForce.getState().lastResult.joiningCharacter === "mars", "500 B is the selected joiner");

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
assert(jealous.getState().characters.nini.jealousy >= 20, "jealousy +20 on enter");
assert(
  jealous.getState().currentSession.weightMods.EVENT_nini_jealousy_01 >= 40,
  "jealousy intervention boosts pool weight"
);
jealous.choose("burn");
assert(jealous.getState().currentEvent.id === "EVENT_nini_lockbox_01", "forceEvent jumped to nini lockbox crisis");

const pepsiIv = createGame({ persist: false, rng: () => 0 });
playIntro(pepsiIv);
const pepsiResonance = pepsiIv.getState().characters.pepsi.resonance;
pepsiIv.intervene("jealousy", "pepsi", { force: true });
assert(pepsiIv.getState().characters.pepsi.jealousy == null, "pepsi jealousy still unofficial after IV");
assert(pepsiIv.getState().characters.pepsi.understanding == null, "pepsi jealousy is not redirected into understanding");
assert(
  pepsiIv.getState().characters.pepsi.resonance > pepsiResonance,
  "pepsi jealousy IV still raises her unique core"
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
    mars: { affection: 20, chemistry: 40, provocation: 70, pride: 80, jealousy: 99, tension: 88 },
  },
  flags: { qixi_2026_night_partner: "jupiter" },
  archive: { "qixi-2026": { nightPartner: "jupiter", progressCard: { title: "七夕事件進度卡", status: "暫時休戰" } } },
  currentSession: { status: "active", phase: "dynamic" },
});
assert(migrated.characters.meteor.destiny === 77, "destinyBelief migrated");
assert(migrated.characters.meteor.destinyBelief == null, "old meteor key dropped");
assert(migrated.characters.pepsi.resonance === 70, "soulResonance migrated");
assert(migrated.characters.pepsi.destiny === 61, "pepsi destinyBelief migrated");
assert(migrated.characters.pepsi.similarity === 90, "understanding migrated to similarity");
assert(migrated.characters.pepsi.understanding == null, "old pepsi understanding dropped");
assert(migrated.characters.pepsi.jealousy == null, "pepsi jealousy not official");
assert(migrated.characters.jupiter.patience === 55, "restraint migrated to patience");
assert(migrated.characters.nini.dependence != null, "nini dependence filled");
assert(migrated.characters.mars.jealousy == null, "mars jealousy not official");
assert(migrated.characters.mars.tension == null, "mars personal tension dropped");
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

store.unrelated = "keep-me";
assert(inspectSave().exists === true, "inspectSave sees the game key");
assert(inspectSave().status === "playing", "reset session is still playing");
const persistMid = createGame({ persist: true, rng: () => 0 });
playIntro(persistMid);
const midEvent = persistMid.getState().currentEvent.id;
const persistReload = createGame({ persist: true });
assert(persistReload.getState().currentEvent.id === midEvent, "refresh keeps the in-progress event");
assert(persistReload.getState().lifecycle === "playing", "refresh keeps a playing session");
assert(store.unrelated === "keep-me", "game persistence uses a dedicated key");
persistReload.newGame();
assert(persistReload.getState().currentEvent.id === "EVENT_001_prologue", "newGame returns to opening");
assert(!persistReload.getState().flags.qixi_2026_night_partner, "newGame clears tonight companion");
assert(!persistReload.getState().flags.nini_arrived, "newGame clears session flags");
assert(persistReload.getState().occurredEventIds.every((id) => String(id).startsWith("EVENT_001") || id === persistReload.getState().currentEvent.id), "newGame clears previous occurred cards");
assert(store.unrelated === "keep-me", "newGame does not call localStorage.clear");
assert(inspectSave().status === "playing", "fresh game is playing");

const persistFinish = createGame({ persist: true, rng: () => 0 });
playIntro(persistFinish);
persistFinish.holdTonight();
persistFinish.confirmTonightHold();
assert(persistFinish.getState().currentEvent.id === "FINAL_night_partner", "hold confirm reaches companion result");
persistFinish.choose("close_night");
assert(inspectSave().status === "finished", "settled session is finished");
persistFinish.newGame();
assert(persistFinish.getState().currentEvent.id === "EVENT_001_prologue", "replay after finish starts a new night");
assert(inspectSave().status === "playing", "replay after finish is playing");
assert(!audienceText("qixi_2026_night_partner = pepsi").includes("pepsi"), "audience text strips internal ids");
assert(!audienceText("qixi_2026_night_partner = pepsi").includes("qixi_2026"), "audience text strips persistence keys");

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
doorIntrusion.intervene("sabotage", "mars", { force: true });
assert(doorIntrusion.getState().flags.date_broken_jupiter, "300 interrupt writes date_broken_jupiter");
assert(doorIntrusion.getState().lastResult.originalSoloCharacter === "jupiter", "300 interrupted 芬達木星");
assert(doorIntrusion.getState().lastResult.interruptingId === "mars", "300 actor is 西打火星");
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
playForced(foreshadowOnly, "EVENT_nini_foreshadow_01", "a");
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
assert(!/EVENT_|FLAG_|IV_/.test(JSON.stringify(peekMemory.getState().lastResult?.logs || [])), "100 result logs hide internal ids");

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
sparkVsBurn.intervene("jealousy", "pepsi", { force: true });
sparkVsBurn.choose("spark");
assert(sparkVsBurn.getState().currentEvent.id === "EVENT_pepsi_jealousy_01", "300 spark is pepsi jealousy, not identity");
assert(!/EVENT_|FLAG_|IV_/.test(JSON.stringify(sparkVsBurn.getState().lastResult?.logs || [])), "300 result logs hide internal ids");
assert(
  !sparkVsBurn.getState().pool.some((item) => item.id === "EVENT_pepsi_identity_01"),
  "300 spark does not unlock pepsi identity crisis"
);

assert(afterIntro.charactersView.find((c) => c.id === "jupiter").name === "芬達木星", "jupiter display name is 芬達木星");
assert(afterIntro.charactersView.find((c) => c.id === "mars").name === "西打火星", "mars display name is 西打火星");
assert(afterIntro.currentEvent.choices.length === 1, "hub no longer asks continue vs stop");
assert(afterIntro.currentEvent.choices[0].label === "抽出下一張", "hub only draws the next card");

const once = createGame({ persist: false, rng: () => 0 });
playIntro(once);
once.startEvent("EVENT_office_simmer", { force: true });
once.choose("breathe");
assert(once.getState().occurredEventIds.includes("EVENT_office_simmer"), "appeared event is marked occurred");
assert(
  !once.getState().pool.some((item) => item.id === "EVENT_office_simmer"),
  "occurred event is permanently excluded from the pool"
);
assert(once.getState().flags.nini_arrived === true, "one-time events do not clear existing flags");
once.startEvent("EVENT_office_simmer", { force: false });
assert(once.getState().currentEvent.id === "EVENT_008_office_hub", "non-forced replay of an occurred card returns to hub");

const hold = createGame({ persist: false, rng: () => 0 });
playIntro(hold);
const openingNini = hold.getState().currentSession.openingSnapshot.dangers.nini;
hold.choose("watch");
const drawnId = hold.getState().currentEvent.id;
hold.choose(hold.getState().currentEvent.choices[0].id);
const held = hold.holdTonight();
assert(held.ok, "hold tonight succeeds");
assert(hold.getState().lifecycle === "playing", "hold does not lock the session as finished");
assert(hold.getState().settlement.status !== "paused", "hold no longer traps the night in paused");
assert(hold.getState().currentSession.phase === "settling", "hold starts tonight settlement");
assert(hold.choose("watch").ok === false, "ordinary draws stop after hold");
assert(hold.getState().lastResult.kind === "nightHold", "hold shows settlement popup data");
assert(hold.getState().lastResult.settlement.eventCount >= 7, "settlement counts tonight's cards");
assert(hold.getState().lastResult.settlement.characters.find((c) => c.id === "nini").from === openingNini, "settlement uses opening danger");
assert(hold.getState().flags.nini_arrived === true, "hold keeps existing flags");
assert(hold.getState().occurredEventIds.includes(drawnId), "hold keeps occurred events");
assert(!/EVENT_|FLAG_|IV_|qixi_/.test(JSON.stringify(hold.getState().lastResult.logs)), "settlement logs hide internal ids");
assert(hold.confirmTonightHold().ok, "confirming hold enters the night result");
assert(hold.getState().currentEvent.id === "FINAL_night_partner", "hold confirm shows tonight's companion");
assert(!/pepsi|nini|meteor|jupiter|mars|qixi_2026_/.test(hold.getState().currentEvent.description), "final copy has no internal ids");
hold.choose("close_night");
assert(hold.getState().lifecycle === "finished", "closing the night marks the session finished");
assert(!/qixi_2026_night_partner|pepsi/.test(JSON.stringify(hold.getState().lastResult.logs || [])), "finished logs hide persistence keys");
const finishedPartner = hold.getState().currentSession.nightPartner;
hold.newGame();
assert(hold.getState().currentEvent.id === "EVENT_001_prologue", "replay returns to the opening");
assert(hold.getState().lifecycle === "playing", "replay starts a playing session");
assert(!hold.getState().occurredEventIds.includes(drawnId), "replay clears occurred events");
assert(hold.getState().flags.nini_arrived !== true, "replay clears session flags");
assert(!hold.getState().flags.qixi_2026_night_partner, "replay clears tonight companion");
assert(hold.getState().currentSession.nightPartner !== finishedPartner || hold.getState().currentSession.nightPartner == null, "replay clears companion");
assert(hold.getState().characters.nini.affection === 0, "replay restores initial affection");

const rewriteReset = createGame({ persist: false, rng: () => 0 });
playIntro(rewriteReset);
rewriteReset.setStat("nini", "obsession", 90);
rewriteReset.setStat("meteor", "destiny", 90);
rewriteReset.intervene("rewrite", "nini", { force: true });
assert(rewriteReset.getState().currentEvent.id === "EVENT_008_office_hub", "1000 returns to normal hub flow");
assert(rewriteReset.getState().lastResult.kind === "rewrite", "1000 shows rewrite popup data");
assert(rewriteReset.getState().characters.nini.obsession !== 90, "1000 reshuffles nini core");
assert(!rewriteReset.getState().flags.fate_rewritten_nini, "1000 does not write fate_rewritten");
assert(!rewriteReset.getState().flags.crisis_blocked_nini, "1000 does not block a crisis");
assert(rewriteReset.getState().currentEvent.id !== "EVENT_rewrite_nini", "1000 does not open a rewrite scene");
assert(!JSON.stringify(rewriteReset.getState().lastResult).includes("EVENT_rewrite"), "1000 popup has no rewrite event id");

const meteorReset = createGame({ persist: false, rng: () => 0 });
playIntro(meteorReset);
meteorReset.setStat("meteor", "destiny", 99);
meteorReset.intervene("rewrite", "meteor", { force: true });
assert(meteorReset.getState().characters.meteor.destiny !== 99, "1000 reshuffles meteor destiny");
assert(meteorReset.getState().currentEvent.id === "EVENT_008_office_hub", "1000 meteor still returns to hub");

const rewriteShura = createGame({ persist: false, rng: () => 0 });
playIntro(rewriteShura);
rewriteShura.intervene("rewrite", "pepsi", { force: true });
assert(!rewriteShura.getState().flags.fate_rewritten_pepsi, "1000 does not write fate_rewritten_pepsi");
assert(
  !rewriteShura.getState().pool.some((item) => item.id === "EVENT_shura_pepsi_meteor_02"),
  "1000 does not force a later rewrite plot"
);

const randomRewrite = createGame({ persist: false, rng: () => 0 });
playIntro(randomRewrite);
randomRewrite.intervene("rewrite", undefined, { force: true });
assert(randomRewrite.getState().lastResult.characterId === "nini", "1000 without a target randomly picks a character");
assert(randomRewrite.getState().lastResult.kind === "rewrite", "random 1000 still only shuffles numbers");

assert(eventPresentation(EVENT_BY_ID.EVENT_nini_sweet_01).label.includes("甜蜜"), "sweet cards are labeled 甜蜜");
assert(eventPresentation(EVENT_BY_ID.EVENT_nini_nature_01).label.includes("性格"), "nature cards are labeled 性格");
assert(eventPresentation(EVENT_BY_ID.EVENT_nini_overstep_01).label.includes("越界"), "overstep cards are labeled 越界");
assert(eventPresentation(EVENT_BY_ID.EVENT_nini_foreshadow_01).kind === "foreshadow", "foreshadow keeps a distinct tone");
assert(
  !String(eventPresentation(EVENT_BY_ID.EVENT_nini_foreshadow_01).label || "").includes("伏筆"),
  "foreshadow cards do not tell the audience they are 伏筆"
);
assert(eventPresentation(EVENT_BY_ID.EVENT_008_office_hub).label.includes("現場"), "hub cards are labeled 現場");
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

const feedback = createGame({ persist: false, rng: () => 0 });
playIntro(feedback);
assert(feedback.getState().lastResult.kind === "stats", "intro last choice still has a result popup");
assert(feedback.getState().lastResult.overlayTitle === "狀態變化", "ordinary popup is 狀態變化");
assert(feedback.getState().currentEvent.id === "EVENT_008_office_hub", "intro still lands on hub");
assert(
  !String(feedback.getState().lastResult.intervalCopy || "").includes("五人正式碰面"),
  "interval copy does not use the hub title"
);
assert(
  !String(feedback.getState().currentSession.intervalCopy || "").includes("小時候那條路"),
  "interval copy does not preview a later card title"
);

feedback.startEvent("EVENT_shura_jupiter_mars_01", { force: true });
feedback.choose("moon_opens");
assert(feedback.getState().lastResult, "shura choice always produces a result");
assert(feedback.getState().lastResult.kind === "stats", "shura moon_opens uses the shared result flow");
assert(
  (feedback.getState().lastResult.statusNotes || []).some((note) => /開了門/.test(note.text)),
  "shura moon_opens explains the door in human language"
);
assert(!JSON.stringify(feedback.getState().lastResult.statusNotes).includes("moon_opened_the_door"), "shura result hides flag keys");
assert(feedback.getState().lastResult.overlayTitle === "狀態變化", "shura popup is 狀態變化");
assert(feedback.getState().currentEvent.id === "EVENT_008_office_hub", "unforced shura option returns to interval hub");

const peekFx = createGame({ persist: false, rng: () => 0 });
playIntro(peekFx);
peekFx.intervene("peek", "meteor", { force: true });
peekFx.choose("memory");
assert(peekFx.getState().lastResult.kind === "peek", "100 memory has a special-fate result");
assert(peekFx.getState().lastResult.revealKind === "回憶", "100 memory is labeled 回憶");
assert(peekFx.getState().lastResult.revealTitle, "100 memory includes the card title");
assert(peekFx.getState().lastResult.revealBody, "100 memory includes the card body");
assert(!String(peekFx.getState().lastResult.revealTitle).includes("EVENT_"), "100 memory title has no event id");

const encFx = createGame({ persist: false, rng: () => 0 });
playIntro(encFx);
encFx.intervene("encounter", "meteor", { force: true });
encFx.choose("stay");
assert(encFx.getState().lastResult.kind === "encounter", "200 stay has 獨處成立 result");
assert(encFx.getState().lastResult.overlayTitle === "獨處成立", "200 overlay is 獨處成立");
assert(encFx.getState().lastResult.name === "沙士流星", "200 names 沙士流星");
assert(
  !String(encFx.getState().lastResult.intervalCopy || "").includes(encFx.getState().currentEvent.title),
  "200 interval does not preview the solo card title"
);

const rewriteFx = createGame({ persist: false, rng: () => 0 });
playIntro(rewriteFx);
rewriteFx.setStat("meteor", "destiny", 90);
rewriteFx.intervene("rewrite", "meteor", { force: true });
assert(rewriteFx.getState().lastResult.kind === "rewrite", "1000 still shuffles");
assert(rewriteFx.getState().lastResult.name === "沙士流星", "1000 shows the full name");
assert(
  (rewriteFx.getState().lastResult.statChanges?.[0]?.changes || []).some((row) => row.key === "destiny"),
  "1000 lists the shuffled core stats"
);
assert(
  (rewriteFx.getState().lastResult.statChanges?.[0]?.changes || []).every((row) => row.label && !/EVENT_|FLAG_/.test(row.label)),
  "1000 stat labels are human"
);

const holdFx = createGame({ persist: false, rng: () => 0 });
playIntro(holdFx);
holdFx.holdTonight();
const settledChars = holdFx.getState().lastResult.settlement.characters;
assert(settledChars.every((c) => c.name && c.name.length >= 4), "settlement uses full names");
assert(settledChars.find((c) => c.id === "jupiter").name === "芬達木星", "settlement names 芬達木星");
assert(settledChars.find((c) => c.id === "mars").name === "西打火星", "settlement names 西打火星");
assert(typeof holdFx.getState().lastResult.settlement.fireTo === "number", "settlement includes fire index");
assert(fireMoodLabel(holdFx.getState().lastResult.settlement.fireTo), "fire index has a mood label");
holdFx.confirmTonightHold();
assert(holdFx.getState().lastResult.kind === "companion", "confirming settlement opens companion popup");
assert(holdFx.getState().lastResult.name, "companion popup names the partner");
assert(!/pepsi|nini|meteor|jupiter|mars/.test(holdFx.getState().lastResult.name), "companion popup uses full Chinese name");
holdFx.choose("close_night");
const keptAffection = holdFx.getState().characters.meteor.affection;
const keptOccurred = [...holdFx.getState().occurredEventIds];
holdFx.continueDrama();
assert(holdFx.getState().lifecycle === "playing", "continue drama starts another night");
assert(holdFx.getState().currentEvent.id === "EVENT_008_office_hub", "continue drama returns to the hub interval");
assert(holdFx.getState().characters.meteor.affection === keptAffection, "continue drama keeps world stats");
assert(keptOccurred.every((id) => holdFx.getState().occurredEventIds.includes(id)), "continue drama keeps occurred cards");
assert(holdFx.getState().flags.nini_arrived === true, "continue drama keeps existing flags");
holdFx.newGame();
assert(holdFx.getState().currentEvent.id === "EVENT_001_prologue", "replay after continue still starts a new game");
assert(holdFx.getState().characters.meteor.affection === 0, "replay restores meteor affection");

const doorFx = createGame({ persist: false, rng: () => 0 });
playIntro(doorFx);
doorFx.startEvent("EVENT_shura_jupiter_mars_01", { force: true });
doorFx.choose("help_jupiter");
const doorPeople = (doorFx.getState().lastResult.statChanges || []).map((row) => row.id);
assert(doorPeople.includes("jupiter"), "幫木星關門 shows 芬達木星");
assert(doorPeople.includes("mars"), "幫木星關門 shows 西打火星");
assert(
  doorFx.getState().lastResult.statChanges.find((row) => row.id === "jupiter").changes.some((c) => c.key === "affection" && c.to > c.from),
  "幫木星關門 raises 芬達木星 affection"
);
assert(
  doorFx.getState().lastResult.statChanges.find((row) => row.id === "mars").changes.some((c) => c.to < c.from),
  "幫木星關門 can lower 西打火星"
);

const stopFx = createGame({ persist: false, rng: () => 0 });
playIntro(stopFx);
stopFx.setStat("mars", "provocation", 80);
stopFx.setStat("jupiter", "affection", 35);
stopFx.startEvent("EVENT_shura_jupiter_mars_02", { force: true });
stopFx.choose("mars_stop");
const stopRows = stopFx.getState().lastResult.statChanges || [];
assert(stopRows.some((row) => row.id === "mars" && row.changes.some((c) => c.key === "provocation" && c.to < c.from)), "請火星停手 lowers provocation");
assert(stopRows.some((row) => row.id === "jupiter" && row.changes.some((c) => c.key === "affection" && c.to > c.from)), "請火星停手 also raises 芬達木星");
assert(stopRows.length >= 2, "one shura option shows every involved character");

const saboFx = createGame({ persist: false, rng: () => 0 });
playIntro(saboFx);
saboFx.intervene("encounter", "nini", { force: true });
saboFx.choose("stay");
saboFx.setStat("nini", "affection", 42);
saboFx.intervene("sabotage", "mars", { force: true });
assert(saboFx.getState().lastResult.kind === "sabotage", "300 interrupt uses the paid overlay");
assert(saboFx.getState().lastResult.interruptLine, "300 shows A's spoken reason");
assert(
  /獨處|兩人時間|打斷/.test(
    JSON.stringify(saboFx.getState().lastResult.statusNotes || []) + (saboFx.getState().lastResult.intervalCopy || "")
  ),
  "300 shows the solo was broken"
);
assert(
  (saboFx.getState().lastResult.statChanges || []).some((row) => row.id === "nini" && row.changes.some((c) => c.key === "affection" && c.to < c.from)),
  "300 interrupt can lower 雪碧日日 affection"
);
assert(
  (saboFx.getState().lastResult.statChanges || []).some((row) => row.id === "mars"),
  "300 interrupt also shows 西打火星"
);
assert(saboFx.getState().currentEvent.characters.includes("mars"), "300 next event is 西打火星's");

const ORDINARY_COUNTS = { sweet: 4, nature: 3, overstep: 3, foreshadow: 3, solo: 3 };
const ordinaryIds = [];
for (const id of CHAR_IDS) {
  for (const [kind, count] of Object.entries(ORDINARY_COUNTS)) {
    for (let n = 1; n <= count; n += 1) {
      const num = String(n).padStart(2, "0");
      const eventId =
        id === "jupiter" && kind === "solo" && num === "01"
          ? "EVENT_jupiter_quiet_date"
          : `EVENT_${id}_${kind}_${num}`;
      ordinaryIds.push(eventId);
    }
  }
}
assert(ordinaryIds.length === 80, "ordinary card catalog is 80");
assert(!EVENT_BY_ID.EVENT_jupiter_solo_01, "jupiter solo_01 is not a live id");
assert(EVENT_BY_ID.EVENT_jupiter_quiet_date, "jupiter solo keeps EVENT_jupiter_quiet_date");
assert(EVENT_BY_ID.EVENT_jupiter_quiet_date.choices.length === 4, "quiet date now has four choices");
assert((EVENT_BY_ID.EVENT_jupiter_quiet_date.tags || []).includes("date"), "quiet date keeps the date tag");
assert((EVENT_BY_ID.EVENT_jupiter_quiet_date.tags || []).includes("solo"), "quiet date stays a solo card");
for (const eventId of ordinaryIds) {
  const event = EVENT_BY_ID[eventId];
  assert(event, `${eventId} exists`);
  assert((event.choices || []).length === 4, `${eventId} has four choices`);
  assert(event.weight > 0, `${eventId} keeps a draw weight`);
  assert(event.resultCopy, `${eventId} has popup copy`);
  assert(event.intervalCopy, `${eventId} has interval copy`);
  const ids = event.choices.map((choice) => choice.id);
  assert(ids.join(",") === "a,b,c,d", `${eventId} uses a/b/c/d`);
  for (const choice of event.choices) {
    const stats = (choice.effects || []).filter((effect) => effect.type === "stat");
    assert(stats.length > 0, `${eventId}:${choice.id} writes stats`);
    for (const effect of stats) {
      const match = /^characters\.([^.]+)\.([^.]+)$/.exec(effect.path);
      assert(match, `${eventId}:${choice.id} uses a character stat path`);
      assert(resolveCharacterStatKey(match[1], match[2]), `${eventId}:${choice.id} writes official ${match[1]}.${match[2]}`);
    }
  }
}
assert(
  EVENT_BY_ID.EVENT_nini_sweet_01.weight === 28 &&
    EVENT_BY_ID.EVENT_nini_nature_01.weight === 20 &&
    EVENT_BY_ID.EVENT_nini_overstep_01.weight === 10 &&
    EVENT_BY_ID.EVENT_nini_foreshadow_01.weight === 8 &&
    EVENT_BY_ID.EVENT_nini_solo_01.weight === 18 &&
    EVENT_BY_ID.EVENT_jupiter_quiet_date.weight === 18,
  "ordinary weights stay 28/20/10/8/18"
);
for (const id of [
  "EVENT_nini_jealousy_01",
  "EVENT_nini_lockbox_01",
  "EVENT_nini_dependence_01",
  "EVENT_meteor_jealousy_01",
  "EVENT_meteor_never_broke_up_01",
  "EVENT_pepsi_jealousy_01",
  "EVENT_pepsi_identity_01",
  "EVENT_pepsi_soul_01",
  "EVENT_jupiter_jealousy_01",
  "EVENT_jupiter_packing_01",
  "EVENT_jupiter_hope_low_01",
  "EVENT_mars_jealousy_01",
  "EVENT_mars_too_close_01",
  "EVENT_mars_kings_01",
]) {
  assert(EVENT_BY_ID[id], `special ${id} is still present`);
}

const ordinaryCopy = createGame({ persist: false, rng: () => 0 });
playIntro(ordinaryCopy);
ordinaryCopy.setStat("nini", "affection", 10);
playForced(ordinaryCopy, "EVENT_nini_sweet_01", "d");
assert(ordinaryCopy.getState().lastResult.resultCopy.includes("滿足"), "ordinary popup uses the card result copy");
assert(ordinaryCopy.getState().lastResult.intervalCopy.includes("回到她身邊"), "ordinary interval uses the card interval copy");
assert(ordinaryCopy.getState().characters.nini.affection === 8, "ordinary choices can lower stats");
assert(ordinaryCopy.getState().characters.nini.obsession > 0, "ordinary choices can still raise other stats");
assert(ordinaryCopy.getState().flags.foreshadow_nini_missing !== true, "unrelated foreshadow flags stay off");

const overstepFlag = createGame({ persist: false, rng: () => 0 });
playIntro(overstepFlag);
playForced(overstepFlag, "EVENT_nini_overstep_01", "c");
assert(overstepFlag.getState().flags.foreshadow_nini_hair, "overstep_01 still writes foreshadow_nini_hair");

console.log("mvp smoke ok", {
  event: game.getState().currentEvent.id,
  fate: game.getState().fate,
  fire: game.getState().derived.fireIndex,
  settlement: persistB.getState().settlement.label,
  archive: persistB.getState().archive["qixi-2026"].nightPartner,
});
