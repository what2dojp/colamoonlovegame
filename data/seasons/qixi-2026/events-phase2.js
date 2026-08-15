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

export const PHASE2_EVENTS = [
  skeleton({
    id: "EVENT_shura_nini_meteor_01",
    title: "鑰匙還是瓶蓋",
    description:
      "日日握著地下室的鑰匙。流星把沙士瓶蓋拍在桌上。不干預時，兩人開始爭奪「月月本來就是誰的」。月月若沒有做出選擇，兩條線都會變硬。",
    characters: ["nini", "meteor"],
    speaker: "現場",
    type: "CONFLICT",
    weight: 20,
    tags: ["conflict", "shura", "nini", "meteor"],
    onEnter: [
      { type: "flag", key: "shura_nini_meteor_started", value: true },
      { type: "flag", key: "nini_meteor_both_lines_hardened", value: true },
      { type: "stat", path: "characters.nini.obsession", op: "add", value: 8 },
      { type: "stat", path: "characters.meteor.destiny", op: "add", value: 6 },
      { type: "stat", path: "characters.meteor.nostalgia", op: "add", value: 6 },
      { type: "tension", pair: "nini-meteor", op: "add", value: 12 },
      { type: "weightMod", eventId: "EVENT_nini_lockbox_01", value: 10 },
      { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: 10 },
      { type: "log", text: "不干預：日日與流星開始爭奪月月本來就是誰的。兩條線同時變硬。" },
    ],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_shura_nini_meteor_01" } },
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
      {
        id: "continue",
        label: "讓她們繼續爭，月月不選",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "shura_nini_meteor_unresolved", value: true },
          { type: "forceEvent", eventId: "EVENT_shura_nini_meteor_02" },
        ],
      },
      {
        id: "help_nini",
        label: "幫日日",
        effects: [
          { type: "flag", key: "shura_helped_nini", value: true },
          { type: "weightMod", eventId: "EVENT_nini_lockbox_01", value: 18 },
          { type: "forceEvent", eventId: "EVENT_nini_lockbox_01" },
        ],
      },
      {
        id: "help_meteor",
        label: "幫流星",
        effects: [
          { type: "flag", key: "shura_helped_meteor", value: true },
          { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: 18 },
          { type: "forceEvent", eventId: "EVENT_meteor_never_broke_up_01" },
        ],
      },
      {
        id: "pull_moon",
        label: "把月月自己拉開，不讓兩人定義她",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "moon_refuses_nini_meteor_claim", value: true },
          { type: "tension", pair: "nini-meteor", op: "add", value: 6 },
          { type: "forceEvent", eventId: "EVENT_shura_nini_meteor_02" },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_shura_nini_meteor_02",
    title: "誰才算一直在",
    description:
      "衝突從「誰比較重要」升級成「誰才有資格留在月月身邊」。不干預時，日日開始收流星留下的東西，流星用小名反擊。",
    characters: ["nini", "meteor"],
    speaker: "現場",
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
      { type: "weightMod", eventId: "EVENT_nini_lockbox_01", value: 12 },
      { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: 12 },
      {
        type: "log",
        text: "不干預：日日開始收流星留下的東西。流星用小名反擊。資格之爭已經開始。",
      },
    ],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_shura_nini_meteor_02" } },
        {
          any: [
            { unresolved: "EVENT_shura_nini_meteor_01" },
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
          { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: 14 },
          { type: "forceEvent", eventId: "EVENT_nini_lockbox_01" },
        ],
      },
      {
        id: "stop_nini",
        label: "阻止日日收東西",
        effects: [
          { type: "flag", key: "nini_stopped_collecting", value: true },
          { type: "weightMod", eventId: "EVENT_nini_lockbox_01", value: -30 },
          { type: "forceEvent", eventId: "EVENT_meteor_never_broke_up_01" },
        ],
      },
      {
        id: "meteor_nickname",
        label: "讓流星把小名說到底",
        effects: [
          { type: "flag", key: "meteor_nickname_said", value: true },
          { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: 16 },
          { type: "forceEvent", eventId: "EVENT_meteor_never_broke_up_01" },
        ],
      },
      {
        id: "forbid_define",
        label: "禁止兩人繼續當眾定義月月",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "moon_forbids_public_claim", value: true },
          { type: "weightMod", eventId: "EVENT_nini_lockbox_01", value: -12 },
          { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: -12 },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_shura_pepsi_meteor_01",
    title: "誰比較早，誰比較像",
    description:
      "流星用「時間」壓百事。百事不走傳統吃醋，只提出：「早不是同一件事。」不干預時，兩種命定開始互相覆蓋。",
    characters: ["pepsi", "meteor"],
    speaker: "現場",
    type: "CONFLICT",
    weight: 18,
    tags: ["conflict", "shura", "pepsi", "meteor"],
    onEnter: [
      { type: "flag", key: "meteor_pressed_time", value: true },
      { type: "flag", key: "pepsi_rejected_early_equals_same", value: true },
      { type: "stat", path: "characters.meteor.destiny", op: "add", value: 6 },
      { type: "stat", path: "characters.meteor.nostalgia", op: "add", value: 4 },
      { type: "stat", path: "characters.pepsi.similarity", op: "add", value: 4 },
      { type: "tension", pair: "meteor-pepsi", op: "add", value: 12 },
      { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: 8 },
      { type: "weightMod", eventId: "EVENT_pepsi_identity_01", value: 8 },
      { type: "log", text: "不干預：流星用時間壓百事。百事不吃醋，提出「早不是同一件事。」" },
    ],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_shura_pepsi_meteor_01" } },
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
      {
        id: "continue",
        label: "讓兩種命定繼續互相覆蓋",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "shura_pepsi_meteor_unresolved", value: true },
          { type: "forceEvent", eventId: "EVENT_shura_pepsi_meteor_02" },
        ],
      },
      {
        id: "meteor_ownership",
        label: "讓流星把童年約定說成所有權",
        effects: [
          { type: "flag", key: "meteor_claimed_ownership", value: true },
          { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: 16 },
          { type: "forceEvent", eventId: "EVENT_meteor_never_broke_up_01" },
        ],
      },
      {
        id: "pepsi_sync",
        label: "讓百事再次與月月同步",
        effects: [
          { type: "flag", key: "pepsi_resync", value: true },
          { type: "weightMod", eventId: "EVENT_pepsi_identity_01", value: 16 },
          { type: "forceEvent", eventId: "EVENT_pepsi_identity_01" },
        ],
      },
      {
        id: "interrupt",
        label: "打斷比較",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "shura_pepsi_meteor_interrupted", value: true },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_shura_pepsi_meteor_02",
    title: "月月只能承認一種命定",
    description:
      "現場要月月承認一種命定。不干預時，月月不回答，兩種命定同時成立，FINAL 前兩人的 Night Score 都被抬高。",
    characters: ["pepsi", "meteor", "moon"],
    speaker: "現場",
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
      { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: 14 },
      { type: "weightMod", eventId: "EVENT_pepsi_identity_01", value: 14 },
      {
        type: "log",
        text: "不干預：月月不回答。兩種命定同時成立。身份衝突已無法迴避。",
      },
    ],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_shura_pepsi_meteor_02" } },
        {
          any: [
            { completed: "EVENT_shura_pepsi_meteor_01" },
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
          { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: 12 },
          { type: "forceEvent", eventId: "EVENT_pepsi_identity_01" },
        ],
      },
      {
        id: "admit_meteor",
        label: "承認流星",
        effects: [
          { type: "flag", key: "destiny_admitted_meteor", value: true },
          { type: "flag", key: "destiny_denied_pepsi", value: true },
          { type: "weightMod", eventId: "EVENT_pepsi_identity_01", value: 18 },
          { type: "forceEvent", eventId: "EVENT_pepsi_identity_01" },
        ],
      },
      {
        id: "admit_pepsi",
        label: "承認百事",
        effects: [
          { type: "flag", key: "destiny_admitted_pepsi", value: true },
          { type: "flag", key: "destiny_denied_meteor", value: true },
          { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: 18 },
          { type: "forceEvent", eventId: "EVENT_meteor_never_broke_up_01" },
        ],
      },
      {
        id: "refuse_define",
        label: "拒絕替任何人定義",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "moon_refuses_to_define_destiny", value: true },
          { type: "weightMod", eventId: "EVENT_meteor_never_broke_up_01", value: 8 },
          { type: "weightMod", eventId: "EVENT_pepsi_identity_01", value: 8 },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_shura_nini_pepsi_01",
    title: "她連心裡都不留給我",
    description:
      "日日把百事的理解聽成「搶走月月內心」。不干預時，日日信任下降、執念上升；百事不反擊，場面更危險。",
    characters: ["nini", "pepsi"],
    speaker: "現場",
    type: "CONFLICT",
    weight: 18,
    tags: ["conflict", "shura", "nini", "pepsi"],
    onEnter: [
      { type: "flag", key: "nini_reads_pepsi_as_theft", value: true },
      { type: "flag", key: "pepsi_did_not_counter", value: true },
      { type: "stat", path: "characters.nini.trust", op: "add", value: -8 },
      { type: "stat", path: "characters.nini.obsession", op: "add", value: 8 },
      { type: "stat", path: "characters.pepsi.similarity", op: "add", value: 2 },
      { type: "tension", pair: "nini-pepsi", op: "add", value: 12 },
      { type: "weightMod", eventId: "EVENT_nini_lockbox_01", value: 12 },
      { type: "weightMod", eventId: "EVENT_pepsi_identity_01", value: 8 },
      { type: "log", text: "不干預：日日把理解聽成搶走內心。百事不反擊，場面更危險。" },
    ],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_shura_nini_pepsi_01" } },
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
      {
        id: "continue",
        label: "讓日日繼續把理解當成搶奪",
        effects: [
          { type: "flag", key: "nini_possession_over_understanding", value: true },
          { type: "weightMod", eventId: "EVENT_pepsi_identity_01", value: 10 },
          { type: "forceEvent", eventId: "EVENT_nini_lockbox_01" },
        ],
      },
      {
        id: "stop_pepsi",
        label: "讓百事停止代答",
        effects: [
          { type: "flag", key: "pepsi_stopped_answering", value: true },
          { type: "weightMod", eventId: "EVENT_nini_lockbox_01", value: 16 },
          { type: "forceEvent", eventId: "EVENT_nini_lockbox_01" },
        ],
      },
      {
        id: "hear_nini",
        label: "讓日日聽見「我不是來搶的」",
        effects: [
          { type: "flag", key: "pepsi_said_not_stealing", value: true },
          { type: "weightMod", eventId: "EVENT_pepsi_identity_01", value: 16 },
          { type: "forceEvent", eventId: "EVENT_pepsi_identity_01" },
        ],
      },
      {
        id: "do_nothing",
        label: "什麼都不做",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "shura_nini_pepsi_unresolved", value: true },
          { type: "forceEvent", eventId: "EVENT_shura_nini_pepsi_02" },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_shura_nini_pepsi_02",
    title: "晶晶轉過去",
    description:
      "日日要求月月不要再讓百事「說中」。不干預時，佔有開始限制理解。晶晶轉過去，現場進入危機。",
    characters: ["nini", "pepsi"],
    speaker: "現場",
    type: "CRISIS",
    weight: 26,
    tags: ["crisis", "shura", "nini", "pepsi"],
    onEnter: [
      { type: "flag", key: "nini_forbids_pepsi_understanding", value: true },
      { type: "flag", key: "jingjing_turned_away", value: true },
      { type: "stat", path: "characters.nini.obsession", op: "add", value: 8 },
      { type: "stat", path: "characters.nini.trust", op: "add", value: -4 },
      { type: "tension", pair: "nini-pepsi", op: "add", value: 12 },
      { type: "weightMod", eventId: "EVENT_nini_lockbox_01", value: 10 },
      { type: "weightMod", eventId: "EVENT_pepsi_identity_01", value: 10 },
      { type: "log", text: "不干預：日日要求月月不要再讓百事說中。佔有開始限制理解。" },
    ],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_shura_nini_pepsi_02" } },
        {
          any: [
            { unresolved: "EVENT_shura_nini_pepsi_01" },
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
          { type: "forceEvent", eventId: "EVENT_nini_lockbox_01" },
        ],
      },
      {
        id: "crystal_back",
        label: "讓日日把晶晶轉回來",
        effects: [
          { type: "flag", key: "jingjing_turned_back", value: true },
          { type: "weightMod", eventId: "EVENT_nini_lockbox_01", value: 18 },
          { type: "forceEvent", eventId: "EVENT_nini_lockbox_01" },
        ],
      },
      {
        id: "pepsi_back",
        label: "讓百事退後",
        effects: [
          { type: "flag", key: "pepsi_backed_off", value: true },
          { type: "stat", path: "characters.pepsi.resonance", op: "add", value: -8 },
          { type: "weightMod", eventId: "EVENT_pepsi_identity_01", value: 16 },
          { type: "forceEvent", eventId: "EVENT_pepsi_identity_01" },
        ],
      },
      {
        id: "neither",
        label: "月月兩邊都不選",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "nini_pepsi_mutual_loss", value: true },
          { type: "weightMod", eventId: "EVENT_nini_lockbox_01", value: 8 },
          { type: "weightMod", eventId: "EVENT_pepsi_identity_01", value: 8 },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_shura_jupiter_mars_01",
    title: "門口",
    description:
      "木星想把門帶上。火星把門拉開。不干預時，成全和不肯放手卡在同一個門口。",
    characters: ["jupiter", "mars"],
    speaker: "現場",
    type: "CONFLICT",
    weight: 20,
    tags: ["conflict", "shura", "jupiter", "mars"],
    onEnter: [
      { type: "flag", key: "jupiter_closed_door", value: true },
      { type: "flag", key: "mars_pulled_door", value: true },
      { type: "stat", path: "characters.jupiter.hope", op: "add", value: -8 },
      { type: "stat", path: "characters.mars.chemistry", op: "add", value: 8 },
      { type: "tension", pair: "jupiter-mars", op: "add", value: 12 },
      { type: "weightMod", eventId: "EVENT_jupiter_packing_01", value: 10 },
      { type: "weightMod", eventId: "EVENT_mars_too_close_01", value: 10 },
      { type: "log", text: "不干預：木星把門帶上。火星把門拉開。希望下降，化學反應上升。" },
    ],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_shura_jupiter_mars_01" } },
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
      {
        id: "continue",
        label: "讓門口繼續僵住",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "shura_jupiter_mars_unresolved", value: true },
          { type: "forceEvent", eventId: "EVENT_shura_jupiter_mars_02" },
        ],
      },
      {
        id: "help_jupiter",
        label: "幫木星把門關上",
        effects: [
          { type: "flag", key: "shura_helped_jupiter", value: true },
          { type: "weightMod", eventId: "EVENT_jupiter_packing_01", value: 18 },
          { type: "forceEvent", eventId: "EVENT_jupiter_packing_01" },
        ],
      },
      {
        id: "help_mars",
        label: "幫火星把門拉開",
        effects: [
          { type: "flag", key: "shura_helped_mars", value: true },
          { type: "weightMod", eventId: "EVENT_mars_too_close_01", value: 18 },
          { type: "forceEvent", eventId: "EVENT_mars_too_close_01" },
        ],
      },
      {
        id: "moon_opens",
        label: "讓月月自己開門",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "moon_opened_the_door", value: true },
        ],
      },
    ],
  }),
  skeleton({
    id: "EVENT_shura_jupiter_mars_02",
    title: "祝福對互傷",
    description:
      "木星開始收拾東西。火星以為自己贏了。不干預時，月月可能只是被兩人的互傷吸住，木星離開機率上升。",
    characters: ["jupiter", "mars"],
    speaker: "現場",
    type: "CRISIS",
    weight: 26,
    tags: ["crisis", "shura", "jupiter", "mars"],
    onEnter: [
      { type: "flag", key: "jupiter_packing_started", value: true },
      { type: "flag", key: "mars_thinks_he_won", value: true },
      { type: "stat", path: "characters.jupiter.hope", op: "add", value: -10 },
      { type: "stat", path: "characters.mars.pride", op: "add", value: 6 },
      { type: "stat", path: "characters.mars.chemistry", op: "add", value: 4 },
      { type: "tension", pair: "jupiter-mars", op: "add", value: 10 },
      { type: "weightMod", eventId: "EVENT_jupiter_packing_01", value: 16 },
      { type: "weightMod", eventId: "EVENT_jupiter_hope_low_01", value: 12 },
      {
        type: "log",
        text: "不干預：木星開始收拾東西。火星以為自己贏了。木星離開機率上升。",
      },
    ],
    conditions: {
      all: [
        { flag: "dynamic_pool_unlocked" },
        { not: { completed: "EVENT_shura_jupiter_mars_02" } },
        {
          any: [
            { completed: "EVENT_shura_jupiter_mars_01" },
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
        id: "continue",
        label: "讓木星繼續收，讓火星以為自己贏了",
        effects: [
          { type: "flag", key: "jupiter_leaving_rising", value: true },
          { type: "forceEvent", eventId: "EVENT_jupiter_packing_01" },
        ],
      },
      {
        id: "stop_leave",
        label: "阻止木星離開",
        effects: [
          { type: "flag", key: "jupiter_stayed", value: true },
          { type: "flag", key: "crisis_blocked_jupiter", value: true },
          { type: "stat", path: "characters.jupiter.hope", op: "add", value: 12 },
          { type: "weightMod", eventId: "EVENT_jupiter_packing_01", value: -999 },
          { type: "weightMod", eventId: "EVENT_jupiter_hope_low_01", value: -999 },
        ],
      },
      {
        id: "mars_stop",
        label: "讓火星第一次停止傷害",
        effects: [
          { type: "flag", key: "mars_stopped_hurting", value: true },
          { type: "flag", key: "mars_relationship_shifted", value: true },
          { type: "stat", path: "characters.mars.provocation", op: "add", value: -8 },
          { type: "weightMod", eventId: "EVENT_mars_too_close_01", value: -50 },
        ],
      },
      {
        id: "both_stay",
        label: "讓兩人同時留在場上",
        effects: [
          { type: "eventStatus", status: "unresolved" },
          { type: "flag", key: "jupiter_mars_both_stay", value: true },
          { type: "tension", pair: "jupiter-mars", op: "add", value: 8 },
          { type: "weightMod", eventId: "EVENT_jupiter_packing_01", value: 8 },
          { type: "weightMod", eventId: "EVENT_mars_too_close_01", value: 8 },
        ],
      },
    ],
  }),
];
