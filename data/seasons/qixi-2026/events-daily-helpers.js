import { resolveCharacterStatKey } from "../../characters.js";

export const KIND_META = {
  sweet: { weight: 28, extraTags: ["sweet", "romance", "daily"] },
  nature: { weight: 20, extraTags: ["nature", "romance", "daily"] },
  overstep: { weight: 10, extraTags: ["overstep", "daily"] },
  foreshadow: { weight: 8, extraTags: ["foreshadow", "daily"] },
  solo: { weight: 18, extraTags: ["solo", "romance"] },
};

export const SPEAKERS = {
  nini: "雪碧日日",
  meteor: "沙士流星",
  pepsi: "百事月月",
  jupiter: "芬達木星",
  mars: "西打火星",
};

export function skeleton({
  id,
  title,
  description,
  characters,
  speaker,
  weight,
  tags,
  conditions,
  onEnter,
  choices,
  resultCopy,
  intervalCopy,
  pool = true,
}) {
  return {
    id,
    title,
    description,
    characters,
    speaker,
    pool,
    weight,
    repeatable: false,
    tags,
    conditions,
    onEnter,
    choices,
    resultCopy,
    intervalCopy,
  };
}

export function ordinary(id) {
  return {
    all: [{ flag: "dynamic_pool_unlocked" }, { not: { completed: id } }],
  };
}

export function statEffects(characterId, stats = {}) {
  return Object.entries(stats)
    .filter(([, value]) => Number.isFinite(Number(value)) && Number(value) !== 0)
    .map(([key, value]) => {
      const officialKey = resolveCharacterStatKey(characterId, key);
      if (!officialKey) {
        throw new Error(`invalid daily stat ${characterId}.${key}`);
      }
      return {
        type: "stat",
        path: `characters.${characterId}.${officialKey}`,
        op: "add",
        value: Number(value),
      };
    });
}

export function compileDaily(spec) {
  const meta = KIND_META[spec.kind];
  if (!meta) throw new Error(`unknown daily kind: ${spec.kind}`);
  const onEnter = [
    ...(spec.flags || []).map((key) => ({ type: "flag", key, value: true })),
    ...(spec.onEnter || []),
  ];
  if (spec.kind === "solo") {
    onEnter.push({ type: "flag", key: `solo_active_${spec.character}`, value: true });
  }
  const soloClear =
    spec.kind === "solo" ? [{ type: "flag", key: `solo_active_${spec.character}`, value: false }] : [];
  return skeleton({
    id: spec.id,
    title: spec.title,
    description: spec.description,
    characters: [spec.character],
    speaker: spec.speaker || SPEAKERS[spec.character],
    weight: spec.weight ?? meta.weight,
    tags: spec.tags || [spec.character, ...meta.extraTags],
    resultCopy: spec.resultCopy,
    intervalCopy: spec.intervalCopy,
    conditions: spec.conditions || ordinary(spec.id),
    onEnter,
    choices: spec.choices.map((choice, index) => ({
      id: choice.id || ["a", "b", "c", "d"][index],
      label: choice.label,
      effects: [
        ...statEffects(spec.character, choice.stats),
        ...soloClear,
        ...(choice.effects || []),
        ...(spec.sharedChoiceEffects || []),
      ],
    })),
  });
}

export function compileAll(specs) {
  return specs.map(compileDaily);
}
