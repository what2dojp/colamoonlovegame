import { createGame } from "../src/engine/game.js";
import { GAME_CONFIG } from "../src/config/game.config.js";
import { CHARACTERS, CHARACTER_BY_ID } from "../data/characters.js";
import { EVENTS } from "../data/seasons/qixi-2026/events.js";
import { pickForceFollowup } from "../data/seasons/qixi-2026/interventions.js";

const IDS = CHARACTERS.map((c) => c.id);
const SOLO_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c.soloEventId]));
const CRISIS_BY_ID = {
  nini: "EVENT_nini_lockbox_01",
  meteor: "EVENT_meteor_never_broke_up_01",
  pepsi: "EVENT_pepsi_identity_01",
  jupiter: "EVENT_jupiter_packing_01",
  mars: "EVENT_mars_too_close_01",
};
const rows = [];
const gaps = [];
let flagReport = { notableUnread: [], skeletonCount: 0 };

function playIntro(game) {
  game.choose("listen");
  game.choose("open");
  game.choose("tease");
  game.choose("understood");
  game.choose("receive");
  game.choose("fight");
  game.choose("observe");
}

function fresh() {
  const game = createGame({ persist: false, rng: () => 0 });
  playIntro(game);
  return game;
}

function inPool(game, eventId) {
  return Boolean(game.getState().pool.find((item) => item.id === eventId));
}

function must(cond, message) {
  if (!cond) throw new Error(message);
}

function gap(permission, title, actual, suggestion) {
  gaps.push({ permission, title, actual, suggestion });
}

function addRow(row) {
  rows.push(row);
}

function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  visit(node);
  if (Array.isArray(node)) {
    for (const item of node) walk(item, visit);
    return;
  }
  for (const value of Object.values(node)) walk(value, visit);
}

function expandFlag(key) {
  if (!key || typeof key !== "string") return [];
  if (!key.includes("{{")) return [key];
  const out = [];
  for (const id of IDS) {
    const rival = CHARACTER_BY_ID[id].rivalId;
    out.push(
      key
        .replaceAll("{{target.id}}", id)
        .replaceAll("{{target.rivalId}}", rival)
        .replaceAll(`{{target.id}}`, id)
    );
  }
  return [...new Set(out)];
}

function auditFlags() {
  const written = new Set();
  const read = new Set();
  walk(EVENTS, (node) => {
    if (node.type === "flag" && node.key) {
      for (const key of expandFlag(node.key)) written.add(key);
    }
    if (node.type === "revealSecret") {
      for (const id of IDS) written.add(`secret_${id}`);
    }
    if (typeof node.flag === "string") {
      for (const key of expandFlag(node.flag)) read.add(key);
    }
  });
  return { written, read };
}

function peekLetter(targetId, choiceId) {
  const game = fresh();
  const fate = game.getState().fate;
  const affection = game.getState().characters[targetId].affection;
  must(game.intervene("peek", targetId).ok, "peek should open");
  must(game.getState().currentEvent.id === "IV_peek_menu", "100 host button opens peek menu");
  must(game.choose("letter").ok, "peek letter branch");
  must(game.getState().currentEvent.id === "IV_letter", "letter sub-event");
  must(game.choose(choiceId).ok, `letter ${choiceId}`);
  must(game.getState().fate === fate, "peek does not deduct fate");
  return { game, affectionBefore: affection };
}

function peekSecret(targetId, choiceId) {
  const game = fresh();
  must(game.intervene("peek", targetId).ok, "peek should open");
  must(game.choose("secret").ok, "peek secret branch");
  must(game.getState().currentEvent.id === "IV_peek", "secret sub-event");
  must(game.getState().flags[`secret_${targetId}`] === true, `secret_${targetId} written on enter`);
  const crisis = CRISIS_BY_ID[targetId];
  const weightBeforeChoose = game.getState().currentSession.weightMods[crisis] || 0;
  must(weightBeforeChoose > 0, `secret keep-path already raises ${crisis} on enter`);
  must(game.choose(choiceId).ok, `secret ${choiceId}`);
  return game;
}

