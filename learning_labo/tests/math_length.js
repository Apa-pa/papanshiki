(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const PLAN = [
        { count: 3, maker: makeCmToMmQuestion },
        { count: 3, maker: makeMmToCmQuestion },
        { count: 4, maker: makeRulerQuestion },
        { count: 3, maker: makeLengthAdditionQuestion },
        { count: 3, maker: makeLengthDifferenceQuestion },
        { count: 1, maker: makeHundredCmQuestion },
        { count: 1, maker: makeThousandMQuestion },
        { count: 1, maker: makeShortToLongQuestion },
        { count: 1, maker: makeLongToShortQuestion }
    ];

    const UNIT_CHOICES = [
        { value: "mm", labelHtml: "1mm" },
        { value: "cm", labelHtml: "1cm" },
        { value: "m", labelHtml: "1m" },
        { value: "km", labelHtml: "1km" }
    ];

    function shuffle(items) {
        const list = [...items];
        for (let index = list.length - 1; index > 0; index -= 1) {
            const other = Math.floor(Math.random() * (index + 1));
            [list[index], list[other]] = [list[other], list[index]];
        }
        return list;
    }

    function range(min, max) {
        return Array.from({ length: max - min + 1 }, (_, index) => min + index);
    }

    function takeOne(pool) {
        return pool.shift();
    }

    function createAdditionPool() {
        const items = [];
        for (let aCm = 1; aCm <= 4; aCm += 1) {
            for (let aMm = 0; aMm <= 6; aMm += 1) {
                for (let bCm = 1; bCm <= 4; bCm += 1) {
                    for (let bMm = 0; bMm <= 9 - aMm; bMm += 1) {
                        items.push({ aCm, aMm, bCm, bMm });
                    }
                }
            }
        }
        return shuffle(items);
    }

    function createDifferencePool() {
        const items = [];
        for (let biggerCm = 4; biggerCm <= 9; biggerCm += 1) {
            for (let smallerCm = 1; smallerCm < biggerCm; smallerCm += 1) {
                for (let smallerMm = 0; smallerMm <= 8; smallerMm += 1) {
                    for (let biggerMm = smallerMm; biggerMm <= 9; biggerMm += 1) {
                        items.push({ biggerCm, biggerMm, smallerCm, smallerMm });
                    }
                }
            }
        }
        return shuffle(items);
    }

    function createContext() {
        return {
            cmToMm: shuffle(range(2, 9)),
            cmToMmCount: 0,
            mmToCm: shuffle(range(2, 9)),
            mmToCmCount: 0,
            ruler: shuffle(range(12, 59)),
            addition: createAdditionPool(),
            difference: createDifferencePool()
        };
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

    function makeLengthQuestion(type, title, promptHtml, answerCm, answerMm) {
        return {
            type,
            title,
            promptHtml,
            answerCm,
            answerMm,
            inputMode: "length"
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

    function toParts(totalMm) {
        return {
            cm: Math.floor(totalMm / 10),
            mm: totalMm % 10
        };
    }

    function formatLength(totalMm) {
        const parts = toParts(totalMm);
        return `${parts.cm}cm${parts.mm}mm`;
    }

    function makeUnitLine(text) {
        return `<span class="length-unit-line">${text}</span>`;
    }

    function makeRulerObject(totalMm) {
        const maxMm = 60;
        const ticks = Array.from({ length: maxMm + 1 }, (_, mm) => {
            const className = mm % 10 === 0 ? "major" : (mm % 5 === 0 ? "middle" : "");
            const label = mm % 10 === 0 ? `<span>${mm / 10}</span>` : "";
            return `<span class="length-ruler-tick ${className}" style="--mm-index:${mm};--max-mm:${maxMm}">${label}</span>`;
        }).join("");
        return `
            <span class="length-ruler-scene" style="--max-mm:${maxMm}">
                <span class="length-ruler-object" style="--mm:${totalMm};--max-mm:${maxMm}"><span class="length-ruler-guide"></span></span>
                <span class="length-ruler">${ticks}</span>
            </span>
        `;
    }

    function makeCmToMmQuestion(context) {
        const cm = takeOne(context.cmToMm);
        const showHint = context.cmToMmCount === 0;
        context.cmToMmCount += 1;
        return makeNumberQuestion(
            "length_cm_to_mm",
            "cmをmmにする",
            `<span class="question-title">cmをmmにする</span>${makeUnitLine(`${cm}cm = ?mm`)}${showHint ? `<span class="question-line">1cmは10mmだよ。</span>` : ""}`,
            cm * 10
        );
    }

    function makeMmToCmQuestion(context) {
        const cm = takeOne(context.mmToCm);
        const mm = cm * 10;
        const showHint = context.mmToCmCount === 0;
        context.mmToCmCount += 1;
        return makeNumberQuestion(
            "length_mm_to_cm",
            "mmをcmにする",
            `<span class="question-title">mmをcmにする</span>${makeUnitLine(`${mm}mm = ?cm`)}${showHint ? `<span class="question-line">10mmで1cmだよ。</span>` : ""}`,
            cm
        );
    }

    function makeRulerQuestion(context) {
        const totalMm = takeOne(context.ruler);
        const answer = toParts(totalMm);
        return makeLengthQuestion(
            "length_ruler_cm_mm",
            "ものさしでよむ",
            `<span class="question-title">ものさしでよむ</span>${makeRulerObject(totalMm)}<span class="question-line">ものの<ruby>長<rt>なが</rt></ruby>さは<ruby>何<rt>なん</rt></ruby>cm<ruby>何<rt>なん</rt></ruby>mm？</span>`,
            answer.cm,
            answer.mm
        );
    }

    function makeLengthAdditionQuestion(context) {
        const { aCm, aMm, bCm, bMm } = takeOne(context.addition);
        const totalMm = (aCm + bCm) * 10 + aMm + bMm;
        const answer = toParts(totalMm);
        return makeLengthQuestion(
            "length_addition_no_carry",
            "ながさのたし算",
            `<span class="question-title">ながさのたし<ruby>算<rt>ざん</rt></ruby></span>${makeUnitLine(`${aCm}cm${aMm}mm + ${bCm}cm${bMm}mm`)}<span class="question-line">あわせて<ruby>何<rt>なん</rt></ruby>cm<ruby>何<rt>なん</rt></ruby>mm？</span>`,
            answer.cm,
            answer.mm
        );
    }

    function makeLengthDifferenceQuestion(context) {
        const { biggerCm, biggerMm, smallerCm, smallerMm } = takeOne(context.difference);
        const biggerTotal = biggerCm * 10 + biggerMm;
        const smallerTotal = smallerCm * 10 + smallerMm;
        const answer = toParts(biggerTotal - smallerTotal);
        return makeLengthQuestion(
            "length_difference_no_borrow",
            "ながさのちがい",
            `<span class="question-title">ながさのちがい</span><span class="length-bars"><span class="length-row"><span class="length-label">${formatLength(biggerTotal)}</span>${makeLengthMmBar(biggerTotal)}</span><span class="length-row"><span class="length-label">${formatLength(smallerTotal)}</span>${makeLengthMmBar(smallerTotal)}</span></span><span class="question-line">ちがいは<ruby>何<rt>なん</rt></ruby>cm<ruby>何<rt>なん</rt></ruby>mm？</span>`,
            answer.cm,
            answer.mm
        );
    }

    function makeLengthMmBar(totalMm) {
        const cm = Math.ceil(totalMm / 10);
        const ticks = Array.from({ length: cm + 1 }, (_, index) => (
            `<span class="length-tick ${index === 0 || index === cm ? "major" : ""}"></span>`
        )).join("");
        return `<span class="length-bar length-mm-bar" style="--cm:${cm};--mm:${totalMm}">${ticks}</span>`;
    }

    function makeHundredCmQuestion() {
        return makeChoiceQuestion(
            "length_100cm_unit",
            "100cmのたんい",
            `<span class="question-title">100センチをあらわす<ruby>単位<rt>たんい</rt></ruby></span>${makeUnitLine("100cm = 1?")}<span class="question-line">どの<ruby>単位<rt>たんい</rt></ruby>であらわせるかな？</span>`,
            "m",
            shuffle(UNIT_CHOICES)
        );
    }

    function makeThousandMQuestion() {
        return makeChoiceQuestion(
            "length_1000m_unit",
            "1000mのたんい",
            `<span class="question-title">1000メートルをあらわす<ruby>単位<rt>たんい</rt></ruby></span>${makeUnitLine("1000m = 1?")}<span class="question-line">どの<ruby>単位<rt>たんい</rt></ruby>であらわせるかな？</span>`,
            "km",
            shuffle(UNIT_CHOICES)
        );
    }

    function makeUnitOrderQuestion(type, title, titleHtml, prompt, orderedUnits) {
        return {
            type,
            title,
            promptHtml: `<span class="question-title">${titleHtml}</span><span class="question-line">${prompt}</span>`,
            answer: "ok",
            sequenceClass: "kana-match length-unit-order",
            sequenceItems: orderedUnits.map((unit, index) => ({
                label: `1${unit}`,
                index
            }))
        };
    }

    function makeShortToLongQuestion() {
        return makeUnitOrderQuestion(
            "length_order_short_to_long",
            "短い順にタップしよう",
            "<ruby>短<rt>みじか</rt></ruby>い<ruby>順<rt>じゅん</rt></ruby>にタップしよう",
            "<ruby>短<rt>みじか</rt></ruby>いものから<ruby>順番<rt>じゅんばん</rt></ruby>にタップしてね。",
            ["mm", "cm", "m", "km"]
        );
    }

    function makeLongToShortQuestion() {
        return makeUnitOrderQuestion(
            "length_order_long_to_short",
            "長い順にタップしよう",
            "<ruby>長<rt>なが</rt></ruby>い<ruby>順<rt>じゅん</rt></ruby>にタップしよう",
            "<ruby>長<rt>なが</rt></ruby>いものから<ruby>順番<rt>じゅんばん</rt></ruby>にタップしてね。",
            ["km", "m", "cm", "mm"]
        );
    }

    window.LearningLaboTests.math_length = {
        createQuestions(count) {
            const context = createContext();
            const questions = PLAN.flatMap((item) => (
                Array.from({ length: item.count }, () => item.maker(context))
            ));
            return questions.slice(0, count);
        }
    };
})();
