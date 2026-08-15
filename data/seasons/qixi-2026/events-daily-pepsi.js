import { compileAll } from "./events-daily-helpers.js";

export const PEPSI_DAILY_EVENTS = compileAll([
  {
    id: "EVENT_pepsi_sweet_01",
    character: "pepsi",
    kind: "sweet",
    title: "同一杯",
    description: `月月和百事同時點了一杯一樣的飲料。
兩人對看一眼，都笑了。
百事說：「妳果然會選這個。」
月月問她怎麼知道，她回答：「因為如果是妳，我就知道。」
那句話說得太自然，反而讓空氣安靜了一下。`,
    resultCopy: "百事又一次猜中了月月。",
    intervalCopy: "巧合出現一次叫巧合，出現太多次就開始讓人思考。",
    choices: [
      { label: "「妳真的很懂我。」", stats: { affection: 4, resonance: 3, similarity: 2 } },
      { label: "「只是巧合啦。」", stats: { affection: 1, resonance: -1, similarity: 1 } },
      { label: "「那妳猜我下一個想吃什麼。」", stats: { affection: 3, resonance: 4, similarity: 3 } },
      { label: "「妳不要什麼都學我。」", stats: { affection: -1, resonance: 2, similarity: 3 } }
    ]
  },
  {
    id: "EVENT_pepsi_sweet_02",
    character: "pepsi",
    kind: "sweet",
    title: "一個眼神",
    description: `月月沒有說自己想離開。
百事卻已經替她拿起了外套。
「妳剛剛一直看門。」
月月愣住，百事只是笑。
「我知道妳想走。」`,
    resultCopy: "百事捕捉到了月月沒有說出口的訊號。",
    intervalCopy: "她們之間的默契，有時候快得讓人忘記說話。",
    choices: [
      { label: "「妳連這都知道。」", stats: { affection: 4, resonance: 4, similarity: 2 } },
      { label: "「妳猜錯了。」", stats: { affection: -1, resonance: -2, similarity: 2 } },
      { label: "「那妳知道我現在想什麼嗎？」", stats: { affection: 3, resonance: 4, destiny: 2 } },
      { label: "「不要替我決定。」", stats: { affection: -2, resonance: 2, similarity: 3 } }
    ]
  },
  {
    id: "EVENT_pepsi_sweet_03",
    character: "pepsi",
    kind: "sweet",
    title: "不需要解釋",
    description: `月月突然安靜下來。
百事沒有追問原因，只坐到旁邊。
兩人沉默了很久，誰都沒有說話。
過了一會，百事把飲料推過去。
「不用解釋，我陪妳。」`,
    resultCopy: "百事選擇不問。",
    intervalCopy: "她們之間最舒服的時候，反而沒有太多對話。",
    choices: [
      { label: "靠著她坐。", stats: { affection: 5, resonance: 4, similarity: 2 } },
      { label: "「妳不問我嗎？」", stats: { affection: 3, resonance: 2, similarity: 2, destiny: 1 } },
      { label: "「我其實沒事。」", stats: { affection: 1, resonance: 1, similarity: -1 } },
      { label: "「妳這樣反而讓我有壓力。」", stats: { affection: -2, resonance: 2, similarity: 3 } }
    ]
  },
  {
    id: "EVENT_pepsi_sweet_04",
    character: "pepsi",
    kind: "sweet",
    title: "只有妳知道",
    description: `月月提起一個只有自己知道的小習慣。
百事卻說她早就發現了。
「妳每次緊張都會摸杯口。」
月月立刻停止動作。
百事笑著說：「看吧。」`,
    resultCopy: "百事知道了一個月月自己都沒注意的習慣。",
    intervalCopy: "被理解是甜蜜的，被看得太透卻是另一回事。",
    choices: [
      { label: "「只有妳注意到了。」", stats: { affection: 4, resonance: 3, similarity: 3 } },
      { label: "「妳觀察我太久了吧。」", stats: { affection: 2, resonance: 2, similarity: 4 } },
      { label: "「那我現在故意改掉。」", stats: { affection: 1, resonance: 1, destiny: 2 } },
      { label: "「不要再看了。」", stats: { affection: -2, resonance: 3, similarity: 2 } }
    ]
  },
  {
    id: "EVENT_pepsi_nature_01",
    character: "pepsi",
    kind: "nature",
    title: "我們不需要其他人理解",
    description: `有人問百事為什麼總能和月月默契這麼好。
她沒有解釋。
「他們不懂也沒關係。」
她看了月月一眼。
「因為懂的人只有一個就夠了。」`,
    resultCopy: "百事似乎從不在意別人是否理解她。",
    intervalCopy: "她想要的理解，從來不是來自所有人。",
    choices: [
      { label: "「我懂妳。」", stats: { affection: 4, resonance: 3, similarity: 2 } },
      { label: "「還是要跟大家相處啊。」", stats: { affection: 1, resonance: -1, destiny: 2 } },
      { label: "「妳是不是有點排斥其他人？」", stats: { affection: 2, resonance: 2, similarity: 3 } },
      { label: "「只有一個人也太孤單。」", stats: { affection: -1, resonance: -2, similarity: 1 } }
    ]
  },
  {
    id: "EVENT_pepsi_nature_02",
    character: "pepsi",
    kind: "nature",
    title: "她總能接住話",
    description: `月月說了一句沒頭沒尾的話。
百事立刻接了下去。
月月問她怎麼知道前半句。
她回答：「因為妳剛剛的表情已經說了。」
然後又自然地繼續做自己的事情。`,
    resultCopy: "百事對月月的微小訊號非常敏感。",
    intervalCopy: "她不是會讀心，只是總能猜到下一句。",
    choices: [
      { label: "「妳真的很誇張。」", stats: { affection: 2, resonance: 3, similarity: 2 } },
      { label: "「那我以後不露表情。」", stats: { affection: 1, resonance: 1, similarity: 3 } },
      { label: "「妳猜錯一次給我看。」", stats: { affection: 3, resonance: 2, destiny: 1 } },
      { label: "「妳不要一直替我解讀。」", stats: { affection: -2, resonance: 3, similarity: 2 } }
    ]
  },
  {
    id: "EVENT_pepsi_nature_03",
    character: "pepsi",
    kind: "nature",
    title: "她不喜歡答案",
    description: `月月問百事一個很簡單的問題。
百事沒有直接回答。
她反問：「妳為什麼想知道？」
月月說自己只是好奇，她卻笑了。
「那就先讓我好奇妳。」`,
    resultCopy: "百事總喜歡從答案再往裡面挖一層。",
    intervalCopy: "對她而言，真正有趣的從來不是答案，而是答案背後的人。",
    choices: [
      { label: "陪她玩這個問答。", stats: { affection: 3, resonance: 3, similarity: 2 } },
      { label: "「直接回答啦。」", stats: { affection: 1, resonance: -1, similarity: 1 } },
      { label: "「妳又在研究我。」", stats: { affection: 2, resonance: 2, similarity: 3 } },
      { label: "「不回答妳。」", stats: { affection: -1, resonance: 2, destiny: 2 } }
    ]
  },
  {
    id: "EVENT_pepsi_overstep_01",
    character: "pepsi",
    kind: "overstep",
    title: "她替月月把話說完",
    description: `有人問月月是不是喜歡某個人。
月月還沒回答，百事就先說：「她現在不知道。」
月月轉頭看她。
百事卻只是笑：「我說錯了嗎？」
那一瞬間，她像比月月更知道答案。`,
    flags: ["foreshadow_pepsi_speak"],
    resultCopy: "百事替月月說出了她沒有說的話。",
    intervalCopy: "她們之間的默契，第一次越過了「替對方回答」的界線。",
    choices: [
      { label: "「妳不要替我回答。」", stats: { affection: -2, resonance: 3, similarity: 2 } },
      { label: "「妳說得沒錯。」", stats: { affection: 4, resonance: 4, similarity: 3 } },
      { label: "「妳怎麼知道？」", stats: { affection: 2, resonance: 4, destiny: 2 } },
      { label: "故意說另一個答案。", stats: { affection: 1, resonance: -1, similarity: 4 } }
    ]
  },
  {
    id: "EVENT_pepsi_overstep_02",
    character: "pepsi",
    kind: "overstep",
    title: "妳剛才在想我",
    description: `月月只是看了百事一眼。
百事立刻說：「妳剛才在想我。」
月月否認，她卻笑得非常肯定。
「不是嗎？」
她沒有證據，卻像早已知道答案。`,
    resultCopy: "百事又一次把兩人的距離往前推了一步。",
    intervalCopy: "她似乎開始分不清「猜測」與「確定」的界線。",
    choices: [
      { label: "「對，我在想妳。」", stats: { affection: 4, resonance: 4, similarity: 3 } },
      { label: "「妳想太多。」", stats: { affection: 1, resonance: 2, similarity: -1 } },
      { label: "「妳猜。」", stats: { affection: 3, resonance: 3, destiny: 2 } },
      { label: "「不要什麼都往自己身上想。」", stats: { affection: -2, resonance: 2, similarity: 3 } }
    ]
  },
  {
    id: "EVENT_pepsi_overstep_03",
    character: "pepsi",
    kind: "overstep",
    title: "一樣就好了",
    description: `百事拿起月月剛用過的東西。
她看了一會，突然說：「這樣就很好。」
月月問她在說什麼。
她只是說：「我們用一樣的東西，就好像更接近了。」
那個語氣認真得不像玩笑。`,
    resultCopy: "百事對「一樣」的理解似乎比普通默契更深。",
    intervalCopy: "相似是一件舒服的事，但百事似乎不滿足於只是相似。",
    choices: [
      { label: "「那妳拿去吧。」", stats: { affection: 3, resonance: 3, similarity: 5 } },
      { label: "「這有什麼關係？」", stats: { affection: 1, resonance: 1, similarity: 2 } },
      { label: "「妳是不是想跟我一模一樣？」", stats: { affection: 2, resonance: 4, similarity: 5 } },
      { label: "把東西拿回來。", stats: { affection: -2, resonance: 2, similarity: 3 } }
    ]
  },
  {
    id: "EVENT_pepsi_foreshadow_01",
    character: "pepsi",
    kind: "foreshadow",
    title: "頻率只是隨口一提",
    description: `百事突然說月月和她的「頻率」很接近。
月月問她是不是又在講那些奇怪的理論。
百事笑著說只是隨口一提。
但她回去後卻在紙上寫下了一串數字。
月月沒有看清楚那是什麼。`,
    flags: ["foreshadow_pepsi_frequency"],
    resultCopy: "百事留下了一個沒有人理解的「頻率」。",
    intervalCopy: "她說只是隨口一提，但似乎早就計算過了。",
    choices: [
      { label: "問她在寫什麼。", stats: { affection: 2, resonance: 4, similarity: 2 } },
      { label: "當作沒看到。", stats: { affection: 1, resonance: 2, destiny: 1 } },
      { label: "直接拿來看。", stats: { affection: -1, resonance: 5, similarity: 3 } },
      { label: "笑她又開始幻想。", stats: { affection: 1, resonance: -1, similarity: 2 } }
    ]
  },
  {
    id: "EVENT_pepsi_foreshadow_02",
    character: "pepsi",
    kind: "foreshadow",
    title: "她知道另一個名字",
    description: `月月偶然提到一個自己從沒告訴百事的名字。
百事卻露出非常短暫的驚訝。
下一秒，她說：「原來妳也知道。」
月月問她為什麼知道這個名字。
百事只是笑，沒有回答。`,
    resultCopy: "百事似乎知道月月不應該知道的事情。",
    intervalCopy: "她的秘密，比她說出口的默契更大。",
    choices: [
      { label: "追問。", stats: { affection: 2, resonance: 4, destiny: 3 } },
      { label: "「妳不想說就算了。」", stats: { affection: 3, resonance: 2, destiny: 2 } },
      { label: "「妳是不是還知道更多？」", stats: { affection: 2, resonance: 5, similarity: 2 } },
      { label: "「這有點可怕。」", stats: { affection: -2, resonance: 2, similarity: 3 } }
    ]
  },
  {
    id: "EVENT_pepsi_foreshadow_03",
    character: "pepsi",
    kind: "foreshadow",
    title: "不需要第二個我",
    description: `百事突然說了一句奇怪的話。
「如果世界上真的有兩個我，應該很吵。」
月月笑著問她為什麼。
百事卻說：「因為我只需要一個真正懂我的人。」
她看向月月的眼神停留得比平常久。`,
    resultCopy: "百事似乎把「唯一」理解成了另一種東西。",
    intervalCopy: "她沒有說出口的那句話，暫時留在了空氣裡。",
    choices: [
      { label: "「那個人是我嗎？」", stats: { affection: 4, resonance: 4, similarity: 3 } },
      { label: "「妳還是需要很多朋友。」", stats: { affection: 1, resonance: -1, destiny: 2 } },
      { label: "「妳說得好像很認真。」", stats: { affection: 2, resonance: 3, similarity: 2 } },
      { label: "「那我不要當那個人。」", stats: { affection: -2, resonance: 3, similarity: 4 } }
    ]
  },
  {
    id: "EVENT_pepsi_solo_01",
    character: "pepsi",
    kind: "solo",
    title: "同一拍呼吸",
    description: `月月和百事並肩坐著，誰都沒有說話。
百事突然讓月月跟著她慢慢呼吸。
幾個呼吸之後，兩人的節奏真的變得很接近。
百事閉著眼睛笑了。
「妳看，我們果然可以同步。」`,
    resultCopy: "兩人的呼吸短暫地同步了。",
    intervalCopy: "這只是一場小小的遊戲，至少現在還是。",
    choices: [
      { label: "繼續配合她。", stats: { affection: 4, resonance: 5, similarity: 3 } },
      { label: "「這只是呼吸而已。」", stats: { affection: 1, resonance: 2, similarity: -1 } },
      { label: "「再同步一點看看。」", stats: { affection: 4, resonance: 5, destiny: 2 } },
      { label: "停下來。", stats: { affection: -1, resonance: -2, similarity: 2 } }
    ]
  },
  {
    id: "EVENT_pepsi_solo_02",
    character: "pepsi",
    kind: "solo",
    title: "妳不用說",
    description: `月月今天看起來有些疲憊。
百事沒有問原因，只坐到她身邊。
她把手放在月月附近，沒有真的碰上。
「妳不用說，我知道。」
那句話讓月月突然不知道該回答什麼。`,
    resultCopy: "百事選擇相信自己的理解。",
    intervalCopy: "她越來越習慣用「我知道」代替「妳願意告訴我嗎」。",
    choices: [
      { label: "「那就陪我。」", stats: { affection: 5, resonance: 4, similarity: 2 } },
      { label: "「妳其實不知道。」", stats: { affection: -2, resonance: 3, similarity: 3 } },
      { label: "「妳說說看。」", stats: { affection: 3, resonance: 5, destiny: 2 } },
      { label: "主動握住她的手。", stats: { affection: 5, resonance: 5, similarity: 3 } }
    ]
  },
  {
    id: "EVENT_pepsi_solo_03",
    character: "pepsi",
    kind: "solo",
    title: "如果只剩一個答案",
    description: `百事問月月，如果所有人都離開了，她會選誰。
月月笑著說這根本是不可能的問題。
百事卻沒有笑。
「假設而已。」
她看著月月，像是真的想知道答案。`,
    resultCopy: "百事得到了一個答案，卻沒有得到她真正想問的答案。",
    intervalCopy: "有些問題只是「假設」，直到提問的人真的很在意。",
    choices: [
      { label: "「我會選妳。」", stats: { affection: 6, resonance: 5, similarity: 4 } },
      { label: "「我不選任何人。」", stats: { affection: 1, resonance: 2, destiny: 1 } },
      { label: "「我會讓大家留下。」", stats: { affection: 3, resonance: 2, destiny: 3 } },
      { label: "「我拒絕回答。」", stats: { affection: -1, resonance: 4, similarity: 3 } }
    ]
  }
]);