// ---------------------------------------------------------------------------
// 100 偷看命運
// ---------------------------------------------------------------------------
{
  const privateLetter = peekLetter("nini", "private");
  must(privateLetter.game.getState().flags.letter_to_nini, "letter_to_nini written");
  must(privateLetter.game.getState().currentEvent.id === "EVENT_letter_nini", "private letter forceEvents letter follow-up");
  must(
    privateLetter.game.getState().characters.nini.affection === privateLetter.affectionBefore,
    "private letter does not add affection"
  );

  const seen = peekLetter("nini", "seen");
  must(seen.game.getState().flags.letter_to_nini, "letter_to_nini written on seen");
  must(seen.game.getState().flags.letter_seen_by_moon, "letter_seen_by_moon written");
  must(seen.game.getState().currentEvent.id === "EVENT_letter_moon_saw", "seen letter forceEvents moon-saw follow-up");
  must(
    seen.game.getState().currentEvent.id !== privateLetter.game.getState().currentEvent.id,
    "100 private and 100 seen land on different next events"
  );

  const misread = peekLetter("nini", "misread");
  must(misread.game.getState().flags.letter_misread_by_meteor, "letter_misread_by_meteor written");
  must(misread.game.getState().currentEvent.id === "EVENT_shura_nini_meteor_01", "misread forceEvents shura");

  const pepsiMisread = peekLetter("pepsi", "misread");
  must(pepsiMisread.game.getState().currentEvent.id === "EVENT_shura_pepsi_meteor_01", "pepsi misread forceEvents pepsi-meteor shura");

  for (const id of IDS) {
    const keep = peekSecret(id, "keep");
    must(keep.getState().flags[`secret_${id}`], `secret_${id} kept`);
    must(
      keep.getState().currentEvent.id !== CRISIS_BY_ID[id],
      `${id} keep does not force crisis`
    );
    must((keep.getState().currentSession.weightMods[CRISIS_BY_ID[id]] || 0) > 0, `${id} keep raises crisis weight`);

    const leak = peekSecret(id, "leak");
    must(leak.getState().currentEvent.id === CRISIS_BY_ID[id], `${id} leak forceEvents crisis`);
    must(leak.getState().flags[`public_jealous_${id}`], `${id} leak writes public_jealous`);
  }

  const { written, read } = auditFlags();
  for (const id of IDS) {
    must(read.has(`secret_${id}`), `secret_${id} must be read by a later event`);
    must(read.has(`letter_to_${id}`), `letter_to_${id} must be read`);
  }
  must(read.has("letter_seen_by_moon"), "letter_seen_by_moon is read by EVENT_letter_moon_saw");
  must(!read.has("letter_misread_by_pepsi"), "dead letter_misread_by_pepsi condition removed");

  for (const id of IDS) {
    const mem = fresh();
    must(mem.intervene("peek", id).ok, `peek memory ${id}`);
    must(mem.getState().currentEvent.id === "IV_peek_menu", "100 opens peek menu");
    must(mem.choose("memory").ok, "memory branch");
    must(mem.getState().flags[`memory_unlocked_${id}`], `memory_unlocked_${id}`);
    must(mem.getState().currentEvent.id === `EVENT_memory_${id}`, `100 memory forceEvents EVENT_memory_${id}`);
    must(!String(mem.getState().currentEvent.id).includes("shura"), `${id} memory is not shura`);
  }

  addRow({
    cost: 100,
    name: "偷看命運",
    effect: "private→情書後續；seen→月月看見；misread→修羅場；回憶→EVENT_memory_*；秘密未公開加權重，公開 force 危機",
    next: "是（三路下一張都不同）",
    later: "是（letter_to_*、letter_seen_by_moon、secret_* 被後續讀取）",
    fake: "無",
    invalid: "無",
    result: "通過",
  });
}

