/** Extra choice effects. Plot card copy stays untouched; these only add visible tradeoffs. */
function s(id, key, value) {
  return { type: "stat", path: `characters.${id}.${key}`, op: "add", value };
}

export const CHOICE_EXTRAS = {
  "EVENT_mars_chemistry_01:engage": [s("meteor", "pride", 4), s("meteor", "jealousy", 5)],
  "EVENT_mars_chemistry_01:deflect": [s("meteor", "pride", -4), s("meteor", "affection", 3), s("mars", "jealousy", 6)],

  "EVENT_shura_nini_meteor_01:continue": [
    s("nini", "obsession", 6),
    s("nini", "jealousy", 5),
    s("meteor", "destiny", 6),
    s("meteor", "pride", 4),
  ],
  "EVENT_shura_nini_meteor_01:help_nini": [
    s("nini", "affection", 8),
    s("nini", "trust", 5),
    s("meteor", "pride", -6),
    s("meteor", "jealousy", 8),
  ],
  "EVENT_shura_nini_meteor_01:help_meteor": [
    s("meteor", "affection", 8),
    s("meteor", "destiny", 5),
    s("nini", "trust", -6),
    s("nini", "obsession", 6),
  ],
  "EVENT_shura_nini_meteor_01:pull_moon": [
    s("nini", "obsession", 4),
    s("nini", "trust", -4),
    s("meteor", "pride", -4),
    s("meteor", "jealousy", 5),
  ],

  "EVENT_shura_nini_meteor_02:continue": [
    s("nini", "obsession", 6),
    s("nini", "trust", -5),
    s("meteor", "pride", 5),
    s("meteor", "destiny", 4),
  ],
  "EVENT_shura_nini_meteor_02:stop_nini": [
    s("nini", "trust", 4),
    s("nini", "obsession", -5),
    s("meteor", "affection", 5),
    s("meteor", "pride", 3),
  ],
  "EVENT_shura_nini_meteor_02:meteor_nickname": [
    s("meteor", "destiny", 7),
    s("meteor", "nostalgia", 5),
    s("nini", "jealousy", 8),
    s("nini", "trust", -4),
  ],
  "EVENT_shura_nini_meteor_02:forbid_define": [
    s("nini", "obsession", -4),
    s("nini", "trust", -3),
    s("meteor", "pride", -5),
    s("meteor", "destiny", -3),
  ],

  "EVENT_shura_pepsi_meteor_01:continue": [
    s("meteor", "destiny", 5),
    s("meteor", "pride", 4),
    s("pepsi", "similarity", 4),
    s("pepsi", "resonance", 3),
  ],
  "EVENT_shura_pepsi_meteor_01:meteor_ownership": [
    s("meteor", "destiny", 8),
    s("meteor", "pride", 5),
    s("pepsi", "similarity", -4),
    s("pepsi", "affection", -3),
  ],
  "EVENT_shura_pepsi_meteor_01:pepsi_sync": [
    s("pepsi", "resonance", 8),
    s("pepsi", "affection", 6),
    s("meteor", "jealousy", 7),
    s("meteor", "pride", -4),
  ],
  "EVENT_shura_pepsi_meteor_01:interrupt": [
    s("meteor", "pride", -5),
    s("meteor", "destiny", -2),
    s("pepsi", "similarity", 3),
    s("pepsi", "resonance", -2),
  ],

  "EVENT_shura_pepsi_meteor_02:continue": [
    s("meteor", "destiny", 6),
    s("pepsi", "destiny", 6),
    s("meteor", "jealousy", 4),
    s("pepsi", "similarity", 3),
  ],
  "EVENT_shura_pepsi_meteor_02:admit_meteor": [
    s("meteor", "affection", 8),
    s("meteor", "destiny", 8),
    s("pepsi", "resonance", -6),
    s("pepsi", "affection", -4),
  ],
  "EVENT_shura_pepsi_meteor_02:admit_pepsi": [
    s("pepsi", "affection", 8),
    s("pepsi", "resonance", 7),
    s("meteor", "pride", -6),
    s("meteor", "destiny", -4),
  ],
  "EVENT_shura_pepsi_meteor_02:refuse_define": [
    s("meteor", "pride", -4),
    s("meteor", "jealousy", 5),
    s("pepsi", "similarity", 4),
    s("pepsi", "destiny", -3),
  ],

  "EVENT_shura_nini_pepsi_01:continue": [
    s("nini", "obsession", 7),
    s("nini", "trust", -6),
    s("pepsi", "similarity", 3),
    s("pepsi", "resonance", -2),
  ],
  "EVENT_shura_nini_pepsi_01:stop_pepsi": [
    s("pepsi", "similarity", -5),
    s("pepsi", "affection", -3),
    s("nini", "trust", 4),
    s("nini", "obsession", 3),
  ],
  "EVENT_shura_nini_pepsi_01:hear_nini": [
    s("nini", "trust", 6),
    s("nini", "jealousy", -4),
    s("pepsi", "similarity", 5),
    s("pepsi", "affection", 4),
  ],
  "EVENT_shura_nini_pepsi_01:do_nothing": [
    s("nini", "obsession", 5),
    s("nini", "jealousy", 4),
    s("pepsi", "resonance", -3),
    s("pepsi", "similarity", 2),
  ],

  "EVENT_shura_nini_pepsi_02:continue": [
    s("nini", "obsession", 8),
    s("nini", "trust", -5),
    s("pepsi", "resonance", -6),
    s("pepsi", "affection", -3),
  ],
  "EVENT_shura_nini_pepsi_02:crystal_back": [
    s("nini", "trust", 6),
    s("nini", "affection", 5),
    s("pepsi", "similarity", 4),
    s("pepsi", "resonance", 3),
  ],
  "EVENT_shura_nini_pepsi_02:pepsi_back": [
    s("pepsi", "affection", -4),
    s("nini", "obsession", 4),
    s("nini", "trust", 3),
  ],
  "EVENT_shura_nini_pepsi_02:neither": [
    s("nini", "trust", -6),
    s("nini", "affection", -3),
    s("pepsi", "similarity", -4),
    s("pepsi", "affection", -3),
  ],

  "EVENT_shura_jupiter_mars_01:continue": [
    s("jupiter", "hope", -5),
    s("jupiter", "patience", 3),
    s("mars", "provocation", 6),
    s("mars", "chemistry", 4),
  ],
  "EVENT_shura_jupiter_mars_01:help_jupiter": [
    s("jupiter", "affection", 8),
    s("jupiter", "hope", 6),
    s("mars", "provocation", -8),
    s("mars", "pride", -4),
  ],
  "EVENT_shura_jupiter_mars_01:help_mars": [
    s("mars", "chemistry", 6),
    s("mars", "affection", 5),
    s("jupiter", "hope", -8),
    s("jupiter", "patience", -4),
  ],
  "EVENT_shura_jupiter_mars_01:moon_opens": [
    s("jupiter", "hope", 4),
    s("jupiter", "affection", 3),
    s("mars", "provocation", -5),
    s("mars", "pride", -3),
  ],

  "EVENT_shura_jupiter_mars_02:continue": [
    s("jupiter", "hope", -8),
    s("jupiter", "devotion", 3),
    s("mars", "pride", 6),
    s("mars", "provocation", 4),
  ],
  "EVENT_shura_jupiter_mars_02:stop_leave": [
    s("jupiter", "affection", 6),
    s("mars", "pride", -5),
    s("mars", "provocation", -4),
  ],
  "EVENT_shura_jupiter_mars_02:mars_stop": [
    s("mars", "pride", -4),
    s("jupiter", "affection", 8),
    s("jupiter", "hope", 5),
  ],
  "EVENT_shura_jupiter_mars_02:both_stay": [
    s("jupiter", "patience", -5),
    s("jupiter", "jealousy", 6),
    s("mars", "chemistry", 5),
    s("mars", "provocation", 3),
  ],

  "EVENT_shura_nini_jupiter_01:continue": [
    s("nini", "obsession", 6),
    s("nini", "jealousy", 4),
    s("jupiter", "patience", 4),
    s("jupiter", "hope", -5),
  ],
  "EVENT_shura_nini_jupiter_01:help_nini": [
    s("nini", "affection", 8),
    s("nini", "trust", 4),
    s("jupiter", "hope", -6),
    s("jupiter", "devotion", 3),
  ],
  "EVENT_shura_nini_jupiter_01:help_jupiter": [
    s("jupiter", "affection", 8),
    s("jupiter", "hope", 6),
    s("nini", "jealousy", 7),
    s("nini", "trust", -4),
  ],
  "EVENT_shura_nini_jupiter_01:pull_moon": [
    s("nini", "obsession", -4),
    s("nini", "trust", -3),
    s("jupiter", "patience", -4),
    s("jupiter", "hope", 3),
  ],

  "EVENT_shura_nini_mars_01:continue": [
    s("nini", "obsession", 6),
    s("nini", "jealousy", 5),
    s("mars", "provocation", 7),
    s("mars", "pride", 4),
  ],
  "EVENT_shura_nini_mars_01:help_nini": [
    s("nini", "affection", 8),
    s("nini", "dependence", 4),
    s("mars", "provocation", -6),
    s("mars", "pride", -4),
  ],
  "EVENT_shura_nini_mars_01:help_mars": [
    s("mars", "affection", 6),
    s("mars", "chemistry", 5),
    s("nini", "jealousy", 8),
    s("nini", "trust", -5),
  ],
  "EVENT_shura_nini_mars_01:pull_moon": [
    s("nini", "obsession", -3),
    s("nini", "jealousy", -4),
    s("mars", "provocation", -5),
    s("mars", "chemistry", 3),
  ],

  "EVENT_shura_meteor_jupiter_01:continue": [
    s("meteor", "destiny", 6),
    s("meteor", "pride", 4),
    s("jupiter", "patience", 5),
    s("jupiter", "hope", -4),
  ],
  "EVENT_shura_meteor_jupiter_01:help_meteor": [
    s("meteor", "affection", 8),
    s("meteor", "nostalgia", 5),
    s("jupiter", "hope", -6),
    s("jupiter", "devotion", 3),
  ],
  "EVENT_shura_meteor_jupiter_01:help_jupiter": [
    s("jupiter", "affection", 8),
    s("jupiter", "hope", 6),
    s("meteor", "pride", -5),
    s("meteor", "jealousy", 6),
  ],
  "EVENT_shura_meteor_jupiter_01:pull_moon": [
    s("meteor", "destiny", -3),
    s("meteor", "pride", -4),
    s("jupiter", "patience", -3),
    s("jupiter", "affection", 3),
  ],

  "EVENT_shura_meteor_mars_01:continue": [
    s("meteor", "destiny", 5),
    s("meteor", "pride", 6),
    s("mars", "provocation", 6),
    s("mars", "pride", 5),
  ],
  "EVENT_shura_meteor_mars_01:help_meteor": [
    s("meteor", "affection", 8),
    s("meteor", "nostalgia", 5),
    s("mars", "pride", -6),
    s("mars", "provocation", 4),
  ],
  "EVENT_shura_meteor_mars_01:help_mars": [
    s("mars", "affection", 6),
    s("mars", "chemistry", 6),
    s("meteor", "pride", -6),
    s("meteor", "jealousy", 7),
  ],
  "EVENT_shura_meteor_mars_01:pull_moon": [
    s("meteor", "pride", -4),
    s("meteor", "destiny", -3),
    s("mars", "provocation", -5),
    s("mars", "pride", -3),
  ],

  "EVENT_shura_pepsi_jupiter_01:continue": [
    s("pepsi", "resonance", 5),
    s("pepsi", "similarity", 4),
    s("jupiter", "devotion", 5),
    s("jupiter", "hope", -5),
  ],
  "EVENT_shura_pepsi_jupiter_01:help_pepsi": [
    s("pepsi", "affection", 8),
    s("pepsi", "resonance", 6),
    s("jupiter", "hope", -6),
    s("jupiter", "patience", 3),
  ],
  "EVENT_shura_pepsi_jupiter_01:help_jupiter": [
    s("jupiter", "affection", 8),
    s("jupiter", "hope", 7),
    s("pepsi", "similarity", -4),
    s("pepsi", "destiny", -3),
  ],
  "EVENT_shura_pepsi_jupiter_01:pull_moon": [
    s("pepsi", "resonance", -3),
    s("pepsi", "similarity", 3),
    s("jupiter", "patience", -4),
    s("jupiter", "devotion", 3),
  ],

  "EVENT_shura_pepsi_mars_01:continue": [
    s("pepsi", "resonance", 4),
    s("pepsi", "destiny", 5),
    s("mars", "provocation", 7),
    s("mars", "chemistry", 5),
  ],
  "EVENT_shura_pepsi_mars_01:help_pepsi": [
    s("pepsi", "affection", 8),
    s("pepsi", "similarity", 5),
    s("mars", "pride", -5),
    s("mars", "provocation", -4),
  ],
  "EVENT_shura_pepsi_mars_01:help_mars": [
    s("mars", "affection", 6),
    s("mars", "chemistry", 6),
    s("pepsi", "similarity", -5),
    s("pepsi", "destiny", -4),
  ],
  "EVENT_shura_pepsi_mars_01:pull_moon": [
    s("pepsi", "resonance", -3),
    s("pepsi", "destiny", -3),
    s("mars", "provocation", -6),
    s("mars", "pride", -3),
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

  "EVENT_nini_sweet_01:tease": [s("nini", "obsession", -3)],
  "EVENT_nini_nature_01:play": [s("nini", "dependence", -2)],
  "EVENT_nini_overstep_01:ask": [s("nini", "obsession", -4), s("nini", "trust", 2)],
  "EVENT_nini_foreshadow_01:drop": [s("nini", "trust", -3)],
  "EVENT_meteor_sweet_01:detail": [s("meteor", "pride", -3)],
  "EVENT_meteor_nature_01:now": [s("meteor", "destiny", -4)],
  "EVENT_meteor_overstep_01:ask": [s("meteor", "destiny", -3), s("meteor", "affection", 2)],
  "EVENT_meteor_foreshadow_01:hold": [s("meteor", "pride", -2)],
  "EVENT_pepsi_sweet_01:order": [s("pepsi", "similarity", -3)],
  "EVENT_pepsi_nature_01:private": [s("pepsi", "destiny", -2)],
  "EVENT_pepsi_overstep_01:correct": [s("pepsi", "resonance", -4), s("pepsi", "affection", 3)],
  "EVENT_pepsi_foreshadow_01:laugh": [s("pepsi", "similarity", -3)],
  "EVENT_jupiter_sweet_01:keep": [s("jupiter", "hope", -3)],
  "EVENT_jupiter_nature_01:see": [s("jupiter", "patience", -4)],
  "EVENT_jupiter_overstep_01:ask": [s("jupiter", "devotion", -3), s("jupiter", "hope", 2)],
  "EVENT_jupiter_foreshadow_01:stop": [s("jupiter", "patience", -5)],
  "EVENT_mars_sweet_01:closer": [s("mars", "provocation", -4)],
  "EVENT_mars_nature_01:win": [s("mars", "provocation", -5)],
  "EVENT_mars_overstep_01:play": [s("mars", "pride", -3), s("mars", "affection", 3)],
  "EVENT_mars_foreshadow_01:tease": [s("mars", "chemistry", -4)],

  "EVENT_nini_solo_01:leave": [s("nini", "affection", -4), s("nini", "obsession", 3)],
  "EVENT_meteor_solo_01:leave": [s("meteor", "affection", -4), s("meteor", "pride", 3)],
  "EVENT_pepsi_solo_01:leave": [s("pepsi", "affection", -4), s("pepsi", "resonance", -3)],
  "EVENT_mars_solo_01:leave": [s("mars", "affection", -3), s("mars", "provocation", 5)],
  "EVENT_jupiter_quiet_date:leave": [s("jupiter", "hope", -6), s("jupiter", "affection", -3)],
};

export function extraChoiceEffects(eventId, choiceId) {
  if (!eventId || !choiceId) return [];
  return CHOICE_EXTRAS[`${eventId}:${choiceId}`] || [];
}
