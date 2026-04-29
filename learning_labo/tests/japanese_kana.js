(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const pool = [
        ["あ", "ア"], ["い", "イ"], ["う", "ウ"], ["え", "エ"], ["お", "オ"],
        ["か", "カ"], ["き", "キ"], ["く", "ク"], ["け", "ケ"], ["こ", "コ"],
        ["さ", "サ"], ["し", "シ"], ["す", "ス"], ["せ", "セ"], ["そ", "ソ"],
        ["た", "タ"], ["ち", "チ"], ["つ", "ツ"], ["て", "テ"], ["と", "ト"],
        ["な", "ナ"], ["に", "ニ"], ["ぬ", "ヌ"], ["ね", "ネ"], ["の", "ノ"],
        ["は", "ハ"], ["ひ", "ヒ"], ["ふ", "フ"], ["へ", "ヘ"], ["ほ", "ホ"],
        ["ま", "マ"], ["み", "ミ"], ["む", "ム"], ["め", "メ"], ["も", "モ"]
    ];

    function shuffle(items) {
        const list = [...items];
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }

    window.LearningLaboTests.japanese_kana = {
        createQuestions(count) {
            return shuffle(pool).slice(0, count).map(([hiragana, katakana]) => {
                const choices = shuffle(pool.map((item) => item[1])).slice(0, 3);
                if (!choices.includes(katakana)) choices[0] = katakana;
                return {
                    prompt: `「${hiragana}」のカタカナは？`,
                    answer: katakana,
                    choices: shuffle(choices)
                };
            });
        }
    };
})();
