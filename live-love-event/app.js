const GIRLS = [
  { id: "rin", name: "月白 凜", role: "冷靜主播" },
  { id: "aya", name: "櫻庭 綾", role: "元氣擔當" },
  { id: "misa", name: "夜凪 美咲", role: "小惡魔" },
];

const COOLDOWN_MS = 3000;
const MAX_AFFINITY = 100;

const EVENTS = [
  {
    id: "open",
    tag: "#開播問候",
    speaker: "全員",
    speakerId: "all",
    text: "三個女孩同時看向鏡頭。今夜的聯動直播，由你決定修羅場的走向。",
    chat: { user: "房管", text: "聯動開始！彈幕友善一點喔～" },
    choices: [
      { label: "先喊凜的名字", hint: "凜 +12 / 綾 -4", effects: { rin: 12, aya: -4 } },
      { label: "先應援最吵的綾", hint: "綾 +12 / 美咲 -3", effects: { aya: 12, misa: -3 } },
      { label: "對美咲丟一顆愛心", hint: "美咲 +12 / 凜 -3", effects: { misa: 12, rin: -3 } },
      { label: "說「今晚三個人都超好看」", hint: "全員 +6", effects: { rin: 6, aya: 6, misa: 6 } },
    ],
  },
  {
    id: "seat",
    tag: "#座位爭奪",
    speaker: "櫻庭 綾",
    speakerId: "aya",
    text: "綾把椅子往你這邊拖：「今晚誰坐中間？當然是我啊！」凜沒說話，美咲已經在偷笑。",
    chat: { user: "匿名糖", text: "修羅場預警，我先把瓜子拿出來。" },
    choices: [
      { label: "讓綾坐中間", hint: "綾 +14 / 凜 -6", effects: { aya: 14, rin: -6 } },
      { label: "請凜坐你旁邊", hint: "凜 +14 / 綾 -5", effects: { rin: 14, aya: -5 } },
      { label: "故意空出位子給美咲", hint: "美咲 +14 / 綾 -4", effects: { misa: 14, aya: -4 } },
      { label: "自己坐中間當緩衝", hint: "全員 +5", effects: { rin: 5, aya: 5, misa: 5 } },
    ],
  },
  {
    id: "topic",
    tag: "#約會企劃",
    speaker: "月白 凜",
    speakerId: "rin",
    text: "凜把題目卡翻過來：「下一個環節——理想約會。觀眾，你選哪一種？」",
    chat: { user: "夜班貓", text: "凜講約會兩個字也太犯規了吧。" },
    choices: [
      { label: "安靜的書店與夜景", hint: "凜 +15 / 綾 -3", effects: { rin: 15, aya: -3 } },
      { label: "遊樂園一路尖叫", hint: "綾 +15 / 凜 -4", effects: { aya: 15, rin: -4 } },
      { label: "深夜酒吧與秘密", hint: "美咲 +15 / 綾 -3", effects: { misa: 15, aya: -3 } },
      { label: "三個人一起去溫泉", hint: "全員 +7，修羅值上升", effects: { rin: 7, aya: 7, misa: 7 } },
    ],
  },
  {
    id: "gift",
    tag: "#超級留言",
    speaker: "夜凪 美咲",
    speakerId: "misa",
    text: "美咲把手機湊近鏡頭：「有人刷了超聯。要不要我唸出來？還是……只唸給我聽？」",
    chat: { user: "榜一候補", text: "這題選錯會被剪進精華的。" },
    choices: [
      { label: "請凜念，比較不會亂發揮", hint: "凜 +13 / 美咲 -6", effects: { rin: 13, misa: -6 } },
      { label: "讓綾用最大音量讀", hint: "綾 +13 / 凜 -4", effects: { aya: 13, rin: -4 } },
      { label: "允許美咲只唸給你聽", hint: "美咲 +16 / 綾 -5", effects: { misa: 16, aya: -5 } },
      { label: "請三人輪流念同一句", hint: "全員 +6", effects: { rin: 6, aya: 6, misa: 6 } },
    ],
  },
  {
    id: "accident",
    tag: "#距離事故",
    speaker: "櫻庭 綾",
    speakerId: "aya",
    text: "綾去倒水時絆到線材，整個人靠過來。凜伸手扶住她，美咲則把這段特寫拉到最大。",
    chat: { user: "心跳監測員", text: "這不是事故，這是劇本吧？！" },
    choices: [
      { label: "先關心凜有沒有被撞到", hint: "凜 +12 / 綾 -2", effects: { rin: 12, aya: -2 } },
      { label: "把綾撈回椅子上", hint: "綾 +14 / 美咲 -3", effects: { aya: 14, misa: -3 } },
      { label: "吐槽美咲別再拉近鏡頭", hint: "美咲 +10（被逗樂） / 凜 +3", effects: { misa: 10, rin: 3 } },
      { label: "假裝什麼都沒發生", hint: "全員 -4", effects: { rin: -4, aya: -4, misa: -4 } },
    ],
  },
  {
    id: "secret",
    tag: "#真心話",
    speaker: "月白 凜",
    speakerId: "rin",
    text: "燈光變暗。凜問：「如果只能留下一個人收播後陪你走回家……你選誰？」美咲的笑淡了一點。",
    chat: { user: "修羅場警察", text: "這題不能全選，系統會炸掉。" },
    choices: [
      { label: "凜。因為她會把路燈都記住", hint: "凜 +18 / 其他 -8", effects: { rin: 18, aya: -8, misa: -8 } },
      { label: "綾。因為她不會讓夜晚安靜", hint: "綾 +18 / 其他 -8", effects: { aya: 18, rin: -8, misa: -8 } },
      { label: "美咲。因為她看起來最需要答案", hint: "美咲 +18 / 其他 -8", effects: { misa: 18, rin: -8, aya: -8 } },
      { label: "送你們三個回家，我自己搭末班車", hint: "全員 +4，但有人會不甘心", effects: { rin: 4, aya: 4, misa: 4 } },
    ],
  },
  {
    id: "conflict",
    tag: "#修羅場爆發",
    speaker: "夜凪 美咲",
    speakerId: "misa",
    text: "美咲突然說：「你們兩個都太認真了。觀眾比較喜歡被搶，對吧？」綾立刻反駁，凜則看著你。",
    chat: { user: "導演魂", text: "把選擇權丟回來了。危險。" },
    choices: [
      { label: "制止美咲，別把直播變成審判", hint: "凜 +10 / 美咲 -7", effects: { rin: 10, misa: -7 } },
      { label: "讓綾把真心話說完", hint: "綾 +12 / 美咲 -4", effects: { aya: 12, misa: -4 } },
      { label: "承認你確實享受被爭奪", hint: "美咲 +14 / 凜 -6", effects: { misa: 14, rin: -6 } },
      { label: "說「我喜歡的是這場關係本身」", hint: "全員 +8", effects: { rin: 8, aya: 8, misa: 8 } },
    ],
  },
  {
    id: "close",
    tag: "#收播告白",
    speaker: "全員",
    speakerId: "all",
    text: "倒數三十秒。三個人都把話筒推向你。最後一句，會被剪進片尾。",
    chat: { user: "官方剪輯", text: "這句會變成預告標題。" },
    choices: [
      { label: "「凜，下次只開給我們兩個。」", hint: "通往凜線", effects: { rin: 20, aya: -6, misa: -6 } },
      { label: "「綾，你的聲音我想聽很久。」", hint: "通往綾線", effects: { aya: 20, rin: -6, misa: -6 } },
      { label: "「美咲，別再用玩笑把喜歡藏起來。」", hint: "通往美咲線", effects: { misa: 20, rin: -6, aya: -6 } },
      { label: "「下次還是三個人。我還沒選完。」", hint: "通往後宮線", effects: { rin: 10, aya: 10, misa: 10 } },
    ],
  },
];

