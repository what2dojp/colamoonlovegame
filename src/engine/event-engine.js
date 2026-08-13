import { CHARACTER_BY_ID } from "../../data/characters.js";
import { EVENT_BY_ID, EVENTS } from "../../data/seasons/qixi-2026/events.js";
import { evalCondition, interpolate, getByPath, setByPath } from "./conditions.js";
import { clampStat } from "./derived.js";
import { pairKey } from "./save.js";

const SECRETS = {
  nini: "日日把臉埋進晶晶裡，小聲說：留下我，就等於喜歡我。",
  meteor: "流星對著舊照片說：我不管現在是誰，最後還是我會走回去。",
  pepsi: "百事寫著：我不需要贏過她們。靈魂會自己走過來。",
  jupiter: "木星的備忘錄只寫：想被選。不會逼她。還是想被選。",
  mars: "火星把未送出的訊息刪掉：我討厭妳。我沒有要喜歡妳。操。",
};

export function interpolateEvent(event, ctx) {
  if (!event) return null;
  return {
    ...event,
    title: interpolate(event.title, ctx),
    description: interpolate(event.description, ctx),
    speaker: interpolate(event.speaker, ctx),
    characters: event.characters || [],
    choices: (event.choices || []).map((choice) => ({
      ...choice,
      label: interpolate(choice.label, ctx),
    })),
  };
}

export function eventContext(state) {
  const target = state.pendingTargetId ? CHARACTER_BY_ID[state.pendingTargetId] : null;
  return {
    ...state,
    target: target
      ? {
          ...target,
          ...state.characters[target.id],
          uniquePrimary: target.uniquePrimary,
        }
      : null,
  };
}

export function isEventAvailable(event, state) {
  if (!event) return false;
  if (event.intervention) return false;
  if (event.hub) return evalCondition(event.conditions, eventContext(state));
  return evalCondition(event.conditions, eventContext(state));
}

export function listAvailableStoryEvents(state) {
  return EVENTS.filter((event) => !event.intervention && !event.hub && isEventAvailable(event, state)).sort(
    (a, b) => (b.priority || 0) - (a.priority || 0)
  );
}

function resolvePath(path, ctx) {
  return interpolate(path, ctx);
}

function applyTension(state, pairValue, op, value) {
  const raw = interpolate(String(pairValue), eventContext(state));
  const parts = raw.split("-").filter(Boolean);
  if (parts.length !== 2 || parts[0] === parts[1]) return;
  const key = pairKey(parts[0], parts[1]);
  if (!state.relationships[key]) {
    state.relationships[key] = { a: parts[0], b: parts[1], tension: 0 };
  }
  const current = state.relationships[key].tension || 0;
  const next = op === "set" ? value : current + value;
  state.relationships[key].tension = clampStat(next);
}

export function applyEffects(state, effects, extraLog = []) {
  const ctx = eventContext(state);
  const logs = [...extraLog];

  for (const effect of effects || []) {
    if (effect.type === "stat") {
      const path = resolvePath(effect.path, ctx);
      const current = getByPath(state, path);
      if (current == null) continue;
      const delta = Number(effect.value) || 0;
      const next = effect.op === "set" ? delta : Number(current) + delta;
      setByPath(state, path, clampStat(next));
    } else if (effect.type === "flag") {
      const key = interpolate(effect.key, ctx);
      state.flags[key] = effect.value;
    } else if (effect.type === "tension") {
      applyTension(state, effect.pair, effect.op, effect.value);
    } else if (effect.type === "fate") {
      const next = effect.op === "set" ? effect.value : state.fate + effect.value;
      state.fate = Math.max(0, Math.round(next));
    } else if (effect.type === "queueEvent") {
      state.queuedEventId = interpolate(effect.eventId, ctx);
    } else if (effect.type === "advanceStory") {
      state.queuedAdvance = true;
    } else if (effect.type === "revealSecret") {
      const id = interpolate(effect.characterId, ctx);
      const character = CHARACTER_BY_ID[id];
      const text = SECRETS[id] || `${character?.name} 的秘密被看見了。`;
      state.flags[`secret_${id}`] = true;
      logs.push(text);
    } else if (effect.type === "log") {
      logs.push(interpolate(effect.text, ctx));
    }
  }

  return logs;
}

export function getEvent(eventId) {
  return EVENT_BY_ID[eventId] || null;
}

export function completeEvent(state, eventId) {
  if (eventId && !state.completedEvents.includes(eventId)) {
    state.completedEvents.push(eventId);
  }
}
