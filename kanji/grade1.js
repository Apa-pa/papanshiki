// kanji/grade1.js - 1年生の漢字データ（80字）
// 各漢字: kanji, readings(読み方), meaning(意味), strokes(画数), example(例文), hint(覚え方ヒント), example_reading(例文での読み方)

const GRADE1_KANJI = [
    // --- 数字 ---
    { kanji: "一", readings: ["いち", "ひと(つ)"], meaning: "かず の 1", strokes: 1, example: "一つ だけください", hint: "よこ の ぼう 1ぽん", example_reading: ["ひと"] },
    { kanji: "二", readings: ["に", "ふた(つ)"], meaning: "かず の 2", strokes: 2, example: "きみとぼくで二人", hint: "よこ の ぼう 2ほん", example_reading: ["ふた"] },
    { kanji: "三", readings: ["さん", "み(つ)"], meaning: "かず の 3", strokes: 3, example: "三びき の こぶた", hint: "よこ の ぼう 3ぼん", example_reading: ["さん"] },
    { kanji: "四", readings: ["し", "よ(つ)"], meaning: "かず の 4", strokes: 5, example: "３つのつぎは四つ", hint: "くちの なかに ハが はいっている", example_reading: ["よっ"] },
    { kanji: "五", readings: ["ご", "いつ(つ)"], meaning: "かず の 5", strokes: 4, example: "よっつのつぎは五つ", hint: "うえ と した に よこぼう", example_reading: ["いつ"] },
    { kanji: "六", readings: ["ろく", "む(つ)"], meaning: "かず の 6", strokes: 4, example: "六月 は雨が多い", hint: "なべ の したに ハ", example_reading: ["ろく"] },
    { kanji: "七", readings: ["しち", "なな(つ)"], meaning: "かず の 7", strokes: 2, example: "七ならべ をする", hint: "カタカナ の ヒ みたい", example_reading: ["しち"] },
    { kanji: "八", readings: ["はち", "や(つ)"], meaning: "かず の 8", strokes: 2, example: "八おやさんのやさい", hint: "ハ の かたち", example_reading: ["や"] },
    { kanji: "九", readings: ["きゅう", "ここの(つ)"], meaning: "かず の 9", strokes: 2, example: "１０のまえは九", hint: "カタカナ の ノ と し", example_reading: ["きゅう"] },
    { kanji: "十", readings: ["じゅう", "とお"], meaning: "かず の 10", strokes: 2, example: "十円玉 はちゃいろい", hint: "たて と よこ の ぼう", example_reading: ["じゅう"] },
    { kanji: "百", readings: ["ひゃく"], meaning: "かず の 100", strokes: 6, example: "百てん をとりたい", hint: "一 の した に 白", example_reading: ["ひゃく"] },
    { kanji: "千", readings: ["せん", "ち"], meaning: "かず の 1000", strokes: 3, example: "千円 さつ", hint: "ノ と 十 の くみあわせ", example_reading: ["せん"] },

    // --- 自然・天気 ---
    { kanji: "山", readings: ["やま", "サン"], meaning: "たかい ところ", strokes: 3, example: "山 にのぼる", hint: "やま の かたちに にている", example_reading: ["やま"] },
    { kanji: "川", readings: ["かわ", "セン"], meaning: "みず がながれる ところ", strokes: 3, example: "川 で水あそび", hint: "みず がながれる ように 3ぼん", example_reading: ["かわ"] },
    { kanji: "森", readings: ["もり", "シン"], meaning: "きがたくさん", strokes: 12, example: "森 の くまさん", hint: "木 が 3つ あつまった", example_reading: ["もり"] },
    { kanji: "林", readings: ["はやし", "リン"], meaning: "きがならんでいるところ", strokes: 8, example: "木がならぶ 林", hint: "木 が 2つ ならんでいる", example_reading: ["はやし"] },
    { kanji: "木", readings: ["き", "モク"], meaning: "えだやはがある しょくぶつ", strokes: 4, example: "さるが 木 にのぼる", hint: "十 の した に ハ", example_reading: ["き"] },
    { kanji: "花", readings: ["はな", "カ"], meaning: "きれいに さくもの", strokes: 7, example: "花 をそだてる", hint: "くさかんむり に ヒ", example_reading: ["はな"] },
    { kanji: "草", readings: ["くさ", "ソウ"], meaning: "じめんにはえる みどり", strokes: 9, example: "草 のうえに ねころぶ", hint: "くさかんむり に 早", example_reading: ["くさ"] },
    { kanji: "竹", readings: ["たけ", "チク"], meaning: "まっすぐ のびる しょくぶつ", strokes: 6, example: "竹 のこ をたべる", hint: "たけかんむり の かたち", example_reading: ["たけ"] },
    { kanji: "空", readings: ["そら", "クウ"], meaning: "うえに ひろがる あおい ところ", strokes: 8, example: "あおい空 がきれい", hint: "あなかんむり に エ", example_reading: ["そら"] },
    { kanji: "雨", readings: ["あめ", "ウ"], meaning: "そらから おちてくる みず", strokes: 8, example: "雨 がふる", hint: "くも から しずく がおちる かたち", example_reading: ["あめ"] },
    { kanji: "天", readings: ["てん", "あま"], meaning: "おそら、かみさま", strokes: 4, example: "天 きよほう", hint: "一 の した に 大", example_reading: ["てん"] },
    { kanji: "気", readings: ["き", "ケ"], meaning: "きもち、くうき", strokes: 6, example: "天気 がいい", hint: "气 の なかに メ", example_reading: ["き"] },
    { kanji: "夕", readings: ["ゆう", "セキ"], meaning: "ひがしずむころ", strokes: 3, example: "夕 やけ がきれい", hint: "カタカナ の タ ににている", example_reading: ["ゆう"] },

    // --- 方向・位置 ---
    { kanji: "上", readings: ["うえ", "ジョウ"], meaning: "たかいほう", strokes: 3, example: "かおをあげて上 をみる", hint: "よこぼうの うえ にたてぼう", example_reading: ["うえ"] },
    { kanji: "下", readings: ["した", "カ"], meaning: "ひくいほう", strokes: 3, example: "あしをみて下 をみる", hint: "よこぼうの した にたてぼう", example_reading: ["した"] },
    { kanji: "左", readings: ["ひだり", "サ"], meaning: "ひだりがわ", strokes: 5, example: "みぎのはんたいは左", hint: "ナ と エ のくみあわせ", example_reading: ["ひだり"] },
    { kanji: "右", readings: ["みぎ", "ウ"], meaning: "みぎがわ", strokes: 5, example: "ひだりのはんたいは右", hint: "ナ と 口 のくみあわせ", example_reading: ["みぎ"] },
    { kanji: "中", readings: ["なか", "チュウ"], meaning: "まんなか", strokes: 4, example: "まん中 にたつ", hint: "口 の まんなか にぼう", example_reading: ["なか"] },
    { kanji: "大", readings: ["おお(きい)", "ダイ"], meaning: "おおきい", strokes: 3, example: "大きい いぬ", hint: "ひと がてをひろげた かたち", example_reading: ["おお"] },
    { kanji: "小", readings: ["ちい(さい)", "ショウ"], meaning: "ちいさい", strokes: 3, example: "小さい ねこ", hint: "ハ の あいだに たてぼう", example_reading: ["ちい"] },

    // --- 日・時間 ---
    { kanji: "日", readings: ["ひ", "ニチ"], meaning: "たいよう、ひにち", strokes: 4, example: "日 ようびはやすみ", hint: "おひさま の かたち", example_reading: ["にち"] },
    { kanji: "月", readings: ["つき", "ゲツ"], meaning: "よるの そら にでるもの", strokes: 4, example: "月 がきれい", hint: "おつきさま の かたち", example_reading: ["つき"] },
    { kanji: "年", readings: ["とし", "ネン"], meaning: "1ねんかん", strokes: 6, example: "一年生 になる", hint: "ノ の した に いろいろ", example_reading: ["ねん"] },
    { kanji: "早", readings: ["はや(い)", "ソウ"], meaning: "はやい、あさ", strokes: 6, example: "早 おきする", hint: "日 のうえ に十", example_reading: ["はや"] },

    // --- 火・水・土 ---
    { kanji: "火", readings: ["ひ", "カ"], meaning: "もえるもの、ほのお", strokes: 4, example: "火 をつける", hint: "ほのお の かたち", example_reading: ["ひ"] },
    { kanji: "水", readings: ["みず", "スイ"], meaning: "のみもの、えきたい", strokes: 4, example: "水 をのむ", hint: "まんなかの ぼう から みず がとぶ", example_reading: ["みず"] },
    { kanji: "土", readings: ["つち", "ド"], meaning: "じめん のもの", strokes: 3, example: "土 をほる", hint: "十 の した に よこぼう", example_reading: ["つち"] },
    { kanji: "石", readings: ["いし", "セキ"], meaning: "かたい もの", strokes: 5, example: "かたい石をひろう", hint: "一 の した に 口", example_reading: ["いし"] },
    { kanji: "金", readings: ["かね", "キン"], meaning: "おかね、きんぞく", strokes: 8, example: "お 金 をはらう", hint: "ひと の した に いろいろ", example_reading: ["かね"] },
    { kanji: "玉", readings: ["たま", "ギョク"], meaning: "まるい たからもの", strokes: 5, example: "玉 いれ をする", hint: "王 に てん がついた", example_reading: ["たま"] },

    // --- 人・体 ---
    { kanji: "人", readings: ["ひと", "ジン"], meaning: "にんげん", strokes: 2, example: "人 がいっぱい", hint: "ふたつの あし で たっている", example_reading: ["ひと"] },
    { kanji: "子", readings: ["こ", "シ"], meaning: "こども", strokes: 3, example: "男の子 が はしる", hint: "あかちゃん の かたち", example_reading: ["こ"] },
    { kanji: "女", readings: ["おんな", "ジョ"], meaning: "おんなの ひと", strokes: 3, example: "かぐやひめは女のこ", hint: "くの じ と ノ", example_reading: ["おんな"] },
    { kanji: "男", readings: ["おとこ", "ダン"], meaning: "おとこの ひと", strokes: 7, example: "ももたろうは男のこ", hint: "田 の した に 力", example_reading: ["おとこ"] },
    { kanji: "目", readings: ["め", "モク"], meaning: "ものを みるところ", strokes: 5, example: "目 でみる", hint: "おめめ の かたち", example_reading: ["め"] },
    { kanji: "耳", readings: ["みみ", "ジ"], meaning: "おとを きくところ", strokes: 6, example: "耳 できく", hint: "おみみ の かたち", example_reading: ["みみ"] },
    { kanji: "口", readings: ["くち", "コウ"], meaning: "たべたり はなしたり するところ", strokes: 3, example: "口 をあける", hint: "しかくい かたち", example_reading: ["くち"] },
    { kanji: "手", readings: ["て", "シュ"], meaning: "ものを もつところ", strokes: 4, example: "手 をあらう", hint: "よこぼう に たてぼう", example_reading: ["て"] },
    { kanji: "足", readings: ["あし", "ソク"], meaning: "あるく ところ", strokes: 7, example: "足 がはやい", hint: "口 の した に いろいろ", example_reading: ["あし"] },
    { kanji: "力", readings: ["ちから", "リキ"], meaning: "つよさ、パワー", strokes: 2, example: "力 もち", hint: "カタカナ の カ ににている", example_reading: ["ちから"] },

    // --- 動き ---
    { kanji: "入", readings: ["い(る)", "ニュウ"], meaning: "なかに はいる", strokes: 2, example: "へや に 入る", hint: "ハ の ぎゃく", example_reading: ["はい"] },
    { kanji: "出", readings: ["で(る)", "シュツ"], meaning: "そとに でる", strokes: 5, example: "外 に 出る", hint: "山 が 2つ かさなった", example_reading: ["で"] },
    { kanji: "立", readings: ["た(つ)", "リツ"], meaning: "たちあがる", strokes: 5, example: "立って ください", hint: "ひとが たっている かたち", example_reading: ["た"] },
    { kanji: "休", readings: ["やす(む)", "キュウ"], meaning: "やすむ", strokes: 6, example: "休み じかん", hint: "人 が 木 のよこに いる", example_reading: ["やす"] },
    { kanji: "見", readings: ["み(る)", "ケン"], meaning: "みる", strokes: 7, example: "テレビを 見る", hint: "目 の した に ひと", example_reading: ["み"] },

    // --- 学校 ---
    { kanji: "先", readings: ["さき", "セン"], meaning: "まえ、さきに", strokes: 6, example: "先生 がはなす", hint: "ひと の あし がまえに でてる", example_reading: ["せん"] },
    { kanji: "生", readings: ["い(きる)", "セイ"], meaning: "いきる、うまれる", strokes: 5, example: "先生 にきく", hint: "つち から め がでた", example_reading: ["せい"] },
    { kanji: "学", readings: ["まな(ぶ)", "ガク"], meaning: "べんきょうする", strokes: 8, example: "学校 にいく", hint: "ワかんむり に 子", example_reading: ["がっ"] },
    { kanji: "校", readings: ["コウ"], meaning: "がっこう", strokes: 10, example: "学校 がすき", hint: "きへん に まじわる", example_reading: ["こう"] },
    { kanji: "字", readings: ["じ", "ジ"], meaning: "もじ", strokes: 6, example: "ノートに字 をかく", hint: "うかんむり に 子", example_reading: ["じ"] },
    { kanji: "文", readings: ["ぶん", "モン"], meaning: "ぶんしょう", strokes: 4, example: "さく文 をかく", hint: "なべぶた に メ", example_reading: ["ぶん"] },
    { kanji: "本", readings: ["もと", "ホン"], meaning: "ほん、もとの", strokes: 5, example: "本 をよむ", hint: "木 の したに よこぼう", example_reading: ["ほん"] },
    { kanji: "名", readings: ["な", "メイ"], meaning: "なまえ", strokes: 6, example: "名なま をかく", hint: "夕 と 口 のくみあわせ", example_reading: ["な"] },
    { kanji: "正", readings: ["ただ(しい)", "セイ"], meaning: "ただしい", strokes: 5, example: "正しい こたえ", hint: "一 と 止 のくみあわせ", example_reading: ["ただ"] },
    { kanji: "円", readings: ["えん", "エン"], meaning: "おかねの たんい、まる", strokes: 4, example: "百 円 だま", hint: "まるい おかね の い（囲）", example_reading: ["えん"] },
    { kanji: "糸", readings: ["いと", "シ"], meaning: "ぬうとき につかうもの", strokes: 6, example: "糸 でぬう", hint: "いと が からまっている かたち", example_reading: ["いと"] },

    // --- 色 ---
    { kanji: "赤", readings: ["あか", "セキ"], meaning: "あかいろ", strokes: 7, example: "赤い りんご", hint: "土 の した に ひ", example_reading: ["あか"] },
    { kanji: "青", readings: ["あお", "セイ"], meaning: "あおいろ", strokes: 8, example: "青い そら", hint: "うえに 三 した に 月", example_reading: ["あお"] },
    { kanji: "白", readings: ["しろ", "ハク"], meaning: "しろいろ", strokes: 5, example: "白い ゆき", hint: "日 にてん がついた", example_reading: ["しろ"] },

    // --- 動物・虫 ---
    { kanji: "犬", readings: ["いぬ", "ケン"], meaning: "ワンワン なくどうぶつ", strokes: 4, example: "よくほえる犬", hint: "大 に てん がついた", example_reading: ["いぬ"] },
    { kanji: "虫", readings: ["むし", "チュウ"], meaning: "ちいさい いきもの", strokes: 6, example: "虫 とり にいく", hint: "むし の かたち", example_reading: ["むし"] },
    { kanji: "貝", readings: ["かい", "バイ"], meaning: "うみに いるいきもの", strokes: 7, example: "貝 がら をひろう", hint: "め と ハ のくみあわせ", example_reading: ["かい"] },

    // --- 音・王 ---
    { kanji: "音", readings: ["おと", "オン"], meaning: "きこえるもの", strokes: 9, example: "いい音 がする", hint: "立 と 日 のくみあわせ", example_reading: ["おと"] },
    { kanji: "王", readings: ["おう", "オウ"], meaning: "くに の いちばんえらいひと", strokes: 4, example: "王 さま になる", hint: "よこぼう 3ほん と たてぼう", example_reading: ["おう"] },

    // --- 場所 ---
    { kanji: "田", readings: ["た", "デン"], meaning: "おこめ をつくるところ", strokes: 5, example: "田んぼ であそぶ", hint: "しかくい はたけ", example_reading: ["た"] },
    { kanji: "町", readings: ["まち", "チョウ"], meaning: "ひとがすむ ところ", strokes: 7, example: "町中 をあるく", hint: "田 に ちょう", example_reading: ["まち"] },
    { kanji: "村", readings: ["むら", "ソン"], meaning: "ちいさい まち", strokes: 7, example: "ちいさな村 にいく", hint: "きへん に すん", example_reading: ["むら"] },
    { kanji: "車", readings: ["くるま", "シャ"], meaning: "タイヤがある のりもの", strokes: 7, example: "じてん車 にのる", hint: "くるま を うえからみた かたち", example_reading: ["くるま"] },
];