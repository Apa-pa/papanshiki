// ===================================================
//  おしごと診断ロジック (diagnosis.js)
// ===================================================

const DIAGNOSIS_DATA = [
    {
        question: "Q1. <ruby>休<rt>やす</rt></ruby>みの<ruby>日<rt>ひ</rt></ruby>は、<ruby>何<rt>なに</rt></ruby>をしてあそびたい？",
        choices: [
            { text: "<ruby>外<rt>そと</rt></ruby>で<ruby>思<rt>おも</rt></ruby>いっきり<ruby>走<rt>はし</rt></ruby>ったり、<ruby>体<rt>からだ</rt></ruby>を<ruby>動<rt>うご</rt></ruby>かす！", tag: "hero" },
            { text: "<ruby>絵<rt>え</rt></ruby>を<ruby>描<rt>か</rt></ruby>いたり、ブロックで<ruby>何<rt>なに</rt></ruby>かを<ruby>作<rt>つく</rt></ruby>る！", tag: "creator" },
            { text: "お<ruby>友<rt>とも</rt></ruby>だちや<ruby>家族<rt>かぞく</rt></ruby>といっぱいおしゃべりする！", tag: "communicator" },
            { text: "<ruby>本<rt>ほん</rt></ruby>や<ruby>図鑑<rt>ずかん</rt></ruby>を<ruby>読<rt>よ</rt></ruby>んだり、<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>を<ruby>観察<rt>かんさつ</rt></ruby>する！", tag: "researcher" }
        ]
    },
    {
        question: "Q2. もし、<ruby>困<rt>こま</rt></ruby>っている<ruby>人<rt>ひと</rt></ruby>が<ruby>近<rt>ちか</rt></ruby>くにいたらどう<ruby>思<rt>おも</rt></ruby>う？",
        choices: [
            { text: "すぐに<ruby>走<rt>はし</rt></ruby>っていって「<ruby>大丈夫<rt>だいじょうぶ</rt></ruby>？」と<ruby>助<rt>たす</rt></ruby>けたい！", tag: "hero" },
            { text: "<ruby>問題<rt>もんだい</rt></ruby>が<ruby>解決<rt>かいけつ</rt></ruby>する<ruby>方法<rt>ほうほう</rt></ruby>をみつけておしえてあげたい！", tag: "creator" },
            { text: "はげまして<ruby>元気<rt>げんき</rt></ruby>にしてあげたい！", tag: "communicator" },
            { text: "どうして<ruby>困<rt>こま</rt></ruby>っているのか、<ruby>理由<rt>りゆう</rt></ruby>をじっくり<ruby>考<rt>かんが</rt></ruby>える！", tag: "researcher" }
        ]
    },
    {
        question: "Q3. <ruby>仲間<rt>なかま</rt></ruby>と<ruby>一緒<rt>いっしょ</rt></ruby>に<ruby>大<rt>おお</rt></ruby>きな<ruby>冒険<rt>ぼうけん</rt></ruby>に<ruby>出発<rt>しゅっぱつ</rt></ruby>！どんな<ruby>役割<rt>やくわり</rt></ruby>をやってみたい？",
        choices: [
            { text: "<ruby>一番<rt>いちばん</rt></ruby><ruby>前<rt>まえ</rt></ruby>を<ruby>歩<rt>ある</rt></ruby>いて、みんなをピンチから<ruby>守<rt>まも</rt></ruby>る「<ruby>勇者<rt>ゆうしゃ</rt></ruby>」！", tag: "hero" },
            { text: "みんなが<ruby>使<rt>つか</rt></ruby>うスゴイ<ruby>武器<rt>ぶき</rt></ruby>や<ruby>乗<rt>の</rt></ruby>り<ruby>物<rt>もの</rt></ruby>を<ruby>作<rt>つく</rt></ruby>る「<ruby>発明家<rt>はつめいか</rt></ruby>」！", tag: "creator" },
            { text: "<ruby>楽<rt>たの</rt></ruby>しいお<ruby>話<rt>はなし</rt></ruby>でみんなを<ruby>笑<rt>わら</rt></ruby>わせて<ruby>元気<rt>げんき</rt></ruby>を<ruby>出<rt>だ</rt></ruby>す「ムードメーカー」！", tag: "communicator" },
            { text: "<ruby>地図<rt>ちず</rt></ruby>を<ruby>読<rt>よ</rt></ruby>んだり、<ruby>敵<rt>てき</rt></ruby>の<ruby>弱点<rt>じゃくてん</rt></ruby>を<ruby>見<rt>み</rt></ruby>つけたりする「<ruby>作戦<rt>さくせん</rt></ruby>はかせ」！", tag: "researcher" }
        ]
    },
    {
        question: "Q4. どんなことでもできる「<ruby>魔法<rt>まほう</rt></ruby>」をひとつだけもらえるなら？",
        choices: [
            { text: "<ruby>世界中<rt>せかいじゅう</rt></ruby>の<ruby>人<rt>ひと</rt></ruby>のケガや<ruby>病気<rt>びょうき</rt></ruby>を、パッと<ruby>治<rt>なお</rt></ruby>してあげたい！", tag: "hero" },
            { text: "<ruby>誰<rt>だれ</rt></ruby>も<ruby>見<rt>み</rt></ruby>たことがない<ruby>新<rt>あたら</rt></ruby>しい<ruby>世界<rt>せかい</rt></ruby>を、ポンッと<ruby>作<rt>つく</rt></ruby>ってみたい！", tag: "creator" },
            { text: "<ruby>世界中<rt>せかいじゅう</rt></ruby>の<ruby>人<rt>ひと</rt></ruby>や<ruby>動物<rt>どうぶつ</rt></ruby>と、どんな<ruby>言葉<rt>ことば</rt></ruby>でも<ruby>楽<rt>たの</rt></ruby>しくおしゃべりしたい！", tag: "communicator" },
            { text: "<ruby>宇宙<rt>うちゅう</rt></ruby>の<ruby>果<rt>は</rt></ruby>てや<ruby>海<rt>うみ</rt></ruby>の<ruby>底<rt>そこ</rt></ruby>にあるヒミツを、<ruby>全部<rt>ぜんぶ</rt></ruby><ruby>知<rt>し</rt></ruby>りたい！", tag: "researcher" }
        ]
    },
    {
        question: "Q5. <ruby>大人<rt>おとな</rt></ruby>になってお<ruby>仕事<rt>しごと</rt></ruby>をするとき、どんなふうに<ruby>過<rt>す</rt></ruby>ごすのが<ruby>楽<rt>たの</rt></ruby>しそう？",
        choices: [
            { text: "<ruby>仲間<rt>なかま</rt></ruby>とチームを<ruby>組<rt>く</rt></ruby>んで、お<ruby>互<rt>たが</rt></ruby>いに<ruby>助<rt>たす</rt></ruby>け<ruby>合<rt>あ</rt></ruby>いながら<ruby>元気<rt>げんき</rt></ruby>に<ruby>動<rt>うご</rt></ruby>き<ruby>回<rt>まわ</rt></ruby>りたい！", tag: "hero" },
            { text: "<ruby>自分<rt>じぶん</rt></ruby>のお<ruby>気<rt>き</rt></ruby>に<ruby>入<rt>い</rt></ruby>りのお<ruby>店<rt>みせ</rt></ruby>や<ruby>部屋<rt>へや</rt></ruby>で、<ruby>時間<rt>じかん</rt></ruby>を<ruby>忘<rt>わす</rt></ruby>れて「ものづくり」に<ruby>集中<rt>しゅうちゅう</rt></ruby>したい！", tag: "creator" },
            { text: "たくさんの<ruby>人<rt>ひと</rt></ruby>に<ruby>囲<rt>かこ</rt></ruby>まれて、<ruby>毎日<rt>まいにち</rt></ruby>みんなでワイワイにぎやかに<ruby>過<rt>す</rt></ruby>ごしたい！", tag: "communicator" },
            { text: "<ruby>静<rt>しず</rt></ruby>かな<ruby>場所<rt>ばしょ</rt></ruby>や<ruby>自然<rt>しぜん</rt></ruby>の<ruby>中<rt>なか</rt></ruby>で、ひとりでじっくり<ruby>自分<rt>じぶん</rt></ruby>のペースで<ruby>考<rt>かんが</rt></ruby>えたい！", tag: "researcher" }
        ]
    }
];