// ---------------------------------------------------------------------------
// 200 碰觸命運
// ---------------------------------------------------------------------------
{
  for (const id of IDS) {
    const game = fresh();
    const fate = game.getState().fate;
    must(game.intervene("encounter", id).ok, `encounter ${id}`);
    must(game.getState().currentEvent.id === "IV_encounter", "200 opens encounter");
    must((game.getState().currentSession.weightMods[SOLO_BY_ID[id]] || 0) > 0, `${id} encounter raises own solo`);
    if (id !== "jupiter") {
      must(!game.getState().currentSession.weightMods.EVENT_jupiter_quiet_date, `${id} encounter does not raise jupiter date`);
    }
    must(game.choose("stay").ok, "stay");
    must(game.getState().fate === fate, "encounter does not deduct fate");
    must(game.getState().currentEvent.id === SOLO_BY_ID[id], `${id} stay forceEvents own solo`);
    must(game.getState().flags[`solo_active_${id}`] === true, `solo_active_${id} written`);
    must(game.getState().soloActive === id, "soloActive points at the live solo");
    const stayChoice = game.getState().currentEvent.choices[0].id;
    game.choose(stayChoice);
    must(game.getState().flags[`solo_active_${id}`] !== true, `solo_active_${id} cleared after solo choice`);
  }

  const hubClear = fresh();
  hubClear.intervene("encounter", "mars");
  hubClear.choose("stay");
  must(hubClear.getState().flags.solo_active_mars === true, "mars solo active");
  hubClear.startEvent("EVENT_008_office_hub", { force: true });
  must(hubClear.getState().flags.solo_active_mars !== true, "hub onEnter clears solo_active");

  const noSolo = fresh();
  const denied = noSolo.intervene("sabotage", "nini", { force: true });
  must(denied.ok === false, "sabotage refused without solo");
  must(!noSolo.getState().flags.date_broken_nini, "no fake date_broken without solo");

  const unlocked = fresh();
  unlocked.intervene("encounter", "nini");
  unlocked.choose("unlocked");
  must(unlocked.getState().currentEvent.id === "EVENT_nini_solo_01", "200 second choice still creates nini solo");
  must(unlocked.getState().flags.solo_active_nini, "200 second choice writes solo_active");
  must(unlocked.getState().currentEvent.id !== "EVENT_shura_nini_meteor_01", "200 never jumps to shura");

  addRow({
    cost: 200,
    name: "碰觸命運",
    effect: "五人各自 force 自己的獨處，並寫 solo_active_{id}；Hub 會清旗標",
    next: "是（兩個選項都進對應 solo）",
    later: "是（獨處可被 300 破壞）",
    fake: "無獨處時 sabotage 不會產生假效果",
    invalid: "無",
    result: "通過",
  });
}

// ---------------------------------------------------------------------------
// 300 干涉命運
// ---------------------------------------------------------------------------
{
  const expectedSpark = {
    nini: "EVENT_nini_jealousy_01",
    meteor: "EVENT_meteor_jealousy_01",
    pepsi: "EVENT_pepsi_jealousy_01",
    jupiter: "EVENT_jupiter_jealousy_01",
    mars: "EVENT_mars_jealousy_01",
  };
  const expectedBurn = {
    nini: "EVENT_nini_lockbox_01",
    meteor: "EVENT_meteor_never_broke_up_01",
    pepsi: "EVENT_pepsi_identity_01",
    jupiter: "EVENT_jupiter_packing_01",
    mars: "EVENT_mars_too_close_01",
  };

  for (const id of IDS) {
    const game = fresh();
    const fate = game.getState().fate;
    const affection = game.getState().characters[id].affection;
    must(game.intervene("intervene", id).ok, `intervene ${id}`);
    must(game.getState().currentEvent.id === "IV_intervene_menu", "300 host button opens intervene menu");
    must(game.choose("jealousy").ok, "jealousy branch");
    must(game.getState().currentEvent.id === "IV_jealousy", "jealousy event");
    must(game.getState().flags[`jealousy_triggered_${id}`], `jealousy_triggered_${id}`);
    must(game.choose("burn").ok, "burn");
    must(game.getState().fate === fate, "300 does not deduct fate");
    must(game.getState().currentEvent.id === expectedBurn[id], `${id} burn forceEvents ${expectedBurn[id]}`);
    must(game.getState().flags[`public_jealous_${id}`], `public_jealous_${id}`);
    must(game.getState().characters[id].affection === affection, `${id} burn is not an affection bump`);
  }

  for (const id of IDS) {
    const spark = fresh();
    spark.intervene("intervene", id);
    spark.choose("jealousy");
    const sparkAffection = spark.getState().characters[id].affection;
    spark.choose("spark");
    must(spark.getState().currentEvent.id === expectedSpark[id], `${id} spark forceEvents ${expectedSpark[id]}`);
    must(spark.getState().currentEvent.id !== expectedBurn[id], `${id} spark and burn land on different events`);
    must(spark.getState().characters[id].affection === sparkAffection, `${id} spark is not affection +3`);
  }

  const sabotageMap = {
    nini: "EVENT_nini_lockbox_01",
    meteor: "EVENT_meteor_never_broke_up_01",
    pepsi: "EVENT_pepsi_identity_01",
    jupiter: "EVENT_jupiter_packing_01",
    mars: "EVENT_mars_too_close_01",
  };
  for (const [id, crisis] of Object.entries(sabotageMap)) {
    const game = fresh();
    game.intervene("encounter", id);
    game.choose("stay");
    must(game.getState().flags[`solo_active_${id}`], `${id} solo live`);
    const smash = game.intervene("intervene", "mars");
    must(smash.ok, "300 allowed during solo");
    game.choose("sabotage");
    must(game.getState().currentEvent.id === "IV_sabotage", "sabotage event");
    must(game.getState().flags[`date_broken_${id}`], `date_broken_${id} written even if host clicked another name`);
    must(game.getState().pendingTargetId === id || game.getState().flags[`date_broken_${id}`], "retargets to live solo");
    game.choose("break");
    must(game.getState().currentEvent.id === crisis, `${id} sabotage break forceEvents ${crisis}`);
    must(game.getState().flags[`solo_active_${id}`] !== true, "solo_active cleared by sabotage");
  }

  const fake = fresh();
  fake.intervene("intervene", "nini");
  fake.choose("sabotage");
  must(fake.getState().currentEvent.id === "EVENT_008_office_hub", "300 sabotage without solo returns to hub");
  must(!fake.getState().flags.date_broken_nini, "no fake date_broken via 300 menu");

  addRow({
    cost: 300,
    name: "干涉命運",
    effect: "嫉妒 burn 進嫉妒／危機；破壞獨處需 solo_active，並 force 善後危機",
    next: "是（spark→嫉妒，burn→危機，break→善後危機）",
    later: "是（date_broken_*、public_jealous_* 被修羅場／危機讀取）",
    fake: "無獨處時選破壞：回 Hub，不寫 date_broken",
    invalid: "無",
    result: "通過",
  });
}

