export const FATE_COPY = {
  peek: { cost: 100, title: "偷看命運", tag: "看見不該知道的事" },
  encounter: { cost: 200, title: "碰觸命運", tag: "讓某人靠近可樂月月" },
  intervene: { cost: 300, title: "干涉命運", tag: "把可樂月月支開，搶走鏡頭" },
  force: { cost: 500, title: "扭轉命運", tag: "把人叫進來，炸成修羅場" },
  rewrite: { cost: 1000, title: "改寫命運", tag: "重新洗牌一人的命運" },
};

const FIRE_COPY = {
  low: { label: "平靜", line: "現場還穩。" },
  mid: { label: "升溫", line: "開始有一點熱。" },
  high: { label: "不妙", line: "好像開始不妙了。" },
  extreme: { label: "失火", line: "後宮真的在燒。" },
};

export function fireMoodLabel(score) {
  const n = Number(score) || 0;
  if (n >= 90) return "後宮危險警報";
  if (n >= 55) return "場面開始失控";
  if (n >= 40) return "火藥味出現了";
  if (n >= 25) return "開始有點熱";
  if (n >= 10) return "氣氛微妙";
  return "風平浪靜";
}

export function fireCopy(level, score) {
  const mood = score == null ? "" : fireMoodLabel(score);
  const base = FIRE_COPY[level] || FIRE_COPY.low;
  return mood ? { ...base, line: mood, mood } : base;
}

export function eventPresentation(event) {
  const tags = event?.tags || [];
  const id = event?.id || "";
  if (event?.final) return { kind: "final", label: "今晚結算", tone: "special" };
  if (event?.intervention || tags.includes("intervention")) {
    return { kind: "fate", label: "✦ 命運", tone: "special" };
  }
  if (tags.includes("shura") || id.includes("shura")) {
    return { kind: "shura", label: "⚔ 修羅場", tone: "shura" };
  }
  if (tags.includes("crisis") || /lockbox|never_broke|identity|packing|too_close|hope_low|dependence/.test(id)) {
    return { kind: "crisis", label: "🔥 危機", tone: "crisis" };
  }
  if (tags.includes("memory")) return { kind: "memory", label: "📖 回憶", tone: "special" };
  if (tags.includes("letter")) return { kind: "letter", label: "✉ 情書", tone: "special" };
  if (tags.includes("solo") || tags.includes("date")) return { kind: "solo", label: "🌙 獨處", tone: "solo" };
  if (tags.includes("overstep")) return { kind: "overstep", label: "⚠ 越界", tone: "warn" };
  if (tags.includes("foreshadow")) return { kind: "foreshadow", label: "", tone: "quiet" };
  if (tags.includes("nature")) return { kind: "nature", label: "✦ 性格", tone: "nature" };
  if (tags.includes("sweet")) return { kind: "sweet", label: "💗 甜蜜", tone: "sweet" };
  if (tags.includes("romance")) return { kind: "sweet", label: "💗 甜蜜", tone: "sweet" };
  if (event?.hub || tags.includes("hub") || tags.includes("observation")) {
    return { kind: "hub", label: "📍 現場", tone: "hub" };
  }
  if (tags.includes("intro") || tags.includes("prologue")) return { kind: "intro", label: "開場", tone: "calm" };
  return { kind: "daily", label: "日常", tone: "calm" };
}

export function eventCastLabel(event, charactersView) {
  const ids = event?.characters || [];
  if (!ids.length || ids.length >= 4 || event?.hub) return event?.speaker || "現場";
  const names = ids
    .map((id) => charactersView.find((c) => c.id === id)?.name)
    .filter(Boolean);
  return names.join(" × ") || event?.speaker || "現場";
}

export function colaMoonText(value) {
  return String(value || "")
    .replace(/可樂月月/g, "\u0000COLA\u0000")
    .replace(/百事月月/g, "\u0000PEPSI\u0000")
    .replace(/月月/g, "可樂月月")
    .replace(/\u0000COLA\u0000/g, "可樂月月")
    .replace(/\u0000PEPSI\u0000/g, "百事月月");
}

export function audienceText(value) {
  return colaMoonText(value)
    .replace(/\b(?:EVENT|FLAG|IV|scene|trigger|core|node)_[A-Za-z0-9_]+\b/g, "")
    .replace(/\bqixi_\d{4}_[A-Za-z0-9_]+\b/gi, "")
    .replace(/\b[A-Za-z][\w]*_night_partner\b/gi, "")
    .replace(/\b(?:solo_active|date_broken|public_jealous|fate_rewritten|crisis_blocked|forced|secret|encounter|letter_to|letter_misread_by|jealousy_triggered)_[A-Za-z0-9_]+\b/g, "")
    .replace(/\b(?:nini|meteor|pepsi|jupiter|mars)\b/g, "")
    .replace(/\s*=\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
