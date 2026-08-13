import { STAT_LABELS } from "../../data/characters.js";
import { createGame } from "../engine/game.js";

const game = createGame();
const app = document.getElementById("app");

function render(state) {
  const events = game.allEvents();
  const card = state.settlement?.progressCard || state.archive?.[state.currentSeason]?.progressCard;
  app.innerHTML = `
    <div class="wrap">
      <header>
        <h1>教主控制台 · ${state.season.title}</h1>
        <p class="muted">
          階段：${state.settlement.phase}　狀態：${state.settlement.label}　
          目前：${state.currentEvent?.id || "-"}　火災 ${state.derived.fireIndex}
          ${state.soloActive ? `　獨處中：${state.soloActive}` : ""}
          ${state.flags.qixi_2026_night_partner ? `　今晚陪伴 flag：${state.flags.qixi_2026_night_partner}` : ""}
        </p>
      </header>

      <section class="box">
        <h2>直播操作</h2>
        <p>${state.currentEvent?.title || ""}</p>
        <p class="muted">${state.currentEvent?.description || ""}</p>
        <div class="actions">
          <button data-act="next">下一事件</button>
          <button data-act="skip">跳過事件</button>
          <button data-act="pause">暫停本次事件</button>
          <button data-act="resume">繼續本次事件</button>
          <button data-act="reset-session">重置本次 Session</button>
          <button class="danger" data-act="end">結束本次事件</button>
        </div>
        <div class="actions">
          <select id="event-select">
            ${events.map((e) => `<option value="${e.id}">${e.id} · ${e.title}</option>`).join("")}
          </select>
          <button data-act="trigger">手動觸發事件</button>
        </div>
      </section>

      <div class="row">
        <section class="box">
          <h2>主播干預（金流在遊戲外）</h2>
          <p class="muted">價格只是操作權限。主播確認收到對應金額後按下。遊戲內不扣款、沒有餘額。</p>
          <div class="actions">
            <select id="iv-target">
              ${state.charactersView.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
            </select>
          </div>
          <div class="actions iv-host">
            ${state.interventions
              .map(
                (i) =>
                  `<button data-iv="${i.id}" ${state.settlement.status === "active" ? "" : "disabled"}>${i.cost}｜${i.name}</button>`
              )
              .join("")}
          </div>
          <p class="muted">300 干涉命運：可挑起嫉妒；破壞獨處僅在有人正在獨處時有效。</p>
        </section>
        <section class="box">
          <h2>目前 Dynamic Event Pool</h2>
          <table>
            <tr><th>事件</th><th>基礎</th><th>有效權重</th></tr>
            ${
              state.pool?.length
                ? state.pool
                    .map(
                      (item) =>
                        `<tr><td>${item.id}<br><span class="muted">${item.title}</span></td><td>${item.weight}</td><td>${item.effectiveWeight}</td></tr>`
                    )
                    .join("")
                : "<tr><td colspan='3'>尚未解鎖，或目前沒有符合條件的事件</td></tr>"
            }
          </table>
        </section>
      </div>

      <section class="box">
        <h2>角色數值</h2>
        <p class="muted">Night Score 是今晚陪伴傾向，不是誰比較健康。親密度最高 ≠ 一定成為今晚陪伴者。核心是親密度 + unique primary；其餘官方心理數值仍可進 Night Score 與事件條件。</p>
        <table>
          <tr>
            <th>角色</th>
            <th>Night</th>
            ${[...new Set(state.charactersView.flatMap((c) => c.stats))]
              .map((key) => `<th>${STAT_LABELS[key] || key}</th>`)
              .join("")}
          </tr>
          ${state.charactersView
            .map((c) => {
              const keys = [...new Set(state.charactersView.flatMap((x) => x.stats))];
              return `<tr>
                <td>${c.icon}${c.shortName}</td>
                <td>${c.nightScore}</td>
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

      ${
        card
          ? `<section class="box card-box">
              <h2>${card.title}</h2>
              <p><b>${card.status}</b> · ${card.eventName}</p>
              <p class="muted">${card.chapter} · save ${card.saveId}</p>
              <p>今晚陪伴者：${card.nightPartner}</p>
              <p>尚未解決：${card.unresolved.join("、") || "無"}</p>
              <p>下一次可解鎖：${card.nextUnlockable.join("、") || "視條件"}</p>
            </section>`
          : ""
      }

      <div class="row">
        <section class="box">
          <h2>事件歷史</h2>
          <ul class="history">
            ${(state.eventHistory || state.history).map((h) => `<li>${new Date(h.t).toLocaleTimeString()} · ${h.text}</li>`).join("") || "<li>尚無紀錄</li>"}
          </ul>
        </section>
        <section class="box">
          <h2>目前存檔（含 archive）</h2>
          <pre>${escapeHtml(JSON.stringify({ flags: state.flags, currentSession: state.currentSession, archive: state.archive }, null, 2))}</pre>
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
  if (act) {
    if (act === "next") {
      const result = game.nextEvent();
      if (result && result.ok === false) alert(result.error);
    }
    if (act === "skip") game.skipEvent();
    if (act === "pause") game.pauseSession();
    if (act === "resume") game.resumeSession();
    if (act === "reset-session" && confirm("重置本次 Session？會保留 archive 與跨季 night partner flag。")) {
      game.resetSession();
    }
    if (act === "end") {
      if (
        confirm(
          "結束本次事件？\n將進入「今晚，月月決定和誰過夜？」\n這是今晚結算，不是故事結局。"
        )
      ) {
        const result = game.endSession();
        if (result && result.ok === false) alert(result.error);
      }
    }
    if (act === "trigger") {
      const id = document.getElementById("event-select").value;
      game.startEvent(id, { force: true });
    }
  }
  const iv = event.target.dataset.iv;
  if (iv) {
    const target = document.getElementById("iv-target")?.value;
    const result = game.intervene(iv, target, { force: true });
    if (result && result.ok === false) alert(result.error);
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
