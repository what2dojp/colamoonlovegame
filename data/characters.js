export const CHARACTERS = [
  {
    id: "nini",
    name: "雪碧日日",
    shortName: "日日",
    icon: "🐕",
    drink: "雪碧",
    accent: "#ffb36a",
    role: "黃金獵犬／病嬌／佔有",
    philosophy: "愛是想永遠擁有妳。",
    uniquePrimary: "obsession",
    coreStats: ["affection", "obsession", "jealousy"],
    auxiliaryStats: ["trust", "dependence"],
    audienceStats: ["affection", "obsession"],
    stats: ["affection", "obsession", "jealousy", "trust", "dependence"],
    summary:
      "月月養的黃金獵犬。曾經非常乖巧，帶著娃娃「晶晶」。被一句「那就來住這裡啊」留下之後，把依賴活成了永遠。",
    lore: [
      "日日原本是乖巧可愛的黃金獵犬，也是月月養的狗。",
      "她有一隻很重要的黃金獵犬娃娃：晶晶。晶晶是她純真時期的象徵。",
      "月月曾半開玩笑說：「妳那麼喜歡跟我見面，那就來住這裡啊。」日日真的住進地下室。",
      "她不認為自己變得危險。她認為「月月讓我留下」等於「月月也愛我」。",
    ],
    initial: { affection: 0, obsession: 0, jealousy: 0, trust: 0, dependence: 0 },
    rivalId: "meteor",
    soloEventId: "EVENT_nini_solo_01",
    letterEventId: "EVENT_letter_nini",
    jealousyEventId: "EVENT_nini_jealousy_01",
    crisisEventId: "EVENT_nini_lockbox_01",
    crisisEventId2: "EVENT_nini_dependence_01",
    shuraEventId: "EVENT_shura_nini_meteor_01",
    rewriteEventId: "EVENT_rewrite_nini",
    blockEventId: "EVENT_nini_lockbox_01",
  },
  {
    id: "meteor",
    name: "沙士流星",
    shortName: "流星",
    icon: "🥤",
    drink: "沙士",
    accent: "#7cf7ff",
    role: "青梅竹馬／舊愛／嘴硬",
    philosophy: "我們本來就注定會在一起。",
    uniquePrimary: "destiny",
    coreStats: ["affection", "destiny", "nostalgia", "jealousy"],
    auxiliaryStats: ["pride"],
    audienceStats: ["affection", "destiny"],
    stats: ["affection", "destiny", "nostalgia", "jealousy", "pride"],
    summary:
      "小時候最喜歡的沙士，也是沒有正式告白、卻彼此默認的那個人。打鬧還在，約定也還在。",
    lore: [
      "沙士是月月小時候最喜歡的飲料，流星因此有很深的童年連結。",
      "她們曾經說過「長大我要跟妳結婚。」「好啊。」沒有正式確認，但兩人都當真。",
      "長大後仍像朋友一樣互嗆。她不是正式分手的前任，卻有舊愛的重量。",
      "她相信：妳現在跟誰在一起都沒關係，最後還是會回到我身邊。",
    ],
    initial: { affection: 0, destiny: 0, nostalgia: 0, jealousy: 0, pride: 0 },
    rivalId: "nini",
    soloEventId: "EVENT_meteor_solo_01",
    letterEventId: "EVENT_letter_meteor",
    jealousyEventId: "EVENT_meteor_jealousy_01",
    crisisEventId: "EVENT_meteor_never_broke_up_01",
    crisisEventId2: "EVENT_meteor_jealousy_01",
    shuraEventId: "EVENT_shura_nini_meteor_01",
    rewriteEventId: "EVENT_rewrite_meteor",
    blockEventId: "EVENT_meteor_never_broke_up_01",
  },
  {
    id: "pepsi",
    name: "百事月月",
    shortName: "百事",
    icon: "🌑",
    drink: "百事",
    accent: "#c59bff",
    role: "平行世界的自己／靈魂共鳴",
    philosophy: "靈魂會認出彼此。",
    uniquePrimary: "resonance",
    coreStats: ["affection", "resonance", "similarity", "destiny"],
    auxiliaryStats: [],
    audienceStats: ["affection", "resonance"],
    stats: ["affection", "resonance", "similarity", "destiny"],
    summary:
      "另一個世界的月月。深棕色頭髮。她不搶，因為她相信真正命中注定的人不需要搶。",
    lore: [
      "她不是普通競爭者，而是「如果可樂月月在另一個世界長大，可能成為的那個人」。",
      "外觀很像月月，主要差異是深棕色頭髮。",
      "她知道月月為什麼逃避、嘴硬、猶豫，兩人不需要過度解釋。",
      "她不是病嬌，也不是佔有型。相遇本身，對她來說已經是答案。",
    ],
    initial: { affection: 0, resonance: 0, similarity: 0, destiny: 0 },
    rivalId: "meteor",
    soloEventId: "EVENT_pepsi_solo_01",
    letterEventId: "EVENT_letter_pepsi",
    jealousyEventId: "EVENT_pepsi_jealousy_01",
    crisisEventId: "EVENT_pepsi_identity_01",
    crisisEventId2: "EVENT_pepsi_soul_01",
    shuraEventId: "EVENT_shura_pepsi_meteor_01",
    rewriteEventId: "EVENT_rewrite_pepsi",
    blockEventId: "EVENT_pepsi_identity_01",
  },
  {
    id: "jupiter",
    name: "芬達木星",
    shortName: "木星",
    icon: "🪐",
    drink: "芬達",
    accent: "#ffd56a",
    role: "長期暗戀／深情／克制",
    philosophy: "我想要妳，但我不會要求妳選我。",
    uniquePrimary: "devotion",
    coreStats: ["affection", "devotion", "patience", "jealousy"],
    auxiliaryStats: ["hope"],
    audienceStats: ["affection", "devotion"],
    stats: ["affection", "devotion", "patience", "jealousy", "hope"],
    summary:
      "一直在追月月，只是追法很安靜。她不是朋友線。她想被選，但認為月月不欠她一個答案。",
    lore: [
      "木星長期守護月月：記得她說過的話，在需要時出現，察覺情緒變化。",
      "看到月月跟其他人親近時會吃醋。她有明確的戀愛慾望。",
      "成全不是因為不夠愛，恰恰相反：正因為非常愛，所以尊重選擇。",
      "「我當然難過。可是我喜歡妳，不代表妳欠我一個答案。」",
    ],
    initial: { affection: 0, devotion: 0, patience: 0, jealousy: 0, hope: 0 },
    rivalId: "mars",
    soloEventId: "EVENT_jupiter_quiet_date",
    letterEventId: "EVENT_letter_jupiter",
    jealousyEventId: "EVENT_jupiter_jealousy_01",
    crisisEventId: "EVENT_jupiter_packing_01",
    crisisEventId2: "EVENT_jupiter_hope_low_01",
    shuraEventId: "EVENT_shura_jupiter_mars_01",
    rewriteEventId: "EVENT_rewrite_jupiter",
    blockEventId: "EVENT_jupiter_hope_low_01",
  },
  {
    id: "mars",
    name: "西打火星",
    shortName: "火星",
    icon: "🔥",
    drink: "西打",
    accent: "#ff6a4d",
    role: "死對頭／互相傷害／棋逢對手",
    philosophy: "我不知道為什麼，但我就是喜歡妳。",
    uniquePrimary: "chemistry",
    coreStats: ["affection", "chemistry", "provocation"],
    auxiliaryStats: ["pride"],
    audienceStats: ["affection", "chemistry"],
    stats: ["affection", "chemistry", "provocation", "pride"],
    summary:
      "第一眼就討厭的類型。本該自動避開，卻總被事件撞在一起。互嗆、互坑、又偷偷關心。",
    lore: [
      "核心不是單方面欺負，而是兩個人都有能力傷害對方。",
      "她們互揭短、互相試探、互相吃醋，是渣渣對決，也是棋逢對手。",
      "火星不相信命中注定，會嘲笑流星的約定、百事的靈魂、日日的永遠。",
      "她更接近：我就是喜歡上妳了，哪有那麼多理由。",
    ],
    initial: { affection: 0, chemistry: 0, provocation: 0, pride: 0 },
    rivalId: "jupiter",
    soloEventId: "EVENT_mars_solo_01",
    letterEventId: "EVENT_letter_mars",
    jealousyEventId: "EVENT_mars_jealousy_01",
    crisisEventId: "EVENT_mars_too_close_01",
    crisisEventId2: "EVENT_mars_kings_01",
    shuraEventId: "EVENT_shura_jupiter_mars_01",
    rewriteEventId: "EVENT_rewrite_mars",
    blockEventId: "EVENT_mars_too_close_01",
  },
];

