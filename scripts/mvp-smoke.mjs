import { createGame } from "../src/engine/game.js";
import { GAME_CONFIG } from "../src/config/game.config.js";

const game = createGame({ persist: false });
const assert = (cond, message) => {
  if (!cond) throw new Error(message);
};

assert(game.getState().currentEvent.id === "EVENT_001_prologue", "should open on prologue");
assert(game.getState().fate === GAME_CONFIG.startingFate, "starting fate");
assert(game.getState().charactersView.length === 5, "five characters");
assert(game.intervene("letter", "nini").ok === false, "interventions locked at start");

game.choose("listen");
game.choose("open");
game.choose("tease");
game.choose("understood");
game.choose("receive");
game.choose("fight");
game.choose("observe");

const afterIntro = game.getState();
assert(afterIntro.flags.interventionsUnlocked, "interventions unlock after realization");
assert(afterIntro.currentEvent.id === "EVENT_008_office_hub", "land on hub");
assert(afterIntro.trajectory.type === "open", "ending not locked after intro");
assert(afterIntro.characters.nini.affection > 56, "nini affection moved");
assert(afterIntro.characters.mars.chemistry > 44, "mars chemistry moved");

const beforeFate = afterIntro.fate;
const iv = game.intervene("encounter", "jupiter");
assert(iv.ok, "encounter should run");
assert(game.getState().fate === beforeFate - 150, "encounter costs 150");
assert(game.getState().currentEvent.id === "IV_encounter", "encounter event started");
assert(game.getState().currentEvent.description.includes("西打木星"), "event interpolates target");

game.choose("stay");
assert(game.getState().flags.encounter_jupiter, "encounter flag");
assert(game.getState().characters.jupiter.affection >= 58 + 5 + 8, "jupiter affection from intro+encounter");

game.simulateDonation({ amount: 100, message: "test", from: "mock" });
assert(game.getState().fate > 0, "donation adds fate");

game.addFate(25);
game.setStat("pepsi", "jealousy", 12);
assert(game.getState().characters.pepsi.jealousy === 12, "admin setStat");

console.log("mvp smoke ok", {
  event: game.getState().currentEvent.id,
  fate: game.getState().fate,
  fire: game.getState().derived.fireIndex,
  trajectory: game.getState().trajectory.type,
});
