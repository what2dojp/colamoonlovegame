import { CHARACTERS, STAT_LABELS } from "../../data/characters.js";
import { audienceStatus, characterDanger, computeDerived } from "./derived.js";
import { diffVisibleFlags } from "./narration.js";

const INTERNAL_LEAK =
  /\b(?:EVENT_|FLAG_|IV_|scene_|trigger_|core_|fate_rewritten_|crisis_blocked_|solo_active_|weightMods|qixi_\d{4}_|[A-Za-z][\w]*_night_partner)\b/i;

export function playerSafeLogs(logs = []) {
  return logs.filter((line) => typeof line === "string" && line.trim() && !INTERNAL_LEAK.test(line));
}

export function captureStatSnapshot(state) {
  const derived = computeDerived(state);
  return {
    fireIndex: derived.fireIndex,
    dangers: { ...derived.dangers },
    flags: { ...(state.flags || {}) },
    characters: Object.fromEntries(
      CHARACTERS.map((c) => [
        c.id,
        {
          ...state.characters[c.id],
          danger: characterDanger(state, c.id),
        },
      ])
    ),
  };
}

export function diffStatSnapshots(before, after) {
  const rows = [];
  for (const c of CHARACTERS) {
    const prev = before.characters[c.id] || {};
    const next = after.characters[c.id] || {};
    const changes = [];
    const keys = [...new Set([...c.stats, "danger"])];
    for (const key of keys) {
      const from = Number(prev[key]);
      const to = Number(next[key]);
      if (!Number.isFinite(from) || !Number.isFinite(to) || from === to) continue;
      changes.push({
        key,
        label: key === "danger" ? "危險度" : STAT_LABELS[key] || key,
        from,
        to,
      });
    }
    if (changes.length) {
      rows.push({
        id: c.id,
        name: c.name,
        shortName: c.shortName,
        icon: c.icon,
        changes,
      });
    }
  }
  return rows;
}

export function diffStatusNotes(before, after) {
  return diffVisibleFlags(before?.flags, after?.flags);
}

export function captureTonightSnapshot(state) {
  const derived = computeDerived(state);
  return {
    fireIndex: derived.fireIndex,
    dangers: { ...derived.dangers },
    at: Date.now(),
  };
}

export function buildTonightSettlement(state) {
  const opening = state.currentSession?.openingSnapshot || captureTonightSnapshot(state);
  const now = captureTonightSnapshot(state);
  const eventCount = (state.occurredEventIds || []).length;
  return {
    eventCount,
    characters: CHARACTERS.map((c) => {
      const status = audienceStatus(state, c.id);
      return {
        id: c.id,
        name: c.name,
        fullName: c.name,
        shortName: c.shortName,
        icon: c.icon,
        from: opening.dangers[c.id] ?? 0,
        to: now.dangers[c.id] ?? 0,
        affection: state.characters[c.id]?.affection ?? 0,
        statusLabel: status.label,
      };
    }),
    fireFrom: opening.fireIndex,
    fireTo: now.fireIndex,
  };
}
