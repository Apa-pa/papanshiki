// kanji/grade1.js - 1年生の漢字データ（80字）
// 各漢字: kanji, readings(読み方), meaning(意味), strokes(画数), example(例文), hint(覚え方ヒント)

const GRADE1_KANJI = [
    // --- 数字 ---
    { kanji: "一", readings: ["いち", "ひと(つ)"], meaning: "かず の 1", strokes: 1, example: "一つ ください", hint: "よこ の ぼう 1ぽん" },
    { kanji: "二", readings: ["に", "ふた(つ)"], meaning: "かず の 2", strokes: 2, example: "二人 で あそぶ", hint: "よこ の ぼう 2ほん" },
    { kanji: "三", readings: ["さん", "み(つ)"], meaning: "かず の 3", strokes: 3, example: "三びき の こぶた", hint: "よこ の ぼう 3ぼん" },
    { kanji: "四", readings: ["し", "よ(つ)"], meaning: "かず の 4", strokes: 5, example: "四じ に かえる", hint: "くちの なかに ハが はいっている" },
    { kanji: "五", readings: ["ご", "いつ(つ)"], meaning: "かず の 5", strokes: 4, example: "五つ かぞえる", hint: "うえ と した に よこぼう" },
    { kanji: "六", readings: ["ろく", "む(つ)"], meaning: "かず の 6", strokes: 4, example: "六月 は あめがおおい", hint: "なべ の したに ハ" },
    { kanji: "七", readings: ["しち", "なな(つ)"], meaning: "かず の 7", strokes: 2, example: "七ならべ をする", hint: "カタカナ の ヒ みたい" },
    { kanji: "八", readings: ["はち", "や(つ)"], meaning: "かず の 8", strokes: 2, example: "八百屋さん にいく", hint: "ハ の かたち" },
    { kanji: "九", readings: ["きゅう", "ここの(つ)"], meaning: "かず の 9", strokes: 2, example: "九じ にねる", hint: "カタカナ の ノ と し" },
    { kanji: "十", readings: ["じゅう", "とお"], meaning: "かず の 10", strokes: 2, example: "十円 をひろう", hint: "たて と よこ の ぼう" },
    { kanji: "百", readings: ["ひゃく"], meaning: "かず の 100", strokes: 6, example: "百てん をとる", hint: "一 の した に 白" },
    { kanji: "千", readings: ["せん", "ち"], meaning: "かず の 1000", strokes: 3, example: "千円 さつ", hint: "ノ と 十 の くみあわせ" },

    // --- 自然・天気 ---
    { kanji: "山", readings: ["やま", "サン"], meaning: "たかい ところ", strokes: 3, example: "山 にのぼる", hint: "やま の かたちに にている" },
    { kanji: "川", readings: ["かわ", "セン"], meaning: "みず がながれる ところ", strokes: 3, example: "川 であそぶ", hint: "みず がながれる ように 3ぼん" },
    { kanji: "森", readings: ["もり", "シン"], meaning: "きがたくさん", strokes: 12, example: "森 の くまさん", hint: "木 が 3つ あつまった" },
    { kanji: "林", readings: ["はやし", "リン"], meaning: "きがならんでいるところ", strokes: 8, example: "林 のなか をさんぽ", hint: "木 が 2つ ならんでいる" },
    { kanji: "木", readings: ["き", "モク"], meaning: "えだやはがある しょくぶつ", strokes: 4, example: "大きな 木 にのぼる", hint: "十 の した に ハ" },
    { kanji: "花", readings: ["はな", "カ"], meaning: "きれいに さくもの", strokes: 7, example: "花 をそだてる", hint: "くさかんむり に ヒ" },
    { kanji: "草", readings: ["くさ", "ソウ"], meaning: "じめんにはえる みどり", strokes: 9, example: "草 のうえに ねころぶ", hint: "くさかんむり に 早" },
    { kanji: "竹", readings: ["たけ", "チク"], meaning: "まっすぐ のびる しょくぶつ", strokes: 6, example: "竹 のこ をたべる", hint: "たけかんむり の かたち" },
    { kanji: "空", readings: ["そら", "クウ"], meaning: "うえに ひろがる あおい ところ", strokes: 8, example: "空 がきれい", hint: "あなかんむり に エ" },
    { kanji: "雨", readings: ["あめ", "ウ"], meaning: "そらから おちてくる みず", strokes: 8, example: "雨 がふる", hint: "くも から しずく がおちる かたち" },
    { kanji: "天", readings: ["てん", "あま"], meaning: "おそら、かみさま", strokes: 4, example: "天 きよほう", hint: "一 の した に 大" },
    { kanji: "気", readings: ["き", "ケ"], meaning: "きもち、くうき", strokes: 6, example: "天気 がいい", hint: "气 の なかに メ" },
    { kanji: "夕", readings: ["ゆう", "セキ"], meaning: "ひがしずむころ", strokes: 3, example: "夕 やけ がきれい", hint: "カタカナ の タ ににている" },

    // --- 方向・位置 ---
    { kanji: "上", readings: ["うえ", "ジョウ"], meaning: "たかいほう", strokes: 3, example: "上 をみる", hint: "よこぼうの うえ にたてぼう" },
    { kanji: "下", readings: ["した", "カ"], meaning: "ひくいほう", strokes: 3, example: "下 をむく", hint: "よこぼうの した にたてぼう" },
    { kanji: "左", readings: ["ひだり", "サ"], meaning: "ひだりがわ", strokes: 5, example: "左 にまがる", hint: "ナ と エ のくみあわせ" },
    { kanji: "右", readings: ["みぎ", "ウ"], meaning: "みぎがわ", strokes: 5, example: "右 にまがる", hint: "ナ と 口 のくみあわせ" },
    { kanji: "中", readings: ["なか", "チュウ"], meaning: "まんなか", strokes: 4, example: "まんなか にたつ", hint: "口 の まんなか にぼう" },
    { kanji: "大", readings: ["おお(きい)", "ダイ"], meaning: "おおきい", strokes: 3, example: "大きい いぬ", hint: "ひと がてをひろげた かたち" },
    { kanji: "小", readings: ["ちい(さい)", "ショウ"], meaning: "ちいさい", strokes: 3, example: "小さい ねこ", hint: "ハ の あいだに たてぼう" },

    // --- 日・時間 ---
    { kanji: "日", readings: ["ひ", "ニチ"], meaning: "たいよう、ひにち", strokes: 4, example: "日 ようび", hint: "おひさま の かたち" },
    { kanji: "月", readings: ["つき", "ゲツ"], meaning: "よるの そら にでるもの", strokes: 4, example: "月 がきれい", hint: "おつきさま の かたち" },
    { kanji: "年", readings: ["とし", "ネン"], meaning: "1ねんかん", strokes: 6, example: "一年生 になる", hint: "ノ の した に いろいろ" },
    { kanji: "早", readings: ["はや(い)", "ソウ"], meaning: "はやい、あさ", strokes: 6, example: "早 おきする", hint: "日 のうえ に十" },

    // --- 火・水・土 ---
    { kanji: "火", readings: ["ひ", "カ"], meaning: "もえるもの、ほのお", strokes: 4, example: "火 をつける", hint: "ほのお の かたち" },
    { kanji: "水", readings: ["みず", "スイ"], meaning: "のみもの、えきたい", strokes: 4, example: "水 をのむ", hint: "まんなかの ぼう から みず がとぶ" },
    { kanji: "土", readings: ["つち", "ド"], meaning: "じめん のもの", strokes: 3, example: "土 をほる", hint: "十 の した に よこぼう" },
    { kanji: "石", readings: ["いし", "セキ"], meaning: "かたい もの", strokes: 5, example: "石 をひろう", hint: "一 の した に 口" },
    { kanji: "金", readings: ["かね", "キン"], meaning: "おかね、きんぞく", strokes: 8, example: "お 金 をはらう", hint: "ひと の した に いろいろ" },
    { kanji: "玉", readings: ["たま", "ギョク"], meaning: "まるい たからもの", strokes: 5, example: "玉 いれ をする", hint: "王 に てん がついた" },

    // --- 人・体 ---
    { kanji: "人", readings: ["ひと", "ジン"], meaning: "にんげん", strokes: 2, example: "人 がいっぱい", hint: "ふたつの あし で たっている" },
    { kanji: "子", readings: ["こ", "シ"], meaning: "こども", strokes: 3, example: "男の子 が はしる", hint: "あかちゃん の かたち" },
    { kanji: "女", readings: ["おんな", "ジョ"], meaning: "おんなの ひと", strokes: 3, example: "女 のこ がわらう", hint: "くの じ と ノ" },
    { kanji: "男", readings: ["おとこ", "ダン"], meaning: "おとこの ひと", strokes: 7, example: "男 のこ がはしる", hint: "田 の した に 力" },
    { kanji: "目", readings: ["め", "モク"], meaning: "ものを みるところ", strokes: 5, example: "目 でみる", hint: "おめめ の かたち" },
    { kanji: "耳", readings: ["みみ", "ジ"], meaning: "おとを きくところ", strokes: 6, example: "耳 できく", hint: "おみみ の かたち" },
    { kanji: "口", readings: ["くち", "コウ"], meaning: "たべたり はなしたり するところ", strokes: 3, example: "口 をあける", hint: "しかくい かたち" },
    { kanji: "手", readings: ["て", "シュ"], meaning: "ものを もつところ", strokes: 4, example: "手 をあらう", hint: "よこぼう に たてぼう" },
    { kanji: "足", readings: ["あし", "ソク"], meaning: "あるく ところ", strokes: 7, example: "足 がはやい", hint: "口 の した に いろいろ" },
    { kanji: "力", readings: ["ちから", "リキ"], meaning: "つよさ、パワー", strokes: 2, example: "力 もち", hint: "カタカナ の カ ににている" },

    // --- 動き ---
    { kanji: "入", readings: ["い(る)", "ニュウ"], meaning: "なかに はいる", strokes: 2, example: "へや に 入る", hint: "ハ の ぎゃく" },
    { kanji: "出", readings: ["で(る)", "シュツ"], meaning: "そとに でる", strokes: 5, example: "外 に 出る", hint: "山 が 2つ かさなった" },
    { kanji: "立", readings: ["た(つ)", "リツ"], meaning: "たちあがる", strokes: 5, example: "立って ください", hint: "ひとが たっている かたち" },
    { kanji: "休", readings: ["やす(む)", "キュウ"], meaning: "やすむ", strokes: 6, example: "休み じかん", hint: "人 が 木 のよこに いる" },
    { kanji: "見", readings: ["み(る)", "ケン"], meaning: "みる", strokes: 7, example: "テレビを 見る", hint: "目 の した に ひと" },

    // --- 学校 ---
    { kanji: "先", readings: ["さき", "セン"], meaning: "まえ、さきに", strokes: 6, example: "先生 おはようございます", hint: "ひと の あし がまえに でてる" },
    { kanji: "生", readings: ["い(きる)", "セイ"], meaning: "いきる、うまれる", strokes: 5, example: "先生 にきく", hint: "つち から め がでた" },
    { kanji: "学", readings: ["まな(ぶ)", "ガク"], meaning: "べんきょうする", strokes: 8, example: "学校 にいく", hint: "ワかんむり に 子" },
    { kanji: "校", readings: ["コウ"], meaning: "がっこう", strokes: 10, example: "学校 がすき", hint: "きへん に まじわる" },
    { kanji: "字", readings: ["じ", "ジ"], meaning: "もじ", strokes: 6, example: "字 をかく", hint: "うかんむり に 子" },
    { kanji: "文", readings: ["ぶん", "モン"], meaning: "ぶんしょう", strokes: 4, example: "文 をかく", hint: "なべぶた に メ" },
    { kanji: "本", readings: ["もと", "ホン"], meaning: "ほん、もとの", strokes: 5, example: "本 をよむ", hint: "木 の したに よこぼう" },
    { kanji: "名", readings: ["な", "メイ"], meaning: "なまえ", strokes: 6, example: "名前 をかく", hint: "夕 と 口 のくみあわせ" },
    { kanji: "正", readings: ["ただ(しい)", "セイ"], meaning: "ただしい", strokes: 5, example: "正しい こたえ", hint: "一 と 止 のくみあわせ" },
    { kanji: "円", readings: ["えん", "エン"], meaning: "おかねの たんい、まる", strokes: 4, example: "百 円 だま", hint: "まるい おかね の い（囲）" },

    // --- 色 ---
    { kanji: "赤", readings: ["あか", "セキ"], meaning: "あかいろ", strokes: 7, example: "赤い りんご", hint: "土 の した に ひ" },
    { kanji: "青", readings: ["あお", "セイ"], meaning: "あおいろ", strokes: 8, example: "青い そら", hint: "うえに 三 した に 月" },
    { kanji: "白", readings: ["しろ", "ハク"], meaning: "しろいろ", strokes: 5, example: "白い ゆき", hint: "日 にてん がついた" },

    // --- 動物・虫 ---
    { kanji: "犬", readings: ["いぬ", "ケン"], meaning: "ワンワン なくどうぶつ", strokes: 4, example: "犬 をかう", hint: "大 に てん がついた" },
    { kanji: "虫", readings: ["むし", "チュウ"], meaning: "ちいさい いきもの", strokes: 6, example: "虫 とり にいく", hint: "むし の かたち" },
    { kanji: "貝", readings: ["かい", "バイ"], meaning: "うみに いるいきもの", strokes: 7, example: "貝 がら をひろう", hint: "め と ハ のくみあわせ" },

    // --- 音・王 ---
    { kanji: "音", readings: ["おと", "オン"], meaning: "きこえるもの", strokes: 9, example: "音 がする", hint: "立 と 日 のくみあわせ" },
    { kanji: "王", readings: ["おう", "オウ"], meaning: "くに の いちばんえらいひと", strokes: 4, example: "王 さま になる", hint: "よこぼう 3ほん と たてぼう" },

    // --- 場所 ---
    { kanji: "田", readings: ["た", "デン"], meaning: "おこめ をつくるところ", strokes: 5, example: "田んぼ であそぶ", hint: "しかくい はたけ" },
    { kanji: "町", readings: ["まち", "チョウ"], meaning: "ひとがすむ ところ", strokes: 7, example: "町 をさんぽ", hint: "田 に ちょう" },
    { kanji: "村", readings: ["むら", "ソン"], meaning: "ちいさい まち", strokes: 7, example: "村 のおまつり", hint: "きへん に すん" },
    { kanji: "車", readings: ["くるま", "シャ"], meaning: "タイヤがある のりもの", strokes: 7, example: "車 にのる", hint: "くるま を うえからみた かたち" },
];