const ENDINGS = {
  rin: {
    title: "月白線｜路燈下的沉默",
    text: "收播後只剩凜還在。她把耳機線繞好，低聲說：「謝謝你沒把我當成最難靠近的那一個。」",
  },
  aya: {
    title: "櫻庭線｜還沒關的麥",
    text: "綾的笑聲還留在迴音裡。她抓住你的袖口：「明天也來看我。不准只看精華。」",
  },
  misa: {
    title: "夜凪線｜玩笑結束之後",
    text: "美咲把特寫關掉，第一次沒有笑。「被選到的感覺……比我想的還要命。」",
  },
  harem: {
    title: "後宮線｜修羅場未完",
    text: "三人同時看你。下一次聯動預告已經排上：同一間休息室，沒有鏡頭。",
  },
};

const state = {
  eventIndex: 0,
  affinity: { rin: 40, aya: 40, misa: 40 },
  cooling: false,
  ended: false,
};

const els = {
  portraits: document.getElementById("portrait-row"),
  affection: document.getElementById("affection-list"),
  chat: document.getElementById("chat-log"),
  choices: document.getElementById("choice-list"),
  speaker: document.getElementById("speaker-name"),
  dialogue: document.getElementById("dialogue-text"),
  sceneTag: document.getElementById("scene-tag"),
  progress: document.getElementById("event-progress"),
  viewers: document.getElementById("viewer-count"),
  cooldown: document.getElementById("cooldown-meter"),
  cooldownLabel: document.getElementById("cooldown-label"),
  overlay: document.getElementById("ending-overlay"),
  endingTitle: document.getElementById("ending-title"),
  endingText: document.getElementById("ending-text"),
  restart: document.getElementById("restart-btn"),
};

