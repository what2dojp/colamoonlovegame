import { GAME_CONFIG } from "../config/game.config.js";
import { CHARACTER_BY_ID } from "../../data/characters.js";
import { SEASONS } from "../../data/seasons/index.js";
import { EVENTS } from "../../data/seasons/qixi-2026/events.js";
import { INTERVENTIONS, activeSoloId, pickForceFollowup, SOLO_FLAG_IDS, soloFlag } from "../../data/seasons/qixi-2026/interventions.js";
import { SEASON } from "../../data/seasons/qixi-2026/season.js";
import { createMockDonationProvider, fateFromDonation } from "./donation.js";
import {
  applyEffects,
  completeEvent,
  eventContext,
  getEvent,
  interpolateEvent,
} from "./event-engine.js";
import { audienceStatus, characterDanger, characterStatus, computeDerived } from "./derived.js";
import { clearSave, cloneState, createInitialState, loadSave, migrateSave, writeSave } from "./save.js";
import {
  buildProgressCard,
  drawPoolEvent,
  ensureSession,
  listPoolCandidates,
  nightPartnerFlag,
  nightScore,
  pickNightPartner,
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

  function snapshotResult(title, logs) {
    state.lastResult = {
      title,
      logs: logs.filter(Boolean),
      at: nowStamp(),
    };
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
        snapshotResult("干涉命運", ["目前沒有正在發生的獨處，破壞未執行。"]);
        startEvent(SEASON.hubEventId);
        return { ok: false, error: "目前沒有正在發生的獨處，無法破壞。" };
      }
      state.pendingTargetId = solo;
    }
    const event = getEvent(eventId);
    if (!event) return { ok: false, error: "找不到事件" };
    if (state.currentSession.status === "settled" && !event.final) {
      return { ok: false, error: "本次已暫時休戰" };
    }
    state.currentEventId = eventId;
    setEventRecord(state, eventId, { status: "active" });
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
    const choice = (event.choices || []).find((item) => item.id === choiceId);
    if (!choice) return { ok: false, error: "找不到選項" };

    const logs = applyEffects(state, choice.effects);
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
    snapshotResult(event.title, logs.length ? logs : [`已選擇：${choice.label}`]);

    if (event.id === "EVENT_007_realization") unlockDynamicPhase();

    if (!state.queuedEventId && !state.queuedAdvance && !state.queuedFinalize && !event.hub && !event.final) {
      if (state.currentSession.forcedNextEventId) {
        state.queuedEventId = state.currentSession.forcedNextEventId;
        state.currentSession.forcedNextEventId = null;
      } else {
        state.queuedEventId = SEASON.hubEventId;
      }
    }
    resolveQueue();
    persistState();
    return { ok: true };
  }

  function intervene(type, targetId, { force = false } = {}) {
    if (state.currentSession.status === "paused") return { ok: false, error: "本次事件已暫停" };
    if (state.currentSession.status === "settled") return { ok: false, error: "今晚已經暫時休戰" };
    if (!force && !state.flags[SEASON.unlockInterventionsFlag]) {
      return { ok: false, error: "先讓觀眾認識角色。干預尚未解鎖。" };
    }
    const action = INTERVENTIONS.find((item) => item.id === type);
    if (!action) return { ok: false, error: "未知干預" };
    if (action.needsTarget && !CHARACTER_BY_ID[targetId] && !action.requiresSolo) {
      return { ok: false, error: "請選擇標角色" };
    }
    if (action.requiresSolo || action.eventId === "IV_sabotage") {
      const solo = activeSoloId(state);
      if (!solo) {
        return { ok: false, error: "目前沒有正在發生的獨處，無法破壞。" };
      }
      targetId = solo;
    }
    const cost = GAME_CONFIG.interventionCosts[action.costKey];
    const stage = getEvent(state.currentEventId);
    if (action.eventId === "IV_force") {
      state.pendingForceFollowup = pickForceFollowup(stage?.characters || [], targetId, state.flags);
    }
    state.pendingTargetId = targetId || null;
    const target = CHARACTER_BY_ID[targetId];
    trackCharacterTouch(state, targetId, "intervention", action.eventId);
    pushHistory(state, {
      kind: "intervention",
      text: `主播執行「${action.name}」（權限 ${cost}）→ ${target?.name || "現場"}。金流在遊戲外，此處不扣款。`,
      targetId,
      interventionId: type,
    });
    snapshotResult(action.name, [
      `主播操作權限 ${cost}`,
      `對象：${target?.name || "無"}`,
      "這會改變接下來可能發生的事件，不是加減好感。",
    ]);
    return startEvent(action.eventId);
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
      applyEffects(state, fallback.effects);
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
    clearSave();
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
      `${flag} = ${partner}`,
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

export { INTERVENTIONS, GAME_CONFIG };
