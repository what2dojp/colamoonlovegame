import { CHARACTERS, CHARACTER_BY_ID, STAT_LABELS } from "../../data/characters.js";
import { pairKey } from "../../data/relationships.js";
import { EVENT_BY_ID, EVENTS } from "../../data/seasons/qixi-2026/events.js";
import { GAME_CONFIG } from "../config/game.config.js";
import { SEASONS } from "../../data/seasons/index.js";
import { evalCondition } from "./conditions.js";
import { computeDerived } from "./derived.js";
import { eventContext } from "./event-engine.js";
import { captureTonightSnapshot } from "./stat-delta.js";

function getEvent(eventId) {
  return EVENT_BY_ID[eventId] || null;
}

export function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function nightPartnerFlag(seasonId) {
  return `${String(seasonId).replaceAll("-", "_")}_night_partner`;
}

export function createSession() {
  return {
    id: makeId("session"),
    status: "active",
    phase: "intro",
    startedAt: Date.now(),
    eventCount: 0,
    lastMajorInteraction: null,
    characterEventCounts: Object.fromEntries(CHARACTERS.map((c) => [c.id, 0])),
    interventionCounts: Object.fromEntries(CHARACTERS.map((c) => [c.id, 0])),
    lastVote: null,
    weightMods: {},
    forcedNextEventId: null,
    unresolvedEventIds: [],
    pausedEventId: null,
    nightPartner: null,
    progressCard: null,
  };
}

export function ensureSession(state) {
  if (!state.currentSession) state.currentSession = createSession();
  if (!state.eventRecords) state.eventRecords = {};
  if (!state.eventHistory) state.eventHistory = state.history || [];
  if (!state.archive) state.archive = {};
  if (!state.saveId) state.saveId = makeId("save");
  if (!state.occurredEventIds) {
    state.occurredEventIds = [...(state.completedEvents || [])];
  }
  if (!state.currentSession.openingSnapshot && state.characters) {
    state.currentSession.openingSnapshot = captureTonightSnapshot(state);
  }
  markOccurred(state, state.currentEventId);
  return state.currentSession;
}

export function markOccurred(state, eventId) {
  if (!eventId) return;
  const event = getEvent(eventId);
  if (!event || event.hub || event.intervention || event.final) return;
  if (!state.occurredEventIds) state.occurredEventIds = [];
  if (!state.occurredEventIds.includes(eventId)) state.occurredEventIds.push(eventId);
}

export function hasOccurred(state, eventId) {
  if (!eventId) return false;
  if ((state.occurredEventIds || []).includes(eventId)) return true;
  if ((state.completedEvents || []).includes(eventId)) return true;
  const record = state.eventRecords?.[eventId];
  return record?.status === "resolved" || record?.status === "unresolved";
}

export function setEventRecord(state, eventId, patch) {
  if (!eventId) return;
  if (!state.eventRecords[eventId]) {
    state.eventRecords[eventId] = {
      id: eventId,
      status: "active",
      startedAt: Date.now(),
    };
  }
  Object.assign(state.eventRecords[eventId], patch, { updatedAt: Date.now() });
}

export function effectiveWeight(event, state) {
  const base = Number(event.weight) || 10;
  const extra = Number(state.currentSession?.weightMods?.[event.id]) || 0;
  return Math.max(1, base + extra);
}

export function listPoolCandidates(state) {
  const ctx = eventContext(state);
  return EVENTS.filter((event) => {
    if (!event.pool) return false;
    if (event.final) return false;
    if (hasOccurred(state, event.id)) return false;
    return evalCondition(event.conditions, ctx);
  }).map((event) => ({
    id: event.id,
    title: event.title,
    weight: event.weight || 10,
    effectiveWeight: effectiveWeight(event, state),
  }));
}

export function drawPoolEvent(state, rng = Math.random) {
  const forced = state.currentSession?.forcedNextEventId;
  if (forced) {
    state.currentSession.forcedNextEventId = null;
    return getEvent(forced);
  }
  const pool = listPoolCandidates(state);
  if (!pool.length) return null;
  const total = pool.reduce((sum, item) => sum + item.effectiveWeight, 0);
  let cursor = rng() * total;
  for (const item of pool) {
    cursor -= item.effectiveWeight;
    if (cursor <= 0) return getEvent(item.id);
  }
  return getEvent(pool[pool.length - 1].id);
}

export function trackCharacterTouch(state, characterId, kind, eventId) {
  const session = ensureSession(state);
  if (!characterId || !CHARACTER_BY_ID[characterId]) return;
  if (kind === "event") {
    session.characterEventCounts[characterId] = (session.characterEventCounts[characterId] || 0) + 1;
  }
  if (kind === "intervention") {
    session.interventionCounts[characterId] = (session.interventionCounts[characterId] || 0) + 1;
  }
  session.lastMajorInteraction = { characterId, kind, eventId, t: Date.now() };
  if (kind === "vote" || kind === "intervention") {
    session.lastVote = { characterId, kind, eventId, t: Date.now() };
  }
}