function clamp(value) {
  return Math.max(0, Math.min(MAX_AFFINITY, value));
}

function renderPortraits(activeId) {
  els.portraits.innerHTML = GIRLS.map((girl) => `
    <article class="portrait ${activeId === girl.id || activeId === "all" ? "is-active" : ""}" data-id="${girl.id}">
      <div class="avatar" aria-hidden="true"></div>
      <p class="portrait-name">${girl.name}</p>
      <p class="portrait-role">${girl.role}</p>
    </article>
  `).join("");
}

function renderAffection() {
  els.affection.innerHTML = GIRLS.map((girl) => `
    <div class="girl-row" data-id="${girl.id}" style="position:relative">
      <span>${girl.name.replace(" ", "")}</span>
      <div class="meter" aria-hidden="true"><i style="width:${state.affinity[girl.id]}%"></i></div>
      <span class="score">${state.affinity[girl.id]}</span>
    </div>
  `).join("");
}

function pushChat(user, text) {
  const item = document.createElement("li");
  item.innerHTML = `<strong>${user}</strong>${text}`;
  els.chat.appendChild(item);
  els.chat.scrollTop = els.chat.scrollHeight;
  while (els.chat.children.length > 8) {
    els.chat.removeChild(els.chat.firstChild);
  }
}

function showDelta(id, amount) {
  const row = els.affection.querySelector(`[data-id="${id}"]`);
  const portrait = els.portraits.querySelector(`[data-id="${id}"]`);
  if (!row || !amount) return;

  const bubble = document.createElement("span");
  bubble.className = `delta ${amount > 0 ? "is-up" : "is-down"}`;
  bubble.textContent = `${amount > 0 ? "+" : ""}${amount}`;
  bubble.style.right = "0";
  bubble.style.top = "-8px";
  row.appendChild(bubble);
  if (amount > 0 && portrait) portrait.classList.add("heart-burst");
  setTimeout(() => bubble.remove(), 900);
  setTimeout(() => portrait?.classList.remove("heart-burst"), 700);
}

function applyEffects(effects) {
  Object.entries(effects).forEach(([id, delta]) => {
    const next = clamp(state.affinity[id] + delta);
    const applied = next - state.affinity[id];
    state.affinity[id] = next;
    showDelta(id, applied);
  });
  renderAffection();
}

