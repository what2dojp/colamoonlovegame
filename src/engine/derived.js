import { GAME_CONFIG } from "../config/game.config.js";
import { CHARACTERS, CHARACTER_BY_ID, STAT_LABELS } from "../../data/characters.js";

export function clampStat(value) {
  return Math.max(GAME_CONFIG.statMin, Math.min(GAME_CONFIG.statMax, Math.round(value)));
}

export function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

function hasForeshadow(state, id) {
  const flags = state.flags || {};
  const prefix = `foreshadow_${id}`;
  return Object.keys(flags).some((key) => key.startsWith(prefix) && flags[key] === true);
}

export function characterDanger(state, id) {
  const def = CHARACTER_BY_ID[id];
  const stats = state.characters?.[id] || {};
  if (!def) return 0;
  const unique = Number(stats[def.uniquePrimary]) || 0;
  const jealousy = typeof stats.jealousy === "number" ? stats.jealousy : 0;
  let score = jealousy * 0.5 + unique * 0.45;
  if (state.flags?.[`public_jealous_${id}`]) score += 18;
  if (state.flags?.[`date_broken_${id}`]) score += 14;
  if (state.flags?.[`solo_active_${id}`]) score += 6;
  return clampStat(score);
}

export function audienceStatus(state, id) {
  const def = CHARACTER_BY_ID[id];
  const stats = state.characters?.[id] || {};
  const evId = state.currentEventId || "";
  if (state.flags?.[`solo_active_${id}`] === true) {
    return { key: "solo", label: "🌙 獨處中", hint: "與可樂月月獨處中" };
  }
  const inNamedCrisis =
    evId === def?.crisisEventId ||
    evId === def?.crisisEventId2 ||
    (evId.includes("shura") && evId.includes(id));
  if (inNamedCrisis || state.flags?.[`public_jealous_${id}`] || state.flags?.[`date_broken_${id}`]) {
    return { key: "crisis", label: "危機", hint: "現場不穩" };
  }
  const jealousy = typeof stats.jealousy === "number" ? stats.jealousy : 0;
  if (state.flags?.[`jealousy_triggered_${id}`] || jealousy >= 12) {
    return { key: "jealous", label: "嫉妒", hint: "在意距離" };
  }
  const unique = Number(stats[def?.uniquePrimary]) || 0;
  if (hasForeshadow(state, id) || unique >= 10) {
    return { key: "uneasy", label: "有些異常", hint: "還說不準" };
  }
  return { key: "calm", label: "平靜", hint: "" };
}

export function fireLevel(fireIndex) {
  const { fireCalm, fireWarm, fireHot } = GAME_CONFIG.derived;
  if (fireIndex >= fireHot) return "extreme";
  if (fireIndex >= fireWarm) return "high";
  if (fireIndex >= fireCalm) return "mid";
  return "low";
}

export function computeDerived(state) {
  const dangers = Object.fromEntries(CHARACTERS.map((c) => [c.id, characterDanger(state, c.id)]));
  const fireIndex = CHARACTERS.reduce((sum, c) => sum + dangers[c.id], 0);
  const affections = CHARACTERS.map((c) => state.characters[c.id].affection);
  const loveTemp = clampStat(average(affections));
  const level = fireLevel(fireIndex);
  const shura = level === "extreme" || level === "high" ? "警報" : level === "mid" ? "升溫" : "平靜";

  return {
    fireIndex,
    dangers,
    fireLevel: level,
    loveTemp,
    shura,
    shuraLabel: shura === "警報" ? "💥 修羅場警報" : shura === "升溫" ? "🔥 現場升溫" : "🌙 尚未失控",
  };
}

export function characterStatus(state, id) {
  const c = CHARACTER_BY_ID[id];
  const stats = state.characters[id];
  const unique = stats[c.uniquePrimary];
  const affection = Number(stats.affection) || 0;

  if (affection < 8 && unique < 8) return "尚未靠近";
  if (id === "nini" && unique >= 18 && stats.trust < 12) return "危險病嬌";
  if (id === "nini" && unique >= 18) return "病嬌佔有";
  if (id === "nini" && stats.dependence >= 20) return "不能沒有妳";
  if (id === "nini" && stats.trust >= 18) return "忠誠依賴";
  if (id === "meteor" && stats.destiny >= 20) return "命定確信";
  if (id === "meteor" && stats.pride >= 16) return "嘴硬舊愛";
  if (id === "pepsi" && stats.resonance >= 20) return "靈魂共鳴";
  if (id === "pepsi" && affection >= 10) return "不必搶她";
  if (id === "jupiter" && stats.devotion >= 20 && stats.hope <= 8) return "溫柔心碎";
  if (id === "jupiter" && stats.hope < 10 && affection >= 8) return "成全但不走";
  if (id === "jupiter" && stats.devotion >= 18) return "安靜地追求";
  if (id === "mars" && stats.chemistry >= 16 && stats.provocation >= 18) return "互相傷害";
  if (id === "mars" && affection < 8 && stats.provocation >= 12) return "第一眼就討厭";
  if (typeof stats.jealousy === "number" && stats.jealousy >= 16) return "醋意上升";
  if (affection >= 18) return "心動明顯";
  return "關係進行中";
}

export { STAT_LABELS };
