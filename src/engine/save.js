import { GAME_CONFIG } from "../config/game.config.js";
import { CHARACTERS } from "../../data/characters.js";
import { RELATIONSHIP_PAIRS, pairKey } from "../../data/relationships.js";
import { SEASONS } from "../../data/seasons/index.js";
import { createSession, makeId } from "./session.js";

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
    saveId: makeId("save"),
    currentSeason: seasonId,
    fate: GAME_CONFIG.startingFate,
    characters,
    relationships,
    flags: {},
    completedEvents: [],
    eventRecords: {},
    eventHistory: [],
    history: [],
    currentSession: createSession(),
    archive: {},
    currentEventId: season.openingEventId,
    pendingTargetId: null,
    lastResult: null,
  };
}

export function migrateSave(data) {
  if (!data || typeof data !== "object") return null;
  const base = createInitialState(data.currentSeason || GAME_CONFIG.currentSeason);
  const merged = {
    ...base,
    ...data,
    version: GAME_CONFIG.version,
    saveId: data.saveId || base.saveId,
    flags: data.flags || {},
    completedEvents: data.completedEvents || [],
    eventRecords: data.eventRecords || {},
    eventHistory: data.eventHistory || data.history || [],
    history: data.history || data.eventHistory || [],
    currentSession: data.currentSession ? { ...createSession(), ...data.currentSession } : createSession(),
    archive: data.archive || {},
  };
  delete merged.ending;
  return merged;
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(GAME_CONFIG.saveKey);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data) return null;
    if (data.version > GAME_CONFIG.version) return null;
    return migrateSave(data);
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
