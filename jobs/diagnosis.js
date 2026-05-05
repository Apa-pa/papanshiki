// ===================================================
//  おしごと診断ロジック (diagnosis.js)
//  子ども向けの2段階タイプ診断 + 職業おすすめ
// ===================================================

const CORE_QUESTIONS = [
    {
        question: "Q1. <ruby>遠足<rt>えんそく</rt></ruby>のバスで、いちばんワクワクするのはどっち？",
        choices: [
            { text: "みんなでおしゃべりしたり、ゲームをして<ruby>盛<rt>も</rt></ruby>り<ruby>上<rt>あ</rt></ruby>がる！", effects: { social: 2, expressive: 1 } },
            { text: "<ruby>外<rt>そと</rt></ruby>をながめたり、これからのことをゆっくり<ruby>考<rt>かんが</rt></ruby>える！", effects: { independent: 2, observant: 1 } }
        ]
    },
    {
        question: "Q2. あそびを<ruby>思<rt>おも</rt></ruby>いつくとき、どっちが<ruby>得意<rt>とくい</rt></ruby>？",
        choices: [
            { text: "まだないルールや、おもしろいアイデアをポンッと<ruby>出<rt>だ</rt></ruby>す！", effects: { imaginative: 2, flexible: 1 } },
            { text: "まず<ruby>見<rt>み</rt></ruby>たことや、ほんとうにできそうかをしっかりたしかめる！", effects: { observant: 2, logical: 1 } }
        ]
    },
    {
        question: "Q3. お<ruby>友<rt>とも</rt></ruby>だちどうしでケンカしていたら、どっちをしそう？",
        choices: [
            { text: "「だいじょうぶ？」って<ruby>気<rt>き</rt></ruby>もちをきいて、なかなおりをてつだう！", effects: { caring: 2, social: 1 } },
            { text: "どうしてケンカになったのか、<ruby>順番<rt>じゅんばん</rt></ruby>に<ruby>整理<rt>せいり</rt></ruby>してみる！", effects: { logical: 2, organized: 1 } }
        ]
    },
    {
        question: "Q4. つくる<ruby>活動<rt>かつどう</rt></ruby>でうれしいのはどっち？",
        choices: [
            { text: "その<ruby>場<rt>ば</rt></ruby>でひらめいて、どんどん<ruby>自由<rt>じゆう</rt></ruby>にかたちをかえる！", effects: { flexible: 2, imaginative: 1, handsOn: 1 } },
            { text: "<ruby>最初<rt>さいしょ</rt></ruby>に<ruby>考<rt>かんが</rt></ruby>えたとおりに、ていねいにつくりあげる！", effects: { organized: 2, handsOn: 1 } }
        ]
    },
    {
        question: "Q5. しらない<ruby>場所<rt>ばしょ</rt></ruby>にいったとき、どっちがワクワクする？",
        choices: [
            { text: "そこでしか<ruby>見<rt>み</rt></ruby>られないものや、ふしぎなことを<ruby>見<rt>み</rt></ruby>つける！", effects: { investigative: 2, observant: 1, independent: 1 } },
            { text: "そこで<ruby>会<rt>あ</rt></ruby>った<ruby>人<rt>ひと</rt></ruby>と<ruby>話<rt>はな</rt></ruby>したり、いっしょにたのしむ！", effects: { social: 2, caring: 1 } }
        ]
    },
    {
        question: "Q6. クラスで<ruby>新<rt>あたら</rt></ruby>しい<ruby>係<rt>かかり</rt></ruby>をつくるなら、どっちにひかれる？",
        choices: [
            { text: "みんなをまとめたり、「こうしよう！」と<ruby>前<rt>まえ</rt></ruby>に<ruby>出<rt>で</rt></ruby>る<ruby>役<rt>やく</rt></ruby>！", effects: { leadership: 2, social: 1, organized: 1 } },
            { text: "<ruby>必要<rt>ひつよう</rt></ruby>なものをしらべたり、うまくいくように<ruby>準備<rt>じゅんび</rt></ruby>する<ruby>役<rt>やく</rt></ruby>！", effects: { organized: 2, logical: 1, independent: 1 } }
        ]
    },
    {
        question: "Q7. だれかをよろこばせるなら、どっちをしたい？",
        choices: [
            { text: "<ruby>歌<rt>うた</rt></ruby>ったり、お<ruby>話<rt>はなし</rt></ruby>したりして、たのしい<ruby>時間<rt>じかん</rt></ruby>をとどける！", effects: { expressive: 2, social: 1, imaginative: 1 } },
            { text: "その<ruby>人<rt>ひと</rt></ruby>にぴったりのものを、ていねいにつくってわたす！", effects: { handsOn: 2, caring: 1, observant: 1 } }
        ]
    },
    {
        question: "Q8. むずかしいことにちょうせんするとき、どっちがやりやすい？",
        choices: [
            { text: "まずやってみて、ためしながらどんどんよくしていく！", effects: { flexible: 2, leadership: 1 } },
            { text: "やりかたを<ruby>見<rt>み</rt></ruby>つけて、<ruby>順番<rt>じゅんばん</rt></ruby>にひとつずつすすめる！", effects: { organized: 2, logical: 1 } }
        ]
    }
];

