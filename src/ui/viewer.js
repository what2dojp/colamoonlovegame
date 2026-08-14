import { createGame } from "../engine/game.js";
import { audienceText, eventCastLabel, eventPresentation, FATE_COPY, fireCopy } from "./presentation.js";

const game = createGame();
const app = document.getElementById("app");

const ui = {
  step: null,
  actionId: null,
  drawPhase: 0,
  drawTitle: "",
  moonOpen: false,
  popup: null,
  seenResultAt: 0,
  timers: [],
};

function clearTimers() {
  for (const id of ui.timers) clearTimeout(id);
  ui.timers = [];
}

function closeOverlay() {
  ui.step = null;
  ui.actionId = null;
  ui.drawPhase = 0;
  ui.drawTitle = "";
  clearTimers();
}

function fateAction(state, id) {
  const item = state.interventions.find((entry) => entry.id === id);
  const copy = FATE_COPY[id] || {};
  return {
    id,
    name: item?.name || copy.title || id,
    cost: item?.cost || copy.cost || 0,
    tag: copy.tag || item?.blurb || "",
    available: item?.available !== false,
    needsTarget: item?.needsTarget !== false,
  };
}

function startDraw(action) {
  ui.step = "draw";
  ui.drawPhase = 1;
  ui.drawTitle = "";
  ui.actionId = action.id;
  clearTimers();
  ui.timers = [
    setTimeout(() => {
      ui.drawPhase = 2;
      render(game.getState());
    }, 700),
    setTimeout(() => {
      ui.drawPhase = 3;
      ui.drawTitle = audienceText(game.getState().currentEvent?.title || "命運已落下");
      render(game.getState());
    }, 1500),
    setTimeout(() => {
      closeOverlay();
      render(game.getState());
    }, 2600),
  ];
  render(game.getState());
}

function queuePopupFromResult(state) {
  const result = state.lastResult;
  if (!result || result.at === ui.seenResultAt) return;
  ui.seenResultAt = result.at;
  if (result.kind === "nightHold" && result.settlement) {
    ui.popup = { kind: "nightHold", settlement: result.settlement };
    return;
  }
  if (result.kind === "rewrite") {
    ui.popup = { kind: "rewrite", result };
    return;
  }
  if (result.kind === "stats" && result.statChanges?.length) {
    ui.popup = { kind: "stats", result };
  }
}

function renderHeader(state) {
  const fire = fireCopy(state.derived.fireLevel);
  const solo = state.charactersView.find((c) => c.audienceStatus?.key === "solo");
  const statusBits = [fire.label];
  if (solo) statusBits.push(`${solo.shortName}獨處中`);
  const paused = state.settlement.status === "paused";
  return `
    <header class="top">
      <p class="kicker">${state.season.english}</p>
      <div class="top-row">
        <div>
          <h1>${state.season.title}</h1>
          <p class="sub">七夕當夜 · ${paused ? "今晚已暫停保存" : state.settlement.label}</p>
        </div>
        <div class="top-actions">
          <p class="now-status" data-fire="${state.derived.fireLevel}">${statusBits.join(" · ")}</p>
          <button class="hold-btn" data-hold="1" ${state.settlement.status === "settled" ? "disabled" : ""}>先讓場面停在這裡</button>
        </div>
      </div>
    </header>`;
}

