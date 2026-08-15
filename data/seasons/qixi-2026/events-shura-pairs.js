import { compileSpecials } from "./events-special-helpers.js";

const CRISIS = {
  nini: "CRISIS_nini_01",
  meteor: "CRISIS_meteor_01",
  pepsi: "CRISIS_pepsi_01",
  jupiter: "CRISIS_jupiter_01",
  mars: "CRISIS_mars_01",
};

function pairConditions(a, b, eventId) {
  return {
    all: [
      { flag: "dynamic_pool_unlocked" },
      { not: { completed: eventId } },
      {
        any: [
          { flag: `forced_${a}` },
          { flag: `forced_${b}` },
          { flag: `date_broken_${a}` },
          { flag: `date_broken_${b}` },
          { flag: `shura_pull_${[a, b].sort().join("-")}` },
        ],
      },
    ],
  };
}

function helpCrisis(characterId) {
  return [
    { type: "flag", key: `shura_helped_${characterId}`, value: true },
    { type: "weightMod", eventId: CRISIS[characterId], value: 18 },
    { type: "forceEvent", eventId: CRISIS[characterId] },
  ];
}

function calmEffects(flag) {
  return [
    { type: "eventStatus", status: "unresolved" },
    { type: "flag", key: flag, value: true },
  ];
}

function continueTo(eventId, flag) {
  const effects = [
    { type: "eventStatus", status: "unresolved" },
    { type: "flag", key: flag, value: true },
  ];
  if (eventId) effects.push({ type: "forceEvent", eventId });
  return effects;
}

function pairOnEnter(a, b, flags, extra = []) {
  return [
    ...flags.map((key) => ({ type: "flag", key, value: true })),
    { type: "tension", pair: `${a}-${b}`, op: "add", value: 10 },
    { type: "weightMod", eventId: CRISIS[a], value: 8 },
    { type: "weightMod", eventId: CRISIS[b], value: 8 },
    ...extra,
  ];
}

