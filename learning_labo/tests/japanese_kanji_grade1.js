(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    // kanji/grade1.js の1年生漢字を元にしたテスト。
    // 読み問題と穴埋め問題では、別の漢字セットを使う。漢数字は使わない。
    const readingPool = [
        { prompt: "「山」の読みは？", answer: "やま", choices: ["やま", "かわ", "そら", "いし"] },
        { prompt: "「川」の読みは？", answer: "かわ", choices: ["かわ", "やま", "もり", "みず"] },
        { prompt: "「森」の読みは？", answer: "もり", choices: ["もり", "はやし", "き", "くさ"] },
        { prompt: "「林」の読みは？", answer: "はやし", choices: ["はやし", "もり", "たけ", "はな"] },
        { prompt: "「木」の読みは？", answer: "き", choices: ["き", "ひ", "め", "て"] },
        { prompt: "「竹」の読みは？", answer: "たけ", choices: ["たけ", "くさ", "いし", "つち"] },
        { prompt: "「天」の読みは？", answer: "てん", choices: ["てん", "そら", "あめ", "き"] },
        { prompt: "「気」の読みは？", answer: "き", choices: ["き", "ひ", "みず", "つき"] },
        { prompt: "「夕」の読みは？", answer: "ゆう", choices: ["ゆう", "あさ", "よる", "ひる"] },
        { prompt: "「上」の読みは？", answer: "うえ", choices: ["うえ", "した", "まえ", "うしろ"] },
        { prompt: "「下」の読みは？", answer: "した", choices: ["した", "うえ", "なか", "そと"] },
        { prompt: "「左」の読みは？", answer: "ひだり", choices: ["ひだり", "みぎ", "まえ", "した"] },
        { prompt: "「右」の読みは？", answer: "みぎ", choices: ["みぎ", "ひだり", "うえ", "そと"] },
        { prompt: "「中」の読みは？", answer: "なか", choices: ["なか", "うえ", "した", "そと"] },
        { prompt: "「石」の読みは？", answer: "いし", choices: ["いし", "かね", "たま", "つち"] },
        { prompt: "「玉」の読みは？", answer: "たま", choices: ["たま", "いし", "かい", "くち"] }
    ];

    const fillPool = [
        { promptHtml: "あおい（そら）がきれい。", answer: "空", choices: ["空", "雨", "花", "草"] },
        { promptHtml: "（あめ）がふる。", answer: "雨", choices: ["雨", "空", "水", "花"] },
        { promptHtml: "（はな）をそだてる。", answer: "花", choices: ["花", "草", "竹", "木"] },
        { promptHtml: "（くさ）のうえに ねころぶ。", answer: "草", choices: ["草", "花", "田", "土"] },
        { promptHtml: "（みず）をのむ。", answer: "水", choices: ["水", "火", "土", "金"] },
        { promptHtml: "（ひ）をつける。", answer: "火", choices: ["火", "水", "雨", "音"] },
        { promptHtml: "（つち）をほる。", answer: "土", choices: ["土", "水", "空", "花"] },
        { promptHtml: "お（かね）をはらう。", answer: "金", choices: ["金", "玉", "石", "貝"] },
        { promptHtml: "（ひと）がいっぱい。", answer: "人", choices: ["人", "子", "女", "男"] },
        { promptHtml: "（こ）がはしる。", answer: "子", choices: ["子", "人", "足", "手"] },
        { promptHtml: "（め）でみる。", answer: "目", choices: ["目", "耳", "口", "手"] },
        { promptHtml: "（みみ）できく。", answer: "耳", choices: ["耳", "目", "口", "足"] },
        { promptHtml: "（くち）をあける。", answer: "口", choices: ["口", "目", "耳", "手"] },
        { promptHtml: "（て）をあらう。", answer: "手", choices: ["手", "足", "口", "目"] },
        { promptHtml: "（あし）がはやい。", answer: "足", choices: ["足", "手", "耳", "口"] },
        { promptHtml: "へやに（はい）る。", answer: "入", choices: ["入", "出", "立", "休"] },
        { promptHtml: "そとに（で）る。", answer: "出", choices: ["出", "入", "見", "立"] },
        { promptHtml: "（た）ってください。", answer: "立", choices: ["立", "休", "入", "出"] },
        { promptHtml: "テレビを（み）る。", answer: "見", choices: ["見", "休", "出", "入"] },
        { promptHtml: "（やす）みじかん。", answer: "休", choices: ["休", "見", "立", "出"] },
        { promptHtml: "（がっ）こうにいく。", answer: "学", choices: ["学", "校", "字", "文"] },
        { promptHtml: "がっ（こう）がすき。", answer: "校", choices: ["校", "学", "本", "名"] },
        { promptHtml: "ノートに（じ）をかく。", answer: "字", choices: ["字", "文", "本", "名"] },
        { promptHtml: "さく（ぶん）をかく。", answer: "文", choices: ["文", "字", "本", "校"] },
        { promptHtml: "（ほん）をよむ。", answer: "本", choices: ["本", "字", "文", "名"] },
        { promptHtml: "（な）まえをかく。", answer: "名", choices: ["名", "字", "本", "文"] },
        { promptHtml: "（あか）い りんご。", answer: "赤", choices: ["赤", "青", "白", "花"] },
        { promptHtml: "（あお）い そら。", answer: "青", choices: ["青", "赤", "白", "空"] },
        { promptHtml: "（しろ）い ゆき。", answer: "白", choices: ["白", "赤", "青", "雨"] },
        { promptHtml: "いい（おと）がする。", answer: "音", choices: ["音", "耳", "口", "目"] },
        { promptHtml: "（むし）とりにいく。", answer: "虫", choices: ["虫", "犬", "貝", "王"] },
        { promptHtml: "（かい）がらをひろう。", answer: "貝", choices: ["貝", "虫", "犬", "玉"] },
        { promptHtml: "じてん（しゃ）にのる。", answer: "車", choices: ["車", "町", "村", "田"] },
        { promptHtml: "（た）んぼであそぶ。", answer: "田", choices: ["田", "町", "村", "車"] },
        { promptHtml: "ちいさな（むら）にいく。", answer: "村", choices: ["村", "町", "田", "車"] }
    ];

    function shuffle(items) {
        const list = [...items];
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }

    function cloneQuestion(item) {
        return {
            prompt: item.prompt,
            promptHtml: item.promptHtml,
            answer: item.answer,
            choices: shuffle(item.choices)
        };
    }

    window.LearningLaboTests.japanese_kanji_grade1 = {
        createQuestions(count) {
            const readingCount = Math.min(10, Math.floor(count / 2));
            const fillCount = Math.min(10, count - readingCount);
            const readingQuestions = shuffle(readingPool).slice(0, readingCount).map(cloneQuestion);
            const fillQuestions = shuffle(fillPool).slice(0, fillCount).map(cloneQuestion);
            return readingQuestions.concat(fillQuestions);
        }
    };
})();
