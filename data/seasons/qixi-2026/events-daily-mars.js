import { compileAll } from "./events-daily-helpers.js";

export const MARS_DAILY_EVENTS = compileAll([
  {
    id: "EVENT_mars_sweet_01",
    character: "mars",
    kind: "sweet",
    title: "今天有很多人看她",
    description: `火星今天一出現，就吸引了不少目光。
她完全不在意，反而一直盯著月月。
月月問她在看什麼，她挑眉說：「看妳啊。」
「其他人看我跟妳有什麼關係？」
她說完又笑：「我只在意妳有沒有在看我。」`,
    resultCopy: "火星今天似乎只在意一個觀眾。",
    intervalCopy: "她很受歡迎，但她真正想看的只有月月。",
    choices: [
      { label: "「我一直在看妳。」", stats: { affection: 5, chemistry: 4, provocation: 2 } },
      { label: "「我在看其他人。」", stats: { affection: 1, chemistry: 2, provocation: 4 } },
      { label: "「妳今天真的很好看。」", stats: { affection: 4, chemistry: 5, pride: 2 } },
      { label: "「妳想太多了。」", stats: { affection: -1, chemistry: 1, provocation: 3 } }
    ]
  },
  {
    id: "EVENT_mars_sweet_02",
    character: "mars",
    kind: "sweet",
    title: "誰先臉紅誰輸",
    description: `火星突然提出一個比賽。
兩個人要互看三十秒，誰先移開視線誰輸。
月月沒有想到火星真的會一直看。
時間到了，火星卻還沒有移開。
「妳先輸了。」`,
    resultCopy: "這場比賽沒有真正的輸家。",
    intervalCopy: "兩個人都很清楚，遊戲只是靠近彼此的藉口。",
    choices: [
      { label: "「我只是故意讓妳贏。」", stats: { affection: 3, chemistry: 3, provocation: 3 } },
      { label: "「再來一次。」", stats: { affection: 4, chemistry: 5, pride: -1 } },
      { label: "「妳是不是根本不敢移開？」", stats: { affection: 3, chemistry: 4, provocation: 4 } },
      { label: "「不玩了。」", stats: { affection: -1, chemistry: -2, provocation: 3 } }
    ]
  },
  {
    id: "EVENT_mars_sweet_03",
    character: "mars",
    kind: "sweet",
    title: "我只是在等妳",
    description: `火星明明已經先到了，卻說自己只是路過。
月月問她怎麼還不走，她說在等人。
「等誰？」
她看了月月一眼。
「妳啊，不然還有誰？」`,
    resultCopy: "火星的嘴硬沒有成功掩蓋等待。",
    intervalCopy: "她可以說自己只是路過，但她等的人只有一個。",
    choices: [
      { label: "「那我來了。」", stats: { affection: 5, chemistry: 4, pride: 1 } },
      { label: "「妳可以不用等我。」", stats: { affection: -1, chemistry: 1, pride: 2 } },
      { label: "「妳是不是很期待見我？」", stats: { affection: 4, chemistry: 4, provocation: 2 } },
      { label: "「我故意讓妳等。」", stats: { affection: 1, chemistry: 2, provocation: 4 } }
    ]
  },
  {
    id: "EVENT_mars_sweet_04",
    character: "mars",
    kind: "sweet",
    title: "妳笑的時候比較好看",
    description: `月月正在笑，火星突然盯著她看。
「妳平常那副欠揍的樣子比較難看。」
月月正要反駁，她卻補了一句。
「但是妳笑的時候很好看。」
說完後火星自己先轉過頭。`,
    resultCopy: "火星難得真心稱讚了一次月月。",
    intervalCopy: "她說出口的時候很帥，說完之後卻開始後悔。",
    choices: [
      { label: "「妳害羞了？」", stats: { affection: 4, chemistry: 4, provocation: 3 } },
      { label: "「謝謝誇獎。」", stats: { affection: 3, chemistry: 3, pride: -1 } },
      { label: "「妳也很好看。」", stats: { affection: 5, chemistry: 5, pride: 2 } },
      { label: "「那我不笑了。」", stats: { affection: 1, chemistry: 1, provocation: 2 } }
    ]
  },
  {
    id: "EVENT_mars_nature_01",
    character: "mars",
    kind: "nature",
    title: "我們就玩玩",
    description: `月月問火星到底把兩人的關係當什麼。
火星毫不猶豫地回答：「玩玩啊。」
她說兩個人都知道規則，誰認真誰輸。
月月點頭，她反而笑得更開心。
「所以妳可不要先輸。」`,
    resultCopy: "火星把一切都包裝成遊戲。",
    intervalCopy: "她相信只要不認真，就沒有人會受傷。",
    choices: [
      { label: "「我不會輸。」", stats: { affection: 3, chemistry: 4, provocation: 3 } },
      { label: "「妳怕自己輸嗎？」", stats: { affection: 2, chemistry: 3, provocation: 4, pride: 1 } },
      { label: "「那就玩到底。」", stats: { affection: 4, chemistry: 5, provocation: 3 } },
      { label: "「我不想玩了。」", stats: { affection: -2, chemistry: -2, pride: 3 } }
    ]
  },
  {
    id: "EVENT_mars_nature_02",
    character: "mars",
    kind: "nature",
    title: "她就是很會嗆",
    description: `月月只是說了一句普通的話。
火星立刻抓住其中一個字吐槽。
兩人你一句我一句，很快就開始互相攻擊。
旁邊的人根本插不上話。
最後火星笑著說：「看吧，只有妳接得住。」`,
    resultCopy: "火星似乎很享受有人能跟她互相傷害。",
    intervalCopy: "她不是討厭月月，她只是終於找到一個能跟自己對打的人。",
    choices: [
      { label: "「因為我比妳強。」", stats: { affection: 4, chemistry: 4, provocation: 3 } },
      { label: "「妳真的很煩。」", stats: { affection: 1, chemistry: 2, provocation: 3 } },
      { label: "「那再來啊。」", stats: { affection: 3, chemistry: 5, provocation: 4 } },
      { label: "不理她。", stats: { affection: -1, chemistry: -2, pride: 3 } }
    ]
  },
  {
    id: "EVENT_mars_nature_03",
    character: "mars",
    kind: "nature",
    title: "她不承認在意",
    description: `月月問火星是不是有點在意自己。
火星立刻否認。
「我只是剛好注意到。」
月月問她為什麼連自己喝什麼都知道。
火星沉默兩秒：「我觀察力很好，不行嗎？」`,
    resultCopy: "火星的否認速度，比承認速度快很多。",
    intervalCopy: "她說自己只是觀察，但她知道的事情未免太多。",
    choices: [
      { label: "「妳就是在意。」", stats: { affection: 3, chemistry: 4, provocation: 4 } },
      { label: "「好，妳觀察力很好。」", stats: { affection: 2, chemistry: 3, pride: -1 } },
      { label: "「那妳繼續觀察。」", stats: { affection: 4, chemistry: 5, provocation: 2 } },
      { label: "「不用觀察我。」", stats: { affection: -2, chemistry: 1, pride: 3 } }
    ]
  },
  {
    id: "EVENT_mars_overstep_01",
    character: "mars",
    kind: "overstep",
    title: "火星假裝吃醋",
    description: `月月和另一個人聊天時，火星突然插進來。
「聊得很開心嘛。」
月月問她是不是吃醋，她立刻笑著否認。
「我只是覺得那個人很無聊。」
但她一直沒有離開。`,
    flags: ["foreshadow_mars_real"],
    resultCopy: "火星沒有承認吃醋，但也沒有走。",
    intervalCopy: "她嘴上說不在乎，身體倒是很誠實。",
    choices: [
      { label: "「妳就是吃醋。」", stats: { affection: 3, chemistry: 4, provocation: 5, pride: 2 } },
      { label: "「那妳走啊。」", stats: { affection: -1, chemistry: -1, provocation: 4, pride: 3 } },
      { label: "「那妳陪我聊。」", stats: { affection: 5, chemistry: 5, provocation: 2 } },
      { label: "「妳可以一起聊。」", stats: { affection: 3, chemistry: 4, pride: -1 } }
    ]
  },
  {
    id: "EVENT_mars_overstep_02",
    character: "mars",
    kind: "overstep",
    title: "距離太近",
    description: `兩人為了搶一樣東西同時伸手。
手臂碰在一起後，誰都沒有立刻退開。
火星原本還想開玩笑，卻突然安靜了。
月月看著她，她也沒有移開視線。
「……妳靠太近了。」`,
    resultCopy: "火星第一次忘了把靠近當成玩笑。",
    intervalCopy: "距離縮短只需要一步，真正困難的是誰先承認。",
    choices: [
      { label: "「妳也沒有退啊。」", stats: { affection: 5, chemistry: 6, provocation: 3 } },
      { label: "立刻退開。", stats: { affection: 1, chemistry: -2, pride: 2 } },
      { label: "「那妳要我退嗎？」", stats: { affection: 4, chemistry: 5, provocation: 4 } },
      { label: "故意更靠近。", stats: { affection: 5, chemistry: 6, provocation: 5, pride: -2 } }
    ]
  },
  {
    id: "EVENT_mars_overstep_03",
    character: "mars",
    kind: "overstep",
    title: "妳跟她比較親？",
    description: `火星突然問月月跟另一個人是不是比較親。
月月問她為什麼在意。
火星立刻改口說只是隨便問問。
但她下一句又問了同樣的問題。
「所以呢？」`,
    resultCopy: "火星第一次沒有成功把問題藏在玩笑裡。",
    intervalCopy: "有些問題問出口之後，就已經不是玩笑了。",
    choices: [
      { label: "「妳想知道？」", stats: { affection: 3, chemistry: 4, provocation: 4 } },
      { label: "「當然比較親。」", stats: { affection: -1, chemistry: 2, provocation: 5, pride: 2 } },
      { label: "「妳猜。」", stats: { affection: 4, chemistry: 5, provocation: 3 } },
      { label: "「妳跟她不一樣。」", stats: { affection: 5, chemistry: 4, pride: 1 } }
    ]
  },
  {
    id: "EVENT_mars_foreshadow_01",
    character: "mars",
    kind: "foreshadow",
    title: "其他人忽然沒意思",
    description: `火星今天拒絕了幾個主動接近她的人。
月月問她怎麼突然沒興趣。
她說：「不知道。」
過了一會，她又看向月月。
「最近好像只有妳比較有意思。」`,
    flags: ["foreshadow_mars_refuse"],
    resultCopy: "火星的注意力開始變得奇怪地集中。",
    intervalCopy: "她曾經什麼都想玩，現在卻開始只想找一個人。",
    choices: [
      { label: "「我是不是很特別？」", stats: { affection: 4, chemistry: 4, provocation: 2 } },
      { label: "「妳只是玩膩了吧。」", stats: { affection: 1, chemistry: 2, pride: 2 } },
      { label: "「那妳繼續找其他人啊。」", stats: { affection: -2, chemistry: -1, provocation: 3 } },
      { label: "「那就只看我。」", stats: { affection: 5, chemistry: 5, pride: 1 } }
    ]
  },
  {
    id: "EVENT_mars_foreshadow_02",
    character: "mars",
    kind: "foreshadow",
    title: "她記得月月的反應",
    description: `火星突然準確地說出月月什麼時候會害羞。
月月問她怎麼知道。
她說：「玩久了就知道啊。」
但她甚至記得月月第一次出現那個反應的時間。
這已經不像普通觀察。`,
    resultCopy: "火星開始記住月月的細節。",
    intervalCopy: "她說只是玩玩，但記憶似乎比遊戲更認真。",
    choices: [
      { label: "「妳記得也太清楚。」", stats: { affection: 3, chemistry: 4, provocation: 2 } },
      { label: "「妳真的很閒。」", stats: { affection: 1, chemistry: 2, pride: 2 } },
      { label: "「那妳是不是一直在看我？」", stats: { affection: 4, chemistry: 5, provocation: 3 } },
      { label: "「忘掉它。」", stats: { affection: -2, chemistry: -1, pride: 3 } }
    ]
  },
  {
    id: "EVENT_mars_foreshadow_03",
    character: "mars",
    kind: "foreshadow",
    title: "她沒有笑",
    description: `月月提起自己和別人出去的事情。
火星平常一定會吐槽，這次卻沒有。
她只是安靜地聽完。
月月問她怎麼了，她說沒事。
但那一瞬間，她真的看起來不開心。`,
    resultCopy: "火星第一次沒有用玩笑遮住情緒。",
    intervalCopy: "她沒有說自己難過，但這一次，所有人都看得出來。",
    choices: [
      { label: "「妳真的沒事？」", stats: { affection: 3, chemistry: 3, provocation: 2 } },
      { label: "「那我不說了。」", stats: { affection: 2, chemistry: 2, pride: -1 } },
      { label: "「妳是不是吃醋？」", stats: { affection: 4, chemistry: 5, provocation: 4 } },
      { label: "「妳不想聽就算了。」", stats: { affection: -1, chemistry: -2, pride: 3 } }
    ]
  },
  {
    id: "EVENT_mars_solo_01",
    character: "mars",
    kind: "solo",
    title: "我們就這樣玩",
    description: `火星把月月叫到只有兩人的地方。
她說今天沒有別人，可以放心玩。
兩人互相挑釁，又開始熟悉的鬥嘴。
最後火星突然安靜下來。
「妳知道吧，跟妳玩真的比較有意思。」`,
    resultCopy: "火星又把靠近包裝成遊戲。",
    intervalCopy: "只要還叫做遊戲，她就可以假裝自己沒有認真。",
    choices: [
      { label: "「我也覺得。」", stats: { affection: 5, chemistry: 5, provocation: 3 } },
      { label: "「那妳輸了怎麼辦？」", stats: { affection: 4, chemistry: 5, provocation: 4 } },
      { label: "「我今天不想玩。」", stats: { affection: -2, chemistry: -2, pride: 2 } },
      { label: "「那我們一直玩。」", stats: { affection: 5, chemistry: 6, provocation: 3 } }
    ]
  },
  {
    id: "EVENT_mars_solo_02",
    character: "mars",
    kind: "solo",
    title: "誰先認真誰輸",
    description: `火星再次提起她們最熟悉的規則。
誰先認真，誰就輸。
月月問她現在還相信這個嗎。
她笑著說當然。
只是那個笑容，比以前勉強了一點。`,
    resultCopy: "火星第一次開始害怕那條遊戲規則。",
    intervalCopy: "規則本來是為了保護她，現在卻可能成為困住她的東西。",
    choices: [
      { label: "「那我絕對不認真。」", stats: { affection: 2, chemistry: 3, provocation: 3 } },
      { label: "「妳已經輸了吧。」", stats: { affection: 4, chemistry: 5, provocation: 5, pride: -2 } },
      { label: "「如果我認真呢？」", stats: { affection: 5, chemistry: 6, pride: -1 } },
      { label: "「那我們不要玩了。」", stats: { affection: -2, chemistry: -3, pride: 3 } }
    ]
  },
  {
    id: "EVENT_mars_solo_03",
    character: "mars",
    kind: "solo",
    title: "妳明明知道",
    description: `火星和月月安靜地坐著。
她忽然問：「妳知道我在想什麼嗎？」
月月故意不回答。
火星笑了一下：「妳明明知道。」
那一刻，她第一次沒有把這句話當成玩笑。`,
    resultCopy: "火星似乎希望月月自己說出答案。",
    intervalCopy: "她最害怕的事情，也許不是月月不知道，而是月月其實知道。",
    choices: [
      { label: "「我知道。」", stats: { affection: 6, chemistry: 6, provocation: 2, pride: -2 } },
      { label: "「我不知道。」", stats: { affection: 2, chemistry: 3, pride: 2 } },
      { label: "「妳自己說。」", stats: { affection: 5, chemistry: 5, provocation: 3 } },
      { label: "「那妳猜我的。」", stats: { affection: 4, chemistry: 6, provocation: 4 } }
    ]
  }
]);