const FOLLOWUP_SETS = {
    helper: {
        previewTitle: "やさしく みんなを<ruby>支<rt>ささ</rt></ruby>えるタイプかも！",
        previewDesc: "つぎは、きみがどんなふうに<ruby>人<rt>ひと</rt></ruby>を<ruby>元気<rt>げんき</rt></ruby>にするのが<ruby>得意<rt>とくい</rt></ruby>か、もうすこしくわしくみてみよう！",
        questions: [
            {
                question: "Q9. だれかをたすけるなら、どっちがうれしい？",
                choices: [
                    { text: "となりにいて、「だいじょうぶだよ」ってあんしんさせる！", effects: { caring: 2, social: 1 } },
                    { text: "どうしたらよくなるか、いいやりかたをみつける！", effects: { logical: 2, leadership: 1 } }
                ]
            },
            {
                question: "Q10. みんなでなにかするとき、どっちをやりたい？",
                choices: [
                    { text: "みんなの<ruby>様子<rt>ようす</rt></ruby>をみて、こまっている<ruby>子<rt>こ</rt></ruby>をさっとたすける！", effects: { caring: 2, observant: 1 } },
                    { text: "みんながわかるように、はっきり<ruby>声<rt>こえ</rt></ruby>をかける！", effects: { expressive: 2, leadership: 1 } }
                ]
            },
            {
                question: "Q11. ありがとうっていわれてうれしいのはどっち？",
                choices: [
                    { text: "「きみがいてくれてあんしんした！」", effects: { caring: 2, organized: 1 } },
                    { text: "「きみのおかげでうまくいった！」", effects: { leadership: 2, logical: 1 } }
                ]
            },
            {
                question: "Q12. もしお<ruby>店<rt>みせ</rt></ruby>をてつだうなら、どっちがたのしい？",
                choices: [
                    { text: "きた<ruby>人<rt>ひと</rt></ruby>ににこにこ<ruby>声<rt>こえ</rt></ruby>をかけて、うれしい<ruby>気<rt>き</rt></ruby>もちにする！", effects: { social: 2, expressive: 1 } },
                    { text: "その<ruby>人<rt>ひと</rt></ruby>がほんとうにほしいものを、ていねいにえらぶ！", effects: { caring: 2, observant: 1 } }
                ]
            }
        ]
    },
    leader: {
        previewTitle: "しっかり まえにすすむタイプかも！",
        previewDesc: "つぎは、きみがどんなふうにチームをうごかしたり、まもったりするのが<ruby>得意<rt>とくい</rt></ruby>かをみていくよ！",
        questions: [
            {
                question: "Q9. チームでなにかするとき、どっちをしたい？",
                choices: [
                    { text: "「こっちだよ！」ってみんなをひっぱる！", effects: { leadership: 2, social: 1 } },
                    { text: "うまくいくように、やることを<ruby>整理<rt>せいり</rt></ruby>する！", effects: { organized: 2, logical: 1 } }
                ]
            },
            {
                question: "Q10. ピンチのとき、どっちができそう？",
                choices: [
                    { text: "こわくても<ruby>前<rt>まえ</rt></ruby>にでて、みんなをまもる！", effects: { leadership: 2, caring: 1 } },
                    { text: "まちがえないように、いちばんいい<ruby>方法<rt>ほうほう</rt></ruby>をすぐ<ruby>考<rt>かんが</rt></ruby>える！", effects: { logical: 2, observant: 1 } }
                ]
            },
            {
                question: "Q11. ほめられるとうれしいのはどっち？",
                choices: [
                    { text: "「たよりになるね！」", effects: { leadership: 2, organized: 1 } },
                    { text: "「ちゃんと<ruby>見<rt>み</rt></ruby>ていて、すごいね！」", effects: { observant: 2, logical: 1 } }
                ]
            },
            {
                question: "Q12. まちのためにがんばるなら、どっちがたのしい？",
                choices: [
                    { text: "<ruby>人<rt>ひと</rt></ruby>をまもったり、あんぜんをつくる！", effects: { caring: 1, leadership: 2 } },
                    { text: "ルールやしくみをつくって、みんながうごきやすくする！", effects: { organized: 2, logical: 2 } }
                ]
            }
        ]
    },
    creator: {
        previewTitle: "ひらめきで つくるタイプかも！",
        previewDesc: "つぎは、きみがどんなものを<ruby>生<rt>う</rt></ruby>み<ruby>出<rt>だ</rt></ruby>したいか、どんな<ruby>表現<rt>ひょうげん</rt></ruby>が<ruby>好<rt>す</rt></ruby>きかをみてみよう！",
        questions: [
            {
                question: "Q9. アイデアをかたちにするなら、どっちがたのしい？",
                choices: [
                    { text: "<ruby>絵<rt>え</rt></ruby>やデザインで、<ruby>見<rt>み</rt></ruby>た<ruby>人<rt>ひと</rt></ruby>をワクワクさせる！", effects: { imaginative: 2, expressive: 1 } },
                    { text: "どうぐやしかけをつくって、「すごい！」っていわせる！", effects: { handsOn: 2, imaginative: 1 } }
                ]
            },
            {
                question: "Q10. みんなにとどけたいのはどっち？",
                choices: [
                    { text: "<ruby>気<rt>き</rt></ruby>もちがパッとあかるくなる、たのしい<ruby>表現<rt>ひょうげん</rt></ruby>！", effects: { expressive: 2, social: 1 } },
                    { text: "「べんり！」「やってみたい！」とおもう、あたらしいしくみ！", effects: { imaginative: 2, logical: 1 } }
                ]
            },
            {
                question: "Q11. つくっているときにうれしいのはどっち？",
                choices: [
                    { text: "その<ruby>場<rt>ば</rt></ruby>でひらめいて、どんどんかわっていくこと！", effects: { flexible: 2, imaginative: 1 } },
                    { text: "<ruby>少<rt>すこ</rt></ruby>しずつ<ruby>手<rt>て</rt></ruby>をくわえて、きれいにできあがること！", effects: { handsOn: 2, organized: 1 } }
                ]
            },
            {
                question: "Q12. もしおしごとにするなら、どっちにひかれる？",
                choices: [
                    { text: "<ruby>人<rt>ひと</rt></ruby>のこころをうごかす<ruby>作品<rt>さくひん</rt></ruby>をつくる！", effects: { expressive: 2, caring: 1 } },
                    { text: "<ruby>新<rt>あたら</rt></ruby>しいあそびやべんりなものをつくる！", effects: { handsOn: 2, logical: 1 } }
                ]
            }
        ]
    },
    explorer: {
        previewTitle: "じっくり しらべるタイプかも！",
        previewDesc: "つぎは、きみがどんなふしぎをしらべたいか、どんなふうに<ruby>見<rt>み</rt></ruby>つけるのが<ruby>得意<rt>とくい</rt></ruby>かをみていくよ！",
        questions: [
            {
                question: "Q9. いちばんワクワクする「はっけん」はどっち？",
                choices: [
                    { text: "まだしらないことの<ruby>理由<rt>りゆう</rt></ruby>がわかること！", effects: { investigative: 2, logical: 1 } },
                    { text: "ほんものをじっくり<ruby>見<rt>み</rt></ruby>て、ちがいに<ruby>気<rt>き</rt></ruby>づくこと！", effects: { observant: 2, independent: 1 } }
                ]
            },
            {
                question: "Q10. むずかしいことにであったら、どっちをしそう？",
                choices: [
                    { text: "<ruby>本<rt>ほん</rt></ruby>や<ruby>図鑑<rt>ずかん</rt></ruby>、データをしらべてつなげる！", effects: { investigative: 2, organized: 1 } },
                    { text: "じぶんでためしたり、よく<ruby>見<rt>み</rt></ruby>てたしかめる！", effects: { observant: 2, handsOn: 1 } }
                ]
            },
            {
                question: "Q11. ほめられてうれしいのはどっち？",
                choices: [
                    { text: "「よくしらべたね！」", effects: { investigative: 2, logical: 1 } },
                    { text: "「よく<ruby>見<rt>み</rt></ruby>つけたね！」", effects: { observant: 2, imaginative: 1 } }
                ]
            },
            {
                question: "Q12. もしひとつ<ruby>学<rt>まな</rt></ruby>べるなら、どっちにひかれる？",
                choices: [
                    { text: "<ruby>宇宙<rt>うちゅう</rt></ruby>や<ruby>自然<rt>しぜん</rt></ruby>のひみつをしらべる！", effects: { investigative: 2, imaginative: 1 } },
                    { text: "どうすればうまくうごくか、しくみをととのえる！", effects: { logical: 2, organized: 1 } }
                ]
            }
        ]
    }
};