export function nightScore(state, id) {
  const weights = GAME_CONFIG.nightScoreWeights[id] || { affection: 1 };
  const stats = state.characters[id] || {};
  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    if (key === "moonTension") {
      const rel = state.relationships?.[pairKey("moon", id)];
      score += (Number(rel?.tension) || 0) * weight;
      continue;
    }
    score += (Number(stats[key]) || 0) * weight;
  }
  return score;
}

export function pickNightPartner(state) {
  const session = ensureSession(state);
  const last = session.lastMajorInteraction?.characterId;
  const vote = session.lastVote?.characterId;
  return [...CHARACTERS]
    .map((c) => c.id)
    .sort((a, b) => {
      const score = nightScore(state, b) - nightScore(state, a);
      if (Math.abs(score) > 0.0001) return score;
      if (last === a && last !== b) return -1;
      if (last === b && last !== a) return 1;
      const events =
        (session.characterEventCounts[b] || 0) - (session.characterEventCounts[a] || 0);
      if (events !== 0) return events;
      const iv =
        (session.interventionCounts[b] || 0) - (session.interventionCounts[a] || 0);
      if (iv !== 0) return iv;
      if (vote === a && vote !== b) return -1;
      if (vote === b && vote !== a) return 1;
      return 0;
    })[0];
}

function importantFlags(flags = {}) {
  return Object.entries(flags)
    .filter(([, value]) => value)
    .filter(([key]) =>
      /night_partner|unanswered|jealousy_triggered|encounter_|jupiter_|nini_|mars_|meteor_|pepsi_|audience_aware/.test(
        key
      )
    )
    .map(([key, value]) => ({ key, value }));
}

export function nextUnlockHints(state) {
  return EVENTS.filter((event) => event.pool && !event.repeatable)
    .filter((event) => !(state.completedEvents || []).includes(event.id))
    .slice(0, 4)
    .map((event) => event.title);
}

export function buildProgressCard(state) {
  const season = SEASONS[state.currentSeason];
  const derived = computeDerived(state);
  const partnerId = state.currentSession.nightPartner;
  const partner = CHARACTER_BY_ID[partnerId];
  const unresolved = (state.currentSession.unresolvedEventIds || [])
    .map((id) => getEvent(id)?.title || id);
  const interventions = (state.eventHistory || state.history || [])
    .filter((item) => item.kind === "intervention")
    .slice(0, 8)
    .map((item) => item.text);
  const important = (state.eventHistory || [])
    .filter((item) => item.kind === "choice" || item.kind === "event")
    .slice(0, 8)
    .map((item) => item.text);

  return {
    title: "七夕事件進度卡",
    status: "暫時休戰",
    seasonId: state.currentSeason,
    saveId: state.saveId,
    sessionId: state.currentSession.id,
    eventName: season?.title || "可樂海王後宮失火啦",
    chapter: `今晚演到：${getEvent(state.currentEventId)?.title || "現場"}`,
    nightPartnerId: partnerId,
    nightPartner: partner ? `${partner.icon}${partner.name}` : "尚未判定",
    fireIndex: derived.fireIndex,
    loveTemp: derived.loveTemp,
    characters: CHARACTERS.map((c) => ({
      id: c.id,
      name: c.name,
      affection: state.characters[c.id].affection,
      uniqueKey: c.uniquePrimary,
      uniqueLabel: STAT_LABELS[c.uniquePrimary],
      uniqueValue: state.characters[c.id][c.uniquePrimary],
      jealousy: state.characters[c.id].jealousy,
      nightScore: Number(nightScore(state, c.id).toFixed(2)),
    })),
    importantEvents: important,
    unresolved,
    interventionSummary: interventions,
    nextUnlockable: nextUnlockHints(state),
    settledAt: Date.now(),
  };
}

export function settlementView(state) {
  const session = state.currentSession || createSession();
  if (session.status === "settled") {
    return {
      type: "truce",
      status: "settled",
      label: "本次事件狀態：暫時休戰",
      nightPartner: session.nightPartner,
      progressCard: session.progressCard,
      phase: session.phase,
    };
  }
  if (session.status === "paused") {
    return {
      type: "paused",
      status: "paused",
      label: "本次事件已暫停（今晚還沒結束）",
      nightPartner: null,
      progressCard: null,
      phase: session.phase,
    };
  }
  return {
    type: "open",
    status: "active",
    label: "今晚尚未結算",
    nightPartner: null,
    progressCard: null,
    phase: session.phase,
  };
}
