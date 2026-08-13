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
  const jealousies = CHARACTERS.map((c) => state.characters[c.id]?.jealousy).filter(
    (value) => typeof value === "number"
  );
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

  if (id === "nini" && unique >= 55 && stats.trust < 50) return "危險病嬌";
  if (id === "nini" && unique >= 55) return "病嬌佔有";
  if (id === "nini" && stats.dependence >= 70) return "不能沒有妳";
  if (id === "nini" && stats.trust >= 70) return "忠誠依賴";
  if (id === "meteor" && stats.destiny >= 78) return "命定確信";
  if (id === "meteor" && stats.pride >= 60) return "嘴硬舊愛";
  if (id === "pepsi" && stats.resonance >= 80) return "靈魂共鳴";
  if (id === "pepsi") return "不必搶她";
  if (id === "jupiter" && stats.devotion >= 80 && stats.hope <= 40) return "溫柔心碎";
  if (id === "jupiter" && stats.hope < 55) return "成全但不走";
  if (id === "jupiter" && stats.devotion >= 85) return "安靜地追求";
  if (id === "mars" && stats.chemistry >= 55 && stats.provocation >= 70) return "互相傷害";
  if (id === "mars" && stats.affection < 35) return "第一眼就討厭";
  if (typeof stats.jealousy === "number" && stats.jealousy >= 55) return "醋意上升";
  if (stats.affection >= 70) return "心動明顯";
  return "關係進行中";
}

export { STAT_LABELS };