const RESULT_TYPE_INFO = {
    supporter: {
        icon: "🤝",
        name: "やさしいサポータータイプ",
        desc: "きみは、まわりの<ruby>人<rt>ひと</rt></ruby>の<ruby>気<rt>き</rt></ruby>もちに<ruby>気<rt>き</rt></ruby>づいて、あんしんできる<ruby>空気<rt>くうき</rt></ruby>をつくるのが<ruby>得意<rt>とくい</rt></ruby>だよ。だれかをたすけたり、そっとささえたりする<ruby>力<rt>ちから</rt></ruby>があるね。"
    },
    leader: {
        icon: "🛡️",
        name: "しっかりリーダータイプ",
        desc: "きみは、どうすればうまくいくかを<ruby>考<rt>かんが</rt></ruby>えて、みんなを<ruby>前<rt>まえ</rt></ruby>にすすめるのが<ruby>得意<rt>とくい</rt></ruby>だよ。まもる<ruby>力<rt>ちから</rt></ruby>と、まとめる<ruby>力<rt>ちから</rt></ruby>のりょうほうをもっているね。"
    },
    performer: {
        icon: "🎤",
        name: "わくわくパフォーマータイプ",
        desc: "きみは、ことばや<ruby>表現<rt>ひょうげん</rt></ruby>で、みんなをパッとあかるくできるタイプだよ。たのしいアイデアを<ruby>人<rt>ひと</rt></ruby>にとどけるのがとてもじょうず。"
    },
    creator: {
        icon: "🎨",
        name: "ひらめきクリエイタータイプ",
        desc: "きみは、あたらしいアイデアをおもいついて、それをじぶんの<ruby>手<rt>て</rt></ruby>でかたちにするのが<ruby>得意<rt>とくい</rt></ruby>だよ。つくることで<ruby>世界<rt>せかい</rt></ruby>をおもしろくできるね。"
    },
    builder: {
        icon: "🧰",
        name: "ていねいビルダータイプ",
        desc: "きみは、しくみや<ruby>順番<rt>じゅんばん</rt></ruby>をだいじにしながら、しっかりつくりあげるのが<ruby>得意<rt>とくい</rt></ruby>だよ。こまかいところまで<ruby>気<rt>き</rt></ruby>づけるのがすごいところ。"
    },
    researcher: {
        icon: "🔍",
        name: "じっくりはっけんタイプ",
        desc: "きみは、ふしぎなことをしらべたり、ほんとうの<ruby>答<rt>こた</rt></ruby>えを<ruby>見<rt>み</rt></ruby>つけたりするのが<ruby>得意<rt>とくい</rt></ruby>だよ。じっくり<ruby>考<rt>かんが</rt></ruby>える<ruby>力<rt>ちから</rt></ruby>がとてもつよいね。"
    }
};

