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
        },
        {
            id: "stage_3",
            number: 3,
            icon: "🌳",
            gradeBand: "1-2",
            rows: 5,
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
                    answer: "たいよう",
                    clueHtml: "ひるの そらで、あかるく ひかる もの。",
                    letters: ["た", "い", "よ", "う", "つ", "き", "ほ", "し"]
                },
                {
                    id: "a2",
                    number: 2,
                    direction: "across",
                    row: 2,
                    col: 0,
                    answer: "さくら",
                    clueHtml: "はるに うすい ピンクいろの はなが さく き。",
                    letters: ["さ", "く", "ら", "は", "る", "な"]
                },
                {
                    id: "a3",
                    number: 3,
                    direction: "across",
                    row: 4,
                    col: 2,
                    answer: "のはら",
                    clueHtml: "くさや はなが はえている、ひろい ばしょ。",
                    letters: ["の", "は", "ら", "も", "り", "や", "ま"]
                },
                {
                    id: "d1",
                    number: 1,
                    direction: "down",
                    row: 0,
                    col: 2,
                    answer: "たからもの",
                    clueHtml: "とても たいせつに している もの。",
                    letters: ["た", "か", "ら", "も", "の", "だ", "い", "じ"]
                },
                {
                    id: "d2",
                    number: 2,
                    direction: "down",
                    row: 1,
                    col: 0,
                    answer: "かさ",
                    clueHtml: "あめの ひに、ひらいて つかう もの。",
                    letters: ["か", "さ", "あ", "め", "く", "つ"]
                },
                {
                    id: "d3",
                    number: 3,
                    direction: "down",
                    row: 3,
                    col: 4,
                    answer: "のら",
                    clueHtml: "かっている ひとが いない ねこを「○○ねこ」という。",
                    letters: ["の", "ら", "ね", "こ", "い", "え"]
                }
            ],
            keyword: {
                answer: "かいもの",
                cells: [
                    { row: 1, col: 0 },
                    { row: 0, col: 3 },
                    { row: 3, col: 2 },
                    { row: 3, col: 4 }
                ],
                letters: ["か", "い", "も", "の", "お", "み", "せ", "へ"]
            }
        },
        {
            id: "grade_3_4_stage_1",
            number: 1,
            icon: "🔎",
            gradeBand: "3-4",
            rows: 7,
            cols: 7,
            clueReward: 5,
            keywordReward: 30,
            entries: [
                {
                    id: "a1",
                    number: 1,
                    direction: "across",
                    row: 0,
                    col: 0,
                    answer: "ゆうやけ",
                    clueHtml: "<ruby>夕方<rt>ゆうがた</rt></ruby>、<ruby>太陽<rt>たいよう</rt></ruby>が しずむころに、そらが あかく そまること。",
                    letters: ["ゆ", "う", "や", "け", "そ", "ら", "あ", "か"]
                },
                {
                    id: "a2",
                    number: 2,
                    direction: "across",
                    row: 1,
                    col: 4,
                    answer: "えがお",
                    clueHtml: "うれしいときなどに みせる、にこにこした <ruby>顔<rt>かお</rt></ruby>。",
                    letters: ["え", "が", "お", "か", "お", "な", "き"]
                },
                {
                    id: "a3",
                    number: 3,
                    direction: "across",
                    row: 3,
                    col: 0,
                    answer: "きゅうしょく",
                    clueHtml: "<ruby>学校<rt>がっこう</rt></ruby>で、ひるに みんなで <ruby>食<rt>た</rt></ruby>べる ごはん。",
                    letters: ["き", "ゅ", "う", "し", "ょ", "く", "ご", "は", "ん"]
                },
                {
                    id: "a4",
                    number: 4,
                    direction: "across",
                    row: 6,
                    col: 1,
                    answer: "もよう",
                    clueHtml: "しまや みずたまなど、ものの <ruby>表面<rt>ひょうめん</rt></ruby>に えがかれた かざり。",
                    letters: ["も", "よ", "う", "し", "ま", "み", "ず", "た"]
                },
                {
                    id: "d1",
                    number: 1,
                    direction: "down",
                    row: 0,
                    col: 2,
                    answer: "やきゅう",
                    clueHtml: "バットで ボールを うち、<ruby>点<rt>てん</rt></ruby>を とりあう スポーツ。",
                    letters: ["や", "き", "ゅ", "う", "ば", "っ", "と", "ぼ", "る"]
                },
                {
                    id: "d2",
                    number: 2,
                    direction: "down",
                    row: 0,
                    col: 5,
                    answer: "かがやく",
                    clueHtml: "つよい ひかりを はなって、きらきらすること。",
                    letters: ["か", "が", "や", "く", "ひ", "り", "き", "ら"]
                },
                {
                    id: "d3",
                    number: 3,
                    direction: "down",
                    row: 2,
                    col: 0,
                    answer: "いきもの",
                    clueHtml: "どうぶつや しょくぶつなど、<ruby>命<rt>いのち</rt></ruby>を もっているもの。",
                    letters: ["い", "き", "も", "の", "ど", "う", "ぶ", "つ"]
                },
                {
                    id: "d4",
                    number: 4,
                    direction: "down",
                    row: 3,
                    col: 3,
                    answer: "しりょう",
                    clueHtml: "<ruby>調<rt>しら</rt></ruby>べたり、<ruby>説明<rt>せつめい</rt></ruby>したりするときの もとになる <ruby>文書<rt>ぶんしょ</rt></ruby>や <ruby>記録<rt>きろく</rt></ruby>。",
                    letters: ["し", "り", "ょ", "う", "ぶ", "ん", "き", "ろ", "く"]
                }
            ],
            keyword: {
                answer: "おもいやり",
                cells: [
                    { row: 1, col: 6 },
                    { row: 6, col: 1 },
                    { row: 2, col: 0 },
                    { row: 2, col: 5 },
                    { row: 4, col: 3 }
                ],
                letters: ["お", "も", "い", "や", "り", "た", "す", "け", "あ", "う"]
            }
        },
        {
            id: "grade_5_6_stage_1",
            number: 1,
            icon: "🧭",
            gradeBand: "5-6",
            rows: 7,
            cols: 7,
            clueReward: 5,
            keywordReward: 30,
            entries: [
                {
                    id: "a1",
                    number: 1,
                    direction: "across",
                    row: 1,
                    col: 3,
                    answer: "かんさつ",
                    clueHtml: "<ruby>物事<rt>ものごと</rt></ruby>の ようすを よく <ruby>見<rt>み</rt></ruby>て、<ruby>変化<rt>へんか</rt></ruby>や とくちょうを <ruby>調<rt>しら</rt></ruby>べること。",
                    letters: ["か", "ん", "さ", "つ", "も", "の", "み", "る", "べ"]
                },
                {
                    id: "a2",
                    number: 2,
                    direction: "across",
                    row: 2,
                    col: 0,
                    answer: "せきにん",
                    clueHtml: "<ruby>自分<rt>じぶん</rt></ruby>が <ruby>引<rt>ひ</rt></ruby>きうけた <ruby>役割<rt>やくわり</rt></ruby>や、おこなったことについて、<ruby>最後<rt>さいご</rt></ruby>まで はたすべき つとめ。",
                    letters: ["せ", "き", "に", "ん", "じ", "ぶ", "や", "く", "わ", "り"]
                },
                {
                    id: "a3",
                    number: 3,
                    direction: "across",
                    row: 4,
                    col: 2,
                    answer: "しょうこ",
                    clueHtml: "ある できごとが <ruby>本当<rt>ほんとう</rt></ruby>に あったと <ruby>示<rt>しめ</rt></ruby>す、しゃしんや <ruby>記録<rt>きろく</rt></ruby>など。",
                    letters: ["し", "ょ", "う", "こ", "か", "ん", "が", "じ", "つ"]
                },
                {
                    id: "a4",
                    number: 4,
                    direction: "across",
                    row: 6,
                    col: 4,
                    answer: "ひかく",
                    clueHtml: "<ruby>二<rt>ふた</rt></ruby>つ<ruby>以上<rt>いじょう</rt></ruby>のものを ならべ、おなじところや ちがうところを <ruby>調<rt>しら</rt></ruby>べること。",
                    letters: ["ひ", "か", "く", "い", "じ", "ょ", "う", "な", "ら"]
                },
                {
                    id: "d1",
                    number: 1,
                    direction: "down",
                    row: 1,
                    col: 3,
                    answer: "かんきょう",
                    clueHtml: "<ruby>人<rt>ひと</rt></ruby>や <ruby>生<rt>い</rt></ruby>きものを とりまき、<ruby>生活<rt>せいかつ</rt></ruby>や <ruby>成長<rt>せいちょう</rt></ruby>に <ruby>影響<rt>えいきょう</rt></ruby>を あたえる まわりの じょうたい。",
                    letters: ["か", "ん", "き", "ょ", "う", "せ", "い", "ち", "え"]
                },
                {
                    id: "d2",
                    number: 2,
                    direction: "down",
                    row: 0,
                    col: 1,
                    answer: "こんきょ",
                    clueHtml: "<ruby>意見<rt>いけん</rt></ruby>や <ruby>判断<rt>はんだん</rt></ruby>を ささえる、もととなる <ruby>理由<rt>りゆう</rt></ruby>や <ruby>資料<rt>しりょう</rt></ruby>。",
                    letters: ["こ", "ん", "き", "ょ", "い", "け", "は", "だ", "り", "ゆ"]
                },
                {
                    id: "d3",
                    number: 3,
                    direction: "down",
                    row: 0,
                    col: 6,
                    answer: "はつめい",
                    clueHtml: "これまでに なかった <ruby>道具<rt>どうぐ</rt></ruby>や <ruby>方法<rt>ほうほう</rt></ruby>を、あたらしく <ruby>考<rt>かんが</rt></ruby>えだすこと。",
                    letters: ["は", "つ", "め", "い", "ど", "う", "ぐ", "ほ", "か"]
                },
                {
                    id: "d4",
                    number: 4,
                    direction: "down",
                    row: 4,
                    col: 5,
                    answer: "こうか",
                    clueHtml: "くすりを のんで ねつが さがるように、ある はたらきかけによって あらわれる <ruby>結果<rt>けっか</rt></ruby>。",
                    letters: ["こ", "う", "か", "は", "た", "ら", "け", "へ", "ん"]
                }
            ],
            keyword: {
                answer: "こうきしん",
                cells: [
                    { row: 0, col: 1 },
                    { row: 5, col: 5 },
                    { row: 3, col: 3 },
                    { row: 4, col: 2 },
                    { row: 1, col: 4 }
                ],
                letters: ["こ", "う", "き", "し", "ん", "ま", "な", "ぶ", "ち", "か"]
            }
        }
    ];
})();
