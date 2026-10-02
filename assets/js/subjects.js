/* =============================================================================
   題庫索引檔（assets/js/subjects.js）— 這是唯一需要維護的科目清單
   -----------------------------------------------------------------------------
   本站完全資料驅動：
     * 首頁、導覽列、科目分組、進度統計、跨科目搜尋，全部由此檔產生；
     * 站台引擎（assets/js/site.js）不含任何科目名稱／科目數／年份／標籤；
     * 新增一個科目（或某一年的題庫）＝ ① 在下方 subjects 陣列多登錄一筆
       ② 放入對應的題庫資料檔 ③ 執行 python3 tools/sync.py 產生網址資料夾。

   欄位說明（★ 必填）
     ★ id        科目代號，只用英數與 - _ . ，同時決定網址 subject/<id>/
     ★ name      科目名稱（例：數學 A）
       short     簡稱（導覽列等空間較小時使用，可省略）
       exam      考試名稱（例：身心障礙學生升學大專校院甄試）
       year      年份數字，僅用於排序與顯示（可省略）
       yearLabel 年份顯示文字（例：115 學年度）；省略時由 year 自動組出
       tags      標籤陣列（分組、類組、身分別…自由填，可省略）
       count     題數；只用於尚未登錄題庫時的預估顯示，可省略
       note      補充說明（顯示於科目頁，可省略）
     ★ data      題庫資料檔路徑（相對站根），例：assets/js/data/math-a.js
                 null 表示尚未登錄題庫，前台會顯示「題庫建置中」
       anim      動畫模板（可省略）：
                   { "src": "assets/anim/math-a/xxx.html?q=$(n)#cv$(n)", "label": "動畫" }
                 $(id) 會換成科目 id、$(n) 會換成題號
       order     排序權重（越小越前面，可省略）

   註：本檔 `window.EXAM_INDEX =` 之後的內容為合法 JSON（無註解、無多餘逗號），
       tools/sync.py 與其他外部工具可直接解析；副檔名為 .js 是為了讓站台能
       在 file:// 離線環境下以 <script> 載入（不需 fetch／不需伺服器）。
   ============================================================================= */
