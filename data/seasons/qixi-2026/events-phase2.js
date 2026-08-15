import { compileSpecials } from "./events-special-helpers.js";

const CRISIS = {
  nini: "CRISIS_nini_01",
  meteor: "CRISIS_meteor_01",
  pepsi: "CRISIS_pepsi_01",
  jupiter: "CRISIS_jupiter_01",
  mars: "CRISIS_mars_01",
};

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
  return [
    { type: "eventStatus", status: "unresolved" },
    { type: "flag", key: flag, value: true },
    { type: "forceEvent", eventId },
  ];
}

function pairOnEnter(a, b, flags, extra = []) {
  return [
    ...flags.map((key) => ({ type: "flag", key, value: true })),
    { type: "tension", pair: `${a}-${b}`, op: "add", value: 12 },
    { type: "weightMod", eventId: CRISIS[a], value: 10 },
    { type: "weightMod", eventId: CRISIS[b], value: 10 },
    ...extra,
  ];
}

function skeleton({
  id,
  title,
  description,
  characters,
  speaker = "現場",
  type = "CRISIS",
  weight = 24,
  tags = [],
  conditions,
  onEnter,
  choices,
  resultCopy,
  intervalCopy,
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
    resultCopy,
    intervalCopy,
  };
}

export const PHASE2_EVENTS = [
  ...compileSpecials([
    {
      id: "SHURA_nini_meteor_01",
      character: "nini",
      characters: ["nini", "meteor"],
      type: "CONFLICT",
      title: "永遠和以前",
      description:
        "日日說：「月月會一直跟我在一起。」\n流星笑著回答：「這句話，我小時候就聽過了。」\n日日抱緊晶晶：「那妳現在可以退出了。」\n流星第一次收起笑容。\n「偏偏這句話，我也沒有打算放棄。」",
      weight: 20,
      tags: ["conflict", "shura", "nini", "meteor"],
      resultCopy: "💣 日日 × 流星：永遠與以前正式碰撞。",
      intervalCopy: "💣 一個相信永遠，一個相信從前，而月月站在兩者中間。",
      onEnter: pairOnEnter("nini", "meteor", ["shura_nini_meteor_started", "nini_meteor_both_lines_hardened"], [
        { type: "log", text: "不干預：日日與流星開始爭奪月月本來就是誰的。兩條線同時變硬。" },
      ]),
      conditions: {
        all: [
          { flag: "dynamic_pool_unlocked" },
          { not: { completed: "SHURA_nini_meteor_01" } },
          {
            any: [
              { flag: "letter_misread_by_nini" },
              { flag: "letter_misread_by_meteor" },
              { flag: "date_broken_nini" },
              { flag: "date_broken_meteor" },
              {
                all: [
                  { any: [{ flag: "nini_allowed_stay" }, { completed: "EVENT_nini_obsession_01" }] },
                  { completed: "EVENT_meteor_nostalgia_01" },
                ],
              },
            ],
          },
        ],
      },
      choices: [
        { label: "站日日這邊", statsBy: { nini: { obsession: 8, jealousy: 6 }, meteor: { pride: -6, jealousy: 5 } }, effects: helpCrisis("nini") },
        { label: "站流星這邊", statsBy: { meteor: { destiny: 8, nostalgia: 7 }, nini: { jealousy: 8, obsession: 5 } }, effects: helpCrisis("meteor") },
        { label: "叫兩人冷靜", statsBy: { nini: { trust: 4, jealousy: -3 }, meteor: { pride: 4, jealousy: -3 } }, effects: calmEffects("moon_refuses_nini_meteor_claim") },
        { label: "說「我兩個都不想失去」", statsBy: { nini: { affection: 7, jealousy: 7 }, meteor: { affection: 7, jealousy: 7 } }, effects: continueTo("SHURA_nini_meteor_02", "shura_nini_meteor_unresolved") },
      ],
    },
    {
      id: "SHURA_meteor_pepsi_01",
      character: "meteor",
      characters: ["meteor", "pepsi"],
      type: "CONFLICT",
      title: "從前與另一個我",
      description:
        "流星說她和月月有很多年共同回憶。\n百事卻只是看著她：「回憶是妳們的，但她現在是現在。」\n流星冷笑：「妳連她小時候都沒見過。」\n百事回答：「可是她現在難過的時候，我知道。」\n兩個人第一次真正安靜地看著彼此。",
      weight: 18,
      tags: ["conflict", "shura", "pepsi", "meteor"],
      resultCopy: "💣 流星 × 百事：回憶與共鳴正式碰撞。",
      intervalCopy: "💣 一個知道她從哪裡來，一個知道她現在是誰。",
      onEnter: pairOnEnter("meteor", "pepsi", ["meteor_pressed_time", "pepsi_rejected_early_equals_same"], [
        { type: "log", text: "不干預：流星用時間壓百事。百事不吃醋，提出「早不是同一件事。」" },
      ]),
      conditions: {
        all: [
          { flag: "dynamic_pool_unlocked" },
          { not: { completed: "SHURA_meteor_pepsi_01" } },
          {
            any: [
              { flag: "letter_misread_by_meteor" },
              { flag: "date_broken_pepsi" },
              { flag: "date_broken_meteor" },
              {
                all: [
                  { completed: "EVENT_meteor_nostalgia_01" },
                  {
                    any: [
                      { completed: "EVENT_pepsi_soul_01" },
                      { completed: "EVENT_pepsi_understanding_01" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      choices: [
        { label: "選擇流星", statsBy: { meteor: { nostalgia: 8, destiny: 7 }, pepsi: { destiny: 8, resonance: -3 } }, effects: helpCrisis("meteor") },
        { label: "選擇百事", statsBy: { pepsi: { resonance: 8, similarity: 7 }, meteor: { jealousy: 8, pride: -5 } }, effects: helpCrisis("pepsi") },
        { label: "說兩者不能比較", statsBy: { meteor: { pride: 4, jealousy: -3 }, pepsi: { destiny: 4, resonance: 3 } }, effects: calmEffects("shura_pepsi_meteor_interrupted") },
        { label: "說「我現在只看現在」", statsBy: { pepsi: { affection: 6, similarity: 5 }, meteor: { affection: -5, nostalgia: -4 } }, effects: continueTo("SHURA_meteor_pepsi_02", "shura_pepsi_meteor_unresolved") },
      ],
    },
    {
      id: "SHURA_nini_pepsi_01",
      character: "nini",
      characters: ["nini", "pepsi"],
      type: "CONFLICT",
      title: "妳真的懂她嗎？",
      description:
        "日日說百事只是因為像月月，所以才覺得自己懂她。\n百事卻回答：「像不是原因。」\n她看向月月：「是因為我知道她沒說出口的那一半。」\n日日第一次沒有立刻反駁。\n晶晶被她抱得更緊了。",
      weight: 18,
      tags: ["conflict", "shura", "nini", "pepsi"],
      resultCopy: "💣 日日 × 百事：依賴與共鳴正面碰撞。",
      intervalCopy: "💣 一個想擁有，一個想理解。",
      onEnter: pairOnEnter("nini", "pepsi", ["nini_reads_pepsi_as_theft", "pepsi_did_not_counter"], [
        { type: "log", text: "不干預：日日把理解聽成搶走內心。百事不反擊，場面更危險。" },
      ]),
      conditions: {
        all: [
          { flag: "dynamic_pool_unlocked" },
          { not: { completed: "SHURA_nini_pepsi_01" } },
          {
            any: [
              { flag: "letter_misread_by_nini" },
              { flag: "date_broken_nini" },
              { flag: "date_broken_pepsi" },
              {
                all: [
                  { completed: "EVENT_pepsi_understanding_01" },
                  {
                    any: [
                      { completed: "EVENT_nini_obsession_01" },
                      { completed: "EVENT_nini_jealousy_01" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      choices: [
        { label: "替百事說話", statsBy: { pepsi: { resonance: 8, similarity: 6 }, nini: { jealousy: 8, trust: -4 } }, effects: helpCrisis("pepsi") },
        { label: "替日日說話", statsBy: { nini: { affection: 8, obsession: 7 }, pepsi: { similarity: -5, destiny: 4 } }, effects: helpCrisis("nini") },
        { label: "說兩人都懂一部分", statsBy: { nini: { trust: 4, jealousy: -3 }, pepsi: { resonance: 5, destiny: 3 } }, effects: calmEffects("pepsi_said_not_stealing") },
        { label: "保持沉默", statsBy: { nini: { jealousy: 6, obsession: 4 }, pepsi: { resonance: 6 } }, effects: continueTo("SHURA_nini_pepsi_02", "shura_nini_pepsi_unresolved") },
      ],
    },
    {
      id: "SHURA_jupiter_mars_01",
      character: "jupiter",
      characters: ["jupiter", "mars"],
      type: "CONFLICT",
      title: "溫柔和挑釁",
      description:
        "火星說木星太溫柔，所以永遠搶不到月月。\n木星第一次笑了：「那妳呢？」\n火星挑眉：「至少我敢讓她知道我想要。」\n木星看著她：「我也想要。」\n兩個人第一次沒有互相否認。",
      weight: 20,
      tags: ["conflict", "shura", "jupiter", "mars"],
      resultCopy: "💣 木星 × 火星：克制與挑釁正式開戰。",
      intervalCopy: "🔥 一個把愛藏得很深，一個恨不得直接把它喊出來。",
      onEnter: pairOnEnter("jupiter", "mars", ["jupiter_closed_door", "mars_pulled_door"], [
        { type: "log", text: "不干預：木星把門帶上。火星把門拉開。希望下降，化學反應上升。" },
      ]),
      conditions: {
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
            ],
          },
        ],
      },
      choices: [
        { label: "靠近木星", statsBy: { jupiter: { affection: 8, devotion: 7 }, mars: { provocation: 5 } }, effects: helpCrisis("jupiter") },
        { label: "靠近火星", statsBy: { mars: { affection: 8, chemistry: 8 }, jupiter: { jealousy: 8, hope: -5 } }, effects: helpCrisis("mars") },
        { label: "說兩個都喜歡", statsBy: { jupiter: { jealousy: 7, affection: 5 }, mars: { provocation: 7, affection: 5 } }, effects: calmEffects("moon_opened_the_door") },
        { label: "問她們誰比較敢", statsBy: { mars: { provocation: 9, chemistry: 6 }, jupiter: { patience: -5, jealousy: 5 } }, effects: continueTo("SHURA_jupiter_mars_02", "shura_jupiter_mars_unresolved") },
      ],
    },
  ]),
  skeleton({
    id: "SHURA_nini_meteor_02",
    title: "誰才算一直在",
    description:
      "衝突從「誰比較重要」升級成「誰才有資格留在月月身邊」。不干預時，日日開始收流星留下的東西，流星用小名反擊。",
    characters: ["nini", "meteor"],
    type: "CRISIS",
    weight: 24,
    tags: ["crisis", "conflict", "shura", "nini", "meteor"],
    onEnter: [
      { type: "flag", key: "nini_collecting_meteor_things", value: true },
      { type: "flag", key: "meteor_used_childhood_name", value: true },
      { type: "stat", path: "characters.nini.obsession", op: "add", value: 6 },
      { type: "stat", path: "characters.meteor.pride", op: "add", value: 6 },
      { type: "stat", path: "characters.meteor.destiny", op: "add", value: 4 },
      { type: "tension", pair: "nini-meteor", op: "add", value: 10 },
      { type: "weightMod", eventId: "CRISIS_nini_01", value: 12 },
      { type: "weightMod", eventId: "CRISIS_meteor_01", value: 12 },
      {
        type: "log",
        text: "不干預：日日開始收流星留下的東西。流星用小名反擊。資格之爭已經開始。",
      },
    ],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "SHURA_nini_meteor_02" } },
        {
          any: [
            { unresolved: "SHURA_nini_meteor_01" },
            { flag: "public_jealous_nini" },
            { flag: "public_jealous_meteor" },
            { flag: "forced_nini" },
            { flag: "forced_meteor" },
          ],
        },
      ],
    },
    choices: [
      {
        id: "continue",
        label: "讓日日繼續收，讓流星把小名說下去",
        effects: [
          { type: "flag", key: "shura_nini_meteor_escalated", value: true },
          { type: "weightMod", eventId: "CRISIS_meteor_01", value: 14 },
          { type: "forceEvent", eventId: "CRISIS_nini_01" },
        ],
      },
      {
        id: "stop_nini",
        label: "阻止日日收東西",
        effects: [
          { type: "flag", key: "nini_stopped_collecting", value: true },
          { type: "weightMod", eventId: "CRISIS_nini_01", value: -30 },
          { type: "forceEvent", eventId: "CRISIS_meteor_01" },
        ],
      },
      {
        id: "meteor_nickname",
        label: "讓流星把小名說到底",
        effects: [
          { type: "flag", key: "meteor_nickname_said", value: true },
          { type: "weightMod", eventId: "CRISIS_meteor_01", value: 16 },
          { type: "forceEvent", eventId: "CRISIS_meteor_01" },
        ],
      },
      {
        id: "forbid_define",
        label: "禁止兩人繼續當眾定義月月",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "moon_forbids_public_claim", value: true },
          { type: "weightMod", eventId: "CRISIS_nini_01", value: -12 },
          { type: "weightMod", eventId: "CRISIS_meteor_01", value: -12 },
        ],
      },
    ],
  }),
  skeleton({
    id: "SHURA_meteor_pepsi_02",
    title: "月月只能承認一種命定",
    description:
      "現場要月月承認一種命定。不干預時，月月不回答，兩種命定同時成立，FINAL 前兩人的 Night Score 都被抬高。",
    characters: ["pepsi", "meteor", "moon"],
    type: "CRISIS",
    weight: 26,
    tags: ["crisis", "shura", "pepsi", "meteor"],
    onEnter: [
      { type: "flag", key: "moon_silent_on_destiny", value: true },
      { type: "flag", key: "both_destinies_stand", value: true },
      { type: "stat", path: "characters.pepsi.destiny", op: "add", value: 8 },
      { type: "stat", path: "characters.pepsi.resonance", op: "add", value: 6 },
      { type: "stat", path: "characters.meteor.destiny", op: "add", value: 8 },
      { type: "tension", pair: "meteor-pepsi", op: "add", value: 12 },
      { type: "weightMod", eventId: "CRISIS_meteor_01", value: 14 },
      { type: "weightMod", eventId: "CRISIS_pepsi_01", value: 14 },
      {
        type: "log",
        text: "不干預：月月不回答。兩種命定同時成立。身份衝突已無法迴避。",
      },
    ],
    conditions: {
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
          ],
        },
      ],
    },
    choices: [
      {
        id: "continue",
        label: "讓月月繼續不回答",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "identity_conflict_unavoidable", value: true },
          { type: "weightMod", eventId: "CRISIS_meteor_01", value: 12 },
          { type: "forceEvent", eventId: "CRISIS_pepsi_01" },
        ],
      },
      {
        id: "admit_meteor",
        label: "承認流星",
        effects: [
          { type: "flag", key: "destiny_admitted_meteor", value: true },
          { type: "flag", key: "destiny_denied_pepsi", value: true },
          { type: "weightMod", eventId: "CRISIS_pepsi_01", value: 18 },
          { type: "forceEvent", eventId: "CRISIS_pepsi_01" },
        ],
      },
      {
        id: "admit_pepsi",
        label: "承認百事",
        effects: [
          { type: "flag", key: "destiny_admitted_pepsi", value: true },
          { type: "flag", key: "destiny_denied_meteor", value: true },
          { type: "weightMod", eventId: "CRISIS_meteor_01", value: 18 },
          { type: "forceEvent", eventId: "CRISIS_meteor_01" },
        ],
      },
      {
        id: "refuse_define",
        label: "拒絕替任何人定義",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "moon_refuses_to_define_destiny", value: true },
          { type: "weightMod", eventId: "CRISIS_meteor_01", value: 8 },
          { type: "weightMod", eventId: "CRISIS_pepsi_01", value: 8 },
        ],
      },
    ],
  }),
  skeleton({
    id: "SHURA_nini_pepsi_02",
    title: "晶晶轉過去",
    description:
      "日日要求月月不要再讓百事「說中」。不干預時，佔有開始限制理解。晶晶轉過去，現場進入危機。",
    characters: ["nini", "pepsi"],
    type: "CRISIS",
    weight: 26,
    tags: ["crisis", "shura", "nini", "pepsi"],
    onEnter: [
      { type: "flag", key: "nini_forbids_pepsi_understanding", value: true },
      { type: "flag", key: "jingjing_turned_away", value: true },
      { type: "stat", path: "characters.nini.obsession", op: "add", value: 8 },
      { type: "stat", path: "characters.nini.trust", op: "add", value: -4 },
      { type: "tension", pair: "nini-pepsi", op: "add", value: 12 },
      { type: "weightMod", eventId: "CRISIS_nini_01", value: 10 },
      { type: "weightMod", eventId: "CRISIS_pepsi_01", value: 10 },
      { type: "log", text: "不干預：日日要求月月不要再讓百事說中。佔有開始限制理解。" },
    ],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "SHURA_nini_pepsi_02" } },
        {
          any: [
            { unresolved: "SHURA_nini_pepsi_01" },
            { completed: "EVENT_nini_dependence_01" },
          ],
        },
      ],
    },
    choices: [
      {
        id: "continue",
        label: "讓晶晶繼續轉過去",
        effects: [
          { type: "flag", key: "nini_pepsi_possession_wins", value: true },
          { type: "forceEvent", eventId: "CRISIS_nini_01" },
        ],
      },
      {
        id: "crystal_back",
        label: "讓日日把晶晶轉回來",
        effects: [
          { type: "flag", key: "jingjing_turned_back", value: true },
          { type: "weightMod", eventId: "CRISIS_nini_01", value: 18 },
          { type: "forceEvent", eventId: "CRISIS_nini_01" },
        ],
      },
      {
        id: "pepsi_back",
        label: "讓百事退後",
        effects: [
          { type: "flag", key: "pepsi_backed_off", value: true },
          { type: "stat", path: "characters.pepsi.resonance", op: "add", value: -8 },
          { type: "weightMod", eventId: "CRISIS_pepsi_01", value: 16 },
          { type: "forceEvent", eventId: "CRISIS_pepsi_01" },
        ],
      },
      {
        id: "neither",
        label: "月月兩邊都不選",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "nini_pepsi_mutual_loss", value: true },
          { type: "weightMod", eventId: "CRISIS_nini_01", value: 8 },
          { type: "weightMod", eventId: "CRISIS_pepsi_01", value: 8 },
        ],
      },
    ],
  }),
  ...compileSpecials([
    {
      id: "SHURA_jupiter_mars_02",
      character: "jupiter",
      characters: ["jupiter", "mars"],
      type: "CRISIS",
      title: "她不是獎品",
      description:
        "火星和木星同時伸手去拿月月桌上的飲料。\n兩人對看了一眼，誰都沒有放手。\n木星說：「她不是獎品。」\n火星回答：「我知道。」\n「所以我才不打算輸。」",
      weight: 26,
      tags: ["crisis", "shura", "jupiter", "mars"],
      resultCopy: "💣 木星 × 火星：兩人第一次承認競爭本身就是戰局。",
      intervalCopy: "💣 修羅場最危險的時候，不是有人爭，而是兩個人都知道自己正在爭。",
      onEnter: [
        { type: "flag", key: "jupiter_packing_started", value: true },
        { type: "flag", key: "mars_thinks_he_won", value: true },
        { type: "tension", pair: "jupiter-mars", op: "add", value: 10 },
        { type: "weightMod", eventId: "CRISIS_jupiter_01", value: 16 },
        { type: "weightMod", eventId: "EVENT_jupiter_hope_low_01", value: 12 },
        {
          type: "log",
          text: "不干預：木星開始收拾東西。火星以為自己贏了。木星離開機率上升。",
        },
      ],
      conditions: {
        all: [
          { flag: "dynamic_pool_unlocked" },
          { not: { completed: "SHURA_jupiter_mars_02" } },
          {
            any: [
              { completed: "SHURA_jupiter_mars_01" },
              {
                all: [
                  { flag: "jupiter_packing_started" },
                  { not: { flag: "mars_walked" } },
                ],
              },
              { flag: "forced_jupiter" },
              { flag: "forced_mars" },
            ],
          },
        ],
      },
      choices: [
        {
          label: "讓木星拿走",
          statsBy: { jupiter: { affection: 7, devotion: 6 }, mars: { pride: -5, provocation: 6 } },
          effects: [{ type: "flag", key: "jupiter_leaving_rising", value: true }, { type: "forceEvent", eventId: "CRISIS_jupiter_01" }],
        },
        {
          label: "讓火星拿走",
          statsBy: { mars: { affection: 7, chemistry: 7 }, jupiter: { jealousy: 8, hope: -4 } },
          effects: [{ type: "flag", key: "shura_helped_mars", value: true }, { type: "forceEvent", eventId: "CRISIS_mars_01" }],
        },
        {
          label: "自己拿走",
          statsBy: { jupiter: { patience: 5, jealousy: -4 }, mars: { pride: 5, provocation: -4 } },
          effects: [
            { type: "flag", key: "mars_stopped_hurting", value: true },
            { type: "weightMod", eventId: "CRISIS_mars_01", value: -50 },
          ],
        },
        {
          label: "把飲料分成兩杯",
          statsBy: { jupiter: { patience: 6, jealousy: -3 }, mars: { chemistry: 6, provocation: -3 } },
          effects: [
            { type: "eventStatus", status: "unresolved" },
            { type: "flag", key: "jupiter_mars_both_stay", value: true },
          ],
        },
      ],
    },
  ]),
];
