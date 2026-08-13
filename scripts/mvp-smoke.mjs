import { createGame } from "../src/engine/game.js";
import { GAME_CONFIG } from "../src/config/game.config.js";
import { pickNightPartner } from "../src/engine/session.js";

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
game.setStat("pepsi", "jealousy", 12);
assert(game.getState().characters.pepsi.jealousy === 12, "admin setStat");

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
partnerGame.setStat("nini", "affection", 10);
partnerGame.setStat("meteor", "affection", 10);
partnerGame.setStat("pepsi", "affection", 10);
partnerGame.setStat("mars", "affection", 10);
assert(pickNightPartner(partnerGame.getState()) === "jupiter", "highest affection wins");
partnerGame.endSession();
partnerGame.choose("close_night");
assert(partnerGame.getState().flags.qixi_2026_night_partner === "jupiter", "jupiter night flag");
assert(partnerGame.getState().archive["qixi-2026"].nightPartner === "jupiter", "archive jupiter");
assert(!partnerGame.getState().flags.jupiter_route, "still no route flag");

const tie = createGame({ persist: false });
playIntro(tie);
for (const id of ["nini", "meteor", "pepsi", "jupiter", "mars"]) {
  tie.setStat(id, "affection", 50);
}
tie.intervene("letter", "mars", { force: true });
tie.choose("private");
assert(pickNightPartner(tie.getState()) === "mars", "tie-break uses last major interaction");

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
