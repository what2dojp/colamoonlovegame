import { STAT_LABELS } from "../../data/characters.js";
import { createGame } from "../engine/game.js";

const game = createGame();
const app = document.getElementById("app");

function render(state) {
  const events = game.allEvents();
  app.innerHTML = `
    <div class="wrap">
      <header>
        <h1>教主控制台 · ${state.season.title}</h1>
        <p class="muted">目前事件：${state.currentEvent?.id || "-"}　命運值：${state.fate}　火災 ${state.derived.fireIndex}　${state.trajectory.label}</p>
      </header>

      <div class="row">
        <section class="box">
          <h2>事件操作</h2>
          <p>${state.currentEvent?.title || ""}</p>
          <p class="muted">${state.currentEvent?.description || ""}</p>
          <div class="actions">
            <select id="event-select">
              ${events.map((e) => `<option value="${e.id}">${e.id} · ${e.title}</option>`).join("")}
            </select>
            <button data-act="trigger">觸發</button>
            <button data-act="skip">跳過目前事件</button>
            <button data-act="reset">重置本季</button>
          </div>
        </section>

        <section class="box">
          <h2>命運值 / 模擬斗內</h2>
          <div class="actions">
            <input id="fate-delta" class="num" type="number" value="50">
            <button data-act="fate-add">加命運</button>
            <button data-act="fate-sub">減命運</button>
          </div>
          <div class="actions">
            <input id="don-amount" class="num" type="number" value="100">
            <input id="don-msg" placeholder="訊息" value="七夕加油">
            <button data-act="donate">模擬斗內</button>
          </div>
          <div class="actions">
            <select id="iv-select">
              ${state.interventions.map((i) => `<option value="${i.id}">${i.name} (${i.cost})</option>`).join("")}
            </select>
            <select id="iv-target">
              ${state.charactersView.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
            </select>
            <button data-act="test-iv">測試干預</button>
          </div>
        </section>
      </div>

      <section class="box">
        <h2>角色數值</h2>
        <table>
          <tr>
            <th>角色</th>
            ${[...new Set(state.charactersView.flatMap((c) => c.stats))]
              .map((key) => `<th>${STAT_LABELS[key] || key}</th>`)
              .join("")}
          </tr>
          ${state.charactersView
            .map((c) => {
              const keys = [...new Set(state.charactersView.flatMap((x) => x.stats))];
              return `<tr>
                <td>${c.icon}${c.shortName}</td>
                ${keys
                  .map((key) => {
                    const val = c.values[key];
                    if (val == null) return "<td></td>";
                    return `<td><input class="num" data-stat="${c.id}.${key}" type="number" min="0" max="100" value="${val}"></td>`;
                  })
                  .join("")}
              </tr>`;
            })
            .join("")}
        </table>
      </section>

      <section class="box">
        <h2>關係張力</h2>
        <table>
          ${Object.entries(state.relationships)
            .map(
              ([key, rel]) =>
                `<tr><td>${key}</td><td>${rel.note || ""}</td><td><input class="num" data-ten="${key}" type="number" min="0" max="100" value="${rel.tension}"></td></tr>`
            )
            .join("")}
        </table>
      </section>

      <div class="row">
        <section class="box">
          <h2>事件歷史</h2>
          <ul class="history">
            ${state.history.map((h) => `<li>${new Date(h.t).toLocaleTimeString()} · ${h.text}</li>`).join("") || "<li>尚無紀錄</li>"}
          </ul>
        </section>
        <section class="box">
          <h2>目前存檔</h2>
          <pre>${escapeHtml(JSON.stringify(state, null, 2))}</pre>
        </section>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

app.addEventListener("click", (event) => {
  const act = event.target.dataset.act;
  if (!act) return;
  if (act === "trigger") {
    const id = document.getElementById("event-select").value;
    game.startEvent(id, { force: true });
  }
  if (act === "skip") game.skipEvent();
  if (act === "reset" && confirm("重置本季存檔？")) game.resetSeason();
  if (act === "fate-add") game.addFate(Number(document.getElementById("fate-delta").value || 0));
  if (act === "fate-sub") game.addFate(-Number(document.getElementById("fate-delta").value || 0));
  if (act === "donate") {
    game.simulateDonation({
      amount: Number(document.getElementById("don-amount").value || 0),
      message: document.getElementById("don-msg").value,
      from: "mock",
    });
  }
  if (act === "test-iv") {
    const result = game.intervene(
      document.getElementById("iv-select").value,
      document.getElementById("iv-target").value,
      { force: true }
    );
    if (!result.ok) alert(result.error);
  }
});

app.addEventListener("change", (event) => {
  const stat = event.target.dataset.stat;
  if (stat) {
    const [id, key] = stat.split(".");
    game.setStat(id, key, event.target.value);
  }
  const ten = event.target.dataset.ten;
  if (ten) game.setTension(ten, event.target.value);
});

game.subscribe(render);
