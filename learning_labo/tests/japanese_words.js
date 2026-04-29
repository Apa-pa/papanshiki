(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const r = (value, labelHtml) => ({ value, labelHtml });

    const pool = [
        { promptHtml: "「おおきい」の<ruby>反対<rt>はんたい</rt></ruby>は？", answer: "ちいさい", choices: ["ちいさい", "ながい", "あかい", "あつい"] },
        { promptHtml: "「あつい」の<ruby>反対<rt>はんたい</rt></ruby>は？", answer: "さむい", choices: ["さむい", "からい", "ひろい", "つよい"] },
        { promptHtml: "「はやい」の<ruby>反対<rt>はんたい</rt></ruby>は？", answer: "おそい", choices: ["おそい", "たかい", "かるい", "ふるい"] },
        { promptHtml: "「たかい」の<ruby>反対<rt>はんたい</rt></ruby>は？", answer: "ひくい", choices: ["ひくい", "くらい", "ちかい", "よわい"] },
        { promptHtml: "「ながい」の<ruby>反対<rt>はんたい</rt></ruby>は？", answer: "みじかい", choices: ["みじかい", "せまい", "あさい", "やすい"] },
        { promptHtml: "「あかるい」の<ruby>反対<rt>はんたい</rt></ruby>は？", answer: "くらい", choices: ["くらい", "あまい", "おもい", "とおい"] },
        { promptHtml: "「おもい」の<ruby>反対<rt>はんたい</rt></ruby>は？", answer: "かるい", choices: ["かるい", "ひろい", "ふとい", "にがい"] },
        { promptHtml: "「ちかい」の<ruby>反対<rt>はんたい</rt></ruby>は？", answer: "とおい", choices: ["とおい", "つよい", "はやい", "まるい"] },
        { promptHtml: "「ひろい」の<ruby>反対<rt>はんたい</rt></ruby>は？", answer: "せまい", choices: ["せまい", "あかい", "うすい", "あつい"] },
        { promptHtml: "「ふるい」の<ruby>反対<rt>はんたい</rt></ruby>は？", answer: "あたらしい", choices: ["あたらしい", "ただしい", "やさしい", "たのしい"] },
        { promptHtml: "<ruby>花<rt>はな</rt></ruby>がたくさん<ruby>咲<rt>さ</rt></ruby>いている<ruby>場所<rt>ばしょ</rt></ruby>は？", answer: "はなばたけ", choices: ["はなばたけ", "すなば", "おふろ", "えき"] },
        { promptHtml: "<ruby>本<rt>ほん</rt></ruby>を<ruby>読<rt>よ</rt></ruby>む<ruby>場所<rt>ばしょ</rt></ruby>は？", answer: "としょかん", choices: ["としょかん", "びょういん", "こうえん", "うみ"] },
        { promptHtml: "ごはんを<ruby>作<rt>つく</rt></ruby>る<ruby>場所<rt>ばしょ</rt></ruby>は？", answer: "だいどころ", choices: ["だいどころ", "げんかん", "にわ", "ろうか"] },
        { promptHtml: "<ruby>雨<rt>あめ</rt></ruby>のときに<ruby>使<rt>つか</rt></ruby>うものは？", answer: "かさ", choices: ["かさ", "ぼうし", "はさみ", "ふで"] },
        { promptHtml: "<ruby>時間<rt>じかん</rt></ruby>を<ruby>見<rt>み</rt></ruby>るものは？", answer: "とけい", choices: ["とけい", "つくえ", "くつ", "さら"] },
        { promptHtml: "<ruby>字<rt>じ</rt></ruby>を<ruby>書<rt>か</rt></ruby>くものは？", answer: "えんぴつ", choices: ["えんぴつ", "はし", "かぎ", "くし"] },
        { promptHtml: "<ruby>手<rt>て</rt></ruby>を<ruby>洗<rt>あら</rt></ruby>うところは？", answer: "てあらいば", choices: ["てあらいば", "ほんだな", "くつばこ", "まど"] },
        { promptHtml: "<ruby>水<rt>みず</rt></ruby>を<ruby>飲<rt>の</rt></ruby>むときに<ruby>使<rt>つか</rt></ruby>うものは？", answer: "コップ", choices: ["コップ", "ノート", "リボン", "ボール"] },
        { promptHtml: "<ruby>足<rt>あし</rt></ruby>にはくものは？", answer: "くつ", choices: ["くつ", "てぶくろ", "めがね", "ぼうし"] },
        { promptHtml: "<ruby>頭<rt>あたま</rt></ruby>にかぶるものは？", answer: "ぼうし", choices: ["ぼうし", "くつした", "シャツ", "ズボン"] },
        { promptHtml: "「うれしい」に<ruby>近<rt>ちか</rt></ruby>いことばは？", answer: "たのしい", choices: ["たのしい", "かなしい", "こわい", "ねむい"] },
        { promptHtml: "「かなしい」に<ruby>近<rt>ちか</rt></ruby>いことばは？", answer: "さびしい", choices: ["さびしい", "あかるい", "からい", "まぶしい"] },
        { promptHtml: "「きれい」に<ruby>近<rt>ちか</rt></ruby>いことばは？", answer: "うつくしい", choices: ["うつくしい", "すくない", "おそい", "かたい"] },
        { promptHtml: "「たくさん」に<ruby>近<rt>ちか</rt></ruby>いことばは？", answer: "いっぱい", choices: ["いっぱい", "すこし", "からっぽ", "ひとつ"] },
        { promptHtml: "「すこし」に<ruby>近<rt>ちか</rt></ruby>いことばは？", answer: "ちょっと", choices: ["ちょっと", "ぜんぶ", "いっぱい", "ながく"] },
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
        }
    ];

    function shuffle(items) {
        const list = [...items];
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }

    window.LearningLaboTests.japanese_words = {
        createQuestions(count) {
            return shuffle(pool).slice(0, count).map((item) => ({
                prompt: item.prompt,
                promptHtml: item.promptHtml,
                answer: item.answer,
                choices: shuffle(item.choices)
            }));
        }
    };
})();
