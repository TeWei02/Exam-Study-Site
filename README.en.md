# Exam Study Site (Data-Driven, Subject-Agnostic)

**Language:** [![English](https://img.shields.io/badge/English-English-blue?style=flat-square)](README.en.md) [![中文](https://img.shields.io/badge/%E4%B8%AD%E6%96%87-%E4%B8%AD%E6%96%87%E7%89%88-blue?style=flat-square)](README.md)

A purely static past-exam practice site: **no build tools, no frameworks, no CDN**. All pages use relative
paths, so the site can be opened offline directly in a browser (`file://`), or dropped as a whole onto a
sub-path of GitHub Pages.

The site itself **knows nothing about any subject** — the home page grouping, subject cards, navigation bar,
progress statistics, and cross-subject search are all generated on the fly from the index file
[`assets/js/subjects.js`](assets/js/subjects.js). Subject count, names, exam names, years, tags, question
counts, and data file paths can all be freely added or removed — **adding a subject requires no changes to
any page code**.

---

## 1. Adding a Subject / a Year's Question Bank in Three Steps

Suppose you want to add "116 Academic Year · Physics":

### Step 1: Register an entry in the index file

Open `assets/js/subjects.js` and add an object to the `subjects` array (field descriptions in section 2):

```js
{
  "id": "physics-116",                       // subject id; determines the URL subject/physics-116/
  "name": "物理",                             // subject name
  "short": "物理",                            // short name used in the navigation bar (optional)
  "exam": "身心障礙學生升學大專校院甄試",       // exam name
  "year": 116,                                // year (used for sorting and grouping)
  "yearLabel": "116 學年度",                   // year display text (auto-generated from year if omitted)
  "tags": ["第二、三類組", "單選 25 題"],       // free-form tags (optional)
  "count": 25,                                // question count (estimated display when the bank is not yet registered)
  "note": "題庫來源：116_物理_試題.pdf",        // additional note (optional)
  "data": "assets/js/data/physics-116.js",    // ★ question bank data file path (relative to site root)
  "anim": {                                   // animation template (optional)
    "src": "assets/anim/physics-116/phy-3b1b.html?q=$(n)#cv$(n)",
    "label": "3Blue1Brown 動畫"
  },
  "order": 10
}
```

> `$(n)` is replaced with the question number; `$(id)` is replaced with the subject id.
> If you only want a navigation entry first and don't have a question bank yet, set `"data"` to `null` and
> the frontend will show "題庫建置中" (bank under construction).

### Step 2: Add the question bank data file

Create the file at the `data` path above (the filename must match), following the format of
[`assets/js/data/math-a.js`](assets/js/data/math-a.js):

```js
window.EXAM_BANKS = window.EXAM_BANKS || {};
window.EXAM_BANKS["physics-116"] = {
  "id": "physics-116",
  "name": "物理",
  "source": "116 學年度⋯官方試題",   // displayed on the subject page (optional)
  "note": "詳解依官方答案整理",       // optional
  "questions": [
    {
      "n": 1,                        // question number (used by list, single-question page, and progress)
      "unit": "牛頓第二定律",          // unit / concept tag (optional)
      "diff": 2,                     // difficulty 1–3 (optional)
      "answer": 1,                   // correct answer index: 0=A, 1=B, 2=C, 3=D (optional)
      "stem": "題幹（可用 HTML，例如 2<sup>a+b</sup>）",
      "options": ["選項A", "選項B", "選項C", "選項D"],
      "sol": "<p>詳解（HTML）。可用 .lead / ol / li / .ans / .tip / .eqs / .matrix 等樣式。</p>"
    }
  ]
};
```

> The object key (`"physics-116"`) must match the `id` in the index file.

### Step 3: Generate the pages

```bash
python3 tools/sync.py
```

It reads the index file and generates (or updates):

```
index.html                      ← home page
subject/<id>/index.html         ← subject page
subject/<id>/q.html             ← single-question page (q.html?n=<question number>)
```

Done. Refresh the browser and the new subject automatically appears on the home page (grouped under its
year), in the navigation bar, and in cross-subject search; **no changes to `assets/js/site.js` or any other
page are needed**.

> This step only generates HTML shells (three fixed page types); all content is rendered on the fly by JS
> from the index file, so even if you forget to run `sync.py`, the pages still work as long as the folders
> exist.

---

## 2. Index Field Reference (`assets/js/subjects.js`)

| Field | Required | Description |
|---|---|---|
| `id` | ★ | Subject id; use only alphanumerics and `-` `_` `.`; also determines the URL `subject/<id>/` |
| `name` | ★ | Subject name |
| `short` | | Short name, used when navigation bar space is tight |
| `exam` | | Exam name, shown on the subject card and subject page |
| `year` | | Year number, used for sorting and grouping |
| `yearLabel` | | Year display text; if omitted, built from `year` as "`<year>` 學年度" |
| `tags` | | Tag array (group, category, examinee type… free-form) |
| `count` | | Question count; only affects the estimated display before the bank is registered |
| `note` | | Additional note, shown on the subject page |
| `data` | ★ | Question bank data file path (relative to site root); `null` = bank not registered yet |
| `anim` | | Animation template `{ "src": "...?q=$(n)#cv$(n)", "label": "動畫" }` |
| `order` | | Sort weight; smaller comes first |

The `site` block can configure the site name, subtitle, footer text, and description — again without
touching any page code.

---

## 3. Directory Structure

```
exam-site/
├─ index.html                 home page (generated by sync.py; content rendered on the fly from the index file)
├─ subject/<id>/index.html    subject page
├─ subject/<id>/q.html        single-question page (?n=<question number>)
├─ assets/
│  ├─ css/site.css            site styles (light theme, responsive)
│  ├─ js/subjects.js          ★ index file (the only subject list you need to maintain)
│  ├─ js/site.js              site engine (contains no hard-coded subject / year / tag)
│  ├─ js/data/math-a.js       question bank data file (sample: Math A, 20 questions)
│  └─ anim/math-a/…           3Blue1Brown animations (?q=N jumps to question N)
├─ tools/
│  ├─ sync.py                 generates pages from the index file (see Step 3)
│  └─ shell.html              page shell template (edit `<head>` / footer here)
└─ README.md
```

---

## 4. Features

- **Home page**: subject cards automatically grouped by year (question count, completion rate, ready for
  practice / under construction), plus site statistics.
- **Tutor mode**: a low-stimulation, auditory learning mode (available for all five subjects). One concept
  per screen, large text on a white background, every paragraph can be read aloud (`speechSynthesis`
  zh-TW), check off questions one by one, no crosses for wrong answers, progress only ever increases,
  nothing autoplays; each subject's closing screen links to the "2026 events" reference points. Entry
  points are on the home page "家教伴讀版" (Tutor Mode) section, each subject page, and each
  single-question page.
- **Cross-subject search**: searches the stems, options, and solutions of **all registered subjects** at
  once, switchable between "all subjects / a single subject", with results showing hit locations and
  snippets.
- **Subject page**: question list (question number, stem summary, unit, answer status), in-subject
  filtering, clear per-subject progress, tutor mode entry.
- **Single-question page**: select an option to check the answer immediately, expand the solution, load the
  question's animation (can be opened in a new window), switch between previous/next questions, tutor mode
  entry.
- **Learning progress**: stored in browser `localStorage` under `examSite.progress.v1`, kept separately by
  subject id; not synced across devices, resets when browser data is cleared.

## 5. Deployment

```bash
# Copy the whole site into your GitHub Pages repo (sub-paths work too, since all paths are relative)
cp -r exam-site/* <your-repo>/
```

Double-clicking `index.html` under `file://` also works (both the bank and the index are loaded via
`<script>` tags; no server needed).

## 6. Sample Data

| Subject id | Name | Questions | Status |
|---|---|---|---|
| `math-a` | 數學 A | 20 | Full bank + solutions + animations |

The other subjects (Physics, Chemistry, English, Chinese) only have **navigation entries registered** in
the index file (`data: null`), demonstrating the "bank under construction" state; they automatically become
practicable once a bank data file is added.

---

## License and Content Attribution

| Item | Description |
| :--- | :--- |
| **Site code** | Pure static, no frameworks, no build tools. This data-driven architecture is freely available for use and modification — build your own question bank site with it. |
| **Questions and solutions** | Copyright belongs to the original publishers and solution authors. This site presents them for learning purposes only and makes no commercial use. |
| **Original authors** | If you are the author of the questions or solutions and would like the attribution changed or content removed, please open an issue or send an email and it will be handled promptly. |
| **Data accuracy** | Solutions are learning summaries; if they differ from the official answers, please defer to the official announcements. |
