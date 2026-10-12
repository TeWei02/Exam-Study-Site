#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen_quiet.py — 產生「安靜精讀版」資料與整卷精讀頁

目的（對應用戶回報的五個學習障礙）
  1. 太花       → 精讀版完全靜態：白底、單一主色、無漸層、無動畫、無語音、無自動播放。
  2. 太快太跳   → 把詳解拆成「一步一步」的步驟卡，由使用者按鈕決定何時出現下一步。
  3. 版面亂     → 內文單欄、字級放大、行高放寬；整卷一次只顯示一題。
  4. 沒有步驟   → 內容固定依「①讀題 ②關鍵想法 ③逐步解 ④對答案 ⑤記題型」五步排列。
  5. 太發散     → 每題最後一張卡只講「這題的題型與考場提醒」，不摻入時事／跨科延伸。

產出
  A. assets/js/data/<id>-quiet.js   單題頁與整卷頁共用的結構化精讀資料
  B. assets/anim/<id>/<file>_quiet.html  整卷安靜精讀版（單檔、靜態、手動翻頁）

用法
  python3 tools/gen_quiet.py                 # 預設處理 115 數學 A（math-a）
  python3 tools/gen_quiet.py --id math-a-114 # 可指定其他科目 id

設計原則（重要）
  只「重排」既有詳解的文字，不新增、不改寫任何數學內容；
  產生後會印出覆蓋率自檢，若步驟化後文字流失超過 2% 會警告。
