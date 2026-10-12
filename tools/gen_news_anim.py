# -*- coding: utf-8 -*-
"""「時事篇」動畫生成器（OCW／學習資源專區用）
===============================================================================
資料來源：assets/js/data/resources.js 的 window.EXAM_RESOURCES
          （news[] 時事、unitKits[] 每單元兩張時事卡片與站內對應題）
          assets/js/subjects.js   → 科目簡稱（純顯示用）
          assets/anim/cross/manifest.js → 單元標題（純顯示用）

產出：
  assets/anim/news/<unit-id>.html   3B1B 風格 Canvas 分階段動畫（單檔、離線可播、
                                    無外部依賴、無語音）
  assets/anim/news/manifest.js      window.EXAM_NEWS_ANIM：供站台／驗收腳本查核

特性：
  · 資料驅動：resources.js 新增／修改 unitKits，重跑本腳本即可同步動畫，不必手改 HTML。
  · 只讀取既有題庫索引，不產生任何題目、不改動作答判定與選項邏輯。
  · 不需要 headless Chrome（來源檔在 `window.XXX =` 之後皆為合法 JSON）。

用法：
    python3 tools/gen_news_anim.py                 # 全部單元
    python3 tools/gen_news_anim.py probability-and-expectation
    python3 tools/gen_news_anim.py --site=/path/to/site
"""
import json
import os
import re
import sys

SITE = "/Users/kedewei/Desktop/代码/學習站"
for _arg in sys.argv[1:]:
    if _arg.startswith("--site="):
        SITE = os.path.abspath(_arg.split("=", 1)[1])
TARGETS = [_a for _a in sys.argv[1:] if not _a.startswith("--")]

DATA_DIR = os.path.join(SITE, "assets/js/data")
OUT_ANIM = os.path.join(SITE, "assets/anim/news")
TODAY = "2026-10-07"


# ------------------------------------------------------------------ 讀取資料檔
def load_json_js(path):
    """讀取 `window.XXX = { ... };` 形式的資料檔（標記之後為合法 JSON）"""
    raw = open(path, encoding="utf-8").read()
    hits = list(re.finditer(r"window\.[A-Za-z_][A-Za-z0-9_]*\s*=", raw))
    start = hits[-1].end() if hits else 0
    return json.loads(raw[raw.index("{", start):raw.rindex("}") + 1])


def build_page(kit, res, subj_short, unit_title):
    news_meta = {n["id"]: n for n in res["news"]}
    steps = [
        {
            "kind": "title", "scene": "title", "kicker": "時事篇", "dur": 9,
            "title": unit_title + "｜兩則 2026 諾貝爾獎怎麼讀",
            "lines": [
                "這個單元原本是五科各一題的觀點串聯；這一頁把 2026 年諾貝爾生醫獎（光遺傳學）"
                "與物理獎（IceCube 中微子天文臺）兩則時事，接回同一個核心觀念。",
                "每一則時事都拆成兩張：先看得獎研究的原理，再看它和本單元哪幾題是同一種思考方式。",
            ],
        }
    ]
    for card in kit["cards"]:
        n = news_meta[card["news"]]
        accent = n.get("accent", "med")
        steps.append({
            "kind": "news", "scene": accent, "accent": accent, "dur": 15,
            "kicker": "%s（%s）" % (n["award"], n["date"]),
            "title": n["headline"],
            "lines": [n["oneLiner"], n["principle"], n["whyItMatters"]],
            "chips": n.get("keywords", []),
            "people": n.get("people", ""),
            "sources": n.get("sources", []),
        })
        anchors = []
        for a in card.get("anchors", []):
            anchors.append({
                "label": "%s 第 %d 題" % (subj_short.get(a["subject"], a["subject"]), a["n"]),
                "href": "../../../subject/%s/q.html?n=%d" % (a["subject"], a["n"]),
                "why": a["why"],
            })
        steps.append({
            "kind": "bridge", "scene": "bridge", "accent": accent, "dur": 14,
            "kicker": "接回本單元 · " + card.get("kind", "連結"),
            "title": card["lens"],
            "lines": [card["body"]],
            "anchors": anchors,
        })
    flat_links = []
    for grp in res.get("links", []):
        for it in grp["items"]:
            flat_links.append({"title": it["title"], "url": it["url"], "note": grp["group"] + "｜" + it.get("note", "")})
    steps.append({
        "kind": "outro", "scene": "outro", "dur": 14,
        "kicker": "延伸", "title": "把兩則時事帶回站內與站外",
        "lines": [
            "站內：本單元的觀點動畫在 cross.html 對應單元下方；首頁另有「OCW／學習資源專區」"
            "整理開放式課程與自主學習平臺，單題頁也會標出該題對應的時事卡片。",
            "站外：以下平臺皆為公開頁面，本站不代管內容，需連網使用。",
        ],
        "links": flat_links,
    })
    return {
        "unit": {"id": kit["id"], "title": unit_title},
        "today": TODAY,
        "version": res.get("version", ""),
        "news": [c["news"] for c in kit["cards"]],
        "note": res.get("note", ""),
        "backHome": "../../../events.html",
        "backUnit": "../../../cross.html#" + kit["id"],
        "steps": steps,
    }


