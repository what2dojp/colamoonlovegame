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

  const seen = peekLetter("meteor", "seen");
  must(seen.game.getState().flags.letter_to_meteor, "letter_to_meteor written");
  must(seen.game.getState().flags.letter_seen_by_moon, "letter_seen_by_moon written");
  must(seen.game.getState().currentEvent.id === "EVENT_letter_meteor", "seen letter still forceEvents letter follow-up");

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
  if (!read.has("letter_seen_by_moon") && written.has("letter_seen_by_moon")) {
    gap(
      "100",
      "letter_seen_by_moon 寫了沒人讀",
      "「月月看見」與「只送到手上」都 force 同一張情書後續，觀眾看不出差別",
      "讓 EVENT_letter_* 讀 letter_seen_by_moon，或 seen 另外 force 月月回應事件"
    );
  }

  addRow({
    cost: 100,
    name: "偷看命運",
    effect: "情書三路 force 情書／修羅場；秘密未公開加危機權重，公開 force 危機",
    next: "是（private/seen→letter，misread→shura，leak→crisis）",
    later: "是（letter_to_*、secret_* 被後續讀取）",
    fake: "「月月看見」目前沒有獨立後續",
    invalid: "letter_misread_by_pepsi 被條件讀取但永遠不會被寫入",
    result: "部分通過",
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

  const interrupt = fresh();
  interrupt.intervene("encounter", "nini");
  interrupt.choose("interrupt");
  must(interrupt.getState().currentEvent.id === "EVENT_shura_nini_meteor_01", "200 interrupt jumps to shura");
  gap(
    "200",
    "碰觸命運第二選項直接進修羅場",
    "Hub 上對日日按 200→interrupt，下一張已是日日×流星修羅場，沒有先形成獨處",
    "200 應只製造獨處；拆成修羅場留給 500，或至少先寫 solo_active 再破壞"
  );

  addRow({
    cost: 200,
    name: "碰觸命運",
    effect: "五人各自 force 自己的獨處，並寫 solo_active_{id}；Hub 會清旗標",
    next: "是（stay→對應 solo）",
    later: "是（獨處可被 300 破壞）",
    fake: "無獨處時 sabotage 不會產生假效果",
    invalid: "第二選項 interrupt 不經過獨處，直接修羅場，與 500 重疊",
    result: "部分通過",
  });
}

// ---------------------------------------------------------------------------
// 300 干涉命運
// ---------------------------------------------------------------------------
{
  const expectedBurn = {
    nini: "EVENT_nini_jealousy_01",
    meteor: "EVENT_meteor_jealousy_01",
    pepsi: "EVENT_pepsi_identity_01",
    jupiter: "EVENT_jupiter_jealousy_01",
    mars: "EVENT_mars_jealousy_01",
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

  const spark = fresh();
  spark.intervene("intervene", "nini");
  spark.choose("jealousy");
  const sparkAffection = spark.getState().characters.nini.affection;
  spark.choose("spark");
  must(spark.getState().currentEvent.id === "EVENT_008_office_hub", "spark returns to hub");
  must(spark.getState().characters.nini.affection === sparkAffection + 3, "spark only adds affection + tension");
  gap(
    "300",
    "嫉妒第一選項 spark 沒有 force 事件",
    "花費 300 後若選「點燃但不要燒穿」（skip 也走這條），下一張只回 Hub，好感 +3",
    "把 spark 改成至少 force 嫉妒事件，或不要當第一選項／skip 預設"
  );

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
    next: "是（burn／break）；spark 否",
    later: "是（date_broken_*、public_jealous_* 被修羅場／危機讀取）",
    fake: "無獨處時選破壞：回 Hub，不寫 date_broken",
    invalid: "spark 作為 skip 預設，按了觀眾可能只看到 +3 好感",
    result: "部分通過",
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

  const hubForce = {};
  for (const id of IDS) {
    const game = fresh();
    must(game.getState().currentEvent.id === "EVENT_008_office_hub", "start from hub");
    const affection = game.getState().characters[id].affection;
    const primary = CHARACTER_BY_ID[id].uniquePrimary;
    const primaryBefore = game.getState().characters[id][primary];
    const fate = game.getState().fate;
    must(game.intervene("force", id).ok, `force ${id} from hub`);
    must(game.getState().currentEvent.id === "IV_force", "500 opens IV_force not spotlight");
    must(game.getState().flags[`forced_${id}`], `forced_${id}`);
    game.choose("center");
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
    game.choose("center");
    must(game.getState().currentEvent.id === expected, `${stage} + 500 ${target} → ${expected}`);
  }

  addRow({
    cost: 500,
    name: "扭轉命運",
    effect: "依現場人數改局勢：Hub→該角色危機；單人現場→對應修羅場。不是 spotlight 加點",
    next: "是",
    later: "是（forced_* 被修羅場 02 讀取）",
    fake: "無",
    invalid: "500 以 startEvent 強制進場，會穿過 crisis_blocked（見 1000）",
    result: "通過（Hub／單人現場路由正確）",
  });
}

// ---------------------------------------------------------------------------
// 1000 改寫命運
// ---------------------------------------------------------------------------
{
  for (const id of IDS) {
    const game = fresh();
    const fate = game.getState().fate;
    must(game.intervene("rewrite", id).ok, `rewrite ${id}`);
    must(game.getState().currentEvent.id === "IV_rewrite", "1000 opens rewrite");
    game.choose("push");
    must(game.getState().fate === fate, "1000 does not deduct fate");
    must(game.getState().flags[`fate_rewritten_${id}`], `fate_rewritten_${id}`);
    must(game.getState().currentEvent.id === CHARACTER_BY_ID[id].rewriteEventId, `${id} push forceEvents rewrite scene`);
  }

  const blocked = fresh();
  blocked.intervene("peek", "nini");
  blocked.choose("secret");
  blocked.choose("keep");
  must(inPool(blocked, "EVENT_nini_lockbox_01") || blocked.getState().flags.secret_nini, "secret_nini enables lockbox path");
  blocked.intervene("rewrite", "nini");
  blocked.choose("block");
  must(blocked.getState().flags.crisis_blocked_nini, "block writes crisis_blocked_nini");
  must(blocked.getState().currentEvent.id === "EVENT_rewrite_nini", "then rewrite scene");
  blocked.choose("wait");
  must(!inPool(blocked, "EVENT_nini_lockbox_01"), "crisis_blocked_nini removes lockbox from pool");
  must(
    inPool(blocked, "EVENT_nini_dependence_01"),
    "nini dependence is still drawable after lockbox block"
  );
  gap(
    "1000",
    "crisis_blocked_nini 擋不住 dependence 危機",
    "封鎖 lockbox 後，EVENT_nini_dependence_01 仍可進池（沒有 not crisis_blocked_nini）",
    "dependence 條件加上 { not: { flag: \"crisis_blocked_nini\" } }，或分開兩條封鎖"
  );

  const pushWait = fresh();
  pushWait.intervene("peek", "nini");
  pushWait.choose("secret");
  pushWait.choose("keep");
  pushWait.intervene("rewrite", "nini");
  pushWait.choose("push");
  pushWait.choose("wait");
  must(pushWait.getState().flags.fate_rewritten_nini, "push+wait still writes fate_rewritten");
  must(!pushWait.getState().flags.crisis_blocked_nini, "push+wait does not set crisis_blocked");
  if (inPool(pushWait, "EVENT_nini_lockbox_01")) {
    gap(
      "1000",
      "改寫「願意等」只做 weight -999，鎖箱仍可能被抽到",
      `lockbox 仍在池中，effectiveWeight=${pushWait.getState().pool.find((i) => i.id === "EVENT_nini_lockbox_01")?.effectiveWeight}`,
      "wait/break/cut/stay/away 應同時寫 crisis_blocked_{id}，不要只靠 weight -999（Engine 會 Math.max(1, weight)）"
    );
  }

  const override = fresh();
  override.intervene("rewrite", "nini");
  override.choose("block");
  override.choose("wait");
  must(!inPool(override, "EVENT_nini_lockbox_01"), "blocked lockbox not in pool");
  override.intervene("force", "nini");
  override.choose("center");
  if (override.getState().currentEvent.id === "EVENT_nini_lockbox_01") {
    gap(
      "1000",
      "500 可以穿過 1000 的 crisis_blocked",
      "Hub 上 500 仍 forceEvent lockbox，startEvent 不讀 crisis_blocked",
      "不要改 Engine 的話：pickForceFollowup 在 crisis_blocked 時改導向 rewrite／Hub，而不是危機"
    );
  }

  const jupiterStay = fresh();
  jupiterStay.intervene("rewrite", "jupiter");
  jupiterStay.choose("push");
  jupiterStay.choose("stay");
  must(jupiterStay.getState().flags.fate_rewritten_jupiter, "jupiter rewrite stay");
  must(!jupiterStay.getState().flags.crisis_blocked_jupiter, "jupiter stay does not set crisis_blocked");

  const meteorBlock = fresh();
  meteorBlock.intervene("peek", "meteor");
  meteorBlock.choose("secret");
  meteorBlock.choose("keep");
  meteorBlock.intervene("rewrite", "meteor");
  meteorBlock.choose("block");
  meteorBlock.choose("break");
  must(!inPool(meteorBlock, "EVENT_meteor_never_broke_up_01"), "blocked never_broke_up not in pool");

  const pepsiBlock = fresh();
  pepsiBlock.intervene("peek", "pepsi");
  pepsiBlock.choose("secret");
  pepsiBlock.choose("keep");
  pepsiBlock.intervene("rewrite", "pepsi");
  pepsiBlock.choose("block");
  pepsiBlock.choose("cut");
  must(!inPool(pepsiBlock, "EVENT_pepsi_identity_01"), "blocked identity not in pool");

  const marsBlock = fresh();
  marsBlock.intervene("peek", "mars");
  marsBlock.choose("secret");
  marsBlock.choose("keep");
  marsBlock.intervene("rewrite", "mars");
  marsBlock.choose("block");
  marsBlock.choose("away");
  must(!inPool(marsBlock, "EVENT_mars_too_close_01"), "blocked too_close not in pool");

  const { written, read } = auditFlags();
  for (const id of IDS) {
    must(read.has(`fate_rewritten_${id}`), `fate_rewritten_${id} is read (rewrite scene condition)`);
    must(read.has(`crisis_blocked_${id}`), `crisis_blocked_${id} is read by a crisis condition`);
  }
  for (const id of ["nini", "jupiter", "mars"]) {
    gap(
      "1000",
      `fate_rewritten_${id} 只當改寫場景入場券`,
      "改寫場景結束後，沒有其他角色事件再讀這個旗標。百事／流星 02 修羅場有讀 fate_rewritten_pepsi/meteor",
      `讓 ${id} 的危機或後續事件條件讀 fate_rewritten_${id}，否則改寫完就只剩當下那一張`
    );
  }

  addRow({
    cost: 1000,
    name: "改寫命運",
    effect: "五人各自進 rewrite 場景；block 會寫 crisis_blocked 並從池中拿掉對應危機",
    next: "是（rewrite 場景）",
    later: "部分（fate_rewritten_* 主要只當 rewrite 入場券；push+wait 不封鎖抽卡）",
    fake: "push 後選「願意等／切斷」看起來改了命運，但危機仍可能以權重 1 進池",
    invalid: "dependence 不受 crisis_blocked_nini 限制；500 可強制穿過封鎖",
    result: "部分通過",
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
  if (!read.has("public_jealous_mars") && written.has("public_jealous_mars")) {
    gap(
      "flag",
      "public_jealous_mars 寫了沒人讀",
      "偷看公開／300 burn 火星會寫這個旗標，但 too_close 與修羅場都沒讀它",
      "讓 EVENT_mars_too_close_01 或 EVENT_shura_jupiter_mars_02 讀 public_jealous_mars"
    );
  }
  if (read.has("letter_misread_by_pepsi") && !written.has("letter_misread_by_pepsi")) {
    gap(
      "flag",
      "letter_misread_by_pepsi 是死條件",
      "沒有人的 rivalId 是 pepsi，情書誤讀寫不出這個旗標",
      "從修羅場條件拿掉，或讓某條誤讀路徑真的寫它"
    );
  }

  addRow({
    cost: "—",
    name: "階梯差異",
    effect: "100 讀資訊、200 造獨處、300 改正在發生的事、500 改場上是誰、1000 改這條線能不能走",
    next: "五鍵都會改下一張（除 300 spark）",
    later: "大多有後續讀取",
    fake: "200 interrupt ≈ 單人現場的 500；300 spark 像加點；100 seen 像 private",
    invalid: notableUnread.join(", ") || "見 gaps",
    result: gaps.length ? `有 ${gaps.length} 項待修` : "通過",
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
