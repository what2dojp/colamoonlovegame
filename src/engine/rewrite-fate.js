import {
  CHARACTERS,
  CHARACTER_BY_ID,
  characterAuxiliaryStats,
  characterCoreStats,
  resolveCharacterStatKey,
  statMeta,
} from "../../data/characters.js";
import { characterDanger, clampStat } from "./derived.js";

const DANGER_CHANCE = 0.2;

/** Official keys that feed derived danger, plus listed conflict/drama keys. Never a fake danger stat. */
const DANGER_KEYS = {
  nini: ["jealousy", "obsession"],
  meteor: ["jealousy", "destiny", "pride"],
  pepsi: ["resonance", "destiny"],
  jupiter: ["jealousy", "devotion"],
  mars: ["chemistry", "provocation", "pride"],
};

function rollBetween(min, max, rng) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return clampStat(Math.round(lo + rng() * (hi - lo)));
}

function writeStat(state, characterId, key, value) {
  const official = resolveCharacterStatKey(characterId, key);
  if (!official) return false;
  state.characters[characterId][official] = clampStat(value);
  return true;
}

function currentStat(state, characterId, key) {
  return Number(state.characters?.[characterId]?.[key]) || 0;
}

export function isLoveStat(key) {
  return statMeta(key).role === "love";
}

export function intimacyScore(stats = {}, character) {
  const def = typeof character === "string" ? CHARACTER_BY_ID[character] : character;
  if (!def) return 0;
  const keys = [...characterCoreStats(def), ...characterAuxiliaryStats(def)].filter((key) => isLoveStat(key));
  if (!keys.length) return Number(stats.affection) || 0;
  return keys.reduce((sum, key) => sum + (Number(stats[key]) || 0), 0) / keys.length;
}

