const MAX_AFFINITY = 100;
const COOLDOWN_MS = 3000;

const CHARACTERS = [
  { id: "nini", icon: "🐕", name: "日日", accent: "#ffb36a" },
  { id: "meteor", icon: "🥤", name: "流星", accent: "#7cf7ff" },
  { id: "pepsi", icon: "🌑", name: "百事", accent: "#c59bff" },
  { id: "jupiter", icon: "🪐", name: "木星", accent: "#ffd56a" },
  { id: "mars", icon: "🔥", name: "火星", accent: "#ff6a4d" },
];

const ACTIONS = {
  letter: { label: "💌 傳遞情書", delta: 10, flag: "love" },
  peek: { label: "👀 偷看秘密", delta: 5, flag: "shy" },
  encounter: { label: "💘 製造偶遇", delta: 12, flag: "love" },
  sabotage: { label: "💥 破壞約會", delta: -15, flag: "angry" },
};

const els = {
  grid: document.getElementById("character-grid"),
  liveEvent: document.getElementById("live-event"),
  marquee: document.getElementById("marquee-track"),
  modal: document.getElementById("target-modal"),
  modalLabel: document.getElementById("modal-action-label"),
  targets: document.getElementById("target-list"),
  actionRow: document.getElementById("action-row"),
};

const state = {
  affinity: { nini: 72, meteor: 68, pepsi: 85, jupiter: 61, mars: 79 },
  display: { nini: 72, meteor: 68, pepsi: 85, jupiter: 61, mars: 79 },
  flags: {},
  logs: [
    "觀眾對 🔥火星 發動了 [💌傳遞情書]，好感度 +10",
    "觀眾對 🌑百事 發動了 [👀偷看秘密]，好感度 +5",
    "🐕日日 在彈幕區狂刷「那是我的位置」",
    "🥤流星 被發現在備戰七夕告白稿",
  ],
  pendingAction: null,
  cooling: false,
};

function clamp(value) {
  return Math.max(0, Math.min(MAX_AFFINITY, value));
}

function labelOf(id) {
  const c = CHARACTERS.find((item) => item.id === id);
  return `${c.icon}${c.name}`;
}

function getStatus(id) {
  const value = state.affinity[id];
  const max = Math.max(...Object.values(state.affinity));
  const flag = state.flags[id];

  if (flag === "angry") return "😡氣炸了";
  if (flag === "love") return "🥰戀愛腦";
  if (flag === "shy") return "😳心跳加速";
  if (flag === "jealous") return "😡醋意大發";
  if (value >= 80 && value === max) return "🥰戀愛腦";
  if (value < max && max - value >= 10) return "😡醋意大發";
  if (value >= 70) return "😍極度心動";
  if (value >= 55) return "😊好感上升";
  return "💔心情低落";
}

function updateLiveEvent() {
  const ranked = [...CHARACTERS].sort(
    (a, b) => state.affinity[b.id] - state.affinity[a.id]
  );
  const top = ranked[0];
  const rival = ranked[1];
  const angry = CHARACTERS.find((c) => state.flags[c.id] === "angry");
  const jealous = CHARACTERS.find((c) => state.flags[c.id] === "jealous");

  let text = `🔥 ${top.name}與${rival.name}正在互相傷害中`;
  if (angry) text = `💥 ${angry.name} 的約會現場正在爆炸`;
  else if (jealous) text = `🔥 ${jealous.name}與${top.name}正在互相傷害中`;

  els.liveEvent.textContent = text;
}

function renderMarquee() {
  const items = state.logs.map((text) => `<span>${text}</span>`).join("");
  els.marquee.innerHTML = items + items;
}

function pushLog(text) {
  state.logs.unshift(text);
  state.logs = state.logs.slice(0, 8);
  renderMarquee();
}

function animateNumber(id, next) {
  const el = els.grid.querySelector(`[data-id="${id}"] .affinity-value`);
  if (!el) return;

  const from = state.display[id];
  const to = next;
  const duration = 550;
  const start = performance.now();
  el.classList.add("is-tick");

  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.round(from + (to - from) * eased);
    el.textContent = String(value);
    if (t < 1) {
      requestAnimationFrame(tick);
      return;
    }
    state.display[id] = to;
    el.textContent = String(to);
    el.classList.remove("is-tick");
  };

  requestAnimationFrame(tick);
}

