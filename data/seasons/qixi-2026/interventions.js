export const SOLO_FLAG_IDS = ["nini", "meteor", "pepsi", "jupiter", "mars"];

export function soloFlag(id) {
  return `solo_active_${id}`;
}

export function activeSoloId(state) {
  return SOLO_FLAG_IDS.find((id) => state.flags?.[soloFlag(id)] === true) || null;
}

const BLOCKED_LEAD_TAGS = new Set([
  "shura",
  "rewrite",
  "letter",
  "memory",
  "peek",
  "intervention",
  "intro",
  "prologue",
  "five-person",
  "five",
  "observation",
  "hub",
  "final",
  "legacy",
]);

export function eventLeadCharacter(event) {
  if (!event || event.hub || event.final || event.intervention) return null;
  const tags = event.tags || [];
  if (tags.some((tag) => BLOCKED_LEAD_TAGS.has(tag))) return null;
  const eventId = String(event.id || "");
  if (eventId.includes("shura") || eventId.startsWith("IV_") || eventId.startsWith("EVENT_rewrite_")) return null;
  const ids = (event.characters || []).filter((id) => SOLO_FLAG_IDS.includes(id));
  if (ids.length !== 1) return null;
  return ids[0];
}

export const SHURA_BY_PAIR = {
  "meteor|nini": ["EVENT_shura_nini_meteor_01", "EVENT_shura_nini_meteor_02"],
  "meteor|pepsi": ["EVENT_shura_pepsi_meteor_01", "EVENT_shura_pepsi_meteor_02"],
  "nini|pepsi": ["EVENT_shura_nini_pepsi_01", "EVENT_shura_nini_pepsi_02"],
  "jupiter|mars": ["EVENT_shura_jupiter_mars_01", "EVENT_shura_jupiter_mars_02"],
  "jupiter|nini": ["EVENT_shura_nini_jupiter_01"],
  "mars|nini": ["EVENT_shura_nini_mars_01"],
  "jupiter|meteor": ["EVENT_shura_meteor_jupiter_01"],
  "mars|meteor": ["EVENT_shura_meteor_mars_01"],
  "jupiter|pepsi": ["EVENT_shura_pepsi_jupiter_01"],
  "mars|pepsi": ["EVENT_shura_pepsi_mars_01"],
};

export function pairShuraKey(a, b) {
  return [a, b].filter(Boolean).sort().join("|");
}

export function shuraIdsForPair(a, b) {
  return SHURA_BY_PAIR[pairShuraKey(a, b)] || [];
}

export const INTERRUPT_LINES = {
  nini: [
    "可樂月月，地下室的晶晶不見了。妳現在過來一下。",
    "可樂月月，我有話只想跟妳說。現在。立刻。",
  ],
  meteor: [
    "可樂月月，那邊那條路……妳還記得嗎。現在跟我過來。",
    "可樂月月，我有件事要問妳。不是當著她的面。",
  ],
  pepsi: [
    "可樂月月。有件事只有妳會懂。跟我離開一下。",
    "可樂月月，我剛才看見一個不該出現的東西。妳過來。",
  ],
  jupiter: [
    "可樂月月，我有話想說。不是現在說的話，之後可能就沒機會了。",
    "可樂月月，外面那杯飲料是妳的。我幫妳拿過來……妳跟我走一下。",
  ],
  mars: [
    "可樂月月，妳過來一下。我有件很重要的事情想跟妳談。",
    "可樂月月！妳看那邊，是不是有飛碟？",
  ],
};

export function pickInterruptLine(characterId, rng = Math.random) {
  const lines = INTERRUPT_LINES[characterId] || INTERRUPT_LINES.mars;
  const index = Math.min(lines.length - 1, Math.max(0, Math.floor(rng() * lines.length)));
  return lines[index];
}

export const INTERVENTIONS = [
  {
    id: "peek",
    name: "偷看命運",
    costKey: "peek",
    eventId: "IV_peek_menu",
    needsTarget: true,
    host: true,
    blurb: "看見不該知道的東西：回憶、秘密，或決定誰收到那封信。",
  },
  {
    id: "encounter",
    name: "碰觸命運",
    costKey: "encounter",
    eventId: "IV_encounter",
    needsTarget: true,
    host: true,
    blurb: "製造月月與指定角色的偶遇／獨處。",
  },
  {
    id: "intervene",
    name: "干涉命運",
    costKey: "intervene",
    eventId: "IV_sabotage",
    needsTarget: true,
    host: true,
    requiresSolo: true,
    blurb: "指定一個人出手，找理由把正在獨處的人支開，搶走下一個鏡頭。",
  },
  {
    id: "force",
    name: "扭轉命運",
    costKey: "force",
    eventId: "IV_force",
    needsTarget: true,
    host: true,
    blurb: "指定一個人加入目前這張角色事件，直接把局面炸成修羅場。",
  },
  {
    id: "rewrite",
    name: "改寫命運",
    costKey: "rewrite",
    eventId: "IV_rewrite",
    needsTarget: false,
    host: true,
    blurb: "隨機選定一人，重新洗牌她的核心數值。",
  },
  {
    id: "letter",
    name: "傳遞情書",
    costKey: "letter",
    eventId: "IV_letter",
    needsTarget: true,
    host: false,
    blurb: "決定誰收到、誰看到、誰誤會那封信。",
  },
  {
    id: "jealousy",
    name: "挑起嫉妒",
    costKey: "jealousy",
    eventId: "IV_jealousy",
    needsTarget: true,
    host: false,
    blurb: "讓下一張事件真正變成醋意／危機。",
  },
  {
    id: "sabotage",
    name: "支開獨處",
    costKey: "sabotage",
    eventId: "IV_sabotage",
    needsTarget: true,
    host: false,
    requiresSolo: true,
    blurb: "指定一個人把正在獨處的人支開。",
  },
  {
    id: "forceEvent",
    name: "扭轉命運",
    costKey: "force",
    eventId: "IV_force",
    needsTarget: true,
    host: false,
    blurb: "指定一個人加入目前事件，強制進入兩人修羅場。",
  },
  {
    id: "rewriteFate",
    name: "改寫命運",
    costKey: "rewrite",
    eventId: "IV_rewrite",
    needsTarget: true,
    host: false,
    blurb: "重新洗牌一名角色的核心數值。不是加點。",
  },
];