const WORLD_INFO = {
    hero: { name: "おうえん・ヒーローの<ruby>世界<rt>せかい</rt></ruby>", icon: "🦸‍♂️", desc: "きみは<ruby>人<rt>ひと</rt></ruby>を<ruby>助<rt>たす</rt></ruby>けたり、<ruby>守<rt>まも</rt></ruby>ったりする<ruby>才能<rt>さいのう</rt></ruby>があるよ！<ruby>体<rt>からだ</rt></ruby>を<ruby>動<rt>うご</rt></ruby>かすお<ruby>仕事<rt>しごと</rt></ruby>や、<ruby>誰<rt>だれ</rt></ruby>かのために<ruby>頑張<rt>がんば</rt></ruby>るお<ruby>仕事<rt>しごと</rt></ruby>がピッタリかも。" },
    creator: { name: "ひらめき・つくるの<ruby>世界<rt>せかい</rt></ruby>", icon: "🎨", desc: "きみはアイデアを<ruby>形<rt>かたち</rt></ruby>にして、<ruby>新<rt>あたら</rt></ruby>しいモノを<ruby>生<rt>う</rt></ruby>み<ruby>出<rt>だ</rt></ruby>す<ruby>才能<rt>さいのう</rt></ruby>があるよ！<ruby>絵<rt>え</rt></ruby>を<ruby>描<rt>か</rt></ruby>いたり、おいしいものを<ruby>作<rt>つく</rt></ruby>るお<ruby>仕事<rt>しごと</rt></ruby>がピッタリかも。" },
    communicator: { name: "わくわく・つたえるの<ruby>世界<rt>せかい</rt></ruby>", icon: "🎤", desc: "きみは<ruby>周<rt>まわ</rt></ruby>りの<ruby>人<rt>ひと</rt></ruby>を<ruby>笑顔<rt>えがお</rt></ruby>にしたり、<ruby>元気<rt>げんき</rt></ruby>にする<ruby>才能<rt>さいのう</rt></ruby>があるよ！お<ruby>話<rt>はなし</rt></ruby>をするお<ruby>仕事<rt>しごと</rt></ruby>や、みんなを<ruby>楽<rt>たの</rt></ruby>しませるお<ruby>仕事<rt>しごと</rt></ruby>がピッタリかも。" },
    researcher: { name: "じっくり・しらべるの<ruby>世界<rt>せかい</rt></ruby>", icon: "🔍", desc: "きみは<ruby>不思議<rt>ふしぎ</rt></ruby>を<ruby>見<rt>み</rt></ruby>つけて、<ruby>深<rt>ふか</rt></ruby>く<ruby>探求<rt>たんきゅう</rt></ruby>する<ruby>才能<rt>さいのう</rt></ruby>があるよ！<ruby>自然<rt>しぜん</rt></ruby>を<ruby>相手<rt>あいて</rt></ruby>にするお<ruby>仕事<rt>しごと</rt></ruby>や、<ruby>新<rt>あたら</rt></ruby>しい<ruby>発見<rt>はっけん</rt></ruby>をするお<ruby>仕事<rt>しごと</rt></ruby>がピッタリかも。" }
};

