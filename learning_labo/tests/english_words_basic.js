(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const PLAN = [
        { count: 6, maker: makePictureToWordQuestion },
        { count: 6, maker: makeWordToPictureQuestion },
        { count: 2, maker: makeCategoryPairQuestion },
        { count: 3, maker: makeFirstLetterQuestion },
        { count: 3, maker: makeMissingLetterQuestion }
    ];

    const WORDS = [
        { word: "apple", meaning: "りんご", category: "food", picture: "🍎" },
        { word: "banana", meaning: "バナナ", category: "food", picture: "🍌" },
        { word: "bread", meaning: "パン", category: "food", picture: "🍞" },
        { word: "cake", meaning: "ケーキ", category: "food", picture: "🍰" },
        { word: "milk", meaning: "ぎゅうにゅう", category: "food", picture: "🥛" },
        { word: "egg", meaning: "たまご", category: "food", picture: "🥚" },
        { word: "rice", meaning: "ごはん", category: "food", picture: "🍚" },
        { word: "juice", meaning: "ジュース", category: "food", picture: "🧃（ジュース）" },
        { word: "cat", meaning: "ねこ", category: "animal", picture: "🐱" },
        { word: "dog", meaning: "いぬ", category: "animal", picture: "🐶" },
        { word: "fish", meaning: "さかな", category: "animal", picture: "🐟" },
        { word: "bird", meaning: "とり", category: "animal", picture: "🐦" },
        { word: "bear", meaning: "くま", category: "animal", picture: "🐻" },
        { word: "rabbit", meaning: "うさぎ", category: "animal", picture: "🐰" },
        { word: "duck", meaning: "あひる", category: "animal", picture: "🦆" },
        { word: "frog", meaning: "かえる", category: "animal", picture: "🐸" },
        { word: "book", meaning: "ほん", category: "school", picture: "📘（ほん）" },
        { word: "pen", meaning: "ペン", category: "school", picture: "🖊️" },
        { word: "desk", meaning: "つくえ", category: "school", picture: "🪑" },
        { word: "bag", meaning: "かばん", category: "school", picture: "🎒" },
        { word: "pencil", meaning: "えんぴつ", category: "school", picture: "✏️" },
        { word: "chair", meaning: "いす", category: "school", picture: "💺" },
        { word: "notebook", meaning: "ノート", category: "school", picture: "📓（ノート）" },
        { word: "eraser", meaning: "けしごむ", category: "school", picture: "🧽（けしごむ）" },
        { word: "red", meaning: "あか", category: "color", picture: "🟥（いろ）" },
        { word: "blue", meaning: "あお", category: "color", picture: "🟦（いろ）" },
        { word: "yellow", meaning: "きいろ", category: "color", picture: "🟨（いろ）" },
        { word: "green", meaning: "みどり", category: "color", picture: "🟩（いろ）" },
        { word: "pink", meaning: "ピンク", category: "color", picture: "🩷（いろ）" },
        { word: "black", meaning: "くろ", category: "color", picture: "⬛（いろ）" },
        { word: "white", meaning: "しろ", category: "color", picture: "⬜（いろ）" },
        { word: "orange", meaning: "オレンジ", category: "color", picture: "🟧（いろ）" }
    ];

    const CATEGORY_PAIR_SETS = [
        [
            ["red", "blue"],
            ["dog", "cat"],
            ["apple", "banana"],
            ["book", "pen"]
        ],
        [
            ["yellow", "green"],
            ["fish", "bird"],
            ["bread", "cake"],
            ["desk", "bag"]
        ],
        [
            ["pink", "orange"],
            ["bear", "rabbit"],
            ["milk", "juice"],
            ["pencil", "notebook"]
        ],
        [
            ["black", "white"],
            ["duck", "frog"],
            ["egg", "rice"],
            ["chair", "eraser"]
        ]
    ];

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

    function findWord(word) {
        return WORDS.find((item) => item.word === word);
    }

    function take(context, key, pool) {
        if (!context[key] || context[key].length === 0) {
            context[key] = shuffle(pool);
        }
        return context[key].pop();
    }

    function createImageQuestionPools() {
        const shuffled = shuffle(WORDS);
        return {
            pictureToWordPool: shuffled.slice(0, 6),
            wordToPicturePool: shuffled.slice(6, 12)
        };
    }

    function makePictureToWordQuestion(context) {
        const item = context.pictureToWordPool.pop();
        const distractors = sample(WORDS.filter((other) => other.word !== item.word), 3);
        return makeChoiceQuestion(
            "english_picture_to_word",
            "えをみて ことばをえらぶ",
            `<span class="kana-focus" aria-label="${item.meaning}">${item.picture}</span><span class="question-line">このえの えいごは どれ？</span>`,
            item.word,
            [item].concat(distractors).map((entry) => choice(entry.word, `<span style="font-family: Arial, Helvetica, sans-serif;">${entry.word}</span>`))
        );
    }

    function makeWordToPictureQuestion(context) {
        const item = context.wordToPicturePool.pop();
        const distractors = sample(WORDS.filter((other) => other.word !== item.word), 3);
        return makeChoiceQuestion(
            "english_word_to_picture",
            "ことばをみて えをえらぶ",
            `<span class="kana-focus" style="font-family: Arial, Helvetica, sans-serif;">${item.word}</span><span class="question-line">このえいごに あう えは どれ？</span>`,
            item.word,
            [item].concat(distractors).map((entry) => choice(entry.word, `<span aria-label="${entry.meaning}">${entry.picture}</span>`))
        );
    }

    function makeCategoryPairQuestion(context) {
        const pairs = context.categoryPairSets.pop();
        return {
            type: "english_category_pair",
            title: "なかまの ペア",
            promptHtml: `<span class="question-title">なかまの ペア</span><span class="question-line">おなじ なかまの ことばを 2こずつ みつけて、4くみの ペアを つくろう。</span>`,
            answer: "all_pairs_matched",
            matchClass: "kana-match word-match",
            matchItems: pairs.flatMap(([firstWord, secondWord]) => {
                const first = findWord(firstWord);
                const second = findWord(secondWord);
                const key = `${first.word}-${second.word}`;
                return [
                    { label: first.word, value: first.word, answerKey: key },
                    { label: second.word, value: second.word, answerKey: key }
                ];
            })
        };
    }

    function makeFirstLetterQuestion(context) {
        const item = take(context, "firstLetterPool", WORDS);
        const correctLetter = item.word.charAt(0);
        const distractors = sample(
            WORDS
                .map((entry) => entry.word.charAt(0))
                .filter((letter, index, list) => list.indexOf(letter) === index && letter !== correctLetter),
            3
        );
        return makeChoiceQuestion(
            "english_first_letter",
            "さいしょの もじ",
            `<span class="kana-focus" style="font-family: Arial, Helvetica, sans-serif;">${item.word}</span><span class="question-line">さいしょの もじは どれ？</span>`,
            correctLetter,
            [correctLetter].concat(distractors).map((letter) => choice(letter, `<span style="font-family: Arial, Helvetica, sans-serif;">${letter}</span>`))
        );
    }

    function makeMissingLetterQuestion(context) {
        const item = take(context, "missingLetterPool", WORDS.filter((entry) => entry.word.length >= 4));
        const missingIndex = Math.max(1, Math.floor(item.word.length / 2) - 1);
        const correctLetter = item.word.charAt(missingIndex);
        const masked = `${item.word.slice(0, missingIndex)}_${item.word.slice(missingIndex + 1)}`;
        const distractors = sample(
            "abcdefghijklmnopqrstuvwxyz"
                .split("")
                .filter((letter) => letter !== correctLetter && !item.word.includes(letter)),
            3
        );
        return makeChoiceQuestion(
            "english_missing_letter",
            "ぬけた もじ",
            `<span class="kana-focus" style="font-family: Arial, Helvetica, sans-serif;">${masked}</span><span class="question-line">あてはまる もじは どれ？</span>`,
            correctLetter,
            [correctLetter].concat(distractors).map((letter) => choice(letter, `<span style="font-family: Arial, Helvetica, sans-serif;">${letter}</span>`))
        );
    }

    window.LearningLaboTests.english_words_basic = {
        createQuestions(count) {
            const imagePools = createImageQuestionPools();
            const context = {
                pictureToWordPool: imagePools.pictureToWordPool,
                wordToPicturePool: imagePools.wordToPicturePool,
                categoryPairSets: shuffle(CATEGORY_PAIR_SETS),
                firstLetterPool: shuffle(WORDS),
                missingLetterPool: shuffle(WORDS.filter((entry) => entry.word.length >= 4))
            };

            const questions = PLAN.flatMap((item) => (
                Array.from({ length: item.count }, () => item.maker(context))
            ));

            return questions.slice(0, count);
        }
    };
})();
