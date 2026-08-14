import { createGame } from "../engine/game.js";
import { eventCastLabel, eventPresentation, FATE_COPY, fireCopy } from "./presentation.js";

const game = createGame();
const app = document.getElementById("app");

const ui = {
  step: null,
  actionId: null,
  drawPhase: 0,
  drawTitle: "",
  moonOpen: false,
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
      ui.drawTitle = game.getState().currentEvent?.title || "命運已落下";
      render(game.getState());
    }, 1500),
    setTimeout(() => {
      closeOverlay();
      render(game.getState());
    }, 2600),
  ];
  render(game.getState());
}

function renderHeader(state) {
  const fire = fireCopy(state.derived.fireLevel);
  const solo = state.charactersView.find((c) => c.audienceStatus?.key === "solo");
  const statusBits = [fire.label];
  if (solo) statusBits.push(`${solo.shortName}獨處中`);
  return `
    <header class="top">
      <p class="kicker">${state.season.english}</p>
      <div class="top-row">
        <div>
          <h1>${state.season.title}</h1>
          <p class="sub">七夕當夜 · ${state.settlement.label}</p>
        </div>
        <p class="now-status" data-fire="${state.derived.fireLevel}">${statusBits.join(" · ")}</p>
      </div>
    </header>`;
}

function renderEvent(state) {
  const event = state.currentEvent;
  const present = eventPresentation(event);
  const disableChoices =
    state.settlement.status === "paused" || (state.settlement.status === "settled" && !event?.final);
  const cast = eventCastLabel(event, state.charactersView);
  const result = state.lastResult;
  return `
    <section class="event-stage tone-${present.tone}" data-kind="${present.kind}">
      <div class="event-card">
        <div class="event-meta">
          <span class="cast-name">${cast}</span>
          ${present.label ? `<span class="type-badge type-${present.kind}">${present.label}</span>` : `<span class="type-badge type-quiet" aria-hidden="true"></span>`}
        </div>
        <p class="speaker">${event?.speaker || "現場"}</p>
        <h2 class="event-title">${event?.title || "等待事件"}</h2>
        <p class="desc">${event?.description || ""}</p>
        <div class="choices">
          ${(event?.choices || [])
            .map(
              (choice) =>
                `<button class="choice" data-choice="${choice.id}" ${disableChoices ? "disabled" : ""}>${choice.label}</button>`
            )
            .join("")}
        </div>
        ${
          result
            ? `<div class="result"><b>事件結果</b><br>${result.logs.join("<br>") || result.title}</div>`
            : ""
        }
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
        ${phase >= 3 ? `<h3 class="draw-title">${ui.drawTitle || state.currentEvent?.title || ""}</h3>` : ""}
        ${phase >= 3 ? `<button class="choice" data-draw-done="1">進入事件</button>` : ""}
      </div>
    </div>`;
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
}

app.addEventListener("click", (event) => {
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
    closeOverlay();
    render(game.getState());
  }
});

game.subscribe(render);
