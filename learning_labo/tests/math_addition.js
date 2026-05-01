(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const PLAN = [
        { count: 4, maker: makeFruitQuestion },
        { count: 2, maker: makeBlockQuestion },
        { count: 2, maker: makeLengthQuestion },
        { count: 4, maker: makeNoCarryQuestion },
        { count: 4, maker: makeCarryQuestion },
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

    function shuffle(items) {
        const list = [...items];
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
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

    function makeFruitQuestion() {
        const fruit = FRUITS[randomInt(0, FRUITS.length - 1)];
        const emoji = FRUIT_EMOJI[fruit];
        const a = randomInt(1, 6);
        const b = randomInt(1, 6);
        const answer = a + b;
        return makeNumberQuestion(
            "fruit_addition",
            "くだものをたす",
            `<span class="question-title">くだものをたす</span><span class="fruit-equation"><span class="fruit-box">${repeatText(emoji, a)}</span><span class="operator">+</span><span class="fruit-box">${repeatText(emoji, b)}</span></span><span class="question-line">${fruit}はぜんぶでいくつ？</span>`,
            answer
        );
    }

    function makeBlockGroup(count) {
        return `<span class="block-group">${repeatText("<span class=\"math-block\"></span>", count)}</span>`;
    }

    function makeBlockQuestion() {
        const a = randomInt(2, 8);
        const b = randomInt(2, 8);
        const answer = a + b;
        return makeNumberQuestion(
            "block_addition",
            "ブロックをたす",
            `<span class="question-title">ブロックをたす</span><span class="block-equation">${makeBlockGroup(a)}<span class="operator">+</span>${makeBlockGroup(b)}</span><span class="question-line">${a} + ${b} = ?</span>`,
            answer
        );
    }

    function makeLengthQuestion() {
        const a = randomInt(3, 10);
        const b = randomInt(3, 10);
        const answer = a + b;
        return makeNumberQuestion(
            "length_addition",
            "ながさをたす",
            `<span class="question-title">ながさをたす</span><span class="length-bars"><span class="length-row"><span class="length-label">${a}cm</span>${makeLengthBar(a)}</span><span class="length-row"><span class="length-label">${b}cm</span>${makeLengthBar(b)}</span></span><span class="question-line">あわせて何cm？</span>`,
            answer
        );
    }

    function makeLengthBar(cm) {
        const ticks = Array.from({ length: cm + 1 }, (_, index) => (
            `<span class="length-tick ${index === 0 || index === cm ? "major" : ""}"></span>`
        )).join("");
        return `<span class="length-bar" style="--cm:${cm}">${ticks}</span>`;
    }

    function makeNoCarryPair() {
        let a;
        let b;
        do {
            a = randomInt(10, 49);
            b = randomInt(1, 40);
        } while ((a % 10) + (b % 10) >= 10 || a + b > 89);
        return { a, b };
    }

    function makeNoCarryQuestion() {
        const { a, b } = makeNoCarryPair();
        return makeNumberQuestion(
            "no_carry_addition",
            "くりあがりなし",
            `<span class="question-title">くりあがりなし</span><span class="simple-equation">${a} + ${b} = ?</span>`,
            a + b
        );
    }

    function makeCarryPair() {
        let a;
        let b;
        do {
            a = randomInt(8, 49);
            b = randomInt(2, 49);
        } while ((a % 10) + (b % 10) < 10 || a + b > 99);
        return { a, b };
    }

    function makeCarryQuestion() {
        const { a, b } = makeCarryPair();
        return makeNumberQuestion(
            "carry_addition",
            "くりあがりあり",
            `<span class="question-title">くりあがりあり</span><span class="simple-equation">${a} + ${b} = ?</span>`,
            a + b
        );
    }

    function makeMissingQuestion() {
        const total = [10, 20, 30][randomInt(0, 2)];
        const a = randomInt(1, total - 1);
        const answer = total - a;
        return makeNumberQuestion(
            "missing_addition",
            "虫くいたしざん",
            `<span class="question-title">虫くいたしざん</span><span class="simple-equation">${a} + □ = ${total}</span><span class="question-line">□に入る数は？</span>`,
            answer
        );
    }

    window.LearningLaboTests.math_addition = {
        createQuestions(count) {
            const questions = PLAN.flatMap((item) => (
                Array.from({ length: item.count }, () => item.maker())
            ));
            return questions.slice(0, count);
        }
    };
})();
