import { GAME_CONFIG } from "../config/game.config.js";
import { CHARACTERS } from "../../data/characters.js";
import { RELATIONSHIP_PAIRS, pairKey } from "../../data/relationships.js";
import { SEASONS } from "../../data/seasons/index.js";

export { pairKey };

export function createInitialState(seasonId = GAME_CONFIG.currentSeason) {
  const season = SEASONS[seasonId];
  const characters = {};
  for (const character of CHARACTERS) {
    characters[character.id] = { ...character.initial };
  }

  const relationships = {};
  for (const pair of RELATIONSHIP_PAIRS) {
    relationships[pairKey(pair.a, pair.b)] = {
      a: pair.a,
      b: pair.b,
      tension: pair.tension,
      note: pair.note,
    };
  }

  return {
    version: GAME_CONFIG.version,
    currentSeason: seasonId,
    fate: GAME_CONFIG.startingFate,
    characters,
    relationships,
    completedEvents: [],
    flags: {},
    history: [],
    ending: null,
    currentEventId: season.openingEventId,
    pendingTargetId: null,
    lastResult: null,
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(GAME_CONFIG.saveKey);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== GAME_CONFIG.version) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeSave(state) {
  localStorage.setItem(GAME_CONFIG.saveKey, JSON.stringify(state));
}

export function clearSave() {
  localStorage.removeItem(GAME_CONFIG.saveKey);
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}
