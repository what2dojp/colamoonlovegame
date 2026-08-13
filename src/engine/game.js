import { GAME_CONFIG } from "../config/game.config.js";
import { CHARACTERS, CHARACTER_BY_ID } from "../../data/characters.js";
import { SEASONS } from "../../data/seasons/index.js";
import { EVENTS } from "../../data/seasons/qixi-2026/events.js";
import { INTERVENTIONS } from "../../data/seasons/qixi-2026/interventions.js";
import { SEASON } from "../../data/seasons/qixi-2026/season.js";
import { createMockDonationProvider, fateFromDonation } from "./donation.js";
import {
  applyEffects,
  completeEvent,
  eventContext,
  getEvent,
  interpolateEvent,
  listAvailableStoryEvents,
} from "./event-engine.js";
import { characterStatus, computeDerived, resolveTrajectory } from "./derived.js";
import { clearSave, cloneState, createInitialState, loadSave, writeSave } from "./save.js";

function nowStamp() {
  return Date.now();
}

function pushHistory(state, entry) {
  state.history.unshift({ t: nowStamp(), ...entry });
  state.history = state.history.slice(0, 80);
}

export function createGame({ persist = true, donationProvider } = {}) {
  let state = persist ? loadSave() || createInitialState() : createInitialState();
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

  function startEvent(eventId, { force = false } = {}) {
    const event = getEvent(eventId);
    if (!event) return { ok: false, error: "找不到事件" };
    state.currentEventId = eventId;
    if (event.onEnter) applyEffects(state, event.onEnter);
    if (force) pushHistory(state, { kind: "admin", text: `手動觸發 ${event.title}` });
    persistState();
    return { ok: true };
  }

  function resolveQueue() {
    if (state.queuedEventId) {
      const nextId = state.queuedEventId;
      state.queuedEventId = null;
      const current = getEvent(state.currentEventId);
      if (current && !current.hub && !current.intervention) completeEvent(state, current.id);
      startEvent(nextId);
      return;
    }
    if (state.queuedAdvance) {
      state.queuedAdvance = false;
      const next = listAvailableStoryEvents(state)[0];
      if (next) startEvent(next.id);
      else startEvent(SEASON.hubEventId);
    }
  }

  function choose(choiceId) {
    const event = getEvent(state.currentEventId);
    if (!event) return { ok: false, error: "目前沒有事件" };
    const choice = (event.choices || []).find((item) => item.id === choiceId);
    if (!choice) return { ok: false, error: "找不到選項" };

    const logs = applyEffects(state, choice.effects);
    if (!event.hub && !event.intervention) completeEvent(state, event.id);
    if (event.intervention) completeEvent(state, `${event.id}:${state.pendingTargetId}:${choiceId}`);

    pushHistory(state, {
      kind: event.intervention ? "intervention" : "choice",
      text: `選擇「${choice.label}」／${event.title}`,
      eventId: event.id,
      targetId: state.pendingTargetId,
    });
    snapshotResult(event.title, logs.length ? logs : [`已選擇：${choice.label}`]);

    if (!state.queuedEventId && !state.queuedAdvance && !event.hub) {
      state.queuedEventId = SEASON.hubEventId;
    }
    resolveQueue();
    persistState();
    return { ok: true };
  }

  function intervene(type, targetId, { force = false } = {}) {
    if (!force && !state.flags[SEASON.unlockInterventionsFlag]) {
      return { ok: false, error: "先讓觀眾認識角色。干預尚未解鎖。" };
    }
    const action = INTERVENTIONS.find((item) => item.id === type);
    if (!action) return { ok: false, error: "未知干預" };
    if (action.needsTarget && !CHARACTER_BY_ID[targetId]) {
      return { ok: false, error: "請選擇標角色" };
    }
    const cost = GAME_CONFIG.interventionCosts[action.costKey];
    if (state.fate < cost) return { ok: false, error: `命運值不足（需要 ${cost}）` };

    state.fate -= cost;
    state.pendingTargetId = targetId || null;
    const target = CHARACTER_BY_ID[targetId];
    pushHistory(state, {
      kind: "intervention",
      text: `觀眾對 ${target?.name || "現場"} 發動了 [${action.name}]，消耗命運 ${cost}`,
      targetId,
      interventionId: type,
    });
    snapshotResult(action.name, [`消耗命運值 ${cost}`, `對象：${target?.name || "無"}`]);
    startEvent(action.eventId);
    return { ok: true };
  }

  function applyDonation(payload) {
    const gained = fateFromDonation(payload.amount);
    state.fate += gained;
    pushHistory(state, {
      kind: "donation",
      text: `${payload.from} 斗內 ${payload.amount}，命運值 +${gained}${payload.message ? `「${payload.message}」` : ""}`,
    });
    snapshotResult("模擬斗內", [`命運值 +${gained}`]);
    persistState();
  }

  function addFate(amount) {
    state.fate = Math.max(0, state.fate + (Number(amount) || 0));
    pushHistory(state, { kind: "admin", text: `命運值 ${amount >= 0 ? "+" : ""}${amount}` });
    persistState();
  }

  function setStat(characterId, key, value) {
    if (!state.characters[characterId]) return;
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
    const event = getEvent(state.currentEventId);
    if (!event) return;
    if (!event.hub && !event.intervention) completeEvent(state, event.id);
    pushHistory(state, { kind: "admin", text: `跳過事件 ${event.title}` });
    const fallback = event.choices?.[0];
    if (fallback) {
      applyEffects(state, fallback.effects);
      resolveQueue();
    } else {
      startEvent(SEASON.hubEventId);
    }
    persistState();
  }

  function resetSeason() {
    clearSave();
    state = createInitialState(state.currentSeason || GAME_CONFIG.currentSeason);
    persistState();
  }

  function getPublicState() {
    const derived = computeDerived(state);
    const trajectory = resolveTrajectory(state);
    const rawEvent = getEvent(state.currentEventId);
    const ctx = eventContext(state);
    return {
      ...cloneState(state),
      derived,
      trajectory,
      season: SEASONS[state.currentSeason],
      currentEvent: interpolateEvent(rawEvent, ctx),
      interventionsUnlocked: Boolean(state.flags[SEASON.unlockInterventionsFlag]),
      charactersView: CHARACTERS.map((c) => ({
        ...c,
        values: state.characters[c.id],
        status: characterStatus(state, c.id),
      })),
      interventions: INTERVENTIONS.map((item) => ({
        ...item,
        cost: GAME_CONFIG.interventionCosts[item.costKey],
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
          state = JSON.parse(event.newValue);
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
    resetSeason,
    addFate,
    setStat,
    setTension,
    simulateDonation: (payload) => donations.simulate(payload),
    listStoryEvents: () => listAvailableStoryEvents(state),
    allEvents: () => EVENTS.map((event) => ({ id: event.id, title: event.title, tags: event.tags })),
  };
}

export { INTERVENTIONS, GAME_CONFIG };
