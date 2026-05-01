(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const PLAN = [
        { count: 4, maker: makeArrayQuestion },
        { count: 4, maker: makeGroupQuestion },
        { count: 8, maker: makeSimpleQuestion },
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

    function makeArrayQuestion() {
        const rows = randomInt(2, 4);
        const columns = randomInt(2, 5);
        return makeNumberQuestion(
            "array_multiplication",
            "ならんだものを数える",
            `<span class="question-title">ならんだものを数える</span>${makeBlockArray(rows, columns)}<span class="question-line">${rows}ぎょう、${columns}れつ。ぜんぶでいくつ？</span>`,
            rows * columns
        );
    }

    function makeBlockArray(rows, columns) {
        return `<span class="block-array" style="--columns:${columns}">${repeatText("<span class=\"math-block\"></span>", rows * columns)}</span>`;
    }

    function makeGroupQuestion() {
        const fruit = FRUITS[randomInt(0, FRUITS.length - 1)];
        const emoji = FRUIT_EMOJI[fruit];
        const perBox = randomInt(2, 6);
        const boxCount = randomInt(2, 6);
        return makeNumberQuestion(
            "group_multiplication",
            "同じ数のまとまり",
            `<span class="question-title">同じ数のまとまり</span><span class="multiplication-scene"><span class="single-box">${repeatText(emoji, perBox)}</span><span class="group-copy">1つの箱に ${perBox}こ<br>おなじ箱が ${boxCount}こ</span></span><span class="question-line">${fruit}はぜんぶでいくつ？</span>`,
            perBox * boxCount
        );
    }

    function makeSimpleQuestion() {
        const a = randomInt(2, 9);
        const b = randomInt(2, 9);
        return makeNumberQuestion(
            "simple_multiplication",
            "九九シンプル",
            `<span class="question-title">九九シンプル</span><span class="simple-equation">${a} × ${b} = ?</span>`,
            a * b
        );
    }

    function makeMissingQuestion() {
        const a = randomInt(2, 9);
        const b = randomInt(2, 9);
        const hideFirst = randomInt(0, 1) === 0;
        const prompt = hideFirst ? `□ × ${b} = ${a * b}` : `${a} × □ = ${a * b}`;
        return makeNumberQuestion(
            "missing_multiplication",
            "虫くいかけざん",
            `<span class="question-title">虫くいかけざん</span><span class="simple-equation">${prompt}</span><span class="question-line">□に入る数は？</span>`,
            hideFirst ? a : b
        );
    }

    window.LearningLaboTests.math_multiplication = {
        createQuestions(count) {
            const questions = PLAN.flatMap((item) => (
                Array.from({ length: item.count }, () => item.maker())
            ));
            return questions.slice(0, count);
        }
    };
})();
