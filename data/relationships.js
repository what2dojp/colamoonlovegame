export const MOON_ID = "moon";

export const RELATIONSHIP_PAIRS = [
  { id: "nini-meteor", a: "nini", b: "meteor", tension: 28, note: "永遠擁有 vs 命中注定" },
  { id: "nini-mars", a: "nini", b: "mars", tension: 18, note: "佔有 vs 互相傷害" },
  { id: "nini-pepsi", a: "nini", b: "pepsi", tension: 12, note: "依賴 vs 靈魂理解" },
  { id: "nini-jupiter", a: "nini", b: "jupiter", tension: 14, note: "留下 vs 成全" },
  { id: "meteor-mars", a: "meteor", b: "mars", tension: 24, note: "舊愛 vs 死對頭" },
  { id: "meteor-pepsi", a: "meteor", b: "pepsi", tension: 16, note: "童年默認 vs 平行靈魂" },
  { id: "meteor-jupiter", a: "meteor", b: "jupiter", tension: 10, note: "嘴硬舊愛 vs 安靜追求" },
  { id: "pepsi-jupiter", a: "pepsi", b: "jupiter", tension: 8, note: "不需搶 vs 一直想被選" },
  { id: "pepsi-mars", a: "pepsi", b: "mars", tension: 20, note: "命定靈魂 vs 不信理由" },
  { id: "jupiter-mars", a: "jupiter", b: "mars", tension: 22, note: "克制深情 vs 挑釁吸引" },
  { id: "moon-nini", a: "moon", b: "nini", tension: 22, note: "月月與日日的關係張力" },
  { id: "moon-meteor", a: "moon", b: "meteor", tension: 24, note: "月月與流星的關係張力" },
  { id: "moon-pepsi", a: "moon", b: "pepsi", tension: 16, note: "月月與百事的關係張力" },
  { id: "moon-jupiter", a: "moon", b: "jupiter", tension: 14, note: "月月與木星的關係張力" },
  { id: "moon-mars", a: "moon", b: "mars", tension: 42, note: "月月與火星的關係張力" },
];

export function pairKey(a, b) {
  return [a, b].sort().join("-");
}

export function partyName(id, charactersById = {}) {
  if (id === MOON_ID || id === "moon") return "可樂月月";
  return charactersById[id]?.name || id;
}

export function formatPairLabel(rel, charactersById = {}) {
  const ids = [rel?.a, rel?.b].filter(Boolean);
  const order = [MOON_ID, "nini", "meteor", "pepsi", "jupiter", "mars"];
  ids.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  if (ids.length !== 2) return "";
  return `${partyName(ids[0], charactersById)} ↔ ${partyName(ids[1], charactersById)}`;
}
