import { compileSpecials } from "./events-special-helpers.js";

function crisisConditions(id, character) {
  return {
    all: [
      { flag: "dynamic_pool_unlocked" },
      { not: { completed: id } },
      { not: { flag: `crisis_blocked_${character}` } },
      {
        any: [
          { flag: `public_jealous_${character}` },
          { flag: `date_broken_${character}` },
          { flag: `forced_${character}` },
          { flag: `fate_rewritten_${character}` },
        ],
      },
    ],
  };
}

export const CRISIS_EVENTS = compileSpecials([
  {
    id: "CRISIS_nini_01",
    character: "nini",
    title: "地下室的門鎖了",
    description:
      "月月回到房間時，發現地下室的門已經被鎖上。\n日日站在門後，手裡抱著晶晶。\n「今天不要讓她們進來，好不好？」\n她的聲音還是很乖，卻第一次沒有等待月月回答。\n門鎖裡傳來輕輕一聲喀。",
    weight: 26,
    tags: ["nini", "crisis"],
    resultCopy: "⚠️ 日日的危險訊號開始明顯。",
    intervalCopy: "⚠️ 日日的依賴已經不只是撒嬌。請注意她接下來的行動。",
    conditions: crisisConditions("CRISIS_nini_01", "nini"),
    choices: [
      { label: "安撫日日", stats: { trust: 7, obsession: -3, dependence: 5 } },
      { label: "要求她立刻開門", stats: { trust: -6, obsession: 7, jealousy: 5 } },
      { label: "問她到底在害怕誰", stats: { jealousy: 7, trust: 3, obsession: 5 } },
      { label: "說「我陪妳待著」", stats: { affection: 8, dependence: 7, obsession: 6 } },
    ],
  },
  {
    id: "CRISIS_meteor_01",
    character: "meteor",
    title: "我們沒有分手",
    description:
      "流星忽然在所有人面前說：「我跟月月本來就沒有分手。」\n現場安靜了幾秒。\n月月甚至不知道該從哪一句開始反駁。\n流星卻像只是陳述一件很普通的事。\n她看向其他人：「所以妳們到底在搶什麼？」",
    weight: 26,
    tags: ["meteor", "crisis"],
    resultCopy: "⚠️ 流星把過去直接帶到了所有人面前。",
    intervalCopy: "⚠️ 有些人相信約定會自己延續，有些人現在才發現自己從來沒有答應過。",
    conditions: crisisConditions("CRISIS_meteor_01", "meteor"),
    choices: [
      { label: "立刻否認", stats: { pride: -7, jealousy: 7, destiny: 5 } },
      { label: "沉默", stats: { destiny: 8, nostalgia: 5, jealousy: 6 } },
      { label: "問她為什麼現在才說", stats: { affection: 5, pride: -4, destiny: 7 } },
      { label: "握住她的手", stats: { affection: 8, destiny: 8, jealousy: 7 } },
    ],
  },
  {
    id: "CRISIS_pepsi_01",
    character: "pepsi",
    title: "她知道妳下一句話",
    description:
      "月月剛準備說話，百事卻先把那句話說了出來。\n她甚至連月月會皺眉的角度都猜得一模一樣。\n其他人開始注意到兩人的同步。\n百事沒有解釋，只問：「妳們現在還覺得這只是巧合嗎？」\n那一瞬間，月月第一次覺得自己像被自己看穿。",
    weight: 26,
    tags: ["pepsi", "crisis"],
    resultCopy: "⚠️ 百事與月月的同步開始引起其他人的注意。",
    intervalCopy: "🌌 當兩個人太像時，旁觀者反而會開始害怕她們有什麼共同秘密。",
    conditions: crisisConditions("CRISIS_pepsi_01", "pepsi"),
    choices: [
      { label: "承認默契", stats: { resonance: 8, similarity: 7, destiny: 5 } },
      { label: "說這只是巧合", stats: { resonance: -6, similarity: -5, destiny: 7 } },
      { label: "問她怎麼做到的", stats: { resonance: 8, affection: 4, similarity: 6 } },
      { label: "故意說一件她不知道的事", stats: { similarity: -4, resonance: 5, destiny: 6 } },
    ],
  },
  {
    id: "CRISIS_jupiter_01",
    character: "jupiter",
    title: "這次換我先走",
    description:
      "木星把自己的東西全部整理進包裡。\n她沒有哭，也沒有質問月月。\n只是很安靜地說：「我一直說我不要求妳選我。」\n她停了一下。\n「但我沒有說，我永遠都會留下來。」",
    weight: 24,
    tags: ["jupiter", "crisis"],
    resultCopy: "⚠️ 木星第一次真的準備離開。",
    intervalCopy: "⚠️ 最危險的等待，不是等不到答案，而是終於決定不等了。",
    flags: ["jupiter_seen", "jupiter_packing_started"],
    conditions: crisisConditions("CRISIS_jupiter_01", "jupiter"),
    choices: [
      { label: "攔住她", stats: { affection: 8, hope: 8, patience: -6 } },
      { label: "讓她離開", stats: { patience: 7, hope: -8, affection: -4 } },
      { label: "問她是不是累了", stats: { devotion: 6, hope: 5, jealousy: -3 } },
      { label: "說「我希望妳留下」", stats: { affection: 9, hope: 8, patience: -7 } },
    ],
  },
  {
    id: "CRISIS_mars_01",
    character: "mars",
    title: "妳到底在躲誰？",
    description:
      "火星把月月堵在走廊上。\n她沒有像平常一樣笑。\n「妳最近一直躲我。」\n月月想回答，她卻先一步說：「還是妳只是不想承認，妳其實很喜歡跟我待在一起？」\n她的語氣很挑釁，眼神卻完全不是開玩笑。",
    weight: 26,
    tags: ["mars", "crisis", "romance"],
    resultCopy: "⚠️ 火星的挑釁已經不再只是遊戲。",
    intervalCopy: "🔥 火星第一次沒有把這件事當成玩笑。",
    conditions: crisisConditions("CRISIS_mars_01", "mars"),
    choices: [
      { label: "承認喜歡", stats: { affection: 9, chemistry: 8, pride: -6 } },
      { label: "否認", stats: { affection: -7, pride: 7, provocation: 8 } },
      { label: "反問她是不是也一樣", stats: { chemistry: 9, affection: 6, provocation: 7 } },
      { label: "直接靠近她", stats: { affection: 8, chemistry: 9, pride: -5 } },
    ],
  },
]);
