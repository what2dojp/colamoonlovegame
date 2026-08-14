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

function stayOrLeave(id, stayEffects, leaveEffects) {
  return [
    {
      id: "stay",
      label: "讓這段繼續發生",
      effects: stayEffects,
    },
    {
      id: "leave",
      label: "先把場面拉開",
      effects: leaveEffects,
    },
  ];
}

function clearSolo(id) {
  return { type: "flag", key: `solo_active_${id}`, value: false };
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
    id: "EVENT_nini_solo_01",
    title: "日日的獨處：地下室口",
    description:
      "走廊只剩日日。她把晶晶抱在胸前，看著地下室的方向。「現在只有我們。」",
    characters: ["nini"],
    speaker: "雪碧日日",
    weight: 18,
    tags: ["nini", "solo", "romance"],
    onEnter: [{ type: "flag", key: "solo_active_nini", value: true }],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_nini_solo_01" } },
        {
          any: [
            { flag: "encounter_nini" },
            { flag: "letter_to_nini" },
            { path: "characters.nini.obsession", op: "gte", value: 50 },
          ],
        },
      ],
    },
    choices: stayOrLeave(
      "nini",
      [
        clearSolo("nini"),
        { type: "stat", path: "characters.nini.obsession", op: "add", value: 6 },
        { type: "stat", path: "characters.nini.dependence", op: "add", value: 6 },
        { type: "flag", key: "nini_allowed_stay", value: true },
        { type: "weightMod", eventId: "EVENT_nini_dependence_01", value: 12 },
      ],
      [
        clearSolo("nini"),
        { type: "stat", path: "characters.nini.trust", op: "add", value: -4 },
        { type: "eventStatus", status: "unresolved" },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_meteor_solo_01",
    title: "流星的獨處：自動販賣機",
    description: "流星踢了一下沙士機。「小時候也是這樣。妳先喝，我再嗆妳。」",
    characters: ["meteor"],
    speaker: "沙士流星",
    weight: 18,
    tags: ["meteor", "solo", "romance"],
    onEnter: [{ type: "flag", key: "solo_active_meteor", value: true }],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_meteor_solo_01" } },
        {
          any: [
            { flag: "encounter_meteor" },
            { flag: "letter_to_meteor" },
            { path: "characters.meteor.nostalgia", op: "gte", value: 80 },
          ],
        },
      ],
    },
    choices: stayOrLeave(
      "meteor",
      [
        clearSolo("meteor"),
        { type: "stat", path: "characters.meteor.nostalgia", op: "add", value: 5 },
        { type: "stat", path: "characters.meteor.destiny", op: "add", value: 4 },
        { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: 12 },
      ],
      [
        clearSolo("meteor"),
        { type: "stat", path: "characters.meteor.pride", op: "add", value: 5 },
        { type: "eventStatus", status: "unresolved" },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_pepsi_solo_01",
    title: "百事的獨處：同一句話",
    description: "沒有第三人。百事和月月同時吸了一口氣。走廊安靜得不像七夕。",
    characters: ["pepsi"],
    speaker: "百事月月",
    weight: 18,
    tags: ["pepsi", "solo", "romance"],
    onEnter: [{ type: "flag", key: "solo_active_pepsi", value: true }],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_pepsi_solo_01" } },
        {
          any: [
            { flag: "encounter_pepsi" },
            { flag: "letter_to_pepsi" },
            { path: "characters.pepsi.resonance", op: "gte", value: 78 },
          ],
        },
      ],
    },
    choices: stayOrLeave(
      "pepsi",
      [
        clearSolo("pepsi"),
        { type: "stat", path: "characters.pepsi.resonance", op: "add", value: 6 },
        { type: "stat", path: "characters.pepsi.similarity", op: "add", value: 4 },
        { type: "weightMod", eventId: "EVENT_pepsi_identity_01", value: 12 },
      ],
      [
        clearSolo("pepsi"),
        { type: "stat", path: "characters.pepsi.destiny", op: "add", value: 4 },
        { type: "eventStatus", status: "unresolved" },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_mars_solo_01",
    title: "火星的獨處：走廊對峙",
    description: "火星把距離縮到只剩半步。「現在沒人看。妳要走還是要接？」",
    characters: ["mars"],
    speaker: "芬達火星",
    weight: 18,
    tags: ["mars", "solo", "conflict"],
    onEnter: [{ type: "flag", key: "solo_active_mars", value: true }],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_mars_solo_01" } },
        {
          any: [
            { flag: "encounter_mars" },
            { flag: "letter_to_mars" },
            { flag: "mars_duel_started" },
          ],
        },
      ],
    },
    choices: stayOrLeave(
      "mars",
      [
        clearSolo("mars"),
        { type: "stat", path: "characters.mars.chemistry", op: "add", value: 7 },
        { type: "tension", pair: "moon-mars", op: "add", value: 8 },
        { type: "weightMod", eventId: "EVENT_mars_too_close_01", value: 16 },
      ],
      [
        clearSolo("mars"),
        { type: "stat", path: "characters.mars.pride", op: "add", value: 5 },
        { type: "stat", path: "characters.mars.provocation", op: "add", value: 4 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_letter_nini",
    title: "日日把信收進晶晶裡面",
    description: "日日讀完那封沒有署名的信。她沒有問是誰寫的。她把信塞進晶晶的縫裡。",
    characters: ["nini"],
    speaker: "雪碧日日",
    weight: 16,
    tags: ["nini", "letter", "character"],
    conditions: {
      all: [{ flag: "dynamic_pool_unlocked" }, { flag: "letter_to_nini" }, { not: { completed: "EVENT_letter_nini" } }],
    },
    choices: [
      {
        id: "keep",
        label: "讓她把信當成月月寫的",
        effects: [
          { type: "stat", path: "characters.nini.obsession", op: "add", value: 8 },
          { type: "stat", path: "characters.nini.dependence", op: "add", value: 6 },
          { type: "weightMod", eventId: "EVENT_nini_lockbox_01", value: 12 },
        ],
      },
      {
        id: "ask",
        label: "讓月月說：那不是我寫的",
        effects: [
          { type: "stat", path: "characters.nini.trust", op: "add", value: -8 },
          { type: "stat", path: "characters.nini.jealousy", op: "add", value: 10 },
          { type: "eventStatus", status: "unresolved" },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_letter_meteor",
    title: "流星把信讀成舊帳",
    description: "流星看完信，冷笑。「誰寫的都一樣。重點是妳會不會回來。」",
    characters: ["meteor"],
    speaker: "沙士流星",
    weight: 16,
    tags: ["meteor", "letter", "character"],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { flag: "letter_to_meteor" },
        { not: { completed: "EVENT_letter_meteor" } },
      ],
    },
    choices: [
      {
        id: "vow",
        label: "讓月月沒有否認童年那句",
        effects: [
          { type: "stat", path: "characters.meteor.destiny", op: "add", value: 8 },
          { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: 14 },
        ],
      },
      {
        id: "now",
        label: "讓月月說現在不是小時候",
        effects: [
          { type: "stat", path: "characters.meteor.pride", op: "add", value: 6 },
          { type: "stat", path: "characters.meteor.jealousy", op: "add", value: 6 },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_letter_pepsi",
    title: "百事把信讀成已經知道的事",
    description: "百事看完信。「我知道妳想說什麼。我只是想看妳會不會自己寫出來。」",
    characters: ["pepsi"],
    speaker: "百事月月",
    weight: 16,
    tags: ["pepsi", "letter", "character"],
    conditions: {
      all: [{ flag: "dynamic_pool_unlocked" }, { flag: "letter_to_pepsi" }, { not: { completed: "EVENT_letter_pepsi" } }],
    },
    choices: [
      {
        id: "admit",
        label: "讓月月承認信裡的那句",
        effects: [
          { type: "stat", path: "characters.pepsi.resonance", op: "add", value: 6 },
          { type: "weightMod", eventId: "EVENT_pepsi_identity_01", value: 12 },
        ],
      },
      {
        id: "hide",
        label: "讓月月說那不是她的意思",
        effects: [
          { type: "stat", path: "characters.pepsi.understanding", op: "add", value: 3 },
          { type: "eventStatus", status: "unresolved" },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_letter_jupiter",
    title: "木星把信讀成答案",
    description: "木星的手很穩。信很短。她還是把喜歡聽成了「今晚有人希望她留下」。",
    characters: ["jupiter"],
    speaker: "西打木星",
    weight: 16,
    tags: ["jupiter", "letter", "character"],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { flag: "letter_to_jupiter" },
        { not: { completed: "EVENT_letter_jupiter" } },
      ],
    },
    choices: [
      {
        id: "confirm",
        label: "讓月月說：我希望妳留下",
        effects: [
          { type: "stat", path: "characters.jupiter.hope", op: "add", value: 10 },
          { type: "stat", path: "characters.jupiter.affection", op: "add", value: 6 },
        ],
      },
      {
        id: "thanks",
        label: "讓月月只說謝謝妳一直在",
        effects: [
          { type: "flag", key: "jupiter_unanswered", value: true },
          { type: "stat", path: "characters.jupiter.hope", op: "add", value: -8 },
          { type: "weightMod", eventId: "EVENT_jupiter_packing_01", value: 20 },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_letter_mars",
    title: "火星把信揉掉又撿回來",
    description: "火星說「誰寫這種東西」。紙在她手裡停了三秒。她沒有真的丟進垃圾桶。",
    characters: ["mars"],
    speaker: "芬達火星",
    weight: 16,
    tags: ["mars", "letter", "character"],
    conditions: {
      all: [{ flag: "dynamic_pool_unlocked" }, { flag: "letter_to_mars" }, { not: { completed: "EVENT_letter_mars" } }],
    },
    choices: [
      {
        id: "look",
        label: "讓月月看著她把信撿回來",
        effects: [
          { type: "stat", path: "characters.mars.chemistry", op: "add", value: 8 },
          { type: "weightMod", eventId: "EVENT_mars_too_close_01", value: 14 },
        ],
      },
      {
        id: "deny",
        label: "讓月月說：當我沒寫",
        effects: [
          { type: "stat", path: "characters.mars.pride", op: "add", value: 6 },
          { type: "tension", pair: "moon-mars", op: "add", value: 6 },
        ],
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
  skeleton({
    id: "EVENT_nini_lockbox_01",
    title: "日日的保管箱",
    description:
      "袋子裡出現別人的東西：沙士罐、髮圈、備忘錄。「我幫月月保管。她會亂。」這不是整理，是佔有。",
    characters: ["nini"],
    speaker: "雪碧日日",
    weight: 26,
    tags: ["nini", "crisis"],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_nini_lockbox_01" } },
        { not: { flag: "crisis_blocked_nini" } },
        {
          any: [
            { flag: "secret_nini" },
            { flag: "nini_allowed_stay" },
            { flag: "date_broken_nini" },
            { completed: "EVENT_nini_obsession_01" },
            { completed: "EVENT_nini_dependence_01" },
            { flag: "letter_misread_by_nini" },
            { flag: "fate_rewritten_nini" },
          ],
        },
      ],
    },
    choices: [
      {
        id: "return",
        label: "讓月月要求她把東西還回去",
        effects: [
          { type: "stat", path: "characters.nini.trust", op: "add", value: -10 },
          { type: "stat", path: "characters.nini.obsession", op: "add", value: 10 },
          { type: "eventStatus", status: "unresolved" },
        ],
      },
      {
        id: "hide",
        label: "幫日日先隱瞞，不要當眾拆開",
        effects: [
          { type: "stat", path: "characters.nini.dependence", op: "add", value: 6 },
          { type: "tension", pair: "nini-meteor", op: "add", value: 8 },
          { type: "eventStatus", status: "unresolved" },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_meteor_never_broke_up_01",
    title: "我們根本沒有分手",
    description: "流星當眾說出口。「我們又沒有分手。誰把我們當朋友，誰就聽錯了。」",
    characters: ["meteor"],
    speaker: "沙士流星",
    weight: 26,
    tags: ["meteor", "crisis"],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_meteor_never_broke_up_01" } },
        { not: { flag: "crisis_blocked_meteor" } },
        {
          any: [
            { flag: "secret_meteor" },
            { flag: "public_jealous_meteor" },
            { flag: "date_broken_meteor" },
            { completed: "EVENT_meteor_nostalgia_01" },
            { flag: "letter_to_meteor" },
          ],
        },
      ],
    },
    choices: [
      {
        id: "admit",
        label: "讓月月沒有當眾否認",
        effects: [
          { type: "stat", path: "characters.meteor.destiny", op: "add", value: 10 },
          { type: "tension", pair: "nini-meteor", op: "add", value: 10 },
          { type: "tension", pair: "meteor-pepsi", op: "add", value: 8 },
        ],
      },
      {
        id: "deny",
        label: "讓月月說：那不是交往",
        effects: [
          { type: "stat", path: "characters.meteor.pride", op: "add", value: 8 },
          { type: "stat", path: "characters.meteor.destiny", op: "add", value: -6 },
          { type: "eventStatus", status: "unresolved" },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_pepsi_identity_01",
    title: "妳喜歡的是我，還是另一個妳？",
    description:
      "百事沒有吃醋的表情。她只問：「妳分得清嗎。喜歡的是我，還是另一個自己。」這題比吃醋危險。",
    characters: ["pepsi"],
    speaker: "百事月月",
    weight: 26,
    tags: ["pepsi", "crisis"],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_pepsi_identity_01" } },
        { not: { flag: "crisis_blocked_pepsi" } },
        {
          any: [
            { flag: "secret_pepsi" },
            { flag: "jealousy_triggered_pepsi" },
            { flag: "date_broken_pepsi" },
            { completed: "EVENT_pepsi_soul_01" },
            { flag: "letter_to_pepsi" },
          ],
        },
      ],
    },
    choices: [
      {
        id: "you",
        label: "讓月月說：是妳",
        effects: [
          { type: "stat", path: "characters.pepsi.resonance", op: "add", value: 8 },
          { type: "stat", path: "characters.pepsi.affection", op: "add", value: 6 },
        ],
      },
      {
        id: "mirror",
        label: "讓月月說：我太像妳了，所以不算",
        effects: [
          { type: "stat", path: "characters.pepsi.similarity", op: "add", value: 8 },
          { type: "stat", path: "characters.pepsi.understanding", op: "add", value: 4 },
          { type: "eventStatus", status: "unresolved" },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_jupiter_packing_01",
    title: "木星開始收回備用品",
    description:
      "木星把備用飲料、充電線、備忘錄收回包裡。「我還愛妳。我只是不知道還要不要放在這裡。」",
    characters: ["jupiter"],
    speaker: "西打木星",
    weight: 24,
    tags: ["jupiter", "crisis"],
    onEnter: [
      { type: "flag", key: "jupiter_seen", value: true },
      { type: "flag", key: "jupiter_packing_started", value: true },
    ],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_jupiter_packing_01" } },
        { not: { flag: "crisis_blocked_jupiter" } },
        {
          any: [
            { flag: "secret_jupiter" },
            { flag: "jupiter_unanswered" },
            { flag: "jupiter_asked" },
            { flag: "date_broken_jupiter" },
            { flag: "public_jealous_jupiter" },
            { flag: "fate_rewritten_jupiter" },
            { path: "characters.jupiter.hope", op: "lte", value: 55 },
          ],
        },
      ],
    },
    choices: [
      {
        id: "stop",
        label: "讓月月說：不要收",
        effects: [
          { type: "stat", path: "characters.jupiter.hope", op: "add", value: 12 },
          { type: "stat", path: "characters.jupiter.affection", op: "add", value: 6 },
        ],
      },
      {
        id: "watch",
        label: "讓她收完，不要攔",
        effects: [
          { type: "stat", path: "characters.jupiter.hope", op: "add", value: -10 },
          { type: "stat", path: "characters.jupiter.devotion", op: "add", value: 4 },
          { type: "weightMod", eventId: "EVENT_jupiter_hope_low_01", value: 20 },
          { type: "eventStatus", status: "unresolved" },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_mars_too_close_01",
    title: "火星與月月距離過近",
    description: "呼吸交錯。火星沒有再講笑話。「現在誰先退，誰就輸。」這已經不是互嗆。",
    characters: ["mars"],
    speaker: "芬達火星",
    weight: 26,
    tags: ["mars", "crisis", "romance"],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_mars_too_close_01" } },
        { not: { flag: "crisis_blocked_mars" } },
        {
          any: [
            { flag: "secret_mars" },
            { flag: "mars_duel_started" },
            { flag: "encounter_mars" },
            { flag: "date_broken_mars" },
            { flag: "public_jealous_mars" },
            { flag: "fate_rewritten_mars" },
            { completed: "EVENT_mars_chemistry_01" },
            { completed: "EVENT_mars_kings_01" },
          ],
        },
      ],
    },
    choices: [
      {
        id: "stay",
        label: "讓這段距離繼續縮短",
        effects: [
          { type: "stat", path: "characters.mars.chemistry", op: "add", value: 10 },
          { type: "stat", path: "characters.mars.affection", op: "add", value: 6 },
          { type: "tension", pair: "moon-mars", op: "add", value: 12 },
        ],
      },
      {
        id: "pull",
        label: "把距離拉開",
        effects: [
          { type: "stat", path: "characters.mars.pride", op: "add", value: 6 },
          { type: "stat", path: "characters.mars.provocation", op: "add", value: 6 },
          { type: "eventStatus", status: "unresolved" },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_rewrite_nini",
    title: "改寫：留下是不是等於愛",
    description: "神使改寫了日日那條線。接下來她會把「留下」當成愛，或第一次學會等。",
    characters: ["nini"],
    speaker: "七夕神使",
    weight: 24,
    tags: ["nini", "rewrite", "rare"],
    conditions: {
      all: [{ flag: "fate_rewritten_nini" }, { not: { completed: "EVENT_rewrite_nini" } }],
    },
    choices: [
      {
        id: "lock",
        label: "讓這條線鎖向病嬌危機",
        effects: [{ type: "forceEvent", eventId: "EVENT_nini_lockbox_01" }],
      },
      {
        id: "wait",
        label: "讓她願意等，先不收別人的東西",
        effects: [
          { type: "flag", key: "crisis_blocked_nini", value: true },
          { type: "weightMod", eventId: "EVENT_nini_lockbox_01", value: -999 },
          { type: "stat", path: "characters.nini.trust", op: "add", value: 8 },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_rewrite_meteor",
    title: "改寫：那句結婚還算不算",
    description: "神使改寫流星的童年線。要嘛約定今晚生效，要嘛舊愛裂開。",
    characters: ["meteor"],
    speaker: "七夕神使",
    weight: 24,
    tags: ["meteor", "rewrite", "rare"],
    conditions: {
      all: [{ flag: "fate_rewritten_meteor" }, { not: { completed: "EVENT_rewrite_meteor" } }],
    },
    choices: [
      {
        id: "bind",
        label: "讓默認交往成為現場事實",
        effects: [{ type: "forceEvent", eventId: "EVENT_meteor_never_broke_up_01" }],
      },
      {
        id: "break",
        label: "讓那句話停在小時候",
        effects: [
          { type: "flag", key: "crisis_blocked_meteor", value: true },
          { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: -999 },
          { type: "stat", path: "characters.meteor.pride", op: "add", value: 6 },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_rewrite_pepsi",
    title: "改寫：靈魂會不會認出彼此",
    description: "神使改寫百事那條線。共鳴成為今晚主線，或月月切斷映照。",
    characters: ["pepsi"],
    speaker: "七夕神使",
    weight: 24,
    tags: ["pepsi", "rewrite", "rare"],
    conditions: {
      all: [{ flag: "fate_rewritten_pepsi" }, { not: { completed: "EVENT_rewrite_pepsi" } }],
    },
    choices: [
      {
        id: "bind",
        label: "讓身份問題今晚必須被問出口",
        effects: [{ type: "forceEvent", eventId: "EVENT_pepsi_identity_01" }],
      },
      {
        id: "cut",
        label: "切斷映照，先不當另一個自己",
        effects: [
          { type: "flag", key: "crisis_blocked_pepsi", value: true },
          { type: "weightMod", eventId: "EVENT_pepsi_identity_01", value: -999 },
          { type: "stat", path: "characters.pepsi.destiny", op: "add", value: 4 },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_rewrite_jupiter",
    title: "改寫：她還要不要放手",
    description: "神使改寫木星那條線。阻止她離開，或讓她真的開始走。",
    characters: ["jupiter"],
    speaker: "七夕神使",
    weight: 24,
    tags: ["jupiter", "rewrite", "rare"],
    conditions: {
      all: [{ flag: "fate_rewritten_jupiter" }, { not: { completed: "EVENT_rewrite_jupiter" } }],
    },
    choices: [
      {
        id: "leave",
        label: "讓她開始收回備用品",
        effects: [{ type: "forceEvent", eventId: "EVENT_jupiter_packing_01" }],
      },
      {
        id: "stay",
        label: "封鎖離開，讓她今晚留下",
        effects: [
          { type: "flag", key: "crisis_blocked_jupiter", value: true },
          { type: "weightMod", eventId: "EVENT_jupiter_hope_low_01", value: -999 },
          { type: "weightMod", eventId: "EVENT_jupiter_packing_01", value: -999 },
          { type: "stat", path: "characters.jupiter.hope", op: "add", value: 12 },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_rewrite_mars",
    title: "改寫：討厭還是沒走",
    description: "神使改寫火星那條線。要嘛今晚距離過近，要嘛同類終於自動避開。",
    characters: ["mars"],
    speaker: "七夕神使",
    weight: 24,
    tags: ["mars", "rewrite", "rare"],
    conditions: {
      all: [{ flag: "fate_rewritten_mars" }, { not: { completed: "EVENT_rewrite_mars" } }],
    },
    choices: [
      {
        id: "close",
        label: "讓距離今晚必須過近",
        effects: [{ type: "forceEvent", eventId: "EVENT_mars_too_close_01" }],
      },
      {
        id: "away",
        label: "讓她先走，不繼續互傷",
        effects: [
          { type: "flag", key: "crisis_blocked_mars", value: true },
          { type: "weightMod", eventId: "EVENT_mars_too_close_01", value: -999 },
          { type: "stat", path: "characters.mars.pride", op: "add", value: 6 },
        ],
      },
    ],
  }),
];