// ---------------------------------------------------------------------------
// 500 扭轉命運
// ---------------------------------------------------------------------------
{
  must(pickForceFollowup(["nini", "meteor", "pepsi", "jupiter", "mars"], "nini") === "EVENT_nini_lockbox_01", "hub nini → lockbox");
  must(pickForceFollowup(["nini", "meteor", "pepsi", "jupiter", "mars"], "meteor") === "EVENT_meteor_never_broke_up_01", "hub meteor → never_broke_up");
  must(pickForceFollowup(["nini", "meteor", "pepsi", "jupiter", "mars"], "pepsi") === "EVENT_pepsi_identity_01", "hub pepsi → identity");
  must(pickForceFollowup(["nini", "meteor", "pepsi", "jupiter", "mars"], "jupiter") === "EVENT_jupiter_packing_01", "hub jupiter → packing");
  must(pickForceFollowup(["nini", "meteor", "pepsi", "jupiter", "mars"], "mars") === "EVENT_mars_too_close_01", "hub mars → too_close");
  must(pickForceFollowup(["meteor"], "meteor") === "EVENT_shura_nini_meteor_01", "moon+meteor → nini×meteor shura");
  must(pickForceFollowup(["pepsi"], "pepsi") === "EVENT_shura_pepsi_meteor_01", "moon+pepsi → pepsi×meteor shura");
  must(pickForceFollowup(["jupiter"], "jupiter") === "EVENT_shura_jupiter_mars_01", "moon+jupiter → doorway shura");
  must(pickForceFollowup(["mars"], "mars") === "EVENT_shura_jupiter_mars_01", "moon+mars → doorway shura");
  must(pickForceFollowup(["nini"], "nini") === "EVENT_shura_nini_meteor_01", "nini alone → nini×meteor shura");

  must(
    pickForceFollowup(["nini", "meteor", "pepsi", "jupiter", "mars"], "nini", { crisis_blocked_nini: true }) ===
      "EVENT_008_office_hub",
    "blocked nini crisis redirects 500 to hub"
  );

  const hubForce = {};
  for (const id of IDS) {
    const game = fresh();
    must(game.getState().currentEvent.id === "EVENT_008_office_hub", "start from hub");
    const affection = game.getState().characters[id].affection;
    const primary = CHARACTER_BY_ID[id].uniquePrimary;
    const primaryBefore = game.getState().characters[id][primary];
    const fate = game.getState().fate;
    must(game.intervene("force", id).ok, `force ${id} from hub`);
    must(game.getState().lastResult.kind === "force", "500 shows 局勢變化 immediately");
    must(game.getState().lastResult.overlayTitle === "局勢變化", "500 overlay title is 局勢變化");
    must(game.getState().flags[`forced_${id}`], `forced_${id}`);
    must(game.getState().fate === fate, "500 does not deduct fate");
    must(game.getState().currentEvent.id === CRISIS_BY_ID[id], `hub 500 ${id} → ${CRISIS_BY_ID[id]}`);
    must(game.getState().currentEvent.id !== "EVENT_forced_spotlight", "spotlight leftover is not used");
    must(game.getState().characters[id].affection === affection, "500 is not affection");
    must(game.getState().characters[id][primary] === primaryBefore, "500 is not uniquePrimary bump");
    hubForce[id] = game.getState().currentEvent.id;
  }

  const stageCases = [
    ["EVENT_meteor_solo_01", "meteor", "EVENT_shura_nini_meteor_01"],
    ["EVENT_pepsi_solo_01", "pepsi", "EVENT_shura_pepsi_meteor_01"],
    ["EVENT_jupiter_quiet_date", "jupiter", "EVENT_shura_jupiter_mars_01"],
    ["EVENT_mars_solo_01", "mars", "EVENT_shura_jupiter_mars_01"],
    ["EVENT_nini_solo_01", "nini", "EVENT_shura_nini_meteor_01"],
  ];
  for (const [stage, target, expected] of stageCases) {
    const game = fresh();
    game.startEvent(stage, { force: true });
    game.intervene("force", target);
    must(game.getState().currentEvent.id === expected, `${stage} + 500 ${target} → ${expected}`);
    must(game.getState().lastResult.kind === "force", `${stage} 500 has 局勢變化`);
  }

  addRow({
    cost: 500,
    name: "扭轉命運",
    effect: "依現場人數改局勢：Hub→該角色危機；單人現場→對應修羅場。不是 spotlight 加點",
    next: "是",
    later: "是（forced_* 被修羅場 02 讀取）",
    fake: "無",
    invalid: "無",
    result: "通過（Hub／單人現場路由正確；封鎖後不進原危機）",
  });
}

