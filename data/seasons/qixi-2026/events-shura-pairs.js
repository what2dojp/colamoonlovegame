function skeleton({
  id,
  title,
  description,
  characters,
  speaker = "現場",
  type = "CONFLICT",
  weight = 20,
  tags = [],
  conditions,
  onEnter,
  choices,
  pool = true,
}) {
  return {
    id,
    title,
    description,
    characters,
    speaker,
    type,
    pool,
    weight,
    repeatable: false,
    tags,
    conditions,
    onEnter,
    choices,
  };
}

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

function pairChoices(a, b, labels = {}) {
  const names = {
    nini: "日日",
    meteor: "流星",
    pepsi: "百事",
    jupiter: "木星",
    mars: "火星",
  };
  return [
    {
      id: "continue",
      label: labels.continue || "讓兩人繼續僵持，可樂月月先不選",
      effects: [
        { type: "eventStatus", status: "unresolved" },
        { type: "flag", key: `shura_${a}_${b}_unresolved`, value: true },
        { type: "tension", pair: `${a}-${b}`, op: "add", value: 6 },
      ],
    },
    {
      id: `help_${a}`,
      label: labels[a] || `站在${names[a]}這一邊`,
      effects: [
        { type: "flag", key: `shura_helped_${a}`, value: true },
        { type: "tension", pair: `${a}-${b}`, op: "add", value: 4 },
      ],
    },
    {
      id: `help_${b}`,
      label: labels[b] || `站在${names[b]}這一邊`,
      effects: [
        { type: "flag", key: `shura_helped_${b}`, value: true },
        { type: "tension", pair: `${a}-${b}`, op: "add", value: 4 },
      ],
    },
    {
      id: "pull_moon",
      label: labels.pull || "把可樂月月拉開，不讓兩人定義她",
      effects: [
        { type: "eventStatus", status: "unresolved" },
        { type: "flag", key: "moon_refuses_public_claim", value: true },
        { type: "tension", pair: `${a}-${b}`, op: "add", value: 3 },
      ],
    },
  ];
}

export const EXTRA_SHURA_EVENTS = [
  skeleton({
    id: "EVENT_shura_nini_jupiter_01",
    title: "留下還是成全",
    description:
      "日日把晶晶塞進可樂月月手裡，聲音很輕，意思卻很硬：「喜歡就留下來。留下來就等於喜歡。」木星沒有伸手去搶娃娃，只把熱過的飲料放到旁邊。「我不會叫她選我。可是累的時候，是我一直在。」不干預時，直接表達的喜歡和默默照顧同時把人困在中間。可樂月月握著晶晶，飲料還燙，一時不知道該先回答哪一句。",
    characters: ["nini", "jupiter"],
    tags: ["conflict", "shura", "nini", "jupiter"],
    onEnter: [
      { type: "flag", key: "shura_nini_jupiter_started", value: true },
      { type: "stat", path: "characters.nini.obsession", op: "add", value: 8 },
      { type: "stat", path: "characters.nini.dependence", op: "add", value: 4 },
      { type: "stat", path: "characters.jupiter.devotion", op: "add", value: 6 },
      { type: "stat", path: "characters.jupiter.patience", op: "add", value: 4 },
      { type: "tension", pair: "nini-jupiter", op: "add", value: 10 },
      { type: "log", text: "日日要她留下。木星只把熱飲放好。佔有和成全同時出現。" },
    ],
    conditions: pairConditions("nini", "jupiter", "EVENT_shura_nini_jupiter_01"),
    choices: pairChoices("nini", "jupiter", {
      continue: "讓「喜歡就留下」和「我一直在」同時壓上來",
      nini: "讓日日把喜歡說完",
      jupiter: "讓木星繼續默默照顧",
      pull: "把可樂月月從留下／成全裡拉開",
    }),
  }),
  skeleton({
    id: "EVENT_shura_nini_mars_01",
    title: "鑰匙對上火",
    description:
      "日日把地下室鑰匙握在掌心：「她是我的。鑰匙還在。」火星靠過來，笑得很刺耳。「鑰匙又不能把人鎖在喜歡裡。妳越抓，我越想把她拉走。」不干預時，永遠佔有和互相傷害的火同時燒起來。可樂月月站在兩人中間，一邊是鎖，一邊是燎原。",
    characters: ["nini", "mars"],
    tags: ["conflict", "shura", "nini", "mars"],
    onEnter: [
      { type: "flag", key: "shura_nini_mars_started", value: true },
      { type: "stat", path: "characters.nini.obsession", op: "add", value: 8 },
      { type: "stat", path: "characters.nini.jealousy", op: "add", value: 6 },
      { type: "stat", path: "characters.mars.provocation", op: "add", value: 8 },
      { type: "stat", path: "characters.mars.chemistry", op: "add", value: 5 },
      { type: "tension", pair: "nini-mars", op: "add", value: 12 },
      { type: "log", text: "日日握著鑰匙。火星把火湊近。佔有和挑釁同時升高。" },
    ],
    conditions: pairConditions("nini", "mars", "EVENT_shura_nini_mars_01"),
    choices: pairChoices("nini", "mars", {
      continue: "讓鑰匙和火同時燒著，可樂月月先不選",
      nini: "請火星停手，站在日日這一邊",
      mars: "讓火星把她拉走",
      pull: "把可樂月月從鎖與火中間拉開",
    }),
  }),
  skeleton({
    id: "EVENT_shura_meteor_jupiter_01",
    title: "舊路和新的照顧",
    description:
      "流星提起小時候那條路，像在提醒所有人：約定比今晚更早。「我們本來就會走回去。」木星沒有反駁那句話，只把外套往可樂月月肩上放。「我知道妳們認識得早。可是她現在累的時候，是我在。」不干預時，共同回憶和安靜陪伴開始爭同一段距離。可樂月月摸到舊路的灰塵，也摸到還有體溫的衣領。",
    characters: ["meteor", "jupiter"],
    tags: ["conflict", "shura", "meteor", "jupiter"],
    onEnter: [
      { type: "flag", key: "shura_meteor_jupiter_started", value: true },
      { type: "stat", path: "characters.meteor.destiny", op: "add", value: 8 },
      { type: "stat", path: "characters.meteor.nostalgia", op: "add", value: 6 },
      { type: "stat", path: "characters.jupiter.devotion", op: "add", value: 6 },
      { type: "stat", path: "characters.jupiter.hope", op: "add", value: 4 },
      { type: "tension", pair: "meteor-jupiter", op: "add", value: 10 },
      { type: "log", text: "流星搬出舊路。木星只把外套披上。回憶和照顧同時靠近。" },
    ],
    conditions: pairConditions("meteor", "jupiter", "EVENT_shura_meteor_jupiter_01"),
    choices: pairChoices("meteor", "jupiter", {
      continue: "讓舊路和外套同時靠近，可樂月月先不選",
      meteor: "讓流星把共同回憶說完",
      jupiter: "讓木星把現在的照顧做完",
      pull: "把可樂月月從舊路和新的照顧裡拉開",
    }),
  }),
  skeleton({
    id: "EVENT_shura_meteor_mars_01",
    title: "瓶蓋對上掌聲",
    description:
      "流星把沙士瓶蓋拍在桌上：「這是我們的。妳再受歡迎，也走不進那條路。」火星笑得很鋒利，像習慣被看見的人。「回憶很甜。可是現在看她的人比妳多，而我不會假裝自己只是朋友。」不干預時，共同回憶和強勢的現在互相覆蓋。可樂月月聽見瓶蓋的聲響，也聽見走廊另一頭有人轉頭看火星。",
    characters: ["meteor", "mars"],
    tags: ["conflict", "shura", "meteor", "mars"],
    onEnter: [
      { type: "flag", key: "shura_meteor_mars_started", value: true },
      { type: "stat", path: "characters.meteor.destiny", op: "add", value: 7 },
      { type: "stat", path: "characters.meteor.pride", op: "add", value: 6 },
      { type: "stat", path: "characters.mars.pride", op: "add", value: 6 },
      { type: "stat", path: "characters.mars.provocation", op: "add", value: 7 },
      { type: "tension", pair: "meteor-mars", op: "add", value: 12 },
      { type: "log", text: "流星拍瓶蓋。火星把鋒芒亮出來。舊愛和現在的掌聲撞在一起。" },
    ],
    conditions: pairConditions("meteor", "mars", "EVENT_shura_meteor_mars_01"),
    choices: pairChoices("meteor", "mars", {
      continue: "讓瓶蓋和掌聲互相覆蓋，可樂月月先不選",
      meteor: "讓流星守住那條舊路",
      mars: "讓火星把現在的鋒芒亮出來",
      pull: "把可樂月月從回憶和掌聲裡拉開",
    }),
  }),
  skeleton({
    id: "EVENT_shura_pepsi_jupiter_01",
    title: "認出與等待",
    description:
      "百事靠得很近，卻沒有伸手去搶：「我不搶。真正命中注定的人，靈魂會自己走過來。」木星第一次把聲音抬高一點。「我不搶，不代表我不想被選。我等很久了。等不是因為沒有喜歡。」不干預時，平靜的認出和想被選的等待同時壓上來。可樂月月看見兩張很像的臉，一個太懂她，一個太珍惜她。",
    characters: ["pepsi", "jupiter"],
    tags: ["conflict", "shura", "pepsi", "jupiter"],
    onEnter: [
      { type: "flag", key: "shura_pepsi_jupiter_started", value: true },
      { type: "stat", path: "characters.pepsi.resonance", op: "add", value: 7 },
      { type: "stat", path: "characters.pepsi.similarity", op: "add", value: 5 },
      { type: "stat", path: "characters.jupiter.devotion", op: "add", value: 7 },
      { type: "stat", path: "characters.jupiter.hope", op: "add", value: -4 },
      { type: "tension", pair: "pepsi-jupiter", op: "add", value: 9 },
      { type: "log", text: "百事說靈魂會自己靠近。木星說等待不是沒有喜歡。" },
    ],
    conditions: pairConditions("pepsi", "jupiter", "EVENT_shura_pepsi_jupiter_01"),
    choices: pairChoices("pepsi", "jupiter", {
      continue: "讓認出和等待同時壓上來，可樂月月先不選",
      pepsi: "讓百事把靈魂會自己靠近說完",
      jupiter: "讓木星說出她也想被選",
      pull: "把可樂月月從認出與等待裡拉開",
    }),
  }),
  skeleton({
    id: "EVENT_shura_pepsi_mars_01",
    title: "靈魂和不講理",
    description:
      "百事看著火星，語氣幾乎像在說明一件事實：「妳越急，越不像命定。真正會留下的人，不必把場面搶到手。」火星往前一步，擋在可樂月月視線裡。「我沒有命定。我就是現在要站在她旁邊。理由之後再想。」不干預時，不需要贏的靈魂和就是要贏的火同時出現。可樂月月聽見兩種喜歡：一種太安靜，一種太燙。",
    characters: ["pepsi", "mars"],
    tags: ["conflict", "shura", "pepsi", "mars"],
    onEnter: [
      { type: "flag", key: "shura_pepsi_mars_started", value: true },
      { type: "stat", path: "characters.pepsi.resonance", op: "add", value: 6 },
      { type: "stat", path: "characters.pepsi.destiny", op: "add", value: 5 },
      { type: "stat", path: "characters.mars.chemistry", op: "add", value: 7 },
      { type: "stat", path: "characters.mars.provocation", op: "add", value: 8 },
      { type: "tension", pair: "pepsi-mars", op: "add", value: 11 },
      { type: "log", text: "百事不搶。火星偏要站進來。命定和不講理打在同一張臉上。" },
    ],
    conditions: pairConditions("pepsi", "mars", "EVENT_shura_pepsi_mars_01"),
    choices: pairChoices("pepsi", "mars", {
      continue: "讓靈魂和不講理同時出現，可樂月月先不選",
      pepsi: "讓百事把「不必搶」說完",
      mars: "讓火星就是要站進來",
      pull: "把可樂月月從安靜和燙裡拉開",
    }),
  }),
];