let currentQuestionIndex = 0;
let scores = { hero: 0, creator: 0, communicator: 0, researcher: 0 };

// ページが読み込まれたら最初の質問を表示
window.onload = function () {
    renderQuestion();
};

function renderQuestion() {
    const container = document.getElementById('diagnosis-content');
    container.innerHTML = '';

    // 質問がすべて終わった場合
    if (currentQuestionIndex >= DIAGNOSIS_DATA.length) {
        showResult();
        return;
    }

    const qData = DIAGNOSIS_DATA[currentQuestionIndex];

    // プログレスバー（何問目か）の表示
    const progress = document.createElement('div');
    progress.style.textAlign = 'center';
    progress.style.color = '#ff9800';
    progress.style.fontWeight = 'bold';
    progress.style.marginBottom = '15px';
    progress.innerHTML = `🌟 ${currentQuestionIndex + 1} / ${DIAGNOSIS_DATA.length} 🌟`;
    container.appendChild(progress);

    // キャラクター画像の表示（アン・ヒーを交互に）
    const isAn = currentQuestionIndex % 2 === 0;
    const charaImg = isAn ? '../an192.webp' : '../hi-192.webp';
    
    const questionArea = document.createElement('div');
    questionArea.className = 'question-area ' + (isAn ? 'chara-left' : 'chara-right');

    const imgEl = document.createElement('img');
    imgEl.src = charaImg;
    imgEl.className = 'chara-img';
    
    // 質問の吹き出し
    const bubble = document.createElement('div');
    bubble.className = 'speech-bubble';
    bubble.innerHTML = qData.question;

    questionArea.appendChild(imgEl);
    questionArea.appendChild(bubble);

    container.appendChild(questionArea);

    // 選択肢をシャッフルして表示
    const shuffledChoices = [...qData.choices].sort(() => Math.random() - 0.5);

    shuffledChoices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = choice.text;
        btn.onclick = () => answerQuestion(choice.tag);
        container.appendChild(btn);
    });
}

function answerQuestion(tag) {
    scores[tag] += 1;
    currentQuestionIndex++;

    // フワッと切り替わるアニメーション
    const container = document.getElementById('diagnosis-content');
    container.style.opacity = '0';
    setTimeout(() => {
        renderQuestion();
        container.style.opacity = '1';
    }, 200);
}

function showResult() {
    const container = document.getElementById('diagnosis-content');

    // 一番点数の高いタグを見つける
    let maxTag = 'hero';
    let maxScore = -1;
    for (const [tag, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            maxTag = tag;
        }
    }

    const result = WORLD_INFO[maxTag];
    document.getElementById('subtitle').innerHTML = '<ruby>診断<rt>しんだん</rt></ruby>おわり！おめでとう！';

    // 結果の表示と、図鑑へのリンクボタン
    container.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 80px; margin-bottom: 10px;">${result.icon}</div>
            <h2 style="color: #ef6c00; margin: 15px 0; font-size: 24px;">${result.name}</h2>
            <p style="font-size: 15px; line-height: 1.6; color: #444; margin-bottom: 30px; background: #fff8e1; padding: 15px; border-radius: 12px;">${result.desc}</p>
            
            <a href="job_learn.html" class="get-points-btn"><ruby>図鑑<rt>ずかん</rt></ruby>でお<ruby>仕事<rt>しごと</rt></ruby>を<ruby>探<rt>さが</rt></ruby>す！</a>
        </div>
    `;
}