import {
  CHARACTERS,
  CHARACTER_BY_ID,
  characterAuxiliaryStats,
  characterCoreStats,
  resolveCharacterStatKey,
  statMeta,
} from "../../data/characters.js";
import { clampStat } from "./derived.js";

const DANGER_CHANCE = 0.2;

const DANGER_REWRITE = {
  nini: { jealousy: [82, 98], obsession: [80, 96], dependence: [70, 90] },
  meteor: { jealousy: [82, 98], pride: [70, 90], destiny: [75, 95] },
  pepsi: { destiny: [85, 99], resonance: [82, 98] },
  jupiter: { jealousy: [82, 98], hope: [8, 28], patience: [12, 35] },
  mars: { provocation: [82, 98], pride: [70, 92], chemistry: [72, 94] },
};

function rollBetween(min, max, rng) {
  return clampStat(Math.round(min + rng() * (max - min)));
}

function writeStat(state, characterId, key, value) {
  const official = resolveCharacterStatKey(characterId, key);
  if (!official) return false;
  state.characters[characterId][official] = clampStat(value);
  return true;
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

export function rewriteStance(state, targetId) {
  const rankings = intimacyRankings(state);
  const mine = rankings.find((row) => row.id === targetId);
  const others = rankings.filter((row) => row.id !== targetId);
  if (!mine || !others.length) return "mid";
  const avg = others.reduce((sum, row) => sum + row.score, 0) / others.length;
  const maxOther = Math.max(...others.map((row) => row.score));
  const minOther = Math.min(...others.map((row) => row.score));
  const spread = Math.max(...rankings.map((row) => row.score)) - Math.min(...rankings.map((row) => row.score));
  if (spread < 4) return "mid";
  if (mine.rank === 1 && mine.score >= maxOther) return "leading";
  if (mine.score >= avg + 8 && mine.rank <= 2) return "leading";
  if (mine.rank === rankings.length || mine.score <= avg - 8 || mine.score <= minOther + 2) return "behind";
  return "mid";
}

function distinctRoll(current, min, max, rng) {
  let next = rollBetween(min, max, rng);
  if (next === current) next = clampStat(current >= 50 ? current - 21 : current + 21);
  return next;
}

function shuffleCores(state, targetId, band, rng) {
  const target = CHARACTER_BY_ID[targetId];
  for (const key of characterCoreStats(target)) {
    const current = Number(state.characters[targetId][key]) || 0;
    const love = isLoveStat(key);
    let min = 12;
    let max = 88;
    if (band === "high") {
      min = love ? 78 : 18;
      max = love ? 96 : 44;
    } else if (band === "low") {
      min = love ? 22 : 38;
      max = love ? 44 : 72;
    }
    writeStat(state, targetId, key, distinctRoll(current, min, max, rng));
  }
}

function applyDangerRewrite(state, targetId, rng) {
  const target = CHARACTER_BY_ID[targetId];
  const ranges = DANGER_REWRITE[targetId] || {};
  const touched = new Set();
  for (const [key, [min, max]] of Object.entries(ranges)) {
    if (writeStat(state, targetId, key, rollBetween(min, max, rng))) touched.add(resolveCharacterStatKey(targetId, key));
  }
  for (const key of characterCoreStats(target)) {
    if (touched.has(key)) continue;
    const current = Number(state.characters[targetId][key]) || 0;
    writeStat(state, targetId, key, distinctRoll(current, 18, 88, rng));
  }
}

export function applyFateRewrite(state, targetId, rng = Math.random) {
  const target = CHARACTER_BY_ID[targetId];
  if (!target) return { danger: false, stance: "mid" };
  const danger = rng() < DANGER_CHANCE;
  if (danger) {
    applyDangerRewrite(state, targetId, rng);
    return { danger: true, stance: "danger" };
  }
  const stance = rewriteStance(state, targetId);
  if (stance === "behind") shuffleCores(state, targetId, "high", rng);
  else if (stance === "leading") shuffleCores(state, targetId, "low", rng);
  else shuffleCores(state, targetId, "mid", rng);
  return { danger: false, stance };
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
  return keys.map((key) => {
    const meta = statMeta(key);
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
}
