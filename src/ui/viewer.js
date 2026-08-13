import { STAT_LABELS } from "../../data/characters.js";
import { createGame } from "../engine/game.js";

const game = createGame();
const app = document.getElementById("app");

const ui = {
  pendingIntervention: null,
  detailId: null,
};

function meter(label, value, extra = "") {
  return `<div class="meter ${extra}"><span>${label}</span><b>${value}</b></div>`;
}

function render(state) {
  const event = state.currentEvent;
  const result = state.lastResult;
  const latest = state.history[0]?.text || "七夕事件尚未被干預。";

  app.innerHTML = `
    <div class="top">
      <p class="kicker">${state.season.english}</p>
      <h1>${state.season.title}</h1>
      <p class="sub">${state.season.subtitle}</p>
      <div class="meters">
        ${meter("🔥 後宮火災指數", state.derived.fireIndex, "fire")}
        ${meter("❤️ 戀愛溫度", state.derived.loveTemp, "love")}
        ${meter(state.derived.shuraLabel, state.derived.shura)}
        ${meter("命運值", state.fate, "fate")}
      </div>
      <p class="logline">${latest}</p>
    </div>

    <div class="layout">
      <section class="panel">
        <p class="speaker">${event?.speaker || "現場"}</p>
        <h2 class="event-title">${event?.title || "等待事件"}</h2>
        <p class="desc">${event?.description || ""}</p>
        <div class="choices">
          ${(event?.choices || [])
            .map(
              (choice) =>
                `<button class="choice" data-choice="${choice.id}">${choice.label}</button>`
            )
            .join("")}
        </div>
        ${
          result
            ? `<div class="result"><b>事件結果</b><br>${result.logs.join("<br>") || result.title}</div>`
            : ""
        }
        <p class="trajectory">${state.trajectory.label}</p>
      </section>

      <aside class="panel chars">
        ${state.charactersView
          .map(
            (c) => `
          <article class="char" data-open="${c.id}" style="--accent:${c.accent}">
            <div class="icon">${c.icon}</div>
            <div>
              <h3>${c.name}</h3>
              <p class="phil">${c.philosophy}</p>
              <p class="status">${c.status} · ❤️ ${c.values.affection} · ${STAT_LABELS[c.uniquePrimary]} ${c.values[c.uniquePrimary]}</p>
              <div class="bar"><i style="width:${c.values.affection}%"></i></div>
            </div>
          </article>`
          )
          .join("")}
      </aside>
    </div>

    <section class="iv">
      <h2>🔮 七夕神使干預</h2>
      <div class="iv-row">
        ${state.interventions
          .map(
            (item) => `
          <button class="iv-btn" data-iv="${item.id}" ${state.interventionsUnlocked ? "" : "disabled"}>
            ${item.name}
            <small>${item.cost} 命運</small>
          </button>`
          )
          .join("")}
      </div>
      ${
        state.interventionsUnlocked
          ? `<p class="lock">干預會觸發事件，而不是只加減好感。</p>`
          : `<p class="lock">先看完開場、認識五個人。干預會在那之後解鎖。</p>`
      }
    </section>
  `;

  if (ui.pendingIntervention) renderTargetModal(state);
  if (ui.detailId) renderDetailModal(state);
}

function modalShell(inner) {
  const wrap = document.createElement("div");
  wrap.className = "modal";
  wrap.innerHTML = `<div class="backdrop" data-close="1"></div><div class="card">${inner}</div>`;
  wrap.addEventListener("click", (event) => {
    if (event.target.dataset.close) closeModals();
  });
  app.appendChild(wrap);
}

function renderTargetModal(state) {
  const action = state.interventions.find((item) => item.id === ui.pendingIntervention);
  modalShell(`
    <p class="kicker">${action?.name || ""}</p>
    <h3>選擇標角色</h3>
    <p class="sub">${action?.blurb || ""}（消耗 ${action?.cost} 命運）</p>
    <div class="target-grid">
      ${state.charactersView
        .map(
          (c) =>
            `<button class="target-btn" data-target="${c.id}">${c.icon}<br>${c.shortName}</button>`
        )
        .join("")}
    </div>
    <button class="ghost" data-close="1">取消</button>
  `);
}

function renderDetailModal(state) {
  const c = state.charactersView.find((item) => item.id === ui.detailId);
  if (!c) return;
  const stats = c.stats
    .map((key) => `<li>${STAT_LABELS[key]}：${c.values[key]}</li>`)
    .join("");
  modalShell(`
    <p class="kicker">${c.role}</p>
    <h3>${c.icon} ${c.name}</h3>
    <p class="phil">${c.philosophy}</p>
    <p style="margin:10px 0">${c.summary}</p>
    <ul class="lore">${c.lore.map((line) => `<li>${line}</li>`).join("")}</ul>
    <ul class="lore">${stats}</ul>
    <button class="ghost" data-close="1">關閉</button>
  `);
}

function closeModals() {
  ui.pendingIntervention = null;
  ui.detailId = null;
  render(game.getState());
}

app.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-choice]");
  if (choice) {
    game.choose(choice.dataset.choice);
    return;
  }
  const iv = event.target.closest("[data-iv]");
  if (iv) {
    ui.pendingIntervention = iv.dataset.iv;
    render(game.getState());
    return;
  }
  const target = event.target.closest("[data-target]");
  if (target && ui.pendingIntervention) {
    const type = ui.pendingIntervention;
    ui.pendingIntervention = null;
    const result = game.intervene(type, target.dataset.target);
    if (!result.ok) {
      ui.pendingIntervention = type;
      render(game.getState());
      alert(result.error);
    }
    return;
  }
  const open = event.target.closest("[data-open]");
  if (open) {
    ui.detailId = open.dataset.open;
    render(game.getState());
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModals();
});

game.subscribe(render);
