/* ===========================================================================
   家教伴讀版 — 共用引擎
   來源：115 數學 A 家教伴讀試點（已驗收）之互動邏輯，原樣抽出成共用檔。
   作答判定、選項標記、答錯回應、逐題打勾、進度存取等邏輯皆未改動。
   ---------------------------------------------------------------------------
   用法（頁面先載題庫、再設設定、最後載本檔）：
     <script src="../../assets/js/data/<科>-quiet.js"></script>
     <script>window.TUTOR_CFG = { key:'tutor115.<科>.progress', bankId:'<科>' };</script>
     <script src="../../assets/tutor/tutor-core.js"></script>
   需要 HTML 具備：#stage / #ticks / #pnum / #btn-prev / #btn-next / #btn-speak
   / #chain / #reset / #hintline / #whoSub（缺漏者會自動略過）
   =========================================================================== */
(function () {
  'use strict';
  var cfg = window.TUTOR_CFG || {};
  var bankId = cfg.bankId;
  var KEY = cfg.key || ('tutor115.' + bankId + '.progress');
  var bank = (window.EXAM_QUIET || {})[bankId];
  var stage = document.getElementById('stage');
  var ticksEl = document.getElementById('ticks');
  var pnumEl = document.getElementById('pnum');
  var btnPrev = document.getElementById('btn-prev');
  var btnNext = document.getElementById('btn-next');
  var btnSpeak = document.getElementById('btn-speak');
  var chainBox = document.getElementById('chain');
  var hintEl = document.getElementById('hintline');

  var st = { qi: 0, bi: 0, done: {}, replay: false, picked: null, started: false, ev: false };

  if (!bank || !bank.questions || !bank.questions.length) {
    stage.innerHTML = '<div class="screen"><p class="guide">找不到題庫資料檔。</p></div>';
    return;
  }
  var QS = bank.questions;
  var SUBJ = bank.name || cfg.subject || '';
  var YEAR = bank.yearLabel || cfg.yearLabel || '';

  /* ---------- 科目字樣（可由頁面 config 覆寫） ---------- */
  if (document.getElementById('whoSub')) {
    document.getElementById('whoSub').textContent = cfg.whoSub || (YEAR + SUBJ);
  }
  if (cfg.docTitle !== false && SUBJ) {
    document.title = YEAR + SUBJ + ' 家教伴讀｜考古題解題學習站';
  }
  var welcome = cfg.welcome || ('你好，我是你的' + SUBJ + '家教伴讀。');
  var planLine = cfg.planLine || ('我們把 ' + YEAR + SUBJ + '的 ' + QS.length + ' 題，一題一題慢慢走。一次只講一件事，看不懂就按「唸給我聽」或「再講一次」。');

  /* ---------- 進度存取 ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) { return; }
      var o = JSON.parse(raw);
      if (o && typeof o === 'object') {
        st.qi = Math.min(Math.max(0, o.qi | 0), QS.length - 1);
        st.bi = Math.max(0, o.bi | 0);
        st.done = o.done || {};
        st.started = true;
      }
    } catch (e) {}
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ qi: st.qi, bi: st.bi, done: st.done }));
    } catch (e) {}
  }
  function doneCount() {
    var c = 0;
    QS.forEach(function (q) { if (st.done[String(q.n)]) { c++; } });
    return c;
  }
  function paintTicks() {
    var h = '';
    QS.forEach(function (q, i) {
      var cls = 'tick' + (st.done[String(q.n)] ? ' done' : '') + (i === st.qi ? ' now' : '');
      h += '<button type="button" class="' + cls + '" data-i="' + i + '" title="第 ' + q.n + ' 題">' +
           (st.done[String(q.n)] ? '✓' : q.n) + '</button>';
    });
    ticksEl.innerHTML = h;
    pnumEl.textContent = '今日進度 ' + doneCount() + '／' + QS.length + '（打勾＝這一題走完）';
  }
  ticksEl.addEventListener('click', function (e) {
    var t = e.target.closest('.tick');
    if (!t) { return; }
    st.qi = Number(t.getAttribute('data-i')) | 0;
    st.bi = 0; st.picked = null; st.replay = false;
    save(); render();
  });
  document.getElementById('reset').addEventListener('click', function () {
    st.done = {}; save(); paintTicks();
  });

  /* ---------- 產生每一題的「屏」 ---------- */
  function beatsOf(q) {
    var b = [];
    b.push({
      guide: '這一題考的是「' + (q.unit || '這一題') + '」。我們先看題目在問什麼，不用急。',
      body: '', main: 'guideOnly'
    });
    b.push({
      guide: '題目：',
      body: '<p class="stem">' + q.stem + '</p>'
    });
    b.push({ opts: true, guide: '想一下，選一個你覺得對的。選完我們再一起看為什麼。' });
    b.push({ key: true, replay: st.replay, guide: st.replay ? '我再說一次，這次慢慢來。' : '先抓一個重點就好，只抓一個。', body: q.key });
    (q.steps || []).forEach(function (s, i) {
      b.push({
        step: true,
        guide: '第 ' + (i + 1) + ' 步，跟著我算：',
        body: (s.t ? '<p><b>' + s.t + '</b></p>' : '') + s.h
      });
    });
    b.push({ answer: true, guide: '來對一下。先看它，再往下走。', body: q.ans });
    if (q.tip) { b.push({ tip: true, guide: '考場上小心這件事。', body: q.tip }); }
    b.push({ done: true, guide: '這一題走完了。' });
    return b;
  }
  var beats = [];

  /* ---------- 2026 大事尾屏（第四節）：純補充，不打勾、不動進度、不改題目流程 ---------- */
  var EV_SID = String(cfg.bankId || '');
  function evAll() {
    var d = window.EXAM_RESOURCES || {};
    return (d.eventPoints || []).filter(function (p) { return String(p.subject) === String(EV_SID); });
  }
  function evNews(id) {
    var ns = (window.EXAM_RESOURCES || {}).news || [];
    for (var i = 0; i < ns.length; i++) { if (String(ns[i].id) === String(id)) { return ns[i]; } }
    return {};
  }
  function evEsc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function evOneSpeak(p) {
    var n = evNews(p.news);
    var parts = [n.award || n.headline || '', p.title || '', p.point || '', p.cross || ''];
    return parts.filter(function (x) { return x; }).join('。')
      .replace(/。{2,}/g, '。').replace(/\s+/g, ' ').trim();
  }
  function evScreenHTML() {
    var pts = evAll();
    var h = '<div class="screen now ev-screen">';
    h += '<p class="guide">這一科也有 2026 大事可以配著讀。下面是本科的 ' + pts.length +
         ' 個對照點，一次看一個就好；不想看，按「← 上一句」或「回最後一題」都可以。</p>';
    h += '<div class="ev-list">';
    pts.forEach(function (p, i) {
      var n = evNews(p.news);
      h += '<div class="ev-item">' +
           '<p class="ev-title">' + (i + 1) + '. ' + evEsc(p.title || '') + '</p>' +
           '<p class="ev-news">對應大事：' + evEsc(n.award || n.headline || p.news || '') + '</p>' +
           '<p class="ev-point">' + evEsc(p.point || '') + '</p>' +
           '<button class="btn ev-say" type="button" data-ev="' + i + '">唸這一段</button>' +
           '</div>';
    });
    h += '</div>';
    h += '<div class="startbtns">' +
         '<a class="btn primary" href="../../events.html?subject=' + encodeURIComponent(EV_SID) +
         '">到 2026 大事專區看全部（本科）</a>' +
         '<button class="btn" id="ev-back" type="button">回最後一題</button></div>';
    h += '<p class="tickline">這一屏只是補充，不打勾、不影響今日進度。</p>';
    h += '</div>';
    return h;
  }
  function renderEvScreen() {
    if (!evAll().length) { st.ev = false; save(); render(); return; }
    stage.innerHTML = evScreenHTML();
    Array.prototype.forEach.call(stage.querySelectorAll('.ev-say'), function (el) {
      el.addEventListener('click', function () {
        if (speaking) { stopSpeak(); return; }
        speak(evOneSpeak(evAll()[Number(el.getAttribute('data-ev')) | 0] || {}), false);
      });
    });
    var bk = document.getElementById('ev-back');
    if (bk) { bk.addEventListener('click', function () { st.ev = false; save(); render(); }); }
    btnPrev.disabled = false;
    btnNext.disabled = true;
    btnNext.textContent = '看完了';
    hintEl.textContent = '這一屏是額外補充，不會打勾、不影響進度。按「回最後一題」即可回題目。';
    window.scrollTo(0, 0);
  }

  /* ---------- 朗讀 ---------- */
  var speaking = false;
  var SYM = {
    '\u221a': ' 根號 ', '\u03c0': ' 圓周率 ', '\u03b8': ' 西塔 ', '\u03bb': ' 蘭姆達 ',
    '\u03b3': ' 伽瑪 ', '\u03bc': ' 繆 ', '\u03c3': ' 西格瑪 ', '\u03a3': ' 總和 ',
    '\u2220': ' 角 ', '\u25b3': ' 三角形 ', '\u00b0': ' 度 ', '\u2208': ' 屬於 ',
    '\u00b1': ' 正負 ', '\u2225': ' 平行 ', '\u2713': ' 打勾 ', '\uff0b': ' 加 '
  };
  var SUP = {
    '\u2070': '0', '\u00b9': '1', '\u00b2': '2', '\u00b3': '3', '\u2074': '4',
    '\u2075': '5', '\u2076': '6', '\u2077': '7', '\u2078': '8', '\u2079': '9', '\u207b': '負'
  };
  function toSpeak(html) {
    var s = String(html || '');
    s = s.replace(/<sup>([^<]*)<\/sup>/g, ' 的 $1 次方 ');
    s = s.replace(/<sub>([^<]*)<\/sub>/g, ' 下標 $1 ');
    s = s.replace(/<br\s*\/?>/gi, '，');
    s = s.replace(/<[^>]+>/g, ' ');
    s = s.replace(/[\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079\u207b]+/g, function (m) {
      var t = '';
      for (var i = 0; i < m.length; i++) { t += SUP[m.charAt(i)] || ''; }
      return ' 的 ' + t + ' 次方 ';
    });
    s = s.replace(/\uff5c([^\uff5c]{1,14})\uff5c/g, ' 絕對值 $1 ');
    Object.keys(SYM).forEach(function (k) { s = s.split(k).join(SYM[k]); });
    s = s.replace(/\(([A-D])\)/g, '$1');
    s = s.replace(/\s*×\s*/g, ' 乘 ');
    s = s.replace(/\s*÷\s*/g, ' 除以 ');
    s = s.replace(/([A-Za-z0-9\)）])\s*−\s*/g, '$1 減 ');
    s = s.replace(/−/g, ' 負 ');
    s = s.replace(/[=＝]/g, ' 等於 ');
    s = s.replace(/⇒|→/g, ' 所以 ');
    s = s.replace(/≤/g, ' 小於等於 ').replace(/≥/g, ' 大於等於 ').replace(/≠/g, ' 不等於 ');
    s = s.replace(/／/g, ' 分之 ').replace(/\//g, ' 分之 ');
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }
  function currentSpeakText() {
    var b = beats[st.bi] || {};
    var parts = [];
    if (b.pickedOpt != null) {
      parts.push('你剛才選的是 ' + 'ABCD'[b.pickedOpt] + '。');
    }
    if (b.speakBefore) { parts.push(b.speakBefore); }
    parts.push(toSpeak(b.guide));
    if (b.opts) {
      parts.push('選項有：' + QS[st.qi].options.map(function (o, i) {
        return 'ABCD'[i] + '、' + toSpeak(o);
      }).join('；') + '。');
    } else if (b.body) {
      parts.push(toSpeak(b.body));
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }
  function stopSpeak() {
    speaking = false;
    try { window.speechSynthesis.cancel(); } catch (e) {}
    btnSpeak.textContent = '唸給我聽';
  }
  function speak(text, thenNext) {
    if (!('speechSynthesis' in window)) {
      btnSpeak.textContent = '這個瀏覽器沒有語音';
      return;
    }
    stopSpeak();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-TW'; u.rate = 0.92; u.pitch = 1;
    u.onend = function () {
      speaking = false; btnSpeak.textContent = '唸給我聽';
      if (thenNext) { next(); }
    };
    u.onerror = function () { speaking = false; btnSpeak.textContent = '唸給我聽'; };
    speaking = true; btnSpeak.textContent = '停止朗讀';
    window.speechSynthesis.speak(u);
  }
  btnSpeak.addEventListener('click', function () {
    if (speaking) { stopSpeak(); return; }
    if (st.ev) {
      speak(evAll().map(evOneSpeak).join(' ').replace(/\s+/g, ' ').trim(), false);
      return;
    }
    speak(currentSpeakText(), chainBox.checked && !beats[st.bi].opts);
  });

  /* ---------- 渲染 ---------- */
  function render() {
    if (st.ev) { renderEvScreen(); return; }
    var q = QS[st.qi];
    beats = beatsOf(q);
    if (st.picked != null) {
      var ok = st.picked === q.answer;
      beats.splice(3, 0, {
        reply: true, pickedOpt: st.picked,
        guide: ok
          ? '你選的是 (' + 'ABCD'[st.picked] + ')，很好，這題你已經會了。我還是帶你確認一次為什麼。'
          : '你選的是 (' + 'ABCD'[st.picked] + ')。先別急，這題很多人第一次也會卡在這裡，我們一起把它一步步想通，就不會再錯。',
        body: ''
      });
    }
    if (st.bi > beats.length - 1) { st.bi = beats.length - 1; }
    var b = beats[st.bi];

    var h = '<div class="screen now">';
    if (b.start) {
      h += '<p class="guide">' + planLine + '</p>' +
           '<div class="bodybox"><p class="stem">這裡不比速度，只看你有沒有真的懂。</p></div>' +
           '<div class="startbtns">' +
           '<button class="btn primary" id="go-first" type="button">從第 ' + q.n + ' 題開始</button>' +
           '<button class="btn" id="go-resume" type="button">繼續上次（第 ' + q.n + ' 題）</button>' +
           '</div><p class="tickline">目前打勾 ' + doneCount() + ' 題。走完一題就會自動打勾。</p>';
    } else {
      var guideText = b.replay ? '我再說一次，這次慢慢來。' : b.guide;
      if (b.replay) { st.replay = false; }     /* 只作用這一屏 */
      h += '<p class="guide">' + guideText + '</p>';
      if (b.opts) {
        h += '<div class="opts">';
        q.options.forEach(function (o, i) {
          h += '<button type="button" class="opt" data-i="' + i + '"><span class="k">' + 'ABCD'[i] + '</span><span>' + o + '</span></button>';
        });
        h += '</div>';
      } else if (b.reply) {
        h += '<div class="startbtns">' +
             '<button class="btn primary" id="go-on" type="button">我懂了，帶我算</button>' +
             '<button class="btn" id="go-again" type="button">再講一次</button>' +
             '</div>';
      } else if (b.body) {
        h += '<div class="bodybox">' + b.body + '</div>';
      }
      if (b.done && st.qi === QS.length - 1 && evAll().length) {
        h += '<div class="startbtns"><button class="btn" id="go-events" type="button">配著讀：這一科的 2026 大事</button></div>';
      }
    }
    h += '</div>';
    stage.innerHTML = h;

    /* 按鈕綁定（每次重畫後重綁） */
    var ge = document.getElementById('go-events');
    if (ge) { ge.addEventListener('click', function () { st.ev = true; save(); render(); }); }
    var f = document.getElementById('go-first');
    if (f) { f.addEventListener('click', function () { st.bi = 1; save(); render(); }); }
    var r = document.getElementById('go-resume');
    if (r) { r.addEventListener('click', function () { st.bi = 1; save(); render(); }); }
    var on = document.getElementById('go-on');
    if (on) {
      on.addEventListener('click', function () {
        var idx = -1;
        for (var i = 0; i < beats.length; i++) { if (beats[i].key) { idx = i; break; } }
        st.bi = idx < 0 ? st.bi + 1 : idx; save(); render();
      });
    }
    var ag = document.getElementById('go-again');
    if (ag) {
      ag.addEventListener('click', function () {
        var idx = -1;
        for (var i = 0; i < beats.length; i++) { if (beats[i].key) { idx = i; break; } }
        st.replay = true; st.bi = idx < 0 ? st.bi + 1 : idx; save(); render();
      });
    }
    Array.prototype.forEach.call(stage.querySelectorAll('.opt'), function (el) {
      el.addEventListener('click', function () {
        st.picked = Number(el.getAttribute('data-i')) | 0;
        save();
        render();                       /* 先重畫，把「回應」屏插進來 */
        for (var i = 0; i < beats.length; i++) {
          if (beats[i].reply) { st.bi = i; break; }   /* 作答後立刻切到回應屏 */
        }
        save(); render();
      });
    });

    if (b.done) {
      q.__touched = true;
      if (!st.done[String(q.n)]) { st.done[String(q.n)] = 1; save(); }
    }
    paintTicks();

    btnPrev.disabled = (st.bi === 0 && st.qi === 0);
    var last = (st.qi === QS.length - 1) && (st.bi === beats.length - 1);
    var evTail = !!(b.done && st.qi === QS.length - 1 && evAll().length);
    btnNext.textContent = b.done
      ? (st.qi === QS.length - 1 ? (evTail ? '配著讀 2026 大事 →' : '今天到這裡') : '下一題 →')
      : '下一句 →';
    btnNext.disabled = !!(b.done && st.qi === QS.length - 1 && !evTail);
    hintEl.textContent = b.done
      ? '這一題已打勾（第 ' + q.n + ' 題・' + (q.unit || '') + '）。想重看就按上一句，或按上面方格跳題。'
      : '鍵盤：← → 換句、R 唸這一句。全程不會自動播放，都由你決定什麼時候往下。';
    st.started = true;
    save();
    /* 「再講一次」＝使用者主動要求，這一句直接唸出來（其餘螢幕一律不自動播放） */
    if (b.replay && b.body) { speak(currentSpeakText(), false); }
  }

  function next() {
    if (st.ev) { return; }
    var b = beats[st.bi];
    if (b.done && st.qi === QS.length - 1 && st.bi === beats.length - 1 && evAll().length) {
      st.ev = true; save(); render(); return;
    }
    if (b.done) {
      if (st.qi < QS.length - 1) {
        st.qi++; st.bi = 0; st.picked = null; st.replay = false;
      } else {
        st.bi = beats.length - 1;
      }
      save(); render(); window.scrollTo(0, 0); return;
    }
    if (st.bi < beats.length - 1) { st.bi++; save(); render(); }
  }
  function prev() {
    if (st.ev) { st.ev = false; save(); render(); return; }
    if (st.bi > 0) { st.bi--; save(); render(); return; }
    if (st.qi > 0) { st.qi--; st.picked = null; st.replay = false; beats = beatsOf(QS[st.qi]); st.bi = beats.length - 1; save(); render(); }
  }
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);
  document.addEventListener('keydown', function (e) {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) { return; }
    if (e.key === 'ArrowRight') { next(); }
    else if (e.key === 'ArrowLeft') { prev(); }
    else if (e.key === 'r' || e.key === 'R') { btnSpeak.click(); }
  });

  /* ---------- 起點：先給「今天怎麼用」的引導屏 ---------- */
  load();
  var firstTodo = 0;
  for (var i = 0; i < QS.length; i++) { if (!st.done[String(QS[i].n)]) { firstTodo = i; break; } }
  var wasEmpty = !st.started;
  st.qi = wasEmpty ? 0 : Math.min(st.qi, QS.length - 1);
  st.bi = 0;
  render();
  if (wasEmpty) {
    stage.innerHTML = '<div class="screen now">' +
      '<p class="guide">' + welcome + '</p>' +
      '<div class="bodybox"><p class="stem">一次只講一件事。看不懂就按「唸給我聽」，想再聽一次就按「再講一次」。</p></div>' +
      '<div class="startbtns">' +
      '<button class="btn primary" id="go-first" type="button">從第 ' + QS[0].n + ' 題開始</button>' +
      '<button class="btn" id="go-first2" type="button">先看第 1 題的關鍵想法</button>' +
      '</div><p class="tickline">目前打勾 ' + doneCount() + ' 題。走完一題就會自動打勾，答錯不會扣任何東西。</p>' +
      '</div>';
    document.getElementById('go-first').addEventListener('click', function () { st.bi = 1; save(); render(); });
    document.getElementById('go-first2').addEventListener('click', function () { st.bi = 3; save(); render(); });
    btnNext.textContent = '開始 →';
    hintEl.textContent = '準備好再按「開始」，不會有任何東西自己動起來。';
  }
})();
