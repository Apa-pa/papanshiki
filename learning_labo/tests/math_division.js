(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const PLAN = [
        { count: 4, maker: makeSharingQuestion },
        { count: 4, maker: makeGroupingQuestion },
        { count: 6, maker: makeSimpleQuestion },
        { count: 4, maker: makeMissingQuestion },
        { count: 2, maker: makeRemainderQuestion }
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

    function makeFruitPile(emoji, count) {
        return `<span class="fruit-pile">${repeatText(emoji, count)}</span>`;
    }

    function makeDishRow(count, label) {
        return `<span class="dish-row">${repeatText("<span class=\"empty-dish\"></span>", count)}<span class="division-note">${label}</span></span>`;
    }

    function makeSharingQuestion() {
        const fruit = FRUITS[randomInt(0, FRUITS.length - 1)];
        const emoji = FRUIT_EMOJI[fruit];
        const people = randomInt(2, 5);
        const perPerson = randomInt(2, 6);
        const total = people * perPerson;
        return makeNumberQuestion(
            "sharing_division",
            "同じ数ずつわける",
            `<span class="question-title">同じ数ずつわける</span><span class="division-scene">${makeFruitPile(emoji, total)}${makeDishRow(people, `${people}人に同じ数ずつ`)}</span><span class="question-line">${fruit}が${total}こ。1人ぶんは何こ？</span>`,
            perPerson
        );
    }

    function makeGroupingQuestion() {
        const fruit = FRUITS[randomInt(0, FRUITS.length - 1)];
        const emoji = FRUIT_EMOJI[fruit];
        const perBox = randomInt(2, 6);
        const boxCount = randomInt(2, 6);
        const total = perBox * boxCount;
        return makeNumberQuestion(
            "grouping_division",
            "何グループできるか",
            `<span class="question-title">何グループできるか</span><span class="division-scene">${makeFruitPile(emoji, total)}<span class="multiplication-scene"><span class="single-box">${repeatText(emoji, perBox)}</span><span class="group-copy">1つの箱に ${perBox}こずつ</span></span></span><span class="question-line">${fruit}が${total}こ。箱はいくつできる？</span>`,
            boxCount
        );
    }

    function makeSimpleQuestion() {
        const answer = randomInt(2, 9);
        const divisor = randomInt(2, 9);
        const total = answer * divisor;
        return makeNumberQuestion(
            "simple_division",
            "九九から考えるわりざん",
            `<span class="question-title">九九から考えるわりざん</span><span class="simple-equation">${total} ÷ ${divisor} = ?</span>`,
            answer
        );
    }

    function makeMissingQuestion() {
        const answer = randomInt(2, 9);
        const divisor = randomInt(2, 9);
        const total = answer * divisor;
        const hideTotal = randomInt(0, 1) === 0;
        const prompt = hideTotal ? `□ ÷ ${divisor} = ${answer}` : `${total} ÷ □ = ${answer}`;
        return makeNumberQuestion(
            "missing_division",
            "虫くいわりざん",
            `<span class="question-title">虫くいわりざん</span><span class="simple-equation">${prompt}</span><span class="question-line">□に入る数は？</span>`,
            hideTotal ? total : divisor
        );
    }

    function makeRemainderQuestion() {
        const fruit = FRUITS[randomInt(0, FRUITS.length - 1)];
        const emoji = FRUIT_EMOJI[fruit];
        const divisor = randomInt(3, 6);
        const quotient = randomInt(2, 5);
        const remainder = randomInt(1, divisor - 1);
        const total = divisor * quotient + remainder;
        return makeNumberQuestion(
            "remainder_division",
            "あまりのあるわりざん",
            `<span class="question-title">あまりのあるわりざん</span><span class="division-scene">${makeFruitPile(emoji, total)}${makeDishRow(divisor, `${divisor}人に同じ数ずつ`)}</span><span class="question-line">${fruit}が${total}こ。あまりは何こ？</span>`,
            remainder
        );
    }

    window.LearningLaboTests.math_division = {
        createQuestions(count) {
            const questions = PLAN.flatMap((item) => (
                Array.from({ length: item.count }, () => item.maker())
            ));
            return questions.slice(0, count);
        }
    };
})();
