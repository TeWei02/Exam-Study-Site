/* =============================================================================
   安靜精讀版資料檔：英文（english-quiet.js）
   -----------------------------------------------------------------------------
   由 tools/gen_quiet.py 自動產生，請勿手改（重跑即會覆蓋）。
   資料來源：assets/js/data/english.js 的既有詳解，僅重排為「五步精讀」結構，
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
window.EXAM_QUIET["english"] =
{
  "id": "english",
  "name": "英文",
  "yearLabel": "115 學年度",
  "exam": "身心障礙學生升學大專校院甄試",
  "source": "115 學年度身心障礙學生升學大專校院甄試・英文（官方 25 題單選）",
  "note": "安靜精讀版：內容取自原本詳解，改為「一次一步」的閱讀順序；無動畫、無語音、無自動播放。",
  "stepNames": [
    "讀題",
    "關鍵想法",
    "逐步解",
    "對答案",
    "記題型"
  ],
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>空格後面有 <b>back</b>，而且情境是「地址錯 → 信件被退回」，要選能和 back 搭配、且方向是「彈回來」的動詞。</p>",
      "steps": [
        {
          "t": "",
          "h": "transfer 轉移、轉帳：信件被「轉移」，句意不通。"
        },
        {
          "t": "",
          "h": "grasp 抓住：郵件不會被抓住。"
        },
        {
          "t": "",
          "h": "attach 附加：attach 是「把檔案附在信上」，方向相反。"
        },
        {
          "t": "bounce back",
          "h": "<b>bounce back</b> 彈回、退回 → 正是電子郵件被退回的固定用法。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(D) bounce</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>paused（停頓）＋ difficult question（難題）→ 說話前「遲疑一下」。</p>",
      "steps": [
        {
          "t": "in hesitation",
          "h": "<b>in hesitation</b> 猶豫地、遲疑地：pause in hesitation 是常見搭配。"
        },
        {
          "t": "",
          "h": "harmony 和諧（in harmony with…）。"
        },
        {
          "t": "",
          "h": "leisure 閒暇（at leisure 悠閒地）。"
        },
        {
          "t": "",
          "h": "volume 音量、體積，與語意無關。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(A) hesitation</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>先看第二句線索——「下個月要開超過十家連鎖店」，可見計畫規模很大、野心勃勃。</p>",
      "steps": [
        {
          "t": "ambitious",
          "h": "<b>ambitious</b> 雄心勃勃的 → ambitious plans 宏大（有野心）的計畫。"
        },
        {
          "t": "",
          "h": "durable 耐用的（指物品）。"
        },
        {
          "t": "",
          "h": "fluent 流利的（指語言）。"
        },
        {
          "t": "",
          "h": "circular 圓形的、循環的。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(B) ambitious</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>「為了學習目的 ______ 網際網路」→ 需要表達「使用、連上」網路的及物動詞。</p>",
      "steps": [
        {
          "t": "access",
          "h": "<b>access</b> 使用、取用（access the Internet 是固定搭配，access 直接接受詞）。"
        },
        {
          "t": "",
          "h": "dismiss 解散、駁回（dismiss the class 下課）。"
        },
        {
          "t": "",
          "h": "encounter 遭遇（遇到困難、問題）。"
        },
        {
          "t": "",
          "h": "target 以…為目標、針對。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(B) access</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>so + 形容詞 + that…（如此…以致於）。後半句「很多人買不起房」→ 漲幅「很大、很劇烈」。</p>",
      "steps": [
        {
          "t": "dramatic",
          "h": "<b>dramatic</b> 在此指「幅度劇烈的」（a dramatic rise 大幅上升），不是中文的戲劇性而已。"
        },
        {
          "t": "",
          "h": "fragile 脆弱的（房價不是脆弱）。"
        },
        {
          "t": "",
          "h": "pessimistic 悲觀的（用來形容人）。"
        },
        {
          "t": "",
          "h": "fashionable 時尚的。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(C) dramatic</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>線索是「七萬多人喪生」——這是人類的災難、悲劇。</p>",
      "steps": [
        {
          "t": "tragedy",
          "h": "<b>tragedy</b> 悲劇、慘劇 → a human tragedy 人類悲劇。"
        },
        {
          "t": "",
          "h": "protest 抗議（是「行動」，不是結果）。"
        },
        {
          "t": "",
          "h": "suicide 自殺（指個人行為）。"
        },
        {
          "t": "",
          "h": "caution 謹慎、警告。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(D) tragedy</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>空格後 by 引出「低溫、強風、大雪」等特徵 → 需要「以…為特徵」的被動分詞片語。</p>",
      "steps": [
        {
          "t": "be characterized by",
          "h": "<b>be characterized by</b> 以…為特徵 → storms characterized by… 具有這些特徵的暴風雪。"
        },
        {
          "t": "",
          "h": "monitored by 被…監測（語意不合，暴風雪不是被監測的對象）。"
        },
        {
          "t": "",
          "h": "frustrated 感到挫折的（修飾人）。"
        },
        {
          "t": "",
          "h": "justified by 被…證明為正當。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(B) characterized</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>同位語在說明楊振寧，線索是「1957 年獲諾貝爾獎」→ 他是「卓越、知名」的物理研究者。</p>",
      "steps": [
        {
          "t": "prominent",
          "h": "<b>prominent</b> 卓越的、著名的（a prominent researcher 知名研究者）。"
        },
        {
          "t": "",
          "h": "consistent 前後一致的。"
        },
        {
          "t": "",
          "h": "definite 明確的。"
        },
        {
          "t": "",
          "h": "genetic 基因（學）的。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(C) prominent</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>後半句是關鍵——「在觀眾面前感到恐慌、忘詞」＝怯場。</p>",
      "steps": [
        {
          "t": "stage fright",
          "h": "<b>stage fright</b> 怯場（固定搭配），fright 指突然的恐懼。"
        },
        {
          "t": "",
          "h": "stage presence 舞台魅力（正面詞，與 panic 相反）。"
        },
        {
          "t": "",
          "h": "suspicion 懷疑。"
        },
        {
          "t": "",
          "h": "crash 碰撞、崩潰。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(A) fright</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>but 前後對比：一開始很投入 → 後來卻覺得無聊。空格要修飾「怎麼開始的」。</p>",
      "steps": [
        {
          "t": "enthusiastically",
          "h": "<b>enthusiastically</b> 熱烈地、興致勃勃地（started enthusiastically 興致高昂地開始）。"
        },
        {
          "t": "",
          "h": "apparently 顯然地（表推測，不表態度）。"
        },
        {
          "t": "",
          "h": "identically 完全相同地。"
        },
        {
          "t": "",
          "h": "moderately 適度地、溫和地（語氣太弱，無法與 got bored 形成對比）。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(B) enthusiastically</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>前句「大家都知道運動有益」，後句「比較少人知道園藝也有益」——兩句是<b>對比轉折</b>。</p>",
      "steps": [
        {
          "t": "But",
          "h": "<b>But</b> 用於對比：大家都知道 A，<b>但</b> B 就少人知道了（此處後句倒裝 less known is…）。"
        },
        {
          "t": "",
          "h": "Then 表時間順序（先…然後…），此處無時間先後。"
        },
        {
          "t": "",
          "h": "Even 是副詞「甚至」，無法單獨承接這種對比句構。"
        },
        {
          "t": "",
          "h": "As 表原因或「當…時」，邏輯不通。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(C) But</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>句子在比較「園藝 30 分鐘消耗的熱量」和「打羽球、做瑜伽」——需要表示「可相比擬」的片語。</p>",
      "steps": [
        {
          "t": "be comparable to",
          "h": "<b>be comparable to</b> 可與…相比（數量相當）→ 完全符合比較語意。"
        },
        {
          "t": "",
          "h": "turned into 變成（把 A 換成 B，不表比較）。"
        },
        {
          "t": "",
          "h": "prior to 在…之前（表時間）。"
        },
        {
          "t": "",
          "h": "counting on 依賴、指望。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(D) comparable to</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>include A ______ B 的句型，要表達「把農產品納入飲食<b>的一部分</b>」。</p>",
      "steps": [
        {
          "t": "as part of",
          "h": "<b>as part of</b> 作為…的一部分 → include food produce as part of their diets。"
        },
        {
          "t": "",
          "h": "in case of 以防、萬一（表條件防備）。"
        },
        {
          "t": "",
          "h": "on account of 因為（表原因）。"
        },
        {
          "t": "",
          "h": "at risk of 有…的風險。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(D) as part of</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>看空格後的動詞 <b>have</b>（複數）與 such as 列舉的「薰衣草、薑」——主詞是一些（複數）植物。</p>",
      "steps": [
        {
          "t": "Some",
          "h": "<b>Some</b> 一些（Some …, such as …, have been embraced…）語法與語意皆合。"
        },
        {
          "t": "",
          "h": "Both 只能指「兩者」，後面卻列了三類以上的例子。"
        },
        {
          "t": "",
          "h": "Others 必須和前文出現的 some 對照使用，本句找不到對照組。"
        },
        {
          "t": "",
          "h": "None 語意相反（後面說它們被現代人採用）。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(A) Some</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>句型是 have + 名詞 + 形容詞（比較級）：wellbeing ______ 6.6% higher＝幸福感的分數高出 6.6%。</p>",
      "steps": [
        {
          "t": "scores",
          "h": "<b>scores</b> 分數、指數 → wellbeing scores 幸福感分數，可被 higher 修飾。"
        },
        {
          "t": "",
          "h": "triggers 觸發因素（不能說 6.6% higher）。"
        },
        {
          "t": "",
          "h": "increases 增加量（與 higher 語意重複）。"
        },
        {
          "t": "",
          "h": "records 紀錄、唱片（不合語意）。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(A) scores</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>導航的第一件事就是「知道自己在哪裡」——用星星與地標來<b>判定</b>船的位置。</p>",
      "steps": [
        {
          "t": "determine",
          "h": "<b>determine</b> 判定、確定 → determine the position 確定位置。"
        },
        {
          "t": "",
          "h": "create 創造（位置不是創造出來的）。"
        },
        {
          "t": "",
          "h": "enlarge 放大（與位置無關）。"
        },
        {
          "t": "",
          "h": "isolate 隔離。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(B) determine</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>動詞是 feeling（感覺）＋ of currents（海流）→ 感覺海流的<b>流動</b>。</p>",
      "steps": [
        {
          "t": "flow",
          "h": "<b>flow</b> 流動 → the flow of currents 海流的流動。"
        },
        {
          "t": "",
          "h": "vision 視力、願景（不能用 feel 感覺）。"
        },
        {
          "t": "",
          "h": "line 線、隊伍。"
        },
        {
          "t": "",
          "h": "match 比賽、相配（為動詞或名詞，語意不合）。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(B) flow</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>逗號後要能接子句、且先行詞是「前面整件事（對自然界的洞察）」→ 用關係代名詞 which 的補述用法。</p>",
      "steps": [
        {
          "t": "which",
          "h": "<b>which</b> 可指前面的整個句子（補述用法，逗號後單獨引導子句）。"
        },
        {
          "t": "",
          "h": "that 不能用在逗號後的補述關係子句。"
        },
        {
          "t": "",
          "h": "where 只能指地方。"
        },
        {
          "t": "",
          "h": "thus 是副詞（因此），無法當主詞連接子句。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(C) which</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>make + 受詞 + 形容詞（使…變得…）。指南針的價值在於「即使天候差、視線不良，也能航行」→ 使航行成為<b>可能</b>。</p>",
      "steps": [
        {
          "t": "possible",
          "h": "<b>possible</b> 可能的 → made navigation possible 使航行變得可行。"
        },
        {
          "t": "",
          "h": "intensive 密集的、加強的。"
        },
        {
          "t": "",
          "h": "regular 規律的。"
        },
        {
          "t": "",
          "h": "noticeable 明顯的。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(A) possible</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>plan their journey and to ______ their intended route 是並列動作：規劃行程、並在腦中<b>預想</b>預計走的路線。</p>",
      "steps": [
        {
          "t": "visualize",
          "h": "<b>visualize</b> 想像、在心中構思（visualize their intended route）。"
        },
        {
          "t": "",
          "h": "recite 背誦（背誦路線不合語意）。"
        },
        {
          "t": "",
          "h": "guard 守衛。"
        },
        {
          "t": "",
          "h": "contribute 貢獻（需加 to，且語意不合）。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(D) visualize</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>主旨題要看「全文都在講什麼」。全文用囚徒困境說明：合作對雙方都好，但個人自利會導致互相背叛，最後延伸到氣候談判也難以合作。</p>",
      "steps": [
        {
          "t": "",
          "h": "文章不是要預測犯罪者的行為，囚徒只是「舉例」。"
        },
        {
          "t": "",
          "h": "也不是教人自我保護。"
        },
        {
          "t": "解釋「合作（協力）為何難以達成」",
          "h": "<b>解釋「合作（協力）為何難以達成」</b>＝全文主軸，最後一段各國減排的例子更證實此點。"
        },
        {
          "t": "",
          "h": "與訴訟策略無關。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(C) To explain the difficulty of achieving collaboration.</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>回到第一段找原句：when two individuals act <b>in their own self-interest</b>, they would both experience worse outcomes due to the other behaving <b>in the same way</b>.</p>",
      "steps": [
        {
          "t": "",
          "h": "the same way 就是前文剛出現的 in their own self-interest（追求自身利益）。"
        },
        {
          "t": "",
          "h": "Pleasing the other 取悅對方 → 與原文相反。"
        },
        {
          "t": "",
          "h": "Resolving the dilemma 解決困境 → 不是「方式」的意思。"
        },
        {
          "t": "",
          "h": "Seeking the common good 追求共同利益 → 與原文相反。"
        },
        {
          "t": "Serving one's own interests",
          "h": "<b>Serving one's own interests</b> 追求自己的利益 → 正確。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(D) Serving one's own interests.</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>注意題目問的是 most probably（最可能），不是最好。文章說：最好的結果是雙方合作各判一年，但「他們更可能背叛對方」。</p>",
      "steps": [
        {
          "t": "",
          "h": "雙方都背叛 → 依據文章第 3 種結果，各判<b>五年</b>。"
        },
        {
          "t": "",
          "h": "一方獲釋、一方十年：是「一方背叛、一方沉默」，但因為彼此不知道對方選擇，通常不會發生。"
        },
        {
          "t": "",
          "h": "各判一年是「最理想」但不是「最可能」。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(C) Both being put in jail for five years.</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>末段引用數學家 Peter Wood 的話：每個國家都想要全球減排，卻寧願「由別人承擔」→ 只有各國共同合作才能得到長期利益，也就是<b>減排必須合作</b>。</p>",
      "steps": [
        {
          "t": "",
          "h": "文中沒提「揭露氣候損害的風險」。"
        },
        {
          "t": "",
          "h": "文章反而說多數協商無法持續（there are always short-term economic benefits for a country to break agreements），所以不是強調協商已帶來好處。"
        },
        {
          "t": "",
          "h": "「需要法規」文中未提。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(A) The necessity of cooperation for decreasing greenhouse gases.</p>",
      "tip": ""
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
      "key": "<p class=\"lead\"><b>關鍵想法：</b>找 the burden 的上一句：\"every country wants global emission reductions, but would prefer that someone else take on the burden.\"</p>",
      "steps": [
        {
          "t": "",
          "h": "各國都想要「全球減排」，但希望別人來承擔這個重擔 → <b>the burden＝減少溫室氣體排放</b>。"
        },
        {
          "t": "",
          "h": "財務成本、經濟成長、保育自然資源都不是該句所指。"
        }
      ],
      "ans": "<p class=\"ans\">答案：(B) The reduction of gas emissions.</p>",
      "tip": ""
    }
  ]
};