function renderCharacters(initial = false) {
  if (initial) {
    els.grid.innerHTML = CHARACTERS.map((c) => `
      <article class="char-card" data-id="${c.id}" style="--accent:${c.accent}">
        <div class="char-icon">${c.icon}</div>
        <h3 class="char-name">${c.name}</h3>
        <p class="affinity">❤️ <span class="affinity-value">${state.affinity[c.id]}</span></p>
        <div class="bar" aria-hidden="true"><i class="bar-fill" style="width:0%"></i></div>
        <span class="status-tag">${getStatus(c.id)}</span>
      </article>
    `).join("");
  }

  CHARACTERS.forEach((c) => {
    const card = els.grid.querySelector(`[data-id="${c.id}"]`);
    const fill = card.querySelector(".bar-fill");
    const tag = card.querySelector(".status-tag");
    const apply = () => {
      fill.style.width = `${state.affinity[c.id]}%`;
      tag.textContent = getStatus(c.id);
    };
    if (initial) requestAnimationFrame(apply);
    else apply();
  });
}

function renderTargets() {
  els.targets.innerHTML = CHARACTERS.map((c) => `
    <button class="target-btn" type="button" data-target="${c.id}">
      ${c.icon}<br>${c.name}
      <small>❤️ ${state.affinity[c.id]}</small>
    </button>
  `).join("");
}

function openModal(actionId) {
  if (state.cooling) return;
  state.pendingAction = actionId;
  els.modalLabel.textContent = ACTIONS[actionId].label;
  renderTargets();
  els.modal.hidden = false;
}

function closeModal() {
  state.pendingAction = null;
  els.modal.hidden = true;
}

function setButtonsCooling(actionId, remainingMs) {
  const buttons = els.actionRow.querySelectorAll(".action-btn");
  buttons.forEach((btn) => {
    const isUsed = btn.dataset.action === actionId;
    const face = btn.querySelector(".btn-face");
    const cool = btn.querySelector(".btn-cool");
    btn.disabled = remainingMs > 0;
    btn.classList.toggle("is-cooling", remainingMs > 0 && isUsed);
    if (remainingMs > 0 && isUsed) {
      face.hidden = true;
      cool.hidden = false;
      cool.textContent = `⏳ ${Math.ceil(remainingMs / 1000)}s`;
    } else {
      face.hidden = false;
      cool.hidden = true;
    }
  });
}

function startCooldown(actionId) {
  state.cooling = true;
  const started = Date.now();
  setButtonsCooling(actionId, COOLDOWN_MS);

  const timer = setInterval(() => {
    const remaining = COOLDOWN_MS - (Date.now() - started);
    if (remaining <= 0) {
      clearInterval(timer);
      state.cooling = false;
      setButtonsCooling(actionId, 0);
      return;
    }
    setButtonsCooling(actionId, remaining);
  }, 200);
}

function applyAction(actionId, characterId) {
  const action = ACTIONS[actionId];
  const before = state.affinity[characterId];
  const after = clamp(before + action.delta);
  const applied = after - before;

  state.affinity[characterId] = after;
  state.flags = {};
  state.flags[characterId] = action.flag;

  if (action.delta > 0) {
    CHARACTERS.forEach((c) => {
      if (c.id !== characterId) state.flags[c.id] = "jealous";
    });
  }

  renderCharacters();
  animateNumber(characterId, after);

  const card = els.grid.querySelector(`[data-id="${characterId}"]`);
  card.classList.remove("is-up", "is-down");
  void card.offsetWidth;
  card.classList.add(applied >= 0 ? "is-up" : "is-down");

  const signed = `${applied > 0 ? "+" : ""}${applied}`;
  pushLog(`觀眾對 ${labelOf(characterId)} 發動了 [${action.label.replace(" ", "")}]，好感度 ${signed}`);
  updateLiveEvent();
  startCooldown(actionId);
}

els.actionRow.addEventListener("click", (event) => {
  const button = event.target.closest(".action-btn");
  if (!button || state.cooling) return;
  openModal(button.dataset.action);
});

els.targets.addEventListener("click", (event) => {
  const button = event.target.closest("[data-target]");
  if (!button || !state.pendingAction) return;
  const actionId = state.pendingAction;
  const targetId = button.dataset.target;
  closeModal();
  applyAction(actionId, targetId);
});

els.modal.addEventListener("click", (event) => {
  if (event.target.dataset.close) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !els.modal.hidden) closeModal();
});

renderCharacters(true);
renderMarquee();
updateLiveEvent();
