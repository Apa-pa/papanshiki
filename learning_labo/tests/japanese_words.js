(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const PLAN = [
        { count: 2, maker: makeOppositeQuestion },
        { count: 2, maker: makeOppositePairQuestion },
        { count: 4, maker: makeSimilarQuestion },
        { count: 4, maker: makeThingPlaceQuestion },
        { count: 4, maker: makeActionQuestion },
        { count: 4, maker: makeSentenceQuestion }
    ];

    const r = (value, labelHtml) => ({ value, labelHtml });

    const OPPOSITES = [
        q("「おおきい」の<ruby>反対<rt>はんたい</rt></ruby>は？", "ちいさい", ["ちいさい", "ながい", "あかい", "あつい"]),
        q("「あつい」の<ruby>反対<rt>はんたい</rt></ruby>は？", "さむい", ["さむい", "からい", "ひろい", "つよい"]),
        q("「はやい」の<ruby>反対<rt>はんたい</rt></ruby>は？", "おそい", ["おそい", "たかい", "かるい", "ふるい"]),
        q("「たかい」の<ruby>反対<rt>はんたい</rt></ruby>は？", "ひくい", ["ひくい", "くらい", "ちかい", "よわい"]),
        q("「ながい」の<ruby>反対<rt>はんたい</rt></ruby>は？", "みじかい", ["みじかい", "せまい", "あさい", "やすい"]),
        q("「あかるい」の<ruby>反対<rt>はんたい</rt></ruby>は？", "くらい", ["くらい", "あまい", "おもい", "とおい"]),
        q("「おもい」の<ruby>反対<rt>はんたい</rt></ruby>は？", "かるい", ["かるい", "ひろい", "ふとい", "にがい"]),
        q("「ちかい」の<ruby>反対<rt>はんたい</rt></ruby>は？", "とおい", ["とおい", "つよい", "はやい", "まるい"]),
        q("「ひろい」の<ruby>反対<rt>はんたい</rt></ruby>は？", "せまい", ["せまい", "あかい", "うすい", "あつい"]),
        q("「ふるい」の<ruby>反対<rt>はんたい</rt></ruby>は？", "あたらしい", ["あたらしい", "ただしい", "やさしい", "たのしい"]),
        q("「つよい」の<ruby>反対<rt>はんたい</rt></ruby>は？", "よわい", ["よわい", "はやい", "ひろい", "あかるい"]),
        q("「あまい」の<ruby>反対<rt>はんたい</rt></ruby>は？", "にがい", ["にがい", "からい", "あつい", "まるい"]),
        q("「まえ」の<ruby>反対<rt>はんたい</rt></ruby>は？", "うしろ", ["うしろ", "よこ", "なか", "そと"]),
        q("「うえ」の<ruby>反対<rt>はんたい</rt></ruby>は？", "した", ["した", "まえ", "みぎ", "なか"]),
        q("「ひだり」の<ruby>反対<rt>はんたい</rt></ruby>は？", "みぎ", ["みぎ", "うえ", "した", "まえ"]),
        q("「あける」の<ruby>反対<rt>はんたい</rt></ruby>は？", "しめる", ["しめる", "ならべる", "あらう", "ひろう"]),
        q("「はいる」の<ruby>反対<rt>はんたい</rt></ruby>は？", "でる", ["でる", "とぶ", "みる", "きく"]),
        q("「たつ」の<ruby>反対<rt>はんたい</rt></ruby>は？", "すわる", ["すわる", "はしる", "おす", "よむ"]),
        q("「のぼる」の<ruby>反対<rt>はんたい</rt></ruby>は？", "おりる", ["おりる", "わたる", "まがる", "はこぶ"]),
        q("「はじめる」の<ruby>反対<rt>はんたい</rt></ruby>は？", "おわる", ["おわる", "つづける", "さがす", "まつ"])
    ];

    const OPPOSITE_PAIRS = [
        ["おおきい", "ちいさい"],
        ["あつい", "さむい"],
        ["はやい", "おそい"],
        ["たかい", "ひくい"],
        ["ながい", "みじかい"],
        ["あかるい", "くらい"],
        ["おもい", "かるい"],
        ["ちかい", "とおい"],
        ["ひろい", "せまい"],
        ["ふるい", "あたらしい"],
        ["つよい", "よわい"],
        ["あまい", "にがい"],
        ["まえ", "うしろ"],
        ["うえ", "した"],
        ["ひだり", "みぎ"],
        ["あける", "しめる"],
        ["はいる", "でる"],
        ["たつ", "すわる"],
        ["のぼる", "おりる"],
        ["はじめる", "おわる"]
    ];

    const SIMILARS = [
        q("「うれしい」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "たのしい", ["たのしい", "かなしい", "こわい", "ねむい"]),
        q("「かなしい」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "さびしい", ["さびしい", "あかるい", "からい", "まぶしい"]),
        q("「きれい」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "うつくしい", ["うつくしい", "すくない", "おそい", "かたい"]),
        q("「たくさん」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "いっぱい", ["いっぱい", "すこし", "からっぽ", "ひとつ"]),
        q("「すこし」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "ちょっと", ["ちょっと", "ぜんぶ", "いっぱい", "ながく"]),
        q("「やさしい」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "しんせつ", ["しんせつ", "こわい", "からい", "ひくい"]),
        q("「しずか」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "おだやか", ["おだやか", "にぎやか", "すばやい", "まぶしい"]),
        q("「はじめる」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "スタートする", ["スタートする", "おわる", "やすむ", "かくす"]),
        q("「おこる」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "ぷんぷんする", ["ぷんぷんする", "にこにこする", "ねむる", "かぞえる"]),
        q("「わらう」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "にこにこする", ["にこにこする", "しくしくする", "どきどきする", "はらはらする"]),
        q("「なく」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "しくしくする", ["しくしくする", "にこにこする", "わくわくする", "きらきらする"]),
        q("「びっくり」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "おどろく", ["おどろく", "ねむる", "あらう", "ならべる"]),
        q("「すき」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "だいすき", ["だいすき", "きらい", "こわい", "くらい"]),
        q("「じょうず」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "うまい", ["うまい", "へた", "ふるい", "からい"]),
        q("「すぐに」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "はやく", ["はやく", "ゆっくり", "しずかに", "あとで"]),
        q("「ゆっくり」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "のんびり", ["のんびり", "すぐに", "きっぱり", "しっかり"]),
        q("「おいしい」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "うまい", ["うまい", "からい", "にがい", "あつい"]),
        q("「かなり」に<ruby>近<rt>ちか</rt></ruby>いことばは？", "とても", ["とても", "すこし", "ひとつ", "あとで"])
    ];

    const THINGS_PLACES = [
        q("<ruby>花<rt>はな</rt></ruby>がたくさん<ruby>咲<rt>さ</rt></ruby>いている<ruby>場所<rt>ばしょ</rt></ruby>は？", "はなばたけ", ["はなばたけ", "すなば", "おふろ", "えき"]),
        q("<ruby>本<rt>ほん</rt></ruby>を<ruby>読<rt>よ</rt></ruby>む<ruby>場所<rt>ばしょ</rt></ruby>は？", "としょかん", ["としょかん", "びょういん", "こうえん", "うみ"]),
        q("ごはんを<ruby>作<rt>つく</rt></ruby>る<ruby>場所<rt>ばしょ</rt></ruby>は？", "だいどころ", ["だいどころ", "げんかん", "にわ", "ろうか"]),
        q("<ruby>雨<rt>あめ</rt></ruby>のときに<ruby>使<rt>つか</rt></ruby>うものは？", "かさ", ["かさ", "ぼうし", "はさみ", "ふで"]),
        q("<ruby>時間<rt>じかん</rt></ruby>を<ruby>見<rt>み</rt></ruby>るものは？", "とけい", ["とけい", "つくえ", "くつ", "さら"]),
        q("<ruby>字<rt>じ</rt></ruby>を<ruby>書<rt>か</rt></ruby>くものは？", "えんぴつ", ["えんぴつ", "はし", "かぎ", "くし"]),
        q("<ruby>足<rt>あし</rt></ruby>にはくものは？", "くつ", ["くつ", "てぶくろ", "めがね", "ぼうし"]),
        q("<ruby>頭<rt>あたま</rt></ruby>にかぶるものは？", "ぼうし", ["ぼうし", "くつした", "シャツ", "ズボン"]),
        q("<ruby>病気<rt>びょうき</rt></ruby>のときに<ruby>行<rt>い</rt></ruby>く<ruby>場所<rt>ばしょ</rt></ruby>は？", "びょういん", ["びょういん", "えき", "こうえん", "うみ"]),
        q("<ruby>電車<rt>でんしゃ</rt></ruby>に<ruby>乗<rt>の</rt></ruby>る<ruby>場所<rt>ばしょ</rt></ruby>は？", "えき", ["えき", "きょうしつ", "だいどころ", "にわ"]),
        q("<ruby>砂<rt>すな</rt></ruby>であそぶ<ruby>場所<rt>ばしょ</rt></ruby>は？", "すなば", ["すなば", "ほんだな", "げんかん", "おふろ"]),
        q("<ruby>歯<rt>は</rt></ruby>をみがくものは？", "はぶらし", ["はぶらし", "えんぴつ", "はさみ", "くつ"]),
        q("<ruby>絵<rt>え</rt></ruby>をかくときに<ruby>使<rt>つか</rt></ruby>うものは？", "クレヨン", ["クレヨン", "コップ", "タオル", "かぎ"]),
        q("<ruby>紙<rt>かみ</rt></ruby>を<ruby>切<rt>き</rt></ruby>るものは？", "はさみ", ["はさみ", "さら", "ぼうし", "くし"]),
        q("<ruby>手<rt>て</rt></ruby>をふくものは？", "タオル", ["タオル", "ノート", "くつ", "リボン"]),
        q("<ruby>寒<rt>さむ</rt></ruby>いときに<ruby>首<rt>くび</rt></ruby>にまくものは？", "マフラー", ["マフラー", "ズボン", "くつ", "めがね"]),
        q("<ruby>食<rt>た</rt></ruby>べものをのせるものは？", "さら", ["さら", "かぎ", "ほん", "くつした"]),
        q("<ruby>字<rt>じ</rt></ruby>を<ruby>消<rt>け</rt></ruby>すものは？", "けしゴム", ["けしゴム", "はし", "ぼうし", "ボール"])
    ];

    const ACTIONS = [
        {
            promptHtml: "「はしる」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "すばやく進む",
            choices: [r("すばやく進む", "すばやく<ruby>進<rt>すす</rt></ruby>む"), r("字を読む", "<ruby>字<rt>じ</rt></ruby>を<ruby>読<rt>よ</rt></ruby>む"), r("水を飲む", "<ruby>水<rt>みず</rt></ruby>を<ruby>飲<rt>の</rt></ruby>む"), r("音を聞く", "<ruby>音<rt>おと</rt></ruby>を<ruby>聞<rt>き</rt></ruby>く")]
        },
        {
            promptHtml: "「よむ」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "文字を見る",
            choices: [r("文字を見る", "<ruby>文字<rt>もじ</rt></ruby>を<ruby>見<rt>み</rt></ruby>る"), r("手をたたく", "<ruby>手<rt>て</rt></ruby>をたたく"), r("絵を消す", "<ruby>絵<rt>え</rt></ruby>を<ruby>消<rt>け</rt></ruby>す"), r("服を着る", "<ruby>服<rt>ふく</rt></ruby>を<ruby>着<rt>き</rt></ruby>る")]
        },
        {
            promptHtml: "「つくる」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "新しくできあがらせる",
            choices: [r("新しくできあがらせる", "<ruby>新<rt>あたら</rt></ruby>しくできあがらせる"), r("遠くへ投げる", "<ruby>遠<rt>とお</rt></ruby>くへ<ruby>投<rt>な</rt></ruby>げる"), r("静かに眠る", "<ruby>静<rt>しず</rt></ruby>かに<ruby>眠<rt>ねむ</rt></ruby>る"), r("水で洗う", "<ruby>水<rt>みず</rt></ruby>で<ruby>洗<rt>あら</rt></ruby>う")]
        },
        {
            promptHtml: "「さがす」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "見つけようとする",
            choices: [r("見つけようとする", "<ruby>見<rt>み</rt></ruby>つけようとする"), r("食べ物を切る", "<ruby>食<rt>た</rt></ruby>べ<ruby>物<rt>もの</rt></ruby>を<ruby>切<rt>き</rt></ruby>る"), r("歌を歌う", "<ruby>歌<rt>うた</rt></ruby>を<ruby>歌<rt>うた</rt></ruby>う"), r("道を走る", "<ruby>道<rt>みち</rt></ruby>を<ruby>走<rt>はし</rt></ruby>る")]
        },
        {
            promptHtml: "「しまう」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "片づける",
            choices: [r("片づける", "<ruby>片<rt>かた</rt></ruby>づける"), r("大きくする", "<ruby>大<rt>おお</rt></ruby>きくする"), r("色をぬる", "<ruby>色<rt>いろ</rt></ruby>をぬる"), r("早く読む", "<ruby>早<rt>はや</rt></ruby>く<ruby>読<rt>よ</rt></ruby>む")]
        },
        {
            promptHtml: "「あらう」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "きれいにする",
            choices: [r("きれいにする", "きれいにする"), r("小さく切る", "<ruby>小<rt>ちい</rt></ruby>さく<ruby>切<rt>き</rt></ruby>る"), r("声を出す", "<ruby>声<rt>こえ</rt></ruby>を<ruby>出<rt>だ</rt></ruby>す"), r("遠くを見る", "<ruby>遠<rt>とお</rt></ruby>くを<ruby>見<rt>み</rt></ruby>る")]
        },
        {
            promptHtml: "「なげる」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "手からとばす",
            choices: [r("手からとばす", "<ruby>手<rt>て</rt></ruby>からとばす"), r("目でさがす", "<ruby>目<rt>め</rt></ruby>でさがす"), r("耳で聞く", "<ruby>耳<rt>みみ</rt></ruby>で<ruby>聞<rt>き</rt></ruby>く"), r("足でける", "<ruby>足<rt>あし</rt></ruby>でける")]
        },
        {
            promptHtml: "「ひろう」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "落ちたものを取る",
            choices: [r("落ちたものを取る", "<ruby>落<rt>お</rt></ruby>ちたものを<ruby>取<rt>と</rt></ruby>る"), r("上にのぼる", "<ruby>上<rt>うえ</rt></ruby>にのぼる"), r("小さく切る", "<ruby>小<rt>ちい</rt></ruby>さく<ruby>切<rt>き</rt></ruby>る"), r("水を飲む", "<ruby>水<rt>みず</rt></ruby>を<ruby>飲<rt>の</rt></ruby>む")]
        },
        {
            promptHtml: "「はこぶ」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "別の場所へ持っていく",
            choices: [r("別の場所へ持っていく", "<ruby>別<rt>べつ</rt></ruby>の<ruby>場所<rt>ばしょ</rt></ruby>へ<ruby>持<rt>も</rt></ruby>っていく"), r("声を出して読む", "<ruby>声<rt>こえ</rt></ruby>を<ruby>出<rt>だ</rt></ruby>して<ruby>読<rt>よ</rt></ruby>む"), r("絵をかく", "<ruby>絵<rt>え</rt></ruby>をかく"), r("水で洗う", "<ruby>水<rt>みず</rt></ruby>で<ruby>洗<rt>あら</rt></ruby>う")]
        },
        {
            promptHtml: "「たたむ」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "小さく折る",
            choices: [r("小さく折る", "<ruby>小<rt>ちい</rt></ruby>さく<ruby>折<rt>お</rt></ruby>る"), r("大きく広げる", "<ruby>大<rt>おお</rt></ruby>きく<ruby>広<rt>ひろ</rt></ruby>げる"), r("遠くへ走る", "<ruby>遠<rt>とお</rt></ruby>くへ<ruby>走<rt>はし</rt></ruby>る"), r("強くたたく", "<ruby>強<rt>つよ</rt></ruby>くたたく")]
        },
        {
            promptHtml: "「ならべる」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "順におく",
            choices: [r("順におく", "<ruby>順<rt>じゅん</rt></ruby>におく"), r("水に入れる", "<ruby>水<rt>みず</rt></ruby>に<ruby>入<rt>い</rt></ruby>れる"), r("紙を切る", "<ruby>紙<rt>かみ</rt></ruby>を<ruby>切<rt>き</rt></ruby>る"), r("目をとじる", "<ruby>目<rt>め</rt></ruby>をとじる")]
        },
        {
            promptHtml: "「かぞえる」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "数をたしかめる",
            choices: [r("数をたしかめる", "<ruby>数<rt>かず</rt></ruby>をたしかめる"), r("絵をぬる", "<ruby>絵<rt>え</rt></ruby>をぬる"), r("外へ出る", "<ruby>外<rt>そと</rt></ruby>へ<ruby>出<rt>で</rt></ruby>る"), r("耳で聞く", "<ruby>耳<rt>みみ</rt></ruby>で<ruby>聞<rt>き</rt></ruby>く")]
        },
        {
            promptHtml: "「まぜる」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "いっしょにする",
            choices: [r("いっしょにする", "いっしょにする"), r("ひとつずつ分ける", "ひとつずつ<ruby>分<rt>わ</rt></ruby>ける"), r("高く上げる", "<ruby>高<rt>たか</rt></ruby>く<ruby>上<rt>あ</rt></ruby>げる"), r("静かに見る", "<ruby>静<rt>しず</rt></ruby>かに<ruby>見<rt>み</rt></ruby>る")]
        },
        {
            promptHtml: "「わける」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "いくつかにする",
            choices: [r("いくつかにする", "いくつかにする"), r("ひとつにまぜる", "ひとつにまぜる"), r("早く走る", "<ruby>早<rt>はや</rt></ruby>く<ruby>走<rt>はし</rt></ruby>る"), r("遠くを見る", "<ruby>遠<rt>とお</rt></ruby>くを<ruby>見<rt>み</rt></ruby>る")]
        },
        {
            promptHtml: "「まつ」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "来るまでいる",
            choices: [r("来るまでいる", "<ruby>来<rt>く</rt></ruby>るまでいる"), r("すぐ帰る", "すぐ<ruby>帰<rt>かえ</rt></ruby>る"), r("手を洗う", "<ruby>手<rt>て</rt></ruby>を<ruby>洗<rt>あら</rt></ruby>う"), r("本を読む", "<ruby>本<rt>ほん</rt></ruby>を<ruby>読<rt>よ</rt></ruby>む")]
        },
        {
            promptHtml: "「つたえる」は<ruby>何<rt>なに</rt></ruby>をすること？",
            answer: "話して知らせる",
            choices: [r("話して知らせる", "<ruby>話<rt>はな</rt></ruby>して<ruby>知<rt>し</rt></ruby>らせる"), r("水でぬらす", "<ruby>水<rt>みず</rt></ruby>でぬらす"), r("高くとぶ", "<ruby>高<rt>たか</rt></ruby>くとぶ"), r("紙を折る", "<ruby>紙<rt>かみ</rt></ruby>を<ruby>折<rt>お</rt></ruby>る")]
        }
    ];

    const SENTENCES = [
        q("<ruby>朝<rt>あさ</rt></ruby>になったので、カーテンを（　）。", "あける", ["あける", "たたく", "ならべる", "におう"]),
        q("<ruby>夜<rt>よる</rt></ruby>になったので、<ruby>電気<rt>でんき</rt></ruby>を（　）。", "けす", ["けす", "はく", "うえる", "まげる"]),
        q("<ruby>手<rt>て</rt></ruby>がよごれたので、<ruby>水<rt>みず</rt></ruby>で（　）。", "あらう", ["あらう", "はしる", "ならう", "さがす"]),
        q("<ruby>寒<rt>さむ</rt></ruby>いので、セーターを（　）。", "きる", ["きる", "ぬぐ", "かく", "のぼる"]),
        q("<ruby>道<rt>みち</rt></ruby>がわからないので、<ruby>地図<rt>ちず</rt></ruby>を（　）。", "みる", ["みる", "たべる", "とぶ", "しまう"]),
        q("<ruby>友<rt>とも</rt></ruby>だちに<ruby>会<rt>あ</rt></ruby>ったので、「おはよう」と（　）。", "いう", ["いう", "ぬる", "おる", "はこぶ"]),
        q("<ruby>花<rt>はな</rt></ruby>がしおれないように、<ruby>水<rt>みず</rt></ruby>を（　）。", "あげる", ["あげる", "たたむ", "けずる", "ならす"]),
        q("<ruby>本<rt>ほん</rt></ruby>を<ruby>読<rt>よ</rt></ruby>みおわったので、たなに（　）。", "しまう", ["しまう", "のむ", "およぐ", "はしる"]),
        q("<ruby>雨<rt>あめ</rt></ruby>がふっているので、かさを（　）。", "さす", ["さす", "ける", "たたむ", "ぬぐ"]),
        q("<ruby>給食<rt>きゅうしょく</rt></ruby>のまえに、<ruby>手<rt>て</rt></ruby>を（　）。", "あらう", ["あらう", "のぼる", "かぞえる", "まげる"]),
        q("<ruby>紙<rt>かみ</rt></ruby>をまっすぐに、はさみで（　）。", "きる", ["きる", "のむ", "ねむる", "あける"]),
        q("<ruby>友<rt>とも</rt></ruby>だちにボールを（　）。", "なげる", ["なげる", "よむ", "あらう", "かぶる"]),
        q("<ruby>落<rt>お</rt></ruby>ちているハンカチを（　）。", "ひろう", ["ひろう", "すわる", "けす", "わらう"]),
        q("<ruby>机<rt>つくえ</rt></ruby>の<ruby>上<rt>うえ</rt></ruby>にノートを（　）。", "ならべる", ["ならべる", "およぐ", "なく", "におう"]),
        q("みんなにおやつをひとつずつ（　）。", "わける", ["わける", "かくす", "おどる", "あける"]),
        q("<ruby>先生<rt>せんせい</rt></ruby>の<ruby>話<rt>はなし</rt></ruby>をしずかに（　）。", "きく", ["きく", "ける", "ぬる", "とぶ"]),
        q("<ruby>名前<rt>なまえ</rt></ruby>をよばれるまで、いすにすわって（　）。", "まつ", ["まつ", "はしる", "さがす", "のぼる"]),
        q("<ruby>家<rt>いえ</rt></ruby>の<ruby>人<rt>ひと</rt></ruby>にプリントを（　）。", "わたす", ["わたす", "けずる", "たたく", "まぜる"])
    ];

    function q(promptHtml, answer, choices) {
        return { promptHtml, answer, choices };
    }

    function shuffle(items) {
        const list = [...items];
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }

    function take(context, key, pool) {
        if (!context[key] || context[key].length === 0) context[key] = shuffle(pool);
        return context[key].pop();
    }

    function takeMany(context, key, pool, count) {
        if (!context[key] || context[key].length < count) context[key] = shuffle(pool);
        return Array.from({ length: count }, () => context[key].pop());
    }

    function cloneQuestion(type, title, item) {
        return {
            type,
            title,
            promptHtml: `<span class="question-title">${title}</span>${item.promptHtml}`,
            answer: item.answer,
            choices: shuffle(item.choices)
        };
    }

    function makeOppositeQuestion(context) {
        return cloneQuestion("opposite_word", "<ruby>反対<rt>はんたい</rt></ruby>のことば", take(context, "opposites", OPPOSITES));
    }

    function makeOppositePairQuestion(context) {
        const pairs = takeMany(context, "oppositePairs", OPPOSITE_PAIRS, 4);
        return {
            type: "opposite_pair",
            title: "<ruby>反対<rt>はんたい</rt></ruby>のペア",
            promptHtml: `<span class="question-title"><ruby>反対<rt>はんたい</rt></ruby>のペア</span><span class="question-line"><ruby>反対<rt>はんたい</rt></ruby>のいみになることばを、ぜんぶペアにしよう。</span>`,
            answer: "all_pairs_matched",
            matchClass: "kana-match word-match",
            matchItems: pairs.flatMap(([first, second]) => {
                const key = `${first}-${second}`;
                return [
                    { label: first, value: first, answerKey: key },
                    { label: second, value: second, answerKey: key }
                ];
            })
        };
    }

    function makeSimilarQuestion(context) {
        return cloneQuestion("similar_word", "<ruby>近<rt>ちか</rt></ruby>いことば", take(context, "similars", SIMILARS));
    }

    function makeThingPlaceQuestion(context) {
        return cloneQuestion("thing_place_word", "もの・<ruby>場所<rt>ばしょ</rt></ruby>", take(context, "thingsPlaces", THINGS_PLACES));
    }

    function makeActionQuestion(context) {
        return cloneQuestion("action_meaning", "<ruby>動<rt>うご</rt></ruby>きをあらわすことば", take(context, "actions", ACTIONS));
    }

    function makeSentenceQuestion(context) {
        return cloneQuestion("sentence_word", "<ruby>文<rt>ぶん</rt></ruby>に<ruby>合<rt>あ</rt></ruby>うことば", take(context, "sentences", SENTENCES));
    }

    window.LearningLaboTests.japanese_words = {
        createQuestions(count) {
            const context = {};
            const questions = PLAN.flatMap((item) => (
                Array.from({ length: item.count }, () => item.maker(context))
            ));
            return questions.slice(0, count);
        }
    };
})();
