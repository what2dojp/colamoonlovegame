import { compileAll } from "./events-daily-helpers.js";

export const METEOR_DAILY_EVENTS = compileAll([
  {
    id: "EVENT_meteor_sweet_01",
    character: "meteor",
    kind: "sweet",
    title: "流星帶月月走舊路",
    description: `流星突然拉著月月走到一條老街。
她說這裡以前她們常常一起走。
月月已經忘了某些細節，流星卻一個一個講給她聽。
「妳以前每次走到這裡，都會先去買東西。」
她笑著說：「妳還是一樣。」`,
    resultCopy: "流星又把月月帶回了某段記憶。",
    intervalCopy: "有些路很久沒走，走回去時卻還是知道下一個轉角。",
    choices: [
      { label: "陪她重新走一次。", stats: { affection: 4, nostalgia: 4, destiny: 1 } },
      { label: "「我真的完全忘了。」", stats: { affection: -1, nostalgia: 2, pride: 2 } },
      { label: "「妳記得就好。」", stats: { affection: 3, nostalgia: 3, destiny: 2 } },
      { label: "「帶我去別的地方。」", stats: { affection: 1, nostalgia: -2, destiny: 2 } }
    ]
  },
  {
    id: "EVENT_meteor_sweet_02",
    character: "meteor",
    kind: "sweet",
    title: "小時候的口味",
    description: `流星買了兩杯沙士。
她把其中一杯直接塞給月月。
「妳以前就喝這個。」
月月說自己現在不一定喜歡，她卻笑著說：「那就試試看啊。」
喝下去之後，流星露出一副「我就知道」的表情。`,
    resultCopy: "流星對過去的記憶依然非常有信心。",
    intervalCopy: "她記得的是月月以前喜歡什麼，也記得自己曾經站在哪裡。",
    choices: [
      { label: "「還是很好喝。」", stats: { affection: 4, nostalgia: 3, destiny: 1 } },
      { label: "「現在比較喜歡別的。」", stats: { affection: -1, nostalgia: -1, pride: 2 } },
      { label: "「妳怎麼這麼了解我？」", stats: { affection: 3, nostalgia: 2, destiny: 3 } },
      { label: "把沙士給其他人。", stats: { affection: -2, jealousy: 3, pride: 2 } }
    ]
  },
  {
    id: "EVENT_meteor_sweet_03",
    character: "meteor",
    kind: "sweet",
    title: "那句好啊",
    description: `流星突然問月月還記不記得小時候的一句話。
「長大我要跟妳結婚。」
當時月月回答的是「好啊」。
流星說到這裡突然笑了，像是終於抓到什麼證據。
「妳自己答應的喔。」`,
    resultCopy: "那個童年的約定又被流星翻了出來。",
    intervalCopy: "對流星而言，有些約定沒有期限。",
    choices: [
      { label: "「我記得。」", stats: { affection: 4, nostalgia: 4, destiny: 3 } },
      { label: "「小孩子講的話不算啦。」", stats: { affection: -2, nostalgia: -1, pride: 3 } },
      { label: "「妳居然還記得。」", stats: { affection: 2, nostalgia: 3, destiny: 2 } },
      { label: "「那妳現在還想結婚嗎？」", stats: { affection: 4, destiny: 4, jealousy: 1 } }
    ]
  },
  {
    id: "EVENT_meteor_sweet_04",
    character: "meteor",
    kind: "sweet",
    title: "她還是會等",
    description: `流星和月月約好在車站碰面。
月月晚到了，她卻沒有抱怨。
「以前妳也常常慢。」
她站在原地笑著等月月過來。
「所以我早就習慣了。」`,
    resultCopy: "流星對等待這件事，似乎早就習以為常。",
    intervalCopy: "她不是第一次等月月，也不打算讓這成為最後一次。",
    choices: [
      { label: "「謝謝妳等我。」", stats: { affection: 4, nostalgia: 3, pride: -1 } },
      { label: "「妳真的很有耐心。」", stats: { affection: 2, nostalgia: 2, pride: -1 } },
      { label: "「下次不要等我了。」", stats: { affection: -2, nostalgia: -2, pride: 2 } },
      { label: "「我故意遲到的。」", stats: { affection: 1, jealousy: 2, pride: 2 } }
    ]
  },
  {
    id: "EVENT_meteor_nature_01",
    character: "meteor",
    kind: "nature",
    title: "以前也是這樣",
    description: `月月說自己最近改變很多。
流星卻毫不客氣地指出她還是老樣子。
「妳以前緊張的時候也是這樣。」
「以前心虛的時候也是這樣。」
她說完後笑得非常得意。`,
    resultCopy: "流星很喜歡證明自己還記得以前的月月。",
    intervalCopy: "她最擅長的事情之一，就是把現在的人拉回過去。",
    choices: [
      { label: "「妳真的很懂我。」", stats: { affection: 3, nostalgia: 3, destiny: 1 } },
      { label: "「妳只是很愛吐槽我。」", stats: { affection: 1, pride: 2, jealousy: -1 } },
      { label: "「我才沒有心虛。」", stats: { affection: 1, nostalgia: 1, pride: 3 } },
      { label: "「那妳說說看我現在在想什麼。」", stats: { affection: 3, destiny: 2, pride: 2 } }
    ]
  },
  {
    id: "EVENT_meteor_nature_02",
    character: "meteor",
    kind: "nature",
    title: "她不肯認輸",
    description: `月月和流星玩了一個簡單的遊戲。
流星明明快輸了，卻死都不肯認。
「再一局。」
連輸三次後，她還是說只是運氣不好。
月月笑她，她反而更有精神了。`,
    resultCopy: "流星的自尊心暫時沒有受到致命打擊。",
    intervalCopy: "她可以接受輸，但不能接受月月看見自己輸。",
    choices: [
      { label: "再陪她玩。", stats: { affection: 3, nostalgia: 1, pride: -1 } },
      { label: "「輸了就認吧。」", stats: { affection: -1, pride: 3, jealousy: 1 } },
      { label: "故意讓她贏。", stats: { affection: 1, pride: -2, destiny: 1 } },
      { label: "「我不玩了。」", stats: { affection: -2, pride: 4, nostalgia: -1 } }
    ]
  },
  {
    id: "EVENT_meteor_nature_03",
    character: "meteor",
    kind: "nature",
    title: "她不會先道歉",
    description: `月月和流星因為小事鬧彆扭。
兩個人都知道其實沒什麼大不了。
但流星就是不肯先開口。
她在旁邊晃了半天，最後把飲料推到月月面前。
「喏。」`,
    resultCopy: "流星不擅長說軟話，但會用自己的方式靠近。",
    intervalCopy: "有些人的道歉沒有「對不起」，只有一杯被推過來的飲料。",
    choices: [
      { label: "「這算道歉嗎？」", stats: { affection: 2, pride: 2, nostalgia: 1 } },
      { label: "「謝謝。」", stats: { affection: 3, pride: -2, destiny: 1 } },
      { label: "「妳自己喝。」", stats: { affection: -2, pride: 3, jealousy: 1 } },
      { label: "主動抱她。", stats: { affection: 5, pride: -3, nostalgia: 2 } }
    ]
  },
  {
    id: "EVENT_meteor_overstep_01",
    character: "meteor",
    kind: "overstep",
    title: "現在也還沒結束",
    description: `流星突然說：「我們以前不是這樣嗎？」
月月問她在說什麼，她卻很自然地回答：「我們啊。」
她甚至把兩人的關係說得像從未中斷。
月月提醒她兩人其實很久沒有聯絡。
流星卻笑著說：「所以呢？」`,
    flags: ["foreshadow_meteor_unbroken"],
    resultCopy: "流星再次把「以前」搬到了現在。",
    intervalCopy: "她口中的「我們」，似乎從來沒有真正結束。",
    choices: [
      { label: "「所以我們現在重新開始。」", stats: { affection: 4, destiny: 4, nostalgia: 2 } },
      { label: "「我們只是朋友。」", stats: { affection: -2, destiny: -2, pride: 3 } },
      { label: "「妳自己覺得呢？」", stats: { affection: 2, destiny: 3, pride: 1 } },
      { label: "「不要再說以前了。」", stats: { affection: -2, nostalgia: -3, destiny: 2 } }
    ]
  },
  {
    id: "EVENT_meteor_overstep_02",
    character: "meteor",
    kind: "overstep",
    title: "妳身邊的位置",
    description: `流星自然地坐到了月月旁邊。
有人問她為什麼，她只說：「這不是我的位置嗎？」
月月愣了一下。
流星卻一臉理所當然。
「以前就是這樣。」`,
    resultCopy: "流星又一次宣稱了自己的位置。",
    intervalCopy: "她不是在搶位置，她只是認為那本來就是她的。",
    choices: [
      { label: "讓她坐。", stats: { affection: 3, destiny: 3, nostalgia: 2 } },
      { label: "叫她坐遠一點。", stats: { affection: -2, jealousy: 2, pride: 3 } },
      { label: "「妳的位置很多人都想坐。」", stats: { affection: 1, jealousy: 3, destiny: 2 } },
      { label: "「妳想坐多久都可以。」", stats: { affection: 4, destiny: 4, nostalgia: 2 } }
    ]
  },
  {
    id: "EVENT_meteor_overstep_03",
    character: "meteor",
    kind: "overstep",
    title: "不准叫她那麼親",
    description: `流星聽見月月用很親密的稱呼叫另一個人。
她當場安靜了一秒。
「妳以前都沒有這樣叫我。」
月月問她是不是吃醋，她立刻否認。
「我只是覺得那個稱呼很難聽。」`,
    resultCopy: "流星否認得很快。",
    intervalCopy: "她說不是吃醋，但反應已經先替她回答了。",
    choices: [
      { label: "「妳就是吃醋。」", stats: { affection: 2, jealousy: 4, pride: 2 } },
      { label: "「那我也這樣叫妳。」", stats: { affection: 4, jealousy: 2, pride: -2 } },
      { label: "「妳管太多了。」", stats: { affection: -2, jealousy: 3, pride: 3 } },
      { label: "「那妳想聽什麼？」", stats: { affection: 3, destiny: 3, jealousy: 1 } }
    ]
  },
  {
    id: "EVENT_meteor_foreshadow_01",
    character: "meteor",
    kind: "foreshadow",
    title: "很久沒真正聯絡過",
    description: `流星說起某件童年往事時，忽然停了一下。
她很快又恢復笑容。
月月問她們後來為什麼那麼久沒聯絡。
流星說：「忙啊，就這樣。」
但她沒有繼續說下去。`,
    flags: ["foreshadow_meteor_gap"],
    resultCopy: "流星沒有說完那段空白。",
    intervalCopy: "她們之間最長的一段故事，反而沒有任何人提起。",
    choices: [
      { label: "繼續追問。", stats: { affection: 2, nostalgia: 3, pride: -1 } },
      { label: "不問。", stats: { affection: 2, destiny: 2, pride: -1 } },
      { label: "「妳其實一直記得吧？」", stats: { affection: 3, nostalgia: 3, destiny: 2 } },
      { label: "「那段時間就算了。」", stats: { affection: -1, nostalgia: -2, pride: 2 } }
    ]
  },
  {
    id: "EVENT_meteor_foreshadow_02",
    character: "meteor",
    kind: "foreshadow",
    title: "她還留著那張照片",
    description: `月月無意間看到流星手機裡的一張舊照片。
照片裡是很久以前的兩個孩子。
流星沒有立刻收起來。
她只是看著照片說：「這張我一直留著。」
然後把手機鎖上。`,
    resultCopy: "那張照片被保存了很久。",
    intervalCopy: "有些人保存的不是照片，而是照片裡的關係。",
    choices: [
      { label: "「可以給我看嗎？」", stats: { affection: 3, nostalgia: 4, pride: -1 } },
      { label: "「妳還留著啊。」", stats: { affection: 2, nostalgia: 3, destiny: 2 } },
      { label: "「刪掉吧。」", stats: { affection: -2, nostalgia: -4, pride: 3 } },
      { label: "「我也想留一張。」", stats: { affection: 4, nostalgia: 4, destiny: 2 } }
    ]
  },
  {
    id: "EVENT_meteor_foreshadow_03",
    character: "meteor",
    kind: "foreshadow",
    title: "她說得太自然",
    description: `有人問流星和月月現在是什麼關係。
流星毫不猶豫地回答：「當然是以前那樣。」
月月還沒來得及說話，她就轉移了話題。
沒有人知道她口中的「以前」到底是哪一天。
但流星顯然不打算解釋。`,
    resultCopy: "流星對兩人的關係似乎早已有自己的答案。",
    intervalCopy: "她不是不知道答案，她只是還沒問過月月。",
    choices: [
      { label: "「妳剛才說什麼？」", stats: { affection: 2, destiny: 3, pride: -1 } },
      { label: "「她只是亂講。」", stats: { affection: -1, destiny: -2, pride: 3 } },
      { label: "「讓她說完。」", stats: { affection: 3, destiny: 4, nostalgia: 2 } },
      { label: "「我們關係很複雜。」", stats: { affection: 2, jealousy: 2, destiny: 2 } }
    ]
  },
  {
    id: "EVENT_meteor_solo_01",
    character: "meteor",
    kind: "solo",
    title: "小時候那條路",
    description: `流星帶月月走到一條很安靜的小路。
她說小時候她們常在這裡聊天。
兩人坐下後，她開始講那些已經很久沒有人提過的事情。
「那時候我真的以為我們會一直在一起。」
她說完後沒有笑。`,
    resultCopy: "流星久違地說出了真正的想法。",
    intervalCopy: "她想念的可能不只是那條路，還有那個相信未來會一樣的自己。",
    choices: [
      { label: "「我現在還在這裡。」", stats: { affection: 4, nostalgia: 4, destiny: 3 } },
      { label: "「小時候想法會變的。」", stats: { affection: -1, nostalgia: -2, pride: 2 } },
      { label: "「妳現在還這樣想嗎？」", stats: { affection: 3, destiny: 4, jealousy: 1 } },
      { label: "牽她的手。", stats: { affection: 5, nostalgia: 3, destiny: 3 } }
    ]
  },
  {
    id: "EVENT_meteor_solo_02",
    character: "meteor",
    kind: "solo",
    title: "沒說出口的那年",
    description: `流星第一次主動提起兩人失聯的那段時間。
她沒有說誰對誰錯，只說那時候大家都變了。
「可是我沒有把那句話收回去。」
月月問是哪一句，她卻沉默。
最後她只說：「妳應該知道。」`,
    resultCopy: "流星把一段空白留在了月月面前。",
    intervalCopy: "有些答案不是忘記，而是一直沒有勇氣重新問一次。",
    choices: [
      { label: "「我想聽妳親口說。」", stats: { affection: 4, destiny: 4, pride: -2 } },
      { label: "「如果妳不想說就算了。」", stats: { affection: 2, pride: -1, nostalgia: 2 } },
      { label: "「我真的不知道。」", stats: { affection: -1, destiny: 2, pride: 2 } },
      { label: "「那我猜猜看。」", stats: { affection: 3, nostalgia: 3, destiny: 3 } }
    ]
  },
  {
    id: "EVENT_meteor_solo_03",
    character: "meteor",
    kind: "solo",
    title: "如果重新來一次",
    description: `流星問月月，如果兩人可以重新回到小時候，她會做什麼。
月月回答後，她安靜地聽著。
「那我可能還是會做一樣的事情。」
她笑著說。
「所以現在重新來，也沒有關係吧？」`,
    resultCopy: "流星似乎接受了「重新開始」這個說法。",
    intervalCopy: "有時候重新開始不是忘記過去，而是拿過去當理由。",
    choices: [
      { label: "「那就重新認識一次。」", stats: { affection: 4, destiny: 4, nostalgia: 2 } },
      { label: "「我們已經不是小孩子了。」", stats: { affection: -1, nostalgia: -2, pride: 2 } },
      { label: "「妳真的很執著。」", stats: { affection: 1, destiny: 3, pride: 2 } },
      { label: "「那妳先追我一次。」", stats: { affection: 5, destiny: 4, jealousy: 1 } }
    ]
  }
]);
