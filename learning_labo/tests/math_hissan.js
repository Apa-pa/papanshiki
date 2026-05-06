(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const PLAN = [
        { count: 3, maker: makeAdditionNoCarryQuestion },
        { count: 1, maker: makeAdditionCarryDigitHoleQuestion },
        { count: 2, maker: makeAdditionCarryTensHoleQuestion },
        { count: 3, maker: makeAdditionCarryQuestion },
        { count: 3, maker: makeSubtractionNoBorrowQuestion },
        { count: 3, maker: makeSubtractionBorrowHoleQuestion },
        { count: 3, maker: makeSubtractionBorrowQuestion },
        { count: 2, maker: makeMistakeSearchQuestion }
    ];

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function shuffle(items) {
        const list = [...items];
        for (let index = list.length - 1; index > 0; index -= 1) {
            const other = Math.floor(Math.random() * (index + 1));
            [list[index], list[other]] = [list[other], list[index]];
        }
        return list;
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

    function makeChoiceQuestion(type, title, promptHtml, answer, choices) {
        return {
            type,
            title,
            promptHtml,
            answer,
            choices
        };
    }

    function digitSpan(digit, className = "") {
        const value = digit === " " ? "&nbsp;" : String(digit);
        const extra = className ? ` ${className}` : "";
        return `<span class="hissan-digit${extra}">${value}</span>`;
    }

    function renderDigits(value, options = {}) {
        const width = options.width || 3;
        const boxIndex = typeof options.boxIndex === "number" ? options.boxIndex : -1;
        const blankIndexes = Array.isArray(options.blankIndexes) ? options.blankIndexes : [];
        const fadedIndexes = Array.isArray(options.fadedIndexes) ? options.fadedIndexes : [];
        const borrowFromIndexes = Array.isArray(options.borrowFromIndexes) ? options.borrowFromIndexes : [];
        const digits = String(value).padStart(width, " ").split("");

        return digits.map((digit, index) => {
            if (digit === " ") return digitSpan(" ", "is-empty");
            if (index === boxIndex) return digitSpan("□", "hissan-box");
            if (blankIndexes.includes(index)) return digitSpan(" ", "hissan-box is-empty-text");
            if (borrowFromIndexes.includes(index)) return digitSpan(digit, "hissan-borrow-from");
            if (fadedIndexes.includes(index)) return digitSpan(digit, "is-faded");
            return digitSpan(digit);
        }).join("");
    }

    function makeCarryRow(carryValue, width, activeColumn) {
        const cells = Array.from({ length: width + 1 }, (_, index) => {
            if (index === 0) return digitSpan(" ", "is-empty");
            if (index === activeColumn) {
                const className = carryValue === "□" ? "hissan-carry hissan-box hissan-carry-box" : "hissan-carry";
                return digitSpan(carryValue, className);
            }
            return digitSpan(" ", "is-empty");
        }).join("");
        return `<span class="hissan-row hissan-carry-row">${cells}</span>`;
    }

    function makeHissanPrompt(config) {
        const width = config.width || 3;
        const topDigits = renderDigits(config.top, {
            width,
            boxIndex: config.topBoxIndex,
            blankIndexes: config.topBlankIndexes,
            fadedIndexes: config.topFadedIndexes,
            borrowFromIndexes: config.topBorrowFromIndexes
        });
        const bottomDigits = renderDigits(config.bottom, {
            width,
            boxIndex: config.bottomBoxIndex,
            blankIndexes: config.bottomBlankIndexes,
            fadedIndexes: config.bottomFadedIndexes
        });
        const resultDigits = typeof config.result === "undefined"
            ? ""
            : `<span class="hissan-row hissan-result-row"><span class="hissan-operator is-empty"> </span>${renderDigits(config.result, {
                width,
                boxIndex: config.resultBoxIndex,
                blankIndexes: config.resultBlankIndexes,
                fadedIndexes: config.resultFadedIndexes
            })}</span>`;
        const carryRow = config.carryRowHtml || "";

        return `
            <span class="question-title">${config.title}</span>
            <span class="hissan-wrap">
                <span class="hissan-problem" aria-label="${config.ariaLabel}">
                    ${carryRow}
                    <span class="hissan-row"><span class="hissan-operator is-empty"> </span>${topDigits}</span>
                    <span class="hissan-row"><span class="hissan-operator">${config.operator}</span>${bottomDigits}</span>
                    <span class="hissan-line"></span>
                    ${resultDigits}
                </span>
            </span>
            <span class="question-line">${config.questionLine}</span>
        `;
    }

    function makeAdditionNoCarryPair() {
        let a;
        let b;
        do {
            a = randomInt(21, 74);
            b = randomInt(12, 25);
        } while (a + b > 99 || (a % 10) + (b % 10) >= 10);
        return { a, b };
    }

    function makeAdditionCarryPair() {
        let a;
        let b;
        do {
            a = randomInt(27, 68);
            b = randomInt(15, 39);
        } while (a + b > 99 || (a % 10) + (b % 10) < 10);
        return { a, b };
    }

    function makeSubtractionNoBorrowPair() {
        let a;
        let b;
        do {
            a = randomInt(41, 98);
            b = randomInt(11, 46);
        } while (a <= b || (a % 10) < (b % 10));
        return { a, b };
    }

    function makeSubtractionBorrowPair() {
        let a;
        let b;
        do {
            a = randomInt(41, 98);
            b = randomInt(12, 48);
        } while (a <= b || (a % 10) >= (b % 10));
        return { a, b };
    }

    function makeAdditionNoCarryQuestion() {
        const { a, b } = makeAdditionNoCarryPair();
        return makeNumberQuestion(
            "hissan_addition_no_carry",
            "ひっさん たしざん",
            makeHissanPrompt({
                title: "ひっさん たしざん",
                top: a,
                bottom: b,
                operator: "+",
                ariaLabel: `${a} たす ${b}`,
                questionLine: "ひっさんで こたえをだしてね"
            }),
            a + b
        );
    }

    function makeAdditionCarryDigitHoleQuestion() {
        const { a, b } = makeAdditionCarryPair();
        return makeNumberQuestion(
            "hissan_addition_carry_digit_hole",
            "くりあがりの数字",
            makeHissanPrompt({
                title: "くりあがりの数字",
                top: a,
                bottom: b,
                operator: "+",
                ariaLabel: `${a} たす ${b}`,
                carryRowHtml: makeCarryRow("□", 3, 2),
                result: a + b,
                questionLine: "□に入る くりあがりの数字は？"
            }),
            1
        );
    }

    function makeAdditionCarryTensHoleQuestion() {
        const { a, b } = makeAdditionCarryPair();
        const answer = a + b;
        return makeNumberQuestion(
            "hissan_addition_carry_tens_hole",
            "こたえの 10のくら",
            makeHissanPrompt({
                title: "こたえの 10のくら",
                top: a,
                bottom: b,
                operator: "+",
                ariaLabel: `${a} たす ${b}`,
                carryRowHtml: makeCarryRow("1", 3, 2),
                result: answer,
                resultBoxIndex: 1,
                questionLine: "こたえの 10のくらは いくつ？"
            }),
            Math.floor(answer / 10)
        );
    }

    function makeAdditionCarryQuestion() {
        const { a, b } = makeAdditionCarryPair();
        return makeNumberQuestion(
            "hissan_addition_carry",
            "ひっさん くりあがり",
            makeHissanPrompt({
                title: "ひっさん くりあがり",
                top: a,
                bottom: b,
                operator: "+",
                ariaLabel: `${a} たす ${b}`,
                carryRowHtml: makeCarryRow("1", 3, 2),
                questionLine: "くりあがりに気をつけて こたえてね"
            }),
            a + b
        );
    }

    function makeSubtractionNoBorrowQuestion() {
        const { a, b } = makeSubtractionNoBorrowPair();
        return makeNumberQuestion(
            "hissan_subtraction_no_borrow",
            "ひっさん ひきざん",
            makeHissanPrompt({
                title: "ひっさん ひきざん",
                top: a,
                bottom: b,
                operator: "-",
                ariaLabel: `${a} ひく ${b}`,
                questionLine: "ひっさんで こたえをだしてね"
            }),
            a - b
        );
    }

    function makeSubtractionBorrowHoleQuestion() {
        const { a, b } = makeSubtractionBorrowPair();
        const newTensDigit = Math.floor(a / 10) - 1;
        return makeNumberQuestion(
            "hissan_subtraction_borrow_hole",
            "くりさがりの数字",
            makeHissanPrompt({
                title: "くりさがりの数字",
                top: a,
                bottom: b,
                operator: "-",
                ariaLabel: `${a} ひく ${b}`,
                topBorrowFromIndexes: [1],
                carryRowHtml: makeCarryRow("□", 3, 2),
                questionLine: "くりさがると、10のくらは いくつ？"
            }),
            newTensDigit
        );
    }

    function makeSubtractionBorrowQuestion() {
        const { a, b } = makeSubtractionBorrowPair();
        return makeNumberQuestion(
            "hissan_subtraction_borrow",
            "ひっさん くりさがり",
            makeHissanPrompt({
                title: "ひっさん くりさがり",
                top: a,
                bottom: b,
                operator: "-",
                ariaLabel: `${a} ひく ${b}`,
                questionLine: "くりさがりに気をつけて こたえてね"
            }),
            a - b
        );
    }

    function makeAdditionMistakeQuestion() {
        const { a, b } = makeAdditionCarryPair();
        const wrongResult = (Math.floor(a / 10) + Math.floor(b / 10)) * 10 + ((a + b) % 10);
        return makeChoiceQuestion(
            "hissan_mistake_addition",
            "まちがいさがし たしざん",
            makeHissanPrompt({
                title: "まちがいさがし",
                top: a,
                bottom: b,
                result: wrongResult,
                operator: "+",
                ariaLabel: `${a} たす ${b} は ${wrongResult}`,
                questionLine: "どこが まちがっているかな？"
            }),
            "carry",
            [
                { value: "carry", labelHtml: "くりあがりを<br>わすれている" },
                { value: "ones", labelHtml: "1のくらが<br>ちがう" },
                { value: "correct", labelHtml: "これで<br>せいかい" },
                { value: "operator", labelHtml: "しるしが<br>ちがう" }
            ]
        );
    }

    function makeSubtractionMistakeQuestion() {
        const { a, b } = makeSubtractionBorrowPair();
        const wrongResult = ((Math.floor(a / 10) - Math.floor(b / 10)) * 10) + ((a % 10) + 10 - (b % 10));
        return makeChoiceQuestion(
            "hissan_mistake_subtraction",
            "まちがいさがし ひきざん",
            makeHissanPrompt({
                title: "まちがいさがし",
                top: a,
                bottom: b,
                result: wrongResult,
                operator: "-",
                ariaLabel: `${a} ひく ${b} は ${wrongResult}`,
                questionLine: "どこが まちがっているかな？"
            }),
            "borrow",
            [
                { value: "borrow", labelHtml: "くりさがりを<br>わすれている" },
                { value: "ones", labelHtml: "1のくらが<br>ちがう" },
                { value: "correct", labelHtml: "これで<br>せいかい" },
                { value: "operator", labelHtml: "しるしが<br>ちがう" }
            ]
        );
    }

    function makeMistakeSearchQuestion() {
        return shuffle([
            makeAdditionMistakeQuestion(),
            makeSubtractionMistakeQuestion()
        ])[0];
    }

    window.LearningLaboTests.math_hissan = {
        createQuestions(count) {
            const mistakeQuestions = shuffle([
                makeAdditionMistakeQuestion(),
                makeSubtractionMistakeQuestion()
            ]);
            const questions = [];

            PLAN.forEach((item) => {
                if (item.maker === makeMistakeSearchQuestion) {
                    questions.push(...mistakeQuestions.slice(0, item.count));
                    return;
                }
                for (let index = 0; index < item.count; index += 1) {
                    questions.push(item.maker());
                }
            });

            return questions.slice(0, count);
        }
    };
})();
