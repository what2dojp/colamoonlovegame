/** Extra choice effects. Plot card copy stays untouched; these only add visible tradeoffs. */
function s(id, key, value) {
  return { type: "stat", path: `characters.${id}.${key}`, op: "add", value };
}

export const CHOICE_EXTRAS = {
  "EVENT_mars_chemistry_01:engage": [s("meteor", "pride", 4), s("meteor", "jealousy", 5)],
  "EVENT_mars_chemistry_01:deflect": [s("meteor", "pride", -4), s("meteor", "affection", 3), s("mars", "jealousy", 6)],

  "SHURA_nini_meteor_02:continue": [
    s("nini", "obsession", 6),
    s("nini", "trust", -5),
    s("meteor", "pride", 5),
    s("meteor", "destiny", 4),
  ],
  "SHURA_nini_meteor_02:stop_nini": [
    s("nini", "trust", 4),
    s("nini", "obsession", -5),
    s("meteor", "affection", 5),
    s("meteor", "pride", 3),
  ],
  "SHURA_nini_meteor_02:meteor_nickname": [
    s("meteor", "destiny", 7),
    s("meteor", "nostalgia", 5),
    s("nini", "jealousy", 8),
    s("nini", "trust", -4),
  ],
  "SHURA_nini_meteor_02:forbid_define": [
    s("nini", "obsession", -4),
    s("nini", "trust", -3),
    s("meteor", "pride", -5),
    s("meteor", "destiny", -3),
  ],

  "SHURA_meteor_pepsi_02:continue": [
    s("meteor", "destiny", 6),
    s("pepsi", "destiny", 6),
    s("meteor", "jealousy", 4),
    s("pepsi", "similarity", 3),
  ],
  "SHURA_meteor_pepsi_02:admit_meteor": [
    s("meteor", "affection", 8),
    s("meteor", "destiny", 8),
    s("pepsi", "resonance", -6),
    s("pepsi", "affection", -4),
  ],
  "SHURA_meteor_pepsi_02:admit_pepsi": [
    s("pepsi", "affection", 8),
    s("pepsi", "resonance", 7),
    s("meteor", "pride", -6),
    s("meteor", "destiny", -4),
  ],
  "SHURA_meteor_pepsi_02:refuse_define": [
    s("meteor", "pride", -4),
    s("meteor", "jealousy", 5),
    s("pepsi", "similarity", 4),
    s("pepsi", "destiny", -3),
  ],

  "SHURA_nini_pepsi_02:continue": [
    s("nini", "obsession", 8),
    s("nini", "trust", -5),
    s("pepsi", "resonance", -6),
    s("pepsi", "affection", -3),
  ],
  "SHURA_nini_pepsi_02:crystal_back": [
    s("nini", "trust", 6),
    s("nini", "affection", 5),
    s("pepsi", "similarity", 4),
    s("pepsi", "resonance", 3),
  ],
  "SHURA_nini_pepsi_02:pepsi_back": [
    s("pepsi", "affection", -4),
    s("nini", "obsession", 4),
    s("nini", "trust", 3),
  ],
  "SHURA_nini_pepsi_02:neither": [
    s("nini", "trust", -6),
    s("nini", "affection", -3),
    s("pepsi", "similarity", -4),
    s("pepsi", "affection", -3),
  ],

  "IV_encounter:stay": [
    s("{{target.id}}", "affection", 8),
    s("{{target.id}}", "{{target.uniquePrimary}}", 5),
  ],
  "IV_encounter:unlocked": [
    s("{{target.id}}", "affection", 5),
    s("{{target.id}}", "{{target.uniquePrimary}}", 3),
  ],

  "IV_sabotage:break": [
    s("{{target.id}}", "affection", -6),
    s("{{target.id}}", "{{target.uniquePrimary}}", 8),
    s("{{target.rivalId}}", "jealousy", 6),
  ],
  "IV_sabotage:almost": [
    s("{{target.id}}", "affection", -3),
    s("{{target.id}}", "{{target.uniquePrimary}}", 4),
    s("{{target.rivalId}}", "jealousy", 8),
  ],

  "IV_jealousy:burn": [s("{{target.rivalId}}", "jealousy", 5)],
};

export function extraChoiceEffects(eventId, choiceId) {
  if (!eventId || !choiceId) return [];
  return CHOICE_EXTRAS[`${eventId}:${choiceId}`] || [];
}
