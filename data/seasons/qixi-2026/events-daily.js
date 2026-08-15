import { skeleton } from "./events-daily-helpers.js";
import { NINI_DAILY_EVENTS } from "./events-daily-nini.js";
import { METEOR_DAILY_EVENTS } from "./events-daily-meteor.js";
import { PEPSI_DAILY_EVENTS } from "./events-daily-pepsi.js";
import { JUPITER_DAILY_EVENTS } from "./events-daily-jupiter.js";
import { MARS_DAILY_EVENTS } from "./events-daily-mars.js";

export const DAILY_EVENTS = [
  ...NINI_DAILY_EVENTS,
  ...METEOR_DAILY_EVENTS,
  ...PEPSI_DAILY_EVENTS,
  ...JUPITER_DAILY_EVENTS,
  ...MARS_DAILY_EVENTS,
];

function twoChoices(stayId, stayLabel, stayEffects, leaveId, leaveLabel, leaveEffects) {
  return [
    { id: stayId, label: stayLabel, effects: stayEffects },
    { id: leaveId, label: leaveLabel, effects: leaveEffects },
  ];
}

export const MEMORY_EVENTS = [
  skeleton({
    id: "EVENT_memory_nini",
    title: "回憶：地下室裡的保管箱",
    description:
      "觀眾看見日日關上門以後的畫面。她把月月掉在沙發上的頭髮捲起來，連同隱形眼鏡盒、穿過的襪子，一格一格放進箱子。「不是偷。是保管。月月會亂。」晶晶坐在箱子上，像在作證。",
    characters: ["nini"],
    speaker: "現場",
    pool: false,
    weight: 1,
    tags: ["nini", "memory", "peek"],
    conditions: {
      any: [{ flag: "secret_nini" }, { flag: "memory_unlocked_nini" }],
    },
    choices: twoChoices(
      "watch",
      "讓這段回憶停在箱子關上",
      [
        { type: "flag", key: "memory_nini_seen", value: true },
        { type: "log", text: "日日的保管箱被看見了。這還不是當眾拆開的危機。" },
      ],
      "close",
      "先把畫面蓋上，不讓現場聽見",
      [
        { type: "flag", key: "memory_nini_seen", value: true },
        { type: "eventStatus", status: "unresolved" },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_memory_meteor",
    title: "回憶：同款鞋子的咖啡館",
    description:
      "觀眾看見更早以前。咖啡館裡兩雙一樣的鞋先碰到，然後才是對話。流星說「以前也來過」，月月說「我也是」。她們一起去過舊操場、舊販賣機、小時候的那條巷。後來很久沒聯絡。流星把那段空白從畫面裡刪掉。",
    characters: ["meteor"],
    speaker: "現場",
    pool: false,
    weight: 1,
    tags: ["meteor", "memory", "peek"],
    conditions: {
      any: [{ flag: "secret_meteor" }, { flag: "memory_unlocked_meteor" }],
    },
    choices: twoChoices(
      "watch",
      "讓回憶停在兩人還常見面的時候",
      [
        { type: "flag", key: "memory_meteor_seen", value: true },
        { type: "log", text: "流星與月月的共同回憶被看見。空白還沒被當眾拆穿。" },
      ],
      "close",
      "先不把「很久沒聯絡」說給現場聽",
      [
        { type: "flag", key: "memory_meteor_seen", value: true },
        { type: "eventStatus", status: "unresolved" },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_memory_pepsi",
    title: "回憶：第一次發現我們這麼像",
    description:
      "觀眾看見兩人第一次對上的那個下午。不是一見鍾情的搶，是同時講出同一句吐槽，然後一起愣住。百事說：「我們真的很像。」月月還沒把這句聽成危險。那時候還沒有頻率、儀式、融合。",
    characters: ["pepsi"],
    speaker: "現場",
    pool: false,
    weight: 1,
    tags: ["pepsi", "memory", "peek"],
    conditions: {
      any: [{ flag: "secret_pepsi" }, { flag: "memory_unlocked_pepsi" }],
    },
    choices: twoChoices(
      "watch",
      "讓回憶停在第一次默契",
      [
        { type: "flag", key: "memory_pepsi_seen", value: true },
        { type: "log", text: "百事與月月的相似被看見。融合還只是很後面的事。" },
      ],
      "close",
      "先把畫面留在觀眾這邊",
      [
        { type: "flag", key: "memory_pepsi_seen", value: true },
        { type: "eventStatus", status: "unresolved" },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_memory_jupiter",
    title: "回憶：月月說她是朋友",
    description:
      "觀眾看見學校走廊。木星被堵住的時候，月月只是走過來，很自然地說「她是我朋友」。那些人散了。木星本來只想成為能幫上忙的人。月月每次謝謝，都讓她覺得自己可以存在。",
    characters: ["jupiter"],
    speaker: "現場",
    pool: false,
    weight: 1,
    tags: ["jupiter", "memory", "peek"],
    conditions: {
      any: [{ flag: "secret_jupiter" }, { flag: "memory_unlocked_jupiter" }],
    },
    choices: twoChoices(
      "watch",
      "讓回憶停在被救的那一天",
      [
        { type: "flag", key: "memory_jupiter_seen", value: true },
        { type: "log", text: "木星的起點是被月月救，不是綁架。奉獻還沒走到極端。" },
      ],
      "close",
      "先不把這段過去公開",
      [
        { type: "flag", key: "memory_jupiter_seen", value: true },
        { type: "eventStatus", status: "unresolved" },
      ]
    ),
  }),
  skeleton({
    id: "EVENT_memory_mars",
    title: "回憶：誰靠近她，她就玩誰",
    description:
      "觀眾看見更早的火星。漂亮、帥、人很多。她習慣別人主動走過來，也習慣把曖昧當成遊戲。誰先認真誰輸。直到月月不容易被拿下，她才第一次覺得這局不一樣。當時她還能笑著說「怎麼可能」。",
    characters: ["mars"],
    speaker: "現場",
    pool: false,
    weight: 1,
    tags: ["mars", "memory", "peek"],
    conditions: {
      any: [{ flag: "secret_mars" }, { flag: "memory_unlocked_mars" }],
    },
    choices: twoChoices(
      "watch",
      "讓回憶停在她還只是玩玩的時候",
      [
        { type: "flag", key: "memory_mars_seen", value: true },
        { type: "log", text: "火星以前真的只是玩。認真是後來才發生的事。" },
      ],
      "close",
      "先不讓現場聽見這段舊遊戲",
      [
        { type: "flag", key: "memory_mars_seen", value: true },
        { type: "eventStatus", status: "unresolved" },
      ]
    ),
  }),
];