window.EXAM_INDEX =
{
  "site": {
    "title": "考古題解題學習站",
    "subtitle": "資料驅動・科目不限：題庫、科目、年份、標籤全由索引檔決定",
    "description": "純靜態考古題解題學習站，所有科目與題庫皆由索引檔動態生成，可離線瀏覽。",
    "footer": [
      "本站為純靜態示範站：不需伺服器、不需建置工具，可離線瀏覽，也可直接部署到 GitHub Pages 子路徑。",
      "科目清單、題庫內容、動畫位置全部由 assets/js/subjects.js 索引檔驅動；新增科目不必修改任何頁面程式碼。"
    ]
  },
  "subjects": [
    {
      "id": "math-a",
      "name": "數學 A",
      "short": "數A",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 115,
      "yearLabel": "115 學年度",
      "tags": [
        "第二、三、四類組",
        "單選 20 題"
      ],
      "count": 20,
      "note": "題庫來源：115_數學A_試題.pdf／115_數學A_詳解.pdf",
      "data": "assets/js/data/math-a.js",
      "anim": {
        "src": "assets/anim/math-a/mathA_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      },
      "order": 1
    },
    {
      "id": "physics",
      "name": "物理",
      "short": "物理",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 115,
      "yearLabel": "115 學年度",
      "tags": [
        "第二、三類組"
      ],
      "count": 20,
      "note": "題庫來源：115_物理試題.pdf／115 物理答案（官方 20 題單選）",
      "data": "assets/js/data/physics.js",
      "anim": {
        "src": "assets/anim/physics/physics_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      },
      "order": 2
    },
    {
      "id": "chemistry",
      "name": "化學",
      "short": "化學",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 115,
      "yearLabel": "115 學年度",
      "tags": [
        "第二、三、四類組"
      ],
      "count": 25,
      "note": "題庫來源：115_化學試題.pdf／115 化學答案（官方 25 題單選）",
      "data": "assets/js/data/chemistry.js",
      "order": 3,
      "anim": {
        "src": "assets/anim/chemistry/chemistry_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "english",
      "name": "英文",
      "short": "英文",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 115,
      "yearLabel": "115 學年度",
      "tags": [
        "各類組共同",
        "單選 25 題"
      ],
      "count": 25,
      "note": "題庫來源：115_英文試題.pdf（25 題，含詞彙、綜合測驗、閱讀測驗）",
      "data": "assets/js/data/english.js",
      "order": 4,
      "anim": {
        "src": "assets/anim/english/english_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "chinese",
      "name": "國文",
      "short": "國文",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 115,
      "yearLabel": "115 學年度",
      "tags": [
        "各類組共同"
      ],
      "count": 20,
      "note": "題庫來源：115_國文試題.pdf／115 國文答案（官方 20 題單選，含 19-20 題組）",
      "data": "assets/js/data/chinese.js",
      "order": 5,
      "anim": {
        "src": "assets/anim/chinese/chinese_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "math-a-111",
      "name": "數學 A",
      "short": "數A",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 111,
      "yearLabel": "111 學年度",
      "tags": [
        "第二、三、四類組"
      ],
      "count": 20,
      "note": "題庫來源：111_數學A試題.pdf（20 題）",
      "data": "assets/js/data/math-a-111.js",
      "order": 1,
      "anim": {
        "src": "assets/anim/math-a-111/math-a-111_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "physics-111",
      "name": "物理",
      "short": "物理",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 111,
      "yearLabel": "111 學年度",
      "tags": [
        "第二、三類組"
      ],
      "count": 20,
      "note": "題庫來源：111_物理試題.pdf（20 題）",
      "data": "assets/js/data/physics-111.js",
      "order": 2,
      "anim": {
        "src": "assets/anim/physics-111/physics-111_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "chemistry-111",
      "name": "化學",
      "short": "化學",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 111,
      "yearLabel": "111 學年度",
      "tags": [
        "第二、三、四類組"
      ],
      "count": 25,
      "note": "題庫來源：111_化學試題.pdf（25 題）",
      "data": "assets/js/data/chemistry-111.js",
      "order": 3,
      "anim": {
        "src": "assets/anim/chemistry-111/chemistry-111_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "english-111",
      "name": "英文",
      "short": "英文",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 111,
      "yearLabel": "111 學年度",
      "tags": [
        "各類組共同"
      ],
      "count": 25,
      "note": "題庫來源：111_英文試題.pdf（25 題）",
      "data": "assets/js/data/english-111.js",
      "order": 4,
      "anim": {
        "src": "assets/anim/english-111/english-111_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "chinese-111",
      "name": "國文",
      "short": "國文",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 111,
      "yearLabel": "111 學年度",
      "tags": [
        "各類組共同"
      ],
      "count": 20,
      "note": "題庫來源：111_國文試題.pdf（20 題）",
      "data": "assets/js/data/chinese-111.js",
      "order": 5,
      "anim": {
        "src": "assets/anim/chinese-111/chinese-111_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "math-a-112",
      "name": "數學 A",
      "short": "數A",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 112,
      "yearLabel": "112 學年度",
      "tags": [
        "第二、三、四類組"
      ],
      "count": 20,
      "note": "題庫來源：112_數學A試題.pdf（20 題）",
      "data": "assets/js/data/math-a-112.js",
      "order": 1,
      "anim": {
        "src": "assets/anim/math-a-112/math-a-112_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "physics-112",
      "name": "物理",
      "short": "物理",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 112,
      "yearLabel": "112 學年度",
      "tags": [
        "第二、三類組"
      ],
      "count": 20,
      "note": "題庫來源：112_物理試題.pdf（20 題）",
      "data": "assets/js/data/physics-112.js",
      "order": 2,
      "anim": {
        "src": "assets/anim/physics-112/physics-112_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "chemistry-112",
      "name": "化學",
      "short": "化學",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 112,
      "yearLabel": "112 學年度",
      "tags": [
        "第二、三、四類組"
      ],
      "count": 25,
      "note": "題庫來源：112_化學試題.pdf（25 題）",
      "data": "assets/js/data/chemistry-112.js",
      "order": 3,
      "anim": {
        "src": "assets/anim/chemistry-112/chemistry-112_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "english-112",
      "name": "英文",
      "short": "英文",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 112,
      "yearLabel": "112 學年度",
      "tags": [
        "各類組共同"
      ],
      "count": 25,
      "note": "題庫來源：112_英文試題.pdf（25 題）",
      "data": "assets/js/data/english-112.js",
      "order": 4,
      "anim": {
        "src": "assets/anim/english-112/english-112_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "chinese-112",
      "name": "國文",
      "short": "國文",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 112,
      "yearLabel": "112 學年度",
      "tags": [
        "各類組共同"
      ],
      "count": 20,
      "note": "題庫來源：112_國文試題.pdf（20 題）",
      "data": "assets/js/data/chinese-112.js",
      "order": 5,
      "anim": {
        "src": "assets/anim/chinese-112/chinese-112_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "math-a-113",
      "name": "數學 A",
      "short": "數A",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 113,
      "yearLabel": "113 學年度",
      "tags": [
        "第二、三、四類組"
      ],
      "count": 20,
      "note": "題庫來源：113_數學A試題.pdf（20 題）",
      "data": "assets/js/data/math-a-113.js",
      "order": 1,
      "anim": {
        "src": "assets/anim/math-a-113/math-a-113_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "physics-113",
      "name": "物理",
      "short": "物理",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 113,
      "yearLabel": "113 學年度",
      "tags": [
        "第二、三類組"
      ],
      "count": 20,
      "note": "題庫來源：113_物理試題.pdf（20 題）",
      "data": "assets/js/data/physics-113.js",
      "order": 2,
      "anim": {
        "src": "assets/anim/physics-113/physics-113_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "chemistry-113",
      "name": "化學",
      "short": "化學",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 113,
      "yearLabel": "113 學年度",
      "tags": [
        "第二、三、四類組"
      ],
      "count": 25,
      "note": "題庫來源：113_化學試題.pdf（25 題）",
      "data": "assets/js/data/chemistry-113.js",
      "order": 3,
      "anim": {
        "src": "assets/anim/chemistry-113/chemistry-113_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "english-113",
      "name": "英文",
      "short": "英文",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 113,
      "yearLabel": "113 學年度",
      "tags": [
        "各類組共同"
      ],
      "count": 25,
      "note": "題庫來源：113_英文試題.pdf（25 題）",
      "data": "assets/js/data/english-113.js",
      "order": 4,
      "anim": {
        "src": "assets/anim/english-113/english-113_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "chinese-113",
      "name": "國文",
      "short": "國文",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 113,
      "yearLabel": "113 學年度",
      "tags": [
        "各類組共同"
      ],
      "count": 20,
      "note": "題庫來源：113_國文試題.pdf（20 題）",
      "data": "assets/js/data/chinese-113.js",
      "order": 5,
      "anim": {
        "src": "assets/anim/chinese-113/chinese-113_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "math-a-114",
      "name": "數學 A",
      "short": "數A",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 114,
      "yearLabel": "114 學年度",
      "tags": [
        "第二、三、四類組"
      ],
      "count": 20,
      "note": "題庫來源：114_數學A試題.pdf（20 題）",
      "data": "assets/js/data/math-a-114.js",
      "order": 1,
      "anim": {
        "src": "assets/anim/math-a-114/math-a-114_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "physics-114",
      "name": "物理",
      "short": "物理",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 114,
      "yearLabel": "114 學年度",
      "tags": [
        "第二、三類組"
      ],
      "count": 20,
      "note": "題庫來源：114_物理試題.pdf（20 題）",
      "data": "assets/js/data/physics-114.js",
      "order": 2,
      "anim": {
        "src": "assets/anim/physics-114/physics-114_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "chemistry-114",
      "name": "化學",
      "short": "化學",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 114,
      "yearLabel": "114 學年度",
      "tags": [
        "第二、三、四類組"
      ],
      "count": 25,
      "note": "題庫來源：114_化學試題.pdf（25 題）",
      "data": "assets/js/data/chemistry-114.js",
      "order": 3,
      "anim": {
        "src": "assets/anim/chemistry-114/chemistry-114_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "english-114",
      "name": "英文",
      "short": "英文",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 114,
      "yearLabel": "114 學年度",
      "tags": [
        "各類組共同"
      ],
      "count": 25,
      "note": "題庫來源：114_英文試題.pdf（25 題）",
      "data": "assets/js/data/english-114.js",
      "order": 4,
      "anim": {
        "src": "assets/anim/english-114/english-114_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    },
    {
      "id": "chinese-114",
      "name": "國文",
      "short": "國文",
      "exam": "身心障礙學生升學大專校院甄試",
      "year": 114,
      "yearLabel": "114 學年度",
      "tags": [
        "各類組共同"
      ],
      "count": 20,
      "note": "題庫來源：114_國文試題.pdf（20 題）",
      "data": "assets/js/data/chinese-114.js",
      "order": 5,
      "anim": {
        "src": "assets/anim/chinese-114/chinese-114_all.html?q=$(n)",
        "label": "3B1B 動態講解（曉曉語音・整卷單檔）"
      }
    }
  ]
};
