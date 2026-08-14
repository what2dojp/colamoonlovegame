function skeleton({
  id,
  title,
  description,
  characters,
  speaker,
  weight,
  tags,
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
    pool,
    weight,
    repeatable: false,
    tags,
    conditions,
    onEnter,
    choices,
  };
}

function ordinary(id) {
  return {
    all: [{ flag: "dynamic_pool_unlocked" }, { not: { completed: id } }],
  };
}

function twoChoices(stayId, stayLabel, stayEffects, leaveId, leaveLabel, leaveEffects) {
  return [
    { id: stayId, label: stayLabel, effects: stayEffects },
    { id: leaveId, label: leaveLabel, effects: leaveEffects },
  ];
}

export const DAILY_EVENTS = [
  skeleton({
    id: "EVENT_nini_sweet_01",
    title: "日日把七夕變成約會",
    description:
      "日日把晶晶放到旁邊，自己坐到月月正對面。她沒有問要不要幫忙倒水，只把一朵從走廊摘來的小花別在月月耳邊。「今天妳是我的。不是因為節日，是因為我想這樣說。」",
    characters: ["nini"],
    speaker: "雪碧日日",
    weight: 28,
    tags: ["nini", "sweet", "romance", "daily"],
    conditions: ordinary("EVENT_nini_sweet_01"),
    choices: twoChoices(
      "lean",
      "讓月月把花戴好，接受這場示愛",
      [
        { type: "stat", path: "characters.nini.affection", op: "add", value: 6 },
        { type: "stat", path: "characters.nini.obsession", op: "add", value: 3 },
        { type: "log", text: "日日把月月當成世界上最特別的那一個。" },
      ],
      "tease",
      "讓月月笑她太會製造氣氛",
      [
        { type: "stat", path: "characters.nini.affection", op: "add", value: 4 },
        { type: "stat", path: "characters.nini.trust", op: "add", value: 3 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_nini_nature_01",
    title: "日日的佔有是先說喜歡",
    description:
      "其他人還在走廊說話。日日只看著月月，聲音又輕又準。「我不需要妳需要我。我要妳知道：妳是被喜歡的。」晶晶被她抱在手邊，像見證，不像武器。",
    characters: ["nini"],
    speaker: "雪碧日日",
    weight: 20,
    tags: ["nini", "nature", "romance", "daily"],
    conditions: ordinary("EVENT_nini_nature_01"),
    choices: twoChoices(
      "hear",
      "讓月月聽完這句，不把它當玩笑",
      [
        { type: "stat", path: "characters.nini.affection", op: "add", value: 5 },
        { type: "stat", path: "characters.nini.obsession", op: "add", value: 4 },
      ],
      "play",
      "讓月月回她：那妳再說一次",
      [
        { type: "stat", path: "characters.nini.affection", op: "add", value: 4 },
        { type: "stat", path: "characters.nini.trust", op: "add", value: 4 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_nini_overstep_01",
    title: "日日把髮圈收進口袋",
    description:
      "月月低頭整理頭髮時，一條髮圈掉到椅腳。日日撿起來，沒有立刻還。她笑得很甜，把髮圈繞在自己手指上轉了一圈。「我先幫妳拿著。等一下再給妳。」",
    characters: ["nini"],
    speaker: "雪碧日日",
    weight: 10,
    tags: ["nini", "overstep", "daily"],
    conditions: ordinary("EVENT_nini_overstep_01"),
    choices: twoChoices(
      "let",
      "讓她先拿著，場面還是很甜",
      [
        { type: "stat", path: "characters.nini.obsession", op: "add", value: 4 },
        { type: "flag", key: "foreshadow_nini_hair", value: true },
        { type: "log", text: "日日多收了一件屬於月月的小東西。現在看起來只像貼心。" },
      ],
      "ask",
      "讓月月伸手要回來",
      [
        { type: "stat", path: "characters.nini.trust", op: "add", value: 2 },
        { type: "stat", path: "characters.nini.obsession", op: "add", value: 2 },
        { type: "flag", key: "foreshadow_nini_hair", value: true },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_nini_foreshadow_01",
    title: "襪子怎麼少一雙",
    description:
      "月月在辦公室角落換鞋，忽然停住。「我明明帶了那雙白襪子。」她翻過袋子，沒找到。日日抱著晶晶坐在旁邊，表情很乖。「也許掉在走廊了。我等一下幫妳找。」",
    characters: ["nini"],
    speaker: "可樂月月",
    weight: 8,
    tags: ["nini", "foreshadow", "daily"],
    conditions: ordinary("EVENT_nini_foreshadow_01"),
    choices: twoChoices(
      "wonder",
      "讓月月嘀咕：我的東西怎麼又不見了",
      [
        { type: "flag", key: "foreshadow_nini_missing", value: true },
        { type: "stat", path: "characters.nini.obsession", op: "add", value: 2 },
        { type: "log", text: "月月隱約覺得少了東西。日日沒有承認。危機還沒爆發。" },
      ],
      "drop",
      "讓月月先算了，去找日日說話",
      [
        { type: "flag", key: "foreshadow_nini_missing", value: true },
        { type: "stat", path: "characters.nini.affection", op: "add", value: 2 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_meteor_sweet_01",
    title: "流星帶月月走舊路",
    description:
      "流星把月月拽到自動販賣機旁邊，像回到那間第一次坐下的咖啡館。「這台會卡罐。以前也是這樣。妳先踢左邊，我再嗆妳。」她沒有講分手，只把現在接回過去。",
    characters: ["meteor"],
    speaker: "沙士流星",
    weight: 28,
    tags: ["meteor", "sweet", "romance", "daily"],
    conditions: ordinary("EVENT_meteor_sweet_01"),
    choices: twoChoices(
      "walk",
      "讓月月跟她走完這段舊路",
      [
        { type: "stat", path: "characters.meteor.affection", op: "add", value: 5 },
        { type: "stat", path: "characters.meteor.nostalgia", op: "add", value: 4 },
        { type: "stat", path: "characters.meteor.destiny", op: "add", value: 2 },
      ],
      "detail",
      "讓月月先提起那雙同款鞋子",
      [
        { type: "stat", path: "characters.meteor.affection", op: "add", value: 6 },
        { type: "stat", path: "characters.meteor.nostalgia", op: "add", value: 3 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_meteor_nature_01",
    title: "以前也是這樣",
    description:
      "流星忽然異口同聲接上月月還沒說完的後半句，然後自己先愣住。「妳看，小時候也是這樣。」她把這件事說成默契，不是命運演講。兩人笑完，走廊安靜了一拍。",
    characters: ["meteor"],
    speaker: "沙士流星",
    weight: 20,
    tags: ["meteor", "nature", "romance", "daily"],
    conditions: ordinary("EVENT_meteor_nature_01"),
    choices: twoChoices(
      "remember",
      "讓月月把那句童年的話接下去",
      [
        { type: "stat", path: "characters.meteor.affection", op: "add", value: 4 },
        { type: "stat", path: "characters.meteor.nostalgia", op: "add", value: 5 },
      ],
      "now",
      "讓月月說：現在這樣也很好",
      [
        { type: "stat", path: "characters.meteor.affection", op: "add", value: 5 },
        { type: "stat", path: "characters.meteor.pride", op: "add", value: 2 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_meteor_overstep_01",
    title: "流星把現在講成還沒結束",
    description:
      "話題本來只是飲料。流星卻隨口補了一句：「我們又沒有說要停。」她很快用互嗆蓋過去，「誰要聽那麼肉麻。我是說，妳還欠我一罐沙士。」語氣輕，像還沒認真。",
    characters: ["meteor"],
    speaker: "沙士流星",
    weight: 10,
    tags: ["meteor", "overstep", "daily"],
    conditions: ordinary("EVENT_meteor_overstep_01"),
    choices: twoChoices(
      "skip",
      "讓月月假裝沒聽見那句「沒停」",
      [
        { type: "stat", path: "characters.meteor.destiny", op: "add", value: 3 },
        { type: "flag", key: "foreshadow_meteor_unbroken", value: true },
        { type: "log", text: "流星把沒聯絡過的空白，暫時說成還沒分手。現場還是很甜。" },
      ],
      "ask",
      "讓月月問：妳是指小時候嗎",
      [
        { type: "stat", path: "characters.meteor.pride", op: "add", value: 3 },
        { type: "flag", key: "foreshadow_meteor_unbroken", value: true },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_meteor_foreshadow_01",
    title: "很久沒真正聯絡過",
    description:
      "流星翻出一張舊照片，指著兩人坐過的位子。「後來我們就……很少傳訊了。」她停了一下，又很快改口，「可是那不算分開。分開要講出來。我們沒講。」",
    characters: ["meteor"],
    speaker: "沙士流星",
    weight: 8,
    tags: ["meteor", "foreshadow", "daily"],
    conditions: ordinary("EVENT_meteor_foreshadow_01"),
    choices: twoChoices(
      "notice",
      "讓月月聽出這句話裡的裂縫",
      [
        { type: "flag", key: "foreshadow_meteor_gap", value: true },
        { type: "stat", path: "characters.meteor.nostalgia", op: "add", value: 3 },
        { type: "log", text: "流星自己知道空白很長。她選擇先不拆穿自己。" },
      ],
      "hold",
      "讓月月先陪她看完照片",
      [
        { type: "flag", key: "foreshadow_meteor_gap", value: true },
        { type: "stat", path: "characters.meteor.affection", op: "add", value: 3 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_pepsi_sweet_01",
    title: "百事和月月同時點了同一杯",
    description:
      "還沒開口，百事已經把菜單轉過來。「這個。」月月也正好指著同一格。兩人一起笑出來。百事說：「我知道妳會選這個。」語氣像分享，不像搶走選擇。",
    characters: ["pepsi"],
    speaker: "百事月月",
    weight: 28,
    tags: ["pepsi", "sweet", "romance", "daily"],
    conditions: ordinary("EVENT_pepsi_sweet_01"),
    choices: twoChoices(
      "sync",
      "讓月月承認這份默契很好玩",
      [
        { type: "stat", path: "characters.pepsi.affection", op: "add", value: 5 },
        { type: "stat", path: "characters.pepsi.resonance", op: "add", value: 3 },
        { type: "stat", path: "characters.pepsi.similarity", op: "add", value: 2 },
      ],
      "order",
      "讓月月故意改點，看她會不會跟上",
      [
        { type: "stat", path: "characters.pepsi.affection", op: "add", value: 4 },
        { type: "stat", path: "characters.pepsi.understanding", op: "add", value: 3 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_pepsi_nature_01",
    title: "我們不需要其他人理解",
    description:
      "有人在遠處討論七夕怎麼過。百事沒看他們，只對月月說：「我們真的很像。這種像，不必拿去解釋給別人聽。」兩人同時吸了一口氣，又同時笑。",
    characters: ["pepsi"],
    speaker: "百事月月",
    weight: 20,
    tags: ["pepsi", "nature", "romance", "daily"],
    conditions: ordinary("EVENT_pepsi_nature_01"),
    choices: twoChoices(
      "agree",
      "讓月月把這份像當成舒服的事",
      [
        { type: "stat", path: "characters.pepsi.affection", op: "add", value: 4 },
        { type: "stat", path: "characters.pepsi.similarity", op: "add", value: 4 },
      ],
      "private",
      "讓月月說：那就只留給我們兩個",
      [
        { type: "stat", path: "characters.pepsi.resonance", op: "add", value: 4 },
        { type: "stat", path: "characters.pepsi.understanding", op: "add", value: 3 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_pepsi_overstep_01",
    title: "百事替月月把話說完",
    description:
      "有人問月月今晚想喝什麼。月月才張口，百事已經答：「她要冰的。」她側過臉，很確定，「我知道妳在想什麼。」現場沒有爆炸，只是月月的句子被先用掉了。",
    characters: ["pepsi"],
    speaker: "百事月月",
    weight: 10,
    tags: ["pepsi", "overstep", "daily"],
    conditions: ordinary("EVENT_pepsi_overstep_01"),
    choices: twoChoices(
      "allow",
      "讓月月沒有更正，把默契留著",
      [
        { type: "stat", path: "characters.pepsi.similarity", op: "add", value: 4 },
        { type: "flag", key: "foreshadow_pepsi_speak", value: true },
        { type: "log", text: "百事替月月決定了一件小事。現在聽起來仍像懂她。" },
      ],
      "correct",
      "讓月月自己把那句話說完",
      [
        { type: "stat", path: "characters.pepsi.understanding", op: "add", value: 2 },
        { type: "flag", key: "foreshadow_pepsi_speak", value: true },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_pepsi_foreshadow_01",
    title: "頻率只是隨口一提",
    description:
      "百事看著燈管，忽然說：「妳相信兩個頻率很近的人，可以共用同一段安靜嗎？」她立刻又笑開，「當我亂講。可是剛剛我們呼吸真的停在同一拍。」",
    characters: ["pepsi"],
    speaker: "百事月月",
    weight: 8,
    tags: ["pepsi", "foreshadow", "daily"],
    conditions: ordinary("EVENT_pepsi_foreshadow_01"),
    choices: twoChoices(
      "hear",
      "讓月月把這句話記下，先不當真",
      [
        { type: "flag", key: "foreshadow_pepsi_frequency", value: true },
        { type: "stat", path: "characters.pepsi.resonance", op: "add", value: 2 },
        { type: "log", text: "頻率、同步、融合都還只是伏筆。百事沒有把儀式拿出來。" },
      ],
      "laugh",
      "讓月月笑她中二，繼續靠在一起",
      [
        { type: "flag", key: "foreshadow_pepsi_frequency", value: true },
        { type: "stat", path: "characters.pepsi.affection", op: "add", value: 3 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_jupiter_sweet_01",
    title: "木星把習慣都記得",
    description:
      "木星把吸管插好，冰量和甜度都對。「上周妳說這個比較順口。」月月說謝謝時，她的眼睛亮了一下，很快又收住。「我一點都不覺得麻煩。我只希望妳讓我照顧妳。」",
    characters: ["jupiter"],
    speaker: "芬達木星",
    weight: 28,
    tags: ["jupiter", "sweet", "romance", "daily"],
    conditions: ordinary("EVENT_jupiter_sweet_01"),
    choices: twoChoices(
      "thanks",
      "讓月月認真說謝謝，看她高興",
      [
        { type: "stat", path: "characters.jupiter.affection", op: "add", value: 6 },
        { type: "stat", path: "characters.jupiter.hope", op: "add", value: 4 },
        { type: "stat", path: "characters.jupiter.devotion", op: "add", value: 2 },
      ],
      "keep",
      "讓月月把這杯喝完，不拒絕幫忙",
      [
        { type: "stat", path: "characters.jupiter.affection", op: "add", value: 5 },
        { type: "stat", path: "characters.jupiter.devotion", op: "add", value: 3 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_jupiter_nature_01",
    title: "不要拒絕我的幫助",
    description:
      "月月說自己可以拿袋子。木星沒有生氣，只把袋子換到自己手上，聲音很軟。「不要拒絕我的幫助。妳開心，我就夠了。」她沒有要月月只看她，只是把自己放得很低。",
    characters: ["jupiter"],
    speaker: "芬達木星",
    weight: 20,
    tags: ["jupiter", "nature", "romance", "daily"],
    conditions: ordinary("EVENT_jupiter_nature_01"),
    choices: twoChoices(
      "accept",
      "讓月月把袋子交給她",
      [
        { type: "stat", path: "characters.jupiter.affection", op: "add", value: 5 },
        { type: "stat", path: "characters.jupiter.devotion", op: "add", value: 3 },
      ],
      "see",
      "讓月月看見她因為被需要而滿足",
      [
        { type: "stat", path: "characters.jupiter.hope", op: "add", value: 3 },
        { type: "stat", path: "characters.jupiter.affection", op: "add", value: 4 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_jupiter_overstep_01",
    title: "木星把別人的備忘錄收走",
    description:
      "桌上有一張不是月月字跡的便條。木星經過時把它翻過去，又若無其事地收進自己口袋。她對月月笑：「我幫妳清一下。妳不需要看那些。」月月本人沒看見她收的是誰的東西。",
    characters: ["jupiter"],
    speaker: "芬達木星",
    weight: 10,
    tags: ["jupiter", "overstep", "daily"],
    conditions: ordinary("EVENT_jupiter_overstep_01"),
    choices: twoChoices(
      "unaware",
      "讓月月只覺得桌面變整齊",
      [
        { type: "stat", path: "characters.jupiter.devotion", op: "add", value: 3 },
        { type: "flag", key: "foreshadow_jupiter_rival", value: true },
        { type: "log", text: "木星替月月處理了情敵留下的紙。月月還以為只是貼心。" },
      ],
      "ask",
      "讓月月問她收了什麼",
      [
        { type: "stat", path: "characters.jupiter.patience", op: "add", value: 2 },
        { type: "flag", key: "foreshadow_jupiter_rival", value: true },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_jupiter_foreshadow_01",
    title: "被拒絕以後她更努力",
    description:
      "月月說這次自己來就好。木星點頭，沒有發脾氣。她走開兩步，對自己說得很輕：「是不是我做得還不夠？」然後把下一杯飲料準備得更仔細。",
    characters: ["jupiter"],
    speaker: "芬達木星",
    weight: 8,
    tags: ["jupiter", "foreshadow", "daily"],
    conditions: ordinary("EVENT_jupiter_foreshadow_01"),
    choices: twoChoices(
      "watch",
      "讓月月看見她在自我檢討",
      [
        { type: "flag", key: "foreshadow_jupiter_more", value: true },
        { type: "stat", path: "characters.jupiter.devotion", op: "add", value: 3 },
        { type: "log", text: "木星沒有限制月月。她把拒絕理解成自己還不夠好。" },
      ],
      "stop",
      "讓月月叫住她：妳已經很好了",
      [
        { type: "flag", key: "foreshadow_jupiter_more", value: true },
        { type: "stat", path: "characters.jupiter.hope", op: "add", value: 4 },
        { type: "stat", path: "characters.jupiter.affection", op: "add", value: 3 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_mars_sweet_01",
    title: "火星來互撩",
    description:
      "火星把袖口捲起來，靠到月月椅子旁邊。「誰先認真誰輸。現在開始算。」她笑得很帥，不是來吵架，是來玩。兩人丟了三句，走廊的空氣變熱，卻很好玩。",
    characters: ["mars"],
    speaker: "西打火星",
    weight: 28,
    tags: ["mars", "sweet", "romance", "daily"],
    conditions: ordinary("EVENT_mars_sweet_01"),
    choices: twoChoices(
      "catch",
      "讓月月把球丟回去，誰也不先認輸",
      [
        { type: "stat", path: "characters.mars.affection", op: "add", value: 4 },
        { type: "stat", path: "characters.mars.chemistry", op: "add", value: 6 },
        { type: "tension", pair: "moon-mars", op: "add", value: 4 },
      ],
      "closer",
      "讓月月故意靠近一步，看她閃不閃",
      [
        { type: "stat", path: "characters.mars.chemistry", op: "add", value: 5 },
        { type: "stat", path: "characters.mars.pride", op: "add", value: 3 },
        { type: "tension", pair: "moon-mars", op: "add", value: 5 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_mars_nature_01",
    title: "我們就玩玩",
    description:
      "火星把這句話說得很乾脆。「我們就玩玩。誰先暈誰丟臉。」她自己也知道月月不好拿下，所以眼睛更亮。這不是嫌棄，是棋逢對手才開始有興趣。",
    characters: ["mars"],
    speaker: "西打火星",
    weight: 20,
    tags: ["mars", "nature", "romance", "daily"],
    conditions: ordinary("EVENT_mars_nature_01"),
    choices: twoChoices(
      "play",
      "讓月月也說：那就玩玩",
      [
        { type: "stat", path: "characters.mars.affection", op: "add", value: 3 },
        { type: "stat", path: "characters.mars.chemistry", op: "add", value: 5 },
        { type: "stat", path: "characters.mars.provocation", op: "add", value: 2 },
      ],
      "win",
      "讓月月笑她：那妳先保證自己不暈",
      [
        { type: "stat", path: "characters.mars.pride", op: "add", value: 4 },
        { type: "stat", path: "characters.mars.chemistry", op: "add", value: 4 },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_mars_overstep_01",
    title: "火星假裝吃醋",
    description:
      "月月剛跟別人講完一句話，火星就用肩膀撞過來。「喔，原來現在輪到她了。」她說得像玩笑，眼神卻多停了半秒。然後她自己先笑：「誰吃醋啊。我只是習慣妳在旁邊。」",
    characters: ["mars"],
    speaker: "西打火星",
    weight: 10,
    tags: ["mars", "overstep", "daily"],
    conditions: ordinary("EVENT_mars_overstep_01"),
    choices: twoChoices(
      "poke",
      "讓月月拆穿：妳剛剛那句不像玩玩",
      [
        { type: "stat", path: "characters.mars.chemistry", op: "add", value: 4 },
        { type: "flag", key: "foreshadow_mars_real", value: true },
        { type: "tension", pair: "moon-mars", op: "add", value: 4 },
      ],
      "play",
      "讓月月配合她，把吃醋當成遊戲",
      [
        { type: "stat", path: "characters.mars.pride", op: "add", value: 3 },
        { type: "flag", key: "foreshadow_mars_real", value: true },
        { type: "log", text: "火星還不肯承認自己動心。這只是一點越界。" },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_mars_foreshadow_01",
    title: "其他人忽然沒意思",
    description:
      "又有人來找火星要聯絡方式。她隨口拒絕，動作比以前快。等那人走遠，她盯著地板說：「我以前也是這樣啊。怎麼可能。」月月沒有追問。火星自己把話吞回去。",
    characters: ["mars"],
    speaker: "西打火星",
    weight: 8,
    tags: ["mars", "foreshadow", "daily"],
    conditions: ordinary("EVENT_mars_foreshadow_01"),
    choices: twoChoices(
      "see",
      "讓月月看見她第一次拒絕別人",
      [
        { type: "flag", key: "foreshadow_mars_refuse", value: true },
        { type: "stat", path: "characters.mars.chemistry", op: "add", value: 3 },
        { type: "log", text: "火星開始覺得其他人沒意思。她自己還不願意說喜歡。" },
      ],
      "tease",
      "讓月月笑她：只是玩玩的人怎麼會拒",
      [
        { type: "flag", key: "foreshadow_mars_refuse", value: true },
        { type: "stat", path: "characters.mars.pride", op: "add", value: 3 },
        { type: "stat", path: "characters.mars.affection", op: "add", value: 2 },
      ]
    ),
  }),
];

export const MEMORY_EVENTS = [
  skeleton({
    id: "EVENT_memory_nini",
    title: "回憶：地下室裡的保管箱",
    description:
      "觀眾看見日日關上門以後的畫面。她把月月掉在沙發上的頭髮捲起來，連同隱形眼鏡盒、穿過的襪子，一格一格放進箱子。「不是偷。是保管。月月會亂。」晶晶坐在箱子上，像在作證。",
    characters: ["nini"],
    speaker: "現場",
    pool: false,
    weight: 1,
    tags: ["nini", "memory", "peek"],
    conditions: {
      any: [{ flag: "secret_nini" }, { flag: "memory_unlocked_nini" }],
    },
    choices: twoChoices(
      "watch",
      "讓這段回憶停在箱子關上",
      [
        { type: "flag", key: "memory_nini_seen", value: true },
        { type: "log", text: "日日的保管箱被看見了。這還不是當眾拆開的危機。" },
      ],
      "close",
      "先把畫面蓋上，不讓現場聽見",
      [
        { type: "flag", key: "memory_nini_seen", value: true },
        { type: "eventStatus", status: "unresolved" },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_memory_meteor",
    title: "回憶：同款鞋子的咖啡館",
    description:
      "觀眾看見更早以前。咖啡館裡兩雙一樣的鞋先碰到，然後才是對話。流星說「以前也來過」，月月說「我也是」。她們一起去過舊操場、舊販賣機、小時候的那條巷。後來很久沒聯絡。流星把那段空白從畫面裡刪掉。",
    characters: ["meteor"],
    speaker: "現場",
    pool: false,
    weight: 1,
    tags: ["meteor", "memory", "peek"],
    conditions: {
      any: [{ flag: "secret_meteor" }, { flag: "memory_unlocked_meteor" }],
    },
    choices: twoChoices(
      "watch",
      "讓回憶停在兩人還常見面的時候",
      [
        { type: "flag", key: "memory_meteor_seen", value: true },
        { type: "log", text: "流星與月月的共同回憶被看見。空白還沒被當眾拆穿。" },
      ],
      "close",
      "先不把「很久沒聯絡」說給現場聽",
      [
        { type: "flag", key: "memory_meteor_seen", value: true },
        { type: "eventStatus", status: "unresolved" },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_memory_pepsi",
    title: "回憶：第一次發現我們這麼像",
    description:
      "觀眾看見兩人第一次對上的那個下午。不是一見鍾情的搶，是同時講出同一句吐槽，然後一起愣住。百事說：「我們真的很像。」月月還沒把這句聽成危險。那時候還沒有頻率、儀式、融合。",
    characters: ["pepsi"],
    speaker: "現場",
    pool: false,
    weight: 1,
    tags: ["pepsi", "memory", "peek"],
    conditions: {
      any: [{ flag: "secret_pepsi" }, { flag: "memory_unlocked_pepsi" }],
    },
    choices: twoChoices(
      "watch",
      "讓回憶停在第一次默契",
      [
        { type: "flag", key: "memory_pepsi_seen", value: true },
        { type: "log", text: "百事與月月的相似被看見。融合還只是很後面的事。" },
      ],
      "close",
      "先把畫面留在觀眾這邊",
      [
        { type: "flag", key: "memory_pepsi_seen", value: true },
        { type: "eventStatus", status: "unresolved" },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_memory_jupiter",
    title: "回憶：月月說她是朋友",
    description:
      "觀眾看見學校走廊。木星被堵住的時候，月月只是走過來，很自然地說「她是我朋友」。那些人散了。木星本來只想成為能幫上忙的人。月月每次謝謝，都讓她覺得自己可以存在。",
    characters: ["jupiter"],
    speaker: "現場",
    pool: false,
    weight: 1,
    tags: ["jupiter", "memory", "peek"],
    conditions: {
      any: [{ flag: "secret_jupiter" }, { flag: "memory_unlocked_jupiter" }],
    },
    choices: twoChoices(
      "watch",
      "讓回憶停在被救的那一天",
      [
        { type: "flag", key: "memory_jupiter_seen", value: true },
        { type: "log", text: "木星的起點是被月月救，不是綁架。奉獻還沒走到極端。" },
      ],
      "close",
      "先不把這段過去公開",
      [
        { type: "flag", key: "memory_jupiter_seen", value: true },
        { type: "eventStatus", status: "unresolved" },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_memory_mars",
    title: "回憶：誰靠近她，她就玩誰",
    description:
      "觀眾看見更早的火星。漂亮、帥、人很多。她習慣別人主動走過來，也習慣把曖昧當成遊戲。誰先認真誰輸。直到月月不容易被拿下，她才第一次覺得這局不一樣。當時她還能笑著說「怎麼可能」。",
    characters: ["mars"],
    speaker: "現場",
    pool: false,
    weight: 1,
    tags: ["mars", "memory", "peek"],
    conditions: {
      any: [{ flag: "secret_mars" }, { flag: "memory_unlocked_mars" }],
    },
    choices: twoChoices(
      "watch",
      "讓回憶停在她還只是玩玩的時候",
      [
        { type: "flag", key: "memory_mars_seen", value: true },
        { type: "log", text: "火星以前真的只是玩。認真是後來才發生的事。" },
      ],
      "close",
      "先不讓現場聽見這段舊遊戲",
      [
        { type: "flag", key: "memory_mars_seen", value: true },
        { type: "eventStatus", status: "unresolved" },
      ]
    ),
  }),
];
