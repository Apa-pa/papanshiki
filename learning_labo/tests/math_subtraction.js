(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const PLAN = [
        { count: 4, maker: makeFruitDifferenceQuestion },
        { count: 2, maker: makeBlockDifferenceQuestion },
        { count: 2, maker: makeLengthDifferenceQuestion },
        { count: 4, maker: makeNoBorrowQuestion },
        { count: 4, maker: makeBorrowQuestion },
        { count: 4, maker: makeMissingQuestion }
    ];

    const FRUITS = ["りんご", "みかん", "いちご", "ぶどう"];
    const FRUIT_EMOJI = {
        りんご: "🍎",
        みかん: "🍊",
        いちご: "🍓",
        ぶどう: "🍇"
    };

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function repeatText(text, count) {
        return Array.from({ length: count }, () => text).join("");
    }

    function makeNumberQuestion(type, title, promptHtml, answer) {
        return {
            type,
            title,
            promptHtml,
            answer: String(answer),
            inputMode: "number"
        };
    }

    function makeDifferentPair(min, max) {
        let a;
        let b;
        do {
            a = randomInt(min, max);
            b = randomInt(min, max);
        } while (a === b);
        return a > b ? { bigger: a, smaller: b } : { bigger: b, smaller: a };
    }

    function makeFruitDifferenceQuestion() {
        const fruit = FRUITS[randomInt(0, FRUITS.length - 1)];
        const emoji = FRUIT_EMOJI[fruit];
        const { bigger, smaller } = makeDifferentPair(2, 8);
        return makeNumberQuestion(
            "fruit_difference",
            "くだもののちがい",
            `<span class="question-title">くだもののちがい</span><span class="fruit-equation"><span class="fruit-box">${repeatText(emoji, bigger)}</span><span class="compare-word">と</span><span class="fruit-box">${repeatText(emoji, smaller)}</span></span><span class="question-line">ふたつのちがいは、いくつ？</span>`,
            bigger - smaller
        );
    }

    function makeBlockGroup(count) {
        return `<span class="block-group">${repeatText("<span class=\"math-block\"></span>", count)}</span>`;
    }

    function makeBlockDifferenceQuestion() {
        const { bigger, smaller } = makeDifferentPair(3, 10);
        return makeNumberQuestion(
            "block_difference",
            "ブロックのちがい",
            `<span class="question-title">ブロックのちがい</span><span class="block-equation">${makeBlockGroup(bigger)}<span class="compare-word">と</span>${makeBlockGroup(smaller)}</span><span class="question-line">ふたつのちがいは、いくつ？</span>`,
            bigger - smaller
        );
    }

    function makeLengthDifferenceQuestion() {
        const { bigger, smaller } = makeDifferentPair(3, 10);
        return makeNumberQuestion(
            "length_difference",
            "ながさのちがい",
            `<span class="question-title">ながさのちがい</span><span class="length-bars"><span class="length-row"><span class="length-label">${bigger}cm</span>${makeLengthBar(bigger)}</span><span class="length-row"><span class="length-label">${smaller}cm</span>${makeLengthBar(smaller)}</span></span><span class="question-line">ふたつのちがいは何cm？</span>`,
            bigger - smaller
        );
    }

    function makeLengthBar(cm) {
        const ticks = Array.from({ length: cm + 1 }, (_, index) => (
            `<span class="length-tick ${index === 0 || index === cm ? "major" : ""}"></span>`
        )).join("");
        return `<span class="length-bar" style="--cm:${cm}">${ticks}</span>`;
    }

    function makeNoBorrowPair() {
        let a;
        let b;
        do {
            a = randomInt(20, 89);
            b = randomInt(1, 49);
        } while (a <= b || (a % 10) < (b % 10));
        return { a, b };
    }

    function makeNoBorrowQuestion() {
        const { a, b } = makeNoBorrowPair();
        return makeNumberQuestion(
            "no_borrow_subtraction",
            "くりさがりなし",
            `<span class="question-title">くりさがりなし</span><span class="simple-equation">${a} - ${b} = ?</span>`,
            a - b
        );
    }

    function makeBorrowPair() {
        let a;
        let b;
        do {
            a = randomInt(20, 89);
            b = randomInt(2, 49);
        } while (a <= b || (a % 10) >= (b % 10));
        return { a, b };
    }

    function makeBorrowQuestion() {
        const { a, b } = makeBorrowPair();
        return makeNumberQuestion(
            "borrow_subtraction",
            "くりさがりあり",
            `<span class="question-title">くりさがりあり</span><span class="simple-equation">${a} - ${b} = ?</span>`,
            a - b
        );
    }

    function makeMissingQuestion() {
        const answer = randomInt(2, 18);
        const b = randomInt(2, 18);
        const total = answer + b;
        const hideStart = randomInt(0, 1) === 0;
        const prompt = hideStart ? `□ - ${b} = ${answer}` : `${total} - □ = ${answer}`;
        return makeNumberQuestion(
            "missing_subtraction",
            "虫くいひきざん",
            `<span class="question-title">虫くいひきざん</span><span class="simple-equation">${prompt}</span><span class="question-line">□に入る数は？</span>`,
            hideStart ? total : b
        );
    }

    window.LearningLaboTests.math_subtraction = {
        createQuestions(count) {
            const questions = PLAN.flatMap((item) => (
                Array.from({ length: item.count }, () => item.maker())
            ));
            return questions.slice(0, count);
        }
    };
})();
