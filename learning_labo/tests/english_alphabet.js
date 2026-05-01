(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const ALPHABET = [
        { upper: "A", lower: "a", romaji: "えー" },
        { upper: "B", lower: "b", romaji: "びー" },
        { upper: "C", lower: "c", romaji: "しー" },
        { upper: "D", lower: "d", romaji: "でぃー" },
        { upper: "E", lower: "e", romaji: "いー" },
        { upper: "F", lower: "f", romaji: "えふ" },
        { upper: "G", lower: "g", romaji: "じー" },
        { upper: "H", lower: "h", romaji: "えいち" },
        { upper: "I", lower: "i", romaji: "あい" },
        { upper: "J", lower: "j", romaji: "じぇい" },
        { upper: "K", lower: "k", romaji: "けい" },
        { upper: "L", lower: "l", romaji: "える" },
        { upper: "M", lower: "m", romaji: "えむ" },
        { upper: "N", lower: "n", romaji: "えぬ" },
        { upper: "O", lower: "o", romaji: "おー" },
        { upper: "P", lower: "p", romaji: "ぴー" },
        { upper: "Q", lower: "q", romaji: "きゅー" },
        { upper: "R", lower: "r", romaji: "あーる" },
        { upper: "S", lower: "s", romaji: "えす" },
        { upper: "T", lower: "t", romaji: "てぃー" },
        { upper: "U", lower: "u", romaji: "ゆー" },
        { upper: "V", lower: "v", romaji: "ぶい" },
        { upper: "W", lower: "w", romaji: "だぶりゅー" },
        { upper: "X", lower: "x", romaji: "えっくす" },
        { upper: "Y", lower: "y", romaji: "わい" },
        { upper: "Z", lower: "z", romaji: "ぜっと" }
    ];

    const PLAN = [
        { count: 3, maker: makeUpperToReadingQuestion },
        { count: 3, maker: makeReadingToUpperQuestion },
        { count: 3, maker: makeLowerToReadingQuestion },
        { count: 3, maker: makeReadingToLowerQuestion },
        { count: 4, maker: makePairQuestion },
        { count: 2, maker: makeSequenceUpperQuestion },
        { count: 2, maker: makeSequenceLowerQuestion }
    ];

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

    function makeUpperToReadingQuestion(context) {
        const item = context.poolUpperToReading.pop();
        const choices = [item.romaji].concat(
            sample(ALPHABET.filter((other) => other.romaji !== item.romaji), 3).map((other) => other.romaji)
        );

        return makeChoiceQuestion(
            "upper_to_reading",
            "大文字のよみかた",
            `<span class="kana-focus" style="font-family: Arial, Helvetica, sans-serif;">「${item.upper}」</span><span class="question-line">このアルファベットのよみかたはどれ？</span>`,
            item.romaji,
            choices.map(c => choice(c, c))
        );
    }

    function makeReadingToUpperQuestion(context) {
        const item = context.poolReadingToUpper.pop();
        const choices = [item.upper].concat(
            sample(ALPHABET.filter((other) => other.upper !== item.upper), 3).map((other) => other.upper)
        );

        return makeChoiceQuestion(
            "reading_to_upper",
            "よみにある大文字をえらぶ",
            `<span class="kana-focus">「${item.romaji}」</span><span class="question-line">このよみかたのアルファベット（大文字）はどれ？</span>`,
            item.upper,
            choices.map(c => choice(c, `<span style="font-family: Arial, Helvetica, sans-serif;">${c}</span>`))
        );
    }

    function makeLowerToReadingQuestion(context) {
        const item = context.poolLowerToReading.pop();
        const choices = [item.romaji].concat(
            sample(ALPHABET.filter((other) => other.romaji !== item.romaji), 3).map((other) => other.romaji)
        );

        return makeChoiceQuestion(
            "lower_to_reading",
            "小文字のよみかた",
            `<span class="kana-focus" style="font-family: Arial, Helvetica, sans-serif;">「${item.lower}」</span><span class="question-line">このアルファベットのよみかたはどれ？</span>`,
            item.romaji,
            choices.map(c => choice(c, c))
        );
    }

    function makeReadingToLowerQuestion(context) {
        const item = context.poolReadingToLower.pop();
        const choices = [item.lower].concat(
            sample(ALPHABET.filter((other) => other.lower !== item.lower), 3).map((other) => other.lower)
        );

        return makeChoiceQuestion(
            "reading_to_lower",
            "よみにあう小文字をえらぶ",
            `<span class="kana-focus">「${item.romaji}」</span><span class="question-line">このよみかたのアルファベット（小文字）はどれ？</span>`,
            item.lower,
            choices.map(c => choice(c, `<span style="font-family: Arial, Helvetica, sans-serif;">${c}</span>`))
        );
    }

    function makePairQuestion(context) {
        // 4ペアを出題する
        const entries = [
            context.poolPairs.pop(),
            context.poolPairs.pop(),
            context.poolPairs.pop(),
            context.poolPairs.pop()
        ];
        return {
            type: "alphabet_pair",
            title: "ペアをつくる",
            promptHtml: `<span class="question-title">おおもじとこもじのペア</span><span class="question-line">おなじアルファベットのおおもじとこもじをペアにしよう。</span>`,
            answer: "all_pairs_matched",
            matchClass: "kana-match",
            matchItems: entries.flatMap((item) => {
                const key = `${item.upper}-${item.lower}`;
                return [
                    { label: item.upper, value: item.upper, answerKey: key },
                    { label: item.lower, value: item.lower, answerKey: key }
                ];
            })
        };
    }

    function makeSequenceUpperQuestion(context) {
        let startIndex;
        if (context.sequenceUpperCount === 0) {
            // 1問目: 前半から（A〜Mの範囲に収まるようにA〜Fからスタート）
            startIndex = randomInt(0, 5);
            context.sequenceUpperCount++;
        } else {
            // 2問目: 後半から（N〜Zの範囲に収まるようにN〜Sからスタート）
            startIndex = randomInt(13, 18);
        }

        const sequence = ALPHABET.slice(startIndex, startIndex + 8).map(item => item.upper);
        
        return {
            type: "sequence_upper",
            title: "アルファベットのじゅんばん",
            promptHtml: `<span class="question-title">アルファベットの順番（大文字）</span><span class="question-line">${sequence[0]} ${sequence[1]} ${sequence[2]} ... のじゅんばんで、アルファベットをすべてタップしよう。</span>`,
            answer: "sequence_completed",
            sequenceClass: "kana-match",
            sequenceItems: sequence.map((char, index) => ({
                label: char,
                index: index
            }))
        };
    }

    function makeSequenceLowerQuestion(context) {
        let startIndex;
        if (context.sequenceLowerCount === 0) {
            // 1問目: 前半から
            startIndex = randomInt(0, 5);
            context.sequenceLowerCount++;
        } else {
            // 2問目: 後半から
            startIndex = randomInt(13, 18);
        }

        const sequence = ALPHABET.slice(startIndex, startIndex + 8).map(item => item.lower);
        
        return {
            type: "sequence_lower",
            title: "アルファベットのじゅんばん",
            promptHtml: `<span class="question-title">アルファベットの順番（小文字）</span><span class="question-line">${sequence[0]} ${sequence[1]} ${sequence[2]} ... のじゅんばんで、アルファベットをすべてタップしよう。</span>`,
            answer: "sequence_completed",
            sequenceClass: "kana-match",
            sequenceItems: sequence.map((char, index) => ({
                label: char,
                index: index
            }))
        };
    }

    window.LearningLaboTests.english_alphabet = {
        createQuestions(count) {
            const context = {
                poolUpperToReading: shuffle(ALPHABET),
                poolReadingToUpper: shuffle(ALPHABET),
                poolLowerToReading: shuffle(ALPHABET),
                poolReadingToLower: shuffle(ALPHABET),
                poolPairs: shuffle(ALPHABET),
                sequenceUpperCount: 0,
                sequenceLowerCount: 0
            };
            const questions = PLAN.flatMap((item) => (
                Array.from({ length: item.count }, () => item.maker(context))
            ));
            return questions.slice(0, count);
        }
    };
})();
