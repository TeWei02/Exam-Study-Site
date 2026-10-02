#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""sync.py — 依索引檔（assets/js/subjects.js）產生站台頁面

用法：
    python3 tools/sync.py

它會做三件事：
    1. 讀取索引檔，解析出所有科目（每筆的 id 決定網址 subject/<id>/）；
    2. 把外殼 HTML（tools/shell.html）套上正確的相對路徑前綴，寫出
          index.html                      ← 首頁
          subject/<id>/index.html         ← 科目頁
          subject/<id>/q.html             ← 單題頁（q.html?n=N）
    3. 印出一份 JSON 報告（含每科頁面路徑與題數宣告），方便自動化檢查。

站台引擎（assets/js/site.js）本身就能依索引檔動態渲染，因此：
    * 新增科目時「只要」在索引檔多登錄一筆 + 放入題庫資料檔 + 重新執行本檔；
    * 本檔不會覆蓋或刪除任何題庫資料，也不會動 assets/ 內的檔案；
    * 重複執行是安全的（同樣的輸入產生同樣的輸出）。
"""

import html
import json
import os
import re
import sys

TOOLS_DIR = os.path.dirname(os.path.abspath(__file__))
SITE_DIR = os.path.dirname(TOOLS_DIR)
INDEX_FILE = os.path.join(SITE_DIR, 'assets', 'js', 'subjects.js')
TEMPLATE_FILE = os.path.join(TOOLS_DIR, 'shell.html')
SUBTYPE = 'subject'


def fail(msg):
    sys.stderr.write('[sync] 失敗：%s\n' % msg)
    sys.exit(1)


def read_index():
    """由 subjects.js 取出 `window.EXAM_INDEX = {...}` 的 JSON

    註：檔頭註解裡也可能出現 `window.EXAM_INDEX =` 字樣（說明用），
        因此逐一嘗試每個出現位置的 JSON，取第一個能解析成功的。
    """
    if not os.path.isfile(INDEX_FILE):
        fail('找不到索引檔 %s' % INDEX_FILE)
    text = open(INDEX_FILE, encoding='utf-8').read()
    data = None
    for m in re.finditer(r'window\.EXAM_INDEX\s*=\s*', text):
        tail = text[m.end():].lstrip()
        if not tail.startswith('{'):
            continue
        try:
            data, _ = json.JSONDecoder().raw_decode(tail)
        except ValueError:
            continue
        break
    if data is None:
        fail('索引檔的 JSON 無法解析：請確認 `window.EXAM_INDEX = { ... };` 的內容是合法 JSON'
             '（用雙引號、沒有多餘逗號）。')
    if not isinstance(data, dict) or not isinstance(data.get('subjects'), list):
        fail('索引檔格式錯誤：最外層需為物件，且要有 subjects 陣列')
    return data


def render(template, prefix, title):
    return (template.replace('{{ROOT}}', prefix)
                    .replace('{{TITLE}}', html.escape(title, quote=True)))


def main():
    index = read_index()
    if not os.path.isfile(TEMPLATE_FILE):
        fail('找不到版型檔 %s' % TEMPLATE_FILE)
    template = open(TEMPLATE_FILE, encoding='utf-8').read()

    site = index.get('site') or {}
    site_title = site.get('title') or '考古題學習站'
    subjects = index['subjects']

    written = []
    # 首頁（站根）
    root_index = os.path.join(SITE_DIR, 'index.html')
    with open(root_index, 'w', encoding='utf-8') as f:
        f.write(render(template, '', site_title))
    written.append(os.path.relpath(root_index, SITE_DIR))

    # 每個科目一個資料夾（網址：subject/<id>/）
    seen = set()
    for s in subjects:
        sid = str(s.get('id') or '').strip()
        if not sid:
            fail('索引檔中有一筆科目缺少 id（每一筆都必須有唯一的 id）')
        if not re.match(r'^[A-Za-z0-9._-]+$', sid):
            fail('科目 id 只能使用英數與 - _ . ：%r' % sid)
        if sid in seen:
            fail('科目 id 重複：%r（每一筆的 id 必須唯一）' % sid)
        seen.add(sid)

        folder = os.path.join(SITE_DIR, SUBTYPE, sid)
        os.makedirs(folder, exist_ok=True)
        name = s.get('name') or sid
        for fname, title in (('index.html', '%s｜%s' % (name, site_title)),
                             ('q.html', '%s 單題｜%s' % (name, site_title))):
            path = os.path.join(folder, fname)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(render(template, '../../', title))
            written.append(os.path.relpath(path, SITE_DIR))

    report = {
        'ok': True,
        'site_title': site_title,
        'subject_count': len(subjects),
        'subjects': [
            {
                'id': s.get('id'),
                'name': s.get('name'),
                'count_declared': s.get('count'),
                'data': s.get('data'),
                'page': '%s/%s/index.html' % (SUBTYPE, s.get('id')),
                'question_page': '%s/%s/q.html?n=<題號>' % (SUBTYPE, s.get('id')),
            }
            for s in subjects
        ],
        'written': written,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