# -------------------------------------------------------------------- 模板
def html(page):
    payload = json.dumps(page, ensure_ascii=False).replace("</", "<\\/")
    title = page["unit"]["title"] + "｜時事篇"
    return TEMPLATE.replace("__TITLE__", title).replace("/*__DATA__*/null", payload)


TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>__TITLE__</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;background:#080b11;color:#e8eef7;
    font-family:"PingFang TC","Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif;
    overflow:hidden}
  #wrap{position:fixed;inset:0;display:flex;align-items:center;justify-content:center}
  #stage{position:relative;width:1280px;height:720px;transform-origin:center center;
    background:radial-gradient(1100px 620px at 68% 42%,#101a28 0%,#0a0f18 55%,#070a10 100%);
    border-radius:18px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.6)}
  canvas{position:absolute;inset:0;display:block}
  .hud{position:absolute;left:0;right:0;top:0;height:56px;display:flex;align-items:center;
    gap:14px;padding:0 26px;font-size:14px;color:#9fb3cd;letter-spacing:.02em;
    background:linear-gradient(180deg,rgba(8,11,17,.92),rgba(8,11,17,0))}
  .hud b{color:#e8eef7;font-weight:600}
  .hud .spacer{flex:1}
  .hud .tag{border:1px solid #2a3b52;border-radius:999px;padding:3px 10px;font-size:12px;color:#8fa8c7}
  #card{position:absolute;left:44px;top:104px;width:626px;bottom:104px;overflow-y:auto;
    padding:26px 28px 30px;border-radius:16px;border:1px solid rgba(120,170,230,.16);
    background:linear-gradient(180deg,rgba(16,24,36,.92),rgba(11,17,26,.86));
    backdrop-filter:blur(2px)}
  #card::-webkit-scrollbar{width:8px}
  #card::-webkit-scrollbar-thumb{background:#26364b;border-radius:8px}
  .kicker{display:inline-block;font-size:13px;letter-spacing:.06em;color:#8fb8e6;
    border:1px solid rgba(120,170,230,.35);border-radius:999px;padding:4px 12px;margin-bottom:14px}
  .kicker.med{color:#8fe0c0;border-color:rgba(90,220,180,.4)}
  .kicker.phys{color:#9fc8ff;border-color:rgba(120,180,255,.42)}
  #card h1{font-size:25px;line-height:1.42;font-weight:700;margin-bottom:14px;letter-spacing:.01em}
  #card p{font-size:15px;line-height:1.85;color:#c3d2e4;margin-bottom:12px}
  .chips{display:flex;flex-wrap:wrap;gap:8px;margin:2px 0 14px}
  .chips span{font-size:12px;color:#9fb3cd;border:1px solid #24354a;border-radius:6px;padding:3px 8px}
  .who{font-size:12.5px;color:#8fa8c7;line-height:1.7;margin:-4px 0 14px}
  .box{margin-top:16px;border-top:1px dashed rgba(120,170,230,.22);padding-top:14px}
  .box .ah{font-size:12.5px;letter-spacing:.08em;color:#7f97b5;margin-bottom:8px}
  .box ul{list-style:none;display:flex;flex-direction:column;gap:10px}
  .box li a{color:#a8d4ff;text-decoration:none;font-size:14px;font-weight:600;
    border-bottom:1px solid rgba(168,212,255,.3)}
  .box li a:hover{color:#d7ebff;border-bottom-color:#d7ebff}
  .box li span{display:block;font-size:13px;line-height:1.7;color:#9fb3cd;margin-top:4px}
  .bar{position:absolute;left:44px;right:44px;bottom:26px;height:56px;display:flex;
    align-items:center;gap:12px}
  #dots{display:flex;gap:7px;align-items:center;flex:1}
  #dots i{width:26px;height:4px;border-radius:2px;background:#22303f;cursor:pointer;transition:.2s}
  #dots i.on{background:#6fb1ff}
  button{font:inherit;font-size:13.5px;color:#d7e4f4;background:#16202d;border:1px solid #2a3b52;
    border-radius:9px;padding:9px 15px;cursor:pointer;transition:.15s}
  button:hover{background:#1d2a3a;border-color:#3a5170}
  button.primary{background:#1d3a5c;border-color:#2f5f92;color:#eaf3ff}
  a.plainbtn{font-size:13.5px;color:#9fb3cd;text-decoration:none;border:1px solid #2a3b52;
    border-radius:9px;padding:9px 15px}
  a.plainbtn:hover{color:#e8eef7;border-color:#3a5170}
  #note{position:absolute;left:44px;right:44px;bottom:88px;font-size:11.5px;color:#5f7593;line-height:1.6}
</style>
</head>
<body>
<div id="wrap"><div id="stage">
  <canvas id="cv" width="1280" height="720"></canvas>
  <div class="hud">
    <span class="tag">時事篇</span>
    <b id="hud-unit"></b>
    <span class="spacer"></span>
    <span id="hud-step"></span>
  </div>
  <div id="card"></div>
  <div id="note"></div>
  <div class="bar">
    <button id="prev">上一張</button>
    <button id="next">下一張</button>
    <button id="play" class="primary">自動播放：開</button>
    <div id="dots"></div>
    <a class="plainbtn" id="lnk-unit" href="#">單元動畫</a>
    <a class="plainbtn" id="lnk-home" href="#">回資源專區</a>
  </div>
</div></div>
<script>window.__NEWS_DATA__ = /*__DATA__*/null;</script>
<script>
(function () {
  "use strict";
  var D = window.__NEWS_DATA__;
  var ERR = [];
  if (!D || !D.steps || !D.steps.length) { ERR.push("資料為空"); }
  var cv = document.getElementById("cv"), g = cv.getContext("2d");
  var W = 1280, H = 720;
  var stage = document.getElementById("stage");
  var card = document.getElementById("card");
  var dotsEl = document.getElementById("dots");
  var stepEl = document.getElementById("hud-step");
  var playBtn = document.getElementById("play");
  var steps = D.steps || [];
  var i = 0, t0 = performance.now(), autoplay = true, accum = 0;
  var ACC = { med: "#5adcb4", phys: "#7fb6ff", both: "#a8c8ff" };

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function ease(v) { return v < 0 ? 0 : (v > 1 ? 1 : v * v * (3 - 2 * v)); }

  /* ------------------------------------------------------------ 版面縮放 */
  function resize() {
    var k = Math.min(window.innerWidth / W, window.innerHeight / H);
    stage.style.transform = "scale(" + k + ")";
  }
  window.addEventListener("resize", resize); resize();

  /* ------------------------------------------------------------ 卡片內容 */
  function renderCard() {
    var s = steps[i] || {}, h = "";
    if (s.kicker) { h += '<div class="kicker ' + esc(s.accent || "") + '">' + esc(s.kicker) + "</div>"; }
    if (s.title) { h += "<h1>" + esc(s.title) + "</h1>"; }
    if (s.people) { h += '<div class="who">' + esc(s.people) + "</div>"; }
    if (s.chips && s.chips.length) {
      h += '<div class="chips">';
      s.chips.forEach(function (c) { h += "<span>" + esc(c) + "</span>"; });
      h += "</div>";
    }
    (s.lines || []).forEach(function (p) { h += "<p>" + esc(p) + "</p>"; });
    if (s.anchors && s.anchors.length) {
      h += '<div class="box"><div class="ah">站內對應題目（點擊前往單題頁）</div><ul>';
      s.anchors.forEach(function (a) {
        h += '<li><a href="' + esc(a.href) + '">' + esc(a.label) + "</a><span>" + esc(a.why) + "</span></li>";
      });
      h += "</ul></div>";
    }
    if (s.sources && s.sources.length) {
      h += '<div class="box"><div class="ah">時事來源</div><ul>';
      s.sources.forEach(function (a) {
        h += '<li><a href="' + esc(a.url) + '" target="_blank" rel="noopener">' + esc(a.title) +
          "</a><span>" + esc(a.source || "") + "</span></li>";
      });
      h += "</ul></div>";
    }
    if (s.links && s.links.length) {
      h += '<div class="box"><div class="ah">外部學習資源（' + s.links.length + '）</div><ul>';
      s.links.forEach(function (l) {
        h += '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.title) +
          "</a><span>" + esc(l.note || "") + "</span></li>";
      });
      h += "</ul></div>";
    }
    card.innerHTML = h;
    card.scrollTop = 0;
    stepEl.textContent = (i + 1) + " / " + steps.length + "｜" + (steps[i].kind || "");
    var ds = dotsEl.children;
    for (var k = 0; k < ds.length; k++) { ds[k].className = k === i ? "on" : ""; }
  }

  function buildDots() {
    for (var k = 0; k < steps.length; k++) {
      var d = document.createElement("i");
      d.setAttribute("data-i", k);
      d.title = (k + 1) + ". " + (steps[k].kind || "");
      d.addEventListener("click", function (e) { jump(parseInt(e.currentTarget.getAttribute("data-i"), 10)); });
      dotsEl.appendChild(d);
    }
  }

  function jump(n, keepPlay) {
    i = clamp(n, 0, steps.length - 1);
    t0 = performance.now();
    if (!keepPlay) { autoplay = false; }
    playBtn.textContent = "自動播放：" + (autoplay ? "開" : "關");
    renderCard();
  }
  function next() { jump(i + 1, autoplay); }
  function prev() { jump(i - 1, autoplay); }

  document.getElementById("next").addEventListener("click", function () { next(); });
  document.getElementById("prev").addEventListener("click", function () { prev(); });
  playBtn.addEventListener("click", function () {
    autoplay = !autoplay; t0 = performance.now();
    playBtn.textContent = "自動播放：" + (autoplay ? "開" : "關");
  });
  window.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "PageDown") { jump(i + 1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { jump(i - 1); }
    else if (e.key === " ") { e.preventDefault(); playBtn.click(); }
    else if (e.key === "Home") { jump(0); }
    else if (e.key === "End") { jump(steps.length - 1); }
  });

  /* -------------------------------------------------------------- 畫背景 */
  function base(t) {
    g.clearRect(0, 0, W, H);
    g.fillStyle = "rgba(255,255,255,0.05)";
    for (var x = 700; x < W; x += 40) {
      for (var y = 90; y < 660; y += 40) {
        var d = Math.hypot(x - 950, y - 350);
        g.globalAlpha = clamp(0.5 - d / 900, 0.05, 0.5) * (0.7 + 0.3 * Math.sin(t * 1.1 + d / 90));
        g.fillRect(x, y, 2, 2);
      }
    }
    g.globalAlpha = 1;
  }
  function label(txt, x, y, color, size) {
    g.font = "600 " + (size || 13) + "px 'PingFang TC','Noto Sans TC',sans-serif";
    g.fillStyle = color || "#8fa8c7";
    g.fillText(txt, x, y);
  }
  function glowDot(x, y, r, color, a) {
    var gg = g.createRadialGradient(x, y, 0, x, y, r * 4);
    gg.addColorStop(0, color); gg.addColorStop(1, "rgba(0,0,0,0)");
    g.globalAlpha = a == null ? 0.9 : a;
    g.fillStyle = gg; g.beginPath(); g.arc(x, y, r * 4, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
    g.fillStyle = color; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }

  /* --------------------------------------------- 場景 1：標題 */
  function scTitle(t) {
    for (var k = 0; k < 3; k++) {
      var r = 90 + k * 62 + 18 * Math.sin(t * 0.9 + k);
      g.globalAlpha = 0.28 - k * 0.07;
      g.strokeStyle = k === 1 ? "#5adcb4" : "#7fb6ff"; g.lineWidth = 1.4;
      g.beginPath(); g.arc(960, 330, r, 0, Math.PI * 2); g.stroke();
    }
    g.globalAlpha = 1;
    glowDot(960, 330, 5, "#eaf3ff", 0.85);
    label("NOBEL 2026 · 生醫（光遺傳學）", 760, 520, "#5adcb4", 14);
    label("NOBEL 2026 · 物理（IceCube 中微子）", 760, 548, "#7fb6ff", 14);
    var ids = D.news || [];
    for (var j = 0; j < ids.length; j++) { glowDot(1210 - j * 26, 130, 3.5, ACC[ids[j] === "nobel-med-2026" ? "med" : "phys"], 0.8); }
  }

  /* --------------------------------------------- 場景 2：光遺傳學 */
  function scMed(t) {
    var mx = 1000, top = 150, bot = 600, cy = 375;
    var open = ease(clamp((t - 0.7) / 1.0, 0, 1));
    var gap = 26 + 26 * open;
    g.lineWidth = 7; g.strokeStyle = "#4a6b8f"; g.lineCap = "round";
    g.beginPath(); g.moveTo(mx, top); g.lineTo(mx, cy - gap); g.stroke();
    g.beginPath(); g.moveTo(mx, cy + gap); g.lineTo(mx, bot); g.stroke();
    g.fillStyle = "#2c4560";
    for (var y = top; y < bot; y += 24) {
      if (Math.abs(y - cy) < gap + 8) { continue; }
      g.beginPath(); g.arc(mx, y, 5, 0, Math.PI * 2); g.fill();
    }
    label("細胞膜", mx + 14, top + 6, "#7f97b5", 12);
    /* 藍光 */
    for (var k = 0; k < 5; k++) {
      var yy = 250 + k * 38, a = 0.15 + 0.5 * clamp(1 - Math.abs(yy - cy) / 150, 0, 1) * (0.6 + 0.4 * Math.sin(t * 4 + k));
      g.strokeStyle = "rgba(90,170,255," + a.toFixed(3) + ")";
      g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(720, yy - 40); g.lineTo(mx - 40, yy - 6 + 26 * (open - 0.5)); g.stroke();
    }
    label("藍光", 724, 232, "#7fb6ff", 13);
    /* 離子 */
    for (var p = 0; p < 9; p++) {
      var ph = (t * 0.42 + p * 0.111) % 1;
      var px = 730 + ph * 430;
      var pass = open > 0.75;
      var py = cy + Math.sin(p * 2.1) * 60 * (1 - clamp(Math.abs(px - mx) / 160, 0, 1));
      if (!pass && Math.abs(px - mx) < 26) { px = mx - 26 - (26 - Math.abs(px - mx)); }
      var col = p % 2 ? "#5adcb4" : "#a8d4ff";
      glowDot(px, py, 4.5, col, 0.55 + 0.35 * (pass ? 1 : 0.3));
    }
    label("離子", 742, 300, "#8fe0c0", 13);
    /* 膜電位 */
    var bx = 720, by = 662, w = 460;
    g.strokeStyle = "rgba(140,170,200,.5)"; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + w, by); g.stroke();
    var amp = ease(clamp((t - 2.0) / 1.2, 0, 1)) * 74;
    g.strokeStyle = "#ffd479"; g.lineWidth = 2.6; g.beginPath();
    for (var xx = 0; xx <= w; xx += 4) {
      var spike = Math.exp(-Math.pow((xx - 250) / 34, 2)) * amp + Math.exp(-Math.pow((xx - 250) / 90, 2)) * amp * 0.22;
      var yv = by - 8 - spike - 10 * Math.sin(xx / w * Math.PI);
      if (xx === 0) { g.moveTo(bx + xx, yv); } else { g.lineTo(bx + xx, yv); }
    }
    g.stroke();
    label("膜電位（動作電位）", bx, by + 22, "#ffd479", 12);
  }

  /* --------------------------------------------- 場景 3：中微子 */
  function scPhys(t) {
    var x0 = 760, y0 = 210, x1 = 1210, y1 = 560;
    g.fillStyle = "rgba(120,190,255,.06)";
    g.strokeStyle = "rgba(159,232,255,.28)"; g.lineWidth = 1.4;
    g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.fill(); g.stroke();
    g.strokeStyle = "rgba(159,232,255,.10)";
    for (var x = x0 + 40; x < x1; x += 45) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
    for (var y = y0 + 40; y < y1; y += 45) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
    var sensors = [];
    for (var sx = x0 + 40; sx < x1 - 10; sx += 62) {
      for (var sy = y0 + 40; sy < y1 - 10; sy += 62) { sensors.push([sx, sy]); }
    }
    var hit = [985, 372];
    var prog = ease(clamp(t / 1.6, 0, 1));
    /* 中微子軌跡 */
    g.strokeStyle = "rgba(180,220,255,.75)"; g.lineWidth = 2; g.setLineDash([9, 7]);
    g.lineDashOffset = -t * 26;
    g.beginPath(); g.moveTo(700, 640); g.lineTo(700 + (hit[0] - 700) * prog, 640 + (hit[1] - 640) * prog); g.stroke();
    g.setLineDash([]);
    label("中微子", 706, 668, "#9fc8ff", 13);
    if (prog > 0.98) {
      var rr = 20 + ((t * 1.5) % 1.3) * 120;
      g.strokeStyle = "rgba(255,255,255," + (0.55 * (1 - ((t * 1.5) % 1.3) / 1.3)).toFixed(3) + ")";
      g.lineWidth = 2; g.beginPath(); g.arc(hit[0], hit[1], rr, 0, Math.PI * 2); g.stroke();
      glowDot(hit[0], hit[1], 6, "#ffffff", 0.95);
      var lit = ease(clamp((t - 1.8) / 1.2, 0, 1));
      for (var k = 0; k < sensors.length; k++) {
        var s = sensors[k], d = Math.hypot(s[0] - hit[0], s[1] - hit[1]);
        var near = d < 190;
        if (near) {
          g.strokeStyle = "rgba(120,200,255," + (0.30 * lit).toFixed(3) + ")"; g.lineWidth = 1.2;
          g.beginPath(); g.moveTo(hit[0], hit[1]); g.lineTo(s[0], s[1]); g.stroke();
        }
        g.fillStyle = near ? "rgba(180,235,255," + (0.35 + 0.6 * lit).toFixed(3) + ")" : "rgba(150,200,240,.30)";
        g.beginPath(); g.arc(s[0], s[1], near ? 4.6 : 3.2, 0, Math.PI * 2); g.fill();
        if (near) { glowDot(s[0], s[1], 2.4, "#9fe8ff", 0.35 + 0.5 * lit); }
      }
      label("碰撞 → 光訊號", hit[0] + 14, hit[1] - 14, "#eaf3ff", 13);
    }
    label("南極冰層（約 1 立方公里）", x0, y0 - 12, "#9fc8ff", 13);
    label("光學傳感器陣列", x0, y1 + 24, "#8fa8c7", 12);
  }

  /* --------------------------------------------- 場景 4：橋接 */
  function scBridge(t) {
    var accent = ACC[steps[i].accent || "both"] || ACC.phys;
    var lx = 790, ly = 268, rx = 1080, ry = 268;
    g.strokeStyle = "rgba(150,190,230,.45)"; g.lineWidth = 2; g.setLineDash([8, 7]);
    g.lineDashOffset = -t * 22;
    g.beginPath(); g.moveTo(lx + 66, ly); g.lineTo(rx - 96, ry); g.stroke();
    g.setLineDash([]);
    g.globalAlpha = 0.95;
    var grd = g.createRadialGradient(lx, ly, 4, lx, ly, 70);
    grd.addColorStop(0, accent); grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd; g.beginPath(); g.arc(lx, ly, 70, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
    g.strokeStyle = accent; g.lineWidth = 2;
    g.beginPath(); g.arc(lx, ly, 52, 0, Math.PI * 2); g.stroke();
    label("時事", lx - 16, ly + 5, "#eaf3ff", 15);
    g.strokeStyle = "rgba(150,190,230,.5)";
    g.beginPath(); g.moveTo(rx - 96, ry - 40); g.lineTo(rx + 132, ry - 40);
    g.lineTo(rx + 132, ry + 40); g.lineTo(rx - 96, ry + 40); g.closePath(); g.stroke();
    label(D.unit.title.slice(0, 7), rx - 82, ry + 5, "#e8eef7", 14);
    var anchors = steps[i].anchors || [];
    for (var k = 0; k < anchors.length; k++) {
      var ax = 1180 - k * 0, ay = 430 + k * 58;
      var ax2 = 1010;
      var pulse = 0.55 + 0.45 * Math.sin(t * 2.2 - k * 0.7);
      g.strokeStyle = "rgba(150,190,230," + (0.30 + 0.30 * pulse).toFixed(3) + ")"; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(rx + 132, ry); g.bezierCurveTo(rx + 210, ry + 40, ax2 + 60, ay - 20, ax2, ay); g.stroke();
      glowDot(ax2, ay, 5, accent, 0.5 + 0.5 * pulse);
      label(anchors[k].label, ax2 + 16, ay + 5, "#dbe8f7", 13);
    }
    label("站內對應題目", 1010, 402, "#7f97b5", 12);
  }

  /* --------------------------------------------- 場景 5：片尾 */
  function scOutro(t) {
    var items = [["時事篇", 780], ["單元動畫", 975], ["題庫單題", 1170]];
    for (var k = 0; k < items.length; k++) {
      var x = items[k][1];
      g.strokeStyle = "rgba(150,190,230,.5)"; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x - 78, 300); g.lineTo(x + 78, 300);
      g.lineTo(x + 78, 372); g.lineTo(x - 78, 372); g.closePath(); g.stroke();
      label(items[k][0], x - 42, 342, "#e8eef7", 14);
      if (k < items.length - 1) {
        g.strokeStyle = "rgba(150,190,230,.55)";
        g.beginPath(); g.moveTo(x + 78, 336); g.lineTo(x + 116, 336); g.stroke();
        g.beginPath(); g.moveTo(x + 116, 336); g.lineTo(x + 106, 330); g.lineTo(x + 106, 342); g.closePath();
        g.fillStyle = "rgba(150,190,230,.7)"; g.fill();
      }
    }
    var ph = (t * 0.5) % 1;
    glowDot(780 + ph * 390, 336, 5, "#7fb6ff", 0.9);
    label("觀念 → 時事 → 題目 → 資源", 780, 250, "#9fc8ff", 15);
  }

  var SCENES = { title: scTitle, med: scMed, phys: scPhys, bridge: scBridge, outro: scOutro };

  function loop(now) {
    var t = (now - t0) / 1000;
    base(t);
    var fn = SCENES[steps[i] && steps[i].scene] || scTitle;
    try { fn(t); } catch (e) { if (ERR.length < 5) { ERR.push(String(e)); } }
    if (autoplay && t > (steps[i].dur || 12)) { if (i < steps.length - 1) { jump(i + 1, true); } else { autoplay = false; playBtn.textContent = "自動播放：關"; } }
    requestAnimationFrame(loop);
  }

  document.getElementById("hud-unit").textContent = D.unit.title;
  document.getElementById("note").textContent = D.note || "";
  document.getElementById("lnk-unit").href = D.backUnit;
  document.getElementById("lnk-home").href = D.backHome;
  buildDots();
  renderCard();
  requestAnimationFrame(function (now) { t0 = now; loop(now); });

  /* ------------------------------------------------------------- 驗收介面 */
  window.__xnews = {
    ready: true,
    version: D.version || "",
    unit: D.unit,
    news: D.news || [],
    steps: steps.length,
    anchors: steps.reduce(function (a, s) { return a + ((s.anchors || []).length); }, 0),
    links: steps.reduce(function (a, s) { return a + ((s.links || []).length); }, 0),
    state: function () {
      return { i: i, kind: steps[i] && steps[i].kind, scene: steps[i] && steps[i].scene, autoplay: autoplay, t: (performance.now() - t0) / 1000 };
    },
    jump: function (n) { jump(n); return this.state(); },
    ui: function () {
      var btns = [].map.call(document.querySelectorAll("button"), function (b) { return b.textContent; });
      return { dots: dotsEl.children.length, buttons: btns, cardHTML: card.innerHTML.length, hud: stepEl.textContent };
    },
    cardText: function () { return card.textContent; },
    errors: ERR
  };
})();
</script>
</body>
</html>
"""


def main():
    res = load_json_js(os.path.join(DATA_DIR, "resources.js"))
    subj = load_json_js(os.path.join(SITE, "assets/js/subjects.js"))
    subj_short = {s["id"]: s.get("short") or s.get("name") for s in subj["subjects"]}
    man_path = os.path.join(SITE, "assets/anim/cross/manifest.js")
    units_title = {}
    if os.path.exists(man_path):
        m = load_json_js(man_path)
        for u in m.get("units", []):
            units_title[u["id"]] = u["title"]
    os.makedirs(OUT_ANIM, exist_ok=True)

    kits = res.get("unitKits", [])
    if TARGETS:
        kits = [k for k in kits if k["id"] in TARGETS]
    manifest = {"version": res.get("version", ""), "updated": res.get("updated", TODAY), "units": []}
    for kit in kits:
        uid = kit["id"]
        title = units_title.get(uid) or kit.get("title") or uid
        page = build_page(kit, res, subj_short, title)
        out = os.path.join(OUT_ANIM, uid + ".html")
        open(out, "w", encoding="utf-8").write(html(page))
        print("✓ %s → %s（%d 段）" % (uid, os.path.relpath(out, SITE), len(page["steps"])))
        manifest["units"].append({
            "id": uid,
            "title": title,
            "src": "assets/anim/news/%s.html" % uid,
            "news": page["news"],
            "steps": len(page["steps"]),
            "anchors": sum(len(s.get("anchors", [])) for s in page["steps"]),
        })

    js = ("/* 由 tools/gen_news_anim.py 產生，請勿手改；"
          "資料來源 assets/js/data/resources.js */\n"
          "window.EXAM_NEWS_ANIM = "
          + json.dumps(manifest, ensure_ascii=False, indent=2) + ";\n")
    open(os.path.join(OUT_ANIM, "manifest.js"), "w", encoding="utf-8").write(js)
    print("✓ manifest → assets/anim/news/manifest.js（%d 個單元）" % len(manifest["units"]))


if __name__ == "__main__":
    main()
