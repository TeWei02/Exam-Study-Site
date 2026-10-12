# -*- coding: utf-8 -*-
"""一科練五科「觀點動畫」生成器（可擴充模板）
===============================================================================
資料來源：assets/js/data/cross.js 的 window.EXAM_CROSS.units（每個單元＝同一核心觀念在五科各一題）

產出：
  assets/anim/cross/<unit-id>.html          3B1B 風格 Canvas 分階段動畫 + 語音 + 字幕（單檔可離線播放）
  assets/anim/cross/<unit-id>/audio/segNN.mp3  edge-tts 曉曉(D) 旁白（逐段）
  assets/anim/cross/manifest.js             window.EXAM_CROSS_ANIM：站台引擎據此在 cross.html 直接嵌入播放器

擴充方式：cross.js 新增單元後，直接重跑本腳本即可（不必手改 cross.html／site.js）：
    python3 tools/gen_cross_anim.py                 # 全部單元
    python3 tools/gen_cross_anim.py balance-symmetry-conservation
    python3 tools/gen_cross_anim.py --no-tts        # 只重生 HTML（沿用既有音檔）
    python3 tools/gen_cross_anim.py --site=/path/to/site   # 指向別的站台根目錄（同一支模板可服務多站）

腳本會用 headless Chrome 讀 cross.js／subjects.js（純靜態站、file:// 可跑），
因此不依賴任何 JS 執行環境以外的解析器。
"""
import asyncio, json, os, re, subprocess, sys, time, urllib.parse, urllib.request

SITE = "/Users/kedewei/Desktop/代码/學習站"
for _arg in sys.argv[1:]:            # 可用 --site=<站台根目錄> 指向別的站台（模板化／測試用）
    if _arg.startswith("--site="):
        SITE = os.path.abspath(_arg.split("=", 1)[1])
OUT_ANIM = os.path.join(SITE, "assets/anim/cross")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT = 9411
VOICE, RATE = "zh-CN-XiaoxiaoNeural", "-6%"
CHARS_PER_SEC = 4.7

try:
    import edge_tts, zhconv
except ImportError as e:  # 依賴：pip install edge-tts zhconv
    sys.exit("缺少依賴（pip install edge-tts zhconv）：%s" % e)


