/* =============================================================================
   題庫資料檔：化學（112）（assets/js/data/chemistry-112.js）
   -----------------------------------------------------------------------------
   本檔由索引檔（assets/js/subjects.js）中該科 data 欄位指向；
   站台引擎會在需要時自動以 <script> 載入，掛到 window.EXAM_BANKS["chemistry-112"]。
   欄位：id / name / source / note / questions[]
     questions[] 每題：n 題號、unit 單元、diff 難度 1-3、answer 正解索引(0=A)、
                      stem 題幹(HTML)、options 選項(HTML)、sol 詳解(HTML)
   ============================================================================= */
window.EXAM_BANKS = window.EXAM_BANKS || {};
window.EXAM_BANKS["chemistry-112"] =
{
  "id": "chemistry-112",
  "name": "化學",
  "source": "112 學年度身心障礙學生升學大專校院甄試・化學（官方 25 題單選）",
  "note": "題面與官方參考答案已登錄；25 題詳解已補寫完成。另：已修正題面／選項中散落的下標（如 H<sub>2</sub>SO<sub>4</sub>、C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>）與殘留的 LaTeX（$\\mathrm{...}$），第 6 題以表格重排、第 22 題（N<sub>2</sub>O 路易士結構）改以圖示呈現。",
  "questions": [
    {
      "n": 1,
      "unit": "化學",
      "diff": 2,
      "answer": 0,
      "stem": "下列的化合物中，何者是分子化合物並且是電解質？",
      "options": [
        "硫酸（H<sub>2</sub>SO<sub>4</sub>）",
        "乙醇（C<sub>2</sub>H<sub>5</sub>OH）",
        "氯化鈉（NaCl）",
        "硝酸鉀（KNO<sub>3</sub>）"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>兩個條件要同時成立：必須是「分子化合物」（由分子組成），又必須是「電解質」（溶於水能解離出離子而導電）。</p>\n<ol>\n  <li>(A) 硫酸 H<sub>2</sub>SO<sub>4</sub> 是共價分子化合物，溶於水會游離出 H<sup>+</sup> 與 SO<sub>4</sub><sup>2−</sup>，水溶液可導電，是電解質，正確。</li>\n  <li>(B) 乙醇 C<sub>2</sub>H<sub>5</sub>OH 雖是分子化合物，但溶於水不游離出離子，屬非電解質。</li>\n  <li>(C) 氯化鈉 NaCl 是離子化合物（由 Na<sup>+</sup>、Cl<sup>−</sup> 構成），不是分子化合物。</li>\n  <li>(D) 硝酸鉀 KNO<sub>3</sub> 亦為離子化合物，非分子化合物。</li>\n</ol>\n<p class=\"ans\">答案：(A)</p>\n<p class=\"tip\">提醒：電解質不一定是離子化合物；HCl、H<sub>2</sub>SO<sub>4</sub>、CH<sub>3</sub>COOH 等分子化合物在水中能解離，同樣是電解質。</p>"
    },
    {
      "n": 2,
      "unit": "化學",
      "diff": 2,
      "answer": 1,
      "stem": "在人類活動與工業生產過程中經常會排放空氣汙染物，下列汙染 物中的化合物與環境危害之關聯，哪一項錯誤？",
      "options": [
        "SO<sub>2</sub>－造成酸雨",
        "CH<sub>4</sub>－形成細懸浮粒子",
        "CCl<sub>2</sub>F<sub>2</sub>－破壞臭氧層",
        "NO<sub>2</sub>－形成光化學煙霧"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>逐項比對「空氣污染物─環境危害」的對應是否正確，找出配錯的一項。</p>\n<ol>\n  <li>(A) SO<sub>2</sub> 溶於雨水形成亞硫酸、硫酸，造成酸雨，敘述正確。</li>\n  <li>(B) CH<sub>4</sub>（甲烷）是溫室氣體，主要造成全球暖化，與細懸浮粒子 PM<sub>2.5</sub> 的形成無直接關係，配對錯誤。</li>\n  <li>(C) CCl<sub>2</sub>F<sub>2</sub> 屬氟氯碳化物（CFCs），分解出的氯原子會催化破壞臭氧層，敘述正確。</li>\n  <li>(D) NO<sub>2</sub> 在陽光下與碳氫化合物反應，生成光化學煙霧，敘述正確。</li>\n</ol>\n<p class=\"ans\">答案：(B)</p>\n<p class=\"tip\">提醒：PM<sub>2.5</sub> 的前驅物多為 SO<sub>2</sub>、NO<sub>x</sub>、揮發性有機物等；甲烷的角色是溫室效應，兩者不要混淆。</p>"
    },
    {
      "n": 3,
      "unit": "化學",
      "diff": 2,
      "answer": 3,
      "stem": "氨在氧氣存在下燃燒的反應式如下：NH<sub>3</sub>(g) + O<sub>2</sub>(g) → NO(g) + H<sub>2</sub>O(g)（係數未平衡）以最小的整數平衡上述反應式，則 H<sub>2</sub>O 的係數是多少？",
      "options": [
        "2",
        "3",
        "4",
        "6"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>用「原子守恆」逐一配平，先定氮、再定氧、最後定氫，求出最小整數比。</p>\n<ol>\n  <li>先配氮：NH<sub>3</sub> 與 NO 都只含 1 個 N，可先各設係數相等。</li>\n  <li>取 NH<sub>3</sub> 係數 4、NO 係數 4（氮守恆）；此時生成 4 NO 需氧原子 4 個，加上 H<sub>2</sub>O 的氧。</li>\n  <li>氫守恆：4 NH<sub>3</sub> 含 12 個 H，故 H<sub>2</sub>O 係數為 6（含 12 個 H）。</li>\n  <li>氧守恆：產物端氧原子＝4（NO）＋6（H<sub>2</sub>O）＝10 個，故 O<sub>2</sub> 係數為 5，得 4 NH<sub>3</sub> + 5 O<sub>2</sub> → 4 NO + 6 H<sub>2</sub>O，最小整數比無公因數，H<sub>2</sub>O 係數為 6。</li>\n</ol>\n<p class=\"ans\">答案：(D)</p>\n<p class=\"tip\">提醒：平衡方程式可記口訣「先金屬、後非金屬，最後氫氧」，本題順序宜為 N → H → O。</p>"
    },
    {
      "n": 4,
      "unit": "化學",
      "diff": 2,
      "answer": 1,
      "stem": "比較下列描述的數目，何者的數值最大？ （原子量：H＝1.0，C＝12.0，O＝16.0）",
      "options": [
        "18 克石墨（C）所含碳原子的數目",
        "8 克甲烷（CH<sub>4</sub>）所含氫原子的數目",
        "500 毫升的 2.0 M 鹽酸（HCl）溶液中所含 H<sup>+</sup> 離子的數目",
        "9 毫升水（H<sub>2</sub>O）所含氫原子的數目（水的密度為 1.0 克/毫升）"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>先把每個敘述換算成「莫耳數 → 指定粒子數」，再比較大小。</p>\n<ol>\n  <li>(A) 18 g 石墨 ÷ 12.0 = 1.5 mol C，碳原子數 1.5 N<sub>A</sub>。</li>\n  <li>(B) 8 g 甲烷 ÷ 16.0 = 0.5 mol CH<sub>4</sub>，每分子含 4 個 H，氫原子數 0.5 × 4 = 2.0 N<sub>A</sub>。</li>\n  <li>(C) 0.500 L × 2.0 M = 1.0 mol HCl，酸性溶液中 H<sup>+</sup> 數 1.0 N<sub>A</sub>。</li>\n  <li>(D) 9 mL × 1.0 g/mL = 9 g 水 ÷ 18.0 = 0.5 mol H<sub>2</sub>O，氫原子數 0.5 × 2 = 1.0 N<sub>A</sub>。</li>\n  <li>比較：2.0 N<sub>A</sub> 最大的是 (B)。</li>\n</ol>\n<p class=\"ans\">答案：(B)</p>\n<p class=\"tip\">提醒：問「原子數」時記得乘上化學式中該元素的原子個數，這是本題最容易漏掉的一步。</p>"
    },
    {
      "n": 5,
      "unit": "化學",
      "diff": 2,
      "answer": 2,
      "stem": "實驗室有一瓶濃氨（NH<sub>3</sub>）水溶液，其重量百分濃度為 25%，密度是 0.9 克/毫升。若要配製 1.0 升的 0.9 M 氨水溶液，需要取多少毫升的濃氨水溶液？（分子量：NH<sub>3</sub>＝17.0）",
      "options": [
        "22",
        "34",
        "68",
        "136"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>先算稀釋後溶液需要的 NH<sub>3</sub> 莫耳數，再回推濃氨水每毫升可提供多少莫耳 NH<sub>3</sub>。</p>\n<ol>\n  <li>所需 NH<sub>3</sub> 莫耳數＝1.0 L × 0.9 M ＝ 0.90 mol。</li>\n  <li>濃氨水每毫升質量＝1 mL × 0.9 g/mL ＝ 0.90 g；其中純 NH<sub>3</sub> 質量＝0.90 × 25% ＝ 0.225 g。</li>\n  <li>每毫升提供 NH<sub>3</sub>＝0.225 ÷ 17.0 ＝ 0.01324 mol。</li>\n  <li>需取體積＝0.90 ÷ 0.01324 ≒ 68 mL。</li>\n</ol>\n<p class=\"ans\">答案：(C)</p>\n<p class=\"tip\">提醒：溶液中「重量百分濃度 × 密度」是把體積換成純質質量的橋樑，莫耳濃度題幾乎都用得到。</p>"
    },
    {
      "n": 6,
      "unit": "化學",
      "diff": 2,
      "answer": 2,
      "stem": "甲和乙化合物皆含有 X 元素，經由元素分析實驗得知，此兩種化合物中 X 元素的重量百分比如下：<table class=\"tbl\"><thead><tr><th>化合物</th><th>分子量</th><th>X 元素的重量百分比</th></tr></thead><tbody><tr><td>甲</td><td>64.0</td><td>25.0%</td></tr><tr><td>乙</td><td>80.0</td><td>60.0%</td></tr></tbody></table>依上表的數據，X 元素的原子量可能是多少？",
      "options": [
        "12.0",
        "14.0",
        "16.0",
        "32.0"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>化合物中 X 的總質量必須是「X 原子量」的整數倍，兩個化合物取出的值要有共同的公因數。</p>\n<ol>\n  <li>甲中 X 的質量＝64.0 × 25.0% ＝ 16.0。</li>\n  <li>乙中 X 的質量＝80.0 × 60.0% ＝ 48.0。</li>\n  <li>X 原子量須同時整除 16.0 與 48.0，即為兩者的公因數；16.0 本身即為可能值（甲含 1 個 X、乙含 3 個 X）。</li>\n  <li>檢驗其他選項：12.0、14.0 無法整除 16.0；32.0 無法整除 48.0（3 個 32.0 為 96）。故為 16.0。</li>\n</ol>\n<p class=\"ans\">答案：(C)</p>\n<p class=\"tip\">提醒：元素分析題的核心是「質量 ÷ 原子量 = 原子個數」，原子個數必須是正整數才能成立。</p>"
    },
    {
      "n": 7,
      "unit": "化學",
      "diff": 2,
      "answer": 3,
      "stem": "下列哪一個物質的化學式是屬於示性式？",
      "options": [
        "金：Au",
        "氯化鈉：NaCl",
        "葡萄糖：C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>",
        "乙醇：CH<sub>3</sub>CH<sub>2</sub>OH"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>示性式要能看出官能基或結構特徵；只寫原子種類與數目的是分子式（化學式），只寫符號的是元素符號。</p>\n<ol>\n  <li>(A) Au 是金的元素符號，連化合物都不是。</li>\n  <li>(B) NaCl 是氯化鈉的化學式（實驗式），看不出結構特徵。</li>\n  <li>(C) C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> 是葡萄糖的分子式，只表達原子數。</li>\n  <li>(D) CH<sub>3</sub>CH<sub>2</sub>OH 把羥基（−OH）單獨標出，能看出官能基，屬示性式，正確。</li>\n</ol>\n<p class=\"ans\">答案：(D)</p>\n<p class=\"tip\">提醒：示性式好比「有重點的分子式」；相同分子式的二甲醚 CH<sub>3</sub>OCH<sub>3</sub> 與乙醇 CH<sub>3</sub>CH<sub>2</sub>OH 正是用示性式區分。</p>"
    },
    {
      "n": 8,
      "unit": "化學",
      "diff": 2,
      "answer": 0,
      "stem": "有一 Z 元素的原子可以符號 <sup>19</sup><sub>9</sub>Z 表示，下列對該原子的敘述中，哪一項正確？",
      "options": [
        "是週期表中第17族元素",
        "含有10個質子、9個中子、9個電子",
        "含有1個價電子",
        "趨向於失去1個電子，可作為還原劑"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>符號 <sup>A</sup><sub>Z</sub>X 中，左下角為原子序（＝質子數＝電子數），左上角為質量數（＝質子數＋中子數）。</p>\n<ol>\n  <li>由 <sup>19</sup><sub>9</sub>Z 得知：質子數 9、電子數 9、中子數 = 19 − 9 = 10，此元素為氟（F）。</li>\n  <li>(A) 原子序 9 的元素位於週期表第 17 族（鹵素），正確。</li>\n  <li>(B) 質子數應為 9（不是 10），中子數 10（不是 9），錯誤。</li>\n  <li>(C) 電子組態為 2,7，價電子有 7 個，不是 1 個，錯誤。</li>\n  <li>(D) 價電子 7 個，傾向「得到」1 個電子形成 F<sup>−</sup>，是氧化劑而非還原劑，錯誤。</li>\n</ol>\n<p class=\"ans\">答案：(A)</p>\n<p class=\"tip\">提醒：看到「價電子 7 個」就要聯想到鹵素：易得電子、氧化力強、常作氧化劑。</p>"
    },
    {
      "n": 9,
      "unit": "化學",
      "diff": 2,
      "answer": 0,
      "stem": "下列是人體和食物中常見的化學物質，何者不是聚合物？",
      "options": [
        "脂肪",
        "澱粉",
        "蛋白質",
        "去氧核糖核酸(DNA)"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>聚合物是由許多小單元（單體）重複鍵結而成的大分子，逐一檢查是否由單體聚合。</p>\n<ol>\n  <li>(A) 脂肪是甘油與脂肪酸形成的酯類，每個分子只由一個甘油與數個脂肪酸結合，並非「單體重複聚合」，不是聚合物，正確。</li>\n  <li>(B) 澱粉是葡萄糖單體聚合而成的多醣，是聚合物。</li>\n  <li>(C) 蛋白質是胺基酸單體以胜肽鍵聚合而成，是聚合物。</li>\n  <li>(D) DNA 是核苷酸單體聚合而成的核酸，是聚合物。</li>\n</ol>\n<p class=\"ans\">答案：(A)</p>\n<p class=\"tip\">提醒：三大天然聚合物為多醣、蛋白質、核酸；脂肪與油脂屬「酯類」，不屬於聚合物。</p>"
    },
    {
      "n": 10,
      "unit": "化學",
      "diff": 2,
      "answer": 1,
      "stem": "在高溫下，SO<sub>2</sub> 與 O<sub>2</sub> 可以反應生成 SO<sub>3</sub>，其反應式如下：2 SO<sub>2</sub>(g) + O<sub>2</sub>(g) → 2 SO<sub>3</sub>(g)。取 12.8 克的 SO<sub>2</sub> 與 12.8 克的 O<sub>2</sub> 反應，最多可得到多少克的 SO<sub>3</sub>？（分子量：O<sub>2</sub>＝32.0，SO<sub>2</sub>＝64.0，SO<sub>3</sub>＝80.0）",
      "options": [
        "12.8",
        "16.0",
        "20.0",
        "25.6"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>先判斷限量試劑（莫耳數 ÷ 係數，較小者為限量），再依限量試劑計算產量。</p>\n<ol>\n  <li>n(SO<sub>2</sub>)＝12.8 ÷ 64.0 ＝ 0.20 mol；n(O<sub>2</sub>)＝12.8 ÷ 32.0 ＝ 0.40 mol。</li>\n  <li>比較「莫耳數 ÷ 係數」：SO<sub>2</sub>：0.20 ÷ 2 ＝ 0.10；O<sub>2</sub>：0.40 ÷ 1 ＝ 0.40，故 SO<sub>2</sub> 為限量試劑。</li>\n  <li>由 2 SO<sub>2</sub> → 2 SO<sub>3</sub>，生成 SO<sub>3</sub> 莫耳數＝0.20 mol。</li>\n  <li>產量＝0.20 × 80.0 ＝ 16.0 g。</li>\n</ol>\n<p class=\"ans\">答案：(B)</p>\n<p class=\"tip\">提醒：氧氣看起來「給得比較多」，但莫耳數大不等於過量，務必除以係數再比。</p>"
    },
    {
      "n": 11,
      "unit": "化學",
      "diff": 2,
      "answer": 0,
      "stem": "電子產業在台灣相當發達，其產品製造與化學原料息息相關，下 列常見化學原料的敘述中，哪一項正確？",
      "options": [
        "二氧化矽（SiO<sub>2</sub>）固體具有立體網狀結構",
        "液晶是液體，液晶分子不能形成規則的排列",
        "矽（Si）晶片的矽原子間以金屬鍵結合，具有延展性",
        "銅（Cu）固體的銅原子間以共價鍵結合，是電的良導體"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>由物質的鍵結型態（共價網狀、分子、金屬鍵）推論其結構與性質。</p>\n<ol>\n  <li>(A) SiO<sub>2</sub> 由 Si、O 以共價鍵形成三維網狀結構，熔點高、硬度大，正確。</li>\n  <li>(B) 液晶兼具液體的流動性與部分規則排列（分子仍保有一定方向性），「不能形成規則排列」錯誤。</li>\n  <li>(C) 矽晶體原子間為共價鍵，硬而脆、無延展性；「金屬鍵、具延展性」是錯的。</li>\n  <li>(D) 銅是金屬晶體，原子間為金屬鍵（自由電子海），才有良好導電性；「共價鍵」錯誤。</li>\n</ol>\n<p class=\"ans\">答案：(A)</p>\n<p class=\"tip\">提醒：金屬導電靠金屬鍵的自由電子；矽為半導體，鍵結是共價鍵，別被「電子產業」四個字誤導。</p>"
    },
    {
      "n": 12,
      "unit": "化學",
      "diff": 2,
      "answer": 2,
      "stem": "界面活性劑是肥皂和清潔劑的主要成分，下列有關界面活性劑的 敘述中，哪一項正確？",
      "options": [
        "增加水的表面張力",
        "降低油脂在水中的溶解度",
        "CH<sub>3</sub>(CH<sub>2</sub>)<sub>16</sub>COONa 可以作為界面活性劑",
        "具有親油基團（疏水端），而不具有親水基團（親水端）"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>界面活性劑分子必同時具備「親水端」與「親油（疏水）端」，能降低表面張力並乳化油脂。</p>\n<ol>\n  <li>(A) 界面活性劑會「降低」水的表面張力，不是增加。</li>\n  <li>(B) 界面活性劑可把油脂乳化成小油滴而分散於水中，是「增加」油脂的分散與溶解度。</li>\n  <li>(C) CH<sub>3</sub>(CH<sub>2</sub>)<sub>16</sub>COONa 即硬脂酸鈉（肥皂），長碳鏈為親油端、−COO<sup>−</sup>Na<sup>+</sup> 為親水端，可作界面活性劑，正確。</li>\n  <li>(D) 界面活性劑兩端兼具，「不具有親水基團」錯誤。</li>\n</ol>\n<p class=\"ans\">答案：(C)</p>\n<p class=\"tip\">提醒：肥皂的化學結構可簡化為「長碳鏈＋羧酸鈉」，長鏈溶油、離子端溶水，這正是去汙的關鍵。</p>"
    },
    {
      "n": 13,
      "unit": "化學",
      "diff": 2,
      "answer": 3,
      "stem": "銅元素的原子序為 29，在自然界中含有 <sup>63</sup>Cu 和 <sup>65</sup>Cu 兩種同位素，平均原子量為 63.6。在自然界的銅含量中，<sup>63</sup>Cu 占的莫耳百分比是多少？",
      "options": [
        "30%",
        "40%",
        "60%",
        "70%"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>平均原子量＝各同位素質量數的加權平均，設 <sup>63</sup>Cu 的莫耳分率為 x 列式。</p>\n<ol>\n  <li>設 <sup>63</sup>Cu 占 x，則 <sup>65</sup>Cu 占 (1 − x)。</li>\n  <li>加權平均：63x ＋ 65(1 − x) ＝ 63.6。</li>\n  <li>展開：65 − 2x ＝ 63.6 → 2x ＝ 1.4 → x ＝ 0.70，即 70%。</li>\n  <li>檢核：0.70×63 ＋ 0.30×65 ＝ 44.1 ＋ 19.5 ＝ 63.6，正確。</li>\n</ol>\n<p class=\"ans\">答案：(D)</p>\n<p class=\"tip\">提醒：平均原子量必介於兩同位素質量數之間，且會偏向含量較多的一方，可用來快速檢核答案是否合理。</p>"
    },
    {
      "n": 14,
      "unit": "化學",
      "diff": 2,
      "answer": 0,
      "stem": "葡萄糖（C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>）在無氧的環境下進行發酵，可產生乙醇和二氧化碳，其熱反應式如下：C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> → 2 C<sub>2</sub>H<sub>5</sub>OH + 2 CO<sub>2</sub>，ΔH ＝ −60 kJ。取 9.0 克葡萄糖進行發酵後，產生的熱量變化是多少？（分子量：C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> ＝ 180）",
      "options": [
        "釋放3 kJ熱量",
        "吸收3 kJ熱量",
        "釋放540 kJ熱量",
        "吸收540 kJ熱量"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>ΔH 為負表示放熱，且熱量與莫耳數成正比，先換算葡萄糖莫耳數再按比例計算。</p>\n<ol>\n  <li>n(葡萄糖)＝9.0 ÷ 180 ＝ 0.050 mol。</li>\n  <li>熱反應式 ΔH ＝ −60 kJ 表示「每 1 mol 葡萄糖發酵放出 60 kJ」。</li>\n  <li>0.050 mol 放出熱量＝0.050 × 60 ＝ 3.0 kJ。</li>\n  <li>ΔH 為負 → 放熱，故為「釋放 3 kJ 熱量」。</li>\n</ol>\n<p class=\"ans\">答案：(A)</p>\n<p class=\"tip\">提醒：ΔH &lt; 0 一律代表放熱；計算時記得先看方程式係數對應的是「每莫耳」還是「每若干莫耳」。</p>"
    },
    {
      "n": 15,
      "unit": "化學",
      "diff": 2,
      "answer": 1,
      "stem": "根據亞佛加厥定律，在同溫、同壓下，相同體積的任何氣體含有 相同數目的分子。已知氧氣的分子量為32，在相同的溫度和壓力 下，3.0克X氣體的體積是1.0克氧氣體積的2倍，則X氣體的分子 量是多少？",
      "options": [
        "30",
        "48",
        "60",
        "64"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>亞佛加厥定律——同溫同壓下體積比＝莫耳數比，先用氧氣求出 X 的莫耳數，再求分子量。</p>\n<ol>\n  <li>1.0 g 氧氣莫耳數＝1.0 ÷ 32 ＝ 0.03125 mol（體積記為 V）。</li>\n  <li>X 氣體體積是氧氣的 2 倍 → X 莫耳數＝2 × 0.03125 ＝ 0.0625 mol。</li>\n  <li>X 分子量＝3.0 ÷ 0.0625 ＝ 48。</li>\n  <li>檢核：同壓同溫下 2 倍體積即 2 倍莫耳數，質量 3.0 g 對應 0.0625 mol，結果合理。</li>\n</ol>\n<p class=\"ans\">答案：(B)</p>\n<p class=\"tip\">提醒：此類題只要抓住「體積比＝莫耳數比」，再套 M ＝ w ÷ n 即可，不需知道氣體種類。</p>"
    },
    {
      "n": 16,
      "unit": "化學",
      "diff": 2,
      "answer": 3,
      "stem": "下列哪一種的物質變化是屬於氧化還原反應？",
      "options": [
        "二氧化碳氣體溶入水中製造碳酸飲料 CO<sub>2</sub>(g) + H<sub>2</sub>O(l) → H<sub>2</sub>CO<sub>3</sub>(aq)",
        "醋酸在水中解離形成離子 CH<sub>3</sub>COOH(aq) → CH<sub>3</sub>COO<sup>−</sup>(aq) + H<sup>+</sup>(aq)",
        "水汽化形成水蒸氣 H<sub>2</sub>O(l) → H<sub>2</sub>O(g)",
        "高溫下，焦炭與鐵礦冶煉製鐵 3 C(s) + 2 Fe<sub>2</sub>O<sub>3</sub>(s) → 3 CO(g) + 4 Fe(s)"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>氧化還原反應的必要條件是「有電子轉移」，即元素氧化數發生改變；逐一檢查各元素的氧化數是否變化。</p>\n<ol>\n  <li>(A) CO<sub>2</sub> 溶於水生成 H<sub>2</sub>CO<sub>3</sub>，各元素氧化數不變（C 皆為 +4），非氧化還原。</li>\n  <li>(B) 醋酸解離只是放出 H<sup>+</sup>，原子本身氧化數不變，非氧化還原。</li>\n  <li>(C) 水的汽化是狀態變化（物理變化），無電子轉移。</li>\n  <li>(D) C 由 0 氧化為 +2（氧化）、Fe 由 +3 還原為 0（還原），是氧化還原反應，正確。</li>\n</ol>\n<p class=\"ans\">答案：(D)</p>\n<p class=\"tip\">提醒：判斷氧化還原最可靠的方法是「算氧化數」；只有狀態變化或酸鹼解離者一律不是。</p>"
    },
    {
      "n": 17,
      "unit": "化學",
      "diff": 2,
      "answer": 2,
      "stem": "已知在 25℃ 時，水的離子積常數（K<sub>w</sub>）為 1.0×10<sup>−14</sup>。若有水溶液在 25℃ 時，其 [H<sup>+</sup>] 是 [OH<sup>−</sup>] 的 100 倍（[H<sup>+</sup>] ＝ 100[OH<sup>−</sup>]），則該水溶液的 pH 值是多少？",
      "options": [
        "2.0",
        "5.0",
        "6.0",
        "8.0"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>利用 K<sub>w</sub> ＝ [H<sup>+</sup>][OH<sup>−</sup>] 與給定的倍數關係，先解出 [H<sup>+</sup>] 再取 pH。</p>\n<ol>\n  <li>令 [OH<sup>−</sup>] ＝ y，則 [H<sup>+</sup>] ＝ 100y。</li>\n  <li>代入 K<sub>w</sub>：100y × y ＝ 1.0×10<sup>−14</sup> → y<sup>2</sup> ＝ 1.0×10<sup>−16</sup> → y ＝ 1.0×10<sup>−8</sup> M。</li>\n  <li>故 [H<sup>+</sup>] ＝ 100 × 1.0×10<sup>−8</sup> ＝ 1.0×10<sup>−6</sup> M。</li>\n  <li>pH ＝ −log(1.0×10<sup>−6</sup>) ＝ 6.0。</li>\n</ol>\n<p class=\"ans\">答案：(C)</p>\n<p class=\"tip\">提醒：pH ＝ 6 且 [H<sup>+</sup>] &gt; [OH<sup>−</sup>] 代表溶液呈酸性；25℃ 時 pH 小於 7 就是酸性，兩者可互相驗證。</p>"
    },
    {
      "n": 18,
      "unit": "化學",
      "diff": 2,
      "answer": 2,
      "stem": "鋅（Zn）與鹽酸溶液反應會產生氫氣，其反應式如下：Zn(s) + 2 HCl(aq) → ZnCl<sub>2</sub>(aq) + H<sub>2</sub>(g)。比較鋅塊與鋅粉在鹽酸中的反應，進行以下兩組實驗：實驗 1：取 1 克的鋅塊加入 100 毫升 2.0 M 鹽酸溶液中；實驗 2：取 1 克的鋅粉加入 100 毫升 2.0 M 鹽酸溶液中。記錄兩組實驗產生氫氣體積隨時間的變化。下列的敘述中，哪一項正確？（原子量：Zn＝65.4，Mg＝24.3）",
      "options": [
        "兩組實驗中，鹽酸為限量試劑",
        "理論上，實驗2會比實驗1產生更多的氫氣",
        "實驗2產生氫氣的速率大於實驗1",
        "若實驗2改用1克的鎂粉，則可產生相同體積的氫氣"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>兩組實驗的差別只在「鋅的表面積」，接觸面積影響反應速率，但不影響最終產量。</p>\n<ol>\n  <li>先判斷限量試劑：1 g Zn ＝ 0.0153 mol，需 HCl 0.0306 mol；而鹽酸提供 0.100 L × 2.0 M ＝ 0.20 mol，故 Zn 為限量試劑。</li>\n  <li>(A) 限量試劑是 Zn，不是鹽酸，錯誤。</li>\n  <li>(B) 兩組 Zn 質量相同、皆為限量，理論產氫量相同，「實驗 2 更多」錯誤。</li>\n  <li>(C) 鋅粉表面積大於鋅塊，與鹽酸接觸更充分，反應速率較快，正確。</li>\n  <li>(D) 1 g Mg ＝ 0.0412 mol，Mg 為限量（HCl 0.20 mol 可溶 0.10 mol Mg），產氫 0.0412 mol，大於 Zn 的 0.0153 mol，故不會產生「相同體積」，錯誤。</li>\n</ol>\n<p class=\"ans\">答案：(C)</p>\n<p class=\"tip\">提醒：表面積、濃度、溫度、催化劑只改變「速率」；質量守恆決定「最終產量」，兩者要分開想。</p>"
    },
    {
      "n": 19,
      "unit": "化學",
      "diff": 2,
      "answer": 1,
      "stem": "在二氧化碳的相圖中，臨界點為31.1 ℃和73.8大氣壓，下列有關 二氧化碳的敘述中，哪一項正確？",
      "options": [
        "超臨界流體是屬於液態",
        "在50 ℃、100大氣壓時，呈現超臨界流體狀態",
        "在31.1 ℃、73.8大氣壓時，固相、液相、氣相可以共存",
        "由相圖可得知，二氧化碳在不同體積與壓力時所呈現的狀態"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>回憶 CO<sub>2</sub> 相圖的三相點、臨界點位置，並注意相圖的兩軸是壓力與溫度。</p>\n<ol>\n  <li>(A) 超臨界流體既非液態也非氣態，是單一流體相，錯誤。</li>\n  <li>(B) 50℃ 高於臨界溫度 31.1℃、100 大氣壓高於臨界壓力 73.8 大氣壓，兩者皆超過臨界點，呈超臨界流體，正確。</li>\n  <li>(C) 31.1℃、73.8 大氣壓是臨界點（氣、液共存的上限），不是三相點，此處無固相共存，錯誤。</li>\n  <li>(D) 相圖的坐標軸是壓力與溫度，與體積無關，錯誤。</li>\n</ol>\n<p class=\"ans\">答案：(B)</p>\n<p class=\"tip\">提醒：CO<sub>2</sub> 的三相點約在 5.2 大氣壓、−56.6℃，常溫常壓下會直接昇華，這也是乾冰的由來。</p>"
    },
    {
      "n": 20,
      "unit": "化學",
      "diff": 2,
      "answer": 0,
      "stem": "下列所列的自然界現象和人類活動中，哪一項不屬於碳循環？",
      "options": [
        "太陽能板發電",
        "燃燒化石燃料",
        "植物的光合作用",
        "石灰岩（石灰石）風化"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>碳循環指碳元素在大氣、生物、土壤與岩石之間的流動，與「是否涉及含碳物質的轉換」有關。</p>\n<ol>\n  <li>(A) 太陽能板發電是光能直接轉換為電能，過程中不涉及碳元素的轉換，不屬於碳循環，正確。</li>\n  <li>(B) 燃燒化石燃料把地下的碳以 CO<sub>2</sub> 釋回大氣，是碳循環的一環。</li>\n  <li>(C) 光合作用將大氣的 CO<sub>2</sub> 固定為有機物，是碳循環的關鍵步驟。</li>\n  <li>(D) 石灰岩風化會釋出或固定碳（形成碳酸氫根等），屬碳循環中的岩石圈途徑。</li>\n</ol>\n<p class=\"ans\">答案：(A)</p>\n<p class=\"tip\">提醒：判斷「是否屬某循環」的關鍵是有無該元素的化學形式轉換，而非有沒有用到能源。</p>"
    },
    {
      "n": 21,
      "unit": "化學",
      "diff": 2,
      "answer": 2,
      "stem": "石墨烯是單原子層薄膜，許多市售商品宣稱含有石墨烯的成分， 具有特殊的效能，下列有關石墨烯的敘述中，哪一項正確？",
      "options": [
        "是電的絕緣體",
        "不屬於奈米材料",
        "鑽石的同素異形體",
        "石墨烯中碳-碳原子間的結合皆為單鍵"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>石墨烯是碳的一種同素異形體，結構為單層 sp<sup>2</sup> 碳網，複習其導電性與奈米尺度。</p>\n<ol>\n  <li>(A) 石墨烯的 π 電子可在平面內自由移動，是優良導體，「電的絕緣體」錯誤。</li>\n  <li>(B) 石墨烯厚度僅一個原子層（約 1 nm 以下），正是典型的奈米材料，錯誤。</li>\n  <li>(C) 石墨烯與鑽石、石墨、富勒烯同為碳的同素異形體，正確。</li>\n  <li>(D) 石墨烯中每個碳與相鄰三個碳形成 sp<sup>2</sup> 鍵，平面內含部分雙鍵性質，並非「皆為單鍵」，錯誤。</li>\n</ol>\n<p class=\"ans\">答案：(C)</p>\n<p class=\"tip\">提醒：碳的同素異形體包括鑽石、石墨、石墨烯、奈米碳管、C<sub>60</sub>，性質差異來自「排列方式」。</p>"
    },
    {
      "n": 22,
      "unit": "化學",
      "diff": 2,
      "answer": 3,
      "stem": "下列何者是一氧化二氮( 2 N O)最穩定的路易斯(電子點)結構？ (原子序：N＝7，O＝8)",
      "options": [
        "<svg viewBox=\"0 0 150 70\" width=\"150\" height=\"70\" role=\"img\" aria-label=\"N等於N等於O（雙鍵）\"><text x=\"26\" y=\"48\" font-size=\"21\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#111\">N</text><text x=\"75\" y=\"48\" font-size=\"21\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#111\">N</text><text x=\"124\" y=\"48\" font-size=\"21\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#111\">O</text><line x1=\"37\" y1=\"36\" x2=\"64\" y2=\"36\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><line x1=\"37\" y1=\"44\" x2=\"64\" y2=\"44\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><line x1=\"86\" y1=\"36\" x2=\"113\" y2=\"36\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><line x1=\"86\" y1=\"44\" x2=\"113\" y2=\"44\" stroke=\"#1f2937\" stroke-width=\"1.6\"/></svg>",
        "<svg viewBox=\"0 0 150 70\" width=\"150\" height=\"70\" role=\"img\" aria-label=\"N參鍵N單鍵O，末端氧僅六個電子\"><text x=\"26\" y=\"48\" font-size=\"21\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#111\">N</text><text x=\"75\" y=\"48\" font-size=\"21\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#111\">N</text><text x=\"124\" y=\"48\" font-size=\"21\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#111\">O</text><line x1=\"37\" y1=\"33\" x2=\"64\" y2=\"33\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><line x1=\"37\" y1=\"40\" x2=\"64\" y2=\"40\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><line x1=\"37\" y1=\"47\" x2=\"64\" y2=\"47\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><line x1=\"86\" y1=\"40\" x2=\"113\" y2=\"40\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><text x=\"124\" y=\"62\" font-size=\"13\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#2563eb\">(O 僅 6 電子)</text></svg>",
        "<svg viewBox=\"0 0 150 70\" width=\"150\" height=\"70\" role=\"img\" aria-label=\"N單鍵N參鍵O，末端氮不符合八隅體\"><text x=\"26\" y=\"48\" font-size=\"21\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#111\">N</text><text x=\"75\" y=\"48\" font-size=\"21\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#111\">N</text><text x=\"124\" y=\"48\" font-size=\"21\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#111\">O</text><line x1=\"37\" y1=\"40\" x2=\"64\" y2=\"40\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><line x1=\"86\" y1=\"33\" x2=\"113\" y2=\"33\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><line x1=\"86\" y1=\"40\" x2=\"113\" y2=\"40\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><line x1=\"86\" y1=\"47\" x2=\"113\" y2=\"47\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><text x=\"124\" y=\"62\" font-size=\"13\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#2563eb\">(N 未滿八隅體)</text></svg>",
        "<svg viewBox=\"0 0 150 70\" width=\"150\" height=\"70\" role=\"img\" aria-label=\"N參鍵N正離子單鍵O負離子，全部符合八隅體\"><text x=\"26\" y=\"48\" font-size=\"21\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#111\">N</text><text x=\"75\" y=\"48\" font-size=\"21\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#111\">N</text><text x=\"124\" y=\"48\" font-size=\"21\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#111\">O</text><line x1=\"37\" y1=\"33\" x2=\"64\" y2=\"33\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><line x1=\"37\" y1=\"40\" x2=\"64\" y2=\"40\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><line x1=\"37\" y1=\"47\" x2=\"64\" y2=\"47\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><line x1=\"86\" y1=\"40\" x2=\"113\" y2=\"40\" stroke=\"#1f2937\" stroke-width=\"1.6\"/><text x=\"76\" y=\"25\" font-size=\"13\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#2563eb\">+</text><text x=\"125\" y=\"25\" font-size=\"13\" text-anchor=\"middle\" font-family=\"sans-serif\" fill=\"#2563eb\">−</text></svg>"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>N<sub>2</sub>O 的價電子總數為 2×5 ＋ 6 ＝ 16 個電子；好的路易士結構必須讓每個原子（尤其第二週期元素）都滿足八隅體。</p>\n<ol>\n  <li>(A) N＝N＝O 讓中央氮周圍有 8 個電子、末端氮卻只有 6 個電子，未滿足八隅體。</li>\n  <li>(B) N≡N−O 雖中央氮滿足八隅體，但末端氧只有 6 個電子（少一對孤對電子），未滿足八隅體。</li>\n  <li>(C) N−N≡O 使末端氮僅 6 個電子，未滿足八隅體。</li>\n  <li>(D) N≡N<sup>+</sup>−O<sup>−</sup>：中央氮以參鍵連端氮、單鍵連氧，三者皆滿足八隅體，且形式電荷總和為零，是最穩定結構，正確。</li>\n</ol>\n<p class=\"ans\">答案：(D)</p>\n<p class=\"tip\">提醒：第二週期元素（C、N、O、F）的路易士結構切記「八隅體優先」，若各結構都能滿足，再以形式電荷越接近 0 者越穩定。</p>"
    },
    {
      "n": 23,
      "unit": "化學",
      "diff": 2,
      "answer": 1,
      "stem": "有一未知的化合物只含有 C 和 H 二種元素，其分子量介於 41 和 45 之間。稱取 1.4 克該化合物，在充足氧氣存在下完全燃燒後，產生 4.4 克的 CO<sub>2</sub> 和 1.8 克的 H<sub>2</sub>O，下列何者是該化合物的分子式？（原子量：H＝1.0，C＝12.0，O＝16.0）",
      "options": [
        "C<sub>3</sub>H<sub>5</sub>",
        "C<sub>3</sub>H<sub>6</sub>",
        "C<sub>3</sub>H<sub>7</sub>",
        "C<sub>3</sub>H<sub>8</sub>"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>燃燒產物中的 C、H 全部來自原化合物，分別算出 C、H 的莫耳數求最簡式，再用分子量定出分子式。</p>\n<ol>\n  <li>C 的莫耳數＝4.4 ÷ 44.0 ＝ 0.10 mol（CO<sub>2</sub> 每莫耳含 1 mol C）。</li>\n  <li>H 的莫耳數＝1.8 ÷ 18.0 × 2 ＝ 0.20 mol（H<sub>2</sub>O 每莫耳含 2 mol H）。</li>\n  <li>C：H ＝ 0.10：0.20 ＝ 1：2，最簡式為 CH<sub>2</sub>，式量 14.0。</li>\n  <li>分子量介於 41～45，(CH<sub>2</sub>)<sub>n</sub> 中 n ＝ 42 ÷ 14 ＝ 3，分子式為 C<sub>3</sub>H<sub>6</sub>。</li>\n</ol>\n<p class=\"ans\">答案：(B)</p>\n<p class=\"tip\">提醒：看到「分子量介於某區間」通常就是提示你用最簡式去乘整數倍；C<sub>3</sub>H<sub>6</sub> 分子量 42，正好落在 41～45。</p>"
    },
    {
      "n": 24,
      "unit": "化學",
      "diff": 2,
      "answer": 3,
      "stem": "下列有關硬水的敘述中，何者正確？",
      "options": [
        "含有 Na<sup>+</sup> 或 K<sup>+</sup> 離子",
        "暫時硬水可用過濾法軟化",
        "永久硬水不能以離子交換樹脂軟化",
        "肥皂在硬水的清潔效能比在軟水低"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>硬水的定義是含較多 Ca<sup>2+</sup>、Mg<sup>2+</sup>；依「暫時／永久」與軟化方法逐項檢查。</p>\n<ol>\n  <li>(A) 硬水的主成分是 Ca<sup>2+</sup>、Mg<sup>2+</sup>，不是 Na<sup>+</sup>、K<sup>+</sup>，錯誤。</li>\n  <li>(B) 暫時硬水含 Ca(HCO<sub>3</sub>)<sub>2</sub>，需煮沸或加石灰、碳酸鈉使之沉澱，過濾無法除去溶解的離子，錯誤。</li>\n  <li>(C) 離子交換樹脂可置換出 Ca<sup>2+</sup>、Mg<sup>2+</sup>，正是永久硬水的軟化法，「不能」錯誤。</li>\n  <li>(D) 硬水中的 Ca<sup>2+</sup>、Mg<sup>2+</sup> 會與肥皂形成難溶皂垢，浪費肥皂且清潔力下降，正確。</li>\n</ol>\n<p class=\"ans\">答案：(D)</p>\n<p class=\"tip\">提醒：暫時硬水→煮沸或加鹼；永久硬水→離子交換樹脂或加碳酸鈉，兩者方法不同要記清楚。</p>"
    },
    {
      "n": 25,
      "unit": "化學",
      "diff": 2,
      "answer": 2,
      "stem": "有一染料溶液是混合物，將染料滴在TLC片的樣品點上，再把TLC 片放置於裝有乙醇為展開液的燒杯內，進行薄層層析法的實驗， 最後實驗所得到的TLC片，出現A和B位置不同顏色的色點。其中， A點與樣品點的距離大於B點與樣品點的距離。下列有關此實驗的 敘述中，哪一項正確？",
      "options": [
        "A點和B點位置中的成分，皆為純物質",
        "若改以丙酮為展開液，A和B色點的位置不變",
        "將TLC片放置於展開液中，樣品點必須高於液面",
        "A點的成分與TLC片之吸引力大於B點的成分與TLC片之吸引力"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>薄層層析（TLC）以「吸附力」與「展開液溶解度」的競爭決定斑點高低；跑得越遠者與 TLC 吸附力越小。</p>\n<ol>\n  <li>(A) A、B 是混合物分離出的兩個色點，各點可能仍含多種成分，無法據此判定為純物質。</li>\n  <li>(B) 改用丙酮為展開液會改變極性與溶解特性，R<sub>f</sub> 值隨之改變，色點位置不會不變。</li>\n  <li>(C) 樣品點必須高於展開液液面，否則樣品會直接溶入展開液中而無法層析，正確。</li>\n  <li>(D) A 點離樣品點較遠（跑得較快），表示 A 與 TLC 的吸附力「較小」，敘述說「較大」錯誤。</li>\n</ol>\n<p class=\"ans\">答案：(C)</p>\n<p class=\"tip\">提醒：TLC 中「跑得快＝吸附弱、在展開液中溶解度佳」；此與濾紙／管柱層析的判讀邏輯一致。</p>"
    }
  ]
};
