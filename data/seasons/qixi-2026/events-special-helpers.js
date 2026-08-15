import { skeleton, statEffects, SPEAKERS } from "./events-daily-helpers.js";

export function effectsFromStatsBy(statsBy = {}) {
  return Object.entries(statsBy).flatMap(([characterId, stats]) => statEffects(characterId, stats));
}

export function compileSpecial(spec) {
  const characters = spec.characters || [spec.character];
  const character = spec.character || characters[0];
  const onEnter = [
    ...(spec.flags || []).map((key) => ({ type: "flag", key, value: true })),
    ...(spec.onEnter || []),
  ];
  const soloClear =
    spec.kind === "solo200"
      ? [{ type: "flag", key: `solo_active_${character}`, value: false }]
      : [];
  if (spec.kind === "solo200") {
    onEnter.push({ type: "flag", key: `solo_active_${character}`, value: true });
  }
  const compiled = skeleton({
    id: spec.id,
    title: spec.title,
    description: spec.description,
    characters,
    speaker: spec.speaker || SPEAKERS[character] || "現場",
    weight: spec.weight ?? 16,
    tags: spec.tags,
    resultCopy: spec.resultCopy,
    intervalCopy: spec.intervalCopy,
    conditions: spec.conditions,
    onEnter,
    pool: spec.pool !== false,
    choices: spec.choices.map((choice, index) => ({
      id: choice.id || ["a", "b", "c", "d"][index],
      label: choice.label,
      rewrite: choice.rewrite,
      effects: [
        ...statEffects(character, choice.stats),
        ...effectsFromStatsBy(choice.statsBy),
        ...soloClear,
        ...(choice.effects || []),
        ...(spec.sharedChoiceEffects || []),
      ],
    })),
  });
  if (spec.type) compiled.type = spec.type;
  return compiled;
}

export function compileSpecials(specs) {
  return specs.map(compileSpecial);
}
