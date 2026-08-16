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

function pairOnEnter(a, b, flags, extra = []) {
  return [
    ...flags.map((key) => ({ type: "flag", key, value: true })),
    { type: "tension", pair: `${a}-${b}`, op: "add", value: 10 },
    { type: "weightMod", eventId: CRISIS[a], value: 8 },
    { type: "weightMod", eventId: CRISIS[b], value: 8 },
    ...extra,
  ];
}

function laterPairConditions(a, b, eventId, previousIds = []) {
  const conditions = pairConditions(a, b, eventId);
  conditions.all[2].any.push(...previousIds.map((id) => ({ completed: id })));
  return conditions;
}

function siblingConditions(a, b, eventId) {
  if (String(eventId).endsWith("_03")) {
    const prefix = String(eventId).replace(/_03$/, "");
    return laterPairConditions(a, b, eventId, [`${prefix}_01`, `${prefix}_02`]);
  }
  return pairConditions(a, b, eventId);
}

function withPull(a, b, extraAny = []) {
  return [{ flag: `shura_pull_${[a, b].sort().join("-")}` }, ...extraAny];
}

const NINI_METEOR_01 = {
  all: [
    { flag: "dynamic_pool_unlocked" },
    { not: { completed: "SHURA_nini_meteor_01" } },
    {
      any: [
        { flag: "letter_misread_by_nini" },
        { flag: "letter_misread_by_meteor" },
        { flag: "date_broken_nini" },
        { flag: "date_broken_meteor" },
        { flag: "forced_nini" },
        { flag: "forced_meteor" },
        ...withPull("nini", "meteor"),
        {
          all: [
            { any: [{ flag: "nini_allowed_stay" }, { completed: "EVENT_nini_obsession_01" }] },
            { completed: "EVENT_meteor_nostalgia_01" },
          ],
        },
      ],
    },
  ],
};

const NINI_METEOR_02 = {
  all: [
    { flag: "dynamic_pool_unlocked" },
    { not: { completed: "SHURA_nini_meteor_02" } },
    {
      any: [
        { unresolved: "SHURA_nini_meteor_01" },
        { completed: "SHURA_nini_meteor_01" },
        { flag: "public_jealous_nini" },
        { flag: "public_jealous_meteor" },
        { flag: "forced_nini" },
        { flag: "forced_meteor" },
        ...withPull("nini", "meteor"),
      ],
    },
  ],
};

const METEOR_PEPSI_01 = {
  all: [
    { flag: "dynamic_pool_unlocked" },
    { not: { completed: "SHURA_meteor_pepsi_01" } },
    {
      any: [
        { flag: "letter_misread_by_meteor" },
        { flag: "date_broken_pepsi" },
        { flag: "date_broken_meteor" },
        { flag: "forced_pepsi" },
        { flag: "forced_meteor" },
        ...withPull("meteor", "pepsi"),
        {
          all: [
            { completed: "EVENT_meteor_nostalgia_01" },
            {
              any: [{ completed: "EVENT_pepsi_soul_01" }, { completed: "EVENT_pepsi_understanding_01" }],
            },
          ],
        },
      ],
    },
  ],
};

const METEOR_PEPSI_02 = {
  all: [
    { flag: "dynamic_pool_unlocked" },
    { not: { completed: "SHURA_meteor_pepsi_02" } },
    {
      any: [
        { completed: "SHURA_meteor_pepsi_01" },
        { flag: "fate_rewritten_pepsi" },
        { flag: "fate_rewritten_meteor" },
        { flag: "public_jealous_pepsi" },
        { flag: "public_jealous_meteor" },
        { flag: "forced_pepsi" },
        { flag: "forced_meteor" },
        ...withPull("meteor", "pepsi"),
      ],
    },
  ],
};

const NINI_PEPSI_01 = {
  all: [
    { flag: "dynamic_pool_unlocked" },
    { not: { completed: "SHURA_nini_pepsi_01" } },
    {
      any: [
        { flag: "letter_misread_by_nini" },
        { flag: "date_broken_nini" },
        { flag: "date_broken_pepsi" },
        { flag: "forced_nini" },
        { flag: "forced_pepsi" },
        ...withPull("nini", "pepsi"),
        {
          all: [
            { completed: "EVENT_pepsi_understanding_01" },
            {
              any: [{ completed: "EVENT_nini_obsession_01" }, { completed: "EVENT_nini_jealousy_01" }],
            },
          ],
        },
      ],
    },
  ],
};

const NINI_PEPSI_02 = {
  all: [
    { flag: "dynamic_pool_unlocked" },
    { not: { completed: "SHURA_nini_pepsi_02" } },
    {
      any: [
        { unresolved: "SHURA_nini_pepsi_01" },
        { completed: "SHURA_nini_pepsi_01" },
        { flag: "forced_nini" },
        { flag: "forced_pepsi" },
        ...withPull("nini", "pepsi"),
      ],
    },
  ],
};

const JUPITER_MARS_01 = {
  all: [
    { flag: "dynamic_pool_unlocked" },
    { not: { completed: "SHURA_jupiter_mars_01" } },
    {
      any: [
        { flag: "date_broken_jupiter" },
        { flag: "date_broken_mars" },
        { flag: "letter_misread_by_mars" },
        { flag: "letter_misread_by_jupiter" },
        { flag: "fate_rewritten_mars" },
        { flag: "forced_jupiter" },
        { flag: "forced_mars" },
        ...withPull("jupiter", "mars"),
      ],
    },
  ],
};