const CATEGORY_TRAITS = {
    c1: { leadership: 2, caring: 2, organized: 2, social: 1 },
    c2: { caring: 3, observant: 2, organized: 1, handsOn: 1 },
    c3: { handsOn: 2, imaginative: 2, organized: 1, caring: 1 },
    c4: { social: 2, expressive: 3, leadership: 1, flexible: 1 },
    c5: { imaginative: 2, expressive: 1, handsOn: 1, independent: 1, logical: 1 },
    c6: { social: 2, caring: 2, expressive: 1, organized: 1 },
    c7: { organized: 2, logical: 2, observant: 1, leadership: 1 },
    c8: { logical: 2, imaginative: 1, handsOn: 2, investigative: 1 },
    c9: { observant: 2, logical: 2, independent: 1, caring: 1 }
};

const WORLD_TRAITS = {
    hero: { leadership: 1, caring: 1 },
    creator: { imaginative: 1, handsOn: 1 },
    communicator: { social: 1, expressive: 1 },
    researcher: { investigative: 1, observant: 1 }
};

const JOB_TRAIT_OVERRIDES = {
    police: { leadership: 2, caring: 1, organized: 1 },
    firefighter: { leadership: 2, caring: 2, handsOn: 1 },
    sdf: { leadership: 2, organized: 2, caring: 1 },
    doctor: { caring: 2, logical: 2, observant: 1 },
    nurse: { caring: 3, social: 1 },
    therapist: { caring: 2, handsOn: 1, observant: 1 },
    vet: { caring: 3, observant: 1 },
    zookeeper: { caring: 2, observant: 2, handsOn: 1 },
    patissier: { imaginative: 2, handsOn: 2, organized: 1 },
    chef: { handsOn: 2, imaginative: 1, leadership: 1 },
    baker: { handsOn: 2, organized: 2 },
    athlete: { leadership: 2, social: 1, handsOn: 2 },
    idol: { expressive: 3, social: 2, imaginative: 1 },
    voiceactor: { expressive: 3, imaginative: 1, social: 1 },
    youtuber: { expressive: 3, social: 2, flexible: 1 },
    influencer: { expressive: 2, social: 2, imaginative: 1 },
    gamecreator: { imaginative: 3, logical: 1, handsOn: 1 },
    programmer: { logical: 3, independent: 2, organized: 1 },
    illustrator: { imaginative: 3, expressive: 1, independent: 1 },
    teacher: { social: 2, caring: 2, expressive: 1, leadership: 1 },
    nursery: { caring: 3, social: 1, handsOn: 1 },
    librarian: { observant: 2, organized: 2, independent: 2 },
    sales: { social: 3, expressive: 2, leadership: 1 },
    pilot: { organized: 3, logical: 2, leadership: 1 },
    train_driver: { organized: 3, observant: 2, logical: 1 },
    astronaut: { investigative: 3, logical: 2, organized: 1 },
    real_estate: { social: 2, expressive: 1, logical: 1 },
    scientist: { investigative: 3, logical: 2, independent: 1 },
    architect: { imaginative: 2, logical: 2, organized: 1 },
    carpenter: { handsOn: 3, organized: 1, observant: 1 },
    robotics: { logical: 2, investigative: 2, handsOn: 2 },
    beautician: { handsOn: 2, expressive: 1, caring: 1, social: 1 },
    farmer: { observant: 2, independent: 1, handsOn: 2, caring: 1 },
    lawyer: { logical: 3, leadership: 1, social: 1, caring: 1 }
};