function renderEvent(state) {
  const event = state.currentEvent;
  const present = eventPresentation(event);
  const disableChoices =
    state.settlement.status === "paused" || (state.settlement.status === "settled" && !event?.final);
  const cast = eventCastLabel(event, state.charactersView);
  return `
    <section class="event-stage tone-${present.tone}" data-kind="${present.kind}">
      <div class="event-card">
        <div class="event-meta">
          <span class="cast-name">${audienceText(cast)}</span>
          ${present.label ? `<span class="type-badge type-${present.kind}">${present.label}</span>` : `<span class="type-badge type-quiet" aria-hidden="true"></span>`}
        </div>
        <p class="speaker">${audienceText(event?.speaker || "現場")}</p>
        <h2 class="event-title">${audienceText(event?.title || "等待事件")}</h2>
        <p class="desc">${audienceText(event?.description || "")}</p>
        <div class="choices">
          ${(event?.choices || [])
            .map(
              (choice) =>
                `<button class="choice" data-choice="${choice.id}" ${disableChoices ? "disabled" : ""}>${audienceText(choice.label)}</button>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

function renderCastCard(c, soloId) {
  const status = c.audienceStatus || { key: "calm", label: "平靜", hint: "" };
  const live = soloId === c.id;
  return `
    <article class="char-card status-${status.key} ${live ? "is-solo" : ""}" style="--accent:${c.accent}" data-char="${c.id}">
      <div class="portrait" aria-hidden="true">${c.icon}</div>
      <h3>${c.name}</h3>
      <p class="danger-line">危險度 <b>${c.danger}</b></p>
      <p class="aff-line">親密度 ${c.values.affection}</p>
      <p class="status-line">${status.label}</p>
      ${live || status.hint ? `<p class="status-hint">${live ? "🌙 與月月獨處中" : status.hint}</p>` : ""}
      <div class="danger-bar"><i style="width:${c.danger}%"></i></div>
    </article>`;
}

function renderMoonCard(state) {
  const open = ui.moonOpen ? "is-open" : "";
  const rows = state.charactersView
    .map((c) => `<li><span>${c.name}</span><b>${c.danger}</b></li>`)
    .join("");
  return `
    <article class="char-card moon-card fire-${state.derived.fireLevel} ${open}" data-moon="1">
      <div class="portrait" aria-hidden="true">🌙</div>
      <h3>可樂月月</h3>
      <p class="moon-kicker">修羅場中心</p>
      <p class="fire-line">🔥 失火指數 <b>${state.derived.fireIndex}</b></p>
      <p class="status-line">${fireCopy(state.derived.fireLevel).line}</p>
      <ul class="fire-break">${rows}</ul>
    </article>`;
}

function renderFateButtons(state) {
  const unlocked = state.interventionsUnlocked && state.settlement.status === "active";
  const solo = state.soloActive;
  const soloName = state.charactersView.find((c) => c.id === solo)?.name;
  return `
    <section class="fate-dock">
      <div class="fate-row">
        ${state.interventions
          .map((item) => {
            const copy = FATE_COPY[item.id] || {};
            const canBreak = item.id === "intervene" && solo;
            return `
              <button class="fate-btn fate-${item.cost} ${canBreak ? "has-solo" : ""}" data-iv="${item.id}" ${unlocked ? "" : "disabled"}>
                <span class="fate-cost">${item.cost}</span>
                <span class="fate-name">${copy.title || item.name}</span>
                <small>${copy.tag || item.blurb}</small>
                ${canBreak ? `<em>可破壞獨處</em>` : ""}
              </button>`;
          })
          .join("")}
      </div>
      ${
        !unlocked
          ? state.settlement.status === "settled"
            ? `<p class="lock">今晚暫時休戰。關係會帶到下一次活動。</p>`
            : state.settlement.status === "paused"
              ? `<p class="lock">今晚的命運已保存。場面停在這裡。</p>`
              : `<p class="lock">先看完開場。特殊命運會在認識五個人之後解鎖。</p>`
          : solo
            ? `<p class="lock">🌙 ${soloName} 正在與月月獨處。300 可以破壞這段。</p>`
            : `<p class="lock">特殊命運是主播主動干涉。沒有確認，不會執行。</p>`
      }
    </section>`;
}

function renderConfirm(state) {
  const action = fateAction(state, ui.actionId);
  return `
    <div class="modal" data-overlay="confirm">
      <div class="backdrop" data-cancel="1"></div>
      <div class="card confirm-card">
        <p class="kicker">${action.cost}｜${action.name}</p>
        <h3>${action.cost}｜${action.name}</h3>
        <p class="sub">${action.tag}</p>
        <p>你即將改變目前的局勢。</p>
        <p>確定要觸碰這條命運嗎？</p>
        <div class="modal-actions">
          <button class="choice" data-confirm="1">確定</button>
          <button class="ghost" data-cancel="1">取消</button>
        </div>
      </div>
    </div>`;
}

function renderTarget(state) {
  const action = fateAction(state, ui.actionId);
  return `
    <div class="modal" data-overlay="target">
      <div class="backdrop" data-cancel="1"></div>
      <div class="card">
        <p class="kicker">${action.cost}｜${action.name}</p>
        <h3>選擇對象</h3>
        <p class="sub">${action.tag}</p>
        <div class="target-grid">
          ${state.charactersView
            .map(
              (c) =>
                `<button class="target-btn ${c.audienceStatus?.key === "solo" ? "is-solo" : ""}" data-target="${c.id}">${c.icon}<br>${c.shortName}${c.audienceStatus?.key === "solo" ? "<small>獨處中</small>" : ""}</button>`
            )
            .join("")}
        </div>
        <button class="ghost" data-cancel="1">取消</button>
      </div>
    </div>`;
}

function renderDraw(state) {
  const action = fateAction(state, ui.actionId);
  const phase = ui.drawPhase;
  return `
    <div class="modal draw-modal" data-overlay="draw">
      <div class="backdrop"></div>
      <div class="card draw-card phase-${phase}">
        ${phase <= 1 ? `<p class="draw-wait">命運抽取中……</p>` : ""}
        ${phase >= 2 ? `<p class="draw-rank">✦ ${action.cost}｜${action.name} ✦</p>` : ""}
        ${phase >= 3 ? `<h3 class="draw-title">${ui.drawTitle || audienceText(state.currentEvent?.title || "")}</h3>` : ""}
        ${phase >= 3 ? `<button class="choice" data-draw-done="1">進入事件</button>` : ""}
      </div>
    </div>`;
}

function renderStatRows(groups) {
  return groups
    .map((row) => {
      const changes = row.changes
        .map(
          (change) => `
            <div class="stat-change">
              <span>${change.label}</span>
              <b>${change.from} → <i data-count-from="${change.from}" data-count-to="${change.to}">${change.from}</i></b>
            </div>`
        )
        .join("");
      return `
        <div class="result-person">
          <p class="result-name">${row.icon || ""} ${row.name || row.shortName}</p>
          ${changes}
        </div>`;
    })
    .join("");
}

function renderPopup() {
  const popup = ui.popup;
  if (!popup) return "";
  if (popup.kind === "nightHold") {
    const s = popup.settlement;
    const rows = (s.characters || [])
      .map(
        (c) => `
          <li>
            <span>${c.shortName}</span>
            <b>${c.from} → <i data-count-from="${c.from}" data-count-to="${c.to}">${c.from}</i></b>
          </li>`
      )
      .join("");
    return `
      <div class="modal result-modal" data-overlay="popup">
        <div class="backdrop" data-popup-done="1"></div>
        <div class="card result-card hold-card">
          <p class="kicker">今晚結算</p>
          <h3>🌙 今晚先到這裡</h3>
          <p class="hold-count">今晚事件：${s.eventCount} 張</p>
          <ul class="hold-chars">${rows}</ul>
          <p class="hold-fire">🔥 月月失火指數</p>
          <p class="hold-fire-num">
            ${s.fireFrom} → <b><i data-count-from="${s.fireFrom}" data-count-to="${s.fireTo}">${s.fireFrom}</i></b>
          </p>
          <p class="hold-saved">今晚的命運已保存。</p>
          <button class="choice" data-popup-done="1">繼續</button>
        </div>
      </div>`;
  }
  if (popup.kind === "rewrite") {
    const result = popup.result;
    const preferred = ["affection", "danger"];
    const groups = (result.statChanges || []).map((row) => ({
      ...row,
      changes: [
        ...row.changes.filter((change) => preferred.includes(change.key)),
        ...row.changes.filter((change) => !preferred.includes(change.key)).slice(0, 1),
      ],
    }));
    return `
      <div class="modal result-modal" data-overlay="popup">
        <div class="backdrop" data-popup-done="1"></div>
        <div class="card result-card rewrite-card">
          <p class="kicker">✦ 改寫命運 ✦</p>
          <h3>${result.icon || ""} ${result.name || groups[0]?.name || ""}</h3>
          ${renderStatRows(groups)}
          <p class="hold-saved">命運已重新洗牌。</p>
          <button class="choice" data-popup-done="1">繼續</button>
        </div>
      </div>`;
  }
  const result = popup.result;
  return `
    <div class="modal result-modal" data-overlay="popup">
      <div class="backdrop" data-popup-done="1"></div>
      <div class="card result-card">
        <p class="kicker">數值變化</p>
        ${renderStatRows(result.statChanges || [])}
        <button class="choice" data-popup-done="1">繼續</button>
      </div>
    </div>`;
}

function animateValue(el, from, to, ms = 900) {
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / ms);
    const eased = 1 - (1 - t) ** 3;
    el.textContent = String(Math.round(from + (to - from) * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function animatePopupNumbers() {
  const nodes = [...document.querySelectorAll("[data-count-from]")];
  if (!nodes.length || !ui.popup) return;
  if (ui.popup.animStarted) {
    for (const el of nodes) el.textContent = el.dataset.countTo;
    return;
  }
  ui.popup.animStarted = true;
  for (const el of nodes) {
    animateValue(el, Number(el.dataset.countFrom), Number(el.dataset.countTo));
  }
}

function render(state) {
  app.innerHTML = `
    <div class="live-shell fire-${state.derived.fireLevel}">
      ${renderHeader(state)}
      ${renderEvent(state)}
      <section class="cast-row" aria-label="角色狀態">
        ${state.charactersView.map((c) => renderCastCard(c, state.soloActive)).join("")}
        ${renderMoonCard(state)}
      </section>
      ${renderFateButtons(state)}
    </div>
  `;
  if (ui.step === "confirm") app.insertAdjacentHTML("beforeend", renderConfirm(state));
  if (ui.step === "target") app.insertAdjacentHTML("beforeend", renderTarget(state));
  if (ui.step === "draw") app.insertAdjacentHTML("beforeend", renderDraw(state));
  if (ui.popup) app.insertAdjacentHTML("beforeend", renderPopup());
  animatePopupNumbers();
}

function onState(state) {
  queuePopupFromResult(state);
  render(state);
}

app.addEventListener("click", (event) => {
  if (event.target.closest("[data-popup-done]")) {
    ui.popup = null;
    render(game.getState());
    return;
  }
  if (event.target.closest("[data-hold]")) {
    const result = game.holdTonight();
    if (result && result.ok === false) alert(result.error);
    return;
  }
  const choice = event.target.closest("[data-choice]");
  if (choice && !choice.disabled) {
    game.choose(choice.dataset.choice);
    return;
  }
  const iv = event.target.closest("[data-iv]");
  if (iv && !iv.disabled) {
    ui.step = "confirm";
    ui.actionId = iv.dataset.iv;
    render(game.getState());
    return;
  }
  if (event.target.closest("[data-cancel]")) {
    closeOverlay();
    render(game.getState());
    return;
  }
  if (event.target.closest("[data-confirm]")) {
    const action = fateAction(game.getState(), ui.actionId);
    if (!action.needsTarget) {
      const type = ui.actionId;
      closeOverlay();
      const result = game.intervene(type);
      if (!result.ok) {
        ui.step = "confirm";
        ui.actionId = type;
        render(game.getState());
        alert(result.error);
      }
      return;
    }
    ui.step = "target";
    render(game.getState());
    return;
  }
  const target = event.target.closest("[data-target]");
  if (target && ui.actionId && ui.step === "target") {
    const type = ui.actionId;
    ui.step = "draw";
    ui.drawPhase = 1;
    ui.drawTitle = "";
    const result = game.intervene(type, target.dataset.target);
    if (!result.ok) {
      ui.step = "confirm";
      ui.drawPhase = 0;
      render(game.getState());
      alert(result.error);
      return;
    }
    startDraw(fateAction(game.getState(), type));
    return;
  }
  if (event.target.closest("[data-draw-done]")) {
    closeOverlay();
    render(game.getState());
    return;
  }
  if (event.target.closest("[data-moon]")) {
    ui.moonOpen = !ui.moonOpen;
    render(game.getState());
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && ui.step !== "draw") {
    if (ui.popup) {
      ui.popup = null;
      render(game.getState());
      return;
    }
    closeOverlay();
    render(game.getState());
  }
});

game.subscribe(onState);
