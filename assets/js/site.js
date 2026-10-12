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
  /* ---------- 4.2 安靜精讀版資料（assets/js/data/<id>-quiet.js）
     只在科目設定裡有 quiet 欄位時才載入；載不到就自動退回原本的單題頁，
     不會把頁面卡在「載入中」。 */
  var QUIET_CACHE = {}, QUIET_PENDING = {}, QUIET_FAILED = {};
  function quietSubject(s) { return !!(s && s.quiet); }
  function quietOf(id) {
    if (QUIET_CACHE[id]) { return QUIET_CACHE[id]; }
    var raw = window.EXAM_QUIET && window.EXAM_QUIET[id];
    if (raw) { QUIET_CACHE[id] = raw; }
    return QUIET_CACHE[id] || null;
  }
  function loadQuiet(id) {
    return new Promise(function (resolve) {
      var s = subjectById(id);
      if (!quietSubject(s)) { resolve(null); return; }
      var d = quietOf(id);
      if (d) { resolve(d); return; }
      if (QUIET_FAILED[id]) { resolve(null); return; }
      if (QUIET_PENDING[id]) { QUIET_PENDING[id].push(resolve); return; }
      QUIET_PENDING[id] = [resolve];
      var el = document.createElement('script');
      el.async = true;
      el.src = url(s.quiet.data || ('assets/js/data/' + id + '-quiet.js'));
      el.onload = function () { flushQuiet(id); };
      el.onerror = function () { QUIET_FAILED[id] = true; flushQuiet(id); };
      document.head.appendChild(el);
    });
  }
  function flushQuiet(id) {
    var waiters = QUIET_PENDING[id] || [];
    delete QUIET_PENDING[id];
    var d = quietOf(id);
    for (var i = 0; i < waiters.length; i++) { waiters[i](d); }
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

  /* ---------- 4.5 跨科串聯資料（assets/js/data/cross.js，獨立資料檔） ----------
     與題庫同一套惰性載入：第一次需要時才注入 <script>，載入後快取共用。
     資料檔不存在也不影響站台，只是「一科訓練五科」的人工標註會缺席，
     單題頁會自動退回原本的關鍵字比對。 */
  var CROSS_CACHE = null, CROSS_WAITERS = null, CROSS_FAILED = false;
  function crossData() {
    if (CROSS_CACHE) { return CROSS_CACHE; }
    var raw = window.EXAM_CROSS;
    if (raw && typeof raw === 'object') { CROSS_CACHE = raw; }
    return CROSS_CACHE;
  }
  function loadCross() {
    return new Promise(function (resolve) {
      var d = crossData();
      if (d) { resolve(d); return; }
      if (CROSS_FAILED) { resolve(null); return; }
      if (CROSS_WAITERS) { CROSS_WAITERS.push(resolve); return; }
      CROSS_WAITERS = [resolve];
      var el = document.createElement('script');
      el.async = true;
      el.src = url('assets/js/data/cross.js');
      el.onload = function () { flushCross(); };
      el.onerror = function () { CROSS_FAILED = true; flushCross(); };
      document.head.appendChild(el);
    });
  }
  function flushCross() {
    var waiters = CROSS_WAITERS || [];
    CROSS_WAITERS = null;
    var d = crossData();
    for (var i = 0; i < waiters.length; i++) { waiters[i](d); }
  }
  function crossLinksOf(sid, n) {
    var d = crossData();
    var map = d && d.byQuestion;
    return (map && map[sid + '#' + n]) || [];
  }
  function crossUnitById(id) {
    var d = crossData();
    var list = (d && d.units) || [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(id)) { return list[i]; }
    }
    return null;
  }

  /* ---------- 4.6 單元觀點動畫（assets/anim/cross/manifest.js）
     manifest 由 tools/gen_cross_anim.py 依 cross.js 各單元自動產生：
     新增單元 → 重跑產生器 → 這裡自動多一支動畫，不必手改 cross.html 或本檔。
     站台引擎不寫死任何單元／科目名稱，只認 manifest 與單元 id。 */
  var ANIM_CACHE = null, ANIM_WAITERS = null, ANIM_FAILED = false;
  function animData() {
    if (ANIM_CACHE) { return ANIM_CACHE; }
    var raw = window.EXAM_CROSS_ANIM;
    if (raw && typeof raw === 'object') { ANIM_CACHE = raw; }
    return ANIM_CACHE;
  }
  function loadAnimData() {
    return new Promise(function (resolve) {
      var d = animData();
      if (d) { resolve(d); return; }
      if (ANIM_FAILED) { resolve(null); return; }
      if (ANIM_WAITERS) { ANIM_WAITERS.push(resolve); return; }
      ANIM_WAITERS = [resolve];
      var el = document.createElement('script');
      el.async = true;
      el.src = url('assets/anim/cross/manifest.js');
      el.onload = function () { flushAnim(); };
      el.onerror = function () { ANIM_FAILED = true; flushAnim(); };
      document.head.appendChild(el);
    });
  }
  function flushAnim() {
    var waiters = ANIM_WAITERS || [];
    ANIM_WAITERS = null;
    var d = animData();
    for (var i = 0; i < waiters.length; i++) { waiters[i](d); }
  }
  function unitAnimHTML(u) {
    return '<div class="unit-anim" id="unit-anim-' + esc(u.id) + '" data-unit-anim="' + esc(u.id) + '"></div>';
  }
  function fmtSecs(s) {
    s = Math.round(s || 0);
    if (s >= 60) { return Math.floor(s / 60) + ' 分 ' + (s % 60) + ' 秒'; }
    return s + ' 秒';
  }
  function animPlayerHTML(u, m) {
    var stops = (m.stops || []).map(function (s) { return s.name; }).join(' → ');
    return '<div class="anim-head">' +
        '<b class="anim-title">觀點動畫</b>' +
        '<span class="anim-meta">3B1B 動態・曉曉語音・字幕｜' + (m.segments || 0) + ' 段・約 ' + fmtSecs(m.seconds) + '</span>' +
        '<a class="anim-open" href="' + esc(url(m.src)) + '" target="_blank" rel="noopener">另開全螢幕</a>' +
      '</div>' +
      (stops ? '<div class="anim-stops"><b>五科路徑</b>' + esc(stops) + '</div>' : '') +
      '<div class="anim-frame"><iframe src="' + esc(url(m.src)) + '" title="' + esc(u.title + '｜觀點動畫') +
        '" loading="eager" allow="autoplay" referrerpolicy="no-referrer"></iframe></div>' +
      '<p class="anim-note">本片依單元的 intro／keyIdea／五科步驟自動生成——同一個核心觀念在各科怎麼出現、又怎麼串成一條線。' +
      '若瀏覽器阻擋自動播放，點畫面任一處即可開啟旁白。</p>';
  }
  function mountUnitAnims() {
    var hosts = document.querySelectorAll('.unit-anim');
    if (!hosts.length) { return; }
    loadAnimData().then(function (d) {
      var list = (d && d.units) || [];
      for (var i = 0; i < hosts.length; i++) {
        var host = hosts[i], id = host.getAttribute('data-unit-anim'), m = null;
        if (!id) { continue; }              /* 首頁入口等其他容器自行控制內容，不在此重繪 */
        for (var j = 0; j < list.length; j++) {
          if (String(list[j].id) === String(id)) { m = list[j]; break; }
        }
        if (!m) {
          host.innerHTML = '<p class="anim-missing">此單元的觀點動畫尚未產生：在站台根目錄執行 ' +
            '<code>python3 tools/gen_cross_anim.py</code> 即會依 cross.js 自動生成，不必修改任何頁面程式碼。</p>';
          continue;
        }
        host.innerHTML = animPlayerHTML(crossUnitById(id) || { title: m.title || id }, m);
      }
    });
  }

  /* 首頁「一科練五科」區塊的觀點動畫入口：與 cross.html 單元頁共用同一份 manifest 與同一套播放器標記，
     因此新增單元只要重跑 tools/gen_cross_anim.py，首頁與單元頁會同時多一支動畫，兩邊都不必手改。 */
  var HUB_ANIM_CUR = null;
  function hubAnimTabHTML(list, cur) {
    return list.map(function (m) {
      var u = crossUnitById(m.id) || { title: m.title || m.id };
      return '<button type="button" class="hub-tab' + (String(m.id) === String(cur) ? ' on' : '') + '"' +
        ' data-hub-anim="' + esc(m.id) + '" title="' + esc(u.subtitle || u.title) + '">' +
        '<span class="hub-tab-t">' + esc(u.title) + '</span>' +
        '<span class="hub-tab-n">' + ((m.stops || []).length) + ' 站・' + fmtSecs(m.seconds) + '</span></button>';
    }).join('');
  }
  function renderHubAnim(id) {
    var host = $('hub-anim-host'), tabs = $('hub-anim-tabs');
    if (!host && !tabs) { return; }
    loadAnimData().then(function (d) {
      var list = (d && d.units) || [];
      if (!list.length) {
        if (host) {
          host.innerHTML = '<p class="anim-missing">觀點動畫尚未產生：在站台根目錄執行 ' +
            '<code>python3 tools/gen_cross_anim.py</code>，首頁與各單元頁便會同時掛上播放器。</p>';
        }
        return;
      }
      var cur = null;
      for (var i = 0; i < list.length; i++) { if (String(list[i].id) === String(id)) { cur = list[i]; break; } }
      if (!cur) { cur = list[0]; }
      HUB_ANIM_CUR = cur.id;
      if (tabs) { tabs.innerHTML = hubAnimTabHTML(list, cur.id); }
      if (host) {
        host.setAttribute('data-unit-anim', cur.id);   /* 與單元頁容器同款，manifest 更新即同步 */
        host.innerHTML = animPlayerHTML(crossUnitById(cur.id) || { title: cur.title || cur.id }, cur);
      }
    });
  }
  function bindHubAnim() {
    if (bindHubAnim.done) { return; }
    bindHubAnim.done = true;
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-hub-anim]') : null;
      if (!t) { return; }
      e.preventDefault();
      renderHubAnim(t.getAttribute('data-hub-anim'));
      var el = $('hub-anim');
      if (el && el.scrollIntoView) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
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
      /* 學習資源專區的線上學習入口頁（quiz/index.html，獨立入口頁，不影響任何作答判定） */
      h += '<a class="nav-ocw" href="' + esc(url('quiz/index.html')) + '">學習資源</a>';
      /* 2026 大事：全站唯一的完整專區入口（events.html）；首頁只留摘要，不再有兩套入口 */
      h += '<a class="nav-ocw" href="' + esc(url('events.html')) + '">2026 大事</a>';
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
  function tutorHubHTML() {
    var list = SUBJECTS.filter(function (s) { return s.tutor; });
    if (!list.length) { return ''; }
    var h = '<section class="panel" id="tutor-hub"><h2>家教伴讀版</h2>' +
      '<p class="hint">像家教坐在旁邊慢慢講：一次只講一件事、大字白底、每段可唸給我聽；答錯不打叉、進度只增不減，每段都可以隨時停。</p>' +
      '<div class="grid tutor-grid">';
    list.forEach(function (s) {
      h += '<a class="card tutor-card" href="' + esc(url('subject/' + s.id + '/' + String(s.tutor.href || 'tutor.html'))) + '">' +
           '<div class="card-top"><h3>' + esc(s.name || s.id) + '</h3>' +
           '<span class="badge badge-ok">' + esc(s.tutor.label || '家教伴讀版') + '</span></div>' +
           '<p class="card-exam">' + esc(s.yearLabel || '') + '・低刺激・聽覺學習</p></a>';
    });
    h += '</div></section>';
    return h;
  }
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
    h += tutorHubHTML();
    h += dailyHubHTML();
    h += crossHubHTML();
    h += resourcesHubHTML();
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
    renderDaily();
    bindResourcesHub();
    mountResourcesHub();
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
            '<div id="cross-units"></div>' +
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
        '<div class="hub-anim" id="hub-anim">' +
          '<h3 class="unit-h3"><span class="mode-no">4</span>觀點動畫（跨科單元）</h3>' +
          '<p class="hint">把每個跨科單元拍成一支可離線播放的 3B1B 風格動畫：曉曉語音＋字幕，含片頭標題卡、' +
          '章節地圖側欄與片尾重點回顧卡。這裡與<a href="' + esc(url('cross.html')) + '">一科訓練五科</a>頁共用同一份 manifest，' +
          '新增單元後重跑 <code>python3 tools/gen_cross_anim.py</code>，兩邊同時多一支。</p>' +
          '<div class="hub-anim-tabs" id="hub-anim-tabs"></div>' +
          '<div class="unit-anim" id="hub-anim-host"></div>' +
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

  /* 首頁模式 1 的單元入口；cross.html 的內文也由同一組函式產生 */
  function crossPathText(u) {
    return (u.steps || []).map(function (st) {
      var s = subjectById(st.subject);
      return (s ? (s.short || s.name || s.id) : st.subject) + ' 第 ' + st.n + ' 題';
    }).join(' → ');
  }
  function renderCrossUnitList() {
    var host = $('cross-units');
    if (!host) { return; }
    loadCross().then(function (d) {
      var units = (d && d.units) || [];
      if (!units.length) {
        host.innerHTML = '<p class="hint">目前還沒有跨科串聯單元，單題頁會改用題幹關鍵字跨科比對。</p>';
        return;
      }
      var h = '<ul class="cross-list cross-units">';
      units.forEach(function (u) {
        h += '<li><a href="' + esc(url('cross.html#' + u.id)) + '">' +
          '<span class="cross-sub">' + esc(u.title) + '</span>' +
          (u.yearLabel ? '<span class="cross-no">' + esc(u.yearLabel) + '</span>' : '') +
          '<span class="cross-why">' + esc(u.subtitle || '') + '</span>' +
          '<span class="cross-unit-path">' + esc(crossPathText(u)) + '</span></a>' +
          '<button type="button" class="hub-anim-go" data-hub-anim="' + esc(u.id) + '">觀點動畫</button></li>';
      });
      host.innerHTML = h + '</ul>';
    });
  }
  function crossStepHTML(st, i) {
    var s = subjectById(st.subject);
    var nm = s ? (s.short || s.name || s.id) : st.subject;
    return '<li class="cross-stop' + (st.role ? ' is-start' : '') + '">' +
      '<div class="stop-head">' +
        '<span class="stop-no">' + (i + 1) + '</span>' +
        '<a class="stop-sub" href="' + esc(url('subject/' + st.subject + '/index.html')) + '">' + esc(nm) + '</a>' +
        '<span class="cross-no">第 ' + esc(st.n) + ' 題</span>' +
        (st.role ? '<span class="cross-tag">' + esc(st.role) + '</span>' : '') +
        '<a class="stop-link" href="' + esc(url('subject/' + st.subject + '/q.html?n=' + encodeURIComponent(st.n))) + '">前往單題頁</a>' +
      '</div>' +
      '<p class="stop-point"><b>考點</b>' + esc(st.point || '') + '</p>' +
      '<p class="stop-why">' + esc(st.why || '') + '</p>' +
      (st.next ? '<p class="stop-next">' + esc(st.next) + '</p>' : '') +
      animEntryHTML(s, st.n, { label: '載入本題動畫', note: '整卷動畫（第 ' + st.n + ' 題）在原地載入，不用跳頁' }) +
      '</li>';
  }
  function crossUnitHTML(u) {
    var h = '<section class="panel" id="unit-' + esc(u.id) + '">' +
      '<div class="unit-head">' +
        '<h2>' + esc(u.title) + '</h2>' +
        '<p class="hint">' + esc(u.subtitle || '') + (u.yearLabel ? '｜' + esc(u.yearLabel) : '') + '</p>' +
      '</div>' +
      unitAnimHTML(u) +
      unitNewsHTML(u) +
      '<p class="unit-intro">' + esc(u.intro || '') + '</p>' +
      (u.keyIdea ? '<div class="unit-key"><b>練什麼</b>' + esc(u.keyIdea) + '</div>' : '') +
      '<h3 class="unit-h3">五科學習路徑</h3>' +
      '<ol class="cross-path">' +
        (u.steps || []).map(function (st, i) { return crossStepHTML(st, i); }).join('') +
      '</ol>';
    var ex = u.extra || [];
    if (ex.length) {
      h += '<h3 class="unit-h3">延伸題</h3><ul class="cross-list">' + ex.map(function (it) {
        var s = subjectById(it.subject);
        return '<li><a href="' + esc(url('subject/' + it.subject + '/q.html?n=' + encodeURIComponent(it.n))) + '">' +
          '<span class="cross-sub">' + esc(s ? subLabel(s) : it.subject) + '</span>' +
          '<span class="cross-no">第 ' + esc(it.n) + ' 題</span>' +
          '<span class="cross-why">' + esc(it.why || '') + '</span></a></li>';
      }).join('') + '</ul>';
    }
    h += '<div id="unit-practice-' + esc(u.id) + '"></div></section>';
    return h;
  }
  function mountUnitPractice(u) {
    var hostId = 'unit-practice-' + u.id;
    if (!$(hostId)) { return; }
    loadAllBanks().then(function () {
      var items = [];
      (u.steps || []).forEach(function (st) {
        var s = subjectById(st.subject);
        var b = s ? cachedBank(s.id) : null;
        if (!b) { return; }
        b.questions.forEach(function (q) {
          if (String(q.n) === String(st.n)) { items.push({ s: s, q: q }); }
        });
      });
      if (!items.length) { return; }
      renderPractice(hostId, items, u.title + '・五科串聯練習',
        '依路徑順序出題，五科各一題；作答後可展開詳解，右上角可回到單題頁。');
      renderHeroStats();
    });
  }
  function renderCrossPage() {
    renderChrome(null, '一科訓練五科');
    var app = $('app');
    if (!app) { return; }
    app.innerHTML = '<section class="panel unit-head"><h1>一科訓練五科</h1>' +
      '<p class="hint">正在載入跨科串聯資料…</p></section>';
    loadCross().then(function (d) {
      var units = (d && d.units) || [];
      if (!units.length) {
        renderMessage('尚未建立跨科串聯單元', [
          '跨科內容來自 <code>assets/js/data/cross.js</code>，目前這個檔案裡還沒有任何單元。',
          '單題頁仍會用題幹關鍵字自動比對其他科的同概念題目。'
        ], [{ text: '回首頁', href: url('index.html'), primary: true }]);
        return;
      }
      var h = '<section class="panel">' +
        '<h1 class="unit-h1">一科訓練五科</h1>' +
        '<p class="hint">同一個核心觀念，在數學 A、物理、化學、國文、英文各挑一題串成一條路徑。' +
        '從路徑上的任何一站出發都走得通——練一科，等於把其他四科的同一個觀念也走過一次。</p></section>';
      units.forEach(function (u) { h += crossUnitHTML(u); });
      app.innerHTML = h;
      bindAnimEntries(app);
      mountUnitAnims();
      mountUnitNews();
      units.forEach(function (u) { mountUnitPractice(u); });
      var anchor = location.hash.replace(/^#/, '');
      if (anchor) {
        var el = document.getElementById('unit-' + anchor);
        if (el && el.scrollIntoView) { el.scrollIntoView(); }
      }
    });
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
    renderCrossUnitList();
    renderWeakStat(null);
    renderHubAnim(null);
    bindHubAnim();
    loadAllBanks().then(function () { renderCrossLinkSample(); renderCrossUnitList(); renderWeakStat(null); });
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
  function tutorEntryHTML(s) {
    if (!s.tutor) { return ''; }
    var href = url('subject/' + s.id + '/' + String(s.tutor.href || 'tutor.html'));
    var label = (s.tutor.label || '家教伴讀版');
    var note = (s.tutor.note || '低刺激・大字・每段可唸給我聽・答錯不懲罰');
    return '<p class="tutor-entry"><a class="btn primary" href="' + esc(href) + '">' + esc(label) + '</a>' +
           '<span>' + esc(note) + '</span></p>';
  }
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
    /* 安靜精讀版科目：不在頂端掛「一科訓練五科」入口，避免一進站就被延伸內容
       分散注意力（對應「太發散」）；入口與跨科面板一併移到題目清單之後。 */
    if (!quietSubject(s)) { h += crossEntryHTML(s); }
    h += '<section class="panel head-panel"><h1>' + esc(s.name || s.id) + '</h1>';
    var ml = metaLine(s);
    if (ml) { h += '<p class="meta">' + esc(ml) + '</p>'; }
    h += chipsHTML(s);
    if (s.note) { h += '<p class="meta">' + esc(s.note) + '</p>'; }
    h += tutorEntryHTML(s);
    h += '<div class="progress-line" id="sub-progress"></div></section>';
    /* 安靜精讀版科目：說明卡排在最前面，跨科出卷面板移到題目清單之後，
       避免一進站就被「延伸內容」分散注意力（對應「太發散」）。 */
    if (quietSubject(s)) { h += quietHowtoHTML(s); } else { h += subjectCrossHTML(s); }
    h += '<section class="panel' + (quietSubject(s) ? ' quiet-list' : '') +
         '"><div id="sub-body"><p class="loading">載入題庫…</p></div></section>';
    if (quietSubject(s)) { h += crossEntryHTML(s) + subjectCrossHTML(s); }
    h += evPointsHTML(s);
    app.innerHTML = h;
    bindSubjectCross(s);
    mountEventPoints(s);

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
    var qCrumb = crumbsHTML([
      { text: '首頁', href: url('index.html') },
      { text: s.name || s.id, href: url('subject/' + s.id + '/index.html') },
      { text: '第 ' + n + ' 題' }
    ]);
    app.innerHTML = qCrumb + tutorEntryHTML(s) + '<section class="panel"><p class="loading">載入題目…</p></section>';

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
      if (quietSubject(s)) {
        loadQuiet(s.id).then(function (qd) {
          var qq = qd ? quietQuestion(qd, qs[idx].n) : null;
          if (qq) { renderQuietPanel(s, qs, idx, qq); } else { renderQuestionPanel(s, qs, idx); }
        });
        return;
      }
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
    ]) + tutorEntryHTML(s);
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
    h += '<div class="news-host" id="news-box" data-news-sub="' + esc(s.id) + '" data-news-n="' + esc(q.n) + '"></div>';
    h += '<div class="cross-host" id="cross-box" data-cross-ready="0">' +
         '<p class="cross-loading">正在載入跨科延伸…</p></div>';
    h += '<div class="pager">' +
      '<span id="pg-prev"></span><span id="pg-next"></span></div>';
    h += '</section>';
    app.innerHTML = h;
    mountQuestionNews();

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

  /* ---------- 8.35 安靜精讀版單題頁 ----------
     五個學習障礙的對應處理：
       ①讀題 ②關鍵想法 ③逐步解（一次一步） ④對答案 ⑤記題型
     卡片一開始全部隱藏（.q-locked），只有使用者按鈕才會出現下一張；
     不載動畫、不載語音、不掛時事與跨科延伸，作答紀錄沿用同一套進度。 */
  function quietQuestion(qd, n) {
    var qs2 = (qd && qd.questions) || [];
    for (var i = 0; i < qs2.length; i++) {
      if (String(qs2[i].n) === String(n)) { return qs2[i]; }
    }
    return null;
  }

  function renderQuietPanel(s, qs, idx, q) {
    var app = $('app');
    var KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];
    var progress = subjectProgress(s.id)[String(q.n)] || null;
    var picked = progress && progress.pick != null ? progress.pick : null;
    var fullHref = quietFullHref(s);
    var h = crumbsHTML([
      { text: '首頁', href: url('index.html') },
      { text: s.name || s.id, href: url('subject/' + s.id + '/index.html') },
      { text: '第 ' + q.n + ' 題' }
    ]) + tutorEntryHTML(s);
    h += '<section class="panel quiet">';
    h += '<div class="q-progressline">' + esc(yearKeyOf(s)) + ' ' + esc(s.name || s.id) +
         ' ・ 第 ' + esc(q.n) + ' 題／共 ' + qs.length + ' 題' +
         (q.unit ? ' ・ ' + esc(q.unit) : '') + '</div>';
    h += '<div class="q-order">閱讀順序：① 讀題 → ② 關鍵想法 → ③ 逐步解 → ④ 對答案 → ⑤ 記題型' +
         '（一次只出現一張卡片，畫面不會自己動、也不會自動換頁）</div>';

    /* ① 讀題 */
    h += '<section class="q-card" id="qc1">' +
         '<h3><span class="q-num">①</span>讀題</h3>' +
         '<p class="q-hintline">先把題目慢慢讀兩次。想不出來也沒關係，下面會一步一步帶你走，不會自己跳走。</p>' +
         '<div class="q-stem">' + (q.stem || '') + '</div>' +
         '<ul class="q-opts" id="q-opts">';
    (q.options || []).forEach(function (o, i) {
      var cls = (picked === i) ? (q.answer === i ? ' ok' : ' bad') : '';
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
    h += '<section class="q-card q-locked q-typebox" id="qc5">' +
         '<h3><span class="q-num">⑤</span>記題型</h3>' +
         '<table class="q-typemt"><tbody>' +
         '<tr><th>這一題的題型</th><td>' + esc(q.unit || '（未標單元）') + '</td></tr>' +
         '<tr><th>難度</th><td>' + (q.diff ? esc(q.diff) + ' ／ 3' : '未標') + '</td></tr>' +
         '<tr><th>考場提醒</th><td>' + (q.tip || '本題沒有額外提醒。') + '</td></tr>' +
         '</tbody></table>' +
         '<p class="q-hintline">同一種題型只要記住上面這一件事，下次看到就知道從哪裡下手。</p>' +
         '</section>';

    h += '<div class="news-host" id="news-box" data-news-sub="' + esc(s.id) + '" data-news-n="' + esc(q.n) + '"></div>';
    h += '<div class="q-pager"><span id="pg-prev"></span><span id="pg-next"></span></div>';
    h += '<p class="q-backline">' +
         '<a href="' + esc(url('subject/' + s.id + '/index.html')) + '">回《' + esc(s.name || s.id) + '》題目清單</a>' +
         (fullHref ? '　・　<a href="' + esc(fullHref) + '">整卷安靜精讀版（同一份內容，從第 1 題連續看）</a>' : '') +
         '　・　<button class="btn" id="clear-one" type="button">清除本題紀錄</button></p>';
    h += '</section>';
    app.innerHTML = h;
    mountQuestionNews();

    /* 作答 */
    var opts = $('q-opts'), fb = $('q-fb');
    function state() { return subjectProgress(s.id)[String(q.n)] || null; }
    function paintPick(i) {
      var btns = opts.querySelectorAll('.q-opt');
      for (var k = 0; k < btns.length; k++) {
        btns[k].classList.remove('ok', 'bad');
        if (Number(btns[k].getAttribute('data-i')) === i) {
          btns[k].classList.add(i === q.answer ? 'ok' : 'bad');
        }
      }
      fb.innerHTML = '<p class="q-fb ' + (i === q.answer ? 'ok' : 'bad') + '">' +
        (i === q.answer ? '答對了。先別急，往下看②關鍵想法裡的「為什麼」。'
                        : '目前選的不是答案。沒關係，往下看②③就會知道差在哪一步。') + '</p>';
    }
    if (opts) {
      opts.addEventListener('click', function (ev) {
        var b = ev.target.closest ? ev.target.closest('.q-opt') : null;
        if (!b) { return; }
        var i = Number(b.getAttribute('data-i'));
        var r = state() || { pick: null, ok: false, tries: 0, tr: [] };
        var wrong = (r.tr || []).slice();
        r.tries = (r.tries || 0) + 1;
        r.pick = i;
        if (q.answer == null || i === q.answer) { r.ok = true; }
        else if (wrong.indexOf(i) < 0) { wrong.push(i); }
        r.tr = wrong;
        setRecord(s.id, q.n, r);
        paintPick(i);
        refreshPager();
        var mine = $('q-yours');
        if (mine && mine.innerHTML) { mine.innerHTML = yourLine(i); }
      });
      if (picked != null) { paintPick(picked); }
    }

    var to2 = $('q-to2');
    if (to2) { to2.addEventListener('click', function () { revealQuiet('qc2'); }); }
    var to3 = $('q-to3');
    if (to3) { to3.addEventListener('click', function () { revealQuiet('qc3'); addStep(); }); }
    var to5 = $('q-to5');
    if (to5) { to5.addEventListener('click', function () { revealQuiet('qc5'); }); }

    /* ③ 逐步解：一次一步 */
    var steps = q.steps || [], shown = 0;
    function addStep() {
      if (shown >= steps.length) { return; }
      var host = $('q-steps');
      var box = document.createElement('div');
      box.className = 'q-step';
      var t = steps[shown].t;
      box.innerHTML = '<h4>第 ' + (shown + 1) + ' 步' + (t ? '：' + esc(t) : '') + '</h4>' +
                      '<div class="q-body">' + steps[shown].h + '</div>';
      host.appendChild(box);
      shown++;
      var btn = $('q-nextstep');
      if (shown >= steps.length) {
        btn.textContent = '這是最後一步，看④對答案';
        btn.setAttribute('data-mode', 'to4');
      } else {
        btn.textContent = '看第 ' + (shown + 1) + ' 步（還有 ' + (steps.length - shown) + ' 步）';
      }
    }
    var nsb = $('q-nextstep');
    if (nsb) {
      nsb.addEventListener('click', function () {
        if (nsb.getAttribute('data-mode') === 'to4') { revealQuiet('qc4'); fillYours(); return; }
        addStep();
      });
    }
    function yourLine(i) {
      return '<p class="q-yoursline">你剛才選的是 (' + (KEYS[i] || '?') + ')，' +
        (i === q.answer ? '和答案一致。'
         : '正確答案是 (' + (KEYS[q.answer] || '?') + ')。回頭對一次③的每一步，找出是哪一步和你算的不一樣。') +
        '</p>';
    }
    function fillYours() {
      var host = $('q-yours');
      if (host && !host.innerHTML) {
        var r = state();
        if (r && r.pick != null) { host.innerHTML = yourLine(r.pick); }
      }
    }

    /* 清除本題紀錄 */
    var co = $('clear-one');
    if (co) {
      co.addEventListener('click', function () {
        setRecord(s.id, q.n, null);
        var btns = opts.querySelectorAll('.q-opt');
        for (var k = 0; k < btns.length; k++) { btns[k].classList.remove('ok', 'bad'); }
        fb.innerHTML = '';
        $('q-steps').innerHTML = '';
        shown = 0;
        nsb.textContent = '看第 1 步';
        nsb.removeAttribute('data-mode');
        $('q-yours').innerHTML = '';
        var ids = ['qc2', 'qc3', 'qc4', 'qc5'];
        for (var j = 0; j < ids.length; j++) {
          var el = $(ids[j]);
          if (el) { el.classList.add('q-locked'); }
        }
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

  function revealQuiet(id) {
    var el = $(id);
    if (el) {
      el.classList.remove('q-locked');
      try { el.scrollIntoView({ behavior: 'auto', block: 'start' }); } catch (e) { }
    }
  }

  /* 科目頁的「安靜精讀版怎麼用」說明卡（只掛在有 quiet 設定的科目） */
  function quietFullHref(s) {
    var p = (s.anim && s.anim.src) ? s.anim.src : '';
    p = p.split('?')[0];
    return p ? url(p) : '';
  }
  function quietHowtoHTML(s) {
    var nm = esc(s.name || s.id);
    var fullHref = quietFullHref(s);
    var steps = ['① 讀題：先把題目讀完，選一個你覺得對的答案。',
                 '② 關鍵想法：先只講這一題「該從哪裡想」，不計算。',
                 '③ 逐步解：一次只出現一步，想清楚了再按下一步。',
                 '④ 對答案：對照官方答案，並回頭檢查自己是哪一步不同。',
                 '⑤ 記題型：記住這一題的題型名稱與考場提醒，下次遇到同型題就知道怎麼下手。'];
    var h = '<section class="panel q-howto">' +
      '<h2>安靜精讀版：怎麼用《' + nm + '》</h2>' +
      '<p>這一科已經改成安靜精讀版：白底、字大、沒有動畫與語音，卡片不會自己跳走，' +
      '每一題都照固定順序走，看完一題就知道自己該做什麼。</p>' +
      '<ol class="q-howto-list">';
    for (var i = 0; i < steps.length; i++) { h += '<li>' + steps[i] + '</li>'; }
    h += '</ol>';
    h += '<p>不確定從哪一題開始：<a class="btn btn-primary" href="q.html?n=1">從第 1 題開始讀</a>' +
      (fullHref ? '，想連續讀整卷：<a class="btn" href="' + esc(fullHref) + '">整卷安靜精讀版</a>' : '') + '。</p>';
    h += '</section>';
    return h;
  }

  /* ---------- 8.4 科目頁頂端的「一科訓練五科」入口列（連到 cross.html） ---------- */
  function crossEntryHTML(s) {
    var nm = esc(s.name || s.id);
    return '<div class="cross-entry">' +
      '<span class="ce-tag">一科訓練五科</span>' +
      '<span class="ce-txt">把《' + nm + '》和其他四科串起來練：五科各取一題，用觀點動畫看懂同一個核心觀念在不同科目的長相。</span>' +
      '<a class="btn btn-primary ce-go" href="' + esc(url('cross.html')) + '">看跨科觀點動畫</a>' +
      '<a class="btn ce-go" href="' + esc(url('events.html') + '?subject=' + encodeURIComponent(s.id) + '#ev-points') + '">2026 大事對照點</a>' +
      '</div>';
  }

  /* ---------- 8.5 科目頁的「一科訓練五科」出卷面板 ---------- */
  function subjectCrossHTML(s) {
    var nm = esc(s.name || s.id);
    return '<section class="panel cross-hub subject-cross" id="sub-cross">' +
      '<h2>一科訓練五科</h2>' +
      '<p class="hint">以《' + nm + '》為起點：先抽本科最該練的題，再自動接上其他科「同一個核心觀念」的題目。' +
      '三種模式的完整說明在<a href="' + esc(url('index.html')) + '#cross-hub">首頁跨科區</a>。</p>' +
      '<div class="cross-form">' +
        '<label>本科題數<select id="sub-cross-per">' +
          '<option value="2">2</option><option value="3" selected>3</option><option value="5">5</option></select></label>' +
        '<button class="btn btn-primary" id="sub-cross-go" type="button">用本科出跨科卷</button>' +
        '<label>弱科卷題數<select id="sub-cross-weakn">' +
          '<option value="5">5</option><option value="10" selected>10</option><option value="15">15</option></select></label>' +
        '<button class="btn" id="sub-cross-weak" type="button">弱科帶動</button>' +
      '</div>' +
      '<div id="sub-practice-host"></div></section>';
  }
  /* 以本科為箭頭：本科 per 題 + 每題延伸出去的跨科同概念題 */
  function buildSubjectMixed(s, per) {
    var b = cachedBank(s.id);
    var items = [], seen = {};
    if (!b) { return items; }
    function push(x, q) {
      var key = x.id + '#' + q.n;
      if (seen[key] || items.length >= 24) { return false; }
      seen[key] = 1;
      items.push({ s: x, q: q });
      return true;
    }
    var mine = b.questions.slice().sort(function (a, c) { return needScore(s, a) - needScore(s, c); });
    mine.slice(0, per).forEach(function (q) { push(s, q); });
    function bankQ(id, n) {
      var xb = cachedBank(id);
      var list = xb ? xb.questions : [];
      for (var i = 0; i < list.length; i++) { if (String(list[i].n) === String(n)) { return list[i]; } }
      return null;
    }
    /* 每題接一條跨科線：優先用概念詞庫，找不到才退回同科其他年份、再退回同年度其他科 */
    var picked = items.slice();
    picked.forEach(function (it) {
      var cand = conceptHits(s, it.q, 2);
      for (var i = 0; i < cand.length; i++) {
        if (seen[cand[i].id + '#' + cand[i].n]) { continue; }
        var x1 = subjectById(cand[i].id), q1 = bankQ(cand[i].id, cand[i].n);
        if (x1 && q1) { push(x1, q1); return; }
      }
      var same = autoCrossHits(s, it.q, 1, 'same');
      if (!same.length) { same = autoCrossHits(s, it.q, 1, 'same', true); }
      if (same.length) {
        var x2 = subjectById(same[0].id), q2 = bankQ(same[0].id, same[0].n);
        if (x2 && q2) { push(x2, q2); return; }
      }
      var yk = yearKeyOf(s);
      var alt = SUBJECTS.filter(function (x) { return x.data && x.id !== s.id && yearKeyOf(x) === yk; });
      if (!alt.length) { alt = SUBJECTS.filter(function (x) { return x.data && x.id !== s.id; }); }
      alt.some(function (x) {                         /* 最後手段：同年度其他科優先練的那題 */
        var xb = cachedBank(x.id);
        if (!xb || !xb.questions.length) { return false; }
        var q3 = xb.questions.slice().sort(function (a, c) { return needScore(x, a) - needScore(x, c); })[0];
        return q3 ? push(x, q3) : false;
      });
    });
    return items;
  }
  function bindSubjectCross(s) {
    var go = $('sub-cross-go');
    if (go) {
      go.addEventListener('click', function () {
        var perEl = $('sub-cross-per');
        var per = Number(perEl ? perEl.value : 3);
        go.disabled = true;
        loadAllBanks().then(function () {
          go.disabled = false;
          var items = buildSubjectMixed(s, per);
          var nOther = items.length - Math.min(per, items.length);
          renderPractice('sub-practice-host', items,
            '以《' + (s.name || s.id) + '》為起點：一科訓練五科',
            '本科 ' + Math.min(per, items.length) + ' 題 ＋ 跨科延伸 ' + Math.max(0, nOther) +
            ' 題；延伸題都是其他科「同一個核心觀念」的題目，練本科順手把別科帶上。');
          renderHeroStats();
        });
      });
    }
    var weak = $('sub-cross-weak');
    if (weak) {
      weak.addEventListener('click', function () {
        var cntEl = $('sub-cross-weakn');
        var cnt = Number(cntEl ? cntEl.value : 10);
        weak.disabled = true;
        loadAllBanks().then(function () {
          weak.disabled = false;
          var res = buildWeak(cnt);
          renderPractice('sub-practice-host', res.items, '弱科訓練卷', res.note);
          renderHeroStats();
        });
      });
    }
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
    var anim = animEntryHTML(ts, it.n, { label: '載入本題動畫', compact: true });
    return '<li' + (anim ? ' class="has-anim"' : '') + '>' +
      '<a href="' + esc(url('subject/' + it.id + '/q.html?n=' + encodeURIComponent(it.n))) + '">' +
      '<span class="cross-sub">' + esc(ts.name ? subLabel(ts) : it.id) + '</span>' +
      '<span class="cross-no">第 ' + esc(it.n) + ' 題</span>' +
      (it.why ? '<span class="cross-why">' + esc(it.why) + '</span>' : '') + '</a>' +
      anim + '</li>';
  }
  function mountCross(s, q) {
    var box = $('cross-box');
    if (!box) { return; }
    function render(items, kind, label, extra) {
      var tag = kind === 'curated'
        ? '<span class="cross-tag">五科串聯</span>'
        : (kind === 'marked' ? '' : '<span class="cross-tag">自動推薦</span>');
      var h = '<h2>跨科延伸' + tag + '</h2>';
      if (!items.length) {
        h += '<p class="hint">' + esc(label || '這題暫時找不到其他科的同概念題目。') + '</p>';
        box.innerHTML = h;
        return;
      }
      h += '<p class="hint">' + esc(label) + '</p>';
      h += '<ul class="cross-list">' + items.map(crossItemHTML).join('') + '</ul>';
      if (extra) { h += extra; }
      box.innerHTML = h;
      bindAnimEntries(box);                       /* 條目內的動畫入口（惰性 iframe） */
    }
    function autoCross() {                 /* 沒有單元標註時，沿用原本的關鍵字比對 */
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
        render(items, 'auto', label);
      });
    }
    var marked = (q.cross || []).filter(function (it) { return it && it.id; });
    if (marked.length) { render(marked, 'marked', '這題已標註的同概念題目：'); return; }
    box.innerHTML = '<h2>跨科延伸</h2><p class="hint">正在比對其他科目的同概念題目…</p>';
    loadCross().then(function () {
      var curated = crossLinksOf(s.id, q.n);
      if (!curated.length) { autoCross(); return; }
      var unit = crossUnitById(curated[0].unit);
      var items = curated.map(function (it) { return { id: it.subject, n: it.n, why: it.why }; });
      var extra = unit
        ? '<p class="hint">這題是學習單元「' + esc(unit.title) + '」的其中一站，' +
          '<a href="' + esc(url('cross.html#' + unit.id)) + '">看完整五科路徑</a>。</p>'
        : '';
      render(items, 'curated', '同一個觀念在其他科的對應題目：', extra);
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
      h += '</ul><div class="pq-fb"></div><div class="pq-sol"></div>' +
        animEntryHTML(s, q.n) + '</article>';
    });
    h += '<div class="practice-foot"><button class="btn" id="' + esc(hostId) + '-clear" type="button">' +
      '清除本卷作答紀錄</button></div></div>';
    host.innerHTML = h;

    var cards = host.querySelectorAll('.pq');
    for (var i = 0; i < cards.length; i++) { bindPracticeCard(cards[i], items[i]); }
    bindAnimEntries(host);
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

  /* ---------- 9.4 動畫入口（單題頁／cross 路徑站／練習卷共用） ----------
     沿用單題頁的 animSrc + 惰性 iframe：按鈕按下才注入 iframe（指向
     assets/anim 對應整卷動畫檔的 ?q=題號），再按一次收起來。 */
  var ANIM_SEQ = 0;
  function animEntryHTML(s, n, opts) {
    var src = animSrc(s, n);
    if (!src) { return ''; }
    var o = opts || {};
    ANIM_SEQ++;
    var boxId = 'anim-' + String(s.id).replace(/[^0-9A-Za-z_-]/g, '') + '-' +
      String(n).replace(/[^0-9A-Za-z_-]/g, '') + '-' + ANIM_SEQ;
    return '<div class="anim-entry' + (o.compact ? ' is-compact' : '') + '">' +
      (o.note ? '<p class="anim-note">' + esc(o.note) + '</p>' : '') +
      '<div class="anim-actions">' +
        '<button class="btn btn-primary anim-load" type="button" data-anim-src="' + esc(src) +
          '" data-anim-target="' + esc(boxId) + '" data-anim-label="' + esc(o.label || '載入動畫') +
          '" aria-controls="' + esc(boxId) + '" aria-expanded="false">' +
          esc(o.label || '載入動畫') + '</button>' +
        '<a class="btn" href="' + esc(src) + '" target="_blank" rel="noopener">另開動畫視窗</a>' +
      '</div>' +
      '<div class="anim-box" id="' + esc(boxId) + '" data-anim-host="1"></div>' +
    '</div>';
  }
  function bindAnimEntries(root) {
    var scope = root || document;
    var btns = scope.querySelectorAll('button.anim-load');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        if (btn.getAttribute('data-anim-bound') === '1') { return; }
        btn.setAttribute('data-anim-bound', '1');
        btn.addEventListener('click', function () {
          var box = document.getElementById(btn.getAttribute('data-anim-target'));
          if (!box) { return; }
          var label = btn.getAttribute('data-anim-label') || '載入動畫';
          if (box.getAttribute('data-on') === '1') {
            box.innerHTML = '';
            box.removeAttribute('data-on');
            btn.textContent = label;
            btn.setAttribute('aria-expanded', 'false');
            return;
          }
          box.setAttribute('data-on', '1');
          btn.textContent = '收起動畫';
          btn.setAttribute('aria-expanded', 'true');
          var src = btn.getAttribute('data-anim-src');
          box.innerHTML = '<iframe data-src="' + esc(src) + '" title="動畫" loading="lazy"></iframe>';
          var fr = box.querySelector('iframe');
          if (fr) {
            fr.src = fr.getAttribute('data-src');
            try { fr.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { }
          }
        });
      })(btns[i]);
    }
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
    if (/\/events\.html$/.test(path)) { renderEventsPage(); return; }
    if (/\/cross\.html$/.test(path)) { renderCrossPage(); return; }
    renderHome();
  }

  /* ---------- 10.6 學習資源與時事專區（OCW／2026 諾貝爾獎時事）
     資料來源：assets/js/data/resources.js
                 news[]      時事（2026 諾貝爾生醫獎光遺傳學、物理獎 IceCube 中微子天文臺）
                 links[]     外部開放式課程與自主學習資源
                 unitKits[]  把時事接進跨科單元（cross.js 的 unit id）的橋接設定與站內對應題目
               assets/anim/news/manifest.js（時事動畫，由 tools/gen_news_anim.py 產生）
     本區塊只讀資料、只渲染自己的容器；完全不碰題庫的 answer／options／作答判定。 */
  var RES_CACHE = null, RES_WAITERS = null, RES_FAILED = false;
  function resData() {
    if (RES_CACHE) { return RES_CACHE; }
    var raw = window.EXAM_RESOURCES;
    if (raw && typeof raw === 'object') { RES_CACHE = raw; }
    return RES_CACHE;
  }
  function loadResources() {
    return new Promise(function (resolve) {
      var d = resData();
      if (d) { resolve(d); return; }
      if (RES_FAILED) { resolve(null); return; }
      if (RES_WAITERS) { RES_WAITERS.push(resolve); return; }
      RES_WAITERS = [resolve];
      var el = document.createElement('script');
      el.async = true;
      el.src = url('assets/js/data/resources.js');
      el.onload = function () { flushRes(); };
      el.onerror = function () { RES_FAILED = true; flushRes(); };
      document.head.appendChild(el);
    });
  }
  function flushRes() {
    var w = RES_WAITERS || [];
    RES_WAITERS = null;
    var d = resData();
    for (var i = 0; i < w.length; i++) { w[i](d); }
  }

  var NEWSANIM_CACHE = null, NEWSANIM_WAITERS = null, NEWSANIM_FAILED = false;
  function newsAnimData() {
    if (NEWSANIM_CACHE) { return NEWSANIM_CACHE; }
    var raw = window.EXAM_NEWS_ANIM;
    if (raw && typeof raw === 'object') { NEWSANIM_CACHE = raw; }
    return NEWSANIM_CACHE;
  }
  function loadNewsAnim() {
    return new Promise(function (resolve) {
      var d = newsAnimData();
      if (d) { resolve(d); return; }
      if (NEWSANIM_FAILED) { resolve(null); return; }
      if (NEWSANIM_WAITERS) { NEWSANIM_WAITERS.push(resolve); return; }
      NEWSANIM_WAITERS = [resolve];
      var el = document.createElement('script');
      el.async = true;
      el.src = url('assets/anim/news/manifest.js');
      el.onload = function () { flushNewsAnim(); };
      el.onerror = function () { NEWSANIM_FAILED = true; flushNewsAnim(); };
      document.head.appendChild(el);
    });
  }
  function flushNewsAnim() {
    var w = NEWSANIM_WAITERS || [];
    NEWSANIM_WAITERS = null;
    var d = newsAnimData();
    for (var i = 0; i < w.length; i++) { w[i](d); }
  }

  function resNewsById(id) {
    var list = (resData() || {}).news || [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(id)) { return list[i]; }
    }
    return null;
  }
  function resNewsTitle(id) {
    var n = resNewsById(id);
    return n ? (n.award || n.id) : String(id);
  }
  function newsAnimById(id) {
    var list = (newsAnimData() || {}).units || [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(id)) { return list[i]; }
    }
    return null;
  }
  function unitKitById(id) {
    var list = (resData() || {}).unitKits || [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(id)) { return list[i]; }
    }
    return null;
  }
  /* 反查：某一題（科目＋題號）出現在哪些單元的時事橋接裡 */
  function newsKitsForQuestion(sid, n) {
    var kits = (resData() || {}).unitKits || [], hits = [];
    for (var i = 0; i < kits.length; i++) {
      var cards = kits[i].cards || [];
      for (var j = 0; j < cards.length; j++) {
        var as = cards[j].anchors || [];
        for (var k = 0; k < as.length; k++) {
          if (String(as[k].subject) === String(sid) && String(as[k].n) === String(n)) {
            hits.push({ kit: kits[i], card: cards[j], anchor: as[k] });
          }
        }
      }
    }
    return hits;
  }
  function unitHref(id) { return url('cross.html') + '#' + encodeURIComponent(id); }

  /* ---------- 2026 大事 × 五科對照點（純閱讀連結，不碰作答判定） ---------- */
  var EV_ACCENT_NAME = {
    med: '醫學公衛', phys: '物理・天文', chem: '化學',
    sport: '體育', astro: '天文', climate: '氣候環境', ai: 'AI', tw: '台灣本地'
  };
  var EV_SUB_NAME = { 'math-a': '數學A', physics: '物理', chemistry: '化學', chinese: '國文', english: '英文' };
  function evAccentName(a) { return EV_ACCENT_NAME[a] || (a || '大事'); }
  function evSubjectName(id) {
    var s = subjectById(id);
    return (s && s.name) ? s.name : (EV_SUB_NAME[id] || id);
  }
  function evPoints() { return (resData() || {}).eventPoints || []; }
  function evPointsForSubject(sid) {
    return evPoints().filter(function (p) { return String(p.subject) === String(sid); });
  }
  /* 第六節 6.3：專區的科目篩選只列「真的有對照點的五科」。
     科目頁代號可能帶學年度（例如 math-a-114），這裡一律收斂回底層科目代號。 */
  function evBaseSubjectId(id) {
    var q = String(id == null ? '' : id);
    if (!q) { return ''; }
    var hit = '';
    evPoints().some(function (p) {
      var s = String(p.subject);
      if (s === q || q.indexOf(s + '-') === 0) { hit = s; return true; }
      return false;
    });
    return hit;
  }
  /* 專區科目篩選的項目：以 eventPoints 實際出現的科目為準，依站上科目順序排列 */
  function evFilterSubjects() {
    var order = {}, used = {}, ids = [];
    SUBJECTS.forEach(function (s, i) { order[String(s.id)] = i; });
    evPoints().forEach(function (p) {
      var s = String(p.subject);
      if (!used[s]) { used[s] = true; ids.push(s); }
    });
    ids.sort(function (a, b) {
      var oa = (order[a] === undefined ? 999 : order[a]), ob = (order[b] === undefined ? 999 : order[b]);
      return oa === ob ? String(a).localeCompare(String(b)) : oa - ob;
    });
    return ids;
  }
  function evPointsForNews(newsId) {
    return evPoints().filter(function (p) { return String(p.news) === String(newsId); });
  }
  function evPointsForQuestion(sid, n) {
    return evPoints().filter(function (p) {
      return String(p.subject) === String(sid) && String(p.n) === String(n);
    });
  }
  /* 2026 大事的完整介紹只在專區頁（events.html），因此卡片的「對應大事」一律指到專區頁。 */
  function evHomeAnchor(newsId) { return url('events.html') + '#news-' + encodeURIComponent(newsId); }
  function evEventsAnchor(newsId) { return url('events.html') + '#news-' + encodeURIComponent(newsId); }
  /* 朗讀稿整理（第六節 6.1）：清掉連續標點、補上中英／數字之間的斷句空格。
     口語稿一律由 evSpeakJoin 以「。」串接：只唸領域、標題、日期、一句話與正文，
     區塊標題（研究在做什麼／為什麼和本站題目有關／新聞來源）與來源清單一律不唸。 */
  function evSpeakNorm(s) {
    var x = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
    if (!x) { return ''; }
    x = x.replace(/([\u3400-\u9fff\uf900-\ufaff])([A-Za-z0-9])/g, '$1 $2')
         .replace(/([A-Za-z0-9])([\u3400-\u9fff\uf900-\ufaff])/g, '$1 $2');
    x = x.replace(/([。，、；：！？])\1+/g, '$1');
    x = x.replace(/[，、；：]\s*(?=[。！？])/g, '');
    x = x.replace(/[。，、；：！？]\s*(?=[。，、；：！？])/g, '');
    /* 第六節 6.1：句尾的「？！」也要收乾淨，否則與 evSpeakJoin 的「。」相接會出現「？。」這種連續標點 */
    x = x.replace(/ {2,}/g, ' ').replace(/^[。，、；：！？\s]+/, '').replace(/[。，、；：！？\s]+$/, '');
    return x;
  }
  function evSpeakJoin(parts) {
    var arr = (parts || []).map(evSpeakNorm).filter(function (s) { return !!s; });
    return arr.length ? arr.join('。') + '。' : '';
  }
  /* 五科對照點的口語版（給「唸給我聽」用） */
  function evPointsSpeakText(pts) {
    if (!pts || !pts.length) { return ''; }
    return evSpeakJoin([pts.map(function (p) {
      return evSubjectName(p.subject) + '第 ' + p.n + ' 題，' + (p.title || '');
    }).join('；')]);
  }
  /* 主題卡上的「哪幾科考得到」連結列 */
  function evLinksHTML(newsId) {
    var pts = evPointsForNews(newsId);
    if (!pts.length) { return ''; }
    var bySub = {};
    pts.forEach(function (p) { (bySub[p.subject] = bySub[p.subject] || []).push(p); });
    var links = Object.keys(bySub).map(function (sid) {
      return '<a href="' + esc(url('subject/' + sid + '/q.html?n=' + encodeURIComponent(bySub[sid][0].n))) + '" title="' +
        esc(bySub[sid][0].title || '') + '">' + esc(evSubjectName(sid)) + ' 第 ' + esc(bySub[sid][0].n) + ' 題</a>';
    });
    return '<div class="ev-news-ref"><div class="ev-block-head"><b>五科對照點</b>（共 ' + pts.length + ' 個）' +
      evSpeakButtonHTML(evSpeakJoin(['這一則大事可以考到的對照點，共 ' + pts.length + ' 個', evPointsSpeakText(pts)])) + '</div>' +
      '<p class="ev-news-links">' + links.join('') +
      '<a href="' + esc(url('events.html') + '#ev-points') + '">到專區看全部對照點</a></p></div>';
  }

  /* ---------- 10.7 逐段「唸給我聽」（全站共用；一律不自動播放） ----------
     只在按鈕被按下時才呼叫 speechSynthesis；中文段用 zh-TW、英文句子用 en-US。
     headless 環境沒有音效裝置，speak() 會立刻回報錯誤，因此先把「要唸的字」
     寫進 <html data-last-spoken>／<html data-last-spoken-langs>，自檢時可驗收
     「唸出去的內容」與「逐段語言參數」，不依賴音效裝置。 */
  var EV_SPEAK = { on: false, btn: null, token: 0 };
  function evSpeakSegments(text) {
    var s = String(text || ''), out = [], cur = '', en = false, i, c;
    function isHan(ch) { return /[\u3400-\u9fff\uf900-\ufaff]/.test(ch); }
    function isLat(ch) { return /[A-Za-z]/.test(ch); }
    for (i = 0; i < s.length; i++) {
      c = s.charAt(i);
      if (isHan(c) || isLat(c)) {
        var e = isLat(c);
        if (cur && e !== en) { out.push({ text: cur, en: en }); cur = ''; }
        en = e;
      }
      cur += c;
    }
    if (cur) { out.push({ text: cur, en: en }); }
    var wordy = /[A-Za-z]{3,}/, merged = [];
    out.forEach(function (seg) {
      if (!seg.en) { merged.push({ text: seg.text, en: false }); return; }
      if (wordy.test(seg.text)) { merged.push({ text: seg.text, en: true }); return; }
      if (merged.length) { merged[merged.length - 1].text += seg.text; return; }
      merged.push({ text: seg.text, en: false });
    });
    return merged.filter(function (seg) { return seg.text.replace(/\s+/g, '').length; });
  }
  function evSpeakReset(btn) {
    EV_SPEAK.on = false;
    if (btn) {
      btn.textContent = btn.getAttribute('data-idle') || '唸給我聽';
      btn.removeAttribute('data-idle');
    }
    if (EV_SPEAK.btn === btn) { EV_SPEAK.btn = null; }
  }
  function evSpeakStop() {
    EV_SPEAK.token++;
    var b = EV_SPEAK.btn;
    EV_SPEAK.btn = null;
    EV_SPEAK.on = false;
    if (b) {
      b.textContent = b.getAttribute('data-idle') || '唸給我聽';
      b.removeAttribute('data-idle');
    }
    try { if (window.speechSynthesis) { window.speechSynthesis.cancel(); } } catch (e) {}
  }
  function evSpeakSay(btn) {
    if (EV_SPEAK.on) { evSpeakStop(); return; }
    var text = btn.getAttribute('data-speak') || '';
    if (!text) { return; }
    if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
      btn.textContent = '這個瀏覽器沒有語音';
      return;
    }
    var segs = evSpeakSegments(text);
    var de = document.documentElement;
    de.dataset.lastSpoken = text;
    de.dataset.lastSpokenLangs = segs.map(function (s) { return s.en ? 'en-US' : 'zh-TW'; }).join(',');
    evSpeakStop();
    EV_SPEAK.token++;
    var my = EV_SPEAK.token;
    EV_SPEAK.on = true; EV_SPEAK.btn = btn;
    btn.setAttribute('data-idle', btn.textContent);
    btn.textContent = '停止朗讀';
    var queue = segs.slice();
    (function nextSeg() {
      if (my !== EV_SPEAK.token) { return; }
      var seg = queue.shift();
      if (!seg) { evSpeakReset(btn); return; }
      var u = new SpeechSynthesisUtterance(seg.text);
      u.lang = seg.en ? 'en-US' : 'zh-TW';
      u.rate = 0.92; u.pitch = 1;
      u.onend = nextSeg;
      u.onerror = function () { evSpeakReset(btn); };
      try { window.speechSynthesis.speak(u); } catch (e) { evSpeakReset(btn); }
    })();
  }
  function evSpeakButtonHTML(text, label) {
    return '<button class="btn speak-btn" type="button" data-speak="' + esc(text) + '">' +
      esc(label || '唸給我聽') + '</button>';
  }
  /* 一個事件監聽處理全站的「唸給我聽」按鈕（事件委派，動態插入的卡片也生效） */
  function evBindSpeak(root) {
    var host = root || document;
    if (!host || host.__evSpeakBound) { return; }
    host.__evSpeakBound = true;
    host.addEventListener('click', function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest('[data-speak]') : null;
      if (!b) { return; }
      if (ev.preventDefault) { ev.preventDefault(); }
      evSpeakSay(b);
    });
  }
  /* 標籤 + 內文 + 該段專屬的「唸給我聽」按鈕 */
  function evSpeakBlockHTML(label, body, cls) {
    if (!body) { return ''; }
    return '<div class="ev-block ' + esc(cls || '') + '">' +
      '<div class="ev-block-head"><b>' + esc(label) + '</b>' + evSpeakButtonHTML(evSpeakNorm(body)) + '</div>' +
      '<p>' + esc(body) + '</p></div>';
  }
  /* 單題頁與科目頁共用的對照點卡片（每段都能「唸給我聽」，底部帶往專區的入口） */
  function evPointBlockHTML(pts, heading, entryHref) {
    var h = heading ? '<h3 class="unit-h3">' + esc(heading) + '</h3>' : '';
    h += '<div class="ev-grid">';
    pts.forEach(function (p) {
      var nw = resNewsById(p.news) || {};
      var subName = evSubjectName(p.subject);
      var cardSpeak = evSpeakJoin([
        subName + '第 ' + p.n + ' 題，單元：' + (p.unit || ''),
        p.title || '',
        '對應大事：' + (nw.award || p.news) + '，' + (nw.headline || ''),
        p.point || '',
        p.cross || ''
      ]);
      h += '<article class="ev-card ' + esc(nw.accent || '') + '">' +
        '<div class="ev-sub"><span class="ev-badge">' + esc(subName) + ' 第 ' + esc(p.n) + ' 題</span>' +
          '<span class="ev-q">單元：' + esc(p.unit || '') + '</span>' +
          evSpeakButtonHTML(cardSpeak, '唸整張卡') + '</div>' +
        '<h4 class="ev-title">' + esc(p.title || '') + '</h4>' +
        '<p class="ev-news-ref"><b>對應大事</b><a href="' + esc(evHomeAnchor(p.news)) + '">' +
          esc(nw.award || p.news) + '｜' + esc(nw.headline || '') + '</a>' +
          evSpeakButtonHTML(evSpeakJoin(['對應大事：' + (nw.award || p.news) + '，' + (nw.headline || '')])) + '</p>' +
        evSpeakBlockHTML('這個考點怎麼考', p.point) +
        evSpeakBlockHTML('跨科觀點串聯', p.cross) +
        '<p class="ev-links">' +
          '<a class="btn" href="' + esc(url('subject/' + p.subject + '/q.html?n=' + encodeURIComponent(p.n))) + '">去做這一題</a>' +
          '<a class="btn" href="' + esc(evEventsAnchor(p.news)) + '">看這則大事的細節</a>' +
        '</p></article>';
    });
    h += '</div>';
    if (entryHref === undefined && pts.length && pts[0].subject) {
      entryHref = url('events.html') + '?subject=' + encodeURIComponent(pts[0].subject) + '#ev-points';
    }
    if (entryHref) {
      h += '<p class="ev-links ev-entry"><a class="btn" href="' + esc(entryHref) + '">到 2026 大事專區看全部 ' +
        evPoints().length + ' 個對照點</a></p>';
    }
    return h;
  }
  /* 科目頁尾端的「本科可考點對照表」 */
  function evPointsHTML(s) {
    if (!s || !evPointsForSubject(s.id).length) { return ''; }
    return '<section class="panel ev-points" id="ev-points"><h2>' +
        esc(s.name || s.id) + ' × 2026 大事對照點</h2>' +
        '<p class="hint">依 2026 大事整理出本科可以考的三個對照點，每一點都寫清楚「本科怎麼考」與「和其他科哪一題、哪個觀點相通」。' +
        '本區只做閱讀提示，<b>不改動任何題目的答案、選項與判定</b>；人名、日期、數字與來源連結照抄原始檢索資料。</p>' +
        '<div class="ev-host" id="ev-points-host"></div></section>';
  }
  function mountEventPoints(s) {
    var host = $('ev-points-host');
    if (!host || !s) { return; }
    evBindSpeak(host);
    loadResources().then(function () {
      var pts = evPointsForSubject(s.id);
      host.innerHTML = pts.length ? evPointBlockHTML(pts, '')
        : '<p class="hint">本科尚未設定對照點。</p>';
    });
  }
  /* 一則大事的卡片（2026 大事專區頁用）：標題與一句話先出來，細節收在按鈕後方，
     每一段都有專屬的「唸給我聽」；不按就不會出聲。 */
  function newsCardHTML(n) {
    var pts = evPointsForNews(n.id);
    var kw = (n.keywords || []).map(function (k) { return '<span class="news-kw">' + esc(k) + '</span>'; }).join('');
    var srcList = n.sources || [];
    var src = srcList.map(function (s) {
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a>' +
             (s.source ? '<span class="news-src-from">' + esc(s.source) + '</span>' : '') + '</li>';
    }).join('');
    var kit = unitKitByIdForNews(n.id);
    var bodyId = 'news-body-' + n.id;
    /* 第六節 6.1：「唸整則」只唸 領域。標題。日期。一句話。正文。，
       不唸區塊標題（研究在做什麼／為什麼和本站題目有關／新聞來源）與來源清單。 */
    var whole = evSpeakJoin([
      evAccentName(n.accent),
      (n.award ? n.award + '，' : '') + (n.headline || n.id) + (n.date ? '，' + n.date : ''),
      n.oneLiner || '',
      n.principle || '',
      n.whyItMatters || ''
    ]);
    return '<article class="news-card ' + esc(n.accent || '') + '" id="news-' + esc(n.id) + '">' +
        '<div class="news-head">' +
          '<span class="ev-tag">' + esc(evAccentName(n.accent)) + '</span>' +
          '<span class="news-award">' + esc(n.award || '') + '</span>' +
          (n.date ? '<span class="news-date">' + esc(n.date) + '</span>' : '') +
          evSpeakButtonHTML(whole, '唸整則') +
        '</div>' +
        '<h4 class="news-title">' + esc(n.headline || n.id) + '</h4>' +
        (n.people ? '<p class="news-people">' + esc(n.people) + '</p>' : '') +
        '<p class="news-oneliner">' + esc(n.oneLiner || '') + '</p>' +
        evLinksHTML(n.id) +
        '<p class="ev-more"><button class="btn ev-toggle" type="button" data-ev-toggle="' + esc(bodyId) +
          '" aria-expanded="false" aria-controls="' + esc(bodyId) +
          '">看細節：研究在做什麼、為什麼和題目有關、來源</button></p>' +
        '<div class="ev-body" id="' + esc(bodyId) + '" hidden>' +
          evSpeakBlockHTML('研究在做什麼', n.principle) +
          evSpeakBlockHTML('為什麼和本站題目有關', n.whyItMatters) +
          (kw ? '<div class="news-kws">' + kw + '</div>' : '') +
          (kit ? '<div class="news-unit"><b>站內對應單元</b><a href="' + esc(unitHref(kit.id)) + '">' +
                 esc(kit.title || kit.id) + '</a>' +
                 '<a class="news-mini" href="' + esc(url('assets/anim/news/') + kit.id + '.html') + '" target="_blank" rel="noopener">時事動畫</a></div>' : '') +
          (src ? '<details class="news-srcs"><summary>新聞來源（' + srcList.length + '）</summary>' +
                 '<ul>' + src + '</ul></details>' : '') +
          (n.people ? evSpeakBlockHTML('關鍵人名／團隊', n.people) : '') +
        '</div>' +
      '</article>';
  }
  function unitKitByIdForNews(newsId) {
    var kits = (resData() || {}).unitKits || [];
    for (var i = 0; i < kits.length; i++) {
      var cards = kits[i].cards || [];
      for (var j = 0; j < cards.length; j++) {
        if (String(cards[j].news) === String(newsId)) { return kits[i]; }
      }
    }
    return null;
  }
  function newsAnimPlayerHTML(m, u) {
    var newsNames = (m.news || []).map(resNewsTitle).join('、');
    return '<div class="anim-head">' +
        '<b class="anim-title">時事動畫</b>' +
        '<span class="anim-meta">' + esc(u.title) + '｜' + esc(newsNames) + '｜' + (m.steps || 0) + ' 段' +
          '｜站內對應 ' + (m.anchors || 0) + ' 題</span>' +
        '<a class="anim-open" href="' + esc(url(m.src)) + '" target="_blank" rel="noopener">另開全螢幕</a>' +
      '</div>' +
      '<div class="anim-frame"><iframe src="' + esc(url(m.src)) + '" title="' + esc(u.title + '｜時事動畫') +
        '" loading="eager" allow="autoplay" referrerpolicy="no-referrer"></iframe></div>' +
      '<p class="anim-note">把 2026 諾貝爾生醫獎（光遺傳學）與物理獎（IceCube 中微子天文臺）的原理，' +
      '接回本單元的五科路徑與站內題目；內容為閱讀理解素材，不影響任何題目的答案與判定。</p>';
  }
  function newsAnimHostHTML(id) {
    var m = newsAnimById(id);
    if (!m) {
      return '<p class="anim-missing">此時事動畫尚未產生：在站台根目錄執行 ' +
        '<code>python3 tools/gen_news_anim.py</code>，會依 resources.js 自動生成。</p>';
    }
    return newsAnimPlayerHTML(m, crossUnitById(id) || { title: m.title || id });
  }

  /* 首頁：2026 大事「摘要區」（完整版在 events.html，首頁只留摘要＋一個明確入口，
     全站不再有兩套「2026 大事」入口互相打架） */
  /* ============ 今日複習（第七節）：每天一則大事＋一個對照點，聽完就勾，只增不減 ============ */
  var DAILY_KEY = 'learnsite_daily_v1';
  function dailyTodayStr() {
    var d = new Date();
    function p2(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
  }
  function dailyCandidates() {
    var seen = {}, out = [];
    evPoints().forEach(function (p) {
      if (!seen[p.news]) { seen[p.news] = true; out.push(p.news); }
    });
    return out;
  }
  function dailyLoad() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(DAILY_KEY) || 'null'); } catch (e) { raw = null; }
    var cand = dailyCandidates();
    if (!cand.length) { return null; }
    var today = dailyTodayStr();
    var st = (raw && raw.date === today) ? raw : null;
    if (!st) {
      var idx = raw ? (raw.idx + 1) % cand.length : 0;
      st = { date: today, idx: idx, news: false, pts: {} };
    }
    st.idx = ((st.idx % cand.length) + cand.length) % cand.length;
    st.pts = st.pts || {};
    return { cand: cand, st: st, newsId: cand[st.idx] };
  }
  function dailySave(st) {
    try { localStorage.setItem(DAILY_KEY, JSON.stringify(st)); } catch (e) {}
  }
  function dailyPointId(p) { return String(p.subject) + '-' + String(p.n); }
  function dailyHubHTML() {
    return '' +
      '<section class="panel daily-hub" id="daily-hub">' +
        '<h2>今日複習（約 1 分鐘）</h2>' +
        '<p class="hint">每天一則大事、一個考點：先聽，再勾掉。明天自動換下一則，同一則再回來時才看下一個考點——不追量，讀完今天的就好。</p>' +
        '<div id="daily-body"><p class="loading">載入中…</p></div>' +
      '</section>';
  }
  function dailyDoneBtnHTML(type, done, label) {
    if (done) { return '<span class="btn is-done" aria-disabled="true">已讀完</span>'; }
    return '<button class="btn" type="button" data-done="' + esc(type) + '">' + esc(label) + '</button>';
  }
  function renderDaily() {
    var host = $('daily-body');
    if (!host) { return; }
    var dl = dailyLoad();
    if (!dl) { host.innerHTML = '<p class="hint">暫時沒有可讀的大事。</p>'; return; }
    var st = dl.st;
    var nw = resNewsById(dl.newsId) || {};
    var pts = evPointsForNews(dl.newsId);
    var pend = pts.filter(function (p) { return !st.pts[dailyPointId(p)]; });
    var pt = pend[0] || null;
    var total = pts.length ? 2 : 1;
    var done = (st.news ? 1 : 0) + (pt ? 0 : (pts.length ? 1 : 0));
    var accent = nw.accent || '';
    var speakNews = evSpeakJoin([evAccentName(accent), nw.award || '', nw.headline || '', nw.oneLiner || '']);
    var subName = pt ? evSubjectName(pt.subject) : '';
    var h = '';
    h += '<div class="daily-head"><span class="ev-tag">' + esc(evAccentName(accent)) + '</span>' +
         '<span class="daily-progress">今日進度 ' + done + '/' + total + '</span></div>';
    h += '<div class="daily-card news-card ' + esc(accent) + '">' +
         '<div class="news-head"><span class="news-award">' + esc(nw.award || '') + '</span>' +
         (nw.date ? '<span class="news-date">' + esc(nw.date) + '</span>' : '') + '</div>' +
         '<h4 class="news-title">' + esc(nw.headline || dl.newsId) + '</h4>' +
         '<p class="news-oneliner">' + esc(nw.oneLiner || '') + '</p>' +
         '<div class="ev-entry">' +
           evSpeakButtonHTML(speakNews, '唸這則大事') +
           dailyDoneBtnHTML('news', !!st.news, '我讀完了這則') +
         '</div>' +
         '<p class="hint">細節與完整對照點在 <a href="' + esc(evEventsAnchor(dl.newsId)) + '">2026 大事專區</a>。</p>' +
         '</div>';
    if (pt) {
      var ptSpeak = evSpeakJoin([subName + '第 ' + pt.n + ' 題，單元：' + (pt.unit || ''), pt.title || '', '對應大事：' + (nw.award || '') + '，' + (nw.headline || ''), pt.point || '', pt.cross || '']);
      h += '<div class="daily-card ev-card ' + esc(accent) + '">' +
           '<div class="ev-sub"><span class="ev-badge">' + esc(subName) + ' 第 ' + esc(pt.n) + ' 題</span>' +
           '<span class="ev-q">單元：' + esc(pt.unit || '') + '</span></div>' +
           '<h4 class="ev-title">' + esc(pt.title || '') + '</h4>' +
           evSpeakBlockHTML('這個考點怎麼考', pt.point) +
           evSpeakBlockHTML('跨科觀點串聯', pt.cross) +
           '<div class="ev-entry">' +
             evSpeakButtonHTML(ptSpeak, '唸整張卡') +
             dailyDoneBtnHTML('pt', !!st.pts[dailyPointId(pt)], '我讀完了這個考點') +
           '</div>' +
           '<p class="ev-links">' +
             '<a class="btn" href="' + esc(url('subject/' + pt.subject + '/q.html?n=' + encodeURIComponent(pt.n))) + '">去做這一題</a>' +
             '<a class="btn" href="' + esc(evEventsAnchor(dl.newsId)) + '">看這則大事的細節</a>' +
           '</p></div>';
    } else if (pts.length) {
      h += '<p class="hint">這則大事的考點你都讀過了，明天會換下一則。</p>';
    }
    if (done >= total) {
      h += '<p class="daily-finish">今天的份讀完了。明天再來，會換下一則；同一則再回來時，再看下一個考點。慢慢來就好。</p>';
    }
    host.innerHTML = h;
    evBindSpeak(host);
    host.onclick = function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest('[data-done]') : null;
      if (!b || !dl) { return; }
      if (ev.preventDefault) { ev.preventDefault(); }
      var kind = b.getAttribute('data-done');
      if (kind === 'news') { st.news = true; }
      else if (kind === 'pt' && pt) { st.pts[dailyPointId(pt)] = true; }
      else { return; }
      dailySave(st);
      renderDaily();
    };
  }

  var EV_SUMMARY_N = 4;
  function resourcesHubHTML() {
    /* 第六節 6.2：首頁 #ocw-hub 只留 3–4 張摘要卡＋一顆前往專區的按鈕；
       時事動畫／單元對照／開放式課程等長列表一律收在專區與跨科單元頁，避免兩邊不同步。 */
    return '' +
      '<section class="panel ocw-hub" id="ocw-hub">' +
        '<h2>2026 大事（首頁摘要）</h2>' +
        '<p class="hint">體育、天文、氣候環境、醫學公衛、AI、台灣本地各至少一則，再加上諾貝爾生醫、物理、化學獎，' +
        '每則都接回站內五科（國文、英文、數學A、物理、化學）可以考的對照點。' +
        '首頁只放 ' + EV_SUMMARY_N + ' 則摘要，完整版一律在專區頁，兩邊不會不同步。' +
        '本區只做閱讀與連結，<b>不改動任何題目的答案、選項與作答判定</b>。</p>' +
        '<p class="ocw-cta ocw-cta-main">' +
          '<a class="btn btn-primary" href="' + esc(url('events.html')) + '">前往 2026 大事專區（完整版）</a>' +
          '<span class="hint" id="ocw-summary-count">六領域篩選、五科對照點、每段都能「唸給我聽」，一律不自動播放。</span>' +
        '</p>' +
        '<h3 class="unit-h3">大事摘要</h3>' +
        '<div class="ocw-events" id="ocw-events"><p class="loading">正在載入大事資料…</p></div>' +
      '</section>';
  }
  /* 首頁摘要卡：只給領域、標題、一句話與一個通往專區的連結，細節一律在專區頁 */
  function evSummaryCardsHTML(news) {
    var ranked = news.map(function (n, i) { return { n: n, i: i, c: evPointsForNews(n.id).length }; })
      .sort(function (a, b) { return b.c - a.c || a.i - b.i; })
      .slice(0, EV_SUMMARY_N)
      .sort(function (a, b) { return a.i - b.i; })
      .map(function (x) { return x.n; });
    return ranked.map(function (n) {
      return '<article class="news-card ' + esc(n.accent || '') + '" id="news-' + esc(n.id) + '">' +
        '<div class="news-head">' +
          '<span class="ev-tag">' + esc(evAccentName(n.accent)) + '</span>' +
          '<span class="news-award">' + esc(n.award || '') + '</span>' +
          (n.date ? '<span class="news-date">' + esc(n.date) + '</span>' : '') +
        '</div>' +
        '<h4 class="news-title"><a href="' + esc(evEventsAnchor(n.id)) + '">' + esc(n.headline || n.id) + '</a></h4>' +
        '<p class="news-oneliner">' + esc(n.oneLiner || '') + '</p>' +
        '</article>';
    }).join('');
  }

  /* ---------- 10.8 2026 大事專區頁（events.html）：六領域篩選 × 五科對照點 × 逐段朗讀 ---------- */
  var EV_HOME_FALLBACK = url('index.html') + '#ocw-hub';
  var EV_DOMAINS = [
    { id: 'all', label: '全部' },
    { id: 'sport', label: '體育' },
    { id: 'astro', label: '天文' },
    { id: 'climate', label: '氣候環境' },
    { id: 'med', label: '醫學公衛' },
    { id: 'ai', label: 'AI' },
    { id: 'tw', label: '台灣本地' },
    { id: 'nobel', label: '諾貝爾獎' }
  ];
  function evNews() { return (resData() || {}).news || []; }
  /* 一則大事屬於哪個領域：以 resources.js 的 accent 為準；
     「物理獎」記為 astro（中微子天文臺），因此天文領域同時涵蓋 astro 與 phys。 */
  function evDomainAccents(domId) {
    if (domId === 'sport') { return ['sport']; }
    if (domId === 'astro') { return ['astro', 'phys']; }
    if (domId === 'climate') { return ['climate']; }
    if (domId === 'med') { return ['med']; }
    if (domId === 'ai') { return ['ai']; }
    if (domId === 'tw') { return ['tw']; }
    return null;
  }
  function evNewsInDomain(n, domId) {
    if (!domId || domId === 'all') { return true; }
    if (domId === 'nobel') { return /^nobel-/.test(String(n.id)); }
    var acc = evDomainAccents(domId) || [];
    return acc.indexOf(String(n.accent || '')) >= 0;
  }
  function evDomainCount(domId) {
    return evNews().filter(function (n) { return evNewsInDomain(n, domId); }).length;
  }
  function evDomainLabel(domId) {
    for (var i = 0; i < EV_DOMAINS.length; i++) {
      if (EV_DOMAINS[i].id === domId) { return EV_DOMAINS[i].label; }
    }
    return domId;
  }
  var EVS = { domain: 'all', subject: 'all' };
  /* ---------- 六領域 × 五科的交集（第六節 6.3） ----------
     兩組篩選同時套用時，畫面內容與 chip 上的數字都以交集為準：
     chip 的數字＝「把它按下去之後會看到幾筆」（自己這一軸不看自己，另一軸的篩選一律算進去）。 */
  function evPointsInDomain(domId) {
    return evPoints().filter(function (p) {
      var n = resNewsById(p.news);
      return !!n && evNewsInDomain(n, domId);
    });
  }
  function evSubjectCount(domId, sid) {
    var list = evPointsInDomain(domId);
    if (!sid || sid === 'all') { return list.length; }
    return list.filter(function (p) { return String(p.subject) === String(sid); }).length;
  }
  function evSubjectNewsIds() {
    var ids = {}, all = evPoints();
    for (var i = 0; i < all.length; i++) {
      if (EVS.subject === 'all' || String(all[i].subject) === String(EVS.subject)) { ids[String(all[i].news)] = true; }
    }
    return ids;
  }
  function evNewsCountForDomain(domId) {
    var ids = evSubjectNewsIds(), any = (EVS.subject === 'all');
    return evNews().filter(function (n) {
      return evNewsInDomain(n, domId) && (any || ids[String(n.id)]);
    }).length;
  }
  function evPointsInView() {
    return evPointsInDomain(EVS.domain).filter(function (p) {
      return EVS.subject === 'all' || String(p.subject) === String(EVS.subject);
    });
  }
  function evNewsInView() {
    var ids = {}, list = evPointsInView(), any = (EVS.subject === 'all');
    for (var i = 0; i < list.length; i++) { ids[String(list[i].news)] = true; }
    return evNews().filter(function (n) {
      return evNewsInDomain(n, EVS.domain) && (any || ids[String(n.id)]);
    });
  }
  function updateEvChips() {
    var dc = $('ev-domain-chips');
    if (dc) { dc.innerHTML = evDomainChipsHTML(EVS.domain); }
    var sc = $('ev-subject-chips');
    if (sc) { sc.innerHTML = evSubjectChipsHTML(EVS.subject); }
  }
  function evScopeLabel() {
    return evDomainLabel(EVS.domain) + (EVS.subject === 'all' ? '' : ' × ' + evSubjectName(EVS.subject));
  }
  function evEmptyNewsMsg() {
    if (EVS.subject !== 'all') {
      return '「' + evDomainLabel(EVS.domain) + '」領域中，' + evSubjectName(EVS.subject) + '暫時沒有可以對照的大事。';
    }
    return '這個領域目前沒有大事資料。';
  }
  function evEmptyPointsMsg() {
    if (EVS.domain !== 'all' && EVS.subject !== 'all') {
      return '這一科在「' + evDomainLabel(EVS.domain) + '」這個領域暫時沒有對照點。';
    }
    if (EVS.domain !== 'all') { return '「' + evDomainLabel(EVS.domain) + '」這個領域目前沒有對照點。'; }
    if (EVS.subject !== 'all') { return evSubjectName(EVS.subject) + '目前沒有對照點。'; }
    return '目前沒有對照點。';
  }
  function evChipsHTML(kind, items, cur) {
    var loaded = !!resData();
    return items.map(function (it) {
      var on = String(it.id) === String(cur), zero = loaded && !it.count;
      return '<button type="button" class="ev-chip' + (on ? ' on' : '') + (zero ? ' ev-chip-zero' : '') + '"' +
        ' data-ev-filter="' + esc(kind) + '" data-ev-value="' + esc(it.id) + '"' +
        ' aria-pressed="' + (on ? 'true' : 'false') + '">' +
        esc(it.label) + '<span class="ev-chip-n">' + (loaded ? it.count : '…') + '</span></button>';
    }).join('');
  }
  function evDomainChipsHTML(cur) {
    var items = EV_DOMAINS.map(function (d) {
      return { id: d.id, label: d.label, count: evNewsCountForDomain(d.id) };
    });
    return evChipsHTML('domain', items, cur);
  }
  function evSubjectChipsHTML(cur) {
    var items = [{ id: 'all', label: '全部科目', count: evSubjectCount(EVS.domain, 'all') }];
    evFilterSubjects().forEach(function (sid) {
      items.push({ id: sid, label: evSubjectName(sid), count: evSubjectCount(EVS.domain, sid) });
    });
    return evChipsHTML('subject', items, cur);
  }
  function eventsPageHTML() {
    var news = evNews();
    return '' +
      '<section class="panel ev-hero" id="ev-hero">' +
        '<h2>2026 大事專區</h2>' +
        '<p class="hint">這裡把 2026 年的大事整理成一頁：<b>六個領域</b>（體育、天文、氣候環境、醫學公衛、AI、台灣本地）加上諾貝爾獎，' +
        '一則一則接回站內<b>五科（國文、英文、數學A、物理、化學）</b>可以考的對照點。' +
        '每一段都有「唸給我聽」，讀起來吃力就按它；<b>本站不會自動播放，你沒按，它就不會出聲</b>。' +
        '本區只做閱讀與連結，不改動任何題目的答案、選項與作答判定。' +
        '上面的領域與科目篩選可以一起用：兩邊同時套用時，顯示的內容與數字都是<b>交集</b>結果。</p>' +
        '<p class="hint ev-hero-links"><a class="btn" href="' + esc(EV_HOME_FALLBACK) + '">回首頁摘要</a>' +
        '<a class="btn" href="' + esc(url('quiz/index.html')) + '">線上學習入口頁</a></p>' +
      '</section>' +
      '<section class="panel ocw-hub" id="ev-events">' +
        '<h2>大事一覽（' + news.length + ' 則）</h2>' +
        '<div class="ev-filters" id="ev-domain-chips" role="group" aria-label="依領域篩選大事">' +
          evDomainChipsHTML(EVS.domain) + '</div>' +
        '<p class="hint" id="ev-events-state"></p>' +
        '<div class="ocw-events" id="ev-cards"><p class="loading">正在載入大事資料…</p></div>' +
      '</section>' +
      '<section class="panel ev-points" id="ev-points">' +
        '<h2>五科對照點（共 ' + evPoints().length + ' 個）</h2>' +
        '<p class="hint">同一則大事在不同科目有不同長相：下面按科目列出「哪一題考得到它」，以及和其他科哪一題相通。' +
        '每一張卡片、每一個段落也都有「唸給我聽」。</p>' +
        '<div class="ev-filters" id="ev-subject-chips" role="group" aria-label="依科目篩選對照點">' +
          evSubjectChipsHTML(EVS.subject) + '</div>' +
        '<p class="hint" id="ev-points-state"></p>' +
        '<div id="ev-points-host"><p class="loading">載入中…</p></div>' +
      '</section>';
  }
  function renderEventsCards() {
    var host = $('ev-cards');
    if (!host) { return; }
    loadResources().then(function (d) {
      var list = evNewsInView();
      host.innerHTML = list.length
        ? list.map(newsCardHTML).join('')
        : '<p class="hint">' + esc(evEmptyNewsMsg()) + '</p>';
      var st = $('ev-events-state');
      if (st) {
        st.textContent = '目前顯示「' + evScopeLabel() + '」交集 ' + list.length + ' 則' +
          (list.length < evNews().length ? '（本站共 ' + evNews().length + ' 則）' : '') +
          '；點卡片右上角的「唸整則」可以聽整則，或按「看細節」聽某一段。';
      }
      updateEvChips();
    });
  }
  function renderEventsPoints() {
    var host = $('ev-points-host');
    if (!host) { return; }
    loadResources().then(function (d) {
      var order = SUBJECTS.map(function (s) { return s.id; });
      var list = evPointsInView();
      if (!list.length) {
        host.innerHTML = '<p class="hint">' + esc(evEmptyPointsMsg()) + '</p>';
      } else {
        var html = '';
        order.forEach(function (sid) {
          var mine = list.filter(function (p) { return String(p.subject) === String(sid); });
          if (mine.length) { html += evPointBlockHTML(mine, evSubjectName(sid) + '（' + mine.length + ' 個對照點）', ''); }
        });
        host.innerHTML = html;
      }
      var st = $('ev-points-state');
      if (st) {
        st.textContent = '目前顯示「' + evScopeLabel() + '」交集 ' + list.length +
          ' 個對照點（本站共 ' + evPoints().length + ' 個）。';
      }
      updateEvChips();
    });
  }
  function evBindFilters(root) {
    if (!root || root.__evFiltersBound) { return; }
    root.__evFiltersBound = true;
    root.addEventListener('click', function (ev) {
      var chip = ev.target && ev.target.closest ? ev.target.closest('[data-ev-filter]') : null;
      if (chip) {
        var kind = chip.getAttribute('data-ev-filter'), val = chip.getAttribute('data-ev-value'), dirty = false;
        if (kind === 'domain' && val !== EVS.domain) { EVS.domain = val; dirty = true; }
        if (kind === 'subject' && val !== EVS.subject) { EVS.subject = val; dirty = true; }
        /* 一軸變動時兩邊一起重畫：計數與狀態即時反映交集結果 */
        if (dirty) { renderEventsCards(); renderEventsPoints(); }
        return;
      }
      var t = ev.target && ev.target.closest ? ev.target.closest('[data-ev-toggle]') : null;
      if (!t) { return; }
      var body = document.getElementById(t.getAttribute('data-ev-toggle'));
      if (!body) { return; }
      var open = body.hasAttribute('hidden');
      if (open) { body.removeAttribute('hidden'); } else { body.setAttribute('hidden', ''); }
      var on = t.textContent.replace(/^[^：]*：/, '');
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      t.textContent = (open ? '收起來：' : '看細節：') + on;
    });
  }
  function renderEventsPage() {
    var m = /[?&]subject=([^&]*)/.exec(location.search);
    var q = m ? decodeURIComponent(m[1]) : '';
    EVS.domain = 'all';
    /* 第六節 6.3：?subject= 可能來自科目頁（代號帶學年度），一律收斂成專區的五大科；找不到才回全部 */
    EVS.subject = evBaseSubjectId(q) || 'all';
    renderChrome('', '2026 大事專區');
    var app = $('app');
    if (!app) { return; }
    app.innerHTML = eventsPageHTML();
    evBindSpeak(document);
    evBindFilters(document);
    renderEventsCards();
    renderEventsPoints();
  }

  function ocwNewsTabsHTML(list, cur) {
    return list.map(function (m) {
      var u = crossUnitById(m.id) || { title: m.title || m.id };
      return '<button type="button" class="hub-tab' + (String(m.id) === String(cur) ? ' on' : '') + '"' +
        ' data-ocw-anim="' + esc(m.id) + '">' +
        '<span class="hub-tab-t">' + esc(u.title) + '</span>' +
        '<span class="hub-tab-n">' + (m.steps || 0) + ' 段・' + (m.anchors || 0) + ' 題</span></button>';
    }).join('');
  }
  function renderOcwNewsAnim(id) {
    var host = $('ocw-news-anim'), tabs = $('ocw-news-tabs');
    if (!host && !tabs) { return; }
    loadNewsAnim().then(function (d) {
      var list = (d && d.units) || [];
      if (!list.length) {
        if (host) {
          host.innerHTML = '<p class="anim-missing">時事動畫尚未產生：在站台根目錄執行 ' +
            '<code>python3 tools/gen_news_anim.py</code>。</p>';
        }
        return;
      }
      var cur = null;
      for (var i = 0; i < list.length; i++) { if (String(list[i].id) === String(id)) { cur = list[i]; break; } }
      if (!cur) { cur = list[0]; }
      if (tabs) { tabs.innerHTML = ocwNewsTabsHTML(list, cur.id); }
      if (host) { host.innerHTML = newsAnimHostHTML(cur.id); }
    });
  }
  function mountResourcesHub() {
    if (!$('ocw-hub')) { return; }
    loadResources().then(function (d) {
      var news = (d && d.news) || [];
      var eh = $('ocw-events');
      if (eh) {
        eh.innerHTML = news.length ? evSummaryCardsHTML(news)
          : '<p class="hint">尚未在 resources.js 設定大事資料。</p>';
      }
      var cnt = $('ocw-summary-count');
      if (cnt) {
        cnt.textContent = '六領域篩選、五科對照點、每段都能「唸給我聽」，一律不自動播放。' +
          '（專區目前有 ' + news.length + ' 則大事、' + (((d && d.eventPoints) || []).length) + ' 個五科對照點）';
      }
      var uh = $('ocw-units'), kits = (d && d.unitKits) || [];
      if (uh) {
        uh.innerHTML = kits.length ? '<div class="ocw-units">' + kits.map(function (kit) {
          var anchors = [];
          (kit.cards || []).forEach(function (c) {
            (c.anchors || []).forEach(function (a) {
              var s = subjectById(a.subject);
              anchors.push('<a class="ocw-anchor" href="' + esc(url('subject/' + a.subject + '/q.html?n=' + encodeURIComponent(a.n))) + '"' +
                ' title="' + esc(a.why || '') + '">' + esc(s ? subLabel(s) : a.subject) + ' 第 ' + esc(a.n) + ' 題</a>');
            });
          });
          return '<article class="ocw-unit"><h4><a href="' + esc(unitHref(kit.id)) + '">' + esc(kit.title || kit.id) + '</a></h4>' +
            '<p class="ocw-unit-news">' + (kit.cards || []).map(function (c) {
              return '<span class="ocw-tag">' + esc(c.kind || '') + '</span>' + esc(resNewsTitle(c.news));
            }).join('　') + '</p>' +
            '<p class="ocw-unit-anchors"><b>站內對應</b>' + anchors.join('') + '</p></article>';
        }).join('') + '</div>' : '<p class="hint">尚未在 resources.js 設定單元橋接。</p>';
      }
      var lh = $('ocw-links'), groups = (d && d.links) || [];
      if (lh) {
        lh.innerHTML = groups.length ? groups.map(function (g) {
          return '<div class="ocw-grp"><h4>' + esc(g.group || '') + '</h4><ul class="ocw-links">' +
            (g.items || []).map(function (it) {
              return '<li><a href="' + esc(it.url) + '" target="_blank" rel="noopener">' + esc(it.title) + '</a>' +
                (it.note ? '<span class="ocw-note">' + esc(it.note) + '</span>' : '') + '</li>';
            }).join('') + '</ul></div>';
        }).join('') : '<p class="hint">尚未設定外部資源。</p>';
      }
      var fh = $('ocw-foot');
      if (fh) {
        fh.innerHTML = '<p class="hint">' + esc((d && d.note) || '') + '</p>' +
          '<p class="ocw-cta"><a class="btn btn-primary" href="' + esc(url('quiz/index.html')) + '">前往線上學習入口頁</a>' +
          '<span class="hint">版本 ' + esc((d && d.version) || '') + '｜更新 ' + esc((d && d.updated) || '') + '</span></p>';
      }
    });
    renderOcwNewsAnim(null);
  }
  function bindResourcesHub() {
    var host = $('ocw-hub');
    if (!host) { return; }
    host.addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('[data-ocw-anim]') : null;
      if (!btn) { return; }
      renderOcwNewsAnim(btn.getAttribute('data-ocw-anim'));
    });
  }

  /* 單題頁：這一題出現在哪些單元的時事橋接裡（純提示，與作答判定無關） */
  function mountQuestionNews() {
    var host = $('news-box');
    if (!host) { return; }
    var sid = host.getAttribute('data-news-sub'), n = host.getAttribute('data-news-n');
    if (!sid || n == null) { return; }
    evBindSpeak(host);
    loadResources().then(function (d) {
      var hits = d ? newsKitsForQuestion(sid, n) : [];
      var evs = d ? evPointsForQuestion(sid, n) : [];
      if (!hits.length && !evs.length) { if (host.parentNode) { host.parentNode.removeChild(host); } return; }
      var h = evs.length ? evPointBlockHTML(evs, '2026 大事對照點：這一題可以這樣想') : '';
      if (!hits.length) { host.innerHTML = h; return; }
      h += '<h3 class="unit-h3">時事情境</h3><p class="hint">本站 2026 大事專區把時事接回跨科單元，' +
        '以下只說明「這題的角度和哪一則大事相像」，不改動題目的答案與判定；想看完整的大事介紹與對照點，請到專區頁。</p>';
      hits.forEach(function (hit) {
        var nw = resNewsById(hit.card.news) || {};
        var speakText = evSpeakJoin([
          nw.award || hit.card.news,
          hit.card.kind || '',
          nw.headline || '',
          hit.card.lens || '',
          hit.card.body || '',
          (hit.anchor && hit.anchor.why) ? hit.anchor.why : ''
        ]);
        h += '<article class="news-mini-card"><div class="news-head">' +
            '<span class="news-award">' + esc(nw.award || hit.card.news) + '</span>' +
            '<span class="ocw-tag">' + esc(hit.card.kind || '') + '</span>' +
            evSpeakButtonHTML(speakText, '唸這一段') + '</div>' +
            '<h4 class="news-title">' + esc(nw.headline || '') + '</h4>' +
            (hit.card.lens ? '<p class="news-oneliner">' + esc(hit.card.lens) + '</p>' : '') +
            (hit.card.body ? '<p class="news-body">' + esc(hit.card.body) + '</p>' : '') +
            (hit.anchor && hit.anchor.why ? '<p class="news-anchor-why"><b>這一題怎麼接</b>' + esc(hit.anchor.why) + '</p>' : '') +
            '<p class="news-mini-links">' +
              '<a href="' + esc(unitHref(hit.kit.id)) + '">單元：' + esc(hit.kit.title || hit.kit.id) + '</a>' +
              '<a href="' + esc(url('assets/anim/news/' + hit.kit.id + '.html')) + '" target="_blank" rel="noopener">看時事動畫</a>' +
              '<a href="' + esc(evEventsAnchor(hit.card.news)) + '">看這則大事的細節</a>' +
              '<a href="' + esc(url('events.html')) + '">2026 大事專區</a>' +
            '</p></article>';
      });
      host.innerHTML = h;
    });
  }

  /* 跨科單元頁（cross.html）：單元標題下方自動掛上「時事篇」 */
  function unitNewsHTML(u) {
    return '<div class="unit-news" data-unit-news="' + esc(u.id) + '"></div>';
  }
  function mountUnitNews() {
    var hosts = document.querySelectorAll('.unit-news');
    if (!hosts.length) { return; }
    loadResources().then(function () {
      loadNewsAnim().then(function (d) {
        var list = (d && d.units) || [];
        for (var i = 0; i < hosts.length; i++) {
          var host = hosts[i], id = host.getAttribute('data-unit-news'), m = null;
          for (var j = 0; j < list.length; j++) {
            if (String(list[j].id) === String(id)) { m = list[j]; break; }
          }
          if (!m) {
            host.innerHTML = '<p class="anim-missing">此時事篇尚未產生：在站台根目錄執行 ' +
              '<code>python3 tools/gen_news_anim.py</code> 即會依 resources.js 自動生成。</p>';
            continue;
          }
          var u = crossUnitById(id) || { title: m.title || id };
          var kit = unitKitById(id);
          var h = '<h3 class="unit-h3">時事篇：2026 諾貝爾獎怎麼接上這個單元</h3>';
          h += '<div class="unit-anim">' + newsAnimPlayerHTML(m, u) + '</div>';
          if (kit) {
            h += '<ul class="unit-news-cards">' + (kit.cards || []).map(function (c) {
              var nw = resNewsById(c.news) || {};
              return '<li><div class="news-head"><span class="news-award">' + esc(nw.award || c.news) + '</span>' +
                '<span class="ocw-tag">' + esc(c.kind || '') + '</span></div>' +
                '<p class="unit-news-lens">' + esc(c.lens || '') + '</p>' +
                '<p class="unit-news-body">' + esc(c.body || '') + '</p>' +
                '<p class="unit-news-anchors">' + (c.anchors || []).map(function (a) {
                  var s = subjectById(a.subject);
                  return '<a href="' + esc(url('subject/' + a.subject + '/q.html?n=' + encodeURIComponent(a.n))) + '" title="' +
                    esc(a.why || '') + '">' + esc(s ? subLabel(s) : a.subject) + ' 第 ' + esc(a.n) + ' 題</a>';
                }).join('') + '</p></li>';
            }).join('') + '</ul>';
          }
          host.innerHTML = h;
        }
      });
    });
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