const TRAIT_STRENGTHS = [
    { key: "social", label: "<ruby>人<rt>ひと</rt></ruby>とつながるのが<ruby>得意<rt>とくい</rt></ruby>" },
    { key: "caring", label: "やさしく<ruby>気<rt>き</rt></ruby>づかえる" },
    { key: "leadership", label: "みんなをひっぱる<ruby>力<rt>ちから</rt></ruby>がある" },
    { key: "expressive", label: "<ruby>思<rt>おも</rt></ruby>いをつたえるのがじょうず" },
    { key: "imaginative", label: "ひらめきがいっぱい" },
    { key: "handsOn", label: "じぶんの<ruby>手<rt>て</rt></ruby>でつくるのがすき" },
    { key: "investigative", label: "ふしぎをしらべるのがすき" },
    { key: "organized", label: "しっかり<ruby>順番<rt>じゅんばん</rt></ruby>だてられる" },
    { key: "logical", label: "しくみで<ruby>考<rt>かんが</rt></ruby>えるのがとくい" },
    { key: "observant", label: "よく<ruby>見<rt>み</rt></ruby>て<ruby>気<rt>き</rt></ruby>づける" }
];

const TRAIT_KEYS = [
    "social",
    "independent",
    "imaginative",
    "observant",
    "caring",
    "logical",
    "organized",
    "flexible",
    "expressive",
    "handsOn",
    "leadership",
    "investigative"
];