export const CHARACTER_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));

export const CONFLICT_STAT_KEYS = new Set(["jealousy", "provocation"]);

export const STAT_META = {
  affection: { icon: "❤️", label: "好感度", audienceLabel: "親密度", layer: "core", role: "love" },
  obsession: { icon: "🩸", label: "執著度", audienceLabel: "執著度", layer: "core", role: "love" },
  jealousy: { icon: "💢", label: "嫉妒度", audienceLabel: "嫉妒度", layer: "core", role: "conflict" },
  destiny: { icon: "✨", label: "命定感", audienceLabel: "命定感", layer: "core", role: "love" },
  nostalgia: { icon: "🌙", label: "懷舊度", audienceLabel: "懷舊度", layer: "core", role: "love" },
  resonance: { icon: "🌌", label: "靈魂共鳴", audienceLabel: "靈魂共鳴", layer: "core", role: "love" },
  similarity: { icon: "🪞", label: "自我映照", audienceLabel: "自我映照", layer: "core", role: "love" },
  devotion: { icon: "🌙", label: "守護度", audienceLabel: "守護度", layer: "core", role: "love" },
  patience: { icon: "⏳", label: "等待度", audienceLabel: "等待度", layer: "core", role: "love" },
  chemistry: { icon: "🔥", label: "化學反應", audienceLabel: "化學反應", layer: "core", role: "love" },
  provocation: { icon: "💥", label: "挑釁度", audienceLabel: "挑釁度", layer: "core", role: "conflict" },
  trust: { icon: "", label: "信任度", audienceLabel: "信任度", layer: "auxiliary", role: "plot" },
  dependence: { icon: "", label: "依賴度", audienceLabel: "依賴度", layer: "auxiliary", role: "plot" },
  pride: { icon: "", label: "傲氣", audienceLabel: "傲氣", layer: "auxiliary", role: "plot" },
  hope: { icon: "", label: "希望", audienceLabel: "希望", layer: "auxiliary", role: "plot" },
};

