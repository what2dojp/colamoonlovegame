import { GAME_CONFIG } from "../config/game.config.js";
import { CHARACTER_BY_ID } from "../../data/characters.js";
import { SEASONS } from "../../data/seasons/index.js";
import { EVENTS } from "../../data/seasons/qixi-2026/events.js";
import { extraChoiceEffects } from "../../data/seasons/qixi-2026/choice-extras.js";
import { INTERVENTIONS, activeSoloId, pickInterruptLine, SOLO_FLAG_IDS, soloFlag } from "../../data/seasons/qixi-2026/interventions.js";
import { SEASON } from "../../data/seasons/qixi-2026/season.js";
import { createMockDonationProvider, fateFromDonation } from "./donation.js";
import {
  applyEffects,
  completeEvent,
  eventContext,
  getEvent,
  interpolateEvent,
} from "./event-engine.js";
import { audienceStatus, characterDanger, characterStatus, clampStat, computeDerived } from "./derived.js";
import { clearGameSave, cloneState, createInitialState, inspectSave, lifecycleStatus, loadSave, migrateSave, writeSave } from "./save.js";
import {
  buildTonightSettlement,
  captureStatSnapshot,
  captureTonightSnapshot,
  diffStatSnapshots,
  diffStatusNotes,
  playerSafeLogs,
} from "./stat-delta.js";
import {
  buildIntervalCopy,
  classifyResultKind,
  overlayTitleForKind,
  peekRevealKind,
  rewriteLines,
} from "./narration.js";
import {
  buildProgressCard,
  createSession,
  drawPoolEvent,
  ensureSession,
  hasOccurred,
  listPoolCandidates,
  markOccurred,
  nightPartnerFlag,
  nightScore,
  pickNightPartner,
  pickPoolEventForCharacter,
  pickShuraForPair,
  setEventRecord,
  settlementView,
  trackCharacterTouch,
} from "./session.js";

function nowStamp() {
  return Date.now();
}

function pushHistory(state, entry) {
  const item = { t: nowStamp(), ...entry };
  state.history.unshift(item);
  state.history = state.history.slice(0, 80);
  state.eventHistory = state.history;
}