let phase = "core";
let coreIndex = 0;
let followupIndex = 0;
let followupKey = null;
let traitScores = createEmptyScores();

window.onload = function () {
    renderCurrentStep();
};

function createEmptyScores() {
    const scores = {};
    TRAIT_KEYS.forEach(key => {
        scores[key] = 0;
    });
    return scores;
}

function restartDiagnosis() {
    phase = "core";
    coreIndex = 0;
    followupIndex = 0;
    followupKey = null;
    traitScores = createEmptyScores();
    document.getElementById("subtitle").innerHTML = "きみの「らしさ」をみつけよう！";
    fadeAndRender();
}

function renderCurrentStep() {
    const container = document.getElementById("diagnosis-content");
    container.innerHTML = "";

    if (phase === "core") {
        document.getElementById("subtitle").innerHTML = "きみの「らしさ」をみつけよう！";
        renderQuestion(container, CORE_QUESTIONS[coreIndex], coreIndex + 1, CORE_QUESTIONS.length, "パート1");
        return;
    }

    if (phase === "transition") {
        renderTransition(container);
        return;
    }

    if (phase === "followup") {
        const set = FOLLOWUP_SETS[followupKey];
        document.getElementById("subtitle").innerHTML = "きみにあいそうなお<ruby>仕事<rt>しごと</rt></ruby>を、もっとくわしくみてみよう！";
        renderQuestion(container, set.questions[followupIndex], followupIndex + 1, set.questions.length, "パート2");
        return;
    }

    showResult();
}

function renderQuestion(container, questionData, questionNumber, totalQuestions, partLabel) {
    const progress = document.createElement("div");
    progress.style.textAlign = "center";
    progress.style.color = "#ff9800";
    progress.style.fontWeight = "bold";
    progress.style.marginBottom = "15px";
    progress.innerHTML = `🌟 ${partLabel} ${questionNumber} / ${totalQuestions} 🌟`;
    container.appendChild(progress);

    const isAn = questionNumber % 2 === 1;
    const charaImg = isAn ? "../an192.webp" : "../hi-192.webp";

    const questionArea = document.createElement("div");
    questionArea.className = "question-area " + (isAn ? "chara-left" : "chara-right");

    const imgEl = document.createElement("img");
    imgEl.src = charaImg;
    imgEl.className = "chara-img";
    imgEl.alt = "";

    const bubble = document.createElement("div");
    bubble.className = "speech-bubble";
    bubble.innerHTML = questionData.question;

    questionArea.appendChild(imgEl);
    questionArea.appendChild(bubble);
    container.appendChild(questionArea);

    const shuffledChoices = [...questionData.choices].sort(() => Math.random() - 0.5);
    shuffledChoices.forEach(choice => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.innerHTML = choice.text;
        btn.onclick = () => answerQuestion(choice.effects);
        container.appendChild(btn);
    });
}