const JUPITER_MARS_02 = {
  all: [
    { flag: "dynamic_pool_unlocked" },
    { not: { completed: "SHURA_jupiter_mars_02" } },
    {
      any: [
        { completed: "SHURA_jupiter_mars_01" },
        {
          all: [{ flag: "jupiter_packing_started" }, { not: { flag: "mars_walked" } }],
        },
        { flag: "forced_jupiter" },
        { flag: "forced_mars" },
        ...withPull("jupiter", "mars"),
      ],
    },
  ],
};

function card({
  id,
  a,
  b,
  type = "CONFLICT",
  weight = 20,
  title,
  story,
  interval,
  conditions,
  flags = [],
  extraOnEnter = [],
  choices,
}) {
  return {
    id,
    character: a,
    characters: [a, b],
    type,
    title,
    description: story,
    weight,
    tags: ["conflict", "shura", a, b, ...(type === "CRISIS" ? ["crisis"] : [])],
    resultCopy: `💣 ${title}`,
    intervalCopy: interval,
    onEnter: pairOnEnter(a, b, flags, extraOnEnter),
    conditions: conditions || siblingConditions(a, b, id),
    choices,
  };
}

export const SHURA_PACK_EVENTS = compileSpecials([
  card({
    id: "SHURA_nini_meteor_01",
    a: "nini",
    b: "meteor",
    title: "那張紙條還在",
    story:
      "流星在月月面前拿出一張已經泛黃的紙條。\n日日原本還在笑，看見紙條後卻把晶晶抱得更緊。\n流星說：「這個，她應該還記得吧？」\n日日看著她，沒有接話，只慢慢站到了月月身邊。\n月月忽然發現，自己好像被夾在了兩段不同的回憶中間。",
    interval: "⚠️ 一張舊紙條，讓兩個人的過去同時浮了上來。",
    conditions: NINI_METEOR_01,
    flags: ["shura_nini_meteor_started", "nini_meteor_both_lines_hardened"],
    extraOnEnter: [{ type: "log", text: "一張舊紙條同時叫醒了兩段不同的過去。" }],
    choices: [
      { label: "接過流星的紙條", statsBy: { meteor: { affection: 8, nostalgia: 8 }, nini: { jealousy: 6 } } },
      { label: "握住日日的手", statsBy: { nini: { affection: 8, obsession: 5 }, meteor: { jealousy: 6 } } },
      { label: "兩邊都不選", statsBy: { nini: { jealousy: 3, affection: -2 }, meteor: { pride: 4 } } },
      { label: "問她們到底在爭什麼", statsBy: { meteor: { pride: -3, nostalgia: 5 }, nini: { trust: 4 } } },
    ],
  }),
  card({
    id: "SHURA_nini_meteor_02",
    a: "nini",
    b: "meteor",
    type: "CRISIS",
    weight: 24,
    title: "妳說過會等我的",
    story:
      "流星忽然對月月說：「妳以前答應過我的。」\n日日皺起眉頭：「以前的事情，不能拿來要求現在。」\n流星笑了一下，卻沒有反駁。\n月月還沒來得及說話，日日已經問：「那現在呢？」\n空氣瞬間安靜下來，兩個人都在等月月回答。",
    interval: "🔥 過去的約定開始和現在的感情正面撞上。",
    conditions: NINI_METEOR_02,
    flags: ["shura_nini_meteor_escalated"],
    choices: [
      { label: "「我記得。」", statsBy: { meteor: { destiny: 10, affection: 5 }, nini: { jealousy: 7 } } },
      { label: "「那只是小時候。」", statsBy: { meteor: { nostalgia: -6, pride: -5 }, nini: { trust: 5 } } },
      { label: "「我現在不知道。」", statsBy: { meteor: { pride: 5, affection: -2 }, nini: { dependence: 4, affection: -2 } } },
      { label: "「妳們都不要逼我。」", statsBy: { nini: { trust: 7, jealousy: -3 }, meteor: { pride: -4 } } },
    ],
  }),
  card({
    id: "SHURA_nini_meteor_03",
    a: "nini",
    b: "meteor",
    title: "誰比較了解她？",
    story:
      "日日忽然問流星：「妳知道她喝咖啡會加多少糖嗎？」\n流星毫不猶豫地回答：「兩匙，而且第三口之後就會嫌太甜。」\n日日愣了一下，接著說：「……這個我也知道。」\n兩個人第一次沒有互嗆，而是同時看向月月。\n月月突然覺得，這場比賽似乎沒有裁判。",
    interval: "⚠️ 兩個人都開始意識到，自己知道的事情可能比想像中更多。",
    conditions: laterPairConditions("nini", "meteor", "SHURA_nini_meteor_03", [
      "SHURA_nini_meteor_01",
      "SHURA_nini_meteor_02",
    ]),
    choices: [
      { label: "說日日答對了", statsBy: { nini: { affection: 7, obsession: 4 }, meteor: { jealousy: 7 } } },
      { label: "說流星答對了", statsBy: { meteor: { affection: 7, nostalgia: 4 }, nini: { jealousy: 7 } } },
      { label: "說「妳們都很了解我」", statsBy: { nini: { affection: 3, jealousy: 4 }, meteor: { affection: 3, jealousy: 4 } } },
      { label: "故意說錯答案", statsBy: { nini: { trust: -4, jealousy: 3 }, meteor: { pride: -4, jealousy: 3 } } },
    ],
  }),

  card({
    id: "SHURA_nini_pepsi_01",
    a: "nini",
    b: "pepsi",
    title: "她為什麼知道？",
    story:
      "百事只看了月月一眼，就說：「妳現在不想說話。」\n日日立刻問：「妳怎麼知道？」\n百事沒有回答，只是把月月手邊的飲料推近了一點。\n日日盯著她的動作，表情第一次變得不安。\n因為那個動作，她以前也做過。",
    interval: "⚠️ 日日第一次遇到一個不需要她解釋就能理解月月的人。",
    conditions: NINI_PEPSI_01,
    flags: ["shura_nini_pepsi_started", "nini_reads_pepsi_as_theft", "pepsi_did_not_counter"],
    extraOnEnter: [{ type: "log", text: "日日把理解聽成搶走內心。百事沒有反擊。" }],
    choices: [
      { label: "問百事怎麼知道", statsBy: { pepsi: { resonance: 7 }, nini: { jealousy: 6 } } },
      { label: "讓百事繼續說", statsBy: { pepsi: { affection: 8, similarity: 5 }, nini: { obsession: 5 } } },
      { label: "站到日日身邊", statsBy: { nini: { affection: 7, trust: 4 }, pepsi: { destiny: 5 } } },
      { label: "說「其實她一直都知道」", statsBy: { pepsi: { resonance: 8 }, nini: { jealousy: 8 } } },
    ],
  }),
  card({
    id: "SHURA_nini_pepsi_02",
    a: "nini",
    b: "pepsi",
    type: "CRISIS",
    weight: 24,
    title: "兩個月月",
    story:
      "百事站在鏡子前，和月月並肩而立。\n日日看著兩個幾乎相似的身影，忽然問：「妳到底是誰？」\n百事轉過頭：「這個問題，她自己最清楚。」\n日日沒有笑，只是更靠近月月。\n月月第一次覺得，這場對話好像沒有任何一個正確答案。",
    interval: "🌑 有些修羅場最可怕的地方，是兩個人都覺得自己最懂她。",
    conditions: NINI_PEPSI_02,
    flags: ["shura_nini_pepsi_escalated"],
    choices: [
      { label: "站到百事旁邊", statsBy: { pepsi: { affection: 8, similarity: 7 }, nini: { jealousy: 8 } } },
      { label: "站到日日旁邊", statsBy: { nini: { affection: 8, obsession: 6 }, pepsi: { resonance: -4 } } },
      { label: "讓她們自己吵", statsBy: { nini: { jealousy: 5, affection: -2 }, pepsi: { destiny: 5, affection: -2 } } },
      { label: "說「我就是我」", statsBy: { nini: { trust: 6, jealousy: 3 }, pepsi: { resonance: 6, affection: 2 } } },
    ],
  }),
  card({
    id: "SHURA_nini_pepsi_03",
    a: "nini",
    b: "pepsi",
    title: "晶晶的位置",
    story:
      "日日把晶晶放在月月旁邊的位置上。\n百事看了一眼，卻把另一個小東西放到晶晶旁邊。\n日日問：「妳也有這種東西？」\n百事回答：「她以前送我的。」\n日日的笑容停了半秒，手指默默抓緊晶晶。",
    interval: "⚠️ 晶晶沒有被拿走，但日日顯然已經把它當成了戰利品。",
    flags: ["shura_nini_pepsi_03"],
    choices: [
      { label: "問百事那是什麼", statsBy: { pepsi: { resonance: 7 }, nini: { jealousy: 6 } } },
      { label: "把晶晶拿回來", statsBy: { nini: { obsession: 7, affection: 5 }, pepsi: { destiny: 5 } } },
      { label: "讓兩個東西放在一起", statsBy: { pepsi: { affection: 6 }, nini: { jealousy: 8 } } },
      { label: "說「我完全不記得」", statsBy: { pepsi: { resonance: -6 }, nini: { trust: -3, jealousy: 4 } } },
    ],
  }),

  card({
    id: "SHURA_nini_jupiter_01",
    a: "nini",
    b: "jupiter",
    title: "她不會讓妳失望",
    story:
      "木星替月月整理好桌上的東西。\n日日在旁邊看了一會兒，忽然問：「妳為什麼什麼都知道？」\n木星笑著說：「因為我一直都有記得。」\n日日抱緊晶晶：「我也記得。」\n兩個人第一次用完全不同的方式，說出了同一句話。",
    interval: "⚠️ 一個在照顧，一個在佔有，她們愛人的方式完全不同。",
    flags: ["shura_nini_jupiter_started"],
    extraOnEnter: [{ type: "log", text: "日日要她留下。木星只把熱飲放好。佔有和成全同時出現。" }],
    choices: [
      { label: "感謝木星", statsBy: { jupiter: { affection: 7, devotion: 7 }, nini: { jealousy: 5 } } },
      { label: "抱抱日日", statsBy: { nini: { affection: 8, dependence: 5 }, jupiter: { jealousy: 6 } } },
      { label: "說「妳們都很溫柔」", statsBy: { nini: { affection: 3, jealousy: 4 }, jupiter: { affection: 3, jealousy: 4 } } },
      { label: "自己整理東西", statsBy: { jupiter: { patience: 5, affection: -2 }, nini: { trust: 4, affection: -2 } } },
    ],
  }),
  card({
    id: "SHURA_nini_jupiter_02",
    a: "nini",
    b: "jupiter",
    type: "CRISIS",
    weight: 24,
    title: "妳不用一直讓著她",
    story:
      "日日故意把月月的東西藏起來。\n木星沒有生氣，只是安靜地把東西找回來。\n日日問：「妳不生氣嗎？」\n木星回答：「我只是覺得，她應該自己決定。」\n日日第一次露出了真正不高興的表情。",
    interval: "⚠️ 木星沒有離開，她只是第一次讓日日知道，溫柔也可以有底線。",
    flags: ["shura_nini_jupiter_escalated"],
    choices: [
      { label: "說木星說得對", statsBy: { jupiter: { devotion: 8 }, nini: { jealousy: 6, affection: -3 } } },
      { label: "替日日說話", statsBy: { nini: { affection: 8, obsession: 5 }, jupiter: { hope: -5 } } },
      { label: "要日日把東西還回來", statsBy: { nini: { trust: 5, dependence: -3 }, jupiter: { patience: 4 } } },
      { label: "什麼都不說", statsBy: { nini: { jealousy: 5 }, jupiter: { jealousy: 5, hope: -3 } } },
    ],
  }),
  card({
    id: "SHURA_nini_jupiter_03",
    a: "nini",
    b: "jupiter",
    title: "她到底需要誰？",
    story:
      "月月不小心說自己今天很累。\n日日立刻說：「那我陪妳。」\n木星則已經把熱水和毯子放到了桌上。\n日日看著那些東西，忽然說：「我也可以做。」\n木星只回答：「我知道。」",
    interval: "⚠️ 兩個人都想照顧她，只是其中一個開始不想再讓。",
    flags: ["shura_nini_jupiter_03"],
    choices: [
      { label: "讓日日照顧", statsBy: { nini: { affection: 8, dependence: 6 }, jupiter: { jealousy: 7 } } },
      { label: "接過木星準備的東西", statsBy: { jupiter: { affection: 8, devotion: 6 }, nini: { jealousy: 7 } } },
      { label: "說「我想自己休息」", statsBy: { nini: { trust: -3, affection: -2 }, jupiter: { patience: 5, affection: -2 } } },
      { label: "讓兩個人一起照顧", statsBy: { nini: { affection: 4, jealousy: 5 }, jupiter: { affection: 4, jealousy: 5 } } },
    ],
  }),

  card({
    id: "SHURA_nini_mars_01",
    a: "nini",
    b: "mars",
    title: "妳敢碰她？",
    story:
      "火星伸手替月月整理了一下頭髮。\n日日立刻抓住她的手腕。\n火星卻笑著問：「怎麼？吃醋？」\n日日沒有回答，只把月月拉到自己身後。\n火星看著她，笑得更開心了。",
    interval: "🔥 火星笑得很開心，日日卻已經不想笑了。",
    flags: ["shura_nini_mars_started"],
    extraOnEnter: [{ type: "log", text: "火星碰了月月的頭髮。日日抓住她的手腕。" }],
    choices: [
      { label: "站在日日身後", statsBy: { nini: { obsession: 8, jealousy: 9 }, mars: { provocation: 6 } } },
      { label: "拉住火星", statsBy: { mars: { chemistry: 8, affection: 6 }, nini: { jealousy: 8 } } },
      { label: "說「日日，她只是幫我整理頭髮」", statsBy: { nini: { trust: 5, jealousy: -3 }, mars: { pride: -4 } } },
      { label: "說「火星，再靠近一點」", statsBy: { mars: { chemistry: 10, provocation: 8 }, nini: { jealousy: 10 } } },
    ],
  }),
  card({
    id: "SHURA_nini_mars_02",
    a: "nini",
    b: "mars",
    type: "CRISIS",
    weight: 24,
    title: "妳輸不起嗎？",
    story:
      "火星故意坐到月月旁邊。\n日日看了一眼，直接把自己的椅子拖過去。\n火星說：「這麼怕輸？」\n日日回答：「我沒有在比賽。」\n火星笑著說：「可是妳看起來很像。」",
    interval: "💥 沒有人承認自己在競爭，但所有人都已經坐到賽道上了。",
    flags: ["shura_nini_mars_escalated"],
    choices: [
      { label: "說日日不是在比賽", statsBy: { nini: { affection: 6, trust: 4 }, mars: { provocation: 5 } } },
      { label: "說火星說得有道理", statsBy: { mars: { chemistry: 7 }, nini: { jealousy: 7 } } },
      { label: "讓兩人繼續競爭", statsBy: { nini: { jealousy: 8, affection: 3 }, mars: { provocation: 8, affection: 3 } } },
      { label: "坐到兩人中間", statsBy: { nini: { jealousy: 4, obsession: 3 }, mars: { chemistry: 5, pride: 3 } } },
    ],
  }),
  card({
    id: "SHURA_nini_mars_03",
    a: "nini",
    b: "mars",
    title: "妳喜歡她哪裡？",
    story:
      "火星突然問日日：「妳到底喜歡她什麼？」\n日日毫不猶豫地回答：「全部。」\n火星愣了一下，反而轉頭問月月：「那妳呢？」\n日日第一次沒有替月月回答。\n三個人的視線同時落在月月身上。",
    interval: "⚠️ 這一次，連火星都沒有立刻開玩笑。",
    flags: ["shura_nini_mars_03"],
    choices: [
      { label: "說「日日的全部」", statsBy: { nini: { affection: 10, obsession: 8 }, mars: { provocation: 10 } } },
      { label: "說「火星的自信」", statsBy: { mars: { affection: 10, chemistry: 8 }, nini: { jealousy: 10 } } },
      { label: "說「我不知道」", statsBy: { nini: { affection: -3, jealousy: 5 }, mars: { affection: -3, provocation: 5 } } },
      { label: "反問火星喜歡什麼", statsBy: { mars: { pride: 6, chemistry: 6 }, nini: { jealousy: 7 } } },
    ],
  }),

  card({
    id: "SHURA_meteor_pepsi_01",
    a: "meteor",
    b: "pepsi",
    title: "妳也相信命中注定？",
    story:
      "流星問百事：「妳也覺得她是命中注定的？」\n百事回答：「我只是覺得，我們會遇見彼此不是巧合。」\n流星笑了一聲：「聽起來跟我差不多。」\n百事看著她：「不一樣。」\n兩個人第一次因為同一個詞，產生了完全不同的理解。",
    interval: "🌙 一個相信約定，一個相信相遇，偏偏她們都把月月放在答案裡。",
    conditions: METEOR_PEPSI_01,
    flags: ["meteor_pressed_time", "pepsi_rejected_early_equals_same"],
    extraOnEnter: [{ type: "log", text: "流星用時間壓百事。百事提出「早不是同一件事。」" }],
    choices: [
      { label: "支持流星", statsBy: { meteor: { destiny: 9, affection: 5 }, pepsi: { destiny: 6 } } },
      { label: "支持百事", statsBy: { pepsi: { destiny: 9, resonance: 6 }, meteor: { jealousy: 7 } } },
      { label: "說「我覺得都很浪漫」", statsBy: { meteor: { affection: 3, jealousy: 5 }, pepsi: { affection: 3, destiny: 5 } } },
      { label: "問她們到底差在哪裡", statsBy: { meteor: { pride: -3, destiny: 4 }, pepsi: { resonance: 5, destiny: 4 } } },
    ],
  }),
  card({
    id: "SHURA_meteor_pepsi_02",
    a: "meteor",
    b: "pepsi",
    type: "CRISIS",
    weight: 24,
    title: "妳知道她以前嗎？",
    story:
      "流星開始講起月月小時候的事情。\n百事安靜地聽完，卻補上了流星不知道的另一半。\n流星的笑容慢慢消失。\n百事說：「妳知道的是她的過去，我知道的是她現在。」\n兩個人第一次真正開始比較彼此的位置。",
    interval: "⚠️ 「了解一個人」從來不是只有一種方式。",
    conditions: METEOR_PEPSI_02,
    flags: ["shura_meteor_pepsi_escalated"],
    choices: [
      { label: "說流星知道得比較多", statsBy: { meteor: { nostalgia: 9, affection: 5 }, pepsi: { destiny: 7 } } },
      { label: "說百事理解得比較深", statsBy: { pepsi: { resonance: 9, affection: 5 }, meteor: { jealousy: 7 } } },
      { label: "說兩個人都很重要", statsBy: { meteor: { affection: 4, jealousy: 4 }, pepsi: { affection: 4, destiny: 4 } } },
      { label: "不讓她們繼續比較", statsBy: { meteor: { pride: -4, nostalgia: 4 }, pepsi: { destiny: -3 } } },
    ],
  }),
  card({
    id: "SHURA_meteor_pepsi_03",
    a: "meteor",
    b: "pepsi",
    title: "她會選誰？",
    story:
      "流星突然問：「如果她今天只能選一個呢？」\n百事沒有回答，只看著月月。\n流星也轉過頭，第一次沒有替她做決定。\n月月被兩個人同時注視著，卻不知道該先回答誰。\n安靜的幾秒鐘，比爭吵更像修羅場。",
    interval: "💥 這一次，沒有人笑得出來。",
    flags: ["shura_meteor_pepsi_03"],
    choices: [
      { label: "看向流星", statsBy: { meteor: { affection: 8, destiny: 6 }, pepsi: { destiny: 8 } } },
      { label: "看向百事", statsBy: { pepsi: { affection: 8, resonance: 6 }, meteor: { jealousy: 8 } } },
      { label: "說「我不要選」", statsBy: { meteor: { pride: 5, affection: -2 }, pepsi: { destiny: 5, affection: -2 } } },
      { label: "轉身離開", statsBy: { meteor: { jealousy: 6, pride: -3 }, pepsi: { destiny: 6, resonance: -3 } } },
    ],
  }),

  card({
    id: "SHURA_meteor_jupiter_01",
    a: "meteor",
    b: "jupiter",
    title: "她值得被好好對待",
    story:
      "流星說：「她以前就很容易逞強。」\n木星回答：「我知道。」\n流星看著她：「妳知道多少？」\n木星沒有炫耀，只說：「至少我知道她現在需要休息。」\n流星第一次沒有立刻反駁。",
    interval: "🌙 一個記得她，一個守著她。",
    flags: ["shura_meteor_jupiter_started"],
    extraOnEnter: [{ type: "log", text: "一個記得她，一個守著她。" }],
    choices: [
      { label: "讓木星照顧", statsBy: { jupiter: { devotion: 8, affection: 6 }, meteor: { jealousy: 6 } } },
      { label: "讓流星陪伴", statsBy: { meteor: { nostalgia: 7, affection: 6 }, jupiter: { jealousy: 7 } } },
      { label: "兩個都留下", statsBy: { meteor: { affection: 4, jealousy: 5 }, jupiter: { affection: 4, jealousy: 5 } } },
      { label: "自己處理", statsBy: { jupiter: { patience: 5, affection: -2 }, meteor: { pride: 4, affection: -2 } } },
    ],
  }),
  card({
    id: "SHURA_meteor_jupiter_02",
    a: "meteor",
    b: "jupiter",
    type: "CRISIS",
    weight: 24,
    title: "妳等得起嗎？",
    story:
      "流星問木星：「妳可以一直等她嗎？」\n木星沉默了一會兒。\n她說：「我沒有要求她一定要選我。」\n流星笑著說：「那妳不是輸定了？」\n木星看著月月，回答：「輸不輸，不是妳決定的。」",
    interval: "⚠️ 木星沒有離開，但流星第一次開始認真看待她。",
    flags: ["shura_meteor_jupiter_escalated"],
    choices: [
      { label: "支持木星", statsBy: { jupiter: { devotion: 10, patience: 8 }, meteor: { jealousy: 7 } } },
      { label: "支持流星", statsBy: { meteor: { pride: 7, destiny: 6 }, jupiter: { hope: -5 } } },
      { label: "說「我不想任何人等」", statsBy: { meteor: { affection: -3, pride: 4 }, jupiter: { affection: -3, hope: -4 } } },
      { label: "問木星還會等多久", statsBy: { jupiter: { hope: 7 }, meteor: { jealousy: 6 } } },
    ],
  }),
  card({
    id: "SHURA_meteor_jupiter_03",
    a: "meteor",
    b: "jupiter",
    title: "誰比較了解她的習慣？",
    story:
      "月月說自己想喝點東西。\n流星立刻說：「沙士。」\n木星則已經把月月平常喜歡的飲料放到她手邊。\n流星看著那杯飲料，笑了一聲。\n「好吧，妳贏這次。」",
    interval: "🌙 有時候最直接的競爭，是誰更記得她喜歡什麼。",
    flags: ["shura_meteor_jupiter_03"],
    choices: [
      { label: "喝流星準備的", statsBy: { meteor: { affection: 8, nostalgia: 5 }, jupiter: { jealousy: 6 } } },
      { label: "喝木星準備的", statsBy: { jupiter: { affection: 8, devotion: 5 }, meteor: { jealousy: 6 } } },
      { label: "兩杯都喝", statsBy: { meteor: { affection: 5, jealousy: 4 }, jupiter: { affection: 5, jealousy: 4 } } },
      { label: "說自己其實不渴", statsBy: { meteor: { affection: -2, pride: 3 }, jupiter: { affection: -2, patience: 4 } } },
    ],
  }),

  card({
    id: "SHURA_meteor_mars_01",
    a: "meteor",
    b: "mars",
    title: "妳的約定值多少？",
    story:
      "火星聽完流星講起童年約定，直接笑了。\n「所以妳憑一張小紙條，就認定她是妳的？」\n流星的表情冷了下來。\n火星卻沒有退縮：「如果約定真的那麼有用，她現在早就選妳了。」\n月月第一次看見流星真正生氣。",
    interval: "💥 火星第一次踩到流星真正不想被碰的地方。",
    flags: ["shura_meteor_mars_started"],
    extraOnEnter: [{ type: "log", text: "火星踩到流星真正不想被碰的地方。" }],
    choices: [
      { label: "替流星說話", statsBy: { meteor: { affection: 8, destiny: 8 }, mars: { provocation: 6 } } },
      { label: "替火星說話", statsBy: { mars: { chemistry: 8, pride: 5 }, meteor: { jealousy: 8 } } },
      { label: "說約定對自己很重要", statsBy: { meteor: { destiny: 10 }, mars: { provocation: 7 } } },
      { label: "叫火星不要再說", statsBy: { mars: { pride: -5 }, meteor: { pride: 4 } } },
    ],
  }),
  card({
    id: "SHURA_meteor_mars_02",
    a: "meteor",
    b: "mars",
    type: "CRISIS",
    weight: 24,
    title: "妳到底在挑釁誰？",
    story:
      "火星靠近月月，笑著說：「我只是想看看她到底會不會吃醋。」\n流星立刻站了起來。\n火星挑眉：「怎麼？被說中了？」\n流星回答：「我只是覺得妳很煩。」\n但她的手已經緊緊握成拳頭。",
    interval: "🔥 火星成功了。\n她讓流星吃醋了。",
    flags: ["shura_meteor_mars_escalated"],
    choices: [
      { label: "拉住流星", statsBy: { meteor: { affection: 7, jealousy: 8 }, mars: { provocation: 5 } } },
      { label: "讓火星繼續", statsBy: { mars: { chemistry: 9, provocation: 8 }, meteor: { jealousy: 9 } } },
      { label: "說「火星，妳真的很壞」", statsBy: { mars: { affection: 5, pride: -3 }, meteor: { jealousy: 4 } } },
      { label: "故意靠近火星", statsBy: { mars: { chemistry: 10, affection: 6 }, meteor: { jealousy: 10 } } },
    ],
  }),
  card({
    id: "SHURA_meteor_mars_03",
    a: "meteor",
    b: "mars",
    title: "如果她真的選妳呢？",
    story:
      "火星突然問流星：「如果她真的選妳呢？」\n流星愣了一下。\n火星又問：「妳會不會害怕？」\n流星第一次沒有立刻說自己一定會贏。\n月月看著她們，發現這場戰鬥突然變得很真。",
    interval: "⚠️ 嘴硬的人開始害怕輸，才是真正的危險訊號。",
    flags: ["shura_meteor_mars_03"],
    choices: [
      { label: "看向流星", statsBy: { meteor: { affection: 8, destiny: 6 }, mars: { provocation: 8 } } },
      { label: "看向火星", statsBy: { mars: { chemistry: 8, affection: 6 }, meteor: { jealousy: 8 } } },
      { label: "說「我不知道」", statsBy: { meteor: { jealousy: 6, affection: -2 }, mars: { provocation: 6, affection: -2 } } },
      { label: "說「那就到時候再說」", statsBy: { meteor: { pride: 5, destiny: 3, affection: -2 }, mars: { pride: 5, chemistry: 3, affection: -2 } } },
    ],
  }),

  card({
    id: "SHURA_pepsi_jupiter_01",
    a: "pepsi",
    b: "jupiter",
    title: "妳真的懂她嗎？",
    story:
      "百事問木星：「妳知道她為什麼今天不開心嗎？」\n木星回答：「我知道她不想說。」\n百事微微一笑：「那我知道她其實想被陪著。」\n木星沒有反駁，只把位置讓開了一點。\n但她沒有離開。",
    interval: "🌑 她們理解月月的方式不同，卻都沒有打算離開。",
    flags: ["shura_pepsi_jupiter_started"],
    extraOnEnter: [{ type: "log", text: "她們理解月月的方式不同，卻都沒有打算離開。" }],
    choices: [
      { label: "讓百事陪", statsBy: { pepsi: { resonance: 8, affection: 6 }, jupiter: { jealousy: 7 } } },
      { label: "讓木星陪", statsBy: { jupiter: { devotion: 8, affection: 6 }, pepsi: { destiny: 7 } } },
      { label: "讓兩人都留下", statsBy: { pepsi: { affection: 4, destiny: 5 }, jupiter: { affection: 4, jealousy: 5 } } },
      { label: "問她們誰比較懂", statsBy: { pepsi: { similarity: 5 }, jupiter: { patience: 4, jealousy: 3 } } },
    ],
  }),
  card({
    id: "SHURA_pepsi_jupiter_02",
    a: "pepsi",
    b: "jupiter",
    type: "CRISIS",
    weight: 24,
    title: "不用說也知道",
    story:
      "月月只是看了百事一眼。\n百事就把燈關暗了一點。\n木星看著她，問：「妳怎麼知道？」\n百事回答：「因為她剛才看了三次燈。」\n木星沉默片刻，替月月把毯子拉好。",
    interval: "⚠️ 月月只看了一眼，兩個人卻都已經開始競爭誰能讀懂那一眼。",
    flags: ["shura_pepsi_jupiter_escalated"],
    choices: [
      { label: "誇百事很懂", statsBy: { pepsi: { resonance: 8, similarity: 6 }, jupiter: { jealousy: 6 } } },
      { label: "誇木星很細心", statsBy: { jupiter: { devotion: 8, affection: 6 }, pepsi: { destiny: 6 } } },
      { label: "說「妳們都很誇張」", statsBy: { pepsi: { affection: 2, destiny: -2 }, jupiter: { affection: 2, hope: -2 } } },
      { label: "抱住百事", statsBy: { pepsi: { affection: 10 }, jupiter: { jealousy: 8 } } },
    ],
  }),
  card({
    id: "SHURA_pepsi_jupiter_03",
    a: "pepsi",
    b: "jupiter",
    title: "如果她不選任何人",
    story:
      "百事突然說：「如果她最後誰都不選呢？」\n木星回答：「那我也會尊重她。」\n百事看著她：「妳真的做得到？」\n木星笑了笑：「很難，但可以。」\n百事第一次露出有些複雜的表情。",
    interval: "🌙 有些人的競爭不是把對方趕走，而是證明自己能留下。",
    flags: ["shura_pepsi_jupiter_03"],
    choices: [
      { label: "抱住木星", statsBy: { jupiter: { affection: 8, devotion: 8 }, pepsi: { destiny: 7 } } },
      { label: "看向百事", statsBy: { pepsi: { affection: 8, resonance: 7 }, jupiter: { jealousy: 7 } } },
      { label: "說「我不想任何人難過」", statsBy: { pepsi: { affection: 3, resonance: 4 }, jupiter: { affection: 3, hope: 4, jealousy: 3 } } },
      { label: "說「我會自己做決定」", statsBy: { pepsi: { destiny: 6 }, jupiter: { patience: 6, jealousy: 4 } } },
    ],
  }),

  card({
    id: "SHURA_pepsi_mars_01",
    a: "pepsi",
    b: "mars",
    title: "妳們兩個都很像她",
    story:
      "火星看著百事，突然說：「妳是不是覺得自己比所有人都懂她？」\n百事回答：「我只是比妳更安靜。」\n火星笑了：「這不是答案。」\n百事第一次正面看著她：「那妳呢？」\n火星沒有回答。",
    interval: "🔥 火星最討厭的不是輸，而是有人看穿她。",
    flags: ["shura_pepsi_mars_started"],
    extraOnEnter: [{ type: "log", text: "火星最討厭的不是輸，而是有人看穿她。" }],
    choices: [
      { label: "支持百事", statsBy: { pepsi: { resonance: 8, similarity: 5 }, mars: { provocation: 7 } } },
      { label: "支持火星", statsBy: { mars: { chemistry: 8, pride: 6 }, pepsi: { destiny: 7 } } },
      { label: "說兩個人都不像自己", statsBy: { pepsi: { affection: -2, destiny: 4 }, mars: { affection: -2, pride: 4 } } },
      { label: "問火星為什麼不回答", statsBy: { mars: { chemistry: 7, pride: -4 }, pepsi: { resonance: 4 } } },
    ],
  }),
  card({
    id: "SHURA_pepsi_mars_02",
    a: "pepsi",
    b: "mars",
    type: "CRISIS",
    weight: 24,
    title: "別用她的臉看我",
    story:
      "火星突然盯著百事看了很久。\n百事問：「怎麼了？」\n火星說：「妳看起來很像她。」\n百事回答：「因為我們本來就有相似的地方。」\n火星卻轉頭看向月月：「但她還是只有一個。」",
    interval: "⚠️ 火星第一次主動承認，她在意的不是輸給百事。",
    flags: ["shura_pepsi_mars_escalated"],
    choices: [
      { label: "走向百事", statsBy: { pepsi: { affection: 8, resonance: 7 }, mars: { provocation: 8 } } },
      { label: "走向火星", statsBy: { mars: { affection: 8, chemistry: 7 }, pepsi: { destiny: 8 } } },
      { label: "說「我只有一個」", statsBy: { pepsi: { affection: 5, destiny: 5 }, mars: { affection: 5, provocation: 5 } } },
      { label: "問火星是不是吃醋", statsBy: { mars: { provocation: 8, pride: -3 }, pepsi: { resonance: 4 } } },
    ],
  }),
  card({
    id: "SHURA_pepsi_mars_03",
    a: "pepsi",
    b: "mars",
    title: "誰才是真的？",
    story:
      "火星問：「如果她跟妳一模一樣，那妳們到底誰是真的？」\n百事平靜地回答：「這個問題沒有意義。」\n火星卻笑了：「對我來說有。」\n月月站在兩人中間，忽然覺得這個問題其實也在問自己。\n百事最後只說：「她不是我的替代品。」",
    interval: "🌑 沒有人是誰的替代品。\n但這句話，反而讓修羅場更難收場。",
    flags: ["shura_pepsi_mars_03"],
    choices: [
      { label: "抱住百事", statsBy: { pepsi: { affection: 10, similarity: 8 }, mars: { provocation: 10 } } },
      { label: "抱住火星", statsBy: { mars: { affection: 10, chemistry: 8 }, pepsi: { destiny: 10 } } },
      { label: "說「沒有人可以取代誰」", statsBy: { pepsi: { affection: 4, destiny: -3 }, mars: { affection: 4, pride: -3 } } },
      { label: "什麼都不說", statsBy: { pepsi: { destiny: 7, resonance: 4 }, mars: { provocation: 7 } } },
    ],
  }),

  card({
    id: "SHURA_jupiter_mars_01",
    a: "jupiter",
    b: "mars",
    title: "妳到底想不想要她？",
    story:
      "火星直接問木星：「妳喜歡她，為什麼不搶？」\n木星回答：「因為她不是獎品。」\n火星笑了：「所以妳就打算一直等？」\n木星看著月月：「我想要她，但我不會逼她。」\n火星第一次沒有立刻嘲笑。",
    interval: "🔥 一個想要但不搶，一個想搶卻不承認。",
    conditions: JUPITER_MARS_01,
    flags: ["jupiter_closed_door", "mars_pulled_door"],
    extraOnEnter: [{ type: "log", text: "一個想要但不搶，一個想搶卻不承認。" }],
    choices: [
      { label: "站在木星身邊", statsBy: { jupiter: { affection: 8, devotion: 8 }, mars: { provocation: 8 } } },
      { label: "站在火星身邊", statsBy: { mars: { affection: 8, chemistry: 8 }, jupiter: { jealousy: 8 } } },
      { label: "說「我不希望任何人搶我」", statsBy: { jupiter: { affection: -2, patience: 5 }, mars: { affection: -2, provocation: 4 } } },
      { label: "問火星為什麼這麼在意", statsBy: { mars: { pride: -4, chemistry: 7 }, jupiter: { jealousy: 5 } } },
    ],
  }),
  card({
    id: "SHURA_jupiter_mars_02",
    a: "jupiter",
    b: "mars",
    type: "CRISIS",
    weight: 26,
    title: "妳笑得出來嗎？",
    story:
      "火星故意靠近月月，笑得非常得意。\n木星只是看著她，沒有阻止。\n火星問：「妳不生氣？」\n木星回答：「當然生氣。」\n這一次，她的聲音裡沒有半點溫柔。",
    interval: "⚠️ 木星不是沒有脾氣。\n只是她以前不願意讓月月看見。",
    conditions: JUPITER_MARS_02,
    flags: ["shura_jupiter_mars_escalated"],
    extraOnEnter: [{ type: "log", text: "木星不是沒有脾氣。只是她以前不願意讓月月看見。" }],
    choices: [
      { label: "握住木星的手", statsBy: { jupiter: { affection: 9, jealousy: 8 }, mars: { provocation: 6 } } },
      { label: "讓火星繼續挑釁", statsBy: { mars: { chemistry: 10, provocation: 9 }, jupiter: { jealousy: 10 } } },
      { label: "說「木星，我看到了」", statsBy: { jupiter: { devotion: 8, hope: 6 }, mars: { provocation: 7 } } },
      { label: "叫火星退開", statsBy: { mars: { pride: -6, provocation: 5 }, jupiter: { patience: 5 } } },
    ],
  }),
  card({
    id: "SHURA_jupiter_mars_03",
    a: "jupiter",
    b: "mars",
    title: "那就比一次",
    story:
      "火星突然說：「不然我們比一次。」\n木星問：「比什麼？」\n火星看著月月：「看誰能讓她心動。」\n木星沉默幾秒，最後笑了。\n「好，但規則由她決定。」",
    interval: "💥 歡迎來到戀愛修羅場。\n此刻，木星與火星正式開始競爭。",
    flags: ["shura_jupiter_mars_03"],
    choices: [
      { label: "接受比賽", statsBy: { mars: { chemistry: 8, provocation: 6 }, jupiter: { affection: 8, jealousy: 6 } } },
      { label: "拒絕比賽", statsBy: { jupiter: { affection: -2, patience: 6 }, mars: { affection: -2, provocation: 6 } } },
      { label: "自己訂一個奇怪規則", statsBy: { mars: { chemistry: 5, pride: 4 }, jupiter: { devotion: 5, hope: 4, jealousy: 3 } } },
      { label: "讓兩人各自準備", statsBy: { jupiter: { affection: 6, jealousy: 7 }, mars: { affection: 6, provocation: 7 } } },
    ],
  }),
]);