export function intimacyRankings(state) {
  const rows = CHARACTERS.map((character) => ({
    id: character.id,
    score: intimacyScore(state.characters[character.id], character),
  }));
  rows.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export function intimacyRank(state, characterId) {
  return intimacyRankings(state).find((row) => row.id === characterId)?.rank || CHARACTERS.length;
}

export function affectionRankings(state) {
  const rows = CHARACTERS.map((character) => ({
    id: character.id,
    score: currentStat(state, character.id, "affection"),
  }));
  rows.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export function affectionRank(state, characterId) {
  return affectionRankings(state).find((row) => row.id === characterId)?.rank || CHARACTERS.length;
}

export function dangerRankings(state) {
  const rows = CHARACTERS.map((character) => ({
    id: character.id,
    score: characterDanger(state, character.id),
  }));
  rows.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export function dangerRank(state, characterId) {
  return dangerRankings(state).find((row) => row.id === characterId)?.rank || CHARACTERS.length;
}

export function rewriteStance(state, targetId) {
  const rankings = affectionRankings(state);
  const mine = rankings.find((row) => row.id === targetId);
  const others = rankings.filter((row) => row.id !== targetId);
  if (!mine || !others.length) return "mid";
  const maxOther = Math.max(...others.map((row) => row.score));
  const minOther = Math.min(...others.map((row) => row.score));
  const avg = others.reduce((sum, row) => sum + row.score, 0) / others.length;
  const spread = Math.max(...rankings.map((row) => row.score)) - Math.min(...rankings.map((row) => row.score));
  if (mine.rank === 1 && mine.score > maxOther) return "leading";
  if (spread < 4) return "mid";
  if (mine.rank === rankings.length || mine.score <= avg - 8 || mine.score <= minOther + 2 || mine.score < maxOther - 12) {
    return "behind";
  }
  return "mid";
}

function distinctRoll(current, min, max, rng) {
  let next = rollBetween(min, max, rng);
  if (next === current) next = clampStat(current >= 50 ? current - 21 : current + 21);
  return next;
}

function reverseAffection(current, maxOther, minOther, rng) {
  const high = Math.max(Math.min(current - 18, maxOther - 8), minOther);
  const low = Math.max(8, Math.min(high - 8, maxOther - 35, current - 42));
  let next = rollBetween(low, Math.max(low, high), rng);
  if (next >= maxOther) next = clampStat(maxOther - rollBetween(10, 22, rng));
  if (next >= current) next = clampStat(Math.min(current - 18, maxOther - 10));
  return clampStat(next);
}

function applyAffectionRewrite(state, targetId, stance, rng) {
  const others = CHARACTERS.filter((character) => character.id !== targetId).map((character) =>
    currentStat(state, character.id, "affection")
  );
  const maxOther = Math.max(...others);
  const minOther = Math.min(...others);
  const current = currentStat(state, targetId, "affection");
  let next = current;
  if (stance === "behind") {
    next = clampStat(maxOther + rollBetween(5, 15, rng));
    if (maxOther < 100 && next <= maxOther) next = clampStat(maxOther + 5);
  } else if (stance === "leading") {
    next = reverseAffection(current, maxOther, minOther, rng);
  } else {
    next = distinctRoll(current, 18, 88, rng);
  }
  writeStat(state, targetId, "affection", next);

  const target = CHARACTER_BY_ID[targetId];
  for (const key of characterCoreStats(target)) {
    if (key === "affection" || !isLoveStat(key)) continue;
    const value = currentStat(state, targetId, key);
    if (stance === "behind") {
      writeStat(state, targetId, key, distinctRoll(value, Math.max(70, next - 12), Math.min(100, next + 8), rng));
    } else if (stance === "leading") {
      writeStat(state, targetId, key, distinctRoll(value, Math.max(8, next - 10), Math.min(next + 8, 62), rng));
    } else {
      writeStat(state, targetId, key, distinctRoll(value, 18, 88, rng));
    }
  }
}

function raiseToward(state, targetId, key, floor, rng, extra = 0) {
  if (!resolveCharacterStatKey(targetId, key)) return;
  const current = currentStat(state, targetId, key);
  const rolled = rollBetween(floor, Math.min(100, floor + extra), rng);
  writeStat(state, targetId, key, Math.max(current, rolled));
}

function pushDangerHigher(state, targetId, rng) {
  for (const key of DANGER_KEYS[targetId] || []) {
    if (!resolveCharacterStatKey(targetId, key)) continue;
    const current = currentStat(state, targetId, key);
    const bump = key === CHARACTER_BY_ID[targetId]?.uniquePrimary || key === "jealousy" ? rollBetween(12, 28, rng) : rollBetween(8, 18, rng);
    writeStat(state, targetId, key, Math.max(current + 1, current + bump));
  }
}

function spikeDangerZone(state, targetId, rng) {
  const def = CHARACTER_BY_ID[targetId];
  const hasJealousy = def?.stats?.includes("jealousy");
  if (hasJealousy) {
    raiseToward(state, targetId, "jealousy", 78, rng, 18);
    raiseToward(state, targetId, def.uniquePrimary, 72, rng, 22);
  } else {
    raiseToward(state, targetId, def.uniquePrimary, 86, rng, 14);
  }
  for (const key of DANGER_KEYS[targetId] || []) {
    if (key === "jealousy" || key === def.uniquePrimary) continue;
    raiseToward(state, targetId, key, hasJealousy ? 70 : 82, rng, 16);
  }
}

function applyDangerFate(state, targetId, rng) {
  const ranks = dangerRankings(state);
  const mine = ranks.find((row) => row.id === targetId);
  const others = ranks.filter((row) => row.id !== targetId);
  const maxOther = others.length ? Math.max(...others.map((row) => row.score)) : 0;
  const alreadyHighest = Boolean(mine && mine.rank === 1 && mine.score >= maxOther);
  const alreadyHot = (mine?.score || 0) >= 55;
  if (alreadyHighest && alreadyHot) {
    pushDangerHigher(state, targetId, rng);
    return;
  }
  spikeDangerZone(state, targetId, rng);
}

export function applyFateRewrite(state, targetId, rng = Math.random) {
  const target = CHARACTER_BY_ID[targetId];
  if (!target) return { danger: false, stance: "mid" };
  const stance = rewriteStance(state, targetId);
  const danger = rng() < DANGER_CHANCE;
  applyAffectionRewrite(state, targetId, stance, rng);
  if (danger) applyDangerFate(state, targetId, rng);
  return { danger, stance };
}

export function rewriteCoreChanges(character, beforeStats = {}, afterStats = {}) {
  const def = typeof character === "string" ? CHARACTER_BY_ID[character] : character;
  if (!def) return [];
  const keys = [...characterCoreStats(def)];
  for (const key of characterAuxiliaryStats(def)) {
    const from = Number(beforeStats[key]) || 0;
    const to = Number(afterStats[key]) || 0;
    if (from !== to) keys.push(key);
  }
  if ((beforeStats.danger != null || afterStats.danger != null) && Number(beforeStats.danger) !== Number(afterStats.danger)) {
    keys.push("danger");
  }
  const rows = keys.map((key) => {
    const meta = key === "danger" ? { icon: "⚠️", audienceLabel: "危險度" } : statMeta(key);
    const from = Number(beforeStats[key]) || 0;
    const to = Number(afterStats[key]) || 0;
    return {
      key,
      icon: meta.icon || "",
      label: meta.audienceLabel || meta.label || key,
      from,
      to,
      delta: to - from,
    };
  });
  const changed = rows.filter((row) => row.from !== row.to);
  return changed.length ? changed : rows.filter((row) => row.key !== "danger");
}
