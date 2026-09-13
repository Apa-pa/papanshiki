(function () {
    "use strict";

    window.PapanCrosswordStages = [
        {
            id: "stage_1",
            number: 1,
            icon: "🌱",
            gradeBand: "1-2",
            rows: 6,
            cols: 6,
            clueReward: 5,
            keywordReward: 30,
            entries: [
                {
                    id: "a1",
                    number: 1,
                    direction: "across",
                    row: 0,
                    col: 2,
                    answer: "なみ",
                    clueHtml: "うみで ざぶんと よせてくるもの。",
                    letters: ["な", "み", "う", "め", "ゆ", "き"]
                },
                {
                    id: "a2",
                    number: 2,
                    direction: "across",
                    row: 2,
                    col: 1,
                    answer: "おべんとう",
                    clueHtml: "ごはんや おかずを <ruby>箱<rt>はこ</rt></ruby>に つめて、そとで <ruby>食<rt>た</rt></ruby>べるもの。",
                    letters: ["お", "べ", "ん", "と", "う", "ご", "は", "こ", "も"]
                },
                {
                    id: "a3",
                    number: 3,
                    direction: "across",
                    row: 4,
                    col: 4,
                    answer: "いろ",
                    clueHtml: "あか・あお・きいろなどを まとめていう ことば。",
                    letters: ["い", "ろ", "え", "も", "じ", "か"]
                },
                {
                    id: "d1",
                    number: 1,
                    direction: "down",
                    row: 0,
                    col: 3,
                    answer: "みかん",
                    clueHtml: "オレンジいろの かわを むいて <ruby>食<rt>た</rt></ruby>べる くだもの。",
                    letters: ["み", "か", "ん", "り", "ご", "も"]
                },
                {
                    id: "d2",
                    number: 2,
                    direction: "down",
                    row: 2,
                    col: 1,
                    answer: "おはよう",
                    clueHtml: "あさ、はじめに いう あいさつ。",
                    letters: ["お", "は", "よ", "う", "こ", "ん", "に", "ち"]
                },
                {
                    id: "d3",
                    number: 3,
                    direction: "down",
                    row: 2,
                    col: 5,
                    answer: "うしろ",
                    clueHtml: "「まえ」の はんたいの <ruby>場所<rt>ばしょ</rt></ruby>。",
                    letters: ["う", "し", "ろ", "み", "ぎ", "ひ", "だ", "り"]
                }
            ],
            keyword: {
                answer: "なかよし",
                cells: [
                    { row: 0, col: 2 },
                    { row: 1, col: 3 },
                    { row: 4, col: 1 },
                    { row: 3, col: 5 }
                ],
                letters: ["な", "か", "よ", "し", "と", "も", "だ", "ち"]
            }
        },
        {
            id: "stage_2",
            number: 2,
            icon: "🌼",
            gradeBand: "1-2",
            rows: 6,
            cols: 6,
            clueReward: 5,
            keywordReward: 30,
            entries: [
                {
                    id: "a1",
                    number: 1,
                    direction: "across",
                    row: 0,
                    col: 2,
                    answer: "いす",
                    clueHtml: "すわるときに つかう もの。",
                    letters: ["い", "す", "つ", "く", "え", "ゆ"]
                },
                {
                    id: "a2",
                    number: 2,
                    direction: "across",
                    row: 2,
                    col: 1,
                    answer: "かくれんぼ",
                    clueHtml: "ひとりが かくれて、もうひとりが さがす あそび。",
                    letters: ["か", "く", "れ", "ん", "ぼ", "お", "に", "ご"]
                },
                {
                    id: "a3",
                    number: 3,
                    direction: "across",
                    row: 4,
                    col: 4,
                    answer: "そら",
                    clueHtml: "くもや たいようが みえる、うえの ほう。",
                    letters: ["そ", "ら", "く", "も", "や", "ま"]
                },
                {
                    id: "d1",
                    number: 1,
                    direction: "down",
                    row: 0,
                    col: 3,
                    answer: "すみれ",
                    clueHtml: "むらさきいろの <ruby>小<rt>ちい</rt></ruby>さな はな。",
                    letters: ["す", "み", "れ", "は", "な", "ゆ"]
                },
                {
                    id: "d2",
                    number: 2,
                    direction: "down",
                    row: 2,
                    col: 1,
                    answer: "かがやく",
                    clueHtml: "ほしや ひかりが、きらきら ひかること。",
                    letters: ["か", "が", "や", "く", "ひ", "る", "き"]
                },
                {
                    id: "d3",
                    number: 3,
                    direction: "down",
                    row: 2,
                    col: 5,
                    answer: "ぼくら",
                    clueHtml: "おもに おとこのこが、じぶんたちのことを いう ことば。",
                    letters: ["ぼ", "く", "ら", "わ", "た", "し"]
                }
            ],
            keyword: {
                answer: "やくそく",
                cells: [
                    { row: 4, col: 1 },
                    { row: 2, col: 2 },
                    { row: 4, col: 4 },
                    { row: 3, col: 5 }
                ],
                letters: ["や", "く", "そ", "く", "ま", "も", "る", "よ"]
            }
        }
    ];
})();