// ---------------------------------------------------------------------------
// 1000 改寫命運
// ---------------------------------------------------------------------------
{
  for (const id of IDS) {
    const game = fresh();
    const fate = game.getState().fate;
    const primary = CHARACTER_BY_ID[id].uniquePrimary;
    game.setStat(id, primary, 90);
    must(game.getState().characters[id][primary] === 90, `${id} core raised before 1000`);
    must(game.intervene("rewrite", id).ok, `rewrite ${id}`);
    must(game.getState().fate === fate, "1000 does not deduct fate");
    must(game.getState().currentEvent.id === "EVENT_008_office_hub", "1000 returns to hub");
    must(game.getState().lastResult.kind === "rewrite", "1000 is a number shuffle popup");
    must(game.getState().characters[id][primary] !== 90, `${id} 1000 reshuffles ${primary}`);
    must(!game.getState().flags[`fate_rewritten_${id}`], `1000 does not write fate_rewritten_${id}`);
    must(!game.getState().flags[`crisis_blocked_${id}`], `1000 does not write crisis_blocked_${id}`);
    must(game.getState().currentEvent.id !== CHARACTER_BY_ID[id].rewriteEventId, `${id} 1000 does not open rewrite scene`);
    must(!JSON.stringify(game.getState().lastResult).includes("EVENT_rewrite"), "1000 result hides rewrite event ids");
  }

  const randomPick = fresh();
  randomPick.intervene("rewrite");
  must(randomPick.getState().lastResult.characterId === "nini", "1000 without a target randomly selects a character");
  must(randomPick.getState().currentEvent.id === "EVENT_008_office_hub", "random 1000 still returns to hub");

  const override = fresh();
  override.startEvent("EVENT_rewrite_nini", { force: true });
  override.choose("wait");
  must(override.getState().flags.crisis_blocked_nini, "rewrite scene wait still can block crisis");
  must(!inPool(override, "EVENT_nini_lockbox_01"), "blocked lockbox not in pool");
  override.intervene("force", "nini");
  must(override.getState().currentEvent.id !== "EVENT_nini_lockbox_01", "500 cannot pierce crisis_blocked_nini");
  must(override.getState().currentEvent.id === "EVENT_008_office_hub", "500 blocked crisis redirects to hub");

  const jupiterStay = fresh();
  jupiterStay.startEvent("EVENT_rewrite_jupiter", { force: true });
  jupiterStay.choose("stay");
  must(jupiterStay.getState().flags.crisis_blocked_jupiter, "jupiter stay sets crisis_blocked_jupiter");
  must(!inPool(jupiterStay, "EVENT_jupiter_packing_01"), "blocked packing not in pool");
  must(!inPool(jupiterStay, "EVENT_jupiter_hope_low_01"), "blocked hope_low not in pool");

  const meteorBlock = fresh();
  meteorBlock.startEvent("EVENT_rewrite_meteor", { force: true });
  meteorBlock.choose("break");
  must(!inPool(meteorBlock, "EVENT_meteor_never_broke_up_01"), "blocked never_broke_up not in pool");

  const pepsiBlock = fresh();
  pepsiBlock.startEvent("EVENT_rewrite_pepsi", { force: true });
  pepsiBlock.choose("cut");
  must(!inPool(pepsiBlock, "EVENT_pepsi_identity_01"), "blocked identity not in pool");

  const marsBlock = fresh();
  marsBlock.startEvent("EVENT_rewrite_mars", { force: true });
  marsBlock.choose("away");
  must(!inPool(marsBlock, "EVENT_mars_too_close_01"), "blocked too_close not in pool");

  const { written, read } = auditFlags();
  for (const id of IDS) {
    must(read.has(`fate_rewritten_${id}`), `fate_rewritten_${id} is read (rewrite scene condition)`);
    must(read.has(`crisis_blocked_${id}`), `crisis_blocked_${id} is read by a crisis condition`);
  }
  must(read.has("fate_rewritten_nini"), "fate_rewritten_nini is read");
  must(read.has("fate_rewritten_jupiter"), "fate_rewritten_jupiter is read");
  must(read.has("fate_rewritten_mars"), "fate_rewritten_mars is read");
  must(read.has("public_jealous_mars"), "public_jealous_mars is read");

  addRow({
    cost: 1000,
    name: "改寫命運",
    effect: "隨機（或指定）一人，重新洗牌她的核心數值；不進改寫場景、不封鎖危機、不強制下一張",
    next: "否（回到現場）",
    later: "否（只改數值，不寫 fate_rewritten / crisis_blocked）",
    fake: "無",
    invalid: "無",
    result: "通過",
  });
}

