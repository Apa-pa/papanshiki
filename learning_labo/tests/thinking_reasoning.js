(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const PLAN = [
        { count: 4, maker: makeClassifyQuestion },
        { count: 4, maker: makeOrderQuestion },
        { count: 4, maker: makeMatchingQuestion },
        { count: 4, maker: makeContradictionQuestion },
        { count: 4, maker: makeTruthLieQuestion }
    ];

    const r = (value, labelHtml) => ({ value, labelHtml });

    const CLASSIFY = [
        q(
            "classify_odd_food",
            "なかまはずれ",
            `<span class="question-line">「たべもの」のなかまではないものはどれ？</span>`,
            "chair",
            [r("apple", "りんご"), r("bread", "パン"), r("milk", "牛乳"), r("chair", "いす")]
        ),
        q(
            "classify_odd_tool",
            "なかまはずれ",
            `<span class="question-line">「かくもの・けすもの」のなかまではないものはどれ？</span>`,
            "cup",
            [r("pencil", "えんぴつ"), r("eraser", "けしゴム"), r("crayon", "クレヨン"), r("cup", "コップ")]
        ),
        q(
            "classify_rule_red_round",
            "ルールに合うもの",
            `<span class="question-line">ルールは「赤くて、まるいもの」です。合うものはどれ？</span>`,
            "red_circle",
            [r("red_circle", "赤いまる"), r("red_square", "赤いしかく"), r("blue_circle", "青いまる"), r("blue_square", "青いしかく")]
        ),
        q(
            "classify_rule_not_blue",
            "ルールに合うもの",
            `<span class="question-line">ルールは「青ではなくて、三角でもない」です。合うものはどれ？</span>`,
            "red_circle",
            [r("blue_circle", "青いまる"), r("red_triangle", "赤い三角"), r("blue_square", "青いしかく"), r("red_circle", "赤いまる")]
        ),
        q(
            "classify_same_group",
            "同じなかま",
            `<span class="question-line">「はさみ・のり・セロテープ」と同じなかまはどれ？</span>`,
            "stapler",
            [r("stapler", "ホチキス"), r("banana", "バナナ"), r("shoes", "くつ"), r("clock", "とけい")]
        ),
        q(
            "classify_rule_place",
            "ルールに合うもの",
            `<span class="question-line">ルールは「学校にありそうで、外では使わないもの」です。合うものはどれ？</span>`,
            "blackboard",
            [r("blackboard", "黒板"), r("umbrella", "かさ"), r("bicycle", "じてんしゃ"), r("sandals", "サンダル")]
        )
    ];

    const ORDER = [
        q(
            "order_line_easy",
            "じゅんばん推理",
            lines([
                "ヒーはアンより前です。",
                "ピッピは一番後ろです。",
                "前から2番目はだれ？"
            ]),
            "an",
            characterChoices()
        ),
        q(
            "order_height_middle",
            "じゅんばん推理",
            lines([
                "アンはヒーより高いです。",
                "ピッピはアンより高いです。",
                "真ん中の高さなのはだれ？"
            ]),
            "an",
            characterChoices()
        ),
        q(
            "order_left_right",
            "じゅんばん推理",
            lines([
                "3人が左から1列にならんでいます。",
                "ヒーは左はしではありません。",
                "アンはヒーのすぐ左です。",
                "ピッピは一番右ではありません。",
                "左はしはだれ？"
            ]),
            "an",
            characterChoices()
        ),
        q(
            "order_race_second",
            "じゅんばん推理",
            lines([
                "3人でかけっこをしました。",
                "ヒーは1位ではありません。",
                "アンはピッピより後ろです。",
                "ピッピは1位ではありません。",
                "2位はだれ？"
            ]),
            "pippi",
            characterChoices()
        ),
        q(
            "order_boxes",
            "じゅんばん推理",
            lines([
                "赤・青・黄の箱が左から1列にならんでいます。",
                "赤は左はしではありません。",
                "青は赤のすぐ右です。",
                "黄は右はしではありません。",
                "真ん中の箱は何色？"
            ]),
            "red",
            colorChoices()
        ),
        q(
            "order_books",
            "じゅんばん推理",
            lines([
                "国語・算数・音楽の本を上からつみました。",
                "算数は一番上ではありません。",
                "音楽は算数のすぐ下です。",
                "国語は一番下ではありません。",
                "一番上の本はどれ？"
            ]),
            "japanese",
            [r("japanese", "国語"), r("math", "算数"), r("music", "音楽"), r("science", "理科")]
        )
    ];

    const MATCHING = [
        q(
            "matching_hat_color",
            "対応推理",
            lines([
                "3人は赤・青・黄のぼうしを1つずつかぶっています。",
                "ピッピは赤いぼうしです。",
                "ヒーは青ではありません。",
                "アンのぼうしは何色？"
            ]),
            "blue",
            colorChoices()
        ),
        q(
            "matching_items",
            "対応推理",
            lines([
                "3人は本・ボール・かぎを1つずつ持っています。",
                "アンは本を持っていません。",
                "ヒーはかぎを持っていません。",
                "ピッピは本を持っています。",
                "ヒーが持っているものはどれ？"
            ]),
            "ball",
            [r("book", "本"), r("ball", "ボール"), r("key", "かぎ"), r("pencil", "えんぴつ")]
        ),
        q(
            "matching_drinks",
            "対応推理",
            lines([
                "3人は水・お茶・牛乳を1つずつ飲みました。",
                "ヒーは水ではありません。",
                "アンは牛乳ではありません。",
                "ピッピは水を飲みました。",
                "アンが飲んだものはどれ？"
            ]),
            "tea",
            [r("water", "水"), r("tea", "お茶"), r("milk", "牛乳"), r("juice", "ジュース")]
        ),
        q(
            "matching_seats",
            "対応推理",
            lines([
                "3人は1番・2番・3番の席に1人ずつすわりました。",
                "ヒーは1番ではありません。",
                "アンは3番ではありません。",
                "ピッピは1番です。",
                "ヒーの席は何番？"
            ]),
            "3",
            [r("1", "1番"), r("2", "2番"), r("3", "3番"), r("4", "4番")]
        ),
        q(
            "matching_fruit",
            "対応推理",
            lines([
                "3人はりんご・みかん・ぶどうを1つずつ選びました。",
                "アンはみかんではありません。",
                "ピッピはぶどうではありません。",
                "ヒーはみかんです。",
                "ピッピが選んだものはどれ？"
            ]),
            "apple",
            [r("apple", "りんご"), r("orange", "みかん"), r("grape", "ぶどう"), r("melon", "メロン")]
        ),
        q(
            "matching_rooms",
            "対応推理",
            lines([
                "3人は図書室・音楽室・体育館へ1人ずつ行きました。",
                "ヒーは体育館ではありません。",
                "アンは図書室ではありません。",
                "ピッピは体育館へ行きました。",
                "ヒーが行った場所はどこ？"
            ]),
            "library",
            [r("library", "図書室"), r("music", "音楽室"), r("gym", "体育館"), r("yard", "校庭")]
        )
    ];

    const CONTRADICTIONS = [
        q(
            "contradiction_front",
            "矛盾探し",
            contradictionLines([
                ["a", "ヒーは一番前です。"],
                ["b", "アンはヒーより前です。"],
                ["c", "ピッピは一番後ろです。"]
            ], "おかしい文はどれ？"),
            "b",
            contradictionChoices([
                ["a", "ヒーは一番前"],
                ["b", "アンはヒーより前"],
                ["c", "ピッピは一番後ろ"]
            ])
        ),
        q(
            "contradiction_tall",
            "矛盾探し",
            contradictionLines([
                ["a", "ヒーはアンより高いです。"],
                ["b", "アンはピッピより高いです。"],
                ["c", "ピッピはヒーより高いです。"]
            ], "AとBが正しいとすると、おかしい文はどれ？"),
            "c",
            contradictionChoices([
                ["a", "ヒーはアンより高い"],
                ["b", "アンはピッピより高い"],
                ["c", "ピッピはヒーより高い"]
            ])
        ),
        q(
            "contradiction_colors",
            "矛盾探し",
            contradictionLines([
                ["a", "赤い箱は左はしです。"],
                ["b", "青い箱は赤い箱のすぐ右です。"],
                ["c", "赤い箱は青い箱の右です。"]
            ], "おかしい文はどれ？"),
            "c",
            contradictionChoices([
                ["a", "赤い箱は左はし"],
                ["b", "青い箱は赤い箱のすぐ右"],
                ["c", "赤い箱は青い箱の右"]
            ])
        ),
        q(
            "contradiction_seats",
            "矛盾探し",
            contradictionLines([
                ["a", "アンは1番の席です。"],
                ["b", "ヒーはアンのとなりです。"],
                ["c", "ヒーは3番の席です。"]
            ], "席は1番・2番・3番で、となりは番号が1つちがう席です。おかしい文はどれ？"),
            "b",
            contradictionChoices([
                ["a", "アンは1番"],
                ["b", "ヒーはアンのとなり"],
                ["c", "ヒーは3番"]
            ])
        ),
        q(
            "contradiction_all_different",
            "矛盾探し",
            contradictionLines([
                ["a", "3人は赤・青・黄を1つずつ選びました。"],
                ["b", "ヒーは赤です。"],
                ["c", "アンも赤です。"]
            ], "おかしい文はどれ？"),
            "c",
            contradictionChoices([
                ["a", "3人は別々の色"],
                ["b", "ヒーは赤"],
                ["c", "アンも赤"]
            ])
        ),
        q(
            "contradiction_order",
            "矛盾探し",
            contradictionLines([
                ["a", "ピッピはアンより前です。"],
                ["b", "アンはヒーより前です。"],
                ["c", "ヒーはピッピより前です。"]
            ], "AとBが正しいとすると、おかしい文はどれ？"),
            "c",
            contradictionChoices([
                ["a", "ピッピはアンより前"],
                ["b", "アンはヒーより前"],
                ["c", "ヒーはピッピより前"]
            ])
        )
    ];

    const TRUTH_LIE = [
        q(
            "truth_one_winner",
            "ほんとう・うそ推理",
            lines([
                "かけっこの1位は1人です。",
                "本当のことを言っているのは1人だけです。",
                "ヒー「1位はアンです」",
                "アン「1位はアンではありません」",
                "ピッピ「1位はヒーではありません」",
                "1位はだれ？"
            ]),
            "hi",
            characterChoices()
        ),
        q(
            "truth_box_color",
            "ほんとう・うそ推理",
            lines([
                "あたりは赤・青・黄の箱のどれか1つです。",
                "本当のことを言っているのは1人だけです。",
                "ヒー「あたりは赤です」",
                "アン「あたりは赤ではありません」",
                "ピッピ「あたりは青ではありません」",
                "あたりの箱は何色？"
            ]),
            "blue",
            colorChoices()
        ),
        q(
            "truth_one_liar_pet",
            "ほんとう・うそ推理",
            lines([
                "なくしたカードは本・星・花のどれか1つです。",
                "うそを言っているのは1人だけです。",
                "ヒー「カードは本か星です」",
                "アン「カードは星です」",
                "ピッピ「カードは花です」",
                "なくしたカードはどれ？"
            ]),
            "star",
            [r("book", "本"), r("star", "星"), r("flower", "花"), r("moon", "月")]
        ),
        q(
            "truth_one_liar_seat",
            "ほんとう・うそ推理",
            lines([
                "ヒーの席は1番・2番・3番のどれかです。",
                "うそを言っているのは1人だけです。",
                "ヒー「ぼくの席は1番ではありません」",
                "アン「ヒーの席は2番です」",
                "ピッピ「ヒーの席は1番です」",
                "ヒーの席は何番？"
            ]),
            "2",
            [r("1", "1番"), r("2", "2番"), r("3", "3番"), r("4", "4番")]
        ),
        q(
            "truth_only_one_key",
            "ほんとう・うそ推理",
            lines([
                "かぎは赤・青・黄の箱のどれか1つに入っています。",
                "本当のことを言っているのは1人だけです。",
                "ヒー「赤い箱に入っています」",
                "アン「赤い箱には入っていません」",
                "ピッピ「青い箱には入っていません」",
                "かぎはどの箱？"
            ]),
            "blue",
            colorChoices()
        ),
        q(
            "truth_one_lie_rank",
            "ほんとう・うそ推理",
            lines([
                "アンの順位は1位・2位・3位のどれかです。",
                "うそを言っているのは1人だけです。",
                "ヒー「アンは1位ではありません」",
                "アン「わたしは2位です」",
                "ピッピ「アンは1位です」",
                "アンの順位は何位？"
            ]),
            "2",
            [r("1", "1位"), r("2", "2位"), r("3", "3位"), r("4", "4位")]
        )
    ];

    function q(type, title, promptHtml, answer, choices) {
        return { type, title, promptHtml, answer, choices };
    }

    function lines(items) {
        return items.map((item, index) => (
            index === items.length - 1
                ? `<span class="question-line"><strong>${item}</strong></span>`
                : `<span class="question-line">${item}</span>`
        )).join("");
    }

    function contradictionLines(items, questionText) {
        return `${items.map(([key, text]) => (
            `<span class="question-line">${key.toUpperCase()}: ${text}</span>`
        )).join("")}<span class="question-line"><strong>${questionText}</strong></span>`;
    }

    function contradictionChoices(items) {
        return items.map(([value, label]) => r(value, `${value.toUpperCase()}: ${label}`));
    }

    function characterChoices() {
        return [r("hi", "ヒー"), r("an", "アン"), r("pippi", "ピッピ"), r("none", "わからない")];
    }

    function colorChoices() {
        return [r("red", "赤"), r("blue", "青"), r("yellow", "黄"), r("green", "緑")];
    }

    function shuffle(items) {
        const list = [...items];
        for (let index = list.length - 1; index > 0; index -= 1) {
            const other = Math.floor(Math.random() * (index + 1));
            [list[index], list[other]] = [list[other], list[index]];
        }
        return list;
    }

    function take(context, key, pool) {
        if (!context[key] || context[key].length === 0) context[key] = shuffle(pool);
        return context[key].pop();
    }

    function cloneQuestion(item) {
        return {
            type: item.type,
            title: item.title,
            promptHtml: `<span class="question-title">${item.title}</span>${item.promptHtml}`,
            answer: item.answer,
            choices: shuffle(item.choices)
        };
    }

    function makeClassifyQuestion(context) {
        return cloneQuestion(take(context, "classify", CLASSIFY));
    }

    function makeOrderQuestion(context) {
        return cloneQuestion(take(context, "order", ORDER));
    }

    function makeMatchingQuestion(context) {
        return cloneQuestion(take(context, "matching", MATCHING));
    }

    function makeContradictionQuestion(context) {
        return cloneQuestion(take(context, "contradiction", CONTRADICTIONS));
    }

    function makeTruthLieQuestion(context) {
        return cloneQuestion(take(context, "truthLie", TRUTH_LIE));
    }

    window.LearningLaboTests.thinking_reasoning = {
        createQuestions(count) {
            const context = {};
            const questions = PLAN.flatMap((item) => (
                Array.from({ length: item.count }, () => item.maker(context))
            ));
            return questions.slice(0, count);
        }
    };
})();
