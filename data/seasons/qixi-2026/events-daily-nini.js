import { compileAll } from "./events-daily-helpers.js";

export const NINI_DAILY_EVENTS = compileAll([
  {
    id: "EVENT_nini_sweet_01",
    character: "nini",
    kind: "sweet",
    title: "她說今天也想見妳",
    description:
      "月月剛走進客廳，日日就從地下室探出頭來。\n她手裡還抱著那隻陪了她很久的晶晶。\n「妳今天怎麼這麼晚才回來？」她嘴上抱怨，尾巴卻已經搖得停不下來。\n她把晶晶塞進月月懷裡，自己順勢坐到月月旁邊。\n「我只是想讓妳知道，我今天也有在等妳。」",
    resultCopy: "日日似乎很滿足。",
    intervalCopy: "日日只是想確認，月月還會回到她身邊。",
    choices: [
      { label: "「那我陪妳一下。」", stats: { affection: 4, dependence: 2, obsession: 1 } },
      { label: "「妳怎麼每天都在等我？」", stats: { affection: 2, obsession: 2, trust: -1 } },
      { label: "「晶晶比我可愛吧？」", stats: { affection: 1, jealousy: 2, obsession: 1 } },
      { label: "「我要先去忙了。」", stats: { affection: -2, dependence: -1, obsession: 2 } },
    ],
  },
  {
    id: "EVENT_nini_sweet_02",
    character: "nini",
    kind: "sweet",
    title: "留給妳的位置",
    description:
      "月月發現沙發上多了一個新抱枕。\n日日拍拍自己旁邊的位置，說那是特別留下來的。\n「別人坐過也沒關係，但這個位置還是妳的。」\n她說完後自己先害羞，卻又不肯把視線移開。\n最後她小聲補了一句：「因為我喜歡妳坐這裡。」",
    resultCopy: "日日記住了月月的位置。",
    intervalCopy: "有些位置一旦被留給某個人，就很難再換人。",
    choices: [
      { label: "坐過去。", stats: { affection: 4, dependence: 1, obsession: 2 } },
      { label: "故意坐到另一邊。", stats: { affection: -1, jealousy: 2, obsession: 1 } },
      { label: "把抱枕拿走。", stats: { affection: 1, obsession: 3, trust: -2 } },
      { label: "「妳留給我的，那我就收下。」", stats: { affection: 3, trust: 2, dependence: 1 } },
    ],
  },
  {
    id: "EVENT_nini_sweet_03",
    character: "nini",
    kind: "sweet",
    title: "晶晶也知道",
    description:
      "日日把晶晶放到月月手上。\n「妳知道嗎？晶晶很早就知道我最喜歡誰。」\n她故意說得理所當然，像是在宣布一件早已決定的事情。\n月月問她為什麼，日日只是笑。\n「因為我每次想妳，都會抱她。」",
    resultCopy: "日日把晶晶當成了兩人之間的小秘密。",
    intervalCopy: "晶晶原本只是娃娃，現在卻像知道太多事情。",
    choices: [
      { label: "「那我抱一下晶晶。」", stats: { affection: 3, dependence: 2, obsession: 1 } },
      { label: "「所以妳每天都在想我？」", stats: { affection: 4, obsession: 3, jealousy: 1 } },
      { label: "「我把晶晶還給妳。」", stats: { affection: -2, dependence: -1, obsession: 2 } },
      { label: "「那我們一起抱。」", stats: { affection: 5, dependence: 2, trust: 1 } },
    ],
  },
  {
    id: "EVENT_nini_sweet_04",
    character: "nini",
    kind: "sweet",
    title: "今天也要說一次",
    description:
      "日日突然站到月月面前。\n她沒有鋪陳，也沒有繞圈子。\n「我喜歡妳。」她說得非常自然。\n月月還沒回答，她又補了一次：「今天也是。」\n然後她像完成每日任務一樣滿意地坐回去。",
    resultCopy: "日日把「喜歡」變成了每天都要完成的事情。",
    intervalCopy: "對日日來說，喜歡不是偶爾說出口，而是每天都要確認。",
    choices: [
      { label: "「我也喜歡妳。」", stats: { affection: 5, obsession: 2, dependence: 2 } },
      { label: "「妳每天都要說嗎？」", stats: { affection: 2, obsession: 1, trust: -1 } },
      { label: "「那明天也要說。」", stats: { affection: 4, dependence: 2, obsession: 3 } },
      { label: "「今天先不要說。」", stats: { affection: -2, jealousy: 1, trust: -2 } },
    ],
  },
  {
    id: "EVENT_nini_nature_01",
    character: "nini",
    kind: "nature",
    title: "她真的住下來了",
    description:
      "月月隨口問日日什麼時候打算回家。\n日日愣了幾秒，反問：「我不是已經住這裡了嗎？」\n她甚至認真指出地下室哪一個角落是自己的。\n月月說當初只是開玩笑，日日卻露出困惑的表情。\n「可是妳叫我留下來了啊。」",
    resultCopy: "日日似乎真的把那句話當成了承諾。",
    intervalCopy: "一句玩笑話，有時候會被某個人當成一生的答案。",
    choices: [
      { label: "「那就繼續住吧。」", stats: { affection: 3, dependence: 4, obsession: 2 } },
      { label: "「我當初真的只是開玩笑。」", stats: { affection: -2, trust: -2, obsession: 3 } },
      { label: "「妳自己決定就好。」", stats: { affection: 1, dependence: 2, obsession: 2 } },
      { label: "「妳不會真的打算一直住吧？」", stats: { affection: -1, jealousy: 1, dependence: -2 } },
    ],
  },
  {
    id: "EVENT_nini_nature_02",
    character: "nini",
    kind: "nature",
    title: "她不喜歡等待",
    description:
      "月月答應日日晚點陪她看電影。\n結果時間到了，月月還在忙。\n日日沒有催，只是坐在門口一直看著時鐘。\n月月終於出現時，她立刻恢復笑容。\n「我沒有生氣，我只是一直在等妳。」",
    resultCopy: "日日沒有責怪月月，只是把等待記了下來。",
    intervalCopy: "有些人不說「我生氣了」，只是把等待變得更久。",
    choices: [
      { label: "「對不起，讓妳等這麼久。」", stats: { affection: 3, trust: 2, dependence: 1 } },
      { label: "「下次不要等我了。」", stats: { affection: -2, dependence: -3, obsession: 2 } },
      { label: "「妳可以直接催我啊。」", stats: { trust: 3, affection: 1, jealousy: -1 } },
      { label: "「妳等我不是理所當然嗎？」", stats: { affection: -3, trust: -3, obsession: 2 } },
    ],
  },
  {
    id: "EVENT_nini_nature_03",
    character: "nini",
    kind: "nature",
    title: "她記得很小的事",
    description:
      "月月只是隨口說最近喜歡某種味道。\n隔天日日就把同樣味道的東西放到桌上。\n月月問她怎麼知道，日日只說：「妳自己講的啊。」\n她甚至連月月說這句話時的日期都記得。\n「我有在聽妳說話。」",
    resultCopy: "日日的記性，似乎只對月月特別好。",
    intervalCopy: "被記住是一件甜蜜的事，直到你開始發現她記得太多。",
    choices: [
      { label: "「妳記得也太清楚了吧。」", stats: { affection: 3, obsession: 2, trust: 1 } },
      { label: "「不用每件事都記得。」", stats: { affection: -1, trust: 1, obsession: 1 } },
      { label: "「那我故意說個妳不知道的。」", stats: { affection: 2, obsession: 3, jealousy: 1 } },
      { label: "「謝謝妳一直聽我說。」", stats: { affection: 4, trust: 3, dependence: 1 } },
    ],
  },
  {
    id: "EVENT_nini_overstep_01",
    character: "nini",
    kind: "overstep",
    title: "髮圈去哪裡了",
    description:
      "月月找不到自己常戴的髮圈。\n日日卻從口袋裡拿出來，說只是暫時替她保管。\n「我看到它掉在桌上，所以就收起來了。」\n月月問她為什麼不直接放回去。\n日日笑著說：「因為我喜歡看妳找東西的樣子。」",
    resultCopy: "日日得到了一件屬於月月的小東西。",
    intervalCopy: "她說是保管，但那真的只是保管嗎？",
    flags: ["foreshadow_nini_hair"],
    choices: [
      { label: "「還我。」", stats: { trust: 2, obsession: -1, affection: -1 } },
      { label: "「妳喜歡就拿著吧。」", stats: { affection: 3, obsession: 4, trust: -2 } },
      { label: "「妳可以先問我。」", stats: { trust: 3, obsession: -1, dependence: 1 } },
      { label: "「妳真的很奇怪。」", stats: { affection: 1, jealousy: 1, obsession: 2 } },
    ],
  },
  {
    id: "EVENT_nini_overstep_02",
    character: "nini",
    kind: "overstep",
    title: "門不用鎖",
    description:
      "月月準備關地下室的門。\n日日卻說不用鎖，因為她會自己進出。\n「妳不是說這裡也是我的家嗎？」\n月月愣了一下，日日已經轉身往裡走。\n她回頭笑著說：「妳不會真的把我關起來吧？」",
    resultCopy: "日日對「留下來」的理解越來越深。",
    intervalCopy: "地下室的門沒鎖，但真正需要鑰匙的人可能不是日日。",
    choices: [
      { label: "「不會，妳想去哪都可以。」", stats: { trust: 3, dependence: -1, obsession: 2 } },
      { label: "「晚上還是鎖一下。」", stats: { trust: -1, affection: -1, obsession: 3 } },
      { label: "「妳真的把這裡當自己家了。」", stats: { affection: 2, dependence: 2, obsession: 2 } },
      { label: "「那我也可以隨時進去嗎？」", stats: { affection: 3, trust: 2, jealousy: -1 } },
    ],
  },
  {
    id: "EVENT_nini_overstep_03",
    character: "nini",
    kind: "overstep",
    title: "妳今天穿哪件",
    description:
      "日日突然問月月今天要穿什麼。\n月月隨口回答後，她立刻說另一件比較好。\n「那件比較適合妳。」\n月月笑她管太多，日日卻認真說：「因為我喜歡看妳漂亮。」\n她停了一下，又補充：「最好是只有我看得到。」",
    resultCopy: "日日的「喜歡」開始帶上一點佔有。",
    intervalCopy: "她只是想看月月漂亮，至於誰能看見，似乎是另一個問題。",
    choices: [
      { label: "「那我就穿妳選的。」", stats: { affection: 3, obsession: 3, dependence: 1 } },
      { label: "「我偏偏要穿另一件。」", stats: { affection: -1, jealousy: 2, trust: 1 } },
      { label: "「妳是不是有點太在意了？」", stats: { affection: 1, obsession: 3, trust: -2 } },
      { label: "「漂亮給大家看啊。」", stats: { affection: -2, jealousy: 3, obsession: 2 } },
    ],
  },
  {
    id: "EVENT_nini_foreshadow_01",
    character: "nini",
    kind: "foreshadow",
    title: "襪子怎麼少一雙",
    description:
      "月月整理衣服時，發現少了一雙襪子。\n她想了半天也不知道丟在哪裡。\n日日站在旁邊沒有說話，只是抱著晶晶。\n月月問她有沒有看見，日日很快回答：「沒有。」\n她說完後卻把晶晶抱得更緊了一點。",
    resultCopy: "少掉的東西，暫時沒有找到答案。",
    intervalCopy: "有些東西不是不見了，只是不知道被誰留下了。",
    flags: ["foreshadow_nini_missing"],
    choices: [
      { label: "繼續追問。", stats: { trust: 2, obsession: -1, jealousy: 1 } },
      { label: "「算了，可能洗丟了。」", stats: { affection: 1, obsession: 2, trust: -1 } },
      { label: "「妳真的沒看到？」", stats: { trust: -1, obsession: 3, jealousy: 1 } },
      { label: "把這件事告訴其他人。", stats: { trust: -2, jealousy: 2, obsession: 1 } },
    ],
  },
  {
    id: "EVENT_nini_foreshadow_02",
    character: "nini",
    kind: "foreshadow",
    title: "地下室的第二個箱子",
    description:
      "月月無意間看到地下室角落多了一個鎖著的箱子。\n日日立刻擋在箱子前面。\n「這是我的東西。」\n她笑得很自然，卻沒有解釋裡面放什麼。\n晶晶就放在箱子旁邊。",
    resultCopy: "日日似乎藏了一個只屬於自己的秘密。",
    intervalCopy: "地下室裡的東西，開始不只是生活用品。",
    choices: [
      { label: "「我可以看看嗎？」", stats: { trust: 2, obsession: 2, dependence: 1 } },
      { label: "「好吧，那是妳的秘密。」", stats: { trust: 3, obsession: 1, affection: 2 } },
      { label: "「妳越不讓我看我越想看。」", stats: { affection: 1, obsession: 4, trust: -1 } },
      { label: "直接打開。", stats: { trust: -4, jealousy: 2, obsession: 3 } },
    ],
  },
  {
    id: "EVENT_nini_foreshadow_03",
    character: "nini",
    kind: "foreshadow",
    title: "她說不要搬走",
    description:
      "月月只是隨口提到未來可能換房子。\n日日的表情第一次瞬間僵住。\n她問：「那我呢？」\n月月還沒回答，她又笑著說自己只是開玩笑。\n但那一整晚，她都沒有再離開地下室。",
    resultCopy: "日日似乎非常害怕「離開」這件事。",
    intervalCopy: "有些玩笑，只有一個人笑得出來。",
    choices: [
      { label: "「妳當然可以一起來。」", stats: { affection: 4, dependence: 4, obsession: 3 } },
      { label: "「我還不知道。」", stats: { affection: -1, dependence: 2, obsession: 3 } },
      { label: "「妳可以自己決定。」", stats: { trust: 2, dependence: -2, obsession: 2 } },
      { label: "「如果換房子，妳就不能住了。」", stats: { affection: -3, trust: -2, obsession: 4 } },
    ],
  },
  {
    id: "EVENT_nini_solo_01",
    character: "nini",
    kind: "solo",
    title: "地下室的晚安",
    description:
      "月月下樓找日日時，發現她已經準備好了兩杯飲料。\n日日坐在床邊，把晶晶放在兩人中間。\n「今天沒有別人。」她笑著說。\n她沒有做任何特別的事情，只是一直看著月月。\n最後她輕聲說：「晚安以前，我想多看妳一會。」",
    resultCopy: "日日享受了一段只有兩人的時間。",
    intervalCopy: "地下室很安靜，但日日的目光一直沒有離開月月。",
    choices: [
      { label: "陪她坐著。", stats: { affection: 5, dependence: 3, obsession: 2 } },
      { label: "「妳快睡吧。」", stats: { affection: 1, dependence: -1, obsession: 1 } },
      { label: "把晶晶拿到旁邊。", stats: { affection: 3, trust: 2, obsession: 3 } },
      { label: "「我還有事情。」", stats: { affection: -3, dependence: -2, obsession: 3 } },
    ],
  },
  {
    id: "EVENT_nini_solo_02",
    character: "nini",
    kind: "solo",
    title: "如果只有我們",
    description:
      "日日突然問月月，如果這裡只剩下她們兩個人會怎樣。\n她沒有解釋自己為什麼問。\n月月反問她，她只是笑著說「那就很好啊」。\n她靠近了一點，卻沒有真的碰到月月。\n「因為我只要妳在，就不會覺得孤單。」",
    resultCopy: "日日的依賴開始變得更加直接。",
    intervalCopy: "「只要妳在」對日日來說，似乎已經接近全部。",
    choices: [
      { label: "「那我會陪妳。」", stats: { affection: 4, dependence: 4, obsession: 3 } },
      { label: "「還是要有其他朋友吧。」", stats: { affection: -1, dependence: -2, trust: 2 } },
      { label: "「妳是不是只想要我？」", stats: { affection: 2, obsession: 4, jealousy: 2 } },
      { label: "「聽起來有點可怕。」", stats: { affection: -2, trust: -2, obsession: 3 } },
    ],
  },
  {
    id: "EVENT_nini_solo_03",
    character: "nini",
    kind: "solo",
    title: "把晶晶放在中間",
    description:
      "日日把晶晶放在兩人中間，說這樣就像以前一樣。\n月月問以前是什麼時候，她卻沒有回答。\n她只是牽住月月的手，讓晶晶靠著兩人。\n「這樣就好了。」\n她笑得很開心，像是終於把什麼東西拼回原位。",
    resultCopy: "日日似乎把「以前」與「現在」重疊了。",
    intervalCopy: "晶晶被放在兩人中間，像一道小小的時間分界線。",
    choices: [
      { label: "握住她的手。", stats: { affection: 5, dependence: 2, trust: 1 } },
      { label: "「妳好像很在意晶晶。」", stats: { affection: 2, obsession: 2, trust: 1 } },
      { label: "把手抽開。", stats: { affection: -2, trust: -2, obsession: 3 } },
      { label: "「那我們一直這樣也可以。」", stats: { affection: 4, dependence: 4, obsession: 4 } },
    ],
  },
]);
