import { GAME_CONFIG } from "../config/game.config.js";
import { CHARACTERS, CHARACTER_BY_ID, STAT_KEY_ALIASES } from "../../data/characters.js";
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
    occurredEventIds: [],
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

export function migrateCharacterStats(id, raw = {}) {
  const def = CHARACTER_BY_ID[id];
  if (!def) return { ...raw };
  const renamed = { ...raw };
  for (const [from, to] of Object.entries(STAT_KEY_ALIASES)) {
    if (renamed[from] != null && renamed[to] == null) renamed[to] = renamed[from];
    delete renamed[from];
  }
  const next = { ...def.initial };
  for (const key of def.stats) {
    if (renamed[key] != null) next[key] = renamed[key];
  }
  return next;
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
    occurredEventIds: data.occurredEventIds || data.completedEvents || [],
    eventRecords: data.eventRecords || {},
    eventHistory: data.eventHistory || data.history || [],
    history: data.history || data.eventHistory || [],
    currentSession: data.currentSession ? { ...createSession(), ...data.currentSession } : createSession(),
    archive: data.archive || {},
  };
  delete merged.ending;

  const characters = {};
  for (const character of CHARACTERS) {
    characters[character.id] = migrateCharacterStats(character.id, data.characters?.[character.id] || {});
  }
  merged.characters = characters;

  merged.relationships = { ...base.relationships, ...(data.relationships || {}) };
  for (const pair of RELATIONSHIP_PAIRS) {
    const key = pairKey(pair.a, pair.b);
    if (!merged.relationships[key]) {
      merged.relationships[key] = {
        a: pair.a,
        b: pair.b,
        tension: pair.tension,
        note: pair.note,
      };
    }
  }
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