function setChoicesEnabled(enabled) {
  els.choices.querySelectorAll("button").forEach((btn) => {
    btn.disabled = !enabled;
  });
}

function startCooldown() {
  state.cooling = true;
  setChoicesEnabled(false);
  els.cooldown.classList.remove("is-ready");
  els.cooldown.classList.remove("is-cooling");
  els.cooldown.style.setProperty("--cd", `${COOLDOWN_MS}ms`);
  void els.cooldown.offsetWidth;
  els.cooldown.classList.add("is-cooling");
  els.cooldownLabel.textContent = "冷卻中";

  const started = Date.now();
  const tick = setInterval(() => {
    const remain = Math.max(0, COOLDOWN_MS - (Date.now() - started));
    els.cooldownLabel.textContent = remain > 0 ? `冷卻 ${Math.ceil(remain / 1000)}s` : "可以發言";
  }, 200);

  setTimeout(() => {
    clearInterval(tick);
    state.cooling = false;
    els.cooldown.classList.remove("is-cooling");
    els.cooldown.classList.add("is-ready");
    els.cooldownLabel.textContent = "可以發言";
    if (!state.ended) setChoicesEnabled(true);
  }, COOLDOWN_MS);
}

function renderEvent() {
  const event = EVENTS[state.eventIndex];
  els.sceneTag.textContent = event.tag;
  els.speaker.textContent = event.speaker;
  els.dialogue.textContent = event.text;
  els.progress.textContent = `事件 ${state.eventIndex + 1} / ${EVENTS.length}`;
  els.viewers.textContent = `${(12480 + state.eventIndex * 317).toLocaleString()} 觀看中`;
  renderPortraits(event.speakerId);
  renderAffection();
  if (event.chat) pushChat(event.chat.user, event.chat.text);

  els.choices.innerHTML = event.choices.map((choice, index) => `
    <button class="choice-btn" type="button" data-index="${index}">
      ${choice.label}
      <span class="choice-hint">${choice.hint}</span>
    </button>
  `).join("");
}

function pickEnding() {
  const values = Object.values(state.affinity);
  const max = Math.max(...values);
  const leaders = GIRLS.filter((girl) => state.affinity[girl.id] === max);
  const spread = max - Math.min(...values);

  if (leaders.length > 1 || spread < 8) return ENDINGS.harem;
  return ENDINGS[leaders[0].id];
}

function showEnding() {
  state.ended = true;
  setChoicesEnabled(false);
  const ending = pickEnding();
  els.endingTitle.textContent = ending.title;
  els.endingText.textContent = ending.text;
  els.overlay.hidden = false;
  pushChat("系統", "本場聯動結束。好感度已鎖定。");
}

function handleChoice(index) {
  if (state.cooling || state.ended) return;
  const event = EVENTS[state.eventIndex];
  const choice = event.choices[index];
  if (!choice) return;

  applyEffects(choice.effects);
  pushChat("你", choice.label);
  startCooldown();

  const nextIndex = state.eventIndex + 1;
  setTimeout(() => {
    if (nextIndex >= EVENTS.length) {
      showEnding();
      return;
    }
    state.eventIndex = nextIndex;
    renderEvent();
    setChoicesEnabled(false);
  }, 650);
}

function resetGame() {
  state.eventIndex = 0;
  state.affinity = { rin: 40, aya: 40, misa: 40 };
  state.cooling = false;
  state.ended = false;
  els.overlay.hidden = true;
  els.chat.innerHTML = "";
  els.cooldown.classList.remove("is-cooling");
  els.cooldown.classList.add("is-ready");
  els.cooldownLabel.textContent = "可以發言";
  renderEvent();
}

els.choices.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (!button) return;
  handleChoice(Number(button.dataset.index));
});

els.restart.addEventListener("click", resetGame);

resetGame();
