import { GAME_CONFIG } from "../config/game.config.js";
import { CHARACTERS, CHARACTER_BY_ID, STAT_LABELS } from "../../data/characters.js";

export function clampStat(value) {
  return Math.max(GAME_CONFIG.statMin, Math.min(GAME_CONFIG.statMax, Math.round(value)));
}

export function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

export function computeDerived(state) {
  const jealousies = CHARACTERS.map((c) => state.characters[c.id].jealousy);
  const tensions = Object.values(state.relationships).map((r) => r.tension);
  const affections = CHARACTERS.map((c) => state.characters[c.id].affection);
  const conflictCount = (state.history || []).filter((h) =>
    ["intervention", "conflict"].includes(h.kind)
  ).length;

  const fireIndex = clampStat(
    average(jealousies) * GAME_CONFIG.derived.fireJealousyWeight +
      Math.max(0, ...tensions) * GAME_CONFIG.derived.fireTensionWeight +
      Math.min(100, conflictCount * 8) * GAME_CONFIG.derived.fireHistoryWeight
  );

  const loveTemp = clampStat(average(affections));
  let shura = "平靜";
  if (fireIndex >= GAME_CONFIG.derived.shuraWarm) shura = "警報";
  else if (fireIndex >= GAME_CONFIG.derived.shuraCalm) shura = "升溫";

  return {
    fireIndex,
    loveTemp,
    shura,
    shuraLabel: shura === "警報" ? "💥 修羅場警報" : shura === "升溫" ? "🔥 現場升溫" : "🌙 尚未失控",
  };
}

export function characterStatus(state, id) {
  const c = CHARACTER_BY_ID[id];
  const stats = state.characters[id];
  const unique = stats[c.uniquePrimary];

  if (id === "nini" && unique >= 55) return "病嬌佔有";
  if (id === "nini" && stats.trust >= 70) return "忠誠依賴";
  if (id === "meteor" && stats.destinyBelief >= 78) return "命定確信";
  if (id === "meteor" && stats.pride >= 60) return "嘴硬舊愛";
  if (id === "pepsi" && stats.soulResonance >= 80) return "靈魂共鳴";
  if (id === "pepsi") return "不必搶她";
  if (id === "jupiter" && stats.hope < 55) return "成全但不走";
  if (id === "jupiter" && stats.devotion >= 85) return "安靜地追求";
  if (id === "mars" && stats.chemistry >= 55 && stats.provocation >= 70) return "互相傷害";
  if (id === "mars" && stats.affection < 35) return "第一眼就討厭";
  if (stats.jealousy >= 55) return "醋意上升";
  if (stats.affection >= 70) return "心動明顯";
  return "關係進行中";
}

export function resolveTrajectory(state) {
  const interventions = (state.history || []).filter((h) => h.kind === "intervention").length;
  const scores = CHARACTERS.map((c) => {
    const stats = state.characters[c.id];
    const aimed = (state.history || []).filter(
      (h) => h.kind === "intervention" && h.targetId === c.id
    ).length;
    const flags = Object.entries(state.flags || {})
      .filter(([, v]) => v)
      .filter(([k]) => k.includes(c.id)).length;
    const unique = stats[c.uniquePrimary] || 0;
    const score =
      stats.affection * 0.35 +
      unique * 0.35 +
      stats.jealousy * 0.1 +
      aimed * 6 +
      flags * 5;
    return { id: c.id, score };
  }).sort((a, b) => b.score - a.score);

  const [lead, second] = scores;
  const gap = lead.score - second.score;
  const derived = computeDerived(state);

  if (derived.fireIndex >= 70 && gap < 12) {
    return {
      type: "conflict",
      label: "走向：後宮失火，沒有人能單獨帶走她",
      leadId: lead.id,
    };
  }
  if (gap >= 14 && interventions >= 2) {
    return {
      type: "leaning",
      label: `走向：現場開始偏向 ${CHARACTER_BY_ID[lead.id].name}，但還沒結束`,
      leadId: lead.id,
    };
  }
  return {
    type: "open",
    label: "走向：觀眾還在認識她們，結局尚未鎖死",
    leadId: null,
  };
}

export { STAT_LABELS };
