/* =============================================================================
   題庫資料檔：英文（assets/js/data/english.js）
   -----------------------------------------------------------------------------
   本檔由索引檔（assets/js/subjects.js）中該科 data 欄位指向；
   站台引擎會在需要時自動以 <script> 載入，掛到 window.EXAM_BANKS["english"]。
   欄位：id / name / source / note / questions[]
     questions[] 每題：n 題號、unit 單元、diff 難度 1-3、answer 正解索引(0=A)、
                      stem 題幹(HTML)、options 選項(HTML)、sol 詳解(HTML)
   ============================================================================= */
window.EXAM_BANKS = window.EXAM_BANKS || {};
window.EXAM_BANKS["english"] =
{
  "id": "english",
  "name": "英文",
  "source": "115 學年度身心障礙學生升學大專校院甄試・英文（官方 25 題單選）",
  "note": "題型：詞彙 1-10、綜合測驗 11-20（園藝與健康／古代航海）、閱讀測驗 21-25（囚徒困境）。詳解依官方答案撰寫，附中文字義與解題線索。",
  "questions": [
    {
      "n": 1,
      "unit": "詞彙・動詞搭配",
      "diff": 1,
      "answer": 3,
      "stem": "The email that you send will ______ back if the address is incorrect.",
      "options": [
        "transfer",
        "grasp",
        "attach",
        "bounce"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>空格後面有 <b>back</b>，而且情境是「地址錯 → 信件被退回」，要選能和 back 搭配、且方向是「彈回來」的動詞。</p>\n<ol>\n  <li>transfer 轉移、轉帳：信件被「轉移」，句意不通。</li>\n  <li>grasp 抓住：郵件不會被抓住。</li>\n  <li>attach 附加：attach 是「把檔案附在信上」，方向相反。</li>\n  <li><b>bounce back</b> 彈回、退回 → 正是電子郵件被退回的固定用法。</li>\n</ol>\n<p class=\"ans\">答案：(D) bounce</p>"
    },
    {
      "n": 2,
      "unit": "詞彙・名詞",
      "diff": 1,
      "answer": 0,
      "stem": "Jenny paused for a moment in ______ before answering the difficult question.",
      "options": [
        "hesitation",
        "harmony",
        "leisure",
        "volume"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>paused（停頓）＋ difficult question（難題）→ 說話前「遲疑一下」。</p>\n<ol>\n  <li><b>in hesitation</b> 猶豫地、遲疑地：pause in hesitation 是常見搭配。</li>\n  <li>harmony 和諧（in harmony with…）。</li>\n  <li>leisure 閒暇（at leisure 悠閒地）。</li>\n  <li>volume 音量、體積，與語意無關。</li>\n</ol>\n<p class=\"ans\">答案：(A) hesitation</p>"
    },
    {
      "n": 3,
      "unit": "詞彙・形容詞",
      "diff": 2,
      "answer": 1,
      "stem": "Mr. Lin has some ______ plans for his new coffee business. More than ten chain stores are scheduled to open next month.",
      "options": [
        "durable",
        "ambitious",
        "fluent",
        "circular"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>先看第二句線索——「下個月要開超過十家連鎖店」，可見計畫規模很大、野心勃勃。</p>\n<ol>\n  <li><b>ambitious</b> 雄心勃勃的 → ambitious plans 宏大（有野心）的計畫。</li>\n  <li>durable 耐用的（指物品）。</li>\n  <li>fluent 流利的（指語言）。</li>\n  <li>circular 圓形的、循環的。</li>\n</ol>\n<p class=\"ans\">答案：(B) ambitious</p>"
    },
    {
      "n": 4,
      "unit": "詞彙・動詞",
      "diff": 1,
      "answer": 1,
      "stem": "Students in this school are encouraged to ______ the Internet for study purposes in the science class.",
      "options": [
        "dismiss",
        "access",
        "encounter",
        "target"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>「為了學習目的 ______ 網際網路」→ 需要表達「使用、連上」網路的及物動詞。</p>\n<ol>\n  <li><b>access</b> 使用、取用（access the Internet 是固定搭配，access 直接接受詞）。</li>\n  <li>dismiss 解散、駁回（dismiss the class 下課）。</li>\n  <li>encounter 遭遇（遇到困難、問題）。</li>\n  <li>target 以…為目標、針對。</li>\n</ol>\n<p class=\"ans\">答案：(B) access</p>"
    },
    {
      "n": 5,
      "unit": "詞彙・形容詞",
      "diff": 2,
      "answer": 2,
      "stem": "Rise of property values in Taiwan has been so ______ that many people cannot afford housing.",
      "options": [
        "fragile",
        "pessimistic",
        "dramatic",
        "fashionable"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>so + 形容詞 + that…（如此…以致於）。後半句「很多人買不起房」→ 漲幅「很大、很劇烈」。</p>\n<ol>\n  <li><b>dramatic</b> 在此指「幅度劇烈的」（a dramatic rise 大幅上升），不是中文的戲劇性而已。</li>\n  <li>fragile 脆弱的（房價不是脆弱）。</li>\n  <li>pessimistic 悲觀的（用來形容人）。</li>\n  <li>fashionable 時尚的。</li>\n</ol>\n<p class=\"ans\">答案：(C) dramatic</p>"
    },
    {
      "n": 6,
      "unit": "詞彙・名詞",
      "diff": 1,
      "answer": 3,
      "stem": "More than 70,000 people have been killed in the Gaza War since 2023. It's a big human ______.",
      "options": [
        "protest",
        "suicide",
        "caution",
        "tragedy"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>線索是「七萬多人喪生」——這是人類的災難、悲劇。</p>\n<ol>\n  <li><b>tragedy</b> 悲劇、慘劇 → a human tragedy 人類悲劇。</li>\n  <li>protest 抗議（是「行動」，不是結果）。</li>\n  <li>suicide 自殺（指個人行為）。</li>\n  <li>caution 謹慎、警告。</li>\n</ol>\n<p class=\"ans\">答案：(D) tragedy</p>"
    },
    {
      "n": 7,
      "unit": "詞彙・分詞",
      "diff": 2,
      "answer": 1,
      "stem": "The U.S. state of Maine experienced severe winter storms ______ by low temperatures, strong winds, and significant snowfall.",
      "options": [
        "monitored",
        "characterized",
        "frustrated",
        "justified"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>空格後 by 引出「低溫、強風、大雪」等特徵 → 需要「以…為特徵」的被動分詞片語。</p>\n<ol>\n  <li><b>be characterized by</b> 以…為特徵 → storms characterized by… 具有這些特徵的暴風雪。</li>\n  <li>monitored by 被…監測（語意不合，暴風雪不是被監測的對象）。</li>\n  <li>frustrated 感到挫折的（修飾人）。</li>\n  <li>justified by 被…證明為正當。</li>\n</ol>\n<p class=\"ans\">答案：(B) characterized</p>"
    },
    {
      "n": 8,
      "unit": "詞彙・形容詞",
      "diff": 1,
      "answer": 2,
      "stem": "Chen Ning Yang, a ______ researcher in physics, was awarded the Nobel Prize in 1957.",
      "options": [
        "consistent",
        "definite",
        "prominent",
        "genetic"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>同位語在說明楊振寧，線索是「1957 年獲諾貝爾獎」→ 他是「卓越、知名」的物理研究者。</p>\n<ol>\n  <li><b>prominent</b> 卓越的、著名的（a prominent researcher 知名研究者）。</li>\n  <li>consistent 前後一致的。</li>\n  <li>definite 明確的。</li>\n  <li>genetic 基因（學）的。</li>\n</ol>\n<p class=\"ans\">答案：(C) prominent</p>"
    },
    {
      "n": 9,
      "unit": "詞彙・慣用語",
      "diff": 1,
      "answer": 0,
      "stem": "Suffering from stage ______, Steve always feels a panic and forgets his lines in front of an audience.",
      "options": [
        "fright",
        "presence",
        "suspicion",
        "crash"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>後半句是關鍵——「在觀眾面前感到恐慌、忘詞」＝怯場。</p>\n<ol>\n  <li><b>stage fright</b> 怯場（固定搭配），fright 指突然的恐懼。</li>\n  <li>stage presence 舞台魅力（正面詞，與 panic 相反）。</li>\n  <li>suspicion 懷疑。</li>\n  <li>crash 碰撞、崩潰。</li>\n</ol>\n<p class=\"ans\">答案：(A) fright</p>"
    },
    {
      "n": 10,
      "unit": "詞彙・副詞",
      "diff": 2,
      "answer": 1,
      "stem": "Attracted by the interesting new group project, the students started ______, but they soon got bored and lost interest.",
      "options": [
        "apparently",
        "enthusiastically",
        "identically",
        "moderately"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>but 前後對比：一開始很投入 → 後來卻覺得無聊。空格要修飾「怎麼開始的」。</p>\n<ol>\n  <li><b>enthusiastically</b> 熱烈地、興致勃勃地（started enthusiastically 興致高昂地開始）。</li>\n  <li>apparently 顯然地（表推測，不表態度）。</li>\n  <li>identically 完全相同地。</li>\n  <li>moderately 適度地、溫和地（語氣太弱，無法與 got bored 形成對比）。</li>\n</ol>\n<p class=\"ans\">答案：(B) enthusiastically</p>"
    },
    {
      "n": 11,
      "unit": "綜合測驗・轉折詞",
      "diff": 2,
      "answer": 2,
      "stem": "It's common knowledge that exercise is good for you. ______ less known is the role that gardening can play in helping to keep you fit and healthy.",
      "options": [
        "Then",
        "Even",
        "But",
        "As"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>前句「大家都知道運動有益」，後句「比較少人知道園藝也有益」——兩句是<b>對比轉折</b>。</p>\n<ol>\n  <li><b>But</b> 用於對比：大家都知道 A，<b>但</b> B 就少人知道了（此處後句倒裝 less known is…）。</li>\n  <li>Then 表時間順序（先…然後…），此處無時間先後。</li>\n  <li>Even 是副詞「甚至」，無法單獨承接這種對比句構。</li>\n  <li>As 表原因或「當…時」，邏輯不通。</li>\n</ol>\n<p class=\"ans\">答案：(C) But</p>"
    },
    {
      "n": 12,
      "unit": "綜合測驗・片語",
      "diff": 2,
      "answer": 3,
      "stem": "Gardeners might be delighted to learn that the number of calories burned from 30 minutes of gardening is ______ playing badminton or practicing yoga.",
      "options": [
        "turned into",
        "prior to",
        "counting on",
        "comparable to"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>句子在比較「園藝 30 分鐘消耗的熱量」和「打羽球、做瑜伽」——需要表示「可相比擬」的片語。</p>\n<ol>\n  <li><b>be comparable to</b> 可與…相比（數量相當）→ 完全符合比較語意。</li>\n  <li>turned into 變成（把 A 換成 B，不表比較）。</li>\n  <li>prior to 在…之前（表時間）。</li>\n  <li>counting on 依賴、指望。</li>\n</ol>\n<p class=\"ans\">答案：(D) comparable to</p>"
    },
    {
      "n": 13,
      "unit": "綜合測驗・片語",
      "diff": 2,
      "answer": 3,
      "stem": "…gardeners are more likely to include food produce ______ their diets.",
      "options": [
        "in case of",
        "on account of",
        "at risk of",
        "as part of"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>include A ______ B 的句型，要表達「把農產品納入飲食<b>的一部分</b>」。</p>\n<ol>\n  <li><b>as part of</b> 作為…的一部分 → include food produce as part of their diets。</li>\n  <li>in case of 以防、萬一（表條件防備）。</li>\n  <li>on account of 因為（表原因）。</li>\n  <li>at risk of 有…的風險。</li>\n</ol>\n<p class=\"ans\">答案：(D) as part of</p>"
    },
    {
      "n": 14,
      "unit": "綜合測驗・代名詞",
      "diff": 3,
      "answer": 0,
      "stem": "______, such as lavenders for mild depression and gingers for headaches, have been embraced by people today.",
      "options": [
        "Some",
        "Both",
        "Others",
        "None"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>看空格後的動詞 <b>have</b>（複數）與 such as 列舉的「薰衣草、薑」——主詞是一些（複數）植物。</p>\n<ol>\n  <li><b>Some</b> 一些（Some …, such as …, have been embraced…）語法與語意皆合。</li>\n  <li>Both 只能指「兩者」，後面卻列了三類以上的例子。</li>\n  <li>Others 必須和前文出現的 some 對照使用，本句找不到對照組。</li>\n  <li>None 語意相反（後面說它們被現代人採用）。</li>\n</ol>\n<p class=\"ans\">答案：(A) Some</p>"
    },
    {
      "n": 15,
      "unit": "綜合測驗・名詞",
      "diff": 3,
      "answer": 0,
      "stem": "…those who garden every day have wellbeing ______ 6.6% higher and stress levels 4.2% lower than people who do not garden at all.",
      "options": [
        "scores",
        "triggers",
        "increases",
        "records"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>句型是 have + 名詞 + 形容詞（比較級）：wellbeing ______ 6.6% higher＝幸福感的分數高出 6.6%。</p>\n<ol>\n  <li><b>scores</b> 分數、指數 → wellbeing scores 幸福感分數，可被 higher 修飾。</li>\n  <li>triggers 觸發因素（不能說 6.6% higher）。</li>\n  <li>increases 增加量（與 higher 語意重複）。</li>\n  <li>records 紀錄、唱片（不合語意）。</li>\n</ol>\n<p class=\"ans\">答案：(A) scores</p>"
    },
    {
      "n": 16,
      "unit": "綜合測驗・動詞",
      "diff": 2,
      "answer": 1,
      "stem": "From using stars and other natural landmarks to ______ the position of their ships, to modern technology such as GPS…",
      "options": [
        "create",
        "determine",
        "enlarge",
        "isolate"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>導航的第一件事就是「知道自己在哪裡」——用星星與地標來<b>判定</b>船的位置。</p>\n<ol>\n  <li><b>determine</b> 判定、確定 → determine the position 確定位置。</li>\n  <li>create 創造（位置不是創造出來的）。</li>\n  <li>enlarge 放大（與位置無關）。</li>\n  <li>isolate 隔離。</li>\n</ol>\n<p class=\"ans\">答案：(B) determine</p>"
    },
    {
      "n": 17,
      "unit": "綜合測驗・名詞",
      "diff": 1,
      "answer": 1,
      "stem": "…using the stars, feeling the ______ of currents, observing seabirds and cloud formation to find new islands.",
      "options": [
        "vision",
        "flow",
        "line",
        "match"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>動詞是 feeling（感覺）＋ of currents（海流）→ 感覺海流的<b>流動</b>。</p>\n<ol>\n  <li><b>flow</b> 流動 → the flow of currents 海流的流動。</li>\n  <li>vision 視力、願景（不能用 feel 感覺）。</li>\n  <li>line 線、隊伍。</li>\n  <li>match 比賽、相配（為動詞或名詞，語意不合）。</li>\n</ol>\n<p class=\"ans\">答案：(B) flow</p>"
    },
    {
      "n": 18,
      "unit": "綜合測驗・關係子句",
      "diff": 3,
      "answer": 2,
      "stem": "Over time, an insightful view was developed of the natural world, ______ allowed them to navigate thousands of miles.",
      "options": [
        "that",
        "where",
        "which",
        "thus"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>逗號後要能接子句、且先行詞是「前面整件事（對自然界的洞察）」→ 用關係代名詞 which 的補述用法。</p>\n<ol>\n  <li><b>which</b> 可指前面的整個句子（補述用法，逗號後單獨引導子句）。</li>\n  <li>that 不能用在逗號後的補述關係子句。</li>\n  <li>where 只能指地方。</li>\n  <li>thus 是副詞（因此），無法當主詞連接子句。</li>\n</ol>\n<p class=\"ans\">答案：(C) which</p>"
    },
    {
      "n": 19,
      "unit": "綜合測驗・形容詞",
      "diff": 2,
      "answer": 0,
      "stem": "It was a directional tool that made navigation ______ even when weather and visibility was poor.",
      "options": [
        "possible",
        "intensive",
        "regular",
        "noticeable"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>make + 受詞 + 形容詞（使…變得…）。指南針的價值在於「即使天候差、視線不良，也能航行」→ 使航行成為<b>可能</b>。</p>\n<ol>\n  <li><b>possible</b> 可能的 → made navigation possible 使航行變得可行。</li>\n  <li>intensive 密集的、加強的。</li>\n  <li>regular 規律的。</li>\n  <li>noticeable 明顯的。</li>\n</ol>\n<p class=\"ans\">答案：(A) possible</p>"
    },
    {
      "n": 20,
      "unit": "綜合測驗・動詞",
      "diff": 3,
      "answer": 3,
      "stem": "…allowing sailors to plan their journey and to ______ their intended route.",
      "options": [
        "recite",
        "guard",
        "contribute",
        "visualize"
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>plan their journey and to ______ their intended route 是並列動作：規劃行程、並在腦中<b>預想</b>預計走的路線。</p>\n<ol>\n  <li><b>visualize</b> 想像、在心中構思（visualize their intended route）。</li>\n  <li>recite 背誦（背誦路線不合語意）。</li>\n  <li>guard 守衛。</li>\n  <li>contribute 貢獻（需加 to，且語意不合）。</li>\n</ol>\n<p class=\"ans\">答案：(D) visualize</p>"
    },
    {
      "n": 21,
      "unit": "閱讀測驗・主旨",
      "diff": 2,
      "answer": 2,
      "stem": "Which of the following states the purpose of the passage?",
      "options": [
        "To predict criminals' behavior.",
        "To show the way of self-protection.",
        "To explain the difficulty of achieving collaboration.",
        "To demonstrate the use of strategies to win a lawsuit."
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>主旨題要看「全文都在講什麼」。全文用囚徒困境說明：合作對雙方都好，但個人自利會導致互相背叛，最後延伸到氣候談判也難以合作。</p>\n<ol>\n  <li>文章不是要預測犯罪者的行為，囚徒只是「舉例」。</li>\n  <li>也不是教人自我保護。</li>\n  <li><b>解釋「合作（協力）為何難以達成」</b>＝全文主軸，最後一段各國減排的例子更證實此點。</li>\n  <li>與訴訟策略無關。</li>\n</ol>\n<p class=\"ans\">答案：(C) To explain the difficulty of achieving collaboration.</p>"
    },
    {
      "n": 22,
      "unit": "閱讀測驗・字義",
      "diff": 3,
      "answer": 3,
      "stem": "What does the phrase \"the same way\" mean in the first paragraph?",
      "options": [
        "Pleasing the other.",
        "Resolving the dilemma.",
        "Seeking the common good.",
        "Serving one's own interests."
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>回到第一段找原句：when two individuals act <b>in their own self-interest</b>, they would both experience worse outcomes due to the other behaving <b>in the same way</b>.</p>\n<ol>\n  <li>the same way 就是前文剛出現的 in their own self-interest（追求自身利益）。</li>\n  <li>Pleasing the other 取悅對方 → 與原文相反。</li>\n  <li>Resolving the dilemma 解決困境 → 不是「方式」的意思。</li>\n  <li>Seeking the common good 追求共同利益 → 與原文相反。</li>\n  <li><b>Serving one's own interests</b> 追求自己的利益 → 正確。</li>\n</ol>\n<p class=\"ans\">答案：(D) Serving one's own interests.</p>"
    },
    {
      "n": 23,
      "unit": "閱讀測驗・細節",
      "diff": 2,
      "answer": 2,
      "stem": "According to the example mentioned in the passage, what would the prisoners most probably get?",
      "options": [
        "One being sentenced one year and the other five years.",
        "One being set free and the other sentenced ten years.",
        "Both being put in jail for five years.",
        "Both being sentenced one year."
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>注意題目問的是 most probably（最可能），不是最好。文章說：最好的結果是雙方合作各判一年，但「他們更可能背叛對方」。</p>\n<ol>\n  <li>雙方都背叛 → 依據文章第 3 種結果，各判<b>五年</b>。</li>\n  <li>一方獲釋、一方十年：是「一方背叛、一方沉默」，但因為彼此不知道對方選擇，通常不會發生。</li>\n  <li>各判一年是「最理想」但不是「最可能」。</li>\n</ol>\n<p class=\"ans\">答案：(C) Both being put in jail for five years.</p>"
    },
    {
      "n": 24,
      "unit": "閱讀測驗・推論",
      "diff": 3,
      "answer": 0,
      "stem": "What light does the prisoner's dilemma shed on climate talks in the last paragraph?",
      "options": [
        "The necessity of cooperation for decreasing greenhouse gases.",
        "The risk of disclosing damages caused by climate change.",
        "The benefit of solving problems through negotiation.",
        "The need of regulations to protect the environment."
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>末段引用數學家 Peter Wood 的話：每個國家都想要全球減排，卻寧願「由別人承擔」→ 只有各國共同合作才能得到長期利益，也就是<b>減排必須合作</b>。</p>\n<ol>\n  <li>文中沒提「揭露氣候損害的風險」。</li>\n  <li>文章反而說多數協商無法持續（there are always short-term economic benefits for a country to break agreements），所以不是強調協商已帶來好處。</li>\n  <li>「需要法規」文中未提。</li>\n</ol>\n<p class=\"ans\">答案：(A) The necessity of cooperation for decreasing greenhouse gases.</p>"
    },
    {
      "n": 25,
      "unit": "閱讀測驗・指涉",
      "diff": 2,
      "answer": 1,
      "stem": "What does \"the burden\" in the last paragraph refer to?",
      "options": [
        "The shared financial costs.",
        "The reduction of gas emissions.",
        "The pursuit of economic growth.",
        "The work of conserving natural resources."
      ],
      "sol": "<p class=\"lead\"><b>關鍵想法：</b>找 the burden 的上一句：\"every country wants global emission reductions, but would prefer that someone else take on the burden.\"</p>\n<ol>\n  <li>各國都想要「全球減排」，但希望別人來承擔這個重擔 → <b>the burden＝減少溫室氣體排放</b>。</li>\n  <li>財務成本、經濟成長、保育自然資源都不是該句所指。</li>\n</ol>\n<p class=\"ans\">答案：(B) The reduction of gas emissions.</p>"
    }
  ]
};