// ---------------------------------------------------------------------------
// Flag leftovers + ladder
// ---------------------------------------------------------------------------
{
  const { written, read } = auditFlags();
  const unread = [...written].filter((key) => !read.has(key)).sort();
  const notableUnread = unread.filter((key) =>
    /letter_seen_by_moon|public_jealous_mars|letter_misread_by_pepsi/.test(key) ||
    key.startsWith("letter_seen") ||
    key === "public_jealous_mars"
  );
  must(read.has("public_jealous_mars"), "public_jealous_mars is read by too_close");
  must(!read.has("letter_misread_by_pepsi"), "letter_misread_by_pepsi dead condition removed");
  must(!written.has("letter_misread_by_pepsi"), "letter_misread_by_pepsi is not written");

  addRow({
    cost: "—",
    name: "階梯差異",
    effect: "100 讀資訊、200 造獨處、300 改正在發生的事、500 改場上是誰、1000 只洗牌數值",
    next: "100–500 會改下一張；1000 回到現場",
    later: "有後續讀取",
    fake: "無",
    invalid: "無",
    result: "通過",
  });

  flagReport = {
    notableUnread,
    skeletonCount: unread.filter(
      (key) =>
        !/letter_seen_by_moon|public_jealous_mars|solo_active_|date_broken_|forced_|fate_rewritten_|crisis_blocked_|letter_to_|letter_misread_|secret_|encounter_|jealousy_triggered_|nini_allowed_stay|jupiter_seen|jupiter_quiet_date|jupiter_packing_started/.test(
          key
        )
    ).length,
  };
}

console.log("\n=== 五種命運干預驗收表 ===\n");
console.log(
  [
    "權限",
    "名稱",
    "目前實際效果",
    "是否改變下一張事件",
    "是否改變後續劇情",
    "是否存在假效果",
    "是否存在無效條件",
    "驗收結果",
  ].join(" | ")
);
console.log("-".repeat(120));
for (const row of rows) {
  console.log(
    [row.cost, row.name, row.effect, row.next, row.later, row.fake, row.invalid, row.result].join(" | ")
  );
}

if (gaps.length) {
  console.log("\n=== 發現的問題（未改資料／未改 Engine）===\n");
  for (const item of gaps) {
    console.log(`- [${item.permission}] ${item.title}`);
    console.log(`  實際：${item.actual}`);
    console.log(`  建議：${item.suggestion}`);
  }
}

console.log("\nintervention acceptance ok", {
  rows: rows.length,
  gaps: gaps.length,
  fateModel: GAME_CONFIG.startingFate,
  hostButtons: "peek/encounter/intervene/force/rewrite",
  unreadInterventionFlags: flagReport.notableUnread,
  unreadShuraSkeletonFlags: flagReport.skeletonCount,
});
