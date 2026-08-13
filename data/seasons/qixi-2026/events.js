export const EVENTS = [
  {
    id: "EVENT_001_prologue",
    title: "不過節的人",
    description:
      "七夕當天，可樂月月把教主辦公室的門反鎖。她靠在椅背上，對空氣宣布：「我本來就都沒在過節的啦。」窗外有鵲，走廊有腳步。她以為只要躲起來，就不會有七夕事件。",
    characters: [],
    speaker: "可樂月月",
    priority: 100,
    tags: ["prologue", "intro"],
    conditions: { not: { completed: "EVENT_001_prologue" } },
    choices: [
      {
        id: "listen",
        label: "先聽聽走廊是誰",
        effects: [
          { type: "flag", key: "moon_curious", value: true },
          { type: "queueEvent", eventId: "EVENT_002_knock_nini" },
        ],
      },
      {
        id: "hide",
        label: "把燈關掉，假裝不在",
        effects: [
          { type: "flag", key: "moon_hiding", value: true },
          { type: "stat", path: "characters.nini.trust", op: "add", value: -2 },
          { type: "queueEvent", eventId: "EVENT_002_knock_nini" },
        ],
      },
    ],
  },
  {
    id: "EVENT_002_knock_nini",
    title: "第一聲敲門：晶晶也來了",
    description:
      "門板被輕輕敲了三下。日日的聲音貼得很近：「月月，我帶晶晶來了。妳說過，喜歡見面的話……可以住這裡。」地下室的鑰匙在她口袋裡響。她不覺得自己打擾了誰，她只是回來了。",
    characters: ["nini"],
    speaker: "雪碧日日",
    priority: 95,
    tags: ["intro", "nini"],
    onEnter: [{ type: "flag", key: "nini_arrived", value: true }],
    choices: [
      {
        id: "open",
        label: "讓月月開門",
        effects: [
          { type: "stat", path: "characters.nini.affection", op: "add", value: 4 },
          { type: "stat", path: "characters.nini.trust", op: "add", value: 5 },
          { type: "stat", path: "characters.nini.obsession", op: "add", value: 3 },
          { type: "queueEvent", eventId: "EVENT_003_knock_meteor" },
        ],
      },
      {
        id: "wait",
        label: "再等一等，聽聽她會說什麼",
        effects: [
          { type: "stat", path: "characters.nini.obsession", op: "add", value: 6 },
          { type: "stat", path: "characters.nini.jealousy", op: "add", value: 2 },
          { type: "queueEvent", eventId: "EVENT_003_knock_meteor" },
        ],
      },
    ],
  },
  {
    id: "EVENT_003_knock_meteor",
    title: "第二聲：小時候就講過的",
    description:
      "流星沒有敲門，她直接拍門。「少裝。七夕妳會躲，我國小就知道。」停半拍，她又補得很輕：「長大要結婚的那句，我可沒當玩笑。」互嗆是她的保護色。約定才是她的本體。",
    characters: ["meteor"],
    speaker: "沙士流星",
    priority: 94,
    tags: ["intro", "meteor"],
    onEnter: [{ type: "flag", key: "meteor_arrived", value: true }],
    choices: [
      {
        id: "tease",
        label: "讓月月回嗆她一句",
        effects: [
          { type: "stat", path: "characters.meteor.affection", op: "add", value: 5 },
          { type: "stat", path: "characters.meteor.pride", op: "add", value: 3 },
          { type: "stat", path: "characters.meteor.nostalgia", op: "add", value: 4 },
          { type: "queueEvent", eventId: "EVENT_004_knock_pepsi" },
        ],
      },
      {
        id: "serious",
        label: "讓月月把童年約定當真",
        effects: [
          { type: "stat", path: "characters.meteor.destinyBelief", op: "add", value: 6 },
          { type: "stat", path: "characters.meteor.affection", op: "add", value: 3 },
          { type: "stat", path: "characters.meteor.pride", op: "add", value: -4 },
          { type: "queueEvent", eventId: "EVENT_004_knock_pepsi" },
        ],
      },
    ],
  },
  {
    id: "EVENT_004_knock_pepsi",
    title: "第三聲：另一個世界的自己",
    description:
      "走廊安靜了一下。深棕色頭髮的人站在門邊，幾乎不必自我介紹。「妳在躲節日，不是躲喜歡的人。」百事月月說。她沒有擠進來，只是把一份她也會懂的沉默，放在門縫裡。",
    characters: ["pepsi"],
    speaker: "百事月月",
    priority: 93,
    tags: ["intro", "pepsi"],
    onEnter: [{ type: "flag", key: "pepsi_arrived", value: true }],
    choices: [
      {
        id: "understood",
        label: "讓月月承認「被說中了」",
        effects: [
          { type: "stat", path: "characters.pepsi.soulResonance", op: "add", value: 5 },
          { type: "stat", path: "characters.pepsi.understanding", op: "add", value: 4 },
          { type: "stat", path: "characters.pepsi.affection", op: "add", value: 4 },
          { type: "queueEvent", eventId: "EVENT_005_knock_jupiter" },
        ],
      },
      {
        id: "distance",
        label: "讓月月把這份理解推遠一點",
        effects: [
          { type: "stat", path: "characters.pepsi.destinyBelief", op: "add", value: 3 },
          { type: "stat", path: "characters.pepsi.jealousy", op: "add", value: 2 },
          { type: "queueEvent", eventId: "EVENT_005_knock_jupiter" },
        ],
      },
    ],
  },
  {
    id: "EVENT_005_knock_jupiter",
    title: "第四聲：我帶了妳說想喝的",
    description:
      "木星敲門的節奏很整齊。她提起月月上周隨口提過的飲料，「我不知道妳今天要不要見我。可是我還是來了。」她的眼睛很亮，克制卻藏不住。這不是友情的距離。",
    characters: ["jupiter"],
    speaker: "西打木星",
    priority: 92,
    tags: ["intro", "jupiter"],
    onEnter: [{ type: "flag", key: "jupiter_arrived", value: true }],
    choices: [
      {
        id: "receive",
        label: "讓月月收下，並說謝謝",
        effects: [
          { type: "stat", path: "characters.jupiter.affection", op: "add", value: 5 },
          { type: "stat", path: "characters.jupiter.hope", op: "add", value: 6 },
          { type: "stat", path: "characters.jupiter.devotion", op: "add", value: 3 },
          { type: "queueEvent", eventId: "EVENT_006_knock_mars" },
        ],
      },
      {
        id: "honest",
        label: "讓月月問：妳是不是喜歡我？",
        effects: [
          { type: "stat", path: "characters.jupiter.affection", op: "add", value: 4 },
          { type: "stat", path: "characters.jupiter.restraint", op: "add", value: -6 },
          { type: "stat", path: "characters.jupiter.hope", op: "add", value: 8 },
          { type: "flag", key: "jupiter_asked", value: true },
          { type: "queueEvent", eventId: "EVENT_006_knock_mars" },
        ],
      },
    ],
  },
  {
    id: "EVENT_006_knock_mars",
    title: "第五聲：最不該出現的人",
    description:
      "火星用腳踢了一下門。「躲什麼？看到我就倒楣？」她笑得很刺。兩人本該確認眼神然後自動避開，可七夕把路堵死了。互看三秒，誰都不先認輸。",
    characters: ["mars"],
    speaker: "芬達火星",
    priority: 91,
    tags: ["intro", "mars"],
    onEnter: [{ type: "flag", key: "mars_arrived", value: true }],
    choices: [
      {
        id: "fight",
        label: "讓月月回擊，誰也不讓",
        effects: [
          { type: "stat", path: "characters.mars.chemistry", op: "add", value: 7 },
          { type: "stat", path: "characters.mars.provocation", op: "add", value: 4 },
          { type: "stat", path: "characters.mars.affection", op: "add", value: 3 },
          { type: "stat", path: "characters.mars.pride", op: "add", value: 2 },
          { type: "queueEvent", eventId: "EVENT_007_realization" },
        ],
      },
      {
        id: "look",
        label: "讓月月多看她一眼，沒有嗆回去",
        effects: [
          { type: "stat", path: "characters.mars.chemistry", op: "add", value: 5 },
          { type: "stat", path: "characters.mars.pride", op: "add", value: -5 },
          { type: "stat", path: "characters.mars.affection", op: "add", value: 5 },
          { type: "stat", path: "characters.mars.jealousy", op: "add", value: 3 },
          { type: "queueEvent", eventId: "EVENT_007_realization" },
        ],
      },
    ],
  },
  {
    id: "EVENT_007_realization",
    title: "等等，這五個人……",
    description:
      "辦公室裡站滿了不該在同一天出現的人。日日抱著晶晶，流星靠牆，百事看著月月，木星握著還沒打開的飲料，火星把視線刺過來。作為七夕神使的你忽然明白：她們不是來過節。她們都是來找月月的。",
    characters: ["nini", "meteor", "pepsi", "jupiter", "mars"],
    speaker: "七夕神使",
    priority: 90,
    tags: ["turn", "all"],
    conditions: { flag: "mars_arrived" },
    choices: [
      {
        id: "observe",
        label: "先觀察，讓感情自己浮出來",
        effects: [
          { type: "flag", key: "interventionsUnlocked", value: true },
          { type: "flag", key: "audience_aware", value: true },
          { type: "queueEvent", eventId: "EVENT_008_office_hub" },
        ],
      },
      {
        id: "nudge",
        label: "先輕輕推一把，看誰會先破功",
        effects: [
          { type: "flag", key: "interventionsUnlocked", value: true },
          { type: "flag", key: "audience_aware", value: true },
          { type: "tension", pair: "nini-meteor", op: "add", value: 8 },
          { type: "tension", pair: "meteor-mars", op: "add", value: 8 },
          { type: "tension", pair: "jupiter-mars", op: "add", value: 6 },
          { type: "queueEvent", eventId: "EVENT_008_office_hub" },
        ],
      },
    ],
  },
  {
    id: "EVENT_008_office_hub",
    title: "教主辦公室・後宮尚未起火",
    description:
      "五個人都還維持著「我只是剛好來」的表情。空氣卻開始熱。神使可以繼續旁觀，也可以花費命運值干預。記住：數值只是引擎，感情才是現場。",
    characters: ["nini", "meteor", "pepsi", "jupiter", "mars"],
    speaker: "現場",
    priority: 10,
    tags: ["hub"],
    hub: true,
    choices: [
      {
        id: "watch",
        label: "繼續旁觀，等待條件成熟的事件",
        effects: [{ type: "advanceStory" }],
      },
      {
        id: "hold",
        label: "先讓場面停在這裡",
        effects: [{ type: "log", text: "神使選擇按住場面。後宮火災指數暫時沒有爆炸。" }],
      },
    ],
  },
  {
    id: "EVENT_nini_obsession_01",
    title: "地下室的鑰匙",
    description:
      "日日把晶晶放到辦公桌上。「鑰匙還在。妳沒有收回去，就是還要我留下。」她笑得很乖。執念已經比那天的玩笑更重。",
    characters: ["nini"],
    speaker: "雪碧日日",
    priority: 70,
    tags: ["nini", "obsession"],
    conditions: {
      all: [
        { flag: "interventionsUnlocked" },
        { completed: "EVENT_007_realization" },
        { not: { completed: "EVENT_nini_obsession_01" } },
        { path: "characters.nini.obsession", op: "gte", value: 42 },
      ],
    },
    choices: [
      {
        id: "stay",
        label: "讓月月說：留下吧",
        effects: [
          { type: "stat", path: "characters.nini.obsession", op: "add", value: 8 },
          { type: "stat", path: "characters.nini.trust", op: "add", value: 6 },
          { type: "stat", path: "characters.nini.affection", op: "add", value: 5 },
          { type: "tension", pair: "nini-meteor", op: "add", value: 7 },
          { type: "flag", key: "nini_allowed_stay", value: true },
        ],
      },
      {
        id: "boundary",
        label: "讓月月說：住可以，不是擁有",
        effects: [
          { type: "stat", path: "characters.nini.trust", op: "add", value: -6 },
          { type: "stat", path: "characters.nini.obsession", op: "add", value: 10 },
          { type: "stat", path: "characters.nini.jealousy", op: "add", value: 8 },
        ],
      },
    ],
  },
  {
    id: "EVENT_mars_chemistry_01",
    title: "火星的挑釁",
    description:
      "火星把流星的「命中注定」學了一遍，學得很難聽。「少靠靈魂和童年撐場面。」她看月月，又很快別開。「我沒理由。我就是討厭妳剛好長這樣。」化學反應已經比理由先到。",
    characters: ["mars", "meteor"],
    speaker: "芬達火星",
    priority: 72,
    tags: ["mars", "conflict"],
    conditions: {
      all: [
        { flag: "interventionsUnlocked" },
        { completed: "EVENT_007_realization" },
        { not: { completed: "EVENT_mars_chemistry_01" } },
        { path: "characters.mars.chemistry", op: "gte", value: 48 },
        { path: "characters.mars.affection", op: "gte", value: 28 },
      ],
    },
    choices: [
      {
        id: "engage",
        label: "讓月月接招，棋逢對手",
        effects: [
          { type: "stat", path: "characters.mars.chemistry", op: "add", value: 8 },
          { type: "stat", path: "characters.mars.affection", op: "add", value: 6 },
          { type: "stat", path: "characters.mars.provocation", op: "add", value: 4 },
          { type: "tension", pair: "meteor-mars", op: "add", value: 10 },
          { type: "stat", path: "characters.meteor.pride", op: "add", value: 5 },
          { type: "flag", key: "mars_duel_started", value: true },
        ],
      },
      {
        id: "deflect",
        label: "讓月月去看別人，不跟她耗",
        effects: [
          { type: "stat", path: "characters.mars.jealousy", op: "add", value: 12 },
          { type: "stat", path: "characters.mars.pride", op: "add", value: 4 },
          { type: "stat", path: "characters.mars.affection", op: "add", value: 2 },
          { type: "tension", pair: "jupiter-mars", op: "add", value: 6 },
        ],
      },
    ],
  },
  {
    id: "EVENT_jupiter_devotion_01",
    title: "木星不要求答案",
    description:
      "木星把沒喝完的飲料放回桌上。「我當然難過。我喜歡妳這麼久了。」她吸了一口氣，「可是我喜歡妳，不代表妳欠我一個答案。」她沒有退場。她只是把選擇權完整地還給月月。",
    characters: ["jupiter"],
    speaker: "西打木星",
    priority: 68,
    tags: ["jupiter", "devotion"],
    conditions: {
      all: [
        { flag: "interventionsUnlocked" },
        { completed: "EVENT_007_realization" },
        { not: { completed: "EVENT_jupiter_devotion_01" } },
        { path: "characters.jupiter.devotion", op: "gte", value: 84 },
      ],
    },
    choices: [
      {
        id: "see_her",
        label: "讓月月認真看她，而不是把她當成好說話的人",
        effects: [
          { type: "stat", path: "characters.jupiter.affection", op: "add", value: 7 },
          { type: "stat", path: "characters.jupiter.hope", op: "add", value: 8 },
          { type: "stat", path: "characters.jupiter.restraint", op: "add", value: -4 },
          { type: "flag", key: "jupiter_seen", value: true },
        ],
      },
      {
        id: "thank",
        label: "讓月月只說謝謝妳一直在",
        effects: [
          { type: "stat", path: "characters.jupiter.devotion", op: "add", value: 5 },
          { type: "stat", path: "characters.jupiter.hope", op: "add", value: -6 },
          { type: "stat", path: "characters.jupiter.jealousy", op: "add", value: 5 },
        ],
      },
    ],
  },
  {
    id: "IV_letter",
    title: "干預：傳遞情書",
    description:
      "沒有署名的信出現在 {{target.name}} 會看見的地方。紙很薄，喜歡卻寫得很清楚。月月還沒發現神使動過手。",
    characters: [],
    speaker: "七夕神使",
    tags: ["intervention", "letter"],
    intervention: true,
    choices: [
      {
        id: "private",
        label: "只讓她自己讀到",
        effects: [
          { type: "stat", path: "characters.{{target.id}}.affection", op: "add", value: 6 },
          { type: "stat", path: "characters.{{target.id}}.{{target.uniquePrimary}}", op: "add", value: 4 },
          { type: "log", text: "{{target.name}} 把信收進口袋，沒有給任何人看。" },
        ],
      },
      {
        id: "seen",
        label: "讓信封也擦過月月眼前",
        effects: [
          { type: "stat", path: "characters.{{target.id}}.affection", op: "add", value: 4 },
          { type: "stat", path: "characters.{{target.id}}.jealousy", op: "add", value: 5 },
          { type: "tension", pair: "{{target.id}}-mars", op: "add", value: 4 },
          { type: "log", text: "月月看見了信封一角。現場的空氣緊了一拍。" },
        ],
      },
    ],
  },
  {
    id: "IV_peek",
    title: "干預：偷看秘密",
    description:
      "神使掀開 {{target.name}} 沒打算公開的那一頁。觀眾看見了她對月月的真心，以及她不敢讓其他人聽見的句子。",
    characters: [],
    speaker: "七夕神使",
    tags: ["intervention", "peek"],
    intervention: true,
    choices: [
      {
        id: "keep",
        label: "把秘密只留給觀眾",
        effects: [
          { type: "stat", path: "characters.{{target.id}}.affection", op: "add", value: 3 },
          { type: "revealSecret", characterId: "{{target.id}}" },
        ],
      },
      {
        id: "leak",
        label: "讓一句話不小心漏到現場",
        effects: [
          { type: "stat", path: "characters.{{target.id}}.jealousy", op: "add", value: 6 },
          { type: "stat", path: "characters.{{target.id}}.pride", op: "add", value: -3 },
          { type: "revealSecret", characterId: "{{target.id}}" },
          { type: "log", text: "有人聽見了不該聽見的半句。修羅場警報亮了一下。" },
        ],
      },
    ],
  },
  {
    id: "IV_encounter",
    title: "干預：製造偶遇",
    description:
      "走廊的燈忽然只亮一盞。月月推門出去倒水，與 {{target.name}} 單獨撞上。沒有其他人。這不是巧合，這是神使排的場。",
    characters: [],
    speaker: "現場",
    tags: ["intervention", "encounter"],
    intervention: true,
    choices: [
      {
        id: "stay",
        label: "讓這段兩人時間完整發生",
        effects: [
          { type: "stat", path: "characters.{{target.id}}.affection", op: "add", value: 8 },
          { type: "stat", path: "characters.{{target.id}}.{{target.uniquePrimary}}", op: "add", value: 5 },
          { type: "flag", key: "encounter_{{target.id}}", value: true },
          { type: "log", text: "月月與 {{target.name}} 單獨相遇。其他人暫時被關在門外。" },
        ],
      },
      {
        id: "interrupt",
        label: "在最甜的時候讓第三者出現",
        effects: [
          { type: "stat", path: "characters.{{target.id}}.affection", op: "add", value: 4 },
          { type: "stat", path: "characters.{{target.id}}.jealousy", op: "add", value: 8 },
          { type: "tension", pair: "{{target.id}}-nini", op: "add", value: 6 },
          { type: "flag", key: "encounter_{{target.id}}", value: true },
        ],
      },
    ],
  },
  {
    id: "IV_jealousy",
    title: "干預：挑起嫉妒",
    description:
      "神使讓 {{target.name}} 清楚看見：月月對另一個人的距離，比對她更近。嫉妒不是背景，它會變成下一句台詞。",
    characters: [],
    speaker: "七夕神使",
    tags: ["intervention", "jealousy"],
    intervention: true,
    choices: [
      {
        id: "spark",
        label: "點燃，但不要燒穿",
        effects: [
          { type: "stat", path: "characters.{{target.id}}.jealousy", op: "add", value: 10 },
          { type: "stat", path: "characters.{{target.id}}.affection", op: "add", value: 3 },
          { type: "tension", pair: "{{target.id}}-pepsi", op: "add", value: 7 },
        ],
      },
      {
        id: "burn",
        label: "讓她當眾問出口",
        effects: [
          { type: "stat", path: "characters.{{target.id}}.jealousy", op: "add", value: 14 },
          { type: "stat", path: "characters.{{target.id}}.{{target.uniquePrimary}}", op: "add", value: 4 },
          { type: "tension", pair: "{{target.id}}-meteor", op: "add", value: 8 },
          { type: "flag", key: "public_jealous_{{target.id}}", value: true },
        ],
      },
    ],
  },
  {
    id: "IV_sabotage",
    title: "干預：破壞約會",
    description:
      "{{target.name}} 排開的兩人時間被打亂。門被敲開，禮物被撞歪，台詞接不上。她看著月月，不知道該怪誰。",
    characters: [],
    speaker: "現場",
    tags: ["intervention", "sabotage"],
    intervention: true,
    choices: [
      {
        id: "break",
        label: "讓約會徹底泡湯",
        effects: [
          { type: "stat", path: "characters.{{target.id}}.affection", op: "add", value: -8 },
          { type: "stat", path: "characters.{{target.id}}.jealousy", op: "add", value: 10 },
          { type: "stat", path: "characters.{{target.id}}.pride", op: "add", value: 4 },
          { type: "flag", key: "date_broken_{{target.id}}", value: true },
        ],
      },
      {
        id: "almost",
        label: "破壞一半，留下未完成",
        effects: [
          { type: "stat", path: "characters.{{target.id}}.affection", op: "add", value: -3 },
          { type: "stat", path: "characters.{{target.id}}.{{target.uniquePrimary}}", op: "add", value: 6 },
          { type: "stat", path: "characters.{{target.id}}.jealousy", op: "add", value: 6 },
        ],
      },
    ],
  },
  {
    id: "IV_force",
    title: "干預：強制登場",
    description:
      "無論 {{target.name}} 原本站在多遠，神使把她推到月月面前。燈光打在她身上。她沒有準備好，可是已經不能假裝只是路過。",
    characters: [],
    speaker: "七夕神使",
    tags: ["intervention", "force"],
    intervention: true,
    choices: [
      {
        id: "center",
        label: "讓她成為這一幕的主角",
        effects: [
          { type: "stat", path: "characters.{{target.id}}.affection", op: "add", value: 5 },
          { type: "stat", path: "characters.{{target.id}}.{{target.uniquePrimary}}", op: "add", value: 6 },
          { type: "flag", key: "forced_{{target.id}}", value: true },
          { type: "log", text: "{{target.name}} 被強制推到舞台中央。" },
        ],
      },
    ],
  },
  {
    id: "IV_rewrite",
    title: "干預：改寫命運",
    description:
      "這很貴。神使改寫了 {{target.name}} 以為已經定下來的一條線。命運值燃燒時，現場的星光閃了一下。",
    characters: [],
    speaker: "七夕神使",
    tags: ["intervention", "rewrite"],
    intervention: true,
    choices: [
      {
        id: "ease",
        label: "把她的嫉妒降下來，換成更深的喜歡",
        effects: [
          { type: "stat", path: "characters.{{target.id}}.jealousy", op: "add", value: -20 },
          { type: "stat", path: "characters.{{target.id}}.affection", op: "add", value: 10 },
          { type: "flag", key: "fate_rewritten_{{target.id}}", value: true },
        ],
      },
      {
        id: "bind",
        label: "把她的核心戀愛觀再往前推一步",
        effects: [
          { type: "stat", path: "characters.{{target.id}}.{{target.uniquePrimary}}", op: "add", value: 15 },
          { type: "stat", path: "characters.{{target.id}}.affection", op: "add", value: 6 },
          { type: "flag", key: "fate_rewritten_{{target.id}}", value: true },
        ],
      },
    ],
  },
];

export const EVENT_BY_ID = Object.fromEntries(EVENTS.map((e) => [e.id, e]));
