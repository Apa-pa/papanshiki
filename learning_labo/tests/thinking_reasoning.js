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
            [r("apple", "りんご"), r("bread", "パン"), r("milk", "<ruby>牛乳<rt>ぎゅうにゅう</rt></ruby>"), r("chair", "いす")]
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
            "ルールに<ruby>合<rt>あ</rt></ruby>うもの",
            `<span class="question-line">ルールは「<ruby>赤<rt>あか</rt></ruby>くて、まるいもの」です。<ruby>合<rt>あ</rt></ruby>うものはどれ？</span>`,
            "red_circle",
            [r("red_circle", "<ruby>赤<rt>あか</rt></ruby>いまる"), r("red_square", "<ruby>赤<rt>あか</rt></ruby>いしかく"), r("blue_circle", "<ruby>青<rt>あお</rt></ruby>いまる"), r("blue_square", "<ruby>青<rt>あお</rt></ruby>いしかく")]
        ),
        q(
            "classify_rule_not_blue",
            "ルールに<ruby>合<rt>あ</rt></ruby>うもの",
            `<span class="question-line">ルールは「<ruby>青<rt>あお</rt></ruby>ではなくて、<ruby>三角<rt>さんかく</rt></ruby>でもない」です。<ruby>合<rt>あ</rt></ruby>うものはどれ？</span>`,
            "red_circle",
            [r("blue_circle", "<ruby>青<rt>あお</rt></ruby>いまる"), r("red_triangle", "<ruby>赤<rt>あか</rt></ruby>い<ruby>三角<rt>さんかく</rt></ruby>"), r("blue_square", "<ruby>青<rt>あお</rt></ruby>いしかく"), r("red_circle", "<ruby>赤<rt>あか</rt></ruby>いまる")]
        ),
        q(
            "classify_same_group",
            "<ruby>同<rt>おな</rt></ruby>じなかま",
            `<span class="question-line">「はさみ・のり・セロテープ」と<ruby>同<rt>おな</rt></ruby>じなかまはどれ？</span>`,
            "stapler",
            [r("stapler", "ホチキス"), r("banana", "バナナ"), r("shoes", "くつ"), r("clock", "とけい")]
        ),
        q(
            "classify_rule_place",
            "ルールに<ruby>合<rt>あ</rt></ruby>うもの",
            `<span class="question-line">ルールは「<ruby>学校<rt>がっこう</rt></ruby>にありそうで、<ruby>外<rt>そと</rt></ruby>では<ruby>使<rt>つか</rt></ruby>わないもの」です。<ruby>合<rt>あ</rt></ruby>うものはどれ？</span>`,
            "blackboard",
            [r("blackboard", "<ruby>黒板<rt>こくばん</rt></ruby>"), r("umbrella", "かさ"), r("bicycle", "じてんしゃ"), r("sandals", "サンダル")]
        )
    ];

    const ORDER = [
        q(
            "order_line_easy",
            "じゅんばん<ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "ヒーはアンより<ruby>前<rt>まえ</rt></ruby>です。",
                "ピッピは<ruby>一番<rt>いちばん</rt></ruby><ruby>後<rt>うし</rt></ruby>ろです。",
                "<ruby>前<rt>まえ</rt></ruby>から2<ruby>番目<rt>ばんめ</rt></ruby>はだれ？"
            ]),
            "an",
            characterChoices()
        ),
        q(
            "order_height_middle",
            "じゅんばん<ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "アンはヒーより<ruby>高<rt>たか</rt></ruby>いです。",
                "ピッピはアンより<ruby>高<rt>たか</rt></ruby>いです。",
                "<ruby>真<rt>ま</rt></ruby>ん<ruby>中<rt>なか</rt></ruby>の<ruby>高<rt>たか</rt></ruby>さなのはだれ？"
            ]),
            "an",
            characterChoices()
        ),
        q(
            "order_left_right",
            "じゅんばん<ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "3<ruby>人<rt>にん</rt></ruby>が<ruby>左<rt>ひだり</rt></ruby>から1<ruby>列<rt>れつ</rt></ruby>にならんでいます。",
                "ヒーは<ruby>左<rt>ひだり</rt></ruby>はしではありません。",
                "アンはヒーのすぐ<ruby>左<rt>ひだり</rt></ruby>です。",
                "ピッピは<ruby>一番<rt>いちばん</rt></ruby><ruby>右<rt>みぎ</rt></ruby>です。",
                "<ruby>左<rt>ひだり</rt></ruby>はしはだれ？"
            ]),
            "an",
            characterChoices()
        ),
        q(
            "order_race_second",
            "じゅんばん<ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "3<ruby>人<rt>にん</rt></ruby>でかけっこをしました。",
                "ヒーは3<ruby>位<rt>い</rt></ruby>ではありません。",
                "アンはピッピより<ruby>後<rt>うし</rt></ruby>ろです。",
                "ピッピは1<ruby>位<rt>い</rt></ruby>ではありません。",
                "2<ruby>位<rt>い</rt></ruby>はだれ？"
            ]),
            "pippi",
            characterChoices()
        ),
        q(
            "order_boxes",
            "じゅんばん<ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "<ruby>赤<rt>あか</rt></ruby>・<ruby>青<rt>あお</rt></ruby>・<ruby>黄<rt>き</rt></ruby>の<ruby>箱<rt>はこ</rt></ruby>が<ruby>左<rt>ひだり</rt></ruby>から1<ruby>列<rt>れつ</rt></ruby>にならんでいます。",
                "<ruby>赤<rt>あか</rt></ruby>は<ruby>左<rt>ひだり</rt></ruby>はしではありません。",
                "<ruby>青<rt>あお</rt></ruby>は<ruby>赤<rt>あか</rt></ruby>のすぐ<ruby>右<rt>みぎ</rt></ruby>です。",
                "<ruby>黄<rt>き</rt></ruby>は<ruby>右<rt>みぎ</rt></ruby>はしではありません。",
                "<ruby>真<rt>ま</rt></ruby>ん<ruby>中<rt>なか</rt></ruby>の<ruby>箱<rt>はこ</rt></ruby>は<ruby>何色<rt>なにいろ</rt></ruby>？"
            ]),
            "red",
            colorChoices()
        ),
        q(
            "order_books",
            "じゅんばん<ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "<ruby>国語<rt>こくご</rt></ruby>・<ruby>算数<rt>さんすう</rt></ruby>・<ruby>音楽<rt>おんがく</rt></ruby>の<ruby>本<rt>ほん</rt></ruby>を<ruby>上<rt>うえ</rt></ruby>からつみました。",
                "<ruby>算数<rt>さんすう</rt></ruby>は<ruby>一番<rt>いちばん</rt></ruby><ruby>上<rt>うえ</rt></ruby>ではありません。",
                "<ruby>音楽<rt>おんがく</rt></ruby>は<ruby>算数<rt>さんすう</rt></ruby>のすぐ<ruby>下<rt>した</rt></ruby>です。",
                "<ruby>国語<rt>こくご</rt></ruby>は<ruby>一番<rt>いちばん</rt></ruby><ruby>下<rt>した</rt></ruby>ではありません。",
                "<ruby>一番<rt>いちばん</rt></ruby><ruby>上<rt>うえ</rt></ruby>の<ruby>本<rt>ほん</rt></ruby>はどれ？"
            ]),
            "japanese",
            [r("japanese", "<ruby>国語<rt>こくご</rt></ruby>"), r("math", "<ruby>算数<rt>さんすう</rt></ruby>"), r("music", "<ruby>音楽<rt>おんがく</rt></ruby>"), r("science", "<ruby>理科<rt>りか</rt></ruby>")]
        )
    ];

    const MATCHING = [
        q(
            "matching_hat_color",
            "<ruby>対応<rt>たいおう</rt></ruby><ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "3<ruby>人<rt>にん</rt></ruby>は<ruby>赤<rt>あか</rt></ruby>・<ruby>青<rt>あお</rt></ruby>・<ruby>黄<rt>き</rt></ruby>のぼうしを1つずつかぶっています。",
                "ピッピは<ruby>赤<rt>あか</rt></ruby>いぼうしです。",
                "ヒーは<ruby>青<rt>あお</rt></ruby>ではありません。",
                "アンのぼうしは<ruby>何色<rt>なにいろ</rt></ruby>？"
            ]),
            "blue",
            colorChoices()
        ),
        q(
            "matching_items",
            "<ruby>対応<rt>たいおう</rt></ruby><ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "3<ruby>人<rt>にん</rt></ruby>は<ruby>本<rt>ほん</rt></ruby>・ボール・かぎを1つずつ<ruby>持<rt>も</rt></ruby>っています。",
                "アンは<ruby>本<rt>ほん</rt></ruby>を<ruby>持<rt>も</rt></ruby>っていません。",
                "ヒーはかぎを<ruby>持<rt>も</rt></ruby>っていません。",
                "ピッピは<ruby>本<rt>ほん</rt></ruby>を<ruby>持<rt>も</rt></ruby>っています。",
                "ヒーが<ruby>持<rt>も</rt></ruby>っているものはどれ？"
            ]),
            "ball",
            [r("book", "<ruby>本<rt>ほん</rt></ruby>"), r("ball", "ボール"), r("key", "かぎ"), r("pencil", "えんぴつ")]
        ),
        q(
            "matching_drinks",
            "<ruby>対応<rt>たいおう</rt></ruby><ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "3<ruby>人<rt>にん</rt></ruby>は<ruby>水<rt>みず</rt></ruby>・お<ruby>茶<rt>ちゃ</rt></ruby>・<ruby>牛乳<rt>ぎゅうにゅう</rt></ruby>を1つずつ<ruby>飲<rt>の</rt></ruby>みました。",
                "ヒーは<ruby>水<rt>みず</rt></ruby>ではありません。",
                "アンは<ruby>牛乳<rt>ぎゅうにゅう</rt></ruby>ではありません。",
                "ピッピは<ruby>水<rt>みず</rt></ruby>を<ruby>飲<rt>の</rt></ruby>みました。",
                "アンが<ruby>飲<rt>の</rt></ruby>んだものはどれ？"
            ]),
            "tea",
            [r("water", "<ruby>水<rt>みず</rt></ruby>"), r("tea", "お<ruby>茶<rt>ちゃ</rt></ruby>"), r("milk", "<ruby>牛乳<rt>ぎゅうにゅう</rt></ruby>"), r("juice", "ジュース")]
        ),
        q(
            "matching_seats",
            "<ruby>対応<rt>たいおう</rt></ruby><ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "3<ruby>人<rt>にん</rt></ruby>は1<ruby>番<rt>ばん</rt></ruby>・2<ruby>番<rt>ばん</rt></ruby>・3<ruby>番<rt>ばん</rt></ruby>の<ruby>席<rt>せき</rt></ruby>に1<ruby>人<rt>り</rt></ruby>ずつすわりました。",
                "ヒーは1<ruby>番<rt>ばん</rt></ruby>ではありません。",
                "アンは3<ruby>番<rt>ばん</rt></ruby>ではありません。",
                "ピッピは1<ruby>番<rt>ばん</rt></ruby>です。",
                "ヒーの<ruby>席<rt>せき</rt></ruby>は<ruby>何番<rt>なんばん</rt></ruby>？"
            ]),
            "3",
            [r("1", "1<ruby>番<rt>ばん</rt></ruby>"), r("2", "2<ruby>番<rt>ばん</rt></ruby>"), r("3", "3<ruby>番<rt>ばん</rt></ruby>"), r("4", "4<ruby>番<rt>ばん</rt></ruby>")]
        ),
        q(
            "matching_fruit",
            "<ruby>対応<rt>たいおう</rt></ruby><ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "3<ruby>人<rt>にん</rt></ruby>はりんご・みかん・ぶどうを1つずつ<ruby>選<rt>えら</rt></ruby>びました。",
                "アンはみかんではありません。",
                "ピッピはぶどうではありません。",
                "ヒーはみかんです。",
                "ピッピが<ruby>選<rt>えら</rt></ruby>んだものはどれ？"
            ]),
            "apple",
            [r("apple", "りんご"), r("orange", "みかん"), r("grape", "ぶどう"), r("melon", "メロン")]
        ),
        q(
            "matching_rooms",
            "<ruby>対応<rt>たいおう</rt></ruby><ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "3<ruby>人<rt>にん</rt></ruby>は<ruby>図書室<rt>としょしつ</rt></ruby>・<ruby>音楽室<rt>おんがくしつ</rt></ruby>・<ruby>体育館<rt>たいいくかん</rt></ruby>へ1<ruby>人<rt>り</rt></ruby>ずつ<ruby>行<rt>い</rt></ruby>きました。",
                "ヒーは<ruby>体育館<rt>たいいくかん</rt></ruby>ではありません。",
                "アンは<ruby>図書室<rt>としょしつ</rt></ruby>ではありません。",
                "ピッピは<ruby>体育館<rt>たいいくかん</rt></ruby>へ<ruby>行<rt>い</rt></ruby>きました。",
                "ヒーが<ruby>行<rt>い</rt></ruby>った<ruby>場所<rt>ばしょ</rt></ruby>はどこ？"
            ]),
            "library",
            [r("library", "<ruby>図書室<rt>としょしつ</rt></ruby>"), r("music", "<ruby>音楽室<rt>おんがくしつ</rt></ruby>"), r("gym", "<ruby>体育館<rt>たいいくかん</rt></ruby>"), r("yard", "<ruby>校庭<rt>こうてい</rt></ruby>")]
        )
    ];

    const CONTRADICTIONS = [
        q(
            "contradiction_front",
            "<ruby>矛盾<rt>むじゅん</rt></ruby><ruby>探<rt>さが</rt></ruby>し",
            contradictionPrompt([
                "5さいの<ruby>男<rt>おとこ</rt></ruby>の<ruby>子<rt>こ</rt></ruby>、たろうくんがいます。",
                "たろうくんは、ほいくえんに<ruby>行<rt>い</rt></ruby>っています。"
            ], "つぎのうち、おかしい<ruby>説明<rt>せつめい</rt></ruby>はどれ？"),
            "b",
            contradictionChoices([
                ["a", "なまえはたろう"],
                ["b", "<ruby>小学校<rt>しょうがっこう</rt></ruby>に<ruby>行<rt>い</rt></ruby>っている"],
                ["c", "5さいの<ruby>男<rt>おとこ</rt></ruby>の<ruby>子<rt>こ</rt></ruby>"]
            ])
        ),
        q(
            "contradiction_tall",
            "<ruby>矛盾<rt>むじゅん</rt></ruby><ruby>探<rt>さが</rt></ruby>し",
            contradictionPrompt([
                "おさらの<ruby>上<rt>うえ</rt></ruby>に、みかんが5こあります。",
                "ヒーが2こ<ruby>食<rt>た</rt></ruby>べました。"
            ], "つぎのうち、おかしい<ruby>説明<rt>せつめい</rt></ruby>はどれ？"),
            "c",
            contradictionChoices([
                ["a", "はじめは5こあった"],
                ["b", "2こ<ruby>食<rt>た</rt></ruby>べた"],
                ["c", "のこりは5こ"]
            ])
        ),
        q(
            "contradiction_colors",
            "<ruby>矛盾<rt>むじゅん</rt></ruby><ruby>探<rt>さが</rt></ruby>し",
            contradictionPrompt([
                "プールから<ruby>出<rt>で</rt></ruby>てきたばかりの<ruby>子<rt>こ</rt></ruby>がいます。",
                "からだはまだ<ruby>少<rt>すこ</rt></ruby>しぬれています。"
            ], "つぎのうち、おかしい<ruby>説明<rt>せつめい</rt></ruby>はどれ？"),
            "a",
            contradictionChoices([
                ["a", "かみがサラサラ"],
                ["b", "ゆびさきがふやけている"],
                ["c", "くちびるが<ruby>青<rt>あお</rt></ruby>い"]
            ])
        ),
        q(
            "contradiction_seats",
            "<ruby>矛盾<rt>むじゅん</rt></ruby><ruby>探<rt>さが</rt></ruby>し",
            contradictionPrompt([
                "リュックの<ruby>中<rt>なか</rt></ruby>に、<ruby>本<rt>ほん</rt></ruby>と<ruby>水<rt>すい</rt></ruby>とうが<ruby>入<rt>はい</rt></ruby>っています。",
                "おべんとうは<ruby>入<rt>はい</rt></ruby>っていません。"
            ], "つぎのうち、おかしい<ruby>説明<rt>せつめい</rt></ruby>はどれ？"),
            "b",
            contradictionChoices([
                ["a", "<ruby>本<rt>ほん</rt></ruby>が<ruby>入<rt>はい</rt></ruby>っている"],
                ["b", "おべんとうが<ruby>入<rt>はい</rt></ruby>っている"],
                ["c", "<ruby>水<rt>すい</rt></ruby>とうが<ruby>入<rt>はい</rt></ruby>っている"]
            ])
        ),
        q(
            "contradiction_all_different",
            "<ruby>矛盾<rt>むじゅん</rt></ruby><ruby>探<rt>さが</rt></ruby>し",
            contradictionPrompt([
                "こうたくんのひざから、ちがでています。",
                "こうたくんはグラウンドでころんだようです。"
            ], "つぎのうち、おかしい<ruby>説明<rt>せつめい</rt></ruby>はどれ？"),
            "a",
            contradictionChoices([
                ["a", "こうたくんは<ruby>長<rt>なが</rt></ruby>ズボンをはいていて、ひざがみえない"],
                ["b", "グラウンドであそんでいた"],
                ["c", "こうたくんはころんだらしい"]
            ])
        ),
        q(
            "contradiction_order",
            "<ruby>矛盾<rt>むじゅん</rt></ruby><ruby>探<rt>さが</rt></ruby>し",
            contradictionPrompt([
                "アンは<ruby>右手<rt>みぎて</rt></ruby>にえんぴつ、<ruby>左手<rt>ひだりて</rt></ruby>にけしゴムを<ruby>持<rt>も</rt></ruby>っています。"
            ], "つぎのうち、おかしい<ruby>説明<rt>せつめい</rt></ruby>はどれ？"),
            "c",
            contradictionChoices([
                ["a", "<ruby>右手<rt>みぎて</rt></ruby>にえんぴつ"],
                ["b", "<ruby>左手<rt>ひだりて</rt></ruby>にけしゴム"],
                ["c", "<ruby>右手<rt>みぎて</rt></ruby>はからっぽ"]
            ])
        )
    ];

    const TRUTH_LIE = [
        q(
            "truth_one_winner",
            "ほんとう・うそ<ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "かけっこの1<ruby>位<rt>い</rt></ruby>は1<ruby>人<rt>り</rt></ruby>です。",
                "<ruby>本当<rt>ほんとう</rt></ruby>のことを<ruby>言<rt>い</rt></ruby>っているのは1<ruby>人<rt>り</rt></ruby>だけです。",
                "ヒー「1<ruby>位<rt>い</rt></ruby>はアンです」",
                "アン「1<ruby>位<rt>い</rt></ruby>はアンではありません」",
                "ピッピ「1<ruby>位<rt>い</rt></ruby>はヒーではありません」",
                "1<ruby>位<rt>い</rt></ruby>はだれ？"
            ]),
            "hi",
            characterChoices()
        ),
        q(
            "truth_box_color",
            "ほんとう・うそ<ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "あたりは<ruby>赤<rt>あか</rt></ruby>・<ruby>青<rt>あお</rt></ruby>・<ruby>黄<rt>き</rt></ruby>の<ruby>箱<rt>はこ</rt></ruby>のどれか1つです。",
                "<ruby>本当<rt>ほんとう</rt></ruby>のことを<ruby>言<rt>い</rt></ruby>っているのは1<ruby>人<rt>り</rt></ruby>だけです。",
                "ヒー「あたりは<ruby>赤<rt>あか</rt></ruby>です」",
                "アン「あたりは<ruby>赤<rt>あか</rt></ruby>ではありません」",
                "ピッピ「あたりは<ruby>青<rt>あお</rt></ruby>ではありません」",
                "あたりの<ruby>箱<rt>はこ</rt></ruby>は<ruby>何色<rt>なにいろ</rt></ruby>？"
            ]),
            "blue",
            colorChoices()
        ),
        q(
            "truth_one_liar_pet",
            "ほんとう・うそ<ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "なくしたカードは<ruby>本<rt>ほん</rt></ruby>・<ruby>星<rt>ほし</rt></ruby>・<ruby>花<rt>はな</rt></ruby>のどれか1つです。",
                "うそを<ruby>言<rt>い</rt></ruby>っているのは1<ruby>人<rt>り</rt></ruby>だけです。",
                "ヒー「カードは<ruby>本<rt>ほん</rt></ruby>か<ruby>星<rt>ほし</rt></ruby>です」",
                "アン「カードは<ruby>星<rt>ほし</rt></ruby>です」",
                "ピッピ「カードは<ruby>花<rt>はな</rt></ruby>です」",
                "なくしたカードはどれ？"
            ]),
            "star",
            [r("book", "<ruby>本<rt>ほん</rt></ruby>"), r("star", "<ruby>星<rt>ほし</rt></ruby>"), r("flower", "<ruby>花<rt>はな</rt></ruby>"), r("moon", "<ruby>月<rt>つき</rt></ruby>")]
        ),
        q(
            "truth_one_liar_seat",
            "ほんとう・うそ<ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "ヒーの<ruby>席<rt>せき</rt></ruby>は1<ruby>番<rt>ばん</rt></ruby>・2<ruby>番<rt>ばん</rt></ruby>・3<ruby>番<rt>ばん</rt></ruby>のどれかです。",
                "うそを<ruby>言<rt>い</rt></ruby>っているのは1<ruby>人<rt>り</rt></ruby>だけです。",
                "ヒー「ぼくの<ruby>席<rt>せき</rt></ruby>は1<ruby>番<rt>ばん</rt></ruby>ではありません」",
                "アン「ヒーの<ruby>席<rt>せき</rt></ruby>は2<ruby>番<rt>ばん</rt></ruby>です」",
                "ピッピ「ヒーの<ruby>席<rt>せき</rt></ruby>は1<ruby>番<rt>ばん</rt></ruby>です」",
                "ヒーの<ruby>席<rt>せき</rt></ruby>は<ruby>何番<rt>なんばん</rt></ruby>？"
            ]),
            "2",
            [r("1", "1<ruby>番<rt>ばん</rt></ruby>"), r("2", "2<ruby>番<rt>ばん</rt></ruby>"), r("3", "3<ruby>番<rt>ばん</rt></ruby>"), r("4", "4<ruby>番<rt>ばん</rt></ruby>")]
        ),
        q(
            "truth_only_one_key",
            "ほんとう・うそ<ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "かぎは<ruby>赤<rt>あか</rt></ruby>・<ruby>青<rt>あお</rt></ruby>・<ruby>黄<rt>き</rt></ruby>の<ruby>箱<rt>はこ</rt></ruby>のどれか1つに<ruby>入<rt>はい</rt></ruby>っています。",
                "<ruby>本当<rt>ほんとう</rt></ruby>のことを<ruby>言<rt>い</rt></ruby>っているのは1<ruby>人<rt>り</rt></ruby>だけです。",
                "ヒー「<ruby>赤<rt>あか</rt></ruby>い<ruby>箱<rt>はこ</rt></ruby>に<ruby>入<rt>はい</rt></ruby>っています」",
                "アン「<ruby>赤<rt>あか</rt></ruby>い<ruby>箱<rt>はこ</rt></ruby>には<ruby>入<rt>はい</rt></ruby>っていません」",
                "ピッピ「<ruby>青<rt>あお</rt></ruby>い<ruby>箱<rt>はこ</rt></ruby>には<ruby>入<rt>はい</rt></ruby>っていません」",
                "かぎはどの<ruby>箱<rt>はこ</rt></ruby>？"
            ]),
            "blue",
            colorChoices()
        ),
        q(
            "truth_one_lie_rank",
            "ほんとう・うそ<ruby>推理<rt>すいり</rt></ruby>",
            lines([
                "アンの<ruby>順位<rt>じゅんい</rt></ruby>は1<ruby>位<rt>い</rt></ruby>・2<ruby>位<rt>い</rt></ruby>・3<ruby>位<rt>い</rt></ruby>のどれかです。",
                "うそを<ruby>言<rt>い</rt></ruby>っているのは1<ruby>人<rt>り</rt></ruby>だけです。",
                "ヒー「アンは1<ruby>位<rt>い</rt></ruby>ではありません」",
                "アン「わたしは2<ruby>位<rt>い</rt></ruby>です」",
                "ピッピ「アンは1<ruby>位<rt>い</rt></ruby>です」",
                "アンの<ruby>順位<rt>じゅんい</rt></ruby>は<ruby>何位<rt>なんい</rt></ruby>？"
            ]),
            "2",
            [r("1", "1<ruby>位<rt>い</rt></ruby>"), r("2", "2<ruby>位<rt>い</rt></ruby>"), r("3", "3<ruby>位<rt>い</rt></ruby>"), r("4", "4<ruby>位<rt>い</rt></ruby>")]
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

    function contradictionPrompt(facts, questionText) {
        return `${facts.map((text) => (
            `<span class="question-line">${text}</span>`
        )).join("")}<span class="question-line"><strong>${questionText}</strong></span>`;
    }

    function contradictionChoices(items) {
        return items.map(([value, label]) => r(value, `${value.toUpperCase()}: ${label}`));
    }

    function characterChoices() {
        return [r("hi", "ヒー"), r("an", "アン"), r("pippi", "ピッピ"), r("none", "わからない")];
    }

    function colorChoices() {
        return [r("red", "<ruby>赤<rt>あか</rt></ruby>"), r("blue", "<ruby>青<rt>あお</rt></ruby>"), r("yellow", "<ruby>黄<rt>き</rt></ruby>"), r("green", "<ruby>緑<rt>みどり</rt></ruby>")];
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
