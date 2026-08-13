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
];

export function pairKey(a, b) {
  return [a, b].sort().join("-");
}
