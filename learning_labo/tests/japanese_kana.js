(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const PLAN = [
        { count: 4, maker: makeKatakanaQuestion },
        { count: 4, maker: makeSameRowQuestion },
        { count: 6, maker: makePairQuestion },
        { count: 3, maker: makeEmojiKanaQuestion },
        { count: 3, maker: makeEmojiKatakanaQuestion }
    ];

    const ROWS = [
        { name: "あ行", labelHtml: "あ<ruby>行<rt>ぎょう</rt></ruby>", items: [["あ", "ア"], ["い", "イ"], ["う", "ウ"], ["え", "エ"], ["お", "オ"]] },
        { name: "か行", labelHtml: "か<ruby>行<rt>ぎょう</rt></ruby>", items: [["か", "カ"], ["き", "キ"], ["く", "ク"], ["け", "ケ"], ["こ", "コ"]] },
        { name: "さ行", labelHtml: "さ<ruby>行<rt>ぎょう</rt></ruby>", items: [["さ", "サ"], ["し", "シ"], ["す", "ス"], ["せ", "セ"], ["そ", "ソ"]] },
        { name: "た行", labelHtml: "た<ruby>行<rt>ぎょう</rt></ruby>", items: [["た", "タ"], ["ち", "チ"], ["つ", "ツ"], ["て", "テ"], ["と", "ト"]] },
        { name: "な行", labelHtml: "な<ruby>行<rt>ぎょう</rt></ruby>", items: [["な", "ナ"], ["に", "ニ"], ["ぬ", "ヌ"], ["ね", "ネ"], ["の", "ノ"]] },
        { name: "は行", labelHtml: "は<ruby>行<rt>ぎょう</rt></ruby>", items: [["は", "ハ"], ["ひ", "ヒ"], ["ふ", "フ"], ["へ", "ヘ"], ["ほ", "ホ"]] },
        { name: "ま行", labelHtml: "ま<ruby>行<rt>ぎょう</rt></ruby>", items: [["ま", "マ"], ["み", "ミ"], ["む", "ム"], ["め", "メ"], ["も", "モ"]] },
        { name: "や行", labelHtml: "や<ruby>行<rt>ぎょう</rt></ruby>", items: [["や", "ヤ"], ["ゆ", "ユ"], ["よ", "ヨ"]] },
        { name: "ら行", labelHtml: "ら<ruby>行<rt>ぎょう</rt></ruby>", items: [["ら", "ラ"], ["り", "リ"], ["る", "ル"], ["れ", "レ"], ["ろ", "ロ"]] },
        { name: "わ行", labelHtml: "わ<ruby>行<rt>ぎょう</rt></ruby>", items: [["わ", "ワ"], ["を", "ヲ"], ["ん", "ン"]] }
    ];

    const WORDS = [
        { kana: "りんご", katakana: "リンゴ", emoji: "🍎", choices: ["🍎", "🍊", "🍓", "🍇"] },
        { kana: "みかん", katakana: "ミカン", emoji: "🍊", choices: ["🍊", "🍎", "🍌", "🍑"] },
        { kana: "いちご", katakana: "イチゴ", emoji: "🍓", choices: ["🍓", "🍒", "🍎", "🍇"] },
        { kana: "ぶどう", katakana: "ブドウ", emoji: "🍇", choices: ["🍇", "🍓", "🍊", "🍌"] },
        { kana: "ばなな", katakana: "バナナ", emoji: "🍌", choices: ["🍌", "🍎", "🍊", "🍑"] },
        { kana: "ねこ", katakana: "ネコ", emoji: "🐱", choices: ["🐱", "🐶", "🐰", "🐻"] },
        { kana: "いぬ", katakana: "イヌ", emoji: "🐶", choices: ["🐶", "🐱", "🐻", "🐰"] },
        { kana: "うさぎ", katakana: "ウサギ", emoji: "🐰", choices: ["🐰", "🐱", "🐶", "🐻"] },
        { kana: "くるま", katakana: "クルマ", emoji: "🚗", choices: ["🚗", "🚃", "✈️", "🚢"] },
        { kana: "でんしゃ", katakana: "デンシャ", emoji: "🚃", choices: ["🚃", "🚗", "🚢", "✈️"] }
    ];

    const POOL = ROWS.flatMap((row) => row.items.map(([hiragana, katakana]) => ({
        row: row.name,
        hiragana,
        katakana
    })));

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function shuffle(items) {
        const list = [...items];
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }

    function sample(items, count) {
        return shuffle(items).slice(0, count);
    }

    function choice(value, labelHtml) {
        return { value, labelHtml };
    }

    function makeChoiceQuestion(type, title, promptHtml, answer, choices) {
        return {
            type,
            title,
            promptHtml: `<span class="question-title">${title}</span>${promptHtml}`,
            answer,
            choices: shuffle(choices)
        };
    }

    function makeKatakanaQuestion() {
        const item = POOL[randomInt(0, POOL.length - 1)];
        const choices = [item.katakana].concat(
            sample(POOL.filter((other) => other.katakana !== item.katakana), 3).map((other) => other.katakana)
        );

        return makeChoiceQuestion(
            "kana_to_katakana",
            "カタカナをみつける",
            `<span class="kana-focus">「${item.hiragana}」</span><span class="question-line">おなじ<ruby>音<rt>おと</rt></ruby>のカタカナはどれ？</span>`,
            item.katakana,
            choices
        );
    }

    function makeSameRowQuestion() {
        const row = ROWS[randomInt(0, ROWS.length - 1)];
        const correct = row.items[randomInt(0, row.items.length - 1)][0];
        const wrongs = sample(POOL.filter((item) => item.row !== row.name), 3).map((item) => item.hiragana);

        return makeChoiceQuestion(
            "same_kana_row",
            "<ruby>同<rt>おな</rt></ruby>じ<ruby>行<rt>ぎょう</rt></ruby>の<ruby>文字<rt>もじ</rt></ruby>",
            `<span class="question-line">${row.labelHtml}のひらがなはどれ？</span>`,
            correct,
            [correct].concat(wrongs)
        );
    }

    function makePairQuestion() {
        const entries = sample(POOL, 4);
        return {
            type: "kana_pair",
            title: "<ruby>同<rt>おな</rt></ruby>じ<ruby>字<rt>じ</rt></ruby>のペア",
            promptHtml: `<span class="question-title"><ruby>同<rt>おな</rt></ruby>じ<ruby>字<rt>じ</rt></ruby>のペア</span><span class="question-line">おなじ<ruby>音<rt>おと</rt></ruby>のひらがなとカタカナをぜんぶペアにしよう。</span>`,
            answer: "all_pairs_matched",
            matchItems: entries.flatMap((item) => {
                const key = `${item.hiragana}-${item.katakana}`;
                return [
                    { label: item.hiragana, value: item.hiragana, answerKey: key },
                    { label: item.katakana, value: item.katakana, answerKey: key }
                ];
            })
        };
    }

    function takeEmojiWord(context) {
        if (!context.emojiWords.length) context.emojiWords = shuffle(WORDS);
        return context.emojiWords.pop();
    }

    function makeEmojiKanaQuestion(context) {
        return makeEmojiQuestion(takeEmojiWord(context), "word_to_emoji_kana", "ことばとえ（かな）", "kana");
    }

    function makeEmojiKatakanaQuestion(context) {
        return makeEmojiQuestion(takeEmojiWord(context), "word_to_emoji_katakana", "ことばとえ（カタカナ）", "katakana");
    }

    function makeEmojiQuestion(item, type, title, wordKey) {
        const word = item[wordKey];
        return makeChoiceQuestion(
            type,
            title,
            `<span class="kana-focus">「${word}」</span><span class="question-line">ことばに<ruby>合<rt>あ</rt></ruby>うえはどれ？</span>`,
            item.emoji,
            item.choices.map((emoji) => choice(emoji, `<span class="emoji-choice">${emoji}</span>`))
        );
    }

    window.LearningLaboTests.japanese_kana = {
        createQuestions(count) {
            const context = {
                emojiWords: shuffle(WORDS)
            };
            const questions = PLAN.flatMap((item) => (
                Array.from({ length: item.count }, () => item.maker(context))
            ));
            return questions.slice(0, count);
        }
    };
})();