export const STAT_LABELS = Object.fromEntries(
  Object.entries(STAT_META).map(([key, meta]) => [key, meta.audienceLabel || meta.label])
);

export const STAT_KEY_ALIASES = {
  destinyBelief: "destiny",
  soulResonance: "resonance",
  understanding: "similarity",
  restraint: "patience",
};

/** Unofficial leftover keys that still need a story effect when events/interventions write them. */
export const UNOFFICIAL_STAT_REDIRECTS = {
  mars: { jealousy: "provocation", tension: null },
};

export function characterCoreStats(def) {
  return def?.coreStats || def?.stats || [];
}

export function characterAuxiliaryStats(def) {
  return def?.auxiliaryStats || [];
}

export function characterAudienceStats(def) {
  if (def?.audienceStats?.length) return def.audienceStats;
  return def?.uniquePrimary ? ["affection", def.uniquePrimary] : ["affection"];
}

export function statMeta(key) {
  return STAT_META[key] || { icon: "", label: STAT_LABELS[key] || key, audienceLabel: STAT_LABELS[key] || key, layer: "core", role: "love" };
}

export function resolveCharacterStatKey(characterId, key) {
  const def = CHARACTER_BY_ID[characterId];
  if (!def || !key) return null;
  if (def.stats.includes(key)) return key;
  const aliased = STAT_KEY_ALIASES[key];
  if (aliased && def.stats.includes(aliased)) return aliased;
  const redirected = UNOFFICIAL_STAT_REDIRECTS[characterId]?.[key];
  if (redirected && def.stats.includes(redirected)) return redirected;
  return null;
}
