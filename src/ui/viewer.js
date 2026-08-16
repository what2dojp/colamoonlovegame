import { createGame } from "../engine/game.js";
import { audienceText, eventCastLabel, eventPresentation, FATE_COPY, fireCopy, fireMoodLabel } from "./presentation.js";
import { characterPortraitLayout, characterPortraitSrc } from "./portraits.js";
import { statMeta } from "../../data/characters.js";

const game = createGame();
const app = document.getElementById("app");
const DEFAULT_INTERVAL = "✦ 目前看起來還算平靜，只是每個人的心思似乎都有所改變。";

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

function richText(value) {
  return audienceText(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function intervalCopy(state) {
  return richText(
    state.currentSession?.intervalCopy ||
      state.currentSession?.feedback?.intervalCopy ||
      state.lastResult?.intervalCopy ||
      DEFAULT_INTERVAL
  ).replace(/\n/g, "<br>");
}

function fateAction(state, id) {
  const item = state.interventions.find((entry) => entry.id === id);
  const copy = FATE_COPY[id] || {};
  const cost = item?.cost || copy.cost || 0;
  return {
    id,
    name: copy.title || item?.name || id,
    cost,
    icon: copy.icon || "",
    priceLabel: `${cost} 元`,
    tag: copy.kicker || copy.tag || item?.blurb || "",
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
      ui.drawTitle = "命運已落下";
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
  if (result.kind === "pending") return;
  ui.seenResultAt = result.at;
  ui.popup = { kind: result.kind || "stats", result, settlement: result.settlement };
}

function canHold(state) {
  return (
    state.lifecycle === "playing" &&
    state.currentSession?.phase !== "settling" &&
    state.currentSession?.phase !== "final" &&
    !state.currentEvent?.final
  );
}

function renderHeader(state) {
  const fire = fireCopy(state.derived.fireLevel, state.derived.fireIndex);
  const solo = state.charactersView.find((c) => c.audienceStatus?.key === "solo");
  const statusBits = [fire.mood || fire.label];
  if (solo) statusBits.push(`${solo.name}獨處中`);
  const finished = state.lifecycle === "finished";
  return `
    <header class="top">
      <p class="kicker">${state.season.english}</p>
      <div class="top-row">
        <div>
          <h1>${state.season.title}</h1>
          <p class="sub">七夕當夜 · ${finished ? "今晚已結算" : state.settlement.label}</p>
        </div>
        <div class="top-actions">
          <p class="now-status" data-fire="${state.derived.fireLevel}">${statusBits.join(" · ")}</p>
          <div class="header-btns">
            ${canHold(state) ? `<button class="hold-btn" data-hold="1">先讓場面停在這裡</button>` : ""}
            <button class="replay-btn" data-replay="1">重新遊玩</button>
          </div>
        </div>
      </div>
    </header>`;
}

function renderInterval(state, { hideCta = false, continueOnly = false } = {}) {
  const locked =
    state.lifecycle === "finished" ||
    state.settlement.status === "paused" ||
    state.currentSession?.phase === "settling" ||
    state.currentSession?.phase === "final";
  const cta = hideCta
    ? ""
    : continueOnly
      ? `<button class="choice" data-interval-done="1">抽出下一張</button>`
      : `<button class="choice" data-choice="watch" ${locked ? "disabled" : ""}>抽出下一張</button>`;
  return `
    <section class="event-stage tone-hub interval-stage" data-kind="interval">
      <div class="event-card interval-card">
        <p class="interval-kicker">間隔</p>
        <p class="interval-copy">${intervalCopy(state)}</p>
        <div class="choices">${cta}</div>
      </div>
    </section>`;
}

function renderFinal(state) {
  const event = state.currentEvent;
  const present = eventPresentation(event);
  const partner = state.charactersView.find((c) => c.id === state.currentSession?.nightPartner);
  return `
    <section class="event-stage tone-${present.tone}" data-kind="final">
      <div class="event-card">
        <div class="event-meta">
          <span class="cast-name">可樂月月</span>
          <span class="type-badge type-special">今晚結算</span>
        </div>
        <p class="speaker">可樂月月</p>
        <h2 class="event-title">${audienceText(event?.title || "今晚的選擇")}</h2>
        <p class="desc">${audienceText(event?.description || "")}</p>
        ${partner ? `<p class="final-partner">今晚陪伴者：<b>${partner.name}</b></p>` : ""}
        <div class="choices">
          <button class="choice" data-continue-drama="1">繼續這個戀愛八點檔</button>
          <button class="choice replay-choice" data-replay="1">重新遊玩</button>
        </div>
      </div>
    </section>`;
}

function renderEvent(state) {
  const event = state.currentEvent;
  const feedback = state.currentSession?.feedback || {};
  const hideStory = Boolean(ui.popup) || feedback.showOverlay;
  if (hideStory || event?.hub) {
    return renderInterval(state, { hideCta: Boolean(ui.popup) || Boolean(feedback.showOverlay) });
  }
  if (feedback.showInterval && !event?.final) {
    return renderInterval(state, { continueOnly: true });
  }
  if (event?.final) return renderFinal(state);

  const present = eventPresentation(event);
  const disableChoices =
    state.lifecycle === "finished" ||
    state.settlement.status === "paused" ||
    (state.currentSession?.phase === "settling" && !event?.final);
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
  const primary = (c.audienceStats || ["affection", c.uniquePrimary])
    .filter((key) => c.values?.[key] != null)
    .map((key) => {
      const meta = statMeta(key);
      return `<p class="aff-line">${meta.icon} ${meta.audienceLabel} ${c.values[key]}</p>`;
    })
    .join("");
  const portrait = characterPortraitSrc(c.id);
  const layout = characterPortraitLayout(c.id);
  return `
    <article class="char-card status-${status.key} ${live ? "is-solo" : ""}" style="--accent:${c.accent}" data-char="${c.id}">
      <div class="character-portrait" aria-hidden="true">
        ${portrait ? `<img class="is-${layout}" src="${portrait}" alt="" onerror="this.style.display='none'">` : ""}
      </div>
      <div class="character-info">
        <div class="portrait" aria-hidden="true">${c.icon}</div>
        <h3>${c.name}</h3>
        <p class="danger-line">危險度 <b>${c.danger}</b></p>
        ${primary}
        <p class="status-line">${status.label}</p>
        ${live || status.hint ? `<p class="status-hint">${live ? "🌙 與可樂月月獨處中" : status.hint}</p>` : ""}
        <div class="danger-bar"><i style="width:${c.danger}%"></i></div>
      </div>
    </article>`;
}

function renderMoonCard(state) {
  const open = ui.moonOpen ? "is-open" : "";
  const rows = state.charactersView
    .map((c) => `<li><span>${c.name}</span><b>${c.danger}</b></li>`)
    .join("");
  const fire = fireCopy(state.derived.fireLevel, state.derived.fireIndex);
  return `
    <article class="char-card moon-card fire-${state.derived.fireLevel} ${open}" data-moon="1">
      <div class="portrait" aria-hidden="true">🌙</div>
      <h3>可樂月月</h3>
      <p class="moon-kicker">修羅場中心</p>
      <p class="fire-line">🔥 失火指數 <b>${state.derived.fireIndex}</b></p>
      <p class="status-line">${fire.mood || fire.line}</p>
      <ul class="fire-break">${rows}</ul>
    </article>`;
}

function renderFateButtons(state) {
  const unlocked =
    state.interventionsUnlocked &&
    state.lifecycle === "playing" &&
    state.settlement.status === "active" &&
    state.currentSession?.phase !== "settling" &&
    state.currentSession?.phase !== "final" &&
    !state.currentEvent?.final;
  const solo = state.soloActive;
  const soloName = state.charactersView.find((c) => c.id === solo)?.name;
  const leadId = state.eventLeadId;
  const leadName = state.charactersView.find((c) => c.id === leadId)?.name;
  return `
    <section class="fate-dock">
      <p class="fate-kicker">💰／🌙／💥／🔥／🔮 特殊命運</p>
      <div class="fate-grid">
        ${state.interventions
          .map((item) => {
            const copy = FATE_COPY[item.id] || {};
            const canBreak = item.id === "intervene" && solo;
            const canJoin = item.id === "force" && leadId;
            const extra = item.id === "peek" ? copy.kicker : "";
            return `
              <button class="fate-btn fate-${item.cost} ${canBreak || canJoin ? "has-solo" : ""}" data-iv="${item.id}" ${unlocked ? "" : "disabled"}>
                <span class="fate-cost">${copy.icon || ""} ${item.cost} 元</span>
                <span class="fate-name">${copy.title || item.name}</span>
                ${extra ? `<small>${extra}</small>` : ""}
                ${canBreak ? `<em>可支開獨處</em>` : ""}
                ${canJoin ? `<em>可拉人進來</em>` : ""}
              </button>`;
          })
          .join("")}
      </div>
      ${
        !unlocked
          ? state.lifecycle === "finished" || state.settlement.status === "settled"
            ? `<p class="lock">今晚已結算。可以繼續這個戀愛八點檔，或重新遊玩。</p>`
            : state.currentSession?.phase === "settling" || state.currentSession?.phase === "final"
              ? `<p class="lock">今晚正在結算。特殊命運已停止。</p>`
              : state.settlement.status === "paused"
                ? `<p class="lock">今晚的命運已保存。場面停在這裡。</p>`
                : `<p class="lock">先看完開場。特殊命運會在認識五個人之後解鎖。</p>`
          : solo
            ? `<p class="lock">🌙 ${soloName} 正在與可樂月月獨處。300 可以支開她，500 可以把另一個人拉進來。</p>`
            : leadName
              ? `<p class="lock">目前是${leadName}的事件。500 可以把另一個人拉進這段時間。</p>`
              : `<p class="lock">特殊命運是主播主動干涉。沒有確認，不會執行。</p>`
      }
    </section>`;
}

function renderConfirm(state) {
  const action = fateAction(state, ui.actionId);
  const solo = state.soloActive;
  const soloName = state.charactersView.find((c) => c.id === solo)?.name;
  const leadName = state.charactersView.find((c) => c.id === state.eventLeadId)?.name;
  const body =
    action.id === "intervene"
      ? soloName
        ? `指定一個人出手，把正在與可樂月月獨處的${soloName}支開。`
        : "目前沒有正在發生的獨處，無法支開。"
      : action.id === "force"
        ? leadName
          ? `指定一個人加入${leadName}與可樂月月正在發生的這段時間，直接把局面變成修羅場。`
          : "目前這張不是角色事件，無法把人拉進來。"
        : "你即將改變目前的局勢。";
  return `
    <div class="modal" data-overlay="confirm">
      <div class="backdrop" data-cancel="1"></div>
      <div class="card confirm-card">
        <p class="kicker">${action.icon} ${action.priceLabel}｜${action.name}</p>
        <h3>${action.icon} ${action.priceLabel}｜${action.name}</h3>
        <p class="sub">${action.tag}</p>
        <p>${body}</p>
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
  const solo = state.soloActive;
  const pickingJoin = action.id === "force";
  const pickingInterrupt = action.id === "intervene";
  const blockedId = pickingJoin ? state.eventLeadId : pickingInterrupt ? solo : null;
  const heading =
    pickingJoin
      ? "誰要加入？"
      : pickingInterrupt
        ? "誰把可樂月月支開？"
        : action.id === "rewrite"
          ? "改寫誰的命運？"
          : action.id === "encounter"
            ? "與誰製造獨處？"
            : action.id === "peek"
              ? "深挖誰？"
              : "選擇對象";
  return `
    <div class="modal" data-overlay="target">
      <div class="backdrop" data-cancel="1"></div>
      <div class="card">
        <p class="kicker">${action.icon} ${action.priceLabel}｜${action.name}</p>
        <h3>${heading}</h3>
        <p class="sub">${action.tag}</p>
        <div class="target-grid">
          ${state.charactersView
            .map((c) => {
              const isLead = c.id === blockedId;
              const blocked = Boolean(blockedId) && isLead;
              const portrait = characterPortraitSrc(c.id);
              return `<button class="target-btn ${c.id === solo ? "is-solo" : ""}" data-target="${c.id}" ${blocked ? "disabled" : ""}>
                ${portrait ? `<span class="target-portrait" aria-hidden="true"><img class="is-${characterPortraitLayout(c.id)}" src="${portrait}" alt=""></span>` : ""}
                ${c.icon}<br>${c.name}${isLead ? "<small>目前在場</small>" : c.id === solo ? "<small>獨處中</small>" : ""}
              </button>`;
            })
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
        ${phase >= 2 ? `<p class="draw-rank">✦ ${action.icon} ${action.priceLabel}｜${action.name} ✦</p>` : ""}
        ${phase >= 3 ? `<h3 class="draw-title">${ui.drawTitle || "命運已落下"}</h3>` : ""}
        ${phase >= 3 ? `<button class="choice" data-draw-done="1">進入結果</button>` : ""}
      </div>
    </div>`;
}

function formatStatDelta(from, to) {
  const start = Number(from) || 0;
  const end = Number(to) || 0;
  const delta = end - start;
  const arrow =
    delta > 0
      ? `<span class="delta-up">↑${delta}</span>`
      : delta < 0
        ? `<span class="delta-down">↓${Math.abs(delta)}</span>`
        : "";
  return `${start} → <i data-count-from="${start}" data-count-to="${end}">${start}</i>${arrow ? ` ${arrow}` : ""}`;
}

function formatRankDelta(from, to) {
  const start = Number(from);
  const end = Number(to);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return "";
  const climbed = start - end;
  const arrow =
    climbed > 0
      ? `<span class="delta-up">↑${climbed}</span>`
      : climbed < 0
        ? `<span class="delta-down">↓${Math.abs(climbed)}</span>`
        : "";
  return `${start} → <i>${end}</i>${arrow ? ` ${arrow}` : ""}`;
}

function renderStatRows(groups) {
  return (groups || [])
    .map((row) => {
      const changes = (row.changes || [])
        .map(
          (change) => `
            <div class="stat-change">
              <span>${change.icon || ""} ${audienceText(change.label)}</span>
              <b>${formatStatDelta(change.from, change.to)}</b>
            </div>`
        )
        .join("");
      return `
        <div class="result-person">
          <p class="result-name">${row.icon || ""} ${audienceText(row.name || row.shortName)}</p>
          ${changes || `<p class="result-empty">沒有明顯的數值變動</p>`}
        </div>`;
    })
    .join("");
}

function renderStatusNotes(notes) {
  if (!notes?.length) return "";
  return `<ul class="status-notes">${notes
    .map((note) => `<li>${richText(note.text || note)}</li>`)
    .join("")}</ul>`;
}

function popupShell(inner, extraClass = "") {
  return `
    <div class="modal result-modal" data-overlay="popup">
      <div class="backdrop" data-popup-done="1"></div>
      <div class="card result-card ${extraClass}">
        ${inner}
      </div>
    </div>`;
}

function renderHoldPopup(settlement) {
  const s = settlement || {};
  const rows = (s.characters || [])
    .map(
      (c) => `
        <article class="hold-person">
          <h4>${c.icon || ""} ${audienceText(c.name || c.fullName || c.shortName)}</h4>
          <p class="hold-person-status">${audienceText(c.statusLabel || "平靜")}</p>
          <p class="hold-person-num">${formatStatDelta(c.from, c.to)}</p>
        </article>`
    )
    .join("");
  return popupShell(
    `
      <p class="kicker">今晚結算</p>
      <h3>🌙 今晚先到這裡</h3>
      <p class="hold-count">今晚事件：${s.eventCount || 0} 張</p>
      <div class="hold-grid">${rows}</div>
      <p class="hold-fire">🔥 可樂月月失火指數</p>
      <p class="hold-fire-num">
        ${formatStatDelta(s.fireFrom, s.fireTo)}
      </p>
      <p class="hold-fire-mood">${fireMoodLabel(s.fireTo)}</p>
      <p class="hold-saved">今晚的命運已保存。</p>
      <button class="choice" data-hold-confirm="1">確認今晚結算</button>
    `,
    "hold-card"
  );
}

function renderPopup() {
  const popup = ui.popup;
  if (!popup) return "";
  if (popup.kind === "nightHold") return renderHoldPopup(popup.settlement || popup.result?.settlement);

  const result = popup.result || {};
  const name = audienceText(result.name || result.statChanges?.[0]?.name || "");
  const notes = renderStatusNotes(result.statusNotes);
  const stats = renderStatRows(result.statChanges || []);

  if (popup.kind === "companion") {
    return popupShell(
      `
        <p class="kicker">🌙 今晚的選擇</p>
        <p class="companion-lead">可樂月月今晚決定和……</p>
        <h3 class="companion-name">${result.icon || ""} ${name}</h3>
        <p class="companion-line">一起度過七夕夜！</p>
        <p class="companion-congrats">🎉 恭喜${name}！</p>
        <button class="choice" data-popup-done="1">看最終結果</button>
      `,
      "companion-card fate-strong"
    );
  }

  if (popup.kind === "rewrite") {
    const danger = Boolean(result.rewriteDanger);
    const rank = result.rewriteRank || {};
    const dangerRank = result.rewriteDangerRank || {};
    const rankHtml =
      Number.isFinite(Number(rank.from)) && Number.isFinite(Number(rank.to))
        ? `<p class="rewrite-rank">❤️ 親密排名 <b>${formatRankDelta(rank.from, rank.to)}</b></p>`
        : "";
    const dangerRankHtml =
      Number.isFinite(Number(dangerRank.from)) && Number.isFinite(Number(dangerRank.to))
        ? `<p class="rewrite-rank rewrite-danger-rank">⚠️ 危險排名 <b>${formatRankDelta(dangerRank.from, dangerRank.to)}</b></p>`
        : "";
    return popupShell(
      `
        <p class="kicker">🔮 改寫命運</p>
        ${danger ? `<p class="rewrite-danger-banner">🔥 危險命運觸發！</p>` : ""}
        <p class="fate-cost-tag">1000 元</p>
        <h3>${result.icon || ""} ${name}</h3>
        ${rankHtml}
        ${dangerRankHtml}
        ${stats}
        <p class="hold-saved">${richText(result.intervalCopy || `${name} 的狀態已經完全不同了。`)}</p>
        <button class="choice" data-popup-done="1">接受改寫</button>
      `,
      danger ? "rewrite-card fate-strong rewrite-danger-card" : "rewrite-card fate-strong"
    );
  }

  if (popup.kind === "force") {
    const joinName = audienceText(result.joiningName || name);
    const joinShort = audienceText(result.shortName || joinName);
    const hostName = audienceText(result.originalSoloName || result.originalCharacterName || "");
    const hostShort = audienceText(result.originalSoloShortName || hostName);
    const hostIcon = result.originalSoloIcon || "";
    const joinIcon = result.icon || "";
    return popupShell(
      `
        <p class="kicker">✦ 局勢突然改變</p>
        <p class="fate-cost-tag">500 元</p>
        <h3 class="force-join">🔥 ${joinIcon} ${joinShort}決定加入戰局！</h3>
        <p class="force-line">${hostShort ? `原本獨處：${hostIcon} ${hostShort}` : ""}</p>
        <p class="force-line">${hostShort ? `${hostIcon} ${hostShort}的獨處時光被打斷` : ""}</p>
        <p class="force-line">${joinIcon} ${joinShort}危險度 ↑</p>
        ${stats}
        ${notes}
        <button class="choice" data-popup-done="1">進入修羅場</button>
      `,
      "force-card fate-strong fate-500"
    );
  }

  if (popup.kind === "encounter") {
    return popupShell(
      `
        <p class="kicker">🌙 獨處成立</p>
        <p class="fate-cost-tag">200 元</p>
        <h3>${name} × 可樂月月</h3>
        <p class="encounter-line">其他人暫時被留在場外。</p>
        <p class="encounter-line">今晚的兩人時間開始了。</p>
        ${stats}
        ${notes}
        <button class="choice" data-popup-done="1">進入兩人時間</button>
      `,
      "encounter-card fate-strong"
    );
  }

  if (popup.kind === "sabotage" || popup.kind === "intervene") {
    const actor = audienceText(result.interruptingName || name);
    const broken = audienceText(result.originalSoloName || "");
    const quote = audienceText(result.interruptLine || "");
    return popupShell(
      `
        <p class="kicker">✦ 特殊命運介入</p>
        <p class="fate-cost-tag">300 元</p>
        <h3 class="interrupt-lead">${actor}出手了</h3>
        ${quote ? `<p class="interrupt-quote">「${quote}」</p>` : ""}
        <p class="force-line">${broken ? audienceText(`${broken}與可樂月月的獨處被打斷。`) : ""}</p>
        ${notes}
        ${stats}
        <button class="choice" data-popup-done="1">繼續</button>
      `,
      "intervene-card fate-strong fate-300"
    );
  }

  if (popup.kind === "peek") {
    const kind = audienceText(result.revealKind || "特殊命運");
    const accept =
      kind === "回憶" ? "收下這段回憶" : kind === "情書" ? "收下這封信" : "收下這段秘密";
    return popupShell(
      `
        <p class="kicker">✦ 特殊命運</p>
        <p class="fate-cost-tag">100 元</p>
        <p class="peek-kind">【${kind}】</p>
        <h3>${name}</h3>
        <p class="peek-title">${audienceText(result.revealTitle || "")}</p>
        <p class="peek-body">${audienceText(result.revealBody || result.logs?.join("\n") || "這段記憶被重新看見了。")}</p>
        <p class="hold-saved">這段記憶被重新看見了。</p>
        ${notes}
        ${stats}
        <button class="choice" data-popup-done="1">${accept}</button>
      `,
      "peek-card fate-strong"
    );
  }

  return popupShell(
    `
      <p class="kicker">✦ 狀態變化</p>
      ${result.resultCopy ? `<p class="result-lead">${richText(result.resultCopy)}</p>` : ""}
      ${stats || `<p class="result-empty">這次選擇沒有立刻改變數值，但現場的空氣已經不一樣了。</p>`}
      ${notes}
      <button class="choice" data-popup-done="1">繼續</button>
    `,
    "stats-card"
  );
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
      <section class="cast-row" aria-label="角色狀態">
        ${state.charactersView.map((c) => renderCastCard(c, state.soloActive)).join("")}
        ${renderMoonCard(state)}
      </section>
      <div class="play-row">
        ${renderEvent(state)}
        ${renderFateButtons(state)}
      </div>
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

function replayGame() {
  if (!confirm("確定要清除本局、開始全新的七夕遊戲？上一局進度不會保留。")) return;
  closeOverlay();
  ui.popup = null;
  ui.seenResultAt = 0;
  game.newGame();
}

app.addEventListener("click", (event) => {
  if (event.target.closest("[data-replay]")) {
    replayGame();
    return;
  }
  if (event.target.closest("[data-continue-drama]")) {
    closeOverlay();
    ui.popup = null;
    ui.seenResultAt = 0;
    const result = game.continueDrama();
    if (result && result.ok === false) alert(result.error);
    return;
  }
  if (event.target.closest("[data-hold-confirm]")) {
    ui.popup = null;
    game.confirmTonightHold();
    return;
  }
  if (event.target.closest("[data-popup-done]")) {
    ui.popup = null;
    game.dismissResult();
    return;
  }
  if (event.target.closest("[data-interval-done]")) {
    game.dismissInterval();
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
    if (type === "force" || type === "intervene") {
      closeOverlay();
      render(game.getState());
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
      game.dismissResult();
      return;
    }
    closeOverlay();
    render(game.getState());
  }
});

const params = new URLSearchParams(location.search);
if (params.get("replay") === "1") {
  game.newGame();
  history.replaceState({}, "", location.pathname);
} else if (params.get("continue") === "1") {
  game.continueDrama();
  history.replaceState({}, "", location.pathname);
} else if (game.getState().settlement.status === "paused") {
  game.resumeSession();
}

game.subscribe(onState);
