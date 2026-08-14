import { inspectSave } from "../engine/save.js";

const nav = document.getElementById("entry-nav");

function renderEntry() {
  let info = { exists: false, status: "none" };
  try {
    info = inspectSave();
  } catch {
    info = { exists: false, status: "none" };
  }

  const playHref = "./qixi/2026/";
  const replayHref = "./qixi/2026/?replay=1";

  let main = "";
  if (!info.exists || info.status === "none") {
    main = `<a class="primary" href="${playHref}">開始七夕遊戲</a>`;
  } else if (info.status === "finished") {
    main = `
      <a class="primary" href="${playHref}">查看本局結果</a>
      <a href="${replayHref}">重新遊玩</a>`;
  } else {
    main = `
      <a class="primary" href="${playHref}">繼續上次遊戲</a>
      <a href="${replayHref}">重新遊玩</a>`;
  }

  nav.innerHTML = `
    ${main}
    <a class="ghost" href="./admin/">教主控制台</a>
    <a class="ghost" href="./live-love-event/">直播互動原型（可另擴充）</a>
  `;
}

renderEntry();