export const EXTRA_SHURA_EVENTS = compileSpecials([
  {
    id: "SHURA_nini_jupiter_01",
    character: "nini",
    characters: ["nini", "jupiter"],
    type: "CONFLICT",
    title: "誰比較需要誰？",
    description:
      "日日說木星只是習慣照顧月月。\n木星第一次回答：「如果只是習慣，我早就停止了。」\n日日沉默。\n她抱著晶晶說：「那妳為什麼不直接把她帶走？」\n木星看著月月：「因為我想讓她自己選。」",
    weight: 20,
    tags: ["conflict", "shura", "nini", "jupiter"],
    resultCopy: "💣 日日 × 木星：佔有與克制開始衝撞。",
    intervalCopy: "💣 一個想留下她，一個願意讓她自己決定。",
    onEnter: pairOnEnter("nini", "jupiter", ["shura_nini_jupiter_started"], [
      { type: "log", text: "日日要她留下。木星只把熱飲放好。佔有和成全同時出現。" },
    ]),
    conditions: pairConditions("nini", "jupiter", "SHURA_nini_jupiter_01"),
    choices: [
      { label: "靠近日日", statsBy: { nini: { affection: 7, dependence: 7 }, jupiter: { jealousy: 7, hope: -4 } }, effects: helpCrisis("nini") },
      { label: "靠近木星", statsBy: { jupiter: { affection: 8, devotion: 7 }, nini: { jealousy: 8, obsession: 5 } }, effects: helpCrisis("jupiter") },
      { label: "說「妳們都很重要」", statsBy: { nini: { trust: 5, jealousy: 4 }, jupiter: { hope: 5, jealousy: 4 } }, effects: calmEffects("moon_refuses_public_claim") },
      { label: "反問「那我選誰？」", statsBy: { nini: { obsession: 8, jealousy: 7 }, jupiter: { hope: 8, patience: -6 } }, effects: continueTo(null, "shura_nini_jupiter_unresolved") },
    ],
  },
  {
    id: "SHURA_nini_mars_01",
    character: "nini",
    characters: ["nini", "mars"],
    type: "CONFLICT",
    title: "妳以為妳很了解她？",
    description:
      "火星笑著說日日根本只是把月月關起來。\n日日沒有生氣，只問：「至少她願意留下。」\n火星的笑消失了。\n「那妳有沒有問過她想不想留下？」\n日日第一次真正看向月月。",
    weight: 20,
    tags: ["conflict", "shura", "nini", "mars"],
    resultCopy: "💣 日日 × 火星：佔有與挑釁正式交鋒。",
    intervalCopy: "🔥 今天連火星都沒有在笑。",
    onEnter: pairOnEnter("nini", "mars", ["shura_nini_mars_started"], [
      { type: "log", text: "日日握著鑰匙。火星把火湊近。佔有和挑釁同時升高。" },
    ]),
    conditions: pairConditions("nini", "mars", "SHURA_nini_mars_01"),
    choices: [
      { label: "替日日說話", statsBy: { nini: { affection: 7, obsession: 8 }, mars: { provocation: 7, pride: -5 } }, effects: helpCrisis("nini") },
      { label: "替火星說話", statsBy: { mars: { chemistry: 8, affection: 6 }, nini: { jealousy: 8, trust: -5 } }, effects: helpCrisis("mars") },
      { label: "說「我自己決定」", statsBy: { nini: { trust: 7, obsession: -3 }, mars: { pride: 5, provocation: -3 } }, effects: calmEffects("moon_refuses_public_claim") },
      { label: "故意說兩個都很煩", statsBy: { mars: { chemistry: 7, provocation: 5 }, nini: { affection: 5, jealousy: 6 } }, effects: continueTo(null, "shura_nini_mars_unresolved") },
    ],
  },
  {
    id: "SHURA_meteor_jupiter_01",
    character: "meteor",
    characters: ["meteor", "jupiter"],
    type: "CONFLICT",
    title: "妳等得到她嗎？",
    description:
      "流星問木星：「妳到底打算等多久？」\n木星回答：「直到她告訴我不用等。」\n流星笑了：「那妳永遠等不到。」\n木星第一次回她：「至少我沒有把她的選擇當成自己的約定。」\n空氣瞬間安靜。",
    weight: 20,
    tags: ["conflict", "shura", "meteor", "jupiter"],
    resultCopy: "💣 流星 × 木星：命定與等待正面衝突。",
    intervalCopy: "⏳ 一個相信最後會回來，一個相信答案必須由她自己說。",
    onEnter: pairOnEnter("meteor", "jupiter", ["shura_meteor_jupiter_started"], [
      { type: "log", text: "流星搬出舊路。木星只把外套披上。回憶和照顧同時靠近。" },
    ]),
    conditions: pairConditions("meteor", "jupiter", "SHURA_meteor_jupiter_01"),
    choices: [
      { label: "站木星這邊", statsBy: { jupiter: { affection: 7, devotion: 8 }, meteor: { jealousy: 7, pride: -5 } }, effects: helpCrisis("jupiter") },
      { label: "站流星這邊", statsBy: { meteor: { destiny: 8, nostalgia: 7 }, jupiter: { hope: -6, jealousy: 6 } }, effects: helpCrisis("meteor") },
      { label: "說兩人都太執著", statsBy: { meteor: { pride: -3, jealousy: -3 }, jupiter: { patience: 5, hope: 3 } }, effects: calmEffects("moon_refuses_public_claim") },
      { label: "直接說「我不想被等」", statsBy: { jupiter: { patience: -6, hope: -5 }, meteor: { destiny: -4, affection: 5 } }, effects: continueTo(null, "shura_meteor_jupiter_unresolved") },
    ],
  },
  {
    id: "SHURA_meteor_mars_01",
    character: "meteor",
    characters: ["meteor", "mars"],
    type: "CONFLICT",
    title: "妳那個約定值多少？",
    description:
      "火星嘲笑流星的童年約定。\n「一句小時候說的結婚，就想算一輩子？」\n流星的笑慢慢消失。\n「至少我敢承認自己喜歡她。」\n火星靠近一步：「我也是。」",
    weight: 20,
    tags: ["conflict", "shura", "meteor", "mars"],
    resultCopy: "💣 流星 × 火星：命定與化學反應互相挑釁。",
    intervalCopy: "🔥 一個說命中注定，一個說喜歡根本不需要理由。",
    onEnter: pairOnEnter("meteor", "mars", ["shura_meteor_mars_started"], [
      { type: "log", text: "流星拍瓶蓋。火星把鋒芒亮出來。舊愛和現在的掌聲撞在一起。" },
    ]),
    conditions: pairConditions("meteor", "mars", "SHURA_meteor_mars_01"),
    choices: [
      { label: "支持流星", statsBy: { meteor: { destiny: 8, affection: 6 }, mars: { provocation: 8, pride: -4 } }, effects: helpCrisis("meteor") },
      { label: "支持火星", statsBy: { mars: { chemistry: 8, affection: 7 }, meteor: { jealousy: 8, pride: -5 } }, effects: helpCrisis("mars") },
      { label: "說約定和現在都重要", statsBy: { meteor: { nostalgia: 6, jealousy: 4 }, mars: { chemistry: 5, provocation: 4 } }, effects: calmEffects("moon_refuses_public_claim") },
      { label: "說「那妳們都告白啊」", statsBy: { meteor: { affection: 7, pride: -5 }, mars: { affection: 7, pride: -5 } }, effects: continueTo(null, "shura_meteor_mars_unresolved") },
    ],
  },
  {
    id: "SHURA_pepsi_jupiter_01",
    character: "pepsi",
    characters: ["pepsi", "jupiter"],
    type: "CONFLICT",
    title: "妳太懂她了",
    description:
      "木星第一次對百事露出戒心。\n「妳總是知道她想要什麼。」\n百事回答：「因為她和我很像。」\n木星沉默了一會兒：「那妳有沒有想過，她也需要有人不只是理解她？」\n百事沒有立刻回答。",
    weight: 20,
    tags: ["conflict", "shura", "pepsi", "jupiter"],
    resultCopy: "💣 百事 × 木星：理解與守護發生衝突。",
    intervalCopy: "🌌 一個想成為最懂妳的人，一個只想成為最可靠的人。",
    onEnter: pairOnEnter("pepsi", "jupiter", ["shura_pepsi_jupiter_started"], [
      { type: "log", text: "百事說靈魂會自己靠近。木星說等待不是沒有喜歡。" },
    ]),
    conditions: pairConditions("pepsi", "jupiter", "SHURA_pepsi_jupiter_01"),
    choices: [
      { label: "支持百事", statsBy: { pepsi: { resonance: 8, similarity: 7 }, jupiter: { jealousy: 8, hope: -4 } }, effects: helpCrisis("pepsi") },
      { label: "支持木星", statsBy: { jupiter: { devotion: 8, affection: 6 }, pepsi: { destiny: 5, resonance: -4 } }, effects: helpCrisis("jupiter") },
      { label: "說兩人都有道理", statsBy: { pepsi: { resonance: 5, destiny: 3 }, jupiter: { patience: 5, jealousy: 3 } }, effects: calmEffects("moon_refuses_public_claim") },
      { label: "問百事「妳真的懂我嗎？」", statsBy: { pepsi: { similarity: 8, affection: 6 }, jupiter: { jealousy: 6 } }, effects: continueTo("SHURA_pepsi_jupiter_02", "shura_pepsi_jupiter_unresolved") },
    ],
  },
  {
    id: "SHURA_pepsi_jupiter_02",
    character: "pepsi",
    characters: ["pepsi", "jupiter"],
    type: "CRISIS",
    title: "她需要的是誰？",
    description:
      "百事說月月不需要被照顧，她只是需要有人理解。\n木星回答：「我知道。」\n百事看向她：「知道，和陪她走過去不一樣。」\n木星沒有反駁。\n她只是握緊月月手裡的東西。",
    weight: 24,
    tags: ["crisis", "shura", "pepsi", "jupiter"],
    resultCopy: "💣 百事 × 木星：理解與陪伴的定義發生衝突。",
    intervalCopy: "🌙 有人想讀懂妳，有人想陪妳活完讀懂之後的每一天。",
    onEnter: [
      { type: "flag", key: "shura_pepsi_jupiter_escalated", value: true },
      { type: "tension", pair: "pepsi-jupiter", op: "add", value: 10 },
      { type: "weightMod", eventId: "CRISIS_pepsi_01", value: 12 },
      { type: "weightMod", eventId: "CRISIS_jupiter_01", value: 12 },
    ],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "SHURA_pepsi_jupiter_02" } },
        {
          any: [
            { unresolved: "SHURA_pepsi_jupiter_01" },
            { completed: "SHURA_pepsi_jupiter_01" },
            { flag: "forced_pepsi" },
            { flag: "forced_jupiter" },
          ],
        },
      ],
    },
    choices: [
      { label: "選擇百事", statsBy: { pepsi: { resonance: 8, affection: 6 }, jupiter: { jealousy: 8, hope: -5 } }, effects: helpCrisis("pepsi") },
      { label: "選擇木星", statsBy: { jupiter: { devotion: 8, affection: 7 }, pepsi: { resonance: -5, destiny: 5 } }, effects: helpCrisis("jupiter") },
      { label: "說兩人都需要", statsBy: { pepsi: { similarity: 5, destiny: 3 }, jupiter: { patience: 5, hope: 3 } }, effects: calmEffects("moon_refuses_public_claim") },
      { label: "問她們誰更了解妳", statsBy: { pepsi: { resonance: 7, affection: 5 }, jupiter: { jealousy: 7, affection: 5 } }, effects: continueTo(null, "shura_pepsi_jupiter_mutual") },
    ],
  },
  {
    id: "SHURA_pepsi_mars_01",
    character: "pepsi",
    characters: ["pepsi", "mars"],
    type: "CONFLICT",
    title: "妳跟她真的很像",
    description:
      "火星看著百事和月月同步的動作，忍不住笑。\n「所以妳是她的複製品？」\n百事回答：「不是。」\n火星靠近她：「那證明給我看。」\n百事第一次沒有退開。",
    weight: 20,
    tags: ["conflict", "shura", "pepsi", "mars"],
    resultCopy: "💣 百事 × 火星：共鳴與挑釁正式碰撞。",
    intervalCopy: "🔥 有人想看穿靈魂，有人只想把對方逼到承認心跳。",
    onEnter: pairOnEnter("pepsi", "mars", ["shura_pepsi_mars_started"], [
      { type: "log", text: "百事不搶。火星偏要站進來。命定和不講理打在同一張臉上。" },
    ]),
    conditions: pairConditions("pepsi", "mars", "SHURA_pepsi_mars_01"),
    choices: [
      { label: "站百事這邊", statsBy: { pepsi: { resonance: 8, similarity: 8 }, mars: { provocation: 14 } }, effects: helpCrisis("pepsi") },
      { label: "站火星這邊", statsBy: { mars: { chemistry: 9, affection: 6 }, pepsi: { resonance: -5, destiny: 4 } }, effects: helpCrisis("mars") },
      { label: "讓兩人繼續鬥嘴", statsBy: { mars: { chemistry: 7, provocation: 6 }, pepsi: { resonance: 6, similarity: 4 } }, effects: calmEffects("moon_refuses_public_claim") },
      { label: "說「你們兩個都很像在吃醋」", statsBy: { mars: { provocation: 7, pride: -4 }, pepsi: { destiny: 5, affection: 4 } }, effects: continueTo(null, "shura_pepsi_mars_unresolved") },
    ],
  },
]);
