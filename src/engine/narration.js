import { CHARACTERS, CHARACTER_BY_ID, STAT_LABELS } from "../../data/characters.js";

const DEFAULT_INTERVAL =
  "✦ **目前看起來還算平靜，只是每個人的心思似乎都有所改變。**";

function characterName(id) {
  return CHARACTER_BY_ID[id]?.name || "";
}

function shortName(id) {
  return CHARACTER_BY_ID[id]?.shortName || characterName(id);
}

function flagOn(flags, key) {
  return flags?.[key] === true;
}

export function diffVisibleFlags(before = {}, after = {}) {
  const notes = [];
  for (const c of CHARACTERS) {
    const name = c.name;
    if (!flagOn(before, `solo_active_${c.id}`) && flagOn(after, `solo_active_${c.id}`)) {
      notes.push({ kind: "solo-on", id: c.id, text: `🌙 ${name} × 可樂月月　獨處成立` });
    }
    if (flagOn(before, `solo_active_${c.id}`) && !flagOn(after, `solo_active_${c.id}`)) {
      notes.push({ kind: "solo-off", id: c.id, text: `🌙 ${name} 的獨處狀態 → 解除` });
    }
    if (!flagOn(before, `date_broken_${c.id}`) && flagOn(after, `date_broken_${c.id}`)) {
      notes.push({ kind: "broken", id: c.id, text: `原本的兩人時間被打斷了。現場重新恢復多人狀態。` });
    }
    if (!flagOn(before, `public_jealous_${c.id}`) && flagOn(after, `public_jealous_${c.id}`)) {
      notes.push({ kind: "crisis", id: c.id, text: `⚠️ ${name} 的危機被當眾掀開` });
    }
  }
  if (!flagOn(before, "moon_opened_the_door") && flagOn(after, "moon_opened_the_door")) {
    notes.push({ kind: "shura", text: "可樂月月自己開了門。修羅場還沒結束。" });
  }
  return notes;
}

export function classifyResultKind(event) {
  const tags = event?.tags || [];
  const id = event?.id || "";
  if (id === "IV_force" || tags.includes("force")) return "force";
  if (id === "IV_encounter" || tags.includes("encounter")) return "encounter";
  if (id === "IV_sabotage" || tags.includes("sabotage")) return "sabotage";
  if (id === "IV_intervene_menu" || id === "IV_jealousy" || tags.includes("intervene") || tags.includes("jealousy")) {
    return "intervene";
  }
  if (
    id === "IV_peek_menu" ||
    id === "IV_peek" ||
    id === "IV_letter" ||
    tags.includes("peek") ||
    tags.includes("letter") ||
    tags.includes("memory")
  ) {
    return "peek";
  }
  return "stats";
}

export function peekRevealKind(event) {
  const tags = event?.tags || [];
  if (tags.includes("memory")) return "回憶";
  if (tags.includes("letter")) return "情書";
  if (tags.includes("peek") || tags.includes("secret")) return "秘密";
  return "特殊命運";
}

function biggestStatChange(statChanges = []) {
  let best = null;
  let bestAbs = 0;
  for (const row of statChanges) {
    for (const change of row.changes || []) {
      const delta = Number(change.to) - Number(change.from);
      if (!Number.isFinite(delta) || delta === 0) continue;
      if (Math.abs(delta) >= bestAbs) {
        bestAbs = Math.abs(delta);
        best = { ...change, id: row.id, name: row.name, shortName: row.shortName, delta };
      }
    }
  }
  return best;
}

