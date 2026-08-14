# colamoonlovegame

百合戀愛修羅場－由你決定後宮劇情

正式標題：【七夕事件】「可樂海王後宮失火啦」  
英文：COLAMOON LOVE / HAREM FIRE

給 VTuber「可樂月月 ColaMoon Ch.」直播使用的長期戀愛事件平台。觀眾是七夕神使，透過劇情選擇、命運值與干預事件改變修羅場，而不是直接選一個女朋友。

## 本機啟動

需要以網站方式開啟（ES Modules 無法用 `file://`）：

```bash
python3 -m http.server 8080
```

然後打開：

- 平台入口：http://localhost:8080/
- 觀眾畫面：http://localhost:8080/qixi/2026/
- 教主控制台：http://localhost:8080/admin/
- 直播互動原型：http://localhost:8080/live-love-event/

`live-love-event/` 是可獨立擴充的直播互動頁，之後可以接到同一套事件引擎。

## 結構

- `data/` 角色、關係、季節劇情（資料驅動）
- `src/engine/` 事件引擎、命運值、存檔、mock 斗內、今晚結算
- `src/config/game.config.js` 干預成本與數值範圍
- `qixi/2026/` 本季觀眾畫面
- `admin/` 教主控制台（下一事件／暫停／結束本次事件）
- 存檔在瀏覽器 `localStorage`（`colamoonlove.save.v1`），含 `archive` 與 `qixi_2026_night_partner`
- 沒有故事結局：結束直播只會進入「今晚陪伴」結算與進度卡（暫時休戰）

未來季節預計放在 `/valentine/2027/`、`/qixi/2027/`。

## 發布到 Vercel

這是靜態網站（vanilla ES modules），不需要 build。

1. 打開 [vercel.com/new](https://vercel.com/new)
2. Import GitHub 倉庫 `what2dojp/colamoonlovegame`
3. Framework Preset 選 **Other**
4. Root Directory 留空（專案根目錄）
5. 按 Deploy

發布後路徑：

- `/` 平台入口
- `/qixi/2026/` 觀眾畫面
- `/admin/` 教主控制台
- `/live-love-event/` 直播互動原型

本機若已登入 Vercel CLI，也可以：

```bash
npx vercel --prod --yes
```