function answerQuestion(effects) {
    applyEffects(effects);

    if (phase === "core") {
        coreIndex += 1;
        if (coreIndex >= CORE_QUESTIONS.length) {
            followupKey = determineFollowupKey();
            phase = "transition";
        }
    } else if (phase === "followup") {
        followupIndex += 1;
        if (followupIndex >= FOLLOWUP_SETS[followupKey].questions.length) {
            phase = "result";
        }
    }

    fadeAndRender();
}

function applyEffects(effects) {
    Object.entries(effects).forEach(([key, value]) => {
        traitScores[key] += value;
    });
}

function determineFollowupKey() {
    const helperScore = traitScores.caring * 2 + traitScores.social + traitScores.observant;
    const leaderScore = traitScores.leadership * 2 + traitScores.organized + traitScores.logical + traitScores.social;
    const creatorScore = traitScores.imaginative * 2 + traitScores.expressive + traitScores.handsOn + traitScores.flexible;
    const explorerScore = traitScores.investigative * 2 + traitScores.observant + traitScores.logical + traitScores.independent;

    const candidates = [
        { key: "helper", score: helperScore },
        { key: "leader", score: leaderScore },
        { key: "creator", score: creatorScore },
        { key: "explorer", score: explorerScore }
    ];

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].key;
}