export function createGame({ persist = true, donationProvider, rng = Math.random } = {}) {
  let state = persist ? loadSave() || createInitialState() : createInitialState();
  ensureSession(state);
  const listeners = new Set();
  const donations = donationProvider || createMockDonationProvider();

  donations.onDonation((payload) => {
    applyDonation(payload);
  });

  function persistState() {
    if (persist) writeSave(state);
    listeners.forEach((fn) => fn(getPublicState()));
  }

  function snapshotResult(title, logs, extra = {}) {
    state.lastResult = {
      title,
      logs: playerSafeLogs(logs),
      at: nowStamp(),
      ...extra,
    };
  }

  function setFeedback({ showOverlay = false, showInterval = false, intervalCopy = "" } = {}) {
    if (!state.currentSession) ensureSession(state);
    if (intervalCopy) state.currentSession.intervalCopy = intervalCopy;
    state.currentSession.feedback = {
      showOverlay: Boolean(showOverlay),
      showInterval: Boolean(showInterval),
      intervalCopy: intervalCopy || state.currentSession.intervalCopy || "",
    };
  }

  function attachChoiceResult({ event, logs, before, kind }) {
    const after = captureStatSnapshot(state);
    const statChanges = diffStatSnapshots(before, after);
    let statusNotes = diffStatusNotes(before, after);
    const resultKind = kind || classifyResultKind(event);
    const target = CHARACTER_BY_ID[state.pendingTargetId] || CHARACTER_BY_ID[event?.characters?.[0]];
    const nextEvent = getEvent(state.currentEventId);
    if (resultKind === "force" && nextEvent) {
      const tags = nextEvent.tags || [];
      if (tags.includes("shura")) {
        statusNotes = [...statusNotes, { kind: "shura", text: "現場被重新打亂。修羅場的空氣壓了上來。" }];
      } else if (!nextEvent.hub && !nextEvent.final) {
        statusNotes = [...statusNotes, { kind: "crisis", text: "⚠️ 危機局勢被重新打亂" }];
      }
    }
    if (resultKind === "sabotage" && target) {
      statusNotes = [
        { kind: "solo-off", text: `🌙 ${target.name} 的獨處狀態 → 解除` },
        { kind: "broken", text: "原本的兩人時間被打斷了。現場重新恢復多人狀態。" },
        ...statusNotes.filter((note) => note.kind !== "solo-off" && note.kind !== "broken"),
      ];
    }
    const intervalCopy = buildIntervalCopy({
      kind: resultKind,
      statChanges,
      statusNotes,
      characterId: target?.id,
      name: target?.name,
    });
    const extra = {
      kind: resultKind,
      overlayTitle: overlayTitleForKind(resultKind),
      statChanges,
      statusNotes,
      intervalCopy,
      characterId: target?.id || null,
      name: target?.name || null,
      shortName: target?.shortName || null,
      icon: target?.icon || null,
    };
    if (resultKind === "peek") {
      if (nextEvent && !nextEvent.hub && !nextEvent.final && nextEvent.id !== event?.id) {
        extra.revealKind = peekRevealKind(nextEvent);
        extra.revealTitle = nextEvent.title;
        extra.revealBody = nextEvent.description;
        extra.revealSpeaker = nextEvent.speaker;
      } else if (logs?.length) {
        extra.revealKind = peekRevealKind(event);
        extra.revealTitle = event?.title || "特殊命運";
        extra.revealBody = playerSafeLogs(logs).join("\n");
      }
      extra.fateCost = 100;
    }
    if (resultKind === "encounter") {
      extra.fateCost = 200;
    }
    if (resultKind === "intervene" || resultKind === "sabotage") {
      extra.fateCost = 300;
    }
    if (resultKind === "force") {
      extra.fateCost = 500;
      if (target) {
        extra.dangerFrom = before.dangers?.[target.id] ?? 0;
        extra.dangerTo = after.dangers?.[target.id] ?? 0;
      }
    }
    snapshotResult(overlayTitleForKind(resultKind), logs, extra);
    setFeedback({
      showOverlay: true,
      showInterval: !nextEvent?.hub && !nextEvent?.final,
      intervalCopy,
    });
  }

  function clearSoloFlags() {
    for (const id of SOLO_FLAG_IDS) {
      if (state.flags[soloFlag(id)]) state.flags[soloFlag(id)] = false;
    }
  }

  function unlockDynamicPhase() {
    state.flags[SEASON.unlockInterventionsFlag] = true;
    state.flags.audience_aware = true;
    state.flags.dynamic_pool_unlocked = true;
    state.currentSession.phase = "dynamic";
  }

  function startEvent(eventId, { force = false } = {}) {
    if (eventId === "IV_sabotage") {
      const solo = activeSoloId(state);
      if (!solo) {
        snapshotResult("干涉命運", ["目前沒有正在發生的獨處，無法支開。"]);
        startEvent(SEASON.hubEventId);
        return { ok: false, error: "目前沒有正在發生的獨處，無法支開。" };
      }
    }
    const event = getEvent(eventId);
    if (!event) return { ok: false, error: "找不到事件" };
    if (
      !force &&
      hasOccurred(state, eventId) &&
      state.currentEventId !== eventId &&
      !event.hub &&
      !event.intervention &&
      !event.final
    ) {
      if (state.currentSession.forcedNextEventId === eventId) {
        state.currentSession.forcedNextEventId = null;
      }
      return startEvent(SEASON.hubEventId);
    }
    if (state.currentSession.status === "settled" && !event.final) {
      return { ok: false, error: "本次已暫時休戰" };
    }
    state.currentEventId = eventId;
    setEventRecord(state, eventId, { status: "active" });
    markOccurred(state, eventId);
    state.currentSession.eventCount += 1;
    if (event.id === SEASON.hubEventId || eventId === "EVENT_007_realization") {
      if (eventId === SEASON.hubEventId) unlockDynamicPhase();
    }
    if (event.characters?.length) {
      trackCharacterTouch(state, event.characters[0], "event", event.id);
    }
    if (event.onEnter) applyEffects(state, event.onEnter);
    if (eventId === "IV_force" && state.pendingForceFollowup) {
      state.currentSession.forcedNextEventId = state.pendingForceFollowup;
      state.pendingForceFollowup = null;
    }
    if (force) pushHistory(state, { kind: "admin", text: `手動觸發 ${event.title}` });
    pushHistory(state, { kind: "event", text: `事件開始：${event.title}`, eventId });
    persistState();
    return { ok: true };
  }

  function goHubOrForced() {
    if (state.currentSession.forcedNextEventId) {
      const nextId = state.currentSession.forcedNextEventId;
      state.currentSession.forcedNextEventId = null;
      startEvent(nextId);
      return;
    }
    startEvent(SEASON.hubEventId);
  }

  function resolveQueue() {
    if (state.queuedFinalize) {
      state.queuedFinalize = false;
      finalizeSettlement();
      return;
    }
    if (state.queuedEventId) {
      const nextId = state.queuedEventId;
      state.queuedEventId = null;
      startEvent(nextId);
      return;
    }
    if (state.queuedAdvance) {
      state.queuedAdvance = false;
      if (state.currentSession.phase === "settling" || state.currentSession.phase === "final") {
        persistState();
        return;
      }
      if (state.currentSession.phase !== "intro") unlockDynamicPhase();
      const next = drawPoolEvent(state, rng);
      if (next) startEvent(next.id);
      else {
        snapshotResult("事件池", ["目前沒有符合條件的中段事件。"]);
        startEvent(SEASON.hubEventId);
      }
    }
  }

  function choose(choiceId) {
    if (state.currentSession.status === "paused") {
      return { ok: false, error: "本次事件已暫停" };
    }
    if (state.currentSession.status === "settled") {
      return { ok: false, error: "今晚已經暫時休戰" };
    }
    const event = getEvent(state.currentEventId);
    if (!event) return { ok: false, error: "目前沒有事件" };
    if (state.currentSession.phase === "settling" && !event.final) {
      return { ok: false, error: "今晚正在結算" };
    }
    const choice = (event.choices || []).find((item) => item.id === choiceId);
    if (!choice) return { ok: false, error: "找不到選項" };

    const before = captureStatSnapshot(state);
    const logs = applyEffects(state, [...(choice.effects || []), ...extraChoiceEffects(event.id, choiceId)]);
    const unresolved = (choice.effects || []).some(
      (effect) => effect.type === "eventStatus" && effect.status === "unresolved"
    );
    if (!event.hub && !event.intervention && !event.final) {
      completeEvent(state, event.id, unresolved ? "unresolved" : "resolved");
    }
    if (event.intervention) {
      completeEvent(state, `${event.id}:${state.pendingTargetId}:${choiceId}`, "resolved");
    }
    if (event.characters?.[0]) {
      trackCharacterTouch(state, event.characters[0], "vote", event.id);
    }

    pushHistory(state, {
      kind: event.intervention ? "intervention" : "choice",
      text: `選擇「${choice.label}」／${event.title}`,
      eventId: event.id,
      targetId: state.pendingTargetId,
    });

    if (event.id === "EVENT_007_realization") unlockDynamicPhase();

    const isHubDraw = Boolean(event.hub);
    const isFinalClose = Boolean(event.final);

    if (!isHubDraw && !isFinalClose) {
      setFeedback({ showOverlay: true, showInterval: true });
    }

    if (!state.queuedEventId && !state.queuedAdvance && !state.queuedFinalize && !event.hub && !event.final) {
      if (state.currentSession.forcedNextEventId) {
        state.queuedEventId = state.currentSession.forcedNextEventId;
        state.currentSession.forcedNextEventId = null;
      } else {
        state.queuedEventId = SEASON.hubEventId;
      }
    }
    resolveQueue();
    if (!isHubDraw && !isFinalClose) {
      attachChoiceResult({ event, logs, before });
    }
    persistState();
    return { ok: true };
  }

  function intervene(type, targetId, { force = false } = {}) {
    if (state.currentSession.status === "paused") return { ok: false, error: "本次事件已暫停" };
    if (state.currentSession.status === "settled") return { ok: false, error: "今晚已經暫時休戰" };
    if (state.currentSession.phase === "settling" || state.currentSession.phase === "final") {
      return { ok: false, error: "今晚正在結算" };
    }
    if (!force && !state.flags[SEASON.unlockInterventionsFlag]) {
      return { ok: false, error: "先讓觀眾認識角色。干預尚未解鎖。" };
    }
    const action = INTERVENTIONS.find((item) => item.id === type);
    if (!action) return { ok: false, error: "未知干預" };
    if (action.needsTarget && !CHARACTER_BY_ID[targetId]) {
      return { ok: false, error: "請選擇角色" };
    }
    if (action.id === "rewrite" || action.id === "rewriteFate") {
      return applyRewriteFate(targetId);
    }
    if (action.id === "force" || action.id === "forceEvent" || action.eventId === "IV_force") {
      return applyForceFate(targetId);
    }
    if (action.id === "intervene" || action.id === "sabotage" || action.eventId === "IV_sabotage") {
      return applyInterruptFate(targetId);
    }
    const cost = GAME_CONFIG.interventionCosts[action.costKey];
    state.pendingTargetId = targetId || null;
    const target = CHARACTER_BY_ID[targetId];
    trackCharacterTouch(state, targetId, "intervention", action.eventId);
    pushHistory(state, {
      kind: "intervention",
      text: `主播執行「${action.name}」（權限 ${cost}）→ ${target?.name || "現場"}。金流在遊戲外，此處不扣款。`,
      targetId,
      interventionId: type,
    });
    return startEvent(action.eventId);
  }

  function rememberPair(originalSoloCharacter, joiningCharacter = null, interruptingCharacter = null) {
    state.originalSoloCharacter = originalSoloCharacter;
    state.joiningCharacter = joiningCharacter;
    state.interruptingCharacter = interruptingCharacter;
    if (!state.currentSession) ensureSession(state);
    state.currentSession.originalSoloCharacter = originalSoloCharacter;
    state.currentSession.joiningCharacter = joiningCharacter;
    state.currentSession.interruptingCharacter = interruptingCharacter;
  }

  function paidStatEffects(id, { unique = 0, jealous = 0, affection = 0 } = {}) {
    const def = CHARACTER_BY_ID[id];
    const effects = [];
    if (!def) return effects;
    if (unique) effects.push({ type: "stat", path: `characters.${id}.${def.uniquePrimary}`, op: "add", value: unique });
    if (jealous) effects.push({ type: "stat", path: `characters.${id}.jealousy`, op: "add", value: jealous });
    if (affection) effects.push({ type: "stat", path: `characters.${id}.affection`, op: "add", value: affection });
    return effects;
  }

  function attachPaidResult({ kind, logs, before, extra = {} }) {
    const after = captureStatSnapshot(state);
    const statChanges = extra.statChanges || diffStatSnapshots(before, after);
    const statusNotes = extra.statusNotes || diffStatusNotes(before, after);
    const intervalCopy = extra.intervalCopy || buildIntervalCopy({ kind, statChanges, statusNotes, ...extra });
    const overlayTitle = extra.overlayTitle || overlayTitleForKind(kind);
    snapshotResult(overlayTitle, logs, {
      kind,
      overlayTitle,
      statChanges,
      statusNotes,
      intervalCopy,
      ...extra,
    });
    const nextEvent = getEvent(state.currentEventId);
    setFeedback({
      showOverlay: true,
      showInterval: !nextEvent?.hub && !nextEvent?.final,
      intervalCopy,
    });
  }

  function applyInterruptFate(interrupterId) {
    const originalSolo = activeSoloId(state);
    const actor = CHARACTER_BY_ID[interrupterId];
    const broken = CHARACTER_BY_ID[originalSolo];
    if (!originalSolo || !broken) {
      return { ok: false, error: "目前沒有正在發生的獨處，無法支開。" };
    }
    if (!actor) return { ok: false, error: "請選擇把可樂月月支開的人。" };
    if (interrupterId === originalSolo) {
      return { ok: false, error: "請選另一個人把可樂月月支開。正在獨處的人不能支開自己。" };
    }
    const cost = GAME_CONFIG.interventionCosts.intervene;
    const before = captureStatSnapshot(state);
    const line = pickInterruptLine(interrupterId, rng);
    rememberPair(originalSolo, null, interrupterId);
    state.pendingTargetId = interrupterId;
    const logs = applyEffects(state, [
      ...paidStatEffects(originalSolo, { unique: 8, jealous: 6, affection: -8 }),
      ...paidStatEffects(interrupterId, { unique: 10, jealous: 8 }),
      { type: "flag", key: `date_broken_${originalSolo}`, value: true },
      { type: "flag", key: `solo_active_${originalSolo}`, value: false },
      { type: "flag", key: `forced_${interrupterId}`, value: true },
      { type: "tension", pair: `${interrupterId}-${originalSolo}`, op: "add", value: 8 },
    ]);
    clearSoloFlags();
    const after = captureStatSnapshot(state);
    const statChanges = diffStatSnapshots(before, after);
    trackCharacterTouch(state, interrupterId, "intervention", "IV_sabotage");
    pushHistory(state, {
      kind: "intervention",
      text: `主播執行「干涉命運」（權限 ${cost}）→ ${actor.name} 把 ${broken.name} 支開。金流在遊戲外，此處不扣款。`,
      targetId: interrupterId,
      interventionId: "intervene",
    });
    const followup = pickPoolEventForCharacter(state, interrupterId, rng);
    const missingFollowup = !followup;
    const started = startEvent(followup?.id || SEASON.hubEventId);
    const statusNotes = [
      { kind: "line", text: `「${line}」` },
      { kind: "solo-off", text: `${broken.name} 與可樂月月的獨處被打斷。` },
      { kind: "broken", text: `${actor.name} 把可樂月月帶走了。` },
      ...diffStatusNotes(before, after).filter((note) => note.kind !== "solo-off" && note.kind !== "broken"),
    ];
    if (missingFollowup) {
      statusNotes.push({ kind: "missing", text: `${actor.name} 目前沒有尚未出現的事件。沒有改抽其他角色。` });
    }
    const intervalCopy = missingFollowup
      ? `原本正在進行的兩人時間……**被${actor.name}打斷了。**${actor.name} 目前沒有尚未出現的事件，鏡頭先回到現場。`
      : `原本正在進行的兩人時間……**被${actor.name}打斷了。**下一張鏡頭被她搶走。`;
    attachPaidResult({
      kind: "sabotage",
      logs: logs.length ? logs : [`${actor.name} 出手把可樂月月支開。`],
      before,
      extra: {
        fateCost: 300,
        overlayTitle: "特殊命運介入",
        intervalCopy,
        statusNotes,
        statChanges,
        interruptLine: line,
        interruptingId: interrupterId,
        interruptingName: actor.name,
        originalSoloId: originalSolo,
        originalSoloName: broken.name,
        originalSoloCharacter: originalSolo,
        characterId: interrupterId,
        name: actor.name,
        shortName: actor.shortName,
        icon: actor.icon,
        missingFollowup,
      },
    });
    persistState();
    return started?.ok === false ? started : { ok: true };
  }

  function applyForceFate(joiningId) {
    const originalSolo = activeSoloId(state);
    const joiner = CHARACTER_BY_ID[joiningId];
    const host = CHARACTER_BY_ID[originalSolo];
    if (!originalSolo || !host) {
      return { ok: false, error: "目前沒有正在發生的獨處，無法把人叫進來。" };
    }
    if (!joiner) return { ok: false, error: "請選擇加入戰場的人。" };
    if (joiningId === originalSolo) {
      return { ok: false, error: "請選另一個人加入戰場。正在獨處的人已經在場內。" };
    }
    const cost = GAME_CONFIG.interventionCosts.force;
    const before = captureStatSnapshot(state);
    rememberPair(originalSolo, joiningId, null);
    state.pendingTargetId = joiningId;
    applyEffects(state, [
      ...paidStatEffects(originalSolo, { unique: 16, jealous: 12 }),
      ...paidStatEffects(joiningId, { unique: 16, jealous: 12 }),
      { type: "flag", key: `date_broken_${originalSolo}`, value: true },
      { type: "flag", key: `solo_active_${originalSolo}`, value: false },
      { type: "flag", key: `forced_${originalSolo}`, value: true },
      { type: "flag", key: `forced_${joiningId}`, value: true },
      { type: "tension", pair: `${originalSolo}-${joiningId}`, op: "add", value: 10 },
    ]);
    clearSoloFlags();
    const after = captureStatSnapshot(state);
    const statChanges = diffStatSnapshots(before, after);
    trackCharacterTouch(state, joiningId, "intervention", "IV_force");
    pushHistory(state, {
      kind: "intervention",
      text: `主播執行「扭轉命運」（權限 ${cost}）→ ${joiner.name} 加入 ${host.name} 的獨處。金流在遊戲外，此處不扣款。`,
      targetId: joiningId,
      interventionId: "force",
    });
    const picked = pickShuraForPair(state, originalSolo, joiningId, rng);
    const missingShura = !picked.eventId;
    const started = startEvent(picked.eventId || SEASON.hubEventId);
    const statusNotes = [
      { kind: "join", text: `${joiner.name} 決定加入戰局。` },
      { kind: "broken", text: `她直接打破了${host.name}與可樂月月原本的獨處時光。` },
      ...diffStatusNotes(before, after).filter((note) => note.kind !== "solo-off" && note.kind !== "broken"),
    ];
    if (missingShura) {
      statusNotes.push({
        kind: "missing",
        text:
          picked.reason === "exhausted"
            ? `${host.name} × ${joiner.name} 的修羅場已經用完。沒有改抽其他角色。`
            : `${host.name} × ${joiner.name} 目前還沒有可用的修羅場事件。沒有改抽其他角色。`,
      });
    }
    const intervalCopy = missingShura
      ? `**歡迎來到戀愛修羅場**\n\n此時，可樂月月、${host.name}、${joiner.name}，場面僵持。\n這對組合目前沒有可用的修羅場卡。系統沒有改抽其他人。`
      : `**歡迎來到戀愛修羅場**\n\n此時，可樂月月、${host.name}、${joiner.name}，場面僵持。`;
    attachPaidResult({
      kind: "force",
      logs: [`${joiner.name} 加入了戰局。`],
      before,
      extra: {
        fateCost: 500,
        overlayTitle: "局勢變化",
        intervalCopy,
        statusNotes,
        statChanges,
        originalSoloId: originalSolo,
        originalSoloName: host.name,
        originalSoloCharacter: originalSolo,
        joiningId,
        joiningName: joiner.name,
        joiningCharacter: joiningId,
        characterId: joiningId,
        name: joiner.name,
        shortName: joiner.shortName,
        icon: joiner.icon,
        missingShura,
        missingReason: picked.reason,
        dangerFrom: before.dangers?.[joiningId] ?? 0,
        dangerTo: after.dangers?.[joiningId] ?? 0,
      },
    });
    persistState();
    return started?.ok === false ? started : { ok: true };
  }

  function applyRewriteFate(targetId) {
    const ids = Object.keys(CHARACTER_BY_ID);
    const pick = CHARACTER_BY_ID[targetId] ? targetId : ids[Math.floor(rng() * ids.length)] || ids[0];
    const target = CHARACTER_BY_ID[pick];
    const before = captureStatSnapshot(state);
    for (const key of target.stats) {
      const current = Number(state.characters[pick][key]) || 0;
      let next = clampStat(Math.round(8 + rng() * 84));
      if (next === current) next = clampStat(current >= 50 ? current - 21 : current + 21);
      state.characters[pick][key] = next;
    }
    const after = captureStatSnapshot(state);
    const changes = rewriteLines(
      target,
      before.characters[pick],
      after.characters[pick],
      before.dangers[pick],
      after.dangers[pick]
    );
    const statChanges = [
      {
        id: pick,
        name: target.name,
        shortName: target.shortName,
        icon: target.icon,
        changes,
      },
    ];
    state.pendingTargetId = pick;
    trackCharacterTouch(state, pick, "intervention", "rewrite");
    pushHistory(state, {
      kind: "intervention",
      text: `主播執行「改寫命運」→ ${target.name} 的核心數值被重新洗牌。`,
      targetId: pick,
      interventionId: "rewrite",
    });
    const intervalCopy = buildIntervalCopy({
      kind: "rewrite",
      statChanges,
      characterId: pick,
      name: target.name,
    });
    snapshotResult("改寫命運", ["命運已重新洗牌。"], {
      kind: "rewrite",
      overlayTitle: "改寫命運",
      fateCost: 1000,
      characterId: pick,
      name: target.name,
      shortName: target.shortName,
      icon: target.icon,
      statChanges,
      intervalCopy,
    });
    setFeedback({ showOverlay: true, showInterval: false, intervalCopy });
    return startEvent(SEASON.hubEventId);
  }

  function holdTonight() {
    const settlement = buildTonightSettlement(state);
    state.currentSession.nightSettlement = settlement;
    if (state.currentSession.status !== "settled") {
      state.currentSession.phase = "settling";
      state.currentSession.drawingLocked = true;
    }
    snapshotResult("今晚先到這裡", ["今晚的命運已保存。"], {
      kind: "nightHold",
      overlayTitle: "今晚結算",
      settlement,
    });
    setFeedback({ showOverlay: true, showInterval: false });
    pushHistory(state, { kind: "admin", text: "先讓場面停在這裡。今晚結算已保存。" });
    persistState();
    return { ok: true };
  }

  function confirmTonightHold() {
    if (state.currentSession.status === "settled") return { ok: true };
    if (state.currentEventId !== SEASON.finalEventId) {
      const ended = endSession();
      if (ended && ended.ok === false) return ended;
    }
    const partnerId = state.currentSession.nightPartner;
    const partner = CHARACTER_BY_ID[partnerId];
    const intervalCopy = buildIntervalCopy({
      kind: "companion",
      characterId: partnerId,
      name: partner?.name,
    });
    snapshotResult("今晚的選擇", [], {
      kind: "companion",
      overlayTitle: "今晚的選擇",
      characterId: partnerId || null,
      name: partner?.name || null,
      shortName: partner?.shortName || null,
      icon: partner?.icon || null,
      intervalCopy,
    });
    setFeedback({ showOverlay: true, showInterval: false, intervalCopy });
    persistState();
    return { ok: true };
  }

  function continueDrama() {
    if (state.currentSession.phase === "settling" && state.currentEventId !== SEASON.finalEventId) {
      endSession();
    }
    if (state.currentEventId === SEASON.finalEventId && state.currentSession.status !== "settled") {
      finalizeSettlement();
    }
    if (state.currentSession.status !== "settled") {
      return { ok: true };
    }
    state.queuedEventId = null;
    state.queuedAdvance = false;
    state.queuedFinalize = false;
    state.pendingTargetId = null;
    state.pendingForceFollowup = null;
    state.lastResult = null;
    const session = createSession();
    session.status = "active";
    session.phase = "dynamic";
    session.skipIntro = true;
    session.openingSnapshot = captureTonightSnapshot(state);
    session.intervalCopy = "新的一晚開始了。現場的空氣，還承接著上一夜。";
    session.feedback = { showOverlay: false, showInterval: false, intervalCopy: session.intervalCopy };
    state.currentSession = session;
    state.flags[SEASON.unlockInterventionsFlag] = true;
    state.flags.audience_aware = true;
    state.flags.dynamic_pool_unlocked = true;
    persistState();
    return startEvent(SEASON.hubEventId, { force: true });
  }

  function dismissResult() {
    if (state.currentSession?.feedback) {
      state.currentSession.feedback.showOverlay = false;
    }
    persistState();
    return { ok: true };
  }

  function dismissInterval() {
    if (state.currentSession?.feedback) {
      state.currentSession.feedback.showInterval = false;
    }
    persistState();
    return { ok: true };
  }

  function newGame() {
    clearGameSave();
    state = createInitialState(state.currentSeason || GAME_CONFIG.currentSeason);
    ensureSession(state);
    persistState();
    return { ok: true };
  }

  function applyDonation(payload) {
    const gained = fateFromDonation(payload.amount);
    state.fate += gained;
    pushHistory(state, {
      kind: "donation",
      text: `${payload.from} 斗內 ${payload.amount} → 命運干預權 +${gained}${payload.message ? `「${payload.message}」` : ""}`,
    });
    snapshotResult("模擬斗內", [`命運值 +${gained}（干預權，不是直接加好感）`]);
    persistState();
  }

  function addFate(amount) {
    state.fate = Math.max(0, state.fate + (Number(amount) || 0));
    pushHistory(state, { kind: "admin", text: `命運值 ${amount >= 0 ? "+" : ""}${amount}` });
    persistState();
  }

  function setStat(characterId, key, value) {
    const def = CHARACTER_BY_ID[characterId];
    if (!def?.stats.includes(key)) return;
    const num = Number(value);
    if (Number.isNaN(num)) return;
    state.characters[characterId][key] = Math.max(
      GAME_CONFIG.statMin,
      Math.min(GAME_CONFIG.statMax, num)
    );
    persistState();
  }

  function setTension(key, value) {
    if (!state.relationships[key]) return;
    state.relationships[key].tension = Math.max(0, Math.min(100, Number(value) || 0));
    persistState();
  }

  function skipEvent() {
    if (state.currentSession.status === "settled") return { ok: false, error: "本次已暫時休戰" };
    const event = getEvent(state.currentEventId);
    if (!event) return { ok: false };
    if (!event.hub && !event.intervention && !event.final) completeEvent(state, event.id);
    if (event.solo || (event.tags || []).includes("solo") || event.id === "EVENT_jupiter_quiet_date") {
      clearSoloFlags();
    }
    pushHistory(state, { kind: "admin", text: `跳過事件 ${event.title}` });
    const fallback = event.choices?.[0];
    if (fallback) {
      applyEffects(state, [...(fallback.effects || []), ...extraChoiceEffects(event.id, fallback.id)]);
      if (!state.queuedEventId && !state.queuedAdvance && !state.queuedFinalize) {
        goHubOrForced();
      } else {
        resolveQueue();
      }
    } else {
      goHubOrForced();
    }
    persistState();
    return { ok: true };
  }

  function nextEvent() {
    if (state.currentSession.status === "settled") return { ok: false, error: "本次已暫時休戰" };
    if (state.currentSession.status === "paused") resumeSession();
    const current = getEvent(state.currentEventId);
    if (current?.final) return { ok: false, error: "請先看完今晚結算" };

    const intro = SEASON.introEventIds;
    const introIndex = intro.indexOf(state.currentEventId);
    if (introIndex >= 0 && introIndex < intro.length - 1) {
      completeEvent(state, state.currentEventId);
      return startEvent(intro[introIndex + 1], { force: true });
    }
    if (introIndex === intro.length - 1) {
      completeEvent(state, state.currentEventId);
      unlockDynamicPhase();
      return startEvent(SEASON.hubEventId, { force: true });
    }
    if (current?.intervention) return skipEvent();
    if (current && !current.hub && !current.final) completeEvent(state, current.id);
    if (current && ((current.tags || []).includes("solo") || current.id === "EVENT_jupiter_quiet_date")) {
      clearSoloFlags();
    }
    unlockDynamicPhase();
    const next = drawPoolEvent(state, rng);
    if (!next) {
      snapshotResult("事件池", ["目前沒有符合條件的中段事件。"]);
      return startEvent(SEASON.hubEventId);
    }
    return startEvent(next.id, { force: true });
  }

  function pauseSession() {
    if (state.currentSession.status === "settled") return { ok: false, error: "本次已暫時休戰" };
    state.currentSession.status = "paused";
    state.currentSession.pausedEventId = state.currentEventId;
    pushHistory(state, { kind: "admin", text: "暫停本次事件" });
    persistState();
    return { ok: true };
  }

  function resumeSession() {
    if (state.currentSession.status === "settled") return { ok: false, error: "本次已暫時休戰" };
    state.currentSession.status = "active";
    pushHistory(state, { kind: "admin", text: "繼續本次事件" });
    persistState();
    return { ok: true };
  }

  function resetSession() {
    const archive = state.archive || {};
    const saveId = state.saveId;
    const partnerFlags = Object.fromEntries(
      Object.entries(state.flags || {}).filter(([key]) => key.endsWith("_night_partner"))
    );
    const seasonId = state.currentSeason || GAME_CONFIG.currentSeason;
    state = createInitialState(seasonId);
    state.archive = archive;
    state.saveId = saveId;
    state.flags = { ...state.flags, ...partnerFlags };
    persistState();
  }

  function resetSeason() {
    const archive = state.archive || {};
    clearGameSave();
    state = createInitialState(state.currentSeason || GAME_CONFIG.currentSeason);
    state.archive = archive;
    persistState();
  }

  function endSession() {
    if (state.currentSession.status === "settled") return { ok: false, error: "本次已暫時休戰" };
    if (state.currentEventId === SEASON.finalEventId) return { ok: true };
    const partner = pickNightPartner(state);
    state.currentSession.nightPartner = partner;
    state.currentSession.phase = "final";
    state.pendingTargetId = partner;
    pushHistory(state, {
      kind: "admin",
      text: `結束本次事件：進入今晚結算（陪伴者判定為 ${CHARACTER_BY_ID[partner].name}）`,
    });
    return startEvent(SEASON.finalEventId);
  }

  function finalizeSettlement() {
    const partner = state.currentSession.nightPartner || pickNightPartner(state);
    state.currentSession.nightPartner = partner;
    const flag = nightPartnerFlag(state.currentSeason);
    state.flags[flag] = partner;
    const card = buildProgressCard(state);
    state.currentSession.progressCard = card;
    state.currentSession.status = "settled";
    state.currentSession.phase = "settled";
    completeEvent(state, SEASON.finalEventId, "resolved");
    state.archive[state.currentSeason] = {
      nightPartner: partner,
      completedEvents: [...state.completedEvents],
      importantFlags: Object.entries(state.flags)
        .filter(([, value]) => value)
        .map(([key, value]) => ({ key, value })),
      progressCard: card,
      settledAt: Date.now(),
      sessionId: state.currentSession.id,
    };
    snapshotResult("七夕事件進度卡", [
      "本次事件狀態：暫時休戰",
      `今晚陪伴者：${CHARACTER_BY_ID[partner].name}`,
    ]);
    pushHistory(state, {
      kind: "settlement",
      text: `今晚結算完成。陪伴者 ${CHARACTER_BY_ID[partner].name}。不是故事結局。`,
    });
  }

  function getPublicState() {
    ensureSession(state);
    const derived = computeDerived(state);
    const settlement = settlementView(state);
    const rawEvent = getEvent(state.currentEventId);
    const ctx = eventContext(state);
    return {
      ...cloneState(state),
      derived,
      settlement,
      lifecycle: lifecycleStatus(state),
      trajectory: settlement,
      season: SEASONS[state.currentSeason],
      currentEvent: interpolateEvent(rawEvent, ctx),
      interventionsUnlocked: Boolean(state.flags[SEASON.unlockInterventionsFlag]),
      pool: listPoolCandidates(state),
      soloActive: activeSoloId(state),
      nightScores: Object.fromEntries(
        Object.values(CHARACTER_BY_ID).map((c) => [c.id, Number(nightScore(state, c.id).toFixed(2))])
      ),
      charactersView: Object.values(CHARACTER_BY_ID).map((c) => ({
        ...c,
        values: state.characters[c.id],
        status: characterStatus(state, c.id),
        audienceStatus: audienceStatus(state, c.id),
        danger: characterDanger(state, c.id),
        nightScore: Number(nightScore(state, c.id).toFixed(2)),
      })),
      interventions: INTERVENTIONS.filter((item) => item.host).map((item) => ({
        ...item,
        cost: GAME_CONFIG.interventionCosts[item.costKey],
        available: item.requiresSolo ? Boolean(activeSoloId(state)) : true,
      })),
      config: {
        costs: GAME_CONFIG.interventionCosts,
        startingFate: GAME_CONFIG.startingFate,
      },
    };
  }

  if (persist) {
    window.addEventListener("storage", (event) => {
      if (event.key === GAME_CONFIG.saveKey && event.newValue) {
        try {
          state = migrateSave(JSON.parse(event.newValue)) || createInitialState();
          ensureSession(state);
          listeners.forEach((fn) => fn(getPublicState()));
        } catch {
          /* ignore broken payload */
        }
      }
    });
  }

  return {
    subscribe(fn) {
      listeners.add(fn);
      fn(getPublicState());
      return () => listeners.delete(fn);
    },
    getState: getPublicState,
    choose,
    intervene,
    startEvent,
    skipEvent,
    nextEvent,
    pauseSession,
    holdTonight,
    confirmTonightHold,
    continueDrama,
    dismissResult,
    dismissInterval,
    newGame,
    resumeSession,
    resetSession,
    resetSeason,
    endSession,
    addFate,
    setStat,
    setTension,
    simulateDonation: (payload) => donations.simulate(payload),
    listPool: () => listPoolCandidates(state),
    allEvents: () => EVENTS.map((event) => ({ id: event.id, title: event.title, tags: event.tags })),
  };
}

export { INTERVENTIONS, GAME_CONFIG, inspectSave, lifecycleStatus };
