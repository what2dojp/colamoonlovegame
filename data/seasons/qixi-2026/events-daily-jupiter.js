import { compileAll } from "./events-daily-helpers.js";

export const JUPITER_DAILY_EVENTS = compileAll([
  {
    id: "EVENT_jupiter_sweet_01",
    character: "jupiter",
    kind: "sweet",
    title: "木星把習慣都記得",
    description: `月月剛坐下，木星就把她習慣喝的飲料放到旁邊。
「今天比較累，所以我換成這個。」
月月問她怎麼知道，木星只說：「妳昨天說過。」
她沒有邀功，只是安靜坐在旁邊。
「我剛好記得而已。」`,
    resultCopy: "木星又記住了一件小事。",
    intervalCopy: "她說只是剛好記得，但她記得的事情已經越來越多。",
    choices: [
      { label: "「謝謝妳。」", stats: { affection: 4, devotion: 3, patience: 1 } },
      { label: "「不用一直記這些。」", stats: { affection: -1, devotion: 2, patience: 2 } },
      { label: "「妳真的很貼心。」", stats: { affection: 3, devotion: 4, hope: 1 } },
      { label: "「我下次自己買。」", stats: { affection: -2, devotion: 1, hope: -2 } }
    ]
  },
  {
    id: "EVENT_jupiter_sweet_02",
    character: "jupiter",
    kind: "sweet",
    title: "外套已經準備好了",
    description: `月月準備出門時，發現門邊已經放著外套。
木星說今天晚上會冷。
月月問她是不是早就知道天氣。
她笑著說：「只是怕妳忘記。」
然後替月月把衣領整理好。`,
    resultCopy: "木星只是想確保月月不會忘記照顧自己。",
    intervalCopy: "她總是比月月更早一步想到下一件事。",
    choices: [
      { label: "讓她整理。", stats: { affection: 4, devotion: 4, patience: 1 } },
      { label: "「我自己來。」", stats: { affection: 1, devotion: -1, patience: 2 } },
      { label: "「妳怎麼什麼都準備好了？」", stats: { affection: 3, devotion: 3, hope: 2 } },
      { label: "「妳這樣很像媽媽。」", stats: { affection: -1, devotion: 2, jealousy: 1 } }
    ]
  },
  {
    id: "EVENT_jupiter_sweet_03",
    character: "jupiter",
    kind: "sweet",
    title: "我只是想讓妳舒服",
    description: `月月說今天有點累。
木星立刻把燈光調暗。
她沒有問太多，只讓月月舒服地坐著。
「妳不用管我。」月月說。
木星回答：「我本來就不是在等妳管我。」`,
    resultCopy: "木星很享受自己能派上用場。",
    intervalCopy: "對木星而言，照顧月月本身就是一種幸福。",
    choices: [
      { label: "「那就陪我一下。」", stats: { affection: 5, devotion: 4, hope: 2 } },
      { label: "「妳可以去休息。」", stats: { affection: 1, devotion: -1, patience: 2 } },
      { label: "「謝謝妳。」", stats: { affection: 4, devotion: 3, hope: 1 } },
      { label: "「我其實不用妳照顧。」", stats: { affection: -2, devotion: 2, hope: -2 } }
    ]
  },
  {
    id: "EVENT_jupiter_sweet_04",
    character: "jupiter",
    kind: "sweet",
    title: "妳今天笑得很好看",
    description: `木星很少主動稱讚月月的外表。
但今天她忽然說月月笑得很好看。
月月問她是不是喝醉了，她立刻搖頭。
「我只是一直都有注意。」
說完後她自己先害羞地移開視線。`,
    resultCopy: "木星難得直接表達了自己的戀愛心情。",
    intervalCopy: "她一直都在看，只是今天終於說出口。",
    choices: [
      { label: "「那妳多看一下。」", stats: { affection: 5, devotion: 3, hope: 2 } },
      { label: "「妳今天很會說。」", stats: { affection: 3, devotion: 2, patience: -1 } },
      { label: "「不要一直看我。」", stats: { affection: -1, devotion: 1, hope: -1 } },
      { label: "「妳也很好看。」", stats: { affection: 4, devotion: 4, hope: 3 } }
    ]
  },
  {
    id: "EVENT_jupiter_nature_01",
    character: "jupiter",
    kind: "nature",
    title: "不要拒絕我的幫助",
    description: `月月說自己可以處理一件小事。
木星卻已經把東西整理好了。
「我不覺得麻煩。」
月月說真的不用，她還是笑著搖頭。
「可是我想做。」`,
    resultCopy: "木星第一次明確地把「我想做」放在「妳需不需要」之前。",
    intervalCopy: "她不是被要求照顧月月，而是自己選擇這麼做。",
    choices: [
      { label: "讓她幫忙。", stats: { affection: 3, devotion: 4, patience: 2 } },
      { label: "「真的不用。」", stats: { affection: -1, devotion: 3, patience: 2 } },
      { label: "「那就拜託妳。」", stats: { affection: 4, devotion: 5, hope: 2 } },
      { label: "「妳不用證明自己有用。」", stats: { affection: 1, devotion: -1, hope: -3 } }
    ]
  },
  {
    id: "EVENT_jupiter_nature_02",
    character: "jupiter",
    kind: "nature",
    title: "她從不說累",
    description: `月月發現木星今天幫了很多忙。
問她累不累，她卻說還好。
「真的不用擔心我。」
她甚至開始反過來安慰月月。
直到月月發現她連水都忘了喝。`,
    resultCopy: "木星總是把自己的需要排在最後。",
    intervalCopy: "她說自己沒事的次數，已經多到讓人開始懷疑。",
    choices: [
      { label: "「先休息。」", stats: { affection: 3, devotion: 2, patience: 3 } },
      { label: "「妳真的沒事嗎？」", stats: { affection: 2, devotion: 3, hope: 2 } },
      { label: "「妳就是太愛逞強。」", stats: { affection: 1, devotion: 2, patience: -1 } },
      { label: "「那我不管妳了。」", stats: { affection: -3, devotion: 1, hope: -3 } }
    ]
  },
  {
    id: "EVENT_jupiter_nature_03",
    character: "jupiter",
    kind: "nature",
    title: "她真的不會拒絕",
    description: `月月臨時請木星幫忙一件事情。
木星沒有問原因就答應了。
月月說如果太麻煩可以拒絕。
她卻笑著說：「妳可以繼續叫我。」
「只要妳需要，我都在。」`,
    resultCopy: "木星把「需要」視為一種幸福。",
    intervalCopy: "她不是沒有界線，只是月月每跨一步，她都願意後退一步。",
    choices: [
      { label: "「謝謝妳。」", stats: { affection: 4, devotion: 4, hope: 2 } },
      { label: "「妳可以偶爾拒絕我。」", stats: { affection: 2, devotion: -1, patience: 3 } },
      { label: "「那我以後都找妳。」", stats: { affection: 3, devotion: 5, hope: 3 } },
      { label: "「妳這樣真的太寵我。」", stats: { affection: 1, devotion: 3, hope: -1 } }
    ]
  },
  {
    id: "EVENT_jupiter_overstep_01",
    character: "jupiter",
    kind: "overstep",
    title: "備忘錄不見了",
    description: `月月發現別人留給自己的備忘錄突然不見了。
木星說可能是不小心被收起來。
她很自然地幫月月重新整理桌面。
那張紙最後也沒有找到。
木星只是說：「如果重要的話，我可以幫妳問問看。」`,
    flags: ["foreshadow_jupiter_rival"],
    resultCopy: "有些東西消失得很巧。",
    intervalCopy: "木星沒有阻止任何人靠近月月，她只是很會處理那些「小問題」。",
    choices: [
      { label: "「不用，我自己找。」", stats: { affection: -1, devotion: -1, patience: 2 } },
      { label: "「那就拜託妳。」", stats: { affection: 3, devotion: 4, jealousy: 2 } },
      { label: "「妳是不是拿走的？」", stats: { affection: -2, devotion: 2, jealousy: 3 } },
      { label: "「可能真的不重要。」", stats: { affection: 1, devotion: 2, hope: -1 } }
    ]
  },
  {
    id: "EVENT_jupiter_overstep_02",
    character: "jupiter",
    kind: "overstep",
    title: "我替妳回了",
    description: `月月忙著做別的事情時，有人傳訊息過來。
木星看見後說對方只是問一件小事。
等月月回頭，她已經幫忙處理好了。
「我想說妳很忙。」
月月看著她，她又補了一句：「如果妳介意，我下次不會。」`,
    resultCopy: "木星開始替月月處理更多生活細節。",
    intervalCopy: "她的貼心有時候會走得比月月的允許更快。",
    choices: [
      { label: "「下次先問我。」", stats: { affection: 1, devotion: 2, patience: 3 } },
      { label: "「沒關係，謝謝妳。」", stats: { affection: 4, devotion: 4, hope: 2 } },
      { label: "「不要再替我回訊息。」", stats: { affection: -2, devotion: -1, jealousy: 2 } },
      { label: "「那妳幫我處理吧。」", stats: { affection: 3, devotion: 5, hope: 2 } }
    ]
  },
  {
    id: "EVENT_jupiter_overstep_03",
    character: "jupiter",
    kind: "overstep",
    title: "那個人不太適合妳",
    description: `木星突然提到月月最近常接觸的一個人。
她說對方其實不太適合月月。
月月問她怎麼知道，她說只是觀察。
她沒有批評對方，也沒有阻止月月見面。
「我只是希望妳不要受傷。」`,
    resultCopy: "木星沒有阻止月月，只是默默表示了自己的立場。",
    intervalCopy: "她說尊重月月的選擇，但她也有自己的「為妳好」。",
    choices: [
      { label: "「謝謝妳擔心我。」", stats: { affection: 3, devotion: 3, jealousy: 2 } },
      { label: "「妳沒有資格替我判斷。」", stats: { affection: -2, devotion: 2, patience: -1 } },
      { label: "「那妳告訴我理由。」", stats: { affection: 2, devotion: 4, jealousy: 3 } },
      { label: "「我還是會跟她見面。」", stats: { affection: 1, devotion: 1, jealousy: 4 } }
    ]
  },
  {
    id: "EVENT_jupiter_foreshadow_01",
    character: "jupiter",
    kind: "foreshadow",
    title: "被拒絕以後她更努力",
    description: `月月今天拒絕了木星一次幫忙。
隔天她卻發現木星準備得比平常更多。
月月問她是不是因為昨天的事情。
木星搖頭：「不是，我只是覺得還可以做得更好。」
她笑得很溫柔。`,
    flags: ["foreshadow_jupiter_more"],
    resultCopy: "被拒絕沒有讓木星退後，反而讓她更努力。",
    intervalCopy: "木星似乎把「被需要」當成了衡量自己的方法。",
    choices: [
      { label: "「妳已經做得很好了。」", stats: { affection: 4, devotion: 4, hope: 3 } },
      { label: "「真的不用再做了。」", stats: { affection: 1, devotion: -1, patience: 3 } },
      { label: "「妳是不是覺得自己不夠好？」", stats: { affection: 2, devotion: 3, hope: -2 } },
      { label: "「那就繼續努力吧。」", stats: { affection: 2, devotion: 5, hope: -3 } }
    ]
  },
  {
    id: "EVENT_jupiter_foreshadow_02",
    character: "jupiter",
    kind: "foreshadow",
    title: "她的房間很空",
    description: `月月偶然進到木星的房間。
裡面沒有太多屬於木星自己的東西。
反而到處都是月月曾經送過或提過的小物。
月月問她自己的東西去哪裡了。
木星只是笑著說：「我平常也沒什麼需要。」`,
    resultCopy: "木星的生活裡，屬於自己的東西似乎越來越少。",
    intervalCopy: "她不是把月月放進生活裡，她正在慢慢把生活換成月月。",
    choices: [
      { label: "「妳應該買自己的東西。」", stats: { affection: 2, devotion: -1, hope: 3 } },
      { label: "「妳喜歡就留著吧。」", stats: { affection: 4, devotion: 4, hope: 1 } },
      { label: "「妳是不是都在想我？」", stats: { affection: 3, devotion: 3, hope: 2 } },
      { label: "「這樣有點不正常。」", stats: { affection: -2, devotion: 2, hope: -2 } }
    ]
  },
  {
    id: "EVENT_jupiter_foreshadow_03",
    character: "jupiter",
    kind: "foreshadow",
    title: "只要妳需要",
    description: `月月問木星如果有一天自己不再需要她，她會怎麼辦。
木星沉默了一下。
「那就等妳需要我的那天。」
月月問她如果永遠不需要呢。
她笑著說：「那我就一直等。」`,
    resultCopy: "木星把「留下」理解成了一種等待。",
    intervalCopy: "她真正害怕的，或許不是月月離開，而是自己不再有存在的理由。",
    choices: [
      { label: "「不要一直等我。」", stats: { affection: 1, devotion: -2, hope: -3 } },
      { label: "「我不會不要妳。」", stats: { affection: 5, devotion: 4, hope: 4 } },
      { label: "「妳應該有自己的生活。」", stats: { affection: 2, devotion: -1, hope: 2 } },
      { label: "「那就一直留在我身邊吧。」", stats: { affection: 4, devotion: 5, hope: 3 } }
    ]
  },
  {
    id: "EVENT_jupiter_quiet_date",
    character: "jupiter",
    kind: "solo",
    title: "讓我照顧妳",
    description: `月月今天看起來特別累。
木星什麼都沒有問，只把她帶到安靜的地方。
她替月月倒水，又把燈光調暗。
「今天什麼都不要做。」
「讓我照顧妳。」`,
    flags: ["jupiter_quiet_date"],
    tags: ["jupiter", "date", "solo", "romance"],
    resultCopy: "木星得到了最喜歡的角色：被月月需要的人。",
    intervalCopy: "她沒有要求月月愛她，只希望月月願意讓她留下。",
    choices: [
      { label: "完全交給她。", stats: { affection: 5, devotion: 5, patience: 2 } },
      { label: "「我自己來就好。」", stats: { affection: 1, devotion: -1, patience: 3 } },
      { label: "「那妳陪著我。」", stats: { affection: 5, devotion: 4, hope: 2 } },
      { label: "「妳不用做到這麼多。」", stats: { affection: 2, devotion: 2, hope: -1 } }
    ]
  },
  {
    id: "EVENT_jupiter_solo_02",
    character: "jupiter",
    kind: "solo",
    title: "今天換我陪妳",
    description: `木星發現月月今天心情不好。
她沒有問原因，只安靜坐在旁邊。
月月說不用陪，她還是沒有離開。
「我不需要妳做什麼。」
「我只是想陪妳。」`,
    resultCopy: "木星不需要月月開口，只要她沒有趕自己走。",
    intervalCopy: "對木星而言，「留下」本身就是一種被允許的愛。",
    choices: [
      { label: "讓她留下。", stats: { affection: 4, devotion: 4, patience: 3 } },
      { label: "「妳真的不用陪。」", stats: { affection: -1, devotion: 1, hope: -2 } },
      { label: "靠著她。", stats: { affection: 5, devotion: 5, hope: 2 } },
      { label: "「那我們一起做自己的事。」", stats: { affection: 3, devotion: 3, patience: 2 } }
    ]
  },
  {
    id: "EVENT_jupiter_solo_03",
    character: "jupiter",
    kind: "solo",
    title: "妳可以去愛別人",
    description: `月月問木星如果自己喜歡很多人，她會怎麼辦。
木星沉默了一會，最後笑了。
「我知道妳不是只會喜歡一個人。」
她沒有生氣，也沒有要求月月改變。
「妳可以去愛別人，只要妳還願意讓我在妳身邊。」`,
    resultCopy: "木星接受了月月不專一的事實。",
    intervalCopy: "她真正想爭的從來不是唯一，而是「最不能被取代」。",
    choices: [
      { label: "「我會讓妳留在身邊。」", stats: { affection: 5, devotion: 5, hope: 4, jealousy: -1 } },
      { label: "「妳真的不介意嗎？」", stats: { affection: 3, devotion: 3, hope: 2, jealousy: 1 } },
      { label: "「那妳不要等我。」", stats: { affection: -2, devotion: -2, hope: -4 } },
      { label: "「那妳就永遠陪著我吧。」", stats: { affection: 4, devotion: 6, hope: 4 } }
    ]
  }
]);
