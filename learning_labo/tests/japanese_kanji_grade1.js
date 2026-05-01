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
        q("「山」の<ruby>読<rt>よ</rt></ruby>みは？", "やま", ["やま", "かわ", "そら", "いし"]),
        q("「川」の<ruby>読<rt>よ</rt></ruby>みは？", "かわ", ["かわ", "やま", "もり", "みず"]),
        q("「森」の<ruby>読<rt>よ</rt></ruby>みは？", "もり", ["もり", "はやし", "き", "くさ"]),
        q("「林」の<ruby>読<rt>よ</rt></ruby>みは？", "はやし", ["はやし", "もり", "たけ", "はな"]),
        q("「木」の<ruby>読<rt>よ</rt></ruby>みは？", "き", ["き", "ひ", "め", "て"]),
        q("「竹」の<ruby>読<rt>よ</rt></ruby>みは？", "たけ", ["たけ", "くさ", "いし", "つち"]),
        q("「空」の<ruby>読<rt>よ</rt></ruby>みは？", "そら", ["そら", "あめ", "はな", "くさ"]),
        q("「雨」の<ruby>読<rt>よ</rt></ruby>みは？", "あめ", ["あめ", "そら", "みず", "ひ"]),
        q("「花」の<ruby>読<rt>よ</rt></ruby>みは？", "はな", ["はな", "くさ", "たけ", "き"]),
        q("「水」の<ruby>読<rt>よ</rt></ruby>みは？", "みず", ["みず", "ひ", "つち", "あめ"]),
        q("「火」の<ruby>読<rt>よ</rt></ruby>みは？", "ひ", ["ひ", "みず", "き", "て"]),
        q("「上」の<ruby>読<rt>よ</rt></ruby>みは？", "うえ", ["うえ", "した", "まえ", "うしろ"]),
        q("「下」の<ruby>読<rt>よ</rt></ruby>みは？", "した", ["した", "うえ", "なか", "そと"]),
        q("「左」の<ruby>読<rt>よ</rt></ruby>みは？", "ひだり", ["ひだり", "みぎ", "まえ", "した"]),
        q("「右」の<ruby>読<rt>よ</rt></ruby>みは？", "みぎ", ["みぎ", "ひだり", "うえ", "そと"]),
        q("「中」の<ruby>読<rt>よ</rt></ruby>みは？", "なか", ["なか", "うえ", "した", "そと"]),
        q("「石」の<ruby>読<rt>よ</rt></ruby>みは？", "いし", ["いし", "かね", "たま", "つち"]),
        q("「耳」の<ruby>読<rt>よ</rt></ruby>みは？", "みみ", ["みみ", "め", "くち", "て"]),
        q("「目」の<ruby>読<rt>よ</rt></ruby>みは？", "め", ["め", "みみ", "くち", "あし"]),
        q("「手」の<ruby>読<rt>よ</rt></ruby>みは？", "て", ["て", "あし", "め", "くち"])
    ];

    const READING_PAIRS = [
        ["山", "やま"], ["川", "かわ"], ["森", "もり"], ["林", "はやし"],
        ["木", "き"], ["竹", "たけ"], ["空", "そら"], ["雨", "あめ"],
        ["花", "はな"], ["草", "くさ"], ["水", "みず"], ["火", "ひ"],
        ["土", "つち"], ["石", "いし"], ["目", "め"], ["耳", "みみ"],
        ["口", "くち"], ["手", "て"], ["足", "あし"], ["車", "くるま"]
    ];

    const MEANINGS = [
        q("⛰️ <ruby>高<rt>たか</rt></ruby>くもりあがった<ruby>土地<rt>とち</rt></ruby>をあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "山", ["山", "川", "田", "石"]),
        q("🌊 <ruby>水<rt>みず</rt></ruby>がながれるところをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "川", ["川", "山", "雨", "空"]),
        q("🌳 <ruby>木<rt>き</rt></ruby>がたくさんあるところをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "森", ["森", "林", "竹", "草"]),
        q("🌲 <ruby>木<rt>き</rt></ruby>がならんでいるところをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "林", ["林", "森", "田", "村"]),
        q("☁️ <ruby>見上<rt>みあ</rt></ruby>げるひろいところをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "空", ["空", "雨", "天", "白"]),
        q("🌧️ そらからふる<ruby>水<rt>みず</rt></ruby>をあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "雨", ["雨", "水", "火", "空"]),
        q("🌸 さいているものをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "花", ["花", "草", "竹", "木"]),
        q("💧 のんだりあらったりするものをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "水", ["水", "火", "土", "雨"]),
        q("🔥 あつくてもえるものをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "火", ["火", "水", "音", "日"]),
        q("👂 <ruby>音<rt>おと</rt></ruby>をきくところをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "耳", ["耳", "目", "口", "手"]),
        q("👀 ものをみるところをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "目", ["目", "耳", "口", "足"]),
        q("🚗 のりものをあらわす<ruby>漢字<rt>かんじ</rt></ruby>は？", "車", ["車", "町", "村", "田"])
    ];

    const SENTENCES = [
        q("あおい（そら）がきれい。", "空", ["空", "雨", "花", "草"]),
        q("（あめ）がふる。", "雨", ["雨", "空", "水", "花"]),
        q("（はな）をそだてる。", "花", ["花", "草", "竹", "木"]),
        q("（くさ）のうえに ねころぶ。", "草", ["草", "花", "田", "土"]),
        q("（みず）をのむ。", "水", ["水", "火", "土", "金"]),
        q("（ひ）をつける。", "火", ["火", "水", "雨", "音"]),
        q("（つち）をほる。", "土", ["土", "水", "空", "花"]),
        q("お（かね）をはらう。", "金", ["金", "玉", "石", "貝"]),
        q("（ひと）がいっぱい。", "人", ["人", "子", "女", "男"]),
        q("（こ）がはしる。", "子", ["子", "人", "足", "手"]),
        q("（め）でみる。", "目", ["目", "耳", "口", "手"]),
        q("（みみ）できく。", "耳", ["耳", "目", "口", "足"]),
        q("（くち）をあける。", "口", ["口", "目", "耳", "手"]),
        q("（て）をあらう。", "手", ["手", "足", "口", "目"]),
        q("（あし）がはやい。", "足", ["足", "手", "耳", "口"])
    ];

    const WORDS = [
        q("へやに（はい）る。", "入", ["入", "出", "立", "休"]),
        q("そとに（で）る。", "出", ["出", "入", "見", "立"]),
        q("（た）ってください。", "立", ["立", "休", "入", "出"]),
        q("テレビを（み）る。", "見", ["見", "休", "出", "入"]),
        q("（やす）みじかん。", "休", ["休", "見", "立", "出"]),
        q("（がっ）こうにいく。", "学", ["学", "校", "字", "文"]),
        q("がっ（こう）がすき。", "校", ["校", "学", "本", "名"]),
        q("ノートに（じ）をかく。", "字", ["字", "文", "本", "名"]),
        q("さく（ぶん）をかく。", "文", ["文", "字", "本", "校"]),
        q("（ほん）をよむ。", "本", ["本", "字", "文", "名"]),
        q("（な）まえをかく。", "名", ["名", "字", "本", "文"]),
        q("（あか）い りんご。", "赤", ["赤", "青", "白", "花"]),
        q("（あお）い そら。", "青", ["青", "赤", "白", "空"]),
        q("（しろ）い ゆき。", "白", ["白", "赤", "青", "雨"]),
        q("いい（おと）がする。", "音", ["音", "耳", "口", "目"]),
        q("じてん（しゃ）にのる。", "車", ["車", "町", "村", "田"])
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

    window.LearningLaboTests.japanese_kanji_grade1 = {
        createQuestions(count) {
            const context = {};
            const questions = PLAN.flatMap((item) => (
                Array.from({ length: item.count }, () => item.maker(context))
            ));
            return questions.slice(0, count);
        }
    };
})();