function renderTransition(container) {
    const preview = FOLLOWUP_SETS[followupKey];
    document.getElementById("subtitle").innerHTML = "<ruby>前半<rt>ぜんはん</rt></ruby>しゅうりょう！つぎはお<ruby>仕事<rt>しごと</rt></ruby>とのあいしょうをみるよ！";

    container.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 72px; margin-bottom: 10px;">✨</div>
            <h2 style="color: #ef6c00; margin: 10px 0 12px; font-size: 25px;">${preview.previewTitle}</h2>
            <p style="font-size: 15px; line-height: 1.7; color: #444; margin-bottom: 18px; background: #fff8e1; padding: 16px; border-radius: 14px;">
                ${preview.previewDesc}
            </p>
            <button class="get-points-btn" onclick="startFollowup()">パート2へすすむ！</button>
        </div>
    `;
}

function startFollowup() {
    phase = "followup";
    followupIndex = 0;
    fadeAndRender();
}

function fadeAndRender() {
    const container = document.getElementById("diagnosis-content");
    container.style.opacity = "0";
    setTimeout(() => {
        renderCurrentStep();
        container.style.opacity = "1";
    }, 200);
}

function getResultRanking() {
    const rankings = [
        {
            key: "supporter",
            score: traitScores.caring * 2 + traitScores.social + traitScores.observant + traitScores.organized
        },
        {
            key: "leader",
            score: traitScores.leadership * 2 + traitScores.organized + traitScores.logical + traitScores.social
        },
        {
            key: "performer",
            score: traitScores.expressive * 2 + traitScores.social + traitScores.imaginative + traitScores.flexible
        },
        {
            key: "creator",
            score: traitScores.imaginative * 2 + traitScores.handsOn + traitScores.flexible + traitScores.independent
        },
        {
            key: "builder",
            score: traitScores.handsOn * 2 + traitScores.organized + traitScores.logical + traitScores.observant
        },
        {
            key: "researcher",
            score: traitScores.investigative * 2 + traitScores.observant + traitScores.logical + traitScores.independent
        }
    ];

    rankings.sort((a, b) => b.score - a.score);
    return rankings;
}

function getTopStrengths() {
    return TRAIT_STRENGTHS
        .map(item => ({ label: item.label, score: traitScores[item.key] || 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .filter(item => item.score > 0);
}

function getRecommendedJobs() {
    const jobs = [];

    if (typeof CATEGORIES === "undefined") {
        return jobs;
    }

    CATEGORIES.forEach(category => {
        category.jobs.forEach(job => {
            jobs.push({
                job: job,
                score: scoreJob(job, category)
            });
        });
    });

    jobs.sort((a, b) => b.score - a.score);
    return jobs.slice(0, 6);
}

function scoreJob(job, category) {
    const traits = getJobTraits(job, category);
    let total = 0;

    Object.entries(traits).forEach(([key, weight]) => {
        total += (traitScores[key] || 0) * weight;
    });

    return total;
}

function getJobTraits(job, category) {
    const merged = {};
    mergeTraitObject(merged, CATEGORY_TRAITS[category.id]);
    mergeTraitObject(merged, WORLD_TRAITS[job.world]);
    mergeTraitObject(merged, JOB_TRAIT_OVERRIDES[job.id]);
    return merged;
}

function mergeTraitObject(target, source) {
    if (!source) return;

    Object.entries(source).forEach(([key, value]) => {
        target[key] = (target[key] || 0) + value;
    });
}

function showResult() {
    const container = document.getElementById("diagnosis-content");
    const ranking = getResultRanking();
    const primary = RESULT_TYPE_INFO[ranking[0].key];
    const secondary = RESULT_TYPE_INFO[ranking[1].key];
    const strengths = getTopStrengths();
    const recommendedJobs = getRecommendedJobs();

    document.getElementById("subtitle").innerHTML = "<ruby>診断<rt>しんだん</rt></ruby>おわり！きみのタイプがわかったよ！";

    let strengthsHtml = "";
    if (strengths.length > 0) {
        strengthsHtml = `
            <div style="margin-top: 18px; margin-bottom: 22px; text-align: left; background: #fff8e1; padding: 15px; border-radius: 14px;">
                <div style="color: #ef6c00; font-weight: bold; margin-bottom: 10px; text-align: center;">🌱 きみのいいところ</div>
                ${strengths.map(item => `
                    <div style="margin: 8px 0; color: #555; font-size: 15px;">• ${item.label}</div>
                `).join("")}
            </div>
        `;
    }

    let jobsHtml = "";
    if (recommendedJobs.length > 0) {
        jobsHtml = `
            <div style="margin-top: 20px; margin-bottom: 25px; padding: 15px; background: #fff; border: 3px dashed #ffcc80; border-radius: 15px;">
                <p style="color: #ef6c00; font-weight: bold; font-size: 16px; margin-bottom: 12px; text-align: center;">💡 こんなお<ruby>仕事<rt>しごと</rt></ruby>がおすすめ！</p>
                <div style="display: grid; gap: 10px;">
                    ${recommendedJobs.map((item, index) => `
                        <div style="background: ${index === 0 ? "#fff3e0" : "#fff8e1"}; padding: 10px 12px; border-radius: 14px; font-size: 15px; font-weight: bold; color: #555; border: 1px solid #ffe0b2; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            ${index + 1}. ${item.job.icon} ${item.job.name}
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 80px; margin-bottom: 10px;">${primary.icon}</div>
            <h2 style="color: #ef6c00; margin: 15px 0 10px; font-size: 24px;">${primary.name}</h2>
            <p style="font-size: 15px; line-height: 1.7; color: #444; margin-bottom: 10px; background: #fff8e1; padding: 15px; border-radius: 12px;">${primary.desc}</p>

            <div style="display: inline-block; margin-top: 10px; padding: 8px 14px; background: #fff3e0; color: #e65100; border-radius: 999px; font-weight: bold; font-size: 14px;">
                ちょっと<ruby>近<rt>ちか</rt></ruby>いタイプ: ${secondary.name}
            </div>

            ${strengthsHtml}
            ${jobsHtml}

            <div style="display: grid; gap: 12px; justify-items: center;">
                <button class="get-points-btn" onclick="restartDiagnosis()" style="background: #4fc3f7; box-shadow: 0 4px 0 #0288d1;">
                    もう<ruby>一度<rt>いちど</rt></ruby>やってみる！
                </button>
                <a href="job_learn.html" class="get-points-btn"><ruby>図鑑<rt>ずかん</rt></ruby>でお<ruby>仕事<rt>しごと</rt></ruby>を<ruby>探<rt>さが</rt></ruby>す！</a>
            </div>
        </div>
    `;
}
