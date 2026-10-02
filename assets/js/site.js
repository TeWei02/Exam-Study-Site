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
