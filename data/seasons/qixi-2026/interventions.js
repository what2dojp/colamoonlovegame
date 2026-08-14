export const SOLO_FLAG_IDS = ["nini", "meteor", "pepsi", "jupiter", "mars"];

export function soloFlag(id) {
  return `solo_active_${id}`;
}

export function activeSoloId(state) {
  return SOLO_FLAG_IDS.find((id) => state.flags?.[soloFlag(id)] === true) || null;
}

const CRISIS_BY_ID = {
  nini: "EVENT_nini_lockbox_01",
  meteor: "EVENT_meteor_never_broke_up_01",
  pepsi: "EVENT_pepsi_identity_01",
  jupiter: "EVENT_jupiter_packing_01",
  mars: "EVENT_mars_too_close_01",
};

const HUB_EVENT_ID = "EVENT_008_office_hub";

function shuraForStage(ids) {
  if (ids.length === 1) {
    if (ids[0] === "meteor") return "EVENT_shura_nini_meteor_01";
    if (ids[0] === "pepsi") return "EVENT_shura_pepsi_meteor_01";
    if (ids[0] === "nini") return "EVENT_shura_nini_meteor_01";
    if (ids[0] === "jupiter") return "EVENT_shura_jupiter_mars_01";
    if (ids[0] === "mars") return "EVENT_shura_jupiter_mars_01";
  }
  if (ids.length === 2) {
    if (ids.includes("nini") && ids.includes("meteor")) return "EVENT_shura_nini_meteor_01";
    if (ids.includes("pepsi") && ids.includes("meteor")) return "EVENT_shura_pepsi_meteor_01";
    if (ids.includes("nini") && ids.includes("pepsi")) return "EVENT_shura_nini_pepsi_01";
    if (ids.includes("jupiter") && ids.includes("mars")) return "EVENT_shura_jupiter_mars_01";
  }
  return null;
}

export function pickForceFollowup(stageCharacters, targetId, flags = {}) {
  const ids = stageCharacters || [];
  const shura = shuraForStage(ids);
  if (shura) return shura;
  if (flags[`crisis_blocked_${targetId}`] === true) return HUB_EVENT_ID;
  return CRISIS_BY_ID[targetId] || "EVENT_nini_lockbox_01";
}

export const INTERVENTIONS = [
  {
    id: "peek",
    name: "偷看命運",
    costKey: "peek",
    eventId: "IV_peek_menu",
    needsTarget: true,
    host: true,
    blurb: "讀取或揭露秘密，或決定誰收到那封信。秘密必須影響後續事件。",
  },
  {
    id: "encounter",
    name: "碰觸命運",
    costKey: "encounter",
    eventId: "IV_encounter",
    needsTarget: true,
    host: true,
    blurb: "製造月月與指定角色的偶遇／獨處。",
  },
  {
    id: "intervene",
    name: "干涉命運",
    costKey: "intervene",
    eventId: "IV_intervene_menu",
    needsTarget: true,
    host: true,
    blurb: "改變正在發生的事件：挑起嫉妒，或破壞正在進行的獨處。",
  },
  {
    id: "force",
    name: "扭轉命運",
    costKey: "force",
    eventId: "IV_force",
    needsTarget: true,
    host: true,
    blurb: "強制改變現場局勢，讓第三人入場或把指定角色推上危機。",
  },
  {
    id: "rewrite",
    name: "改寫命運",
    costKey: "rewrite",
    eventId: "IV_rewrite",
    needsTarget: true,
    host: true,
    blurb: "改寫一條角色劇情線。不是加點。",
  },
  {
    id: "letter",
    name: "傳遞情書",
    costKey: "letter",
    eventId: "IV_letter",
    needsTarget: true,
    host: false,
    blurb: "決定誰收到、誰看到、誰誤會那封信。",
  },
  {
    id: "jealousy",
    name: "挑起嫉妒",
    costKey: "jealousy",
    eventId: "IV_jealousy",
    needsTarget: true,
    host: false,
    blurb: "讓下一張事件真正變成醋意／危機。",
  },
  {
    id: "sabotage",
    name: "破壞獨處",
    costKey: "sabotage",
    eventId: "IV_sabotage",
    needsTarget: true,
    host: false,
    requiresSolo: true,
    blurb: "只能破壞正在發生的獨處。",
  },
  {
    id: "forceEvent",
    name: "扭轉命運",
    costKey: "force",
    eventId: "IV_force",
    needsTarget: true,
    host: false,
    blurb: "強制改變現場局勢。",
  },
  {
    id: "rewriteFate",
    name: "改寫命運",
    costKey: "rewrite",
    eventId: "IV_rewrite",
    needsTarget: true,
    host: false,
    blurb: "改寫一條角色劇情線。",
  },
];
