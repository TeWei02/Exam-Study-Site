/* =============================================================================
   考古題解題學習站 — 站台引擎（assets/js/site.js）
   -----------------------------------------------------------------------------
   本檔不含任何科目名稱、科目數、年份、標籤等寫死內容：
   首頁、導覽、科目頁、單題頁、跨科目搜尋全部由索引檔 window.EXAM_INDEX
   （assets/js/subjects.js）與各科題庫資料檔（window.EXAM_BANKS）動態產生。

   頁面型別由網址自動判斷，因此所有頁面共用同一份 HTML 外殼：
     站根                      → 首頁（科目卡片 + 跨科目搜尋）
     subject/<id>/index.html   → 科目頁（題目清單）
     subject/<id>/q.html?n=<n> → 單題頁（第 n 題）
   ============================================================================= */
(function () {
  'use strict';

  /* ---------- 0. 站根路徑：由本檔網址推導，支援 file:// 與子路徑部署 ---------- */
  var SELF_SRC = (document.currentScript && document.currentScript.src) || '';
  var ROOT = '';
  var mSelf = /^(.*?)\/?assets\/js\/site\.js(?:[?#].*)?$/.exec(SELF_SRC);
  if (mSelf) {
    ROOT = mSelf[1] ? mSelf[1].replace(/\/+$/, '') + '/' : '';
  } else {
    var href = location.href.split(/[?#]/)[0];
    var at = href.indexOf('/subject/');
    ROOT = at >= 0 ? href.slice(0, at + 1) : href.replace(/[^/]*$/, '');
  }
  function url(rel) {
    return ROOT + String(rel == null ? '' : rel).replace(/^\.?\//, '');
  }

  /* ---------- 1. 索引檔 ---------- */
  var INDEX = window.EXAM_INDEX;
  var SITE = (INDEX && INDEX.site) || {};
  var SUBJECTS = ((INDEX && INDEX.subjects) || []).slice().sort(function (a, b) {
    var oa = (a.order == null ? 9999 : a.order), ob = (b.order == null ? 9999 : b.order);
    if (oa !== ob) { return oa - ob; }
    var ya = (a.year == null ? -1 : a.year), yb = (b.year == null ? -1 : b.year);
    if (ya !== yb) { return yb - ya; }
    return 0;
  });
  var SITE_TITLE = SITE.title || '考古題學習站';

  function subjectById(id) {
    for (var i = 0; i < SUBJECTS.length; i++) {
      if (String(SUBJECTS[i].id) === String(id)) { return SUBJECTS[i]; }
    }
    return null;
  }
  function yearKeyOf(s) {
    if (s.yearLabel) { return s.yearLabel; }
    if (s.year != null) { return s.year + ' 學年度'; }
    return '未標示年份';
  }
  function subLabel(s) {
    if (!s) { return ''; }
    return String(yearKeyOf(s)).replace(' 學年度', '') + ' ' + (s.name || s.id);
  }
  function metaLine(s) {
    var parts = [];
    if (s.exam) { parts.push(s.exam); }
    if (s.yearLabel || s.year != null) { parts.push(yearKeyOf(s)); }
    if (s.examGroup) { parts.push(s.examGroup); }
    return parts.join('・');
  }
  function chipsHTML(s) {
    if (!s.tags || !s.tags.length) { return ''; }
    var h = '<p class="chips">';
    for (var i = 0; i < s.tags.length; i++) {
      h += '<span class="chip">' + esc(s.tags[i]) + '</span>';
    }
    return h + '</p>';
  }

  /* ---------- 2. 小工具 ---------- */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function plain(html) {
    return String(html == null ? '' : html)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
  function highlight(text, terms) {
    var out = esc(text);
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (!t) { continue; }
      var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      out = out.replace(re, '<mark>$1</mark>');
    }
    return out;
  }
  function $(id) { return document.getElementById(id); }

  /* ---------- 3. 學習進度（localStorage，依科目 id 分開存放） ---------- */
  var STORE_KEY = 'examSite.progress.v1';
  function readAll() {
    try {
      var o = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {};
    } catch (e) { return {}; }
  }
  function writeAll(p) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) { /* 無痕模式等 */ }
  }
  function subjectProgress(id) {
    var p = readAll(), v = p[id];
    return (v && typeof v === 'object') ? v : {};
  }
  function setRecord(id, n, rec) {
    var p = readAll();
    if (!p[id] || typeof p[id] !== 'object') { p[id] = {}; }
    if (rec) { p[id][String(n)] = rec; } else { delete p[id][String(n)]; }
    writeAll(p);
  }
  function clearSubject(id) {
    var p = readAll();
    if (p[id]) { delete p[id]; writeAll(p); }
  }
  function statsOf(s, totalOverride) {
    var rec = subjectProgress(s.id), done = 0, ok = 0, tries = 0, k;
    for (k in rec) {
      if (!Object.prototype.hasOwnProperty.call(rec, k)) { continue; }
      done++;
      if (rec[k] && rec[k].ok) { ok++; }
      if (rec[k] && rec[k].tries) { tries += rec[k].tries; }
    }
    return {
      done: done, ok: ok, tries: tries,
      total: (typeof totalOverride === 'number' && totalOverride > 0)
        ? totalOverride : (s.count || 0)
    };
  }

  /* ---------- 4. 題庫資料載入（動態注入 <script>，file:// 可用） ---------- */
  var CACHE = {}, PENDING = {}, FAILED = {};
  function normalize(raw, id) {
    if (!raw) { return null; }
    var qs = Array.isArray(raw) ? raw : (raw.questions || []);
    if (!Array.isArray(qs) || !qs.length) { return null; }
    return {
      id: (raw.id || id), name: raw.name || '', source: raw.source || '',
      note: raw.note || '', questions: qs
    };
  }
  function cachedBank(id) {
    if (CACHE[id]) { return CACHE[id]; }
    var raw = window.EXAM_BANKS && window.EXAM_BANKS[id];
    var b = normalize(raw, id);
    if (b) { CACHE[id] = b; }
    return b;
  }
  function loadBank(id) {
    return new Promise(function (resolve) {
      var s = subjectById(id);
      if (!s || !s.data) { resolve(null); return; }
      var b = cachedBank(id);
      if (b) { resolve(b); return; }
      if (FAILED[id]) { resolve(null); return; }
      if (PENDING[id]) { PENDING[id].push(resolve); return; }
      PENDING[id] = [resolve];
      var el = document.createElement('script');
      el.async = true;
      el.src = url(s.data);
      el.onload = function () { flush(id); };
      el.onerror = function () { FAILED[id] = true; flush(id); };
      document.head.appendChild(el);
    });
  }
  function flush(id) {
    var waiters = PENDING[id] || [];
    delete PENDING[id];
    var b = cachedBank(id);
    for (var i = 0; i < waiters.length; i++) { waiters[i](b); }
  }
  function loadableSubjects() {
    var out = [];
    for (var i = 0; i < SUBJECTS.length; i++) {
      if (SUBJECTS[i].data) { out.push(SUBJECTS[i]); }
    }
    return out;
  }
  function loadAllBanks() {
    return Promise.all(loadableSubjects().map(function (s) { return loadBank(s.id); }));
  }

  /* ---------- 5. 共用外框（品牌、導覽、頁尾 → 全部由索引檔產生） ---------- */
  function renderChrome(activeId, pageTitle) {
    document.title = pageTitle ? (pageTitle + '｜' + SITE_TITLE) : SITE_TITLE;
    var bt = $('brand-title'), bs = $('brand-sub'), bm = $('brand-mark'), nav = $('head-nav'), ft = $('footer-text');
    if (bt) { bt.textContent = SITE_TITLE; }
    if (bs) { bs.textContent = SITE.subtitle || ''; }
    if (bm) { bm.textContent = (SITE_TITLE || '題').replace(/\s/g, '').charAt(0); }
    if ($('brand')) { $('brand').setAttribute('href', url('index.html')); }
    if (nav) {
      var h = '<a class="nav-home' + (activeId ? '' : ' on') + '" href="' + esc(url('index.html')) + '">首頁</a>';
      for (var i = 0; i < SUBJECTS.length; i++) {
        var s = SUBJECTS[i];
        h += '<a' + (String(s.id) === String(activeId) ? ' class="on"' : '') +
             ' href="' + esc(url('subject/' + s.id + '/index.html')) + '">' +
             esc(s.short || s.name || s.id) + '</a>';
      }
      nav.innerHTML = h;
    }
    if (ft) {
      var lines = SITE.footer || [];
      ft.innerHTML = lines.length
        ? lines.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('')
        : '<p>' + esc(SITE_TITLE) + '</p>';
    }
  }
  function crumbsHTML(list) {
    var h = '<nav class="crumbs">';
    for (var i = 0; i < list.length; i++) {
      if (i) { h += '<span>/</span>'; }
      h += list[i].href ? '<a href="' + esc(list[i].href) + '">' + esc(list[i].text) + '</a>'
                        : '<span>' + esc(list[i].text) + '</span>';
    }
    return h + '</nav>';
  }
  function renderMessage(title, lines, links) {
    var app = $('app');
    var h = '<section class="panel empty"><h1>' + esc(title) + '</h1>';
    for (var i = 0; i < (lines || []).length; i++) { h += '<p>' + lines[i] + '</p>'; }
    h += '<div class="actions">';
    (links || []).forEach(function (l) {
      h += '<a class="btn' + (l.primary ? ' btn-primary' : '') + '" href="' + esc(l.href) + '">' + esc(l.text) + '</a>';
    });
    h += '</div></section>';
    app.innerHTML = h;
  }

  /* ---------- 6. 首頁 ---------- */
  function renderHome() {
    renderChrome(null, '');
    var app = $('app');
    var h = '';
    h += '<section class="hero"><h1>' + esc(SITE.title || SITE_TITLE) + '</h1>';
    if (SITE.subtitle) { h += '<p>' + esc(SITE.subtitle) + '</p>'; }
    h += '<div class="hero-stats" id="hero-stats"></div></section>';

    h += '<section class="panel" id="panel-search"><h2>跨科目搜尋</h2>' +
         '<p class="hint">一份索引、全部科目：輸入關鍵字即可同時搜尋所有科目的題幹、選項與解析。</p>' +
         '<div class="search-row">' +
           '<input id="q" type="search" autocomplete="off" placeholder="例如：餘弦定理、期望值、牛頓第二定律">' +
           '<select id="q-scope" aria-label="搜尋範圍"></select>' +
         '</div>' +
         '<p class="search-status" id="q-status">正在載入各科題庫…</p>' +
         '<div id="q-results"></div></section>';

    h += '<div id="groups"></div>';
    h += crossHubHTML();
    h += '<section class="panel howto"><h2>怎麼用</h2><ol>' +
         '<li>在下方選一個科目，進入科目頁看題目清單。</li>' +
         '<li>點題號進入單題頁，選答案後會立刻對答案並可展開詳解。</li>' +
         '<li>作答結果與完成進度會存在這台裝置的瀏覽器裡，下次打開還在。</li>' +
         '<li>想找特定觀念，直接在最上方的搜尋框打關鍵字，會一次搜過所有科目。</li>' +
         '</ol></section>';
    app.innerHTML = h;

    renderScopeSelect();
    renderCards();
    renderHeroStats();
    bindCrossHub();
    bindGlobalSearch();
    loadAllBanks().then(function () {
      var miss = loadableSubjects().filter(function (s) { return FAILED[s.id]; });
      var st = $('q-status');
      if (st) {
        var msg = '已載入 ' + (loadableSubjects().length - miss.length) + ' 份題庫，可開始搜尋。';
        if (miss.length) { msg += '（' + miss.map(function (s) { return s.name || s.id; }).join('、') + ' 的資料檔載入失敗）'; }
        if (!loadableSubjects().length) { msg = '索引檔中目前沒有任何已登錄的題庫資料檔。'; }
        st.textContent = msg;
      }
      runGlobalSearch();
    });
  }

  function renderHeroStats() {
    var host = $('hero-stats');
    if (!host) { return; }
    var total = 0, answered = 0, ok = 0, ready = 0;
    SUBJECTS.forEach(function (s) {
      var b = cachedBank(s.id);
      var t = b ? b.questions.length : (s.count || 0);
      var st = statsOf(s, t);
      total += t; answered += st.done; ok += st.ok;
      if (s.data) { ready++; }
    });
    var items = [
      ['科目', SUBJECTS.length],
      ['可練習科目', ready],
      ['題目', total],
      ['已作答', answered],
      ['答對', ok]
    ];
    host.innerHTML = items.map(function (it) {
      return '<span class="stat"><b>' + it[1] + '</b>' + esc(it[0]) + '</span>';
    }).join('');
  }

  /* ---------- 6.5 一科訓練五科（跨科串聯／綜合混編／弱科帶動） ---------- */
  function crossHubHTML() {
    return '' +
      '<section class="panel cross-hub" id="cross-hub">' +
        '<h2>一科訓練五科</h2>' +
        '<p class="hint">練一科，同時把其他科的同一個觀念拉進來。三種模式都直接吃你現在的題庫與作答紀錄，不新增任何寫死的科目。</p>' +
        '<div class="cross-modes">' +
          '<article class="cross-mode">' +
            '<h3><span class="mode-no">1</span>跨科串聯</h3>' +
            '<p>單題頁下方會自動列出其他科「同一個觀念」的題目，練一題就順手把別科也帶上。</p>' +
            '<div id="cross-link-list"><p class="hint">統計中…</p></div>' +
          '</article>' +
          '<article class="cross-mode">' +
            '<h3><span class="mode-no">2</span>綜合混編卷</h3>' +
            '<p>挑一個學年度，跨五科抽題組成一份綜合卷，在這裡就能連續作答。</p>' +
            '<div class="cross-form">' +
              '<label>學年度<select id="mix-year"></select></label>' +
              '<label>每科題數<select id="mix-per">' +
                '<option value="1">1</option><option value="2" selected>2</option>' +
                '<option value="3">3</option><option value="4">4</option></select></label>' +
              '<button class="btn btn-primary" id="mix-go" type="button">生成混編卷</button>' +
            '</div>' +
          '</article>' +
          '<article class="cross-mode">' +
            '<h3><span class="mode-no">3</span>弱科帶動</h3>' +
            '<p>依你目前的答對率找出最弱的科目，優先抽它的題目組成訓練卷。</p>' +
            '<div class="cross-form">' +
              '<label>題數<select id="weak-count">' +
                '<option value="5">5</option><option value="10" selected>10</option>' +
                '<option value="15">15</option></select></label>' +
              '<button class="btn btn-primary" id="weak-go" type="button">開始弱科訓練</button>' +
            '</div>' +
            '<div id="weak-stat"></div>' +
          '</article>' +
        '</div>' +
        '<div id="practice-host"></div>' +
      '</section>';
  }

  function totalQuestions() {
    var n = 0;
    SUBJECTS.forEach(function (s) {
      var b = cachedBank(s.id);
      n += b ? b.questions.length : 0;
    });
    return n;
  }
  function loadedBankCount() {
    var n = 0;
    loadableSubjects().forEach(function (s) { if (cachedBank(s.id)) { n++; } });
    return n;
  }
  function recordedOf(s, q) { return subjectProgress(s.id)[String(q.n)] || null; }
  function needScore(s, q) {
    var r = recordedOf(s, q);
    if (!r) { return 0; }            /* 沒作答過：優先練 */
    if (r.ok) { return 2; }          /* 已答對：排最後 */
    return 1;                        /* 答錯過：中間 */
  }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function buildMixed(yearLabel, per) {
    var items = [];
    SUBJECTS.forEach(function (s) {
      if (!s.data || yearKeyOf(s) !== yearLabel) { return; }
      var b = cachedBank(s.id);
      if (!b) { return; }
      var pool = shuffle(b.questions.slice()).sort(function (a, c) { return needScore(s, a) - needScore(s, c); });
      pool.slice(0, per).forEach(function (q) { items.push({ s: s, q: q }); });
    });
    return items;
  }

  /* 以「科目」為單位彙整（數學／物理／化學／英文／國文各年份合併），找出真正的弱科 */
  function weakRanking() {
    var groups = {}, order = [];
    SUBJECTS.forEach(function (s) {
      if (!s.data) { return; }
      var b = cachedBank(s.id);
      if (!b) { return; }
      var st = statsOf(s, b.questions.length);
      var key = s.name || s.id;
      if (!groups[key]) { groups[key] = { name: key, subjects: [], done: 0, ok: 0, total: 0 }; order.push(key); }
      var g = groups[key];
      g.subjects.push(s);
      g.done += st.done; g.ok += st.ok; g.total += st.total;
    });
    var rank = order.map(function (k) {
      var g = groups[k];
      g.rate = g.done ? (g.ok / g.done) : -1;
      return g;
    });
    rank.sort(function (a, b) {
      if (a.rate !== b.rate) { return a.rate - b.rate; }
      return a.done - b.done;
    });
    return rank;
  }
  function buildWeak(count) {
    var rank = weakRanking();
    var weakOnes = rank.filter(function (x) { return x.done > 0 && x.rate < 0.8; });
    var pool = weakOnes.slice(0, 2);
    rank.forEach(function (x) {                       /* 不足兩科時，用還沒練過的科目補齊 */
      if (pool.length >= 2 || pool.indexOf(x) >= 0 || x.done > 0) { return; }
      pool.push(x);
    });
    if (!pool.length) { pool = rank.slice(0, 2); }
    var names = pool.map(function (x) { return x.name; }).join('、');
    var note = weakOnes.length
      ? '依你目前的答對率，先從 ' + names + ' 抽題（跨年份混合）。'
      : '目前還沒有明顯落後的科目，先抽 ' + names + ' 熱身；錯的題目會被記住，下次優先再練。';
    var items = [], seenIds = {};
    pool.forEach(function (g) {
      var cand = [];
      g.subjects.forEach(function (s) {
        var b = cachedBank(s.id);
        if (!b) { return; }
        b.questions.forEach(function (q) { cand.push({ s: s, q: q }); });
      });
      shuffle(cand).sort(function (a, c) { return needScore(a.s, a.q) - needScore(c.s, c.q); });
      cand.slice(0, Math.max(1, Math.ceil(count / pool.length))).forEach(function (it) {
        if (seenIds[it.s.id + '#' + it.q.n]) { return; }
        seenIds[it.s.id + '#' + it.q.n] = 1;
        items.push(it);
      });
    });
    return { items: items.slice(0, count), ranked: rank, note: note };
  }
  function renderWeakStat(rank) {
    var host = $('weak-stat');
    if (!host) { return; }
    var r = rank || weakRanking();
    if (!r.length) { host.innerHTML = ''; return; }
    var parts = r.slice(0, 5).map(function (x) {
      var pct = x.done ? Math.round(x.rate * 100) + '%' : '—';
      return esc(x.name) + ' ' + pct + '（' + x.done + '／' + x.total + '）';
    });
    host.innerHTML = '<p class="hint">目前答對率：' + parts.join('・') + '</p>';
  }

  function renderCrossLinkSample() {
    var host = $('cross-link-list');
    if (!host) { return; }
    var marked = [];
    SUBJECTS.forEach(function (s) {
      var b = cachedBank(s.id);
      if (!b) { return; }
      b.questions.forEach(function (q) {
        if (q.cross && q.cross.length) { marked.push({ s: s, q: q }); }
      });
    });
    var h = '';
    if (marked.length) {
      h += '<p class="hint">已標註 ' + marked.length + ' 題有人工跨科連結，例如：</p><ul class="cross-list">';
      marked.slice(0, 4).forEach(function (it) {
        h += '<li><a href="' + esc(url('subject/' + it.s.id + '/q.html?n=' + encodeURIComponent(it.q.n))) + '">' +
             '<span class="cross-sub">' + esc(subLabel(it.s)) + '</span>' +
             '<span class="cross-no">第 ' + esc(it.q.n) + ' 題</span>' +
             '<span class="cross-why">延伸 ' + it.q.cross.length + ' 題</span></a></li>';
      });
      h += '</ul>';
    } else {
      h += '<p class="hint">還沒有標註資料也沒關係：單題頁會用題幹關鍵字，自動找出其他科的同概念題目。</p>';
    }
    h += '<p class="hint">已載入 ' + loadedBankCount() + ' 份題庫、共 ' + totalQuestions() + ' 題可跨科比對。</p>';
    host.innerHTML = h;
  }

  function bindCrossHub() {
    var yearSel = $('mix-year');
    if (yearSel) {
      var seen = {}, keys = [];
      SUBJECTS.forEach(function (s) {
        if (!s.data) { return; }
        var k = yearKeyOf(s);
        if (seen[k] == null) { seen[k] = 0; keys.push(k); }
        seen[k]++;
      });
      var h = '';
      keys.forEach(function (k) {
        if (seen[k] < 2) { return; }
        h += '<option value="' + esc(k) + '">' + esc(k) + '（' + seen[k] + ' 科）</option>';
      });
      yearSel.innerHTML = h;
    }
    var mixGo = $('mix-go');
    if (mixGo) {
      mixGo.addEventListener('click', function () {
        var yv = yearSel ? yearSel.value : '';
        var perEl = $('mix-per');
        var per = Number(perEl ? perEl.value : 2);
        if (!yv) { return; }
        mixGo.disabled = true;
        loadAllBanks().then(function () {
          mixGo.disabled = false;
          var items = buildMixed(yv, per);
          renderPractice('practice-host', items, yv + ' 綜合混編卷', '五科交錯出題，答完立刻看解析；右上可跳單題頁。');
          renderHeroStats();
        });
      });
    }
    var weakGo = $('weak-go');
    if (weakGo) {
      weakGo.addEventListener('click', function () {
        var cntEl = $('weak-count');
        var cnt = Number(cntEl ? cntEl.value : 10);
        weakGo.disabled = true;
        loadAllBanks().then(function () {
          weakGo.disabled = false;
          var res = buildWeak(cnt);
          renderWeakStat(res.ranked);
          renderPractice('practice-host', res.items, '弱科訓練卷', res.note);
          renderHeroStats();
        });
      });
    }
    renderCrossLinkSample();
    renderWeakStat(null);
    loadAllBanks().then(function () { renderCrossLinkSample(); renderWeakStat(null); });
  }

  function renderCards() {
    var host = $('groups');
    if (!SUBJECTS.length) {
      host.innerHTML = '<section class="panel empty"><p>索引檔（<code>assets/js/subjects.js</code>）中尚未登錄任何科目。</p>' +
        '<p>在 <code>subjects</code> 陣列加入一筆，重新整理後即會出現在這裡。</p></section>';
      return;
    }
    var groups = {}, order = [];
    SUBJECTS.forEach(function (s) {
      var k = yearKeyOf(s);
      if (!groups[k]) {
        groups[k] = { key: k, year: (s.year == null ? -1 : s.year), items: [] };
        order.push(groups[k]);
      }
      groups[k].items.push(s);
    });
    order.sort(function (a, b) { return b.year - a.year; });
    var h = '';
    order.forEach(function (g) {
      h += '<section class="year-group"><h2 class="year-label">' + esc(g.key) +
           '<span class="year-count">' + g.items.length + ' 科</span></h2><div class="grid">';
      g.items.forEach(function (s) { h += cardHTML(s); });
      h += '</div></section>';
    });
    host.innerHTML = h;
  }

  function cardHTML(s) {
    var b = cachedBank(s.id);
    var ready = !!s.data;
    var total = b ? b.questions.length : (s.count || 0);
    var st = statsOf(s, total);
    var pct = total ? Math.round(st.done / total * 100) : 0;
    var h = '<article class="card' + (ready ? '' : ' card-pending') + '">';
    h += '<div class="card-top"><h3>' + esc(s.name || s.id) + '</h3>' +
         (ready ? '<span class="badge badge-ok">可練習</span>'
                : '<span class="badge badge-wait">題庫建置中</span>') + '</div>';
    var ml = metaLine(s);
    if (ml) { h += '<p class="card-exam">' + esc(ml) + '</p>'; }
    h += chipsHTML(s);
    h += '<div class="card-foot">';
    if (ready) {
      h += '<span class="num">' + total + ' 題</span>' +
           '<span class="num">已作答 ' + st.done + '／答對 ' + st.ok + '</span>';
    } else if (s.count) {
      h += '<span class="num">預計 ' + s.count + ' 題</span>';
    }
    h += '</div>';
    if (ready) { h += '<div class="bar"><i style="width:' + pct + '%"></i></div>'; }
    h += '<a class="go" href="' + esc(url('subject/' + s.id + '/index.html')) + '">' +
         (ready ? '開始練習' : '查看科目頁') + '</a></article>';
    return h;
  }

  /* ---------- 7. 跨科目全域搜尋 ---------- */
  function renderScopeSelect() {
    var sel = $('q-scope');
    if (!sel) { return; }
    var h = '<option value="">全部科目</option>';
    SUBJECTS.forEach(function (s) {
      h += '<option value="' + esc(s.id) + '">' + esc(s.name || s.id) + '</option>';
    });
    sel.innerHTML = h;
  }
  function termsOf(qstr) {
    return String(qstr || '').split(/\s+/).filter(function (t) { return t.length > 0; });
  }
  function searchAll(terms, scopeId, limit) {
    var hits = [];
    for (var i = 0; i < SUBJECTS.length; i++) {
      var s = SUBJECTS[i];
      if (scopeId && String(s.id) !== String(scopeId)) { continue; }
      var b = cachedBank(s.id);
      if (!b) { continue; }
      for (var j = 0; j < b.questions.length; j++) {
        var q = b.questions[j];
        var stem = plain(q.stem);
        var sol = plain(q.sol);
        if (q.unit) { sol = '[' + plain(q.unit) + '] ' + sol; }
        var hay = (stem + ' ' + sol).toLowerCase();
        var all = true, firstAt = -1, where = '';
        for (var k = 0; k < terms.length; k++) {
          var at = hay.indexOf(terms[k].toLowerCase());
          if (at < 0) { all = false; break; }
          if (firstAt < 0 || at < firstAt) { firstAt = at; }
        }
        if (!all) { continue; }
        var inStem = true;
        for (var t2 = 0; t2 < terms.length; t2++) {
          if (stem.toLowerCase().indexOf(terms[t2].toLowerCase()) < 0) { inStem = false; break; }
        }
        where = inStem ? '題幹' : (sol.toLowerCase().indexOf(terms[0].toLowerCase()) >= 0 ? '解析' : '題幹');
        hits.push({ s: s, q: q, stem: stem, sol: sol, where: where, terms: terms });
        if (hits.length >= limit) { return hits; }
      }
    }
    return hits;
  }
  function snippet(hit) {
    var src = hit.where === '解析' ? hit.sol : hit.stem;
    var low = src.toLowerCase();
    var at = -1, len = 0;
    for (var i = 0; i < hit.terms.length; i++) {
      var p = low.indexOf(hit.terms[i].toLowerCase());
      if (p >= 0 && (at < 0 || p < at)) { at = p; len = hit.terms[i].length; }
    }
    if (at < 0) {
      for (var j = 0; j < hit.terms.length; j++) {
        var p2 = hit.sol.toLowerCase().indexOf(hit.terms[j].toLowerCase());
        if (p2 >= 0) { src = hit.sol; at = p2; len = hit.terms[j].length; hit.where = '解析'; break; }
      }
    }
    if (at < 0) { return esc(src.slice(0, 90)); }
    var from = Math.max(0, at - 26), to = Math.min(src.length, at + len + 46);
    return (from > 0 ? '…' : '') +
      highlight(src.slice(from, to), hit.terms) +
      (to < src.length ? '…' : '');
  }
  function bindGlobalSearch() {
    var input = $('q'), sel = $('q-scope'), timer = null;
    if (!input) { return; }
    var pre = /[?&]q=([^&]*)/.exec(location.search);
    if (pre) { input.value = decodeURIComponent(pre[1].replace(/\+/g, ' ')); }
    function kick() { clearTimeout(timer); timer = setTimeout(runGlobalSearch, 160); }
    input.addEventListener('input', kick);
    if (sel) { sel.addEventListener('change', kick); }
  }
  function runGlobalSearch() {
    var input = $('q'), sel = $('q-scope'), status = $('q-status'), host = $('q-results');
    if (!input || !host) { return; }
    var terms = termsOf(input.value);
    var scopeId = sel ? sel.value : '';
    if (!terms.length) {
      host.innerHTML = '';
      if (status) { status.textContent = '輸入關鍵字後會即時搜尋所有已登錄題庫的科目。'; }
      return;
    }
    var hits = searchAll(terms, scopeId, 60);
    if (status) {
      status.textContent = '關鍵字「' + terms.join(' ') + '」共找到 ' + hits.length +
        ' 題' + (hits.length >= 60 ? '（僅顯示前 60 題）' : '');
    }
    if (!hits.length) {
      host.innerHTML = '<p class="search-status">沒有符合的題目，換個關鍵字試試。</p>';
      return;
    }
    var h = '';
    hits.forEach(function (hit) {
      var qn = (hit.q.n == null ? '' : hit.q.n);
      h += '<a class="res" href="' + esc(url('subject/' + hit.s.id + '/q.html?n=' + encodeURIComponent(qn))) + '">' +
           '<div class="res-head"><span class="res-sub">' + esc(hit.s.name || hit.s.id) + '</span>' +
           '<span class="res-meta">第 ' + esc(qn) + ' 題' +
           (hit.q.unit ? '・' + esc(hit.q.unit) : '') +
           (hit.q.diff ? '・難度 ' + esc(hit.q.diff) : '') + '</span></div>' +
           '<div class="res-snip">' + snippet(hit) + '</div>' +
           '<div class="res-hit">命中位置：' + esc(hit.where) + '</div></a>';
    });
    host.innerHTML = h;
  }

  /* ---------- 8. 科目頁 ---------- */
  function renderSubject(id) {
    var s = subjectById(id);
    renderChrome(id, '');
    if (!s) {
      renderMessage('找不到科目「' + String(id) + '」', [
        '目前索引檔（<code>assets/js/subjects.js</code>）中沒有這個科目 id。',
        '可能是網址打錯，或該科目尚未登錄到索引檔。'
      ], [{ text: '回首頁', href: url('index.html'), primary: true }]);
      return;
    }
    document.title = (s.name || s.id) + '｜' + SITE_TITLE;
    var app = $('app');
    var h = crumbsHTML([{ text: '首頁', href: url('index.html') }, { text: s.name || s.id }]);
    h += '<section class="panel head-panel"><h1>' + esc(s.name || s.id) + '</h1>';
    var ml = metaLine(s);
    if (ml) { h += '<p class="meta">' + esc(ml) + '</p>'; }
    h += chipsHTML(s);
    if (s.note) { h += '<p class="meta">' + esc(s.note) + '</p>'; }
    h += '<div class="progress-line" id="sub-progress"></div></section>';
    h += '<section class="panel"><div id="sub-body"><p class="loading">載入題庫…</p></div></section>';
    app.innerHTML = h;

    loadBank(s.id).then(function (bank) {
      var host = $('sub-body');
      if (!host) { return; }
      if (!bank) { host.innerHTML = emptyBankHTML(s); setSubProgress(s, 0); return; }
      setSubProgress(s, bank.questions.length);
      host.innerHTML = subjectListHTML(s, bank);
      bindSubjectFilter(bank);
    });
  }
  function emptyBankHTML(s) {
    return '<div class="empty">' +
      '<p>這個科目還沒登錄題庫資料檔，所以科目頁暫時沒有題目清單。</p>' +
      '<p>要讓它出現題目：把題庫寫成資料檔（例如 <code>assets/js/data/' + esc(s.id) + '.js</code>），' +
      '再到索引檔 <code>assets/js/subjects.js</code> 把該筆的 <code>data</code> 指向它，' +
      '執行 <code>python3 tools/sync.py</code> 後重新整理即可。</p>' +
      '<p>索引中宣告的題數：' + esc(s.count || '未填') + '。</p></div>';
  }
  function setSubProgress(s, total) {
    var host = $('sub-progress');
    if (!host) { return; }
    var st = statsOf(s, total);
    var pct = st.total ? Math.round(st.done / st.total * 100) : 0;
    host.innerHTML = '<span>進度 ' + st.done + '／' + st.total + ' 題</span>' +
      '<span>答對 ' + st.ok + ' 題</span>' +
      '<span>作答次數 ' + st.tries + '</span>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div>';
  }
  function subjectListHTML(s, bank) {
    var rec = subjectProgress(s.id);
    var h = '<div class="toolbar">' +
      '<input id="sub-filter" class="filter-input" type="search" autocomplete="off" placeholder="篩選本科題目（題幹、單元、解析）">' +
      '<button class="btn" id="sub-reset" type="button">清除本科進度</button>' +
      '</div><p class="hint" id="sub-count"></p>' +
      '<ul class="qlist" id="sub-list">';
    bank.questions.forEach(function (q) {
      var r = rec[String(q.n)];
      var state = !r ? '<span class="qstate none">未作答</span>'
        : (r.ok ? '<span class="qstate ok">答對</span>' : '<span class="qstate bad">答錯過</span>');
      var stem = plain(q.stem);
      var txt = (stem + ' ' + plain(q.sol) + ' ' + (q.unit || '')).toLowerCase();
      h += '<li><a class="qrow" data-txt="' + esc(txt) + '" href="q.html?n=' + encodeURIComponent(q.n) + '">' +
        '<span class="qno">' + esc(q.n) + '</span>' +
        '<span class="qstem">' + esc(stem.slice(0, 80)) + '</span>' +
        (q.unit ? '<span class="qunit">' + esc(q.unit) + '</span>' : '') + state + '</a></li>';
    });
    h += '</ul>';
    return h;
  }
  function bindSubjectFilter(bank) {
    var input = $('sub-filter'), list = $('sub-list'), counter = $('sub-count'), reset = $('sub-reset');
    function visibleCount() {
      if (!list) { return 0; }
      var items = list.querySelectorAll('li'), n = 0;
      for (var i = 0; i < items.length; i++) {
        if (items[i].style.display !== 'none') { n++; }
      }
      return n;
    }
    function updateCount() {
      if (counter) { counter.textContent = counter.dataset.base + '｜目前顯示 ' + visibleCount() + ' 題'; }
    }
    if (counter) {
      counter.dataset.base = '共 ' + bank.questions.length + ' 題' +
        (bank.source ? '（' + bank.source + '）' : '');
    }
    if (input && list) {
      input.addEventListener('input', function () {
        var kw = input.value.trim().toLowerCase();
        var items = list.querySelectorAll('li');
        for (var i = 0; i < items.length; i++) {
          var txt = items[i].querySelector('.qrow').getAttribute('data-txt') || '';
          items[i].style.display = (!kw || txt.indexOf(kw) >= 0) ? '' : 'none';
        }
        updateCount();
      });
    }
    if (reset) {
      reset.addEventListener('click', function () {
        if (!window.confirm('確定清除「' + (subjectById(bank.id) ? (subjectById(bank.id).name || bank.id) : bank.id) + '」在本機的作答紀錄？')) { return; }
        clearSubject(bank.id);
        renderSubject(bank.id);
      });
    }
    updateCount();
  }

  /* ---------- 9. 單題頁 ---------- */
  function renderQuestion(id, n) {
    var s = subjectById(id);
    renderChrome(id, '');
    if (!s) {
      renderMessage('找不到科目「' + String(id) + '」', [
        '目前索引檔中沒有這個科目 id，請回首頁重新選擇。'
      ], [{ text: '回首頁', href: url('index.html'), primary: true }]);
      return;
    }
    var app = $('app');
    app.innerHTML = crumbsHTML([
      { text: '首頁', href: url('index.html') },
      { text: s.name || s.id, href: url('subject/' + s.id + '/index.html') },
      { text: '第 ' + n + ' 題' }
    ]) + '<section class="panel"><p class="loading">載入題目…</p></section>';

    loadBank(s.id).then(function (bank) {
      var qs = bank ? bank.questions : [];
      var idx = -1;
      for (var i = 0; i < qs.length; i++) {
        if (String(qs[i].n) === String(n)) { idx = i; break; }
      }
      if (idx < 0) {
        document.title = '找不到題目｜' + (s.name || s.id) + '｜' + SITE_TITLE;
        renderMessage('找不到第 ' + String(n) + ' 題', [
          (bank ? '本科題庫目前共 ' + qs.length + ' 題。' : '本科尚未登錄可用的題庫資料檔。'),
          '請回科目頁選擇題號。'
        ], [
          { text: '回科目頁', href: url('subject/' + s.id + '/index.html'), primary: true },
          { text: '回首頁', href: url('index.html') }
        ]);
        return;
      }
      document.title = '第 ' + qs[idx].n + ' 題｜' + (s.name || s.id) + '｜' + SITE_TITLE;
      renderQuestionPanel(s, qs, idx);
    });
  }

  function renderQuestionPanel(s, qs, idx) {
    var q = qs[idx];
    var rec = subjectProgress(s.id)[String(q.n)] || null;
    var app = $('app');
    var h = crumbsHTML([
      { text: '首頁', href: url('index.html') },
      { text: s.name || s.id, href: url('subject/' + s.id + '/index.html') },
      { text: '第 ' + q.n + ' 題' }
    ]);
    h += '<section class="panel">';
    h += '<div class="q-head"><h1>第 ' + esc(q.n) + ' 題</h1>' +
         '<span class="badge badge-ok">' + esc(s.name || s.id) + '</span></div>';
    h += '<div class="q-meta">';
    if (s.yearLabel || s.year != null) { h += '<span class="chip">' + esc(yearKeyOf(s)) + '</span>'; }
    if (q.unit) { h += '<span class="chip">' + esc(q.unit) + '</span>'; }
    if (q.diff) { h += '<span class="chip">難度 ' + esc(q.diff) + '</span>'; }
    if (q.answer == null) { h += '<span class="chip">本題無標準答案</span>'; }
    h += '</div>';
    h += '<div class="stem">' + (q.stem || '') + '</div>';
    h += '<ul class="opts" id="opts">';
    var keys = ['A', 'B', 'C', 'D', 'E', 'F'];
    (q.options || []).forEach(function (o, i) {
      h += '<li><button class="opt" type="button" data-i="' + i + '">' +
           '<span class="opt-key">' + (keys[i] || (i + 1)) + '</span><span class="opt-txt">' + o + '</span></button></li>';
    });
    h += '</ul>';
    h += '<div id="fb"></div>';
    h += '<div class="actions">';
    if (q.answer != null) { h += '<button class="btn" id="reveal" type="button">顯示／隱藏解析</button>'; }
    var asrc = animSrc(s, q.n);
    if (asrc) {
      h += '<button class="btn btn-primary" id="load-anim" type="button">載入動畫</button>';
      h += '<a class="btn" href="' + esc(asrc) + '" target="_blank" rel="noopener">另開動畫視窗</a>';
    }
    h += '<button class="btn" id="clear-one" type="button">清除本題紀錄</button>';
    h += '</div>';
    if (asrc) { h += '<div class="anim-box" id="anim-box"></div>'; }
    h += '<div id="sol-box"></div>';
    h += '<div class="cross-host" id="cross-box" data-cross-ready="0">' +
         '<p class="cross-loading">正在載入跨科延伸…</p></div>';
    h += '<div class="pager">' +
      '<span id="pg-prev"></span><span id="pg-next"></span></div>';
    h += '</section>';
    app.innerHTML = h;

    /* 選項互動 */
    var opts = $('opts');
    var fb = $('fb');
    function state() { return subjectProgress(s.id)[String(q.n)] || null; }
    function paint(rec2) {
      var btns = opts.querySelectorAll('.opt');
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('pick', 'ok', 'bad');
        var bi = Number(btns[i].getAttribute('data-i'));
        if (rec2 && (rec2.tr || []).indexOf(bi) >= 0) { btns[i].classList.add('bad'); }
        if (rec2 && rec2.pick === bi) { btns[i].classList.add(rec2.ok ? 'ok' : 'pick'); }
      }
      if (rec2 && rec2.pick != null) {
        var solved = rec2.ok || (rec2.tr && (rec2.tr.indexOf(q.answer) >= 0));
        var txt = rec2.ok ? '答對了！' : (solved ? '正確答案是 ' + keyOf(q.answer) + '。' : '再看看，這題還沒解開。');
        var cls = rec2.ok ? 'feedback ok' : 'feedback bad';
        fb.innerHTML = '<p class="' + cls + '"><span class="fb-title">' +
          (rec2.ok ? '答對' : '再試一次') + '：</span>' + esc(txt) +
          (q.answer != null ? '（你的選擇：' + keyOf(rec2.pick) + '）' : '') + '</p>';
      } else {
        fb.innerHTML = '';
      }
    }
    opts.addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('.opt') : null;
      if (!btn) { return; }
      var i = Number(btn.getAttribute('data-i'));
      var r = state() || { pick: null, ok: false, tries: 0, tr: [] };
      var wrong = (r.tr || []).slice();
      r.tries = (r.tries || 0) + 1;
      r.pick = i;
      if (q.answer == null) { r.ok = true; }
      else if (i === q.answer) { r.ok = true; }
      else if (wrong.indexOf(i) < 0) { wrong.push(i); }
      r.tr = wrong;
      setRecord(s.id, q.n, r);
      paint(r);
      if (r.ok) { showSol(); refreshPager(); }
    });
    paint(state());

    /* 解析 */
    var solBox = $('sol-box');
    var opened = false;
    function showSol() {
      if (opened || !solBox) { return; }
      opened = true;
      solBox.innerHTML = '<div class="sol"><h2>詳解</h2>' + (q.sol || '<p>本題尚未提供詳解。</p>') + '</div>';
    }
    var reveal = $('reveal');
    if (reveal) {
      reveal.addEventListener('click', function () {
        if (opened) { opened = false; solBox.innerHTML = ''; } else { showSol(); }
      });
    }

    /* 動畫（惰性載入 iframe，避免一次載入大量 canvas） */
    var animBtn = $('load-anim'), animBox = $('anim-box');
    if (animBtn && animBox) {
      animBtn.addEventListener('click', function () {
        if (animBox.getAttribute('data-on') === '1') {
          animBox.innerHTML = ''; animBox.removeAttribute('data-on');
          animBtn.textContent = '載入動畫'; return;
        }
        animBox.setAttribute('data-on', '1');
        animBtn.textContent = '收起動畫';
        animBox.innerHTML = '<iframe data-src="' + esc(animSrc(s, q.n)) + '" title="動畫" loading="lazy"></iframe>';
        var fr = animBox.querySelector('iframe');
        fr.src = fr.getAttribute('data-src');
        try { fr.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { }
      });
    }

    /* 清除本題 */
    var co = $('clear-one');
    if (co) {
      co.addEventListener('click', function () {
        setRecord(s.id, q.n, null);
        var i2;
        for (i2 = 0; i2 < opts.querySelectorAll('.opt').length; i2++) {
          opts.querySelectorAll('.opt')[i2].classList.remove('pick', 'ok', 'bad');
        }
        fb.innerHTML = '';
        opened = false;
        if (solBox) { solBox.innerHTML = ''; }
        refreshPager();
      });
    }

    /* 上下題 */
    function refreshPager() {
      var prev = $('pg-prev'), next = $('pg-next');
      if (!prev || !next) { return; }
      prev.innerHTML = idx > 0
        ? '<a class="btn" href="q.html?n=' + encodeURIComponent(qs[idx - 1].n) + '">上一題：第 ' + esc(qs[idx - 1].n) + ' 題</a>'
        : '<span class="btn" aria-disabled="true">已是第一題</span>';
      next.innerHTML = idx < qs.length - 1
        ? '<a class="btn btn-primary" href="q.html?n=' + encodeURIComponent(qs[idx + 1].n) + '">下一題：第 ' + esc(qs[idx + 1].n) + ' 題</a>'
        : '<span class="btn" aria-disabled="true">已是本卷最後一題</span>';
    }
    refreshPager();
    mountCross(s, q);
  }

  /* ---------- 8.5 跨科串聯：單題頁下方的延伸題 ---------- */
  var CROSS_STOP = {
    '下列': 1, '何者': 1, '何項': 1, '試問': 1, '關於': 1, '請問': 1, '敘述': 1,
    '正確': 1, '錯誤': 1, '選出': 1, '的是': 1, '哪些': 1, '如圖': 1, '附圖': 1,
    '以及': 1, '一個': 1, '兩個': 1, '下列何者': 1, '下列敘述': 1
  };
  var CROSS_BAD = /(的值|之值|的值為|為何|多少|下列|以下|以上|哪一|哪個|哪些|共有|一共|總共|可以|應該|必須|選項|答案|如圖|附圖|圖中|如下|何者|正確|錯誤|最接近|據上述|上述|接近|敘述|試問|請問)/;
  var CROSS_PRE = '的了是在若為與及或且一這那其就也都不會可則到由被將把之而數某上下大小我你他她它個些每';
  var CROSS_SUF = '的了是在若為與及或且之而都也不可則到由被將把得地於對從並會';
  var CROSS_EN = {
    the: 1, and: 1, for: 1, that: 1, with: 1, was: 1, were: 1, are: 1, is: 1, of: 1, to: 1,
    in: 1, on: 1, by: 1, as: 1, at: 1, it: 1, its: 1, his: 1, her: 1, their: 1, they: 1,
    this: 1, these: 1, those: 1, from: 1, which: 1, what: 1, when: 1, where: 1, who: 1,
    not: 1, but: 1, or: 1, if: 1, then: 1, than: 1, so: 1, such: 1, can: 1, could: 1,
    should: 1, would: 1, may: 1, might: 1, must: 1, have: 1, has: 1, had: 1, do: 1,
    does: 1, did: 1, be: 1, been: 1, being: 1, about: 1, into: 1, over: 1, after: 1,
    before: 1, between: 1, during: 1, only: 1, also: 1, more: 1, most: 1, some: 1, any: 1,
    all: 1, both: 1, each: 1, other: 1, another: 1, one: 1, two: 1, first: 1, second: 1,
    following: 1, according: 1, passage: 1, article: 1, choose: 1, best: 1, answer: 1,
    option: 1, statement: 1, true: 1, false: 1, correct: 1, incorrect: 1, question: 1,
    blank: 1, least: 1, likely: 1, there: 1, here: 1, him: 1, she: 1, he: 1, you: 1, we: 1
  };
  function crossTermOK(w, loose) {
    if (/^[A-Za-z]/.test(w)) {                        /* 英文詞：至少 4 字母且非功能詞 */
      return w.length >= 4 && !CROSS_EN[w.toLowerCase()];
    }
    if (w.length < (loose ? 2 : 3)) { return false; } /* 華語詞：嚴格模式至少 3 字 */
    if (CROSS_PRE.indexOf(w.charAt(0)) >= 0) { return false; }
    if (CROSS_SUF.indexOf(w.charAt(w.length - 1)) >= 0) { return false; }
    if (CROSS_STOP[w] || CROSS_BAD.test(w)) { return false; }
    return true;
  }
  function crossHay(qq) {
    return plain(qq.stem || '') + ' ' + plain(qq.sol || '') + ' ' + (qq.unit || '');
  }
  /* 由題幹切出候選詞（長詞優先）；loose=true 時容許 2 字詞，用於退階的相似題比對 */
  function crossTerms(q, loose) {
    var txt = plain(q.stem || '') + ' ' + plain((q.options || []).join(' '));
    var runs = txt.match(/[\u4e00-\u9fa5]+|[A-Za-z]{4,}/g) || [];
    var seen = {}, out = [];
    runs.forEach(function (run) {
      if (/^[A-Za-z]+$/.test(run)) {
        if (!seen[run] && crossTermOK(run, loose)) { seen[run] = 1; out.push(run); }
        return;
      }
      for (var L = 5; L >= (loose ? 2 : 3); L--) {
        for (var i = 0; i + L <= run.length; i++) {
          var w = run.substr(i, L);
          if (seen[w] || !crossTermOK(w, loose)) { continue; }
          seen[w] = 1;
          out.push(w);
        }
      }
    });
    return out;
  }
  function autoCrossHits(s, q, k, mode, loose) {
    var terms = crossTerms(q, loose);
    if (!terms.length) { return []; }
    var sName = s.name || s.id, pools = [], same = (mode === 'same');
    SUBJECTS.forEach(function (t) {
      if (!t.data || String(t.id) === String(s.id)) { return; }
      if (same !== ((t.name || t.id) === sName)) { return; }  /* cross：排除同科目；same：只取同科目其他年份 */
      var b = cachedBank(t.id);
      if (b) { pools.push({ s: t, qs: b.questions }); }
    });
    if (!pools.length) { return []; }

    /* 第一遍：統計每個候選詞出現於多少題、多少個科目（越少越能代表一個特定觀念） */
    var df = {}, dfSubj = {}, total = 0;
    terms.forEach(function (w) { df[w] = 0; dfSubj[w] = {}; });
    pools.forEach(function (p) {
      total += p.qs.length;
      var group = p.s.name || p.s.id;
      p.qs.forEach(function (qq) {
        var hay = crossHay(qq);
        terms.forEach(function (w) {
          if (hay.indexOf(w) >= 0) { df[w]++; dfSubj[w][group] = 1; }
        });
      });
    });
    var maxSubj = pools.length >= 3 ? 2 : pools.length;
    var rare = terms.filter(function (w) {
      if (df[w] < 1 || df[w] > Math.max(2, total * 0.25)) { return false; }
      var n = 0, g;
      for (g in dfSubj[w]) { if (Object.prototype.hasOwnProperty.call(dfSubj[w], g)) { n++; } }
      return n <= maxSubj;                       /* 橫跨 3 科以上的是通用字詞，不是觀念 */
    });
    if (!rare.length) { return []; }

    /* 第二遍：逐題計分，稀有詞權重高 */
    var hits = [];
    pools.forEach(function (p) {
      p.qs.forEach(function (qq) {
        var hay = crossHay(qq), score = 0, first = '', best = 0;
        rare.forEach(function (w) {
          if (hay.indexOf(w) < 0) { return; }
          var wt = (w.length >= 4 ? 1.6 : 1) / df[w];
          score += wt;
          if (wt > best) { best = wt; first = w; }
        });
        if (score > 0) { hits.push({ id: p.s.id, n: qq.n, score: score, why: '同概念：' + first }); }
      });
    });
    hits.sort(function (a, b) { return b.score - a.score; });
    return hits.slice(0, k);
  }
  /* ---------- 8.5.1 跨科概念詞庫：人工整理的核心概念 → 各科都會考的同一件事 ---------- */
  var CROSS_CONCEPTS = [
    { label: '向量與內積', core: ['向量', '內積', '正交'], terms: ['分量', '夾角', '方向', '平行'] },
    { label: '三角與週期', core: ['三角函數', '正弦', '餘弦'], terms: ['週期', '振幅', '角度', '疊合'] },
    { label: '指數與對數', core: ['對數', 'log', '指數'], terms: ['次方', '分貝', 'dB', '成長率', '倍數'] },
    { label: '機率與期望值', core: ['機率', '期望值'], terms: ['隨機', '不放回', '排列', '組合', '中獎'] },
    { label: '統計與平均', core: ['標準差', '中位數', '平均數'], terms: ['平均', '資料', '統計', '分布'] },
    { label: '函數與圖形', core: ['函數', '斜率', '極值'], terms: ['圖形', '頂點', '最大值', '最小值', '面積'] },
    { label: '幾何與圓', core: ['圓心', '半徑', '弦'], terms: ['圓形', '三角形', '對稱', '距離'] },
    { label: '力與運動', core: ['加速度', '摩擦力', '合力', '牛頓'], terms: ['速度', '速率', '彈簧', '位移', '質量'] },
    { label: '動量與碰撞', core: ['動量', '衝量'], terms: ['碰撞', '守恆', '動能'] },
    { label: '能量與熱', core: ['熱力學', '反應熱', '內能', '熱量'], terms: ['能量', '溫度', '吸熱', '放熱', '比熱'] },
    { label: '電與磁', core: ['電流', '電壓', '電阻', '磁場', '電場', '電路'], terms: ['通電', '發電', '電荷'] },
    { label: '波動與聲音', core: ['聲波', '波長', '都卜勒', '波速'], terms: ['頻率', '振動', '共鳴', '回聲'] },
    { label: '光與輻射', core: ['光電效應', '光子', '能階', '光譜', '雷射'], terms: ['輻射', '折射', '反射', '干涉'] },
    { label: '原子與分子', core: ['原子', '同位素', '質子', '中子'], terms: ['分子', '電子', '元素'] },
    { label: '化學計量與平衡', core: ['反應式', '莫耳', '係數'], terms: ['平衡', '計量', '催化', '化學式'] },
    { label: '酸鹼與電解質', core: ['電解質', '中和', '氫離子', '酸性', '鹼性'], terms: ['酸鹼', '離子', 'pH'] },
    { label: '氧化還原', core: ['氧化', '還原', '氧化數'], terms: ['電子轉移', '電池', '電鍍'] },
    { label: '溶液與濃度', core: ['濃度', '溶解度', '稀釋', '溶質'], terms: ['溶液', '溶劑', '飽和'] },
    { label: '氣體性質', core: ['理想氣體', '分壓', '氣體'], terms: ['壓力', '體積', '溫度', '莫耳體積'] },
    { label: '有機與生物分子', core: ['聚合物', '蛋白質', '脂肪', '醣類'], terms: ['有機', '醇', '酯', '胺'] },
    { label: '閱讀理解與主旨', group: 'lang', core: ['主旨', '大意', '文意', '全文'], terms: ['段落', '作者', '敘述', '內容'] },
    { label: '字義與詞彙', group: 'lang', core: ['字義', '詞義', '成語', '詞性'], terms: ['意義', '意思', '用法', '解釋'] },
    { label: '修辭與文學', group: 'lang', core: ['修辭', '譬喻', '對偶', '押韻', '格律', '對仗'], terms: ['象徵', '詩', '散文', '小說'] },
    { label: '因果與推論', group: 'lang', core: ['推論', '推斷', '據此', '可知'], terms: ['因為', '因此', '原因', '導致', '結果'] }
  ];
  /* 語文科（國文／英文）與數理科分開比對，避免「閱讀理解」這類概念把理化題連到國文題 */
  function subjGroup(name) { return (name === '國文' || name === '英文') ? 'lang' : 'sci'; }
  /* 以概念為主軸找其他科的題目：命中同一個核心概念才算跨科串聯 */
  function conceptHits(s, q, k) {
    var txt = crossHay(q) + ' ' + plain((q.options || []).join(' '));
    var myGroup = subjGroup(s.name || s.id);
    var mine = [];
    CROSS_CONCEPTS.forEach(function (c) {
      if (c.group === 'lang' && myGroup !== 'lang') { return; }   /* 語文概念不從數理題發起 */
      var core = c.core.filter(function (t) { return txt.indexOf(t) >= 0; });
      if (!core.length) { return; }                 /* 未命中高訊號詞 → 這個概念不啟用 */
      var extra = c.terms.filter(function (t) { return txt.indexOf(t) >= 0; });
      mine.push({ c: c, core: core, all: core.concat(extra) });
    });
    if (!mine.length) { return []; }
    var sName = s.name || s.id, pools = [];
    SUBJECTS.forEach(function (t) {
      if (!t.data || String(t.id) === String(s.id)) { return; }
      if ((t.name || t.id) === sName) { return; }
      var b = cachedBank(t.id);
      if (b) { pools.push({ s: t, qs: b.questions }); }
    });
    if (!pools.length) { return []; }

    var df = {};                                   /* 第一遍：概念詞在跨科題庫中的普遍程度 */
    pools.forEach(function (p) {
      p.qs.forEach(function (qq) {
        var hay = crossHay(qq) + ' ' + plain((qq.options || []).join(' '));
        mine.forEach(function (m) {
          m.all.forEach(function (t) { if (hay.indexOf(t) >= 0) { df[t] = (df[t] || 0) + 1; } });
        });
      });
    });

    var best = {};                                 /* 每題只保留分數最高的那個概念 */
    pools.forEach(function (p) {
      p.qs.forEach(function (qq) {
        var hay = crossHay(qq) + ' ' + plain((qq.options || []).join(' '));
        mine.forEach(function (m) {
          if (m.c.group === 'lang' && subjGroup(p.s.name || p.s.id) !== 'lang') { return; }
          var mCore = m.core.filter(function (t) { return hay.indexOf(t) >= 0; });
          var mAll = m.all.filter(function (t) { return hay.indexOf(t) >= 0; });
          if (!mCore.length && mAll.length < 2) { return; }   /* 至少要命中高訊號詞，或兩個一般詞 */
          var score = 0, dfMax = 1;
          mAll.forEach(function (t) {
            var isCore = m.core.indexOf(t) >= 0;
            score += isCore ? 1.2 : 0.5;
            dfMax = Math.max(dfMax, df[t] || 1);
          });
          score /= Math.sqrt(1 + (dfMax - 1) * 0.15);         /* 越普遍的詞越不值錢 */
          var key = p.s.id + '#' + qq.n;
          if (!best[key] || best[key].score < score) {
            best[key] = { id: p.s.id, n: qq.n, score: score, group: p.s.name || p.s.id,
                          why: '同概念：' + m.c.label };
          }
        });
      });
    });
    var hits = [];
    Object.keys(best).forEach(function (key) { hits.push(best[key]); });
    hits.sort(function (a, b) { return b.score - a.score; });
    var out = [], per = {}, seen = {};
    hits.forEach(function (h) {                     /* 同一科最多取 2 題，讓清單橫跨不同科 */
      if (seen[h.id + '#' + h.n] || out.length >= k) { return; }
      per[h.group] = per[h.group] || 0;
      if (per[h.group] >= 2) { return; }
      seen[h.id + '#' + h.n] = 1; per[h.group]++;
      out.push(h);
    });
    return out;
  }
  function crossItemHTML(it) {
    var ts = subjectById(it.id) || {};
    return '<li><a href="' + esc(url('subject/' + it.id + '/q.html?n=' + encodeURIComponent(it.n))) + '">' +
      '<span class="cross-sub">' + esc(ts.name ? subLabel(ts) : it.id) + '</span>' +
      '<span class="cross-no">第 ' + esc(it.n) + ' 題</span>' +
      (it.why ? '<span class="cross-why">' + esc(it.why) + '</span>' : '') + '</a></li>';
  }
  function mountCross(s, q) {
    var box = $('cross-box');
    if (!box) { return; }
    function render(items, isMarked, label) {
      var h = '<h2>跨科延伸' + (isMarked ? '' : '<span class="cross-tag">自動推薦</span>') + '</h2>';
      if (!items.length) {
        h += '<p class="hint">' + esc(label || '這題暫時找不到其他科的同概念題目。') + '</p>';
        box.innerHTML = h;
        return;
      }
      h += '<p class="hint">' + esc(label) + '</p>';
      h += '<ul class="cross-list">' + items.map(crossItemHTML).join('') + '</ul>';
      box.innerHTML = h;
    }
    var marked = (q.cross || []).filter(function (it) { return it && it.id; });
    if (marked.length) { render(marked, true, '這題已標註的同概念題目：'); return; }
    box.innerHTML = '<h2>跨科延伸</h2><p class="hint">正在比對其他科目的同概念題目…</p>';
    loadAllBanks().then(function () {
      var items = conceptHits(s, q, 4), label = '同一個核心概念的跨科題目：';
      if (items.length < 2) {                       /* 概念詞庫命中不足 → 先退回同科目其他年份 */
        var same = autoCrossHits(s, q, 4, 'same');
        if (same.length < 2) { same = autoCrossHits(s, q, 4, 'same', true); }
        if (same.length > items.length) { items = same; label = '同科目其他年份的相似題：'; }
      }
      if (items.length < 2) {                       /* 仍不足 → 才用題幹關鍵字跨科掃一次 */
        var kw = autoCrossHits(s, q, 4, 'cross');
        if (kw.length > items.length) { items = kw; label = '用題幹關鍵字在其他科找到的相似題：'; }
      }
      if (!items.length) { label = '這題暫時找不到同概念題目。'; }
      render(items, false, label);
    });
  }

  /* ---------- 8.6 站內練習卷（綜合混編／弱科帶動共用） ---------- */
  function renderPractice(hostId, items, title, note) {
    var host = $(hostId);
    if (!host) { return; }
    if (!items || !items.length) {
      host.innerHTML = '<div class="practice"><h2>' + esc(title) + '</h2>' +
        '<p class="hint">目前沒有可抽的題目。</p></div>';
      return;
    }
    var h = '<div class="practice"><div class="practice-head">' +
      '<h2>' + esc(title) + '</h2><span class="badge badge-ok">' + items.length + ' 題</span></div>' +
      (note ? '<p class="hint">' + esc(note) + '</p>' : '');
    items.forEach(function (it, i) {
      var q = it.q, s = it.s;
      h += '<article class="pq" data-i="' + i + '">' +
        '<div class="pq-head"><span class="pq-no">' + (i + 1) + '</span>' +
        '<span class="pq-sub">' + esc(subLabel(s)) + '・第 ' + esc(q.n) + ' 題</span>' +
        '<a class="pq-link" href="' + esc(url('subject/' + s.id + '/q.html?n=' + encodeURIComponent(q.n))) + '">單題頁</a></div>' +
        '<div class="pq-stem">' + (q.stem || '') + '</div><ul class="opts pq-opts">';
      (q.options || []).forEach(function (o, k) {
        h += '<li><button class="opt" type="button" data-k="' + k + '">' +
          '<span class="opt-key">' + keyOf(k) + '</span><span class="opt-txt">' + o + '</span></button></li>';
      });
      h += '</ul><div class="pq-fb"></div><div class="pq-sol"></div></article>';
    });
    h += '<div class="practice-foot"><button class="btn" id="' + esc(hostId) + '-clear" type="button">' +
      '清除本卷作答紀錄</button></div></div>';
    host.innerHTML = h;

    var cards = host.querySelectorAll('.pq');
    for (var i = 0; i < cards.length; i++) { bindPracticeCard(cards[i], items[i]); }
    renderMathIn(host);
    var clr = $(hostId + '-clear');
    if (clr) {
      clr.addEventListener('click', function () {
        items.forEach(function (it) { setRecord(it.s.id, it.q.n, null); });
        renderPractice(hostId, items, title, note);
        renderHeroStats();
        renderWeakStat(null);
      });
    }
  }
  function bindPracticeCard(card, it) {
    var q = it.q, s = it.s;
    var fb = card.querySelector('.pq-fb'), solBox = card.querySelector('.pq-sol');
    var opened = false;
    function showSol() {
      if (opened || !solBox) { return; }
      opened = true;
      solBox.innerHTML = '<div class="sol"><h2>詳解</h2>' + (q.sol || '<p>本題尚未提供詳解。</p>') + '</div>';
      renderMathIn(solBox);
    }
    function paint(rec) {
      var btns = card.querySelectorAll('.opt');
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('pick', 'ok', 'bad');
        var bi = Number(btns[i].getAttribute('data-k'));
        if (rec && (rec.tr || []).indexOf(bi) >= 0) { btns[i].classList.add('bad'); }
        if (rec && rec.pick === bi) { btns[i].classList.add(rec.ok ? 'ok' : 'pick'); }
      }
      if (rec && rec.pick != null) {
        var solved = rec.ok || (rec.tr && rec.tr.indexOf(q.answer) >= 0);
        var txt = rec.ok ? '答對了！' : (solved ? '正確答案是 ' + keyOf(q.answer) + '。' : '再看看，這題還沒解開。');
        fb.innerHTML = '<p class="feedback ' + (rec.ok ? 'ok' : 'bad') + '">' +
          '<span class="fb-title">' + (rec.ok ? '答對：' : '再試一次：') + '</span>' + esc(txt) + '</p>';
      } else {
        fb.innerHTML = '';
      }
    }
    var cur = subjectProgress(s.id)[String(q.n)] || null;
    paint(cur);
    if (cur && cur.ok) { showSol(); }
    var opts = card.querySelector('.pq-opts');
    if (opts) {
      opts.addEventListener('click', function (ev) {
        var btn = ev.target.closest ? ev.target.closest('.opt') : null;
        if (!btn) { return; }
        var k = Number(btn.getAttribute('data-k'));
        var r = subjectProgress(s.id)[String(q.n)] || { pick: null, ok: false, tries: 0, tr: [] };
        var wrong = (r.tr || []).slice();
        r.tries = (r.tries || 0) + 1;
        r.pick = k;
        if (q.answer == null || k === q.answer) { r.ok = true; }
        else if (wrong.indexOf(k) < 0) { wrong.push(k); }
        r.tr = wrong;
        setRecord(s.id, q.n, r);
        paint(r);
        if (r.ok) { showSol(); renderHeroStats(); renderWeakStat(null); }
      });
    }
  }

  function keyOf(i) {
    if (i == null || i < 0) { return '—'; }
    return ['A', 'B', 'C', 'D', 'E', 'F'][i] || String(i + 1);
  }
  function animSrc(s, n) {
    if (!s || !s.anim || !s.anim.src) { return ''; }
    return url(String(s.anim.src)
      .replace(/\$\(id\)/g, String(s.id))
      .replace(/\$\(n\)/g, String(n)));
  }

  /* ---------- 9.5 KaTeX 數學式渲染（本地 vendor，離線可用） ---------- */
  var KATEX_READY = false, KATEX_WAIT = [];
  function loadScriptOnce(src, cb) {
    var els = document.querySelectorAll('script[src]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].getAttribute('src') === src) { cb(); return; }
    }
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { cb(); };
    s.onerror = function () { console.warn('[exam-site] 腳本載入失敗：' + src); };
    document.head.appendChild(s);
  }
  function ensureKatex(cb) {
    if (KATEX_READY) { if (cb) { cb(); } return; }
    if (cb) { KATEX_WAIT.push(cb); }
    if (KATEX_WAIT.length > 1) { return; }
    if (!document.getElementById('katex-css')) {
      var l = document.createElement('link');
      l.id = 'katex-css'; l.rel = 'stylesheet';
      l.href = url('assets/vendor/katex/katex.min.css');
      document.head.appendChild(l);
    }
    loadScriptOnce(url('assets/vendor/katex/katex.min.js'), function () {
      loadScriptOnce(url('assets/vendor/katex/contrib/auto-render.min.js'), function () {
        KATEX_READY = true;
        var q = KATEX_WAIT; KATEX_WAIT = [];
        for (var i = 0; i < q.length; i++) { try { q[i](); } catch (e) {} }
      });
    });
  }
  var KATEX_OPTS = {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\[', right: '\\]', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false }
    ],
    throwOnError: false,
    processEscapes: true,
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option']
  };
  function renderMathIn(rootEl) {
    if (!rootEl || typeof window.renderMathInElement !== 'function') { return; }
    try { window.renderMathInElement(rootEl, KATEX_OPTS); } catch (e) {}
  }
  function mathRoot() { return document.getElementById('app'); }
  function mathRefresh() { renderMathIn(mathRoot()); }
  function watchMath() {
    var app = mathRoot();
    if (!app || !window.MutationObserver) { return; }
    var t = null;
    new MutationObserver(function () {
      if (t) { clearTimeout(t); }
      t = setTimeout(function () { renderMathIn(app); }, 50);
    }).observe(app, { childList: true, subtree: true });
  }

  /* ---------- 10. 路由（頁面型別由網址決定，所有頁面共用同一份外殼） ---------- */
  function boot() {
    watchMath();
    ensureKatex(function () {
      mathRefresh();
      // 解析是「顯示/隱藏」按鈕動態插入，載入完成後再補一次
      setTimeout(mathRefresh, 300);
    });
    if (!INDEX || !Array.isArray(INDEX.subjects)) {
      renderChrome(null, '索引檔缺失');
      renderMessage('索引檔讀取失敗', [
        '找不到 <code>window.EXAM_INDEX</code>，請確認 <code>assets/js/subjects.js</code> 存在且格式正確。',
        '本站所有頁面都由這份索引檔產生。'
      ], [{ text: '重新載入', href: location.pathname, primary: true }]);
      return;
    }
    var path = location.pathname;
    var mSub = /\/subject\/([^\/]+)\//.exec(path);
    var isQuestion = /\/q\.html$/.test(path);
    var isSubjectPage = !isQuestion && /\/index\.html$/.test(path) && !!mSub;
    if (isQuestion && mSub) {
      var mn = /[?&]n=([^&]*)/.exec(location.search);
      var sid = decodeURIComponent(mSub[1]);
      if (!mn) {
        renderChrome(sid, '');
        renderMessage('缺少題號參數', [
          '單題頁網址格式為 <code>subject/&lt;科目id&gt;/q.html?n=&lt;題號&gt;</code>。'
        ], [
          { text: '回科目頁', href: url('subject/' + sid + '/index.html'), primary: true },
          { text: '回首頁', href: url('index.html') }
        ]);
        return;
      }
      renderQuestion(sid, decodeURIComponent(mn[1]));
      return;
    }
    if (isSubjectPage) { renderSubject(decodeURIComponent(mSub[1])); return; }
    renderHome();
  }

  /* ---------- 11. 自檢用：JS 錯誤計數（headless 檢查讀取） ---------- */
  var ROOT_EL = document.documentElement;
  if (ROOT_EL.dataset.jsErrors == null) { ROOT_EL.dataset.jsErrors = '0'; }
  if (!window.__examSiteErrorHook) {
    window.__examSiteErrorHook = true;
    window.addEventListener('error', function () {
      var n = Number(ROOT_EL.dataset.jsErrors || '0') + 1;
      ROOT_EL.dataset.jsErrors = String(n);
      console.error('[exam-site] JS error #' + n);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
