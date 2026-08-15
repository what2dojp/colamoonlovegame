import { CONFLICT_STAT_KEYS, statMeta } from "../../data/characters.js";
import { formatPairLabel } from "../../data/relationships.js";
import { createGame } from "../engine/game.js";
import { colaMoonText, FATE_COPY } from "./presentation.js";

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
          目前：${state.currentEvent?.id || "-"}　🔥 失火 ${state.derived.fireIndex}
          ${state.charactersView.map((c) => `${c.shortName}${c.danger}`).join(" ")}
          ${state.soloActive ? `　獨處中：${state.soloActive}` : ""}
          ${state.flags.qixi_2026_night_partner ? `　今晚陪伴 flag：${state.flags.qixi_2026_night_partner}` : ""}
        </p>
      </header>

      <section class="box">
        <h2>直播操作</h2>
        <p>${state.currentEvent?.title || ""}</p>
        <p class="muted">${colaMoonText(state.currentEvent?.description || "")}</p>
        <div class="actions">
          <button data-act="next">下一事件</button>
          <button data-act="skip">跳過事件</button>
          <button data-act="pause">暫停本次事件</button>
          <button data-act="resume">繼續本次事件</button>
          <button data-act="reset-session">重置本次 Session</button>
          <button data-act="new-game">清除本局／重新遊玩</button>
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
          <p class="muted">300 支開獨處：指定 A 把正在獨處的 B 支開，下一張抽 A 的事件。500 拉人：目前卡片角色是 A 時，指定 B 加入，下一張強制 A × B 修羅場。</p>
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
        <p class="muted">每個角色只顯示自己真正擁有的數值。核心進入 Night Score；輔助只給劇情使用。空白欄位代表「沒有這個屬性」的做法已經取消。</p>
        <div class="stat-cards">
          ${state.charactersView.map((c) => renderCharacterCard(c)).join("")}
        </div>
      </section>

      <section class="box">
        <h2>角色關係張力</h2>
        <p class="muted">這是兩人之間的關係資料，不是任何角色的個人 stat。</p>
        <table class="rel-table">
          <tr><th>關係</th><th>說明</th><th>張力</th></tr>
          ${Object.entries(state.relationships)
            .map(([key, rel]) => {
              const label = formatPairLabel(rel, Object.fromEntries(state.charactersView.map((c) => [c.id, c])));
              return `<tr>
                <td>${label || key}</td>
                <td class="muted">${rel.note || ""}</td>
                <td><input class="num" data-ten="${key}" type="number" min="0" max="100" value="${rel.tension}"></td>
              </tr>`;
            })
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

function renderStatRow(characterId, key, value, layer) {
  const meta = statMeta(key);
  const conflict = CONFLICT_STAT_KEYS.has(key) ? " is-conflict" : "";
  return `
    <label class="stat-row ${layer}${conflict}">
      <span>${meta.icon ? `${meta.icon} ` : ""}${meta.label}</span>
      <input class="num" data-stat="${characterId}.${key}" type="number" min="0" max="100" value="${value}">
    </label>`;
}

function renderCharacterCard(c) {
  const core = (c.coreStats || []).filter((key) => c.values[key] != null);
  const aux = (c.auxiliaryStats || []).filter((key) => c.values[key] != null);
  const moonRel =
    c.id === "mars"
      ? `<div class="stat-block">
          <p class="stat-kicker">關係</p>
          <label class="stat-row relationship">
            <span>可樂月月 ↔ ${c.name}<small>關係張力</small></span>
            <input class="num" data-ten="mars-moon" type="number" min="0" max="100" value="${c.moonTension ?? 0}">
          </label>
        </div>`
      : "";
  return `
    <article class="stat-card" style="--accent:${c.accent}">
      <h3>${c.icon} ${c.name}</h3>
      <p class="night-line">Night Score：<b>${c.nightScore}</b></p>
      <div class="stat-block">
        ${core.map((key) => renderStatRow(c.id, key, c.values[key], "core")).join("")}
      </div>
      ${moonRel}
      ${
        aux.length
          ? `<div class="stat-block aux">
              <p class="stat-kicker">輔助</p>
              ${aux.map((key) => renderStatRow(c.id, key, c.values[key], "aux")).join("")}
            </div>`
          : ""
      }
    </article>`;
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
    if (act === "new-game" && confirm("清除本局、開始全新的七夕遊戲？上一局進度不會保留。")) {
      game.newGame();
    }
    if (act === "end") {
      if (
        confirm(
          "結束本次事件？\n將進入「今晚，可樂月月決定和誰過夜？」\n這是今晚結算，不是故事結局。"
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
    const copy = FATE_COPY[iv];
    const label = copy ? `${copy.cost}｜${copy.title}` : iv;
    if (!confirm(`${label}\n\n你即將改變目前的局勢。\n確定要觸碰這條命運嗎？`)) return;
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
