(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const PLAN = [
        { count: 4, maker: makeReadingQuestion },
        { count: 4, maker: makeReadingPairQuestion },
        { count: 4, maker: makeMeaningQuestion },
        { count: 4, maker: makeSentenceQuestion },
        { count: 4, maker: makeWordQuestion }
    ];

    const READINGS = [
        q("「春」の<ruby>読<rt>よ</rt></ruby>みは？", "はる", ["はる", "なつ", "あき", "ふゆ"]),
        q("「夏」の<ruby>読<rt>よ</rt></ruby>みは？", "なつ", ["なつ", "はる", "あさ", "よる"]),
        q("「秋」の<ruby>読<rt>よ</rt></ruby>みは？", "あき", ["あき", "はる", "ふゆ", "くも"]),
        q("「冬」の<ruby>読<rt>よ</rt></ruby>みは？", "ふゆ", ["ふゆ", "あき", "よる", "あさ"]),
        q("「東」の<ruby>読<rt>よ</rt></ruby>みは？", "ひがし", ["ひがし", "にし", "みなみ", "きた"]),
        q("「西」の<ruby>読<rt>よ</rt></ruby>みは？", "にし", ["にし", "ひがし", "きた", "うみ"]),
        q("「南」の<ruby>読<rt>よ</rt></ruby>みは？", "みなみ", ["みなみ", "きた", "ひがし", "にし"]),
        q("「北」の<ruby>読<rt>よ</rt></ruby>みは？", "きた", ["きた", "みなみ", "にし", "ひがし"]),
        q("「雲」の<ruby>読<rt>よ</rt></ruby>みは？", "くも", ["くも", "ゆき", "かぜ", "ほし"]),
        q("「雪」の<ruby>読<rt>よ</rt></ruby>みは？", "ゆき", ["ゆき", "くも", "あめ", "うみ"]),
        q("「風」の<ruby>読<rt>よ</rt></ruby>みは？", "かぜ", ["かぜ", "くも", "ほし", "いけ"]),
        q("「海」の<ruby>読<rt>よ</rt></ruby>みは？", "うみ", ["うみ", "いけ", "かわ", "みち"]),
        q("「星」の<ruby>読<rt>よ</rt></ruby>みは？", "ほし", ["ほし", "ひかり", "くも", "ゆき"]),
        q("「光」の<ruby>読<rt>よ</rt></ruby>みは？", "ひかり", ["ひかり", "ほし", "かぜ", "そら"]),
        q("「原」の<ruby>読<rt>よ</rt></ruby>みは？", "はら", ["はら", "たに", "の", "いわ"]),
        q("「野」の<ruby>読<rt>よ</rt></ruby>みは？", "の", ["の", "はら", "たに", "みち"])
    ];

    const READING_PAIRS = [
        ["池", "いけ"], ["谷", "たに"], ["原", "はら"], ["野", "の"],
        ["岩", "いわ"], ["馬", "うま"], ["牛", "うし"], ["魚", "さかな"],
        ["鳥", "とり"], ["羽", "はね"], ["米", "こめ"], ["麦", "むぎ"],
        ["茶", "ちゃ"], ["肉", "にく"], ["食", "たべる"], ["友", "とも"]
    ];

    const MEANINGS = [
        q("🌅 あさの じかんをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "朝", ["朝", "昼", "夜", "前"]),
        q("🍱 おひるの じかんをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "昼", ["昼", "朝", "夜", "後"]),
        q("🌙 くらくなってからの じかんをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "夜", ["夜", "昼", "朝", "星"]),
        q("📅 まいにち くりかえすことをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "毎", ["毎", "今", "週", "時"]),
        q("⬆️ うしろではなく まえをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "前", ["前", "後", "内", "外"]),
        q("⬇️ まえではなく あとや うしろをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "後", ["後", "前", "遠", "近"]),
        q("📍 ちかくではなく とおいことをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "遠", ["遠", "近", "前", "後"]),
        q("🏠 とおくではなく ちかいことをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "近", ["近", "遠", "内", "外"]),
        q("🚪 いりぐちの もんをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "門", ["門", "戸", "店", "室"]),
        q("🛣️ あるいたり くるまが とおったりする みちをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "道", ["道", "近", "遠", "里"]),
        q("✨ ひかって かがやくものをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "光", ["光", "遠", "風", "雲"]),
        q("⭐ よぞらで ひかるものをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "星", ["星", "光", "雪", "海"])
    ];

    const SENTENCES = [
        q("ぼくは ほんを（よ）む。", "読", ["読", "書", "話", "言"]),
        q("ノートに じを（か）く。", "書", ["書", "読", "記", "答"]),
        q("きょうの できごとを にっきに（しる）す。", "記", ["記", "話", "書", "読"]),
        q("ともだちと たのしく（はな）す。", "話", ["話", "言", "語", "答"]),
        q("ありがとうと（い）う。", "言", ["言", "話", "読", "書"]),
        q("しつもんに（こた）える。", "答", ["答", "記", "言", "語"]),
        q("あした がっこうへ（い）く。", "行", ["行", "来", "帰", "歩"]),
        q("ともだちが あそびに（く）る。", "来", ["来", "行", "帰", "走"]),
        q("ゆうがたに いえへ（かえ）る。", "帰", ["帰", "来", "行", "通"]),
        q("こうえんまで（ある）く。", "歩", ["歩", "走", "止", "引"]),
        q("うんどうかいで はやく（はし）る。", "走", ["走", "歩", "通", "合"]),
        q("しんごうで ぴたりと（と）まる。", "止", ["止", "引", "切", "歩"])
    ];

    const WORDS = [
        q("大きな（こえ）で よむ。", "声", ["声", "心", "頭", "顔"]),
        q("やさしい（こころ）を もつ。", "心", ["心", "声", "親", "友"]),
        q("（ちち）と キャッチボールを する。", "父", ["父", "母", "兄", "弟"]),
        q("（はは）と りょうりを する。", "母", ["母", "父", "姉", "妹"]),
        q("（あに）と サッカーを する。", "兄", ["兄", "弟", "父", "友"]),
        q("（おとうと）に ほんを かす。", "弟", ["弟", "兄", "姉", "妹"]),
        q("（あね）に そうだんする。", "姉", ["姉", "妹", "母", "兄"]),
        q("（いもうと）と てを つなぐ。", "妹", ["妹", "姉", "弟", "母"]),
        q("（いえ）に かえる。", "家", ["家", "室", "店", "戸"]),
        q("きょうしつは ひろい（へや）だ。", "室", ["室", "家", "店", "門"]),
        q("えきまえの（みせ）で かう。", "店", ["店", "戸", "家", "室"]),
        q("（と）を しめる。", "戸", ["戸", "門", "店", "室"])
    ];

    function q(promptHtml, answer, choices) {
        return { promptHtml, answer, choices };
    }

    function shuffle(items) {
        const list = [...items];
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }

    function take(context, key, pool) {
        if (!context[key] || context[key].length === 0) context[key] = shuffle(pool);
        return context[key].pop();
    }

    function takeMany(context, key, pool, count) {
        if (!context[key] || context[key].length < count) context[key] = shuffle(pool);
        return Array.from({ length: count }, () => context[key].pop());
    }

    function cloneQuestion(type, title, item) {
        return {
            type,
            title,
            promptHtml: `<span class="question-title">${title}</span>${item.promptHtml}`,
            answer: item.answer,
            choices: shuffle(item.choices)
        };
    }

    function makeReadingQuestion(context) {
        return cloneQuestion("kanji_reading", "<ruby>漢字<rt>かんじ</rt></ruby>の<ruby>読<rt>よ</rt></ruby>み", take(context, "readings", READINGS));
    }

    function makeReadingPairQuestion(context) {
        const pairs = takeMany(context, "readingPairs", READING_PAIRS, 4);
        return {
            type: "kanji_reading_pair",
            title: "<ruby>読<rt>よ</rt></ruby>みと<ruby>漢字<rt>かんじ</rt></ruby>のペア",
            promptHtml: `<span class="question-title"><ruby>読<rt>よ</rt></ruby>みと<ruby>漢字<rt>かんじ</rt></ruby>のペア</span><span class="question-line"><ruby>同<rt>おな</rt></ruby>じ<ruby>意味<rt>いみ</rt></ruby>の<ruby>漢字<rt>かんじ</rt></ruby>と<ruby>読<rt>よ</rt></ruby>みを、ぜんぶペアにしよう。</span>`,
            answer: "all_pairs_matched",
            matchClass: "kana-match word-match",
            matchItems: pairs.flatMap(([kanji, reading]) => {
                const key = `${kanji}-${reading}`;
                return [
                    { label: kanji, value: kanji, answerKey: key },
                    { label: reading, value: reading, answerKey: key }
                ];
            })
        };
    }

    function makeMeaningQuestion(context) {
        return cloneQuestion("kanji_meaning", "<ruby>意味<rt>いみ</rt></ruby>に<ruby>合<rt>あ</rt></ruby>う<ruby>漢字<rt>かんじ</rt></ruby>", take(context, "meanings", MEANINGS));
    }

    function makeSentenceQuestion(context) {
        return cloneQuestion("kanji_sentence", "<ruby>文<rt>ぶん</rt></ruby>に<ruby>合<rt>あ</rt></ruby>う<ruby>漢字<rt>かんじ</rt></ruby>", take(context, "sentences", SENTENCES));
    }

    function makeWordQuestion(context) {
        return cloneQuestion("kanji_word", "ことばを<ruby>完成<rt>かんせい</rt></ruby>させる", take(context, "words", WORDS));
    }

    window.LearningLaboTests.japanese_kanji_grade2 = {
        createQuestions(count) {
            const context = {};
            const questions = PLAN.flatMap((item) => (
                Array.from({ length: item.count }, () => item.maker(context))
            ));
            return questions.slice(0, count);
        }
    };
})();
