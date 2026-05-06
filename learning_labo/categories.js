(function () {
    window.LearningLaboCategories = [
        {
            id: "math",
            name: "さんすう",
            icon: "🔢",
            className: "math",
            description: "けいさんの正しさとスピードをはかるよ。",
            categories: [
                {
                    id: "math_addition",
                    name: "たしざん",
                    levelLabel: "きほん",
                    questionCount: 20,
                    targetSeconds: 7,
                    gameId: "learning_labo_math_addition"
                },
                {
                    id: "math_subtraction",
                    name: "ひきざん",
                    levelLabel: "きほん",
                    questionCount: 20,
                    targetSeconds: 8,
                    gameId: "learning_labo_math_subtraction"
                },
                {
                    id: "math_multiplication",
                    name: "かけざん",
                    levelLabel: "九九",
                    questionCount: 20,
                    targetSeconds: 8,
                    gameId: "learning_labo_math_multiplication"
                },
                {
                    id: "math_division",
                    name: "わりざん",
                    levelLabel: "きほん",
                    questionCount: 20,
                    targetSeconds: 10,
                    gameId: "learning_labo_math_division"
                },
                {
                    id: "math_clock",
                    name: "とけい",
                    levelLabel: "じこく",
                    questionCount: 20,
                    targetSeconds: 11,
                    gameId: "learning_labo_math_clock"
                },
                {
                    id: "math_hissan",
                    name: "ひっさん",
                    levelLabel: "たてけいさん",
                    questionCount: 20,
                    targetSeconds: 13,
                    gameId: "learning_labo_math_hissan"
                }
            ]
        },
        {
            id: "japanese",
            name: "こくご",
            icon: "📖",
            className: "japanese",
            description: "もじ・ことば・かんじの力をはかるよ。",
            categories: [
                {
                    id: "japanese_kana",
                    name: "ひらがな・カタカナ",
                    levelLabel: "もじ",
                    questionCount: 20,
                    targetSeconds: 8,
                    gameId: "learning_labo_japanese_kana"
                },
                {
                    id: "japanese_words",
                    name: "ことばの意味",
                    levelLabel: "ごい",
                    questionCount: 20,
                    targetSeconds: 10,
                    gameId: "learning_labo_japanese_words"
                },
                {
                    id: "japanese_kanji_grade1",
                    name: "かんじ 1年生",
                    levelLabel: "かんじ",
                    questionCount: 20,
                    targetSeconds: 9,
                    gameId: "learning_labo_japanese_kanji_grade1"
                },
                {
                    id: "japanese_kanji_grade2",
                    name: "かんじ 2年生",
                    levelLabel: "かんじ",
                    questionCount: 20,
                    targetSeconds: 9,
                    gameId: "learning_labo_japanese_kanji_grade2"
                },
                {
                    id: "japanese_reading",
                    name: "読解",
                    levelLabel: "ぶんしょう",
                    questionCount: 20,
                    targetSeconds: 15,
                    gameId: "learning_labo_japanese_reading"
                }
            ]
        },
        {
            id: "english",
            name: "えいご",
            icon: "🔤",
            className: "english",
            description: "アルファベットやえいごのことばの力をはかるよ。",
            categories: [
                {
                    id: "english_alphabet",
                    name: "アルファベット",
                    levelLabel: "もじ",
                    questionCount: 20,
                    targetSeconds: 8,
                    gameId: "learning_labo_english_alphabet"
                }
            ]
        }
    ];
})();
