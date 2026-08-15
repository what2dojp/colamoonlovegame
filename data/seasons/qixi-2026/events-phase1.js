function skeleton({
  id,
  title,
  description,
  characters,
  speaker,
  type,
  weight = 22,
  tags = [],
  conditions,
  onEnter,
  choices,
  pool = true,
  repeatable = false,
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
    repeatable,
    tags,
    conditions,
    onEnter,
    choices,
  };
}

export const PHASE1_EVENTS = [
  skeleton({
    id: "EVENT_office_simmer_2",
    title: "辦公室裡的高溫（第二次）",
    description:
      "冷氣還開著。空氣又熱了一點。這是今晚第二次換氣，不該再第三次。",
    characters: ["nini", "meteor", "pepsi", "jupiter", "mars"],
    speaker: "現場",
    weight: 5,
    tags: ["dynamic", "observation", "breathing"],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { completed: "EVENT_office_simmer" },
        { not: { completed: "EVENT_office_simmer_2" } },
      ],
    },
    choices: [
      {
        id: "breathe",
        label: "讓場面再熱一點",
        effects: [
          { type: "tension", pair: "nini-meteor", op: "add", value: 3 },
          { type: "tension", pair: "jupiter-mars", op: "add", value: 3 },
        ],
      },
      {
        id: "cool",
        label: "先把話題轉到飲料",
        effects: [{ type: "log", text: "暫時沒有爆炸。" }],
      },
    ],
  }),
  skeleton({
    id: "EVENT_letter_moon_saw",
    title: "月月看見那封信",
    description:
      "信封還在 {{target.name}} 那邊。月月已經看見了。她知道有一封信存在，接下來不能假裝沒這回事。",
    characters: [],
    speaker: "可樂月月",
    weight: 16,
    tags: ["letter", "moon"],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { flag: "letter_seen_by_moon" },
        { not: { completed: "EVENT_letter_moon_saw" } },
      ],
    },
    choices: [
      {
        id: "admit",
        label: "讓月月承認她看見了",
        effects: [
          { type: "weightMod", eventId: "{{target.letterEventId}}", value: 16 },
          { type: "log", text: "月月知道這封信。收信人之後仍會讀到，但現場已經不一樣。" },
        ],
      },
      {
        id: "wait",
        label: "讓月月先不說破",
        effects: [
          { type: "weightMod", eventId: "{{target.letterEventId}}", value: 8 },
          { type: "eventStatus", status: "unresolved" },
        ],
      },
    ],
  }),
];