"""

import argparse
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

VOID = {'br', 'img', 'hr', 'meta', 'link', 'input', 'source', 'col',
        'area', 'base', 'wbr', 'embed', 'param', 'track'}

TAG_RE = re.compile(r'</?([a-zA-Z][\w-]*)((?:[^>"\']|"[^"]*"|\'[^\']*\')*)/?>')
TITLE_RE = re.compile(r'^第\s*[一二三四五六七八九十百零\d]+\s*步\s*[:：]?\s*')


# ---------------------------------------------------------------- 基礎工具
def load_bank(path):
    src = open(path, encoding='utf-8').read()
    m = re.search(r'\]\s*=\s*(\{)', src)
    if not m:
        raise SystemExit('找不到題庫物件：' + path)
    start = m.start(1)
    depth = 0
    for i in range(start, len(src)):
        if src[i] == '{':
            depth += 1
        elif src[i] == '}':
            depth -= 1
            if depth == 0:
                return json.loads(src[start:i + 1])
    raise SystemExit('題庫 JSON 解析失敗：' + path)


def split_blocks(html):
    """把 HTML 切成一層一層的頂層元素（保持原順序與原文）。"""
    blocks, stack, start = [], [], None
    for m in TAG_RE.finditer(html):
        token = m.group(0)
        tag = m.group(1).lower()
        closing = token.startswith('</')
        selfclose = token.endswith('/>') or tag in VOID
        if not closing:
            if not stack:
                start = m.start()
            if not selfclose:
                stack.append(tag)
            elif not stack:
                blocks.append(html[start:m.end()])
                start = None
        else:
            if stack and stack[-1] == tag:
                stack.pop()
                if not stack and start is not None:
                    blocks.append(html[start:m.end()])
                    start = None
    if start is not None:
        blocks.append(html[start:])
    return [b for b in blocks if b.strip()]


def tag_of(block):
    m = TAG_RE.match(block.strip())
    return m.group(1).lower() if m else ''


def classes_of(block):
    m = re.match(r'\s*<[a-zA-Z][\w-]*([^>]*)>', block)
    if not m:
        return set()
    cm = re.search(r'class="([^"]*)"', m.group(1))
    return set(cm.group(1).split()) if cm else set()


def strip_tags(html):
    txt = re.sub(r'<[^>]+>', '', html or '')
    txt = (txt.replace('&nbsp;', ' ').replace('&gt;', '>')
              .replace('&lt;', '<').replace('&amp;', '&'))
    return re.sub(r'\s+', ' ', txt).strip()


def list_items(list_html):
    """取出 <ol>/<ul> 的頂層 <li>（支援嵌套清單）。"""
    inner = re.sub(r'^\s*<(ol|ul)[^>]*>', '', list_html.strip())
    inner = re.sub(r'</(ol|ul)>\s*$', '', inner)
    items, stack, start = [], [], None
    for m in TAG_RE.finditer(inner):
        token, tag = m.group(0), m.group(1).lower()
        if token.startswith('</'):
            if stack and stack[-1] == tag:
                stack.pop()
                if not stack and start is not None:
                    items.append(inner[start:m.end()])
                    start = None
        else:
            if not stack:
                start = m.start()
            if not token.endswith('/>'):
                stack.append(tag)
    if start is not None and inner[start:].strip():
        items.append(inner[start:])
    return items


def li_title(li_html):
    """<li><b>標題</b>…</li> → '標題'，否則回傳空字串。"""
    m = re.match(r'\s*<li[^>]*>\s*<b>(.*?)</b>', li_html, re.S)
    if not m:
        return ''
    title = strip_tags(m.group(1))
    return title if 0 < len(title) <= 30 else ''


def unwrap_li(li_html):
    return re.sub(r'^\s*<li[^>]*>|</li>\s*$', '', li_html.strip(), flags=re.S).strip()


# ---------------------------------------------------------------- 步驟化
def build_steps(body_blocks):
    """把詳解主體（已移除 lead/ans/tip）整理成步驟陣列。

    規則（只用既有文字重排，不新增內容）：
      A. <p><b>第一步：…</b></p> 這種「有標題的步驟」→ 標題即步驟名，
         後續區塊全部併入該步，直到下一個有標題的步驟。
      B. 獨立的 <ol>/<ul> → 每個 <li> 一步（<li> 開頭的 <b> 當標題）。
      C. <p>文字以「：」結尾且緊接著清單／表格 → 併成同一步（前言＋清單）。
      D. 其餘區塊 → 各自一步。
    """
    steps = []
    i = 0
    n = len(body_blocks)
    while i < n:
        block = body_blocks[i]
        tag = tag_of(block)

        # A. 有標題的步驟段落（常見於計算量大的題目）
        if tag == 'p':
            m = re.match(r'\s*<p[^>]*>\s*<b>(.*?)</b>\s*(.*?)</p>\s*$', block, re.S)
            if m:
                title = strip_tags(m.group(1))
                if re.match(r'^第\s*[一二三四五六七八九十百零\d]+\s*步', title):
                    title = TITLE_RE.sub('', title).strip(' ：:')
                    rest = m.group(2).strip()
                    html_parts = [rest] if rest else []
                    i += 1
                    while i < n:
                        nb = body_blocks[i]
                        if tag_of(nb) == 'p':
                            m2 = re.match(r'\s*<p[^>]*>\s*<b>(.*?)</b>\s*(.*?)</p>\s*$', nb, re.S)
                            if m2 and re.match(r'^第\s*[一二三四五六七八九十百零\d]+\s*步',
                                               strip_tags(m2.group(1))):
                                break
                        html_parts.append(nb)
                        i += 1
                    steps.append({'t': title, 'h': '\n'.join(html_parts)})
                    continue

        # B. 清單 → 每個 li 一步
        if tag in ('ol', 'ul'):
            for li in list_items(block):
                steps.append({'t': li_title(li), 'h': unwrap_li(li)})
            i += 1
            continue

        # C. 以「：」結尾的前言 + 緊接的清單／表格 → 同一步
        if tag == 'p' and i + 1 < n and tag_of(body_blocks[i + 1]) in ('ol', 'ul', 'table', 'div'):
            if strip_tags(block).endswith(('：', ':')):
                nxt = body_blocks[i + 1]
                if tag_of(nxt) in ('ol', 'ul'):
                    steps.append({'t': '', 'h': block + '\n' + nxt})
                else:
                    steps.append({'t': '', 'h': block + '\n' + nxt})
                i += 2
                continue

        # D. 其他 → 自成一步
        steps.append({'t': '', 'h': block})
        i += 1

    return steps


def parse_solution(sol):
    key = ans = tip = ''
    body = []
    for b in split_blocks(sol or ''):
        cls = classes_of(b)
        if tag_of(b) == 'p' and 'lead' in cls and not key:
            key = b
        elif tag_of(b) == 'p' and 'ans' in cls and not ans:
            ans = b
        elif tag_of(b) == 'p' and 'tip' in cls and not tip:
            tip = b
        else:
            body.append(b)
    return key, build_steps(body), ans, tip


# ---------------------------------------------------------------- 主流程
QUIET_HEAD = '''/* =============================================================================
   安靜精讀版資料檔：__NAME__（__OUTNAME__）
   -----------------------------------------------------------------------------
   由 tools/gen_quiet.py 自動產生，請勿手改（重跑即會覆蓋）。
   資料來源：assets/js/data/__BANK__.js 的既有詳解，僅重排為「五步精讀」結構，
             沒有新增或改寫任何數學內容。

   欄位：questions[] 每題
     n      題號
     unit   單元（同時作為「題型」標示）
     diff   難度
     answer 正解索引（0=A）
     stem   題幹（HTML，直接照抄題庫原文）
     options 選項文字（陣列，直接照抄題庫原文）
     key    ①讀題後的②關鍵想法（HTML）
     steps  ③逐步解：[{t:步驟標題可為空, h:步驟內容 HTML}]
     ans    ④對答案（官方答案句 HTML）
     tip    ⑤記題型：考場提醒（HTML，可能為空）
   ============================================================================= */
window.EXAM_QUIET = window.EXAM_QUIET || {};
window.EXAM_QUIET["__ID__"] =
__JSON__;
'''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--id', default='math-a')
    ap.add_argument('--bank', default='')
    ap.add_argument('--page', default='')
    args = ap.parse_args()

    sid = args.id
    bank_rel = args.bank or ('assets/js/data/%s.js' % sid)
    bank_path = os.path.join(ROOT, bank_rel)
    bank = load_bank(bank_path)

    subject = None
    subj_path = os.path.join(ROOT, 'assets/js/subjects.js')
    if os.path.exists(subj_path):
        ssrc = open(subj_path, encoding='utf-8').read()
        for m in re.finditer(r'\{\s*"id"\s*:\s*"%s".*?\n    \}' % re.escape(sid), ssrc, re.S):
            try:
                subject = json.loads(m.group(0))
            except Exception:
                subject = None
            break

    out_questions = []
    total_in = total_out = 0
    warn = []
    for q in bank.get('questions', []):
        key, steps, ans, tip = parse_solution(q.get('sol', ''))
        if not steps:
            warn.append('第 %s 題：步驟化後為空，已退回單一步驟' % q.get('n'))
            steps = [{'t': '', 'h': q.get('sol', '')}]
        body_in = ''
        for b in split_blocks(q.get('sol', '')):
            if tag_of(b) == 'p' and (classes_of(b) & {'lead', 'ans', 'tip'}):
                continue
            body_in += strip_tags(b)
        total_in += len(body_in)
        total_out += len(strip_tags(''.join(s['h'] for s in steps)))
        out_questions.append({
            'n': q.get('n'),
            'unit': q.get('unit', ''),
            'diff': q.get('diff'),
            'answer': q.get('answer'),
            'stem': q.get('stem', ''),
            'options': q.get('options') or [],
            'key': key,
            'steps': steps,
            'ans': ans,
            'tip': tip,
        })

    data = {
        'id': sid,
        'name': (subject or {}).get('name') or bank.get('name') or sid,
        'yearLabel': (subject or {}).get('yearLabel') or '',
        'exam': (subject or {}).get('exam') or '',
        'source': bank.get('source', ''),
        'note': '安靜精讀版：內容取自原本詳解，改為「一次一步」的閱讀順序；無動畫、無語音、無自動播放。',
        'stepNames': ['讀題', '關鍵想法', '逐步解', '對答案', '記題型'],
        'questions': out_questions,
    }

    out_name = sid + '-quiet.js'
    out_path = os.path.join(ROOT, 'assets/js/data', out_name)
    payload = QUIET_HEAD.replace('__NAME__', data['name']).replace('__OUTNAME__', out_name)
    payload = payload.replace('__BANK__', sid).replace('__ID__', sid)
    payload = payload.replace('__JSON__', json.dumps(data, ensure_ascii=False, indent=2))
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(payload)

    page_rel = args.page or ('assets/anim/%s/mathA_quiet.html' % sid if sid == 'math-a'
                             else 'assets/anim/%s/%s_quiet.html' % (sid, sid))
    page_path = os.path.join(ROOT, page_rel)
    os.makedirs(os.path.dirname(page_path), exist_ok=True)
    with open(page_path, 'w', encoding='utf-8') as f:
        f.write(QUIET_PAGE.replace('__ID__', sid)
                           .replace('__NAME__', data['name'])
                           .replace('__YEAR__', data['yearLabel'])
                           .replace('__DATA__', '../../js/data/' + out_name)
                           .replace('__CSS__', '../../css/site.css'))

    cover = (total_out / total_in * 100) if total_in else 100.0
    print('科目：%s（%s）' % (data['name'], sid))
    print('題數：%d' % len(out_questions))
    print('步驟數：%s' % ' '.join('%s:%d' % (q['n'], len(q['steps'])) for q in out_questions))
    print('詳解文字覆蓋率：%.1f%%' % cover)
    for w in warn:
        print('警告：' + w)
    if cover < 98:
        print('警告：覆蓋率低於 98%%，請檢查步驟化規則')
    print('產出：%s' % os.path.relpath(out_path, ROOT))
    print('產出：%s' % os.path.relpath(page_path, ROOT))


# ---------------------------------------------------------------- 整卷精讀頁模板
QUIET_PAGE = r'''<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>__YEAR____NAME__ 安靜精讀版（整卷）｜考古題解題學習站</title>
<meta name="description" content="安靜精讀版：一次只顯示一題、一步一步出現，沒有動畫、沒有語音、不會自動播放。">
<link rel="stylesheet" href="__CSS__">
<!-- 安靜精讀版資料（由 tools/gen_quiet.py 產生，與單題頁共用同一份內容） -->
<script src="__DATA__"></script>
<style>
/* 整卷精讀頁專用版面：淺色、單欄、字大、行距寬；不使用任何動畫與陰影 */
html{-webkit-text-size-adjust:100%}
body.quiet-page{background:#fff;color:#20262e;font-size:17.5px;line-height:2;
  font-family:-apple-system,BlinkMacSystemFont,"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif}
.q-page-head{border-bottom:1px solid #e6e9ee;background:#fff;position:sticky;top:0;z-index:10}
.q-page-head .inner{max-width:1080px;margin:0 auto;padding:14px 20px}
.q-page-title{font-size:19px;font-weight:700;line-height:1.6}
.q-page-sub{color:#5c6673;font-size:14.5px;line-height:1.8;margin-top:2px}
.q-layout{max-width:1080px;margin:0 auto;padding:20px;display:flex;gap:28px;align-items:flex-start}
.q-toc{flex:0 0 168px;position:sticky;top:96px}
.q-toc h2{font-size:14.5px;color:#5c6673;font-weight:600;margin:0 0 8px}
.q-toc-list{display:flex;flex-wrap:wrap;gap:6px}
.q-toc-list button{width:40px;height:36px;border:1px solid #e6e9ee;background:#fff;border-radius:9px;
  font-size:15px;color:#3b4450;cursor:pointer;font-variant-numeric:tabular-nums}
.q-toc-list button:hover{border-color:#b9c6dc}
.q-toc-list button.on{background:#1b5fd0;border-color:#1b5fd0;color:#fff}
.q-toc-list button.done{border-color:#9ec9b3;background:#eef8f2}
.q-toc-list button.on.done{background:#1b5fd0;border-color:#1b5fd0;color:#fff}
.q-toc-note{color:#8a94a3;font-size:13.5px;line-height:1.9;margin-top:12px}
.q-main{flex:1 1 auto;min-width:0;max-width:760px}
.q-foot{max-width:760px;border-top:1px solid #e6e9ee;margin-top:20px;padding-top:14px;
  color:#5c6673;font-size:14.5px}
.q-foot a{color:#1b5fd0}
@media (max-width:860px){
  .q-layout{flex-direction:column;gap:16px;padding:14px}
  .q-toc{position:static;flex:none;width:100%}
  .q-toc-list{flex-wrap:nowrap;overflow-x:auto;padding-bottom:6px}
  .q-toc-list button{flex:0 0 auto}
}
</style>
</head>
<body class="quiet-page quiet">

<header class="q-page-head">
  <div class="inner">
    <div class="q-page-title">__YEAR____NAME__ ・ 安靜精讀版（整卷）</div>
    <div class="q-page-sub">共 <b id="q-total">20</b> 題 ・ 一次只顯示一題 ・ 不會自動播放 ・ 沒有語音 ・ 解析一步一步出現</div>
  </div>
</header>

<div class="q-layout">
  <nav class="q-toc" aria-label="題號">
    <h2>選題</h2>
    <div class="q-toc-list" id="q-toc"></div>
    <p class="q-toc-note" id="q-toc-note"></p>
  </nav>
  <main class="q-main" id="q-main"></main>
</div>

<script>
(function () {
  var DATA = (window.EXAM_QUIET || {})['__ID__'];
  var KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];
  var LS = 'quiet:__ID__';
  var main = document.getElementById('q-main');
  var toc = document.getElementById('q-toc');
  var tocNote = document.getElementById('q-toc-note');

  function store() {
    try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; }
  }
  function setStore(v) { try { localStorage.setItem(LS, JSON.stringify(v)); } catch (e) { } }
  function st() {
    var s = store();
    s.pick = s.pick || {}; s.done = s.done || {};
    return s;
  }
  function esc(x) {
    return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function qAt(n) {
    var qs = DATA ? DATA.questions : [];
    for (var i = 0; i < qs.length; i++) { if (String(qs[i].n) === String(n)) { return { q: qs[i], i: i }; } }
    return null;
  }
  function curN() {
    var m = /[?&]n=(\d+)/.exec(location.search);
    if (m) { return Number(m[1]); }
    var s = store();
    return Number(s.last || (DATA ? DATA.questions[0].n : 1));
  }

  if (!DATA || !DATA.questions || !DATA.questions.length) {
    main.innerHTML = '<p>精讀資料尚未產生：請在站台根目錄執行 <code>python3 tools/gen_quiet.py</code>。</p>';
    return;
  }

  document.getElementById('q-total').textContent = DATA.questions.length;

  function renderToc(n) {
    var s = st();
    var h = '';
    DATA.questions.forEach(function (q) {
      var cls = 'q' + (String(q.n) === String(n) ? ' on' : '') +
                (s.done[String(q.n)] ? ' done' : '');
      h += '<button type="button" class="' + cls + '" data-n="' + q.n + '">' + q.n + '</button>';
    });
    toc.innerHTML = h;
    var done = Object.keys(s.done).length;
    tocNote.innerHTML = '已完成 ' + done + '／' + DATA.questions.length + ' 題。<br>綠框＝答對過。';
  }
  toc.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('button[data-n]') : null;
    if (b) { go(Number(b.getAttribute('data-n'))); }
  });

  function go(n) {
    var s = store(); s.last = n; setStore(s);
    var p = new URLSearchParams(location.search);
    p.set('n', String(n));
    history.replaceState(null, '', location.pathname + '?' + p.toString());
    render(n);
  }

  /* ---------------- 題目頁（五步） ---------------- */
  var openedSteps = 0;   /* ③逐步解 已顯示到第幾步 */
  var step3Shown = 0;

  function render(n) {
    var hit = qAt(n);
    if (!hit) { main.innerHTML = '<p>找不到第 ' + esc(n) + ' 題。</p>'; return; }
    var q = hit.q, qs = DATA.questions, idx = hit.i;
    var s = st();
    var picked = s.pick[String(q.n)];

    var h = '';
    h += '<div class="q-progressline">' + esc(DATA.yearLabel || '') + ' ' + esc(DATA.name) +
         ' ・ 第 ' + q.n + ' 題／共 ' + qs.length + ' 題' +
         (q.unit ? ' ・ ' + esc(q.unit) : '') + '</div>';

    h += '<div class="q-order">順序：① 讀題 → ② 關鍵想法 → ③ 逐步解 → ④ 對答案 → ⑤ 記題型</div>';

    /* ① 讀題 */
    h += '<section class="q-card" id="qc1">' +
         '<h3><span class="q-num">①</span>讀題</h3>' +
         '<p class="q-hintline">先把題目慢慢讀兩次。想不出來也沒關係，下面的卡片會一步一步帶你走，不會自己跳走。</p>' +
         '<div class="q-stem">' + (q.stem || '') + '</div>' +
         '<ul class="q-opts" id="q-opts">';
    (q.options || []).forEach(function (o, i) {
      var cls = '';
      if (picked === i) { cls = (q.answer === i) ? ' ok' : ' bad'; }
      h += '<li><button type="button" class="q-opt ' + cls + '" data-i="' + i + '">' +
           '<span class="q-opt-key">' + (KEYS[i] || (i + 1)) + '</span>' +
           '<span class="q-opt-txt">' + o + '</span></button></li>';
    });
    h += '</ul><div id="q-fb"></div>' +
         '<button type="button" class="btn btn-primary q-next" id="q-to2">讀完了，看②關鍵想法</button>' +
         '</section>';

    /* ② 關鍵想法 */
    h += '<section class="q-card q-locked" id="qc2">' +
         '<h3><span class="q-num">②</span>關鍵想法</h3>' +
         '<div class="q-body">' + (q.key || '<p>本題沒有獨立的關鍵想法段落。</p>') + '</div>' +
         '<button type="button" class="btn btn-primary q-next" id="q-to3">懂了，開始③逐步解</button>' +
         '</section>';

    /* ③ 逐步解 */
    h += '<section class="q-card q-locked" id="qc3">' +
         '<h3><span class="q-num">③</span>逐步解</h3>' +
         '<p class="q-hintline">一次只出現一步。看完一步、想清楚了，再按下面的按鈕看下一步。</p>' +
         '<div id="q-steps"></div>' +
         '<button type="button" class="btn btn-primary q-next" id="q-nextstep">看第 1 步</button>' +
         '</section>';

    /* ④ 對答案 */
    h += '<section class="q-card q-locked" id="qc4">' +
         '<h3><span class="q-num">④</span>對答案</h3>' +
         '<div class="q-body">' + (q.ans || '<p>本題未提供官方答案句。</p>') + '</div>' +
         '<div id="q-yours"></div>' +
         '<button type="button" class="btn btn-primary q-next" id="q-to5">看⑤記題型</button>' +
         '</section>';

    /* ⑤ 記題型 */
    var next = qs[idx + 1];
    h += '<section class="q-card q-locked q-typebox" id="qc5">' +
         '<h3><span class="q-num">⑤</span>記題型</h3>' +
         '<table class="q-typemt"><tbody>' +
         '<tr><th>這一題的題型</th><td>' + esc(q.unit || '（未標單元）') + '</td></tr>' +
         '<tr><th>難度</th><td>' + (q.diff ? esc(q.diff) + ' ／ 3' : '未標') + '</td></tr>' +
         '<tr><th>考場提醒</th><td>' + (q.tip || '本題沒有額外提醒。') + '</td></tr>' +
         '</tbody></table>' +
         '<p class="q-hintline">同一種題型只要記住上面這一件事，下次看到就知道從哪裡下手。</p>' +
         '</section>';

    h += '<div class="q-pager"><span>' +
         (idx > 0 ? '<button type="button" class="btn" id="q-prev">上一題：第 ' + qs[idx - 1].n + ' 題</button>'
                  : '<span class="btn" aria-disabled="true">已是第一題</span>') +
         '</span><span>' +
         (next ? '<button type="button" class="btn btn-primary" id="q-nextq">下一題：第 ' + next.n + ' 題</button>'
               : '<span class="btn" aria-disabled="true">已是本卷最後一題</span>') +
         '</span></div>';

    main.innerHTML = h;
    renderToc(q.n);
    bind(q, qs, idx, picked);
    window.scrollTo(0, 0);
  }

  function show(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('q-locked'); }
    return el;
  }
  function revealTo(id) {
    var el = show(id);
    if (el) { try { el.scrollIntoView({ behavior: 'auto', block: 'start' }); } catch (e) { } }
  }

  function bind(q, qs, idx, picked) {
    var s;
    /* 作答 */
    var opts = document.getElementById('q-opts');
    var fb = document.getElementById('q-fb');
    function paintPick(i) {
      var btns = opts.querySelectorAll('.q-opt');
      for (var k = 0; k < btns.length; k++) {
        btns[k].classList.remove('ok', 'bad');
        if (Number(btns[k].getAttribute('data-i')) === i) {
          btns[k].classList.add(i === q.answer ? 'ok' : 'bad');
        }
      }
      fb.innerHTML = (i === q.answer)
        ? '<p class="q-fb ok">答對了。先別急，往下看②關鍵想法裡的「為什麼」。</p>'
        : '<p class="q-fb bad">目前選的不是答案。沒關係，往下看②③就會知道差在哪一步。</p>';
    }
    if (opts) {
      opts.addEventListener('click', function (ev) {
        var b = ev.target.closest ? ev.target.closest('.q-opt') : null;
        if (!b) { return; }
        var i = Number(b.getAttribute('data-i'));
        var stt = st();
        stt.pick[String(q.n)] = i;
        if (i === q.answer) { stt.done[String(q.n)] = 1; }
        setStore(stt);
        paintPick(i);
        renderToc(q.n);
        var mine = document.getElementById('q-yours');
        if (mine && mine.innerHTML) { mine.innerHTML = yourLine(i); }
      });
      if (picked != null) { paintPick(picked); }
    }

    var to2 = document.getElementById('q-to2');
    if (to2) { to2.addEventListener('click', function () { revealTo('qc2'); }); }

    var to3 = document.getElementById('q-to3');
    if (to3) { to3.addEventListener('click', function () { revealTo('qc3'); showFirstStep(); }); }

    var steps = q.steps || [];
    step3Shown = 0;
    function showFirstStep() {
      if (step3Shown === 0) { addStep(); }
    }
    function addStep() {
      if (step3Shown >= steps.length) { return; }
      var host = document.getElementById('q-steps');
      var box = document.createElement('div');
      box.className = 'q-step';
      var t = steps[step3Shown].t;
      box.innerHTML = '<h4>第 ' + (step3Shown + 1) + ' 步' + (t ? '：' + esc(t) : '') + '</h4>' +
                      '<div class="q-body">' + steps[step3Shown].h + '</div>';
      host.appendChild(box);
      step3Shown++;
      var btn = document.getElementById('q-nextstep');
      if (step3Shown >= steps.length) {
        btn.textContent = '這是最後一步，看④對答案';
        btn.setAttribute('data-mode', 'to4');
      } else {
        btn.textContent = '看第 ' + (step3Shown + 1) + ' 步（還有 ' + (steps.length - step3Shown) + ' 步）';
      }
    }
    var nsb = document.getElementById('q-nextstep');
    if (nsb) {
      nsb.addEventListener('click', function () {
        if (nsb.getAttribute('data-mode') === 'to4') { revealTo('qc4'); fillYours(); return; }
        addStep();
      });
    }

    function yourLine(i) {
      var ok = (i === q.answer);
      return '<p class="q-yoursline">你剛才選的是 (' + (KEYS[i] || '?') + ')，' +
             (ok ? '和答案一致。' :
              '正確答案是 (' + (KEYS[q.answer] || '?') + ')。回頭對一次③的每一步，找出是哪一步和你算的不一樣。') +
             '</p>';
    }
    function fillYours() {
      var host = document.getElementById('q-yours');
      var stt = st();
      var i = stt.pick[String(q.n)];
      if (host && i != null) { host.innerHTML = yourLine(i); }
    }

    var to5 = document.getElementById('q-to5');
    if (to5) { to5.addEventListener('click', function () { revealTo('qc5'); }); }

    var prev = document.getElementById('q-prev');
    if (prev) { prev.addEventListener('click', function () { go(qs[idx - 1].n); }); }
    var nextq = document.getElementById('q-nextq');
    if (nextq) { nextq.addEventListener('click', function () { go(qs[idx + 1].n); }); }
  }

  go(curN());
})();
</script>
</body>
</html>
'''


if __name__ == '__main__':
    main()