export function buildIntervalCopy({
  kind,
  statChanges = [],
  statusNotes = [],
  characterId,
  name,
  interruptingName,
  originalSoloName,
  joiningName,
} = {}) {
  const who = name || characterName(characterId) || shortName(characterId);
  const nick = shortName(characterId) || who.replace(/^[^\u4e00-\u9fff]+/, "") || who;

  if (kind === "rewrite") {
    return `✦✦✦ **${who || "她"} 的狀態已經完全不同了。今晚的走向，被神使重新洗過牌。**`;
  }
  if (kind === "encounter") {
    return `🌙 **${who || "她"} 與可樂月月的兩人時間開始了。其他人暫時被留在場外。**`;
  }
  if (kind === "sabotage" || statusNotes.some((note) => note.kind === "broken" || note.kind === "solo-off")) {
    const actor = interruptingName || who;
    return `原本正在進行的兩人時間……**被${actor || "第三人"}打斷了。**下一張鏡頭被她搶走。`;
  }
  if (kind === "force") {
    const hostName = originalSoloName || who;
    const joinName = joiningName || "";
    if (hostName && joinName) {
      return `**歡迎來到戀愛修羅場**\n\n此時，可樂月月、${hostName}、${joinName}，場面僵持。`;
    }
    return `✦ **主播介入了剛才的局勢。現場已經不是原本的樣子。**`;
  }
  if (kind === "intervene") {
    return `✦ **特殊命運介入了現場。有人的心思，被硬生生推了一把。**`;
  }
  if (kind === "peek") {
    return `這段不該被現場看見的東西，被重新看見了。`;
  }
  if (kind === "companion") {
    return who ? `🌙 可樂月月今晚決定和 **${who}** 一起度過七夕夜。` : DEFAULT_INTERVAL;
  }

  const dangerUp = (statChanges || [])
    .flatMap((row) => (row.changes || []).map((change) => ({ ...change, name: row.name, id: row.id })))
    .filter((change) => change.key === "danger" && change.to > change.from)
    .sort((a, b) => b.to - b.from - (a.to - a.from))[0];
  if (dangerUp && dangerUp.to - dangerUp.from >= 8) {
    return `🔥 **場面的氣氛明顯變了。有人開始不只是想陪在可樂月月身邊。**`;
  }
  if (dangerUp) {
    return `⚠️ **${dangerUp.name || nick} 的危險度上升了。請可樂月月注意她接下來的動向。**`;
  }

  const affectionUp = (statChanges || [])
    .flatMap((row) => (row.changes || []).map((change) => ({ ...change, name: row.name })))
    .find((change) => change.key === "affection" && change.to > change.from);
  if (affectionUp) {
    return `✦ **兩人的距離又近了一點。可樂月月似乎也沒有抗拒。**`;
  }

  const obsessionUp = (statChanges || [])
    .flatMap((row) => (row.changes || []).map((change) => ({ ...change, name: row.name })))
    .find((change) => (change.key === "obsession" || change.label === "執著") && change.to > change.from);
  if (obsessionUp) {
    return `⚠️ **${obsessionUp.name || "她"} 似乎更加認真了。這份心意，已經不是隨口說說而已。**`;
  }

  const best = biggestStatChange(statChanges);
  if (best && best.delta > 0 && /嫉妒/.test(best.label || "")) {
    return `⚠️ **醋意正在現場蔓延。有人開始無法假裝沒看見。**`;
  }
  if (best && best.delta > 0 && /依賴/.test(best.label || "")) {
    return `✦ **有人更不想離開可樂月月了。這份依賴，比剛才更明顯。**`;
  }
  if (statusNotes.length) return statusNotes[0].text;
  if (best) return `✦ **剛才這個選擇，讓現場的空氣悄悄偏了一點。**`;
  return DEFAULT_INTERVAL;
}

export function overlayTitleForKind(kind) {
  switch (kind) {
    case "rewrite":
      return "改寫命運";
    case "force":
      return "局勢變化";
    case "encounter":
      return "獨處成立";
    case "sabotage":
    case "intervene":
      return "特殊命運介入";
    case "peek":
      return "特殊命運";
    case "companion":
      return "今晚的選擇";
    case "nightHold":
      return "今晚結算";
    default:
      return "狀態變化";
  }
}

export function rewriteLines(character, beforeStats = {}, afterStats = {}, beforeDanger, afterDanger) {
  const def = typeof character === "string" ? CHARACTER_BY_ID[character] : character;
  if (!def) return [];
  const lines = def.stats.map((key) => ({
    key,
    label: STAT_LABELS[key] || key,
    from: Number(beforeStats[key]) || 0,
    to: Number(afterStats[key]) || 0,
  }));
  lines.push({
    key: "danger",
    label: "危險度",
    from: Number(beforeDanger) || 0,
    to: Number(afterDanger) || 0,
  });
  return lines;
}

export { STAT_LABELS };