# ---------------------------------------------------------------- 讀取站台資料
def read_site_data():
    """以 headless Chrome 讀 window.EXAM_CROSS / window.EXAM_INDEX（站台為純靜態 file://）"""
    import websocket  # websocket-client
    prof = os.path.join(os.environ.get("TMPDIR", "/tmp"), "gen_cross_anim_prof")
    proc = subprocess.Popen(
        [CHROME, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
         "--allow-file-access-from-files", "--remote-debugging-port=%d" % PORT,
         "--remote-allow-origins=*", "--user-data-dir=" + prof, "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(80):
            try:
                urllib.request.urlopen("http://127.0.0.1:%d/json/version" % PORT, timeout=1).read()
                break
            except Exception:
                time.sleep(0.25)
        else:
            raise RuntimeError("Chrome 未啟動")
        req = urllib.request.Request(
            "http://127.0.0.1:%d/json/new?%s" % (PORT, urllib.parse.quote("file://" + SITE + "/cross.html", safe="")),
            method="PUT")
        info = json.load(urllib.request.urlopen(req, timeout=10))
        ws = websocket.create_connection(info["webSocketDebuggerUrl"], timeout=40, suppress_origin=True)
        n = [0]

        def ev(expr, await_p=True):
            n[0] += 1
            ws.send(json.dumps({"id": n[0], "method": "Runtime.evaluate",
                                "params": {"expression": expr, "returnByValue": True, "awaitPromise": await_p}}))
            while True:
                d = json.loads(ws.recv())
                if d.get("id") == n[0]:
                    res = d.get("result", {})
                    if "exceptionDetails" in res:
                        raise RuntimeError(str(res["exceptionDetails"])[:300])
                    return res.get("result", {}).get("value")

        for _ in range(60):  # 等頁面真的載入完成，否則注入的 <script> 相對路徑會解析失敗
            try:
                if ev("document.readyState") == "complete" and str(ev("location.href")).endswith("cross.html"):
                    break
            except Exception:
                pass
            time.sleep(0.25)

        expr = ("(async()=>{var ls=['assets/js/subjects.js','assets/js/data/cross.js'];"
                "for(var i=0;i<ls.length;i++){await new Promise(function(r,j){var s=document.createElement('script');"
                "s.src=ls[i];s.onload=r;s.onerror=j;document.head.appendChild(s);});}"
                "return JSON.stringify({cross:window.EXAM_CROSS,index:window.EXAM_INDEX});})()")
        raw = ev(expr)
        ws.close()
        return json.loads(raw)
    finally:
        proc.terminate()


# ---------------------------------------------------------------- 文字前處理
def sents(text):
    text = re.sub(r"\s+", "", text or "")
    return [s for s in re.split(r"(?<=[。！？])", text) if s]


def trim_sents(text, limit):
    out, ln = "", 0
    for s in sents(text):
        if ln >= limit and out:
            break
        out += s
        ln += len(s)
    return out or (text or "")


def split_groups(items, k):
    """把句子群切成 k 組（盡量平均）"""
    if not items:
        return [[]]
    k = max(1, min(k, len(items)))
    out, n = [], len(items)
    for i in range(k):
        a, b = round(i * n / k), round((i + 1) * n / k)
        out.append(items[a:b] if b > a else items[a:a + 1])
    return [g for g in out if g]


def chips_of(u):
    """關鍵字卡：cross.js 的 unit.chips 優先；沒有才從 keyIdea 的「不變的 X（Y）」自動抽取"""
    got = u.get("chips") or []
    if got:
        return [{"tag": str(c.get("tag") or ""), "word": str(c.get("word") or "")} for c in got][:4]
    got = re.findall(r"不變的(.)（([^）]+)）", u.get("keyIdea") or "")
    if got:
        return [{"tag": "不變的" + a, "word": b} for a, b in got][:4]
    return [{"tag": "核心觀念", "word": trim_sents(u.get("keyIdea"), 14)}]


# ---------------------------------------------------------------- 場景腳本
def build_scenes(u, name_of):
    S = []

    def add(kind, phase="", text="", **payload):
        d = {"kind": kind, "phase": phase, "text": text}
        d.update(payload)
        S.append(d)

    sub = re.sub(r"｜.*$", "", u.get("subtitle") or "")
    steps_all = u.get("steps") or []
    route = "、".join("%s第 %s 題" % (name_of(st["subject"]), st.get("n")) for st in steps_all)

    # 片頭標題卡（DOM 卡片）＋旁白：先把標題、年度與路線講清楚
    add("title", text="一科練五科，觀點動畫。這一集談的是「%s」。%s。路線是：%s。" % (u["title"], sub, route))
    add("open", text="這一集要談的是：%s。%s" % (u["title"], sub))

    grp = split_groups(sents(u.get("intro")), 3)
    for gi, g in enumerate(grp):
        add("path", text="".join(g), reveal=gi + 1, total=len(grp))

    kgrp = split_groups(sents(u.get("keyIdea")), 2)
    for gi, g in enumerate(kgrp):
        add("idea", text="".join(g), stage=gi)

    for i, st in enumerate(u.get("steps") or []):
        nm = name_of(st["subject"])
        add("stop", "node", "第 %d 站，%s第 %s 題。%s。" % (i + 1, nm, st.get("n"), st.get("point") or ""),
            i=i, subject=st["subject"])
        add("stop", "why", trim_sents(st.get("why"), 74), i=i, subject=st["subject"])
        if st.get("next"):
            add("stop", "next", st["next"], i=i, subject=st["subject"])

    add("close", text="五個科目，同一個核心觀念。%s——練一科，等於把其他四科的同一個觀念也走過一次。" % u["title"])
    # 片尾重點回顧卡（DOM 卡片）＋旁白：五站重點逐句唸回來
    recap = "；".join("第 %d 站，%s第 %s 題，%s" % (i + 1, name_of(st["subject"]), st.get("n"), st.get("point") or "")
                      for i, st in enumerate(steps_all))
    add("recap", text="重點回顧。%s。五題指向同一件事：%s" % (recap, trim_sents(u.get("keyIdea"), 66)))
    add("end", text="這條線的起點可以是任何一科。挑一科開始，就等於走過五科。")
    return S


def build_chapters(scenes, nodes, name_of):
    """章節地圖側欄資料：五個站（點下去跳場景）＋起點／核心／收束／回顧"""
    def find(kind, **cond):
        for i, s in enumerate(scenes):
            if s["kind"] != kind:
                continue
            if all(s.get(k) == v for k, v in cond.items()):
                return i
        return None

    got = []
    for i, n in enumerate(nodes):
        got.append({"label": "第 %d 站　%s　第 %s 題" % (i + 1, n["name"], n["n"]),
                    "sub": n["point"], "scene": n["sceneNode"], "no": i + 1})
    return {
        "title": find("title") or 0,
        "open": find("open"),
        "idea": find("idea") or 0,
        "stops": got,
        "close": find("close") or 0,
        "recap": find("recap"),
    }


# ---------------------------------------------------------------- TTS：逐段語音 + 逐字時間
async def synth(text, path):
    """回傳 edge-tts 的 WordBoundary 清單（單位：秒）"""
    com = edge_tts.Communicate(text, VOICE, rate=RATE)
    bounds = []
    with open(path, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                bounds.append({"t": ch["text"], "o": ch["offset"] / 1e7, "d": ch["duration"] / 1e7})
    return bounds


def char_times(st, bounds):
    """把逐詞時間攤平成「每個字」的 (start, end)"""
    n = len(st)
    if not n:
        return None
    times = [None] * n
    cur = 0
    for b in bounds:
        w = b["t"]
        if not w:
            continue
        i = st.find(w, cur)
        if i < 0:
            i = st.find(w)
        if i < 0:
            continue
        for k in range(i, min(i + len(w), n)):
            times[k] = (b["o"], b["o"] + b["d"])
        cur = i + len(w)
    if all(x is None for x in times):
        return None
    prev = (bounds[0]["o"], bounds[0]["o"] + bounds[0]["d"])
    for k in range(n):
        if times[k] is None:
            times[k] = prev
        prev = times[k]
    nxt = times[-1]
    for k in range(n - 1, -1, -1):
        if times[k] is None:
            times[k] = nxt
        nxt = times[k]
    return times


def chunks_with_time(hant, est_dur, bounds):
    """字幕切塊（依標點）＋每塊的起訖時間：由簡體逐字時間對回繁體"""
    st = zhconv.convert(hant, "zh-cn")
    times = char_times(st, bounds)
    # 簡體字索引 → 繁體字索引
    def to_hant(i):
        if len(st) == len(hant):
            return i
        return int(round(i * len(hant) / max(1, len(st))))

    out, idx = [], 0
    for part in re.finditer(r"[^，。、：；！？,.;:!?]+[，。、：；！？,.;:!?]?", hant):
        t = part.group(0)
        a, b = part.start(), part.end()
        if times:
            ta = [times[to_hant(k)] for k in range(min(a, len(st) - 1), min(b, len(st))) if 0 <= to_hant(k) < len(times)]
            ta = [x for x in (times[min(to_hant(k), len(times) - 1)] for k in range(min(a, len(st)), min(b, len(st)))) if x]
            t0 = min(x[0] for x in ta) if ta else None
            t1 = max(x[1] for x in ta) if ta else None
        else:
            t0 = t1 = None
        out.append({"t": t, "t0": t0, "t1": t1, "i": idx})
        idx += 1
    # 缺時間 → 依字數比例回填
    if any(c["t0"] is None for c in out):
        total = sum(len(c["t"]) for c in out) or 1
        acc = 0.0
        for c in out:
            if c["t0"] is None:
                c["t0"] = est_dur * acc / total
                c["t1"] = est_dur * (acc + len(c["t"])) / total
            acc += len(c["t"])
    return out


# ---------------------------------------------------------------- 主流程
def gen_unit(u, index, output_dir, do_tts=True):
    uid = u["id"]
    subs = {s["id"]: s for s in (index.get("subjects") or [])}

    def name_of(sid):
        s = subs.get(sid) or {}
        return s.get("short") or s.get("name") or sid

    scenes = build_scenes(u, name_of)
    audio_dir = os.path.join(output_dir, uid, "audio")
    os.makedirs(audio_dir, exist_ok=True)

    for i, sc in enumerate(scenes):
        sc["audio"] = "%s/audio/seg%02d.mp3" % (uid, i + 1)
        sc["path"] = os.path.join(audio_dir, "seg%02d.mp3" % (i + 1))
        sc["dur"] = round(len(sc["text"]) / CHARS_PER_SEC + 0.7, 2)

    if do_tts:
        for i, sc in enumerate(scenes):
            tmp = sc["path"]
            if os.path.exists(tmp):
                try:  # 逐段比對：文字沒變就沿用既有音檔
                    st = zhconv.convert(sc["text"], "zh-cn")
                    old = json.load(open(sc["path"] + ".json", encoding="utf-8"))
                    if old.get("simplified") == st:
                        sc["chunks"] = chunks_with_time(sc["text"], sc["dur"], [(b["t"], b["o"], b["d"]) and b for b in old["bounds"]])
                        continue
                except Exception:
                    pass
            try:
                bounds = asyncio.run(synth(zhconv.convert(sc["text"], "zh-cn"), tmp))
            except Exception as e:
                print("  !! 段 %d 語音失敗：%s" % (i + 1, e))
                bounds = []
            json.dump({"simplified": zhconv.convert(sc["text"], "zh-cn"), "bounds": bounds},
                      open(sc["path"] + ".json", "w", encoding="utf-8"), ensure_ascii=False)
            print("  · 段 %02d/%d  %s" % (i + 1, len(scenes), sc["text"][:22]))
    for sc in scenes:
        if "chunks" not in sc:
            try:
                meta = json.load(open(sc["path"] + ".json", encoding="utf-8"))
                sc["chunks"] = chunks_with_time(sc["text"], sc["dur"], meta["bounds"])
            except Exception:
                sc["chunks"] = chunks_with_time(sc["text"], sc["dur"], [])

    # 畫面資料
    steps = u.get("steps") or []
    nodes = [{
        "subject": st["subject"],
        "name": name_of(st["subject"]),
        "n": st.get("n"),
        "role": st.get("role") or "",
        "point": st.get("point") or "",
        "why": st.get("why") or "",
        "next": st.get("next") or "",
        "sceneNode": next(i for i, s in enumerate(scenes) if s["kind"] == "stop" and s.get("i") == k and s["phase"] == "node"),
    } for k, st in enumerate(steps)]

    data = {
        "unit": {"id": uid, "title": u["title"], "subtitle": re.sub(r"｜.*$", "", u.get("subtitle") or ""),
                 "yearLabel": u.get("yearLabel") or "", "startSubject": u.get("startSubject") or "",
                 "keyIdea": u.get("keyIdea") or "", "chips": chips_of(u),
                 "nodes": nodes,
                 "chapters": build_chapters(scenes, nodes, name_of),
                 "recap": [{"no": i + 1, "subject": n["subject"], "name": n["name"], "n": n["n"],
                            "role": n["role"], "point": n["point"], "scene": n["sceneNode"]}
                           for i, n in enumerate(nodes)]},
        "scenes": [{"kind": s["kind"], "phase": s["phase"], "text": s["text"], "audio": s["audio"],
                    "dur": s["dur"], "reveal": s.get("reveal"), "total": s.get("total"),
                    "stage": s.get("stage"), "i": s.get("i"), "chunks": s["chunks"]} for s in scenes],
        "meta": {"voice": VOICE, "rate": RATE, "charsPerSec": CHARS_PER_SEC,
                 "estimate": round(sum(s["dur"] for s in scenes), 1),
                 "generated": time.strftime("%Y-%m-%d %H:%M:%S")},
    }

    html = TEMPLATE.replace("/*__DATA__*/", json.dumps(data, ensure_ascii=False))
    out_html = os.path.join(output_dir, uid + ".html")
    open(out_html, "w", encoding="utf-8").write(html)
    print("  ✓ %s（%d 段，約 %.1f 分）→ %s" % (uid, len(scenes), data["meta"]["estimate"] / 60.0, out_html))
    return {
        "id": uid, "title": u["title"], "subject": u.get("startSubject") or "",
        "src": "assets/anim/cross/%s.html" % uid,
        "segments": len(scenes), "seconds": data["meta"]["estimate"],
        "stops": [{"subject": n["subject"], "name": n["name"], "n": n["n"], "point": n["point"],
                   "scene": n["sceneNode"]} for n in nodes],
    }


def write_manifest(units):
    body = ("/* 自動產生（tools/gen_cross_anim.py）：cross.js 新增單元後重跑即可，勿手改。 */\n"
            "window.EXAM_CROSS_ANIM = " + json.dumps({"version": "1.0", "units": units}, ensure_ascii=False, indent=2) + ";\n")
    p = os.path.join(OUT_ANIM, "manifest.js")
    open(p, "w", encoding="utf-8").write(body)
    print("✓ manifest → %s（%d 個單元）" % (p, len(units)))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    do_tts = "--no-tts" not in sys.argv
    d = read_site_data()
    cross, index = d.get("cross") or {}, d.get("index") or {}
    units = cross.get("units") or []
    if args:
        units = [u for u in units if u["id"] in args]
    os.makedirs(OUT_ANIM, exist_ok=True)
    man = []
    for u in units:
        print("▶ 單元 %s" % u["id"])
        man.append(gen_unit(u, index, OUT_ANIM, do_tts))
    write_manifest(man)
    print(json.dumps(man, ensure_ascii=False, indent=2))


TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>觀點動畫｜一科練五科</title>
<script>/* 驗收用：JS 錯誤計數器（掛在 <html data-js-errors>） */
(function(){window.__errs=0;function bump(){window.__errs++;document.documentElement.setAttribute('data-js-errors',String(window.__errs));}
document.documentElement.setAttribute('data-js-errors','0');
window.addEventListener('error',bump);window.addEventListener('unhandledrejection',bump);})();</script>
<style>
:root{--fg:#e9eefc;--dim:#93a1c8;--gold:#ffd166;--cy:#66d9ef;--pk:#ff8fa3;--gr:#7ee787;--pu:#c792ea;--line:#25315a}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#070a14;color:var(--fg);overflow:hidden;
  font-family:"PingFang TC","Helvetica Neue",system-ui,sans-serif;
  background-image:radial-gradient(1200px 660px at 50% -12%,#16203c,#070a14 74%)}
#wrap{position:fixed;left:50%;top:50%;width:1280px;height:720px;transform:translate(-50%,-50%) scale(var(--k,1));transform-origin:center center}
#stage{position:absolute;left:0;top:0;width:1280px;height:620px}
#cv{position:absolute;left:0;top:0;width:1280px;height:620px;display:block}
.topbar{position:absolute;left:34px;right:34px;top:14px;height:40px;display:flex;align-items:center;gap:10px;z-index:3}
.topbar .ttl{font-size:14px;color:var(--dim);white-space:nowrap;letter-spacing:.4px}
.topbar .ttl b{color:var(--cy);font-weight:600}
.topbar .spacer{flex:1}
.stops{display:flex;gap:6px}
.stops button{font:inherit;font-size:13px;padding:5px 11px;border-radius:999px;cursor:pointer;
  border:1px solid var(--line);background:#111a33;color:#8fa0cc;transition:.2s}
.stops button:hover{border-color:#41558c;color:var(--fg)}
.stops button.on{color:#fff;border-color:var(--cy);background:linear-gradient(180deg,#2a3a68,#1b2748);box-shadow:0 0 14px rgba(102,217,239,.32)}
.stops button.done{color:#cfe3ff;border-color:#3d5a92}
#center{position:absolute;left:280px;right:280px;top:86px;text-align:center;pointer-events:none;transition:opacity .5s ease;z-index:2}
#plate{display:inline-block;padding:14px 26px;border-radius:16px;border:1px solid #2b3967;
  background:linear-gradient(180deg,rgba(23,33,64,.92),rgba(13,19,40,.86));box-shadow:0 10px 40px rgba(0,0,0,.45)}
#plate .k{font-size:12px;letter-spacing:2px;color:var(--dim)}
#plate .h{font-size:26px;margin-top:6px;font-weight:600}
#plate .b{font-size:16px;margin-top:8px;line-height:1.6;color:#c8d6f5}
#plate .tagline{margin-top:10px;font-size:14px;color:var(--gold)}
#plate.hide{display:none}
#chips{position:absolute;left:0;right:0;top:452px;display:flex;justify-content:center;gap:14px;z-index:2;pointer-events:none}
#chips .chip{opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .6s ease;
  padding:10px 18px;border-radius:14px;border:1px solid #35477c;background:rgba(17,26,51,.86);text-align:center;min-width:150px}
#chips .chip.on{opacity:1;transform:none}
#chips .chip .t{font-size:12px;color:var(--dim)}
#chips .chip .w{font-size:19px;color:var(--gold);margin-top:4px;font-weight:600}
#subs{position:absolute;left:120px;right:120px;bottom:6px;min-height:74px;display:flex;align-items:center;justify-content:center;
  flex-wrap:wrap;gap:2px 4px;font-size:21px;line-height:1.55;text-align:center;z-index:3}
#subs .ck{color:#6f7fae;transition:color .28s ease,text-shadow .28s ease}
#subs .ck.on{color:#fff;text-shadow:0 0 16px rgba(102,217,239,.55)}
#subs .ck.done{color:#c3d3f4}
#bar{position:absolute;left:0;right:0;top:628px;height:64px;display:flex;align-items:center;gap:14px;padding:0 34px}
#bar button{font:inherit;cursor:pointer;border-radius:11px;border:1px solid var(--line);background:#111a33;color:#cfe0ff;padding:9px 14px;transition:.2s}
#bar button:hover{border-color:#41558c}
#bar button.pri{background:linear-gradient(180deg,#2f4373,#1d2b4f);border-color:var(--cy);color:#fff}
#bar .time{font-variant-numeric:tabular-nums;color:var(--dim);font-size:14px;min-width:96px}
#prog{flex:1;height:6px;border-radius:99px;background:#1a2444;position:relative;overflow:hidden;cursor:pointer}
#prog i{position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(90deg,#66d9ef,#ffd166);transition:width .18s linear}
#hint{position:absolute;left:0;right:0;top:694px;height:26px;text-align:center;font-size:14px;color:var(--gold)}
#hint.hide{display:none}
#wrap.sound-off #sndbtn{color:var(--gold);border-color:#7a6528}
/* ---------- 章節地圖側欄 ---------- */
.mapbtn{font:inherit;font-size:13px;padding:5px 11px;border-radius:999px;cursor:pointer;margin-left:6px;
  border:1px solid var(--line);background:#111a33;color:#8fa0cc;transition:.2s;white-space:nowrap}
.mapbtn:hover{border-color:#41558c;color:var(--fg)}
.mapbtn.on{color:#fff;border-color:var(--gold);background:linear-gradient(180deg,#3a3352,#241f36)}
#map{position:absolute;left:0;top:0;bottom:0;width:336px;z-index:4;padding:78px 16px 14px;
  background:linear-gradient(180deg,rgba(9,14,30,.975),rgba(7,10,20,.95));border-right:1px solid #22305a;
  transform:translateX(-103%);transition:transform .28s ease;overflow:auto}
#map.on{transform:none}
#map h4{font-size:13px;color:var(--dim);letter-spacing:1px;font-weight:600;margin:2px 0 8px}
#map .cap{font-size:11px;color:#6f7fae;letter-spacing:1px;margin:12px 0 6px;border-top:1px solid #1d2a4d;padding-top:9px}
#map .mrow{display:flex;align-items:flex-start;gap:9px;text-align:left;font:inherit;font-size:14px;cursor:pointer;
  width:100%;padding:8px 10px;margin-bottom:4px;border-radius:10px;border:1px solid transparent;
  background:transparent;color:#c8d6f5;transition:.15s}
#map .mrow:hover{background:#131d38;border-color:#2b3a68}
#map .mrow.on{background:linear-gradient(180deg,#25335c,#1a2543);border-color:var(--cy);color:#fff}
#map .mrow.done{color:#8ea6d6}
#map .mrow i{width:20px;height:20px;flex:0 0 20px;border-radius:50%;border:1px solid #3a4a78;font-style:normal;
  font-size:12px;line-height:18px;text-align:center;color:#9fb0da;margin-top:1px}
#map .mrow.on i{border-color:var(--cy);color:#fff}
#map .mrow .tx{flex:1;min-width:0}
#map .mrow .tx b{display:block;font-weight:600;font-size:14px}
#map .mrow .tx span{display:block;font-size:12px;color:#8fa0cc;margin-top:2px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#wrap.map-open #center{opacity:0}
/* ---------- 片頭標題卡／片尾重點回顧卡 ---------- */
.cards{position:absolute;inset:0;z-index:3;display:none;align-items:center;justify-content:center}
.cards.on{display:flex}
.cards .card{max-width:1000px;padding:28px 38px;border-radius:20px;border:1px solid #2b3967;
  background:linear-gradient(180deg,rgba(20,29,58,.965),rgba(11,16,34,.945));box-shadow:0 18px 60px rgba(0,0,0,.55);
  animation:cardin .45s ease both}
.cards .eyebrow{font-size:13px;letter-spacing:3px;color:var(--gold);text-align:center}
.cards .bigtitle{font-size:42px;font-weight:600;text-align:center;margin-top:14px;line-height:1.25}
.cards .cardsub{font-size:18px;color:#c8d6f5;text-align:center;margin-top:12px;line-height:1.6}
.cards .meta{display:flex;justify-content:center;gap:10px;margin-top:18px;flex-wrap:wrap}
.cards .meta span{font-size:14px;color:#9fb0da;border:1px solid #34456f;border-radius:999px;padding:5px 13px}
.cards .route{margin-top:20px;font-size:14px;color:#8fa0cc;text-align:center;border-top:1px solid #22305a;padding-top:14px}
.cards h5{font-size:15px;letter-spacing:2px;color:var(--gold);text-align:center;margin-bottom:16px}
.cards .rrow{display:flex;gap:12px;align-items:flex-start;padding:9px 12px;border-radius:12px;border:1px solid #26345c;
  background:rgba(14,21,42,.6);margin-bottom:9px}
.cards .rrow i{width:26px;height:26px;flex:0 0 26px;border-radius:50%;border:1px solid #3a4a78;font-style:normal;
  font-size:13px;line-height:24px;text-align:center;color:#cfe0ff}
.cards .rrow b{font-size:15px}
.cards .rrow .rsub{font-size:14px;color:#9fb0da;margin-top:2px;line-height:1.5}
.cards .keyline{margin-top:12px;font-size:15px;color:#ffd166;text-align:center;line-height:1.6}
#bug{position:absolute;left:-9999px;top:-9999px}
</style>
</head>
<body>
<div id="wrap">
  <div id="stage">
    <canvas id="cv" width="2560" height="1240"></canvas>
    <div class="topbar">
      <span class="ttl">一科練五科　觀點動畫　<b id="unit-title"></b></span>
      <span class="spacer"></span>
      <span class="stops" id="stops"></span>
      <button class="mapbtn" id="mapbtn" type="button">章節地圖</button>
    </div>
    <div id="center"><div id="plate"><div class="k" id="p-k"></div><div class="h" id="p-h"></div><div class="b" id="p-b"></div><div class="tagline" id="p-t"></div></div></div>
    <div id="chips"></div>
    <div id="subs"></div>
    <div id="map"><h4>章節地圖</h4><div id="map-body"></div></div>
    <div class="cards" id="card-title"></div>
    <div class="cards" id="card-recap"></div>
  </div>
  <div id="bar">
    <button class="pri" id="playbtn" type="button">播放</button>
    <button id="restart" type="button">從頭</button>
    <button id="sndbtn" type="button">語音：開</button>
    <button id="spdbtn" type="button">速度 1.0×</button>
    <span class="time" id="time">00:00 / 00:00</span>
    <div id="prog"><i></i></div>
  </div>
  <div id="hint" class="hide"></div>
  <div id="bug"></div>
</div>
<script>
(function(){
  'use strict';
  var D = /*__DATA__*/;
  var SUBCOL = {'english':'#ff8fa3','chemistry':'#7ee787','physics':'#66d9ef','math-a':'#ffd166','chinese':'#c792ea',
                'math-b':'#ffd166','history':'#f0a868','geography':'#7ee787','civics':'#66d9ef'};
  var $ = function(id){return document.getElementById(id);};
  var wrap=$('wrap'), cv=$('cv'), ctx=cv.getContext('2d');
  var CW=1280, CH=620, CX=640, CY=304, RX=392, RY=166;
  var scenes=D.scenes, unit=D.unit, nodes=unit.nodes, N=nodes.length;
  var estDur = scenes.map(function(s){return s.dur;});

  /* ---------- 音檔：載入 metadata 取得精確長度，建時間軸 ---------- */
  var AUD=[], DUR=estDur.slice(), starts=[], soundOn=true, playing=false, speed=1, t=0, cur=0, audioReady=false;
  scenes.forEach(function(s,i){
    var a=new Audio();
    a.preload='auto'; a.src=s.audio;
    a.addEventListener('loadedmetadata',function(){ if(isFinite(a.duration)&&a.duration>0){ DUR[i]=a.duration; timeline(); } });
    a.addEventListener('ended',function(){ if(soundOn&&playing&&cur===i){ goTo(i+1,true); } });
    AUD.push(a);
  });
  function timeline(){ var s=0; starts=[]; for(var i=0;i<DUR.length;i++){ starts.push(s); s+=DUR[i]; } total=s; $('time').textContent='00:00 / '+fmt(total); }
  var total=0; timeline();
  function fmt(x){ x=Math.max(0,x||0); var m=Math.floor(x/60), s=Math.floor(x%60); return (m<10?'0':'')+m+':'+(s<10?'0':'')+s; }

  /* ---------- 場景幾何 ---------- */
  function pos(i){ var a=(-90+i*72)*Math.PI/180; return [CX+RX*Math.cos(a), CY+RY*Math.sin(a)]; }
  function col(i){ var n=nodes[i]; return SUBCOL[n.subject]||'#66d9ef'; }
  var stars=[]; for(var i=0;i<120;i++){ stars.push({x:Math.random()*CW,y:Math.random()*CH,r:Math.random()*1.5+.4,p:Math.random()*6.28}); }
  function ease(p){ return p<0?0:(p>1?1:1-Math.pow(1-p,3)); }
  function clamp(x,a,b){ return x<a?a:(x>b?b:x); }

  /* ---------- 畫布繪製 ---------- */
  function bg(tt){
    var g=ctx.createLinearGradient(0,0,0,CH); g.addColorStop(0,'#0a1024'); g.addColorStop(1,'#060912');
    ctx.fillStyle=g; ctx.fillRect(0,0,CW,CH);
    for(var i=0;i<stars.length;i++){ var s=stars[i]; var al=.25+.35*Math.sin(tt*1.1+s.p);
      ctx.fillStyle='rgba(160,190,255,'+al.toFixed(3)+')'; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,6.2832); ctx.fill(); }
  }
  function nodeShape(i,alpha,scale,fill){
    var p=pos(i), r=34*scale;
    ctx.save(); ctx.globalAlpha=alpha;
    if(fill){ ctx.shadowColor=col(i); ctx.shadowBlur=26; }
    ctx.beginPath(); ctx.arc(p[0],p[1],r,0,6.2832);
    ctx.fillStyle=fill?col(i):'rgba(18,27,52,.95)'; ctx.fill();
    ctx.lineWidth=2; ctx.strokeStyle=fill?col(i):'#31406e'; ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle=fill?'#08101f':'#c8d6f5'; ctx.font='600 17px "PingFang TC",system-ui,sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(String(i+1),p[0],p[1]+1);
    ctx.globalAlpha=1; ctx.fillStyle=fill?'#e9eefc':'#8fa0cc'; ctx.font='600 19px "PingFang TC",system-ui,sans-serif';
    ctx.fillText(nodes[i].name, p[0], p[1]+r+24);
    if(nodes[i].role){ ctx.fillStyle='#ffd166'; ctx.font='13px "PingFang TC",system-ui,sans-serif';
      ctx.fillText(nodes[i].role, p[0], p[1]+r+45); }
    ctx.restore();
  }
  function ring(alpha,dash){ ctx.save(); ctx.globalAlpha=alpha; ctx.setLineDash(dash?[8,10]:[]);
    ctx.strokeStyle='#2b3a68'; ctx.lineWidth=2; ctx.beginPath();
    ctx.ellipse(CX,CY,RX,RY,0,0,6.2832); ctx.stroke(); ctx.restore(); }
  function hub(alpha,scale,label){
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.shadowColor='#ffd166'; ctx.shadowBlur=34;
    var g=ctx.createRadialGradient(CX,CY,4,CX,CY,72*scale);
    g.addColorStop(0,'rgba(255,209,102,.95)'); g.addColorStop(1,'rgba(255,209,102,.18)');
    ctx.beginPath(); ctx.arc(CX,CY,72*scale,0,6.2832); ctx.fillStyle=g; ctx.fill();
    ctx.shadowBlur=0; ctx.beginPath(); ctx.arc(CX,CY,72*scale,0,6.2832);
    ctx.strokeStyle='rgba(255,209,102,.85)'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='#fff8e2'; ctx.font='600 18px "PingFang TC",system-ui,sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label||'核心觀念',CX,CY);
    ctx.restore();
  }
  function edge(i,prog,color){
    var p=pos(i), xa=CX+ (p[0]-CX)*prog, ya=CY+(p[1]-CY)*prog;
    ctx.save(); ctx.lineWidth=3; ctx.strokeStyle=color||'rgba(102,217,239,.75)';
    ctx.shadowColor=color||'#66d9ef'; ctx.shadowBlur=14;
    ctx.beginPath(); ctx.moveTo(CX,CY); ctx.lineTo(xa,ya); ctx.stroke(); ctx.restore();
  }
  function arcBetween(i,j,prog,color){
    var a=pos(i), b=pos(j), mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2;
    var nx=(my-CY), ny=-(mx-CX), L=Math.hypot(nx,ny)||1, bulge=34;
    var cx2=mx+nx/L*bulge, cy2=my+ny/L*bulge;
    ctx.save(); ctx.lineWidth=2.5; ctx.strokeStyle=color; ctx.setLineDash([7,7]);
    ctx.lineDashOffset=-performance.now()/60;
    ctx.beginPath(); ctx.moveTo(a[0],a[1]);
    ctx.quadraticCurveTo(cx2,cy2,a[0]+(b[0]-a[0])*prog,a[1]+(b[1]-a[1])*prog); ctx.stroke(); ctx.restore();
  }
  function glowText(txt,x,y,size,color,alpha){
    ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle=color; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.shadowColor=color; ctx.shadowBlur=22; ctx.font='600 '+size+'px "PingFang TC",system-ui,sans-serif';
    ctx.fillText(txt,x,y); ctx.restore();
  }

  /* ---------- 依場景繪製 ---------- */
  function draw(tt,scene,p){
    bg(tt);
    var kind=scene.kind, phase=scene.phase;
    var visited = (kind==='stop')? scene.i : ((kind==='close'||kind==='end'||kind==='recap')? N-1 : -1);
    if(kind==='title'||kind==='recap'){
      var p2=clamp(p*1.4,0,1);
      ring(kind==='title'? .3+.5*p2 : 1, kind==='recap');
      for(var q=0;q<N;q++){ edge(q, kind==='title'? .5*p2 : 1, col(q)); nodeShape(q, kind==='title'? .3+.7*p2 : 1, .95, kind==='recap'); }
      return;
    }
    if(kind==='open'){
      var a=clamp((p-.12)/.4,0,1);
      ring(a*.7,true);
      for(var i=0;i<N;i++){ nodeShape(i, clamp(a*1.15-i*.06,0,1), .9); }
      glowText(unit.title, CX, CY-8, 46, '#e9eefc', clamp(p*2.4,0,1));
      glowText('五科 × 一個核心觀念', CX, CY+44, 20, '#ffd166', clamp((p-.35)*2.2,0,1));
      return;
    }
    if(kind==='path'){
      ring(.55,true);
      var revealed = scene.reveal;
      for(var i=0;i<N;i++){
        var on = i<revealed-1 ? 1 : (i===revealed-1 ? clamp(p*2.2,0,1) : .0);
        if(on<=0){ continue; }
        nodeShape(i,on,.86,false);
      }
      return;
    }
    if(kind==='idea'){
      ring(.4,true);
      for(var i=0;i<N;i++){ nodeShape(i,.3,.8,false); }
      hub(clamp(p*2,0,1), .9+.06*Math.sin(tt*3), '核心觀念');
      return;
    }
    if(kind==='stop'){
      ring(.4,true);
      for(var i=0;i<N;i++){
        if(i<visited){ nodeShape(i,.95,.9,true); edge(i,1,col(i)); }
        else if(i>visited){ nodeShape(i,.28,.82,false); }
      }
      var pul = .5+.5*Math.sin(tt*4);
      if(phase==='node'){
        edge(visited, clamp(p*1.4,0,1), 'rgba(255,209,102,.8)');
        nodeShape(visited,.55+.45*clamp(p*1.5,0,1),1.06+.16*pul,true);
        hub(.85,.72,'核心觀念');
      } else if(phase==='why'){
        edge(visited,1,col(visited));
        nodeShape(visited,1,1.12+.10*pul,true);
        hub(.9,.8,'核心觀念');
        ctx.save(); ctx.globalAlpha=clamp(p*1.6,0,1);
        ctx.strokeStyle='rgba(233,238,252,.5)'; ctx.lineWidth=2; ctx.setLineDash([4,6]);
        ctx.beginPath(); ctx.arc(pos(visited)[0],pos(visited)[1],58+6*pul,0,6.2832); ctx.stroke(); ctx.restore();
      } else {
        edge(visited,1,col(visited));
        nodeShape(visited,1,1.08,true);
        hub(.7,.7,'核心觀念');
        if(visited+1<N){ arcBetween(visited,visited+1,clamp(p*1.5,0,1),'rgba(255,209,102,.9)');
          glowText('下一站：'+nodes[visited+1].name, CX, CY+112, 20, '#ffd166', clamp((p-.3)*2,0,1)); }
      }
      return;
    }
    if(kind==='close'||kind==='end'){
      ring(1,false);
      for(var i=0;i<N;i++){ nodeShape(i,1,.95,true); edge(i,1,col(i)); }
      var da=tt*0.9%(2*Math.PI);
      var lx=CX+RX*Math.cos(da), ly=CY+RY*Math.sin(da);
      ctx.save(); ctx.shadowColor='#ffd166'; ctx.shadowBlur=30; ctx.fillStyle='#ffd166';
      ctx.beginPath(); ctx.arc(lx,ly,7,0,6.2832); ctx.fill(); ctx.restore();
      if(kind==='close'){
        glowText('核心觀念', CX, CY, 30, '#ffd166', .9);
        glowText('五科串成一條線', CX, CY+126, 24, '#e9eefc', clamp(p*1.8,0,1));
      } else {
        glowText(unit.title, CX, CY-4, 40, '#e9eefc', clamp(p*1.6,0,1));
        glowText('練一科，走過五科', CX, CY+52, 24, '#ffd166', clamp((p-.25)*1.8,0,1));
      }
      return;
    }
  }

  /* ---------- 文字／字幕／面板 ---------- */
  var plate=$('plate'), subs=$('subs'), chips=$('chips'), stopsBox=$('stops');
  stopsBox.innerHTML = nodes.map(function(n,i){ return '<button type="button" data-i="'+i+'">'+n.name+'</button>'; }).join('');
  chips.innerHTML = (unit.chips||[]).map(function(c){ return '<div class="chip"><div class="t">'+c.tag+'</div><div class="w">'+c.word+'</div></div>'; }).join('');
  $('unit-title').textContent = unit.title;

  /* ---------- 片頭標題卡／片尾重點回顧卡（DOM 卡片） ---------- */
  var cardTitle=$('card-title'), cardRecap=$('card-recap');
  var CH_=unit.chapters||{}, recapRows=unit.recap||[];
  var route = nodes.map(function(n){ return n.name; }).join('　→　');
  cardTitle.innerHTML = '<div class="card" id="title-card">'
    + '<div class="eyebrow">一科練五科　觀點動畫</div>'
    + '<div class="bigtitle" id="title-card-h">'+unit.title+'</div>'
    + '<div class="cardsub" id="title-card-sub">'+((unit.yearLabel?unit.yearLabel+'｜':'')+unit.subtitle)+'</div>'
    + '<div class="meta"><span>五科 × 一個核心觀念</span><span>'+N+' 站</span>'
    +   '<span>'+(unit.yearLabel||'')+'</span><span>約 '+Math.max(1,Math.round((D.meta?D.meta.estimate:0)/60))+' 分鐘</span></div>'
    + '<div class="route" id="title-card-route">學習路線：'+route+'</div>'
    + '</div>';
  cardRecap.innerHTML = '<div class="card recap" id="recap-card">'
    + '<h5>重點回顧</h5>'
    + recapRows.map(function(r){
        return '<div class="rrow" data-scene="'+r.scene+'"><i>'+r.no+'</i><div><b>'+r.name+'　第 '+r.n+' 題</b>'
             + '<div class="rsub">'+r.point+'</div></div></div>'; }).join('')
    + '<div class="keyline">'+String(unit.keyIdea||'').split('。')[0]+'。</div>'
    + '</div>';

  /* ---------- 章節地圖側欄 ---------- */
  var mapBox=$('map'), mapBody=$('map-body'), mapbtn=$('mapbtn');
  mapBody.innerHTML =
      '<button class="mrow" type="button" data-scene="'+(CH_.title||0)+'"><i>起</i><div class="tx"><b>片頭標題卡</b><span>'+unit.title+'</span></div></button>'
    + '<button class="mrow" type="button" data-scene="'+(CH_.idea||0)+'"><i>核</i><div class="tx"><b>核心觀念</b><span>'+String(unit.keyIdea||'').slice(0,26)+'</span></div></button>'
    + '<div class="cap">五科學習路徑（點一下跳到該站）</div>'
    + (CH_.stops||[]).map(function(c){
        return '<button class="mrow" type="button" data-scene="'+c.scene+'" data-no="'+c.no+'"><i>'+c.no+'</i>'
             + '<div class="tx"><b>'+c.label+'</b><span>'+c.sub+'</span></div></button>'; }).join('')
    + '<div class="cap">收束</div>'
    + '<button class="mrow" type="button" data-scene="'+(CH_.close||0)+'"><i>束</i><div class="tx"><b>五科串成一條線</b><span>收束與總覽</span></div></button>'
    + '<button class="mrow" type="button" data-scene="'+(CH_.recap||0)+'"><i>顧</i><div class="tx"><b>重點回顧卡</b><span>五站重點一次看完</span></div></button>';
  var mapRows = mapBody.querySelectorAll('.mrow');
  function mapOpen(on){ mapBox.classList.toggle('on',!!on); mapbtn.classList.toggle('on',!!on);
    wrap.classList.toggle('map-open',!!on); mapbtn.textContent = on?'收起地圖':'章節地圖'; }
  mapbtn.addEventListener('click',function(){ mapOpen(!mapBox.classList.contains('on')); });
  mapBody.addEventListener('click',function(ev){ var b=ev.target.closest('.mrow'); if(!b){return;}
    var sc=Number(b.getAttribute('data-scene')); playing=true; goTo(sc,true); paint(); });
  var chipEls = chips.querySelectorAll('.chip'), subEls=[];
  function setSub(scene){
    if(subEls.__key===scene.text) { return; }
    subs.innerHTML=''; subEls=[];
    (scene.chunks||[]).forEach(function(c){
      var sp=document.createElement('span'); sp.className='ck'; sp.textContent=c.t; subs.appendChild(sp); subEls.push(c);
    });
    subEls.__key=scene.text;
  }
  function paintSub(tt,scene){
    var lt=tt-starts[cur];
    for(var i=0;i<subEls.length;i++){
      var el=subs.children[i], c=subEls[i]; if(!el){continue;}
      var on = lt>=c.t0 && lt<=c.t1;
      el.className='ck'+(on?' on':(lt>c.t1?' done':''));
    }
  }
  function panel(scene){
    var k=$('p-k'), h=$('p-h'), b=$('p-b'), tg=$('p-t');
    var kind=scene.kind, ph=scene.phase;
    tg.textContent='';
    if(kind==='title'){ k.textContent='一科練五科 觀點動畫'; h.textContent=unit.title;
      b.textContent=(unit.yearLabel?unit.yearLabel+'｜':'')+unit.subtitle; tg.textContent='五科 × 一個核心觀念'; }
    else if(kind==='open'){ k.textContent='一科練五科 觀點動畫'; h.textContent=unit.title;
      b.textContent=(unit.yearLabel?unit.yearLabel+'｜':'')+unit.subtitle; tg.textContent='五科 × 一個核心觀念'; }
    else if(kind==='path'){ var nm=nodes.slice(0,scene.reveal).map(function(n){return n.name;}).join(' → ');
      k.textContent='五科學習路徑'; h.textContent='一站接一站'; b.textContent=nm; }
    else if(kind==='idea'){ k.textContent='核心觀念'; h.textContent='先問：什麼沒有變？'; b.textContent=unit.keyIdea; }
    else if(kind==='stop'){
      var n=nodes[scene.i];
      if(ph==='node'){ k.textContent='第 '+(scene.i+1)+' 站'+(n.role?'（'+n.role+'）':''); h.textContent=n.name+'　第 '+n.n+' 題'; b.textContent=n.point; }
      else if(ph==='why'){ k.textContent='為什麼是這一站'; h.textContent=n.name+'　第 '+n.n+' 題'; b.textContent=n.why; }
      else { k.textContent='接下一站'; h.textContent='沿著同一條線往下'; b.textContent=n.next; }
    }
    else if(kind==='close'){ k.textContent='收束'; h.textContent='五科串成一條線'; b.textContent=unit.keyIdea.split('。')[0]+'。'; }
    else if(kind==='recap'){ k.textContent='重點回顧'; h.textContent=unit.title+'　五站重點';
      b.textContent=(unit.recap||[]).map(function(r){ return r.name+'第 '+r.n+' 題'; }).join('、'); }
    else { k.textContent=''; h.textContent=unit.title; b.textContent='練一科，走過五科。'; }
  }
  function paintPanel(scene){
    panel(scene);
    var si = scenes.indexOf(scene);
    plate.classList.toggle('hide', scene.kind==='close'||scene.kind==='end'||scene.kind==='title'||scene.kind==='recap');
    cardTitle.classList.toggle('on', scene.kind==='title');
    cardRecap.classList.toggle('on', scene.kind==='recap');
    var i = scene.kind==='stop'? scene.i : -1;
    var bts=stopsBox.querySelectorAll('button');
    for(var k=0;k<bts.length;k++){
      bts[k].className = (Number(bts[k].getAttribute('data-i'))===i)?'on':(Number(bts[k].getAttribute('data-i'))<i?'done':'');
    }
    for(var c=0;c<chipEls.length;c++){ chipEls[c].classList.toggle('on', scene.kind==='idea' ? true : false); }
    /* 章節地圖：目前場景高亮、已走過的站標記 done */
    var mv = (scene.kind==='stop')? scene.i : ((scene.kind==='close'||scene.kind==='end'||scene.kind==='recap')? N-1 : -1);
    for(var m=0;m<mapRows.length;m++){
      var mm=mapRows[m], ms=Number(mm.getAttribute('data-scene')), mno=Number(mm.getAttribute('data-no')||0);
      var cls = (ms===si) ? 'mrow on' : ((mno && mno-1<mv) ? 'mrow done' : 'mrow');
      if(mm.className!==cls){ mm.className=cls; }
    }
  }

  /* ---------- 時間軸控制 ---------- */
  function sceneAt(x){ for(var i=scenes.length-1;i>=0;i--){ if(x>=starts[i]-0.001) return i; } return 0; }
  function goTo(i,autoplay){
    i=clamp(i,0,scenes.length-1);
    if(soundOn){ try{ AUD[cur].pause(); }catch(e){} }
    cur=i; t=starts[i];
    if(soundOn&&autoplay){ AUD[i].playbackRate=speed; AUD[i].currentTime=0; AUD[i].play().catch(function(){ soundOn=false; markSound(); }); }
    setSub(scenes[i]); paintPanel(scenes[i]);
  }
  var last=performance.now();
  function frame(now){
    var dt=(now-last)/1000; last=now;
    if(playing){
      if(soundOn&&audioReady&&AUD[cur]&&!AUD[cur].paused){ t=starts[cur]+AUD[cur].currentTime; }
      else { t+=dt*speed; }
      var si=sceneAt(t), nxt=starts[cur]+DUR[cur];
      if(t>=nxt-0.02){
        if(cur<scenes.length-1){ goTo(cur+1,true); }
        else { t=total; playing=false; paint(); }
      }
    }
    render(t);
    requestAnimationFrame(frame);
  }
  function render(x){
    var si=sceneAt(x), sc=scenes[si], p=DUR[si]? (x-starts[si])/DUR[si] : 0;
    if(si!==cur){ cur=si; setSub(sc); paintPanel(sc); }
    draw(performance.now()/1000, sc, clamp(p,0,1));
    paintSub(x,sc);
    $('prog').firstChild.style.width=clamp(total?x/total:0,0,1)*100+'%';
    $('time').textContent=fmt(x)+' / '+fmt(total);
  }
  function paint(){ playbtn.textContent = playing?'暫停':'播放'; }
  var playbtn=$('playbtn');
  function toggle(){
    if(!playing){
      playing=true; audioReady=true;
      if(soundOn){ AUD[cur].playbackRate=speed; AUD[cur].play().then(function(){ $('hint').classList.add('hide'); })
        .catch(function(){ soundOn=false; markSound(); $('hint').classList.remove('hide'); $('hint').textContent='瀏覽器阻擋自動播放：按「語音：關」再切回「開」即可開啟旁白。'; }); }
      else { last=performance.now(); }
    } else { playing=false; if(soundOn){ try{AUD[cur].pause();}catch(e){} } }
    paint();
  }
  function markSound(){ wrap.classList.toggle('sound-off',!soundOn); $('sndbtn').textContent='語音：'+(soundOn?'開':'關'); }
  playbtn.addEventListener('click',toggle);
  $('restart').addEventListener('click',function(){ goTo(0,true); playing=true; paint(); });
  $('sndbtn').addEventListener('click',function(){ soundOn=!soundOn; markSound();
    if(soundOn){ AUD[cur].playbackRate=speed; AUD[cur].play(); } else { try{AUD[cur].pause();}catch(e){} last=performance.now(); } });
  var SPD=[1,1.25,1.5,0.75], si=0;
  $('spdbtn').addEventListener('click',function(){ si=(si+1)%SPD.length; speed=SPD[si];
    $('spdbtn').textContent='速度 '+speed.toFixed(2)+'×'; AUD.forEach(function(a){a.playbackRate=speed;}); });
  $('prog').addEventListener('click',function(ev){ var r=this.getBoundingClientRect(); var x=(ev.clientX-r.left)/r.width*total; goTo(sceneAt(x),true); });
  stopsBox.addEventListener('click',function(ev){ var b=ev.target.closest('button'); if(!b){return;}
    var i=Number(b.getAttribute('data-i')), sc=nodes[i].sceneNode; playing=true; goTo(sc,true); paint(); });
  document.addEventListener('keydown',function(ev){
    if(ev.code==='Space'){ ev.preventDefault(); toggle(); }
    if(ev.code==='ArrowRight'){ goTo(cur+1,true); }
    if(ev.code==='ArrowLeft'){ goTo(cur-1,true); }
  });
  cv.addEventListener('click',function(){ if(!playing){ toggle(); } });

  /* 尺寸自適應 */
  function fit(){ var k=Math.min(window.innerWidth/1300, window.innerHeight/732); wrap.style.setProperty('--k',Math.max(.3,k)); }
  window.addEventListener('resize',fit); fit();
  markSound(); goTo(0,false); paint();
  requestAnimationFrame(frame);
  /* 自動開播：可自動播放就帶語音，被擋就靜音播放（畫面照走，字幕照跑） */
  setTimeout(function(){
    if(!playing && cur===0){
      playing=true; audioReady=true;
      AUD[0].playbackRate=speed;
      AUD[0].play().catch(function(){ soundOn=false; markSound();
        $('hint').classList.remove('hide');
        $('hint').textContent='已自動靜音播放；按「播放」或點畫面即可開啟旁白（含語音與字幕同步）。';
        last=performance.now(); });
      paint();
    }
  }, 260);

  /* 驗收用鉤子（DOM 證據法） */
  window.__xanim = {
    ready:true, data:D,
    state:function(){ return {playing:playing,sound:soundOn,cur:cur,t:t,total:total,scenes:scenes.length,
      kind:scenes[cur].kind, phase:scenes[cur].phase, sub:scenes[cur].text, durs:DUR}; },
    jump:function(i){ playing=true; goTo(i,false); paint(); },
    ui:function(){ var q=function(sel){ return cardRecap.querySelector(sel)||{}; };
      return {
        titleCard:{on:cardTitle.classList.contains('on'),
          title:($('title-card-h')||{}).textContent||'', sub:($('title-card-sub')||{}).textContent||'',
          route:($('title-card-route')||{}).textContent||'', metas:cardTitle.querySelectorAll('.meta span').length},
        recapCard:{on:cardRecap.classList.contains('on'), rows:cardRecap.querySelectorAll('.rrow').length,
          key:q('.keyline').textContent||''},
        map:{exists:!!mapBox, open:mapBox.classList.contains('on'), rows:mapRows.length,
          stops:(CH_.stops||[]).length, scenes:(CH_.stops||[]).map(function(c){return c.scene;}),
          labels:(CH_.stops||[]).map(function(c){return c.label;}),
          onRow:((mapBody.querySelector('.mrow.on')||{}).textContent||'').replace(/\s+/g,' ').trim()},
        chapters:CH_, chips:chipEls.length, stops:stopsBox.querySelectorAll('button').length
      }; },
    mapOpen:function(on){ mapOpen(on); return mapBox.classList.contains('on'); },
    chapters:function(){ return CH_; },
    stop:function(){ playing=false; if(soundOn){try{AUD[cur].pause();}catch(e){}} paint(); }
  };
})();
</script>
</body>
</html>
"""

if __name__ == "__main__":
    main()
