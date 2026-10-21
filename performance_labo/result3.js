/* ============================================
   result3.js — きおく力測定ラボ（Labo 3）のリザルト集計と描画
   体力測定型換算テーブルとアドバイス生成
   ============================================ */

'use strict';

window.ResultModule3 = (function () {

    /* ---------- 換算用テーブル（体力測定方式：記録 → 0〜100） ---------- */
    // 線形補間関数
    function interpolate(val, table) {
        if (val <= table[0].val) return table[0].score;
        if (val >= table[table.length - 1].val) return table[table.length - 1].score;
        for (let i = 0; i < table.length - 1; i++) {
            const p1 = table[i];
            const p2 = table[i + 1];
            if (val >= p1.val && val <= p2.val) {
                const ratio = (val - p1.val) / (p2.val - p1.val);
                return Math.round(p1.score + ratio * (p2.score - p1.score));
            }
        }
        return 50;
    }

    // G1 フラッシュ（個数：2〜10個）
    const TBL_FLASH = [
        { val: 0, score: 0 },
        { val: 1, score: 8 },
        { val: 2, score: 16 },
        { val: 3, score: 28 },
        { val: 4, score: 42 },
        { val: 5, score: 56 },
        { val: 6, score: 70 },
        { val: 7, score: 82 },
        { val: 8, score: 90 },
        { val: 10, score: 100 }
    ];

    // G2 ルート（マス数：3〜10マス）
    const TBL_ROUTE_SPACE = [
        { val: 0, score: 0 },
        { val: 1, score: 5 },
        { val: 2, score: 12 },
        { val: 3, score: 20 },
        { val: 4, score: 35 },
        { val: 5, score: 52 },
        { val: 6, score: 68 },
        { val: 7, score: 82 },
        { val: 8, score: 90 },
        { val: 10, score: 100 }
    ];
    const TBL_ROUTE_ORDER = [
        { val: 0, score: 0 },
        { val: 1, score: 5 },
        { val: 2, score: 10 },
        { val: 3, score: 18 },
        { val: 4, score: 32 },
        { val: 5, score: 50 },
        { val: 6, score: 65 },
        { val: 7, score: 80 },
        { val: 8, score: 90 },
        { val: 10, score: 100 }
    ];

    // G3 神経衰弱（獲得ペア数：最大34ペア → 最大75点 ＋ 精度最大25点 ＝ 100点）
    const TBL_PAIRS = [
        { val: 0, score: 0 },
        { val: 3, score: 15 },  // ステージ1クリア (3ペア)
        { val: 9, score: 35 },  // ステージ2クリア (累計9ペア)
        { val: 19, score: 58 }, // ステージ3クリア (累計19ペア)
        { val: 34, score: 75 }  // 全ステージ制覇 (累計34ペア)
    ];

    // G4 パスコード（桁数）
    const TBL_PASS_FORWARD = [
        { val: 0, score: 0 },
        { val: 1, score: 5 },
        { val: 2, score: 12 },
        { val: 3, score: 20 },
        { val: 4, score: 35 },
        { val: 5, score: 52 },
        { val: 6, score: 70 },
        { val: 7, score: 84 },
        { val: 8, score: 94 },
        { val: 9, score: 100 }
    ];
    const TBL_PASS_BACKWARD = [
        { val: 0, score: 0 },
        { val: 1, score: 10 },
        { val: 2, score: 22 },
        { val: 3, score: 38 },
        { val: 4, score: 56 },
        { val: 5, score: 74 },
        { val: 6, score: 88 },
        { val: 7, score: 96 },
        { val: 8, score: 100 }
    ];

    // G5 音（音数）
    const TBL_SOUND = [
        { val: 0, score: 0 },
        { val: 1, score: 10 },
        { val: 2, score: 20 },
        { val: 3, score: 36 },
        { val: 4, score: 52 },
        { val: 5, score: 68 },
        { val: 6, score: 80 },
        { val: 7, score: 90 },
        { val: 9, score: 100 }
    ];

    // 実績表示用フォーマッタ（小数は子ども向けに分かりやすく整形）
    function formatSpan(num, unit) {
        if (!num || num === 0) return `0${unit}`;
        if (Number.isInteger(num)) return `${num}${unit}`;
        const base = Math.floor(num);
        return `${base}${unit}（おしい！）`;
    }

    /**
     * 各ゲームの生データから5つの能力値（0〜100）とテキストを算出
     */
    function calculate(raw, outScores, outTexts) {
        // --- 1. しゃしんきおく (G1) ---
        let photoScore = 0;
        let photoText = '0こ';
        if (raw.flash) {
            const count = raw.flash.maxItems || (raw.flash.level || 0);
            photoScore = interpolate(count, TBL_FLASH);
            photoText = `${formatSpan(count, 'こ')} きおく`;
        }
        outScores.photo = photoScore;
        outTexts.photo = photoText;

        // --- 2. ばしょきおく (G2場所 + G3神経衰弱) ---
        let routeSpaceScore = 0;
        let g2SpaceText = '0マス';
        if (raw.route) {
            const rSpace = raw.route.maxSpace || (raw.route.level || 0);
            routeSpaceScore = interpolate(rSpace, TBL_ROUTE_SPACE);
            g2SpaceText = formatSpan(rSpace, 'マス');
        }

        let pairsScore = 0;
        let g3Text = '0ペア';
        if (raw.pairs) {
            // 到達ペア数（最大34ペア→最大75点）と記憶正確度（最大25点）から算出
            const pCount = raw.pairs.clearedPairs || 0;
            const accuracy = raw.pairs.accuracy || 0; // 0〜1
            const baseScore = interpolate(pCount, TBL_PAIRS);
            const accBonus = (pCount > 0) ? Math.round(accuracy * 25) : 0;
            pairsScore = Math.min(100, baseScore + accBonus);
            g3Text = `${pCount}ペア達成`;
        }
        outScores.space = Math.round((routeSpaceScore + pairsScore) / 2);
        outTexts.space = `${g2SpaceText} / ${g3Text}`;

        // --- 3. じゅんばんきおく (G2順序 + G4順唱) ---
        let routeOrderScore = 0;
        let g2OrderText = '0マス';
        if (raw.route) {
            const rOrder = raw.route.maxOrder || (raw.route.level || 0);
            routeOrderScore = interpolate(rOrder, TBL_ROUTE_ORDER);
            g2OrderText = `${formatSpan(rOrder, 'マス')}連続`;
        }

        let passForwardScore = 0;
        let g4FwdText = '0けた';
        if (raw.passcode) {
            const fwd = raw.passcode.forwardSpan || 0;
            passForwardScore = interpolate(fwd, TBL_PASS_FORWARD);
            g4FwdText = formatSpan(fwd, 'けた');
        }
        outScores.order = Math.round((routeOrderScore + passForwardScore) / 2);
        outTexts.order = `${g2OrderText} / 順唱${g4FwdText}`;

        // --- 4. のうみそワーク (G4逆唱) ---
        let passBackwardScore = 0;
        let g4BackText = '0けた';
        if (raw.passcode) {
            const back = raw.passcode.backwardSpan || 0;
            passBackwardScore = interpolate(back, TBL_PASS_BACKWARD);
            g4BackText = `ぎゃくから${formatSpan(back, 'けた')}`;
        }
        outScores.work = passBackwardScore;
        outTexts.work = g4BackText;

        // --- 5. みみきおく (G5 音) ---
        let soundScore = 0;
        let soundText = '0おと';
        if (raw.sound) {
            const sCount = raw.sound.maxNotes || (raw.sound.level || 0);
            soundScore = interpolate(sCount, TBL_SOUND);
            soundText = `${formatSpan(sCount, 'おと')}連続`;
        }
        outScores.ear = soundScore;
        outTexts.ear = soundText;
    }

    /**
     * チャート描画と結果画面の更新
     */
    function draw(scores, texts) {
        const keys = ['photo', 'space', 'order', 'work', 'ear'];

        // 数値と実績テキストの反映
        keys.forEach(k => {
            const scoreEl = document.getElementById(`result-score-${k}`);
            if (scoreEl) scoreEl.textContent = scores[k] + '点';

            const recEl = document.getElementById(`result-rec-${k}`);
            if (recEl && texts[k]) recEl.textContent = texts[k];
        });

        // アドバイスの生成
        generateAdvice(scores);

        // レーダーチャート描画
        const canvas = document.getElementById('radar-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dataValues = [
            scores.photo,
            scores.space,
            scores.order,
            scores.work,
            scores.ear
        ];

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['📷 しゃしんきおく', '🗺 ばしょきおく', '🔢 じゅんばんきおく', '⚙️ のうみそワーク', '👂 みみきおく'],
                datasets: [{
                    label: 'あなたの記憶力プロファイル',
                    data: dataValues,
                    backgroundColor: 'rgba(126, 87, 194, 0.25)', // purple
                    borderColor: 'rgba(126, 87, 194, 1)',
                    pointBackgroundColor: 'rgba(126, 87, 194, 1)',
                    borderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        angleLines: { color: 'rgba(0,0,0,0.1)' },
                        grid: { color: 'rgba(0,0,0,0.1)' },
                        pointLabels: {
                            font: { family: '"UD Digital Kyokasho-tai-R", sans-serif', size: 12 },
                            color: '#444'
                        },
                        ticks: { display: false, stepSize: 20 }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    /**
     * 得意と伸びしろのアドバイスを動的生成
     */
    function generateAdvice(scores) {
        const labels = {
            photo: { name: 'しゃしんきおく', good: '一瞬見たものをカメラのように焼きつける力がバツグン！図鑑や地図を見るのが向いているよ！', tip: '「フラッシュえもじ」でさらに瞬発力をみがこう！' },
            space: { name: 'ばしょきおく', good: '「どこに何があるか」を空間ごとしっかり覚えるのが得意！道をおぼえるのも上手かも！', tip: '「どうぶつあわせ」を遊ぶとさらに記憶が研ぎ澄まされるよ！' },
            order: { name: 'じゅんばんきおく', good: '起きたことや手順を順番通りきっちりキープできる、とても正確な力を持っているね！', tip: '「きおくルートたんけん」で長いルートに挑戦してみよう！' },
            work: { name: 'のうみそワーク', good: '頭の中で情報を並べ替えたり操作する柔軟性がすごい！算数や複雑なパズルで大活躍する力だよ！', tip: '「パスコードをあてよう！」で逆から考える練習をしてみよう！' },
            ear: { name: 'みみきおく', good: '耳から入った音や言葉をしっかり聞き分ける耳の記憶力が光っているね！音楽や語学にもピッタリ！', tip: '「おとあてクイズ」で耳をすます楽しさを体験してみよう！' }
        };

        // 最高得点と最低得点を見つける
        let maxK = 'photo';
        let minK = 'photo';
        let maxV = -1;
        let minV = 999;

        Object.keys(scores).forEach(k => {
            if (scores[k] > maxV) { maxV = scores[k]; maxK = k; }
            if (scores[k] < minV) { minV = scores[k]; minK = k; }
        });

        const bestEl = document.getElementById('result-best-advice');
        const growthEl = document.getElementById('result-growth-advice');

        if (bestEl) {
            bestEl.innerHTML = `✨ <strong>きみの強力な武器：【${labels[maxK].name}】</strong><br>${labels[maxK].good}`;
        }
        if (growthEl) {
            growthEl.innerHTML = `🌱 <strong>もっとのびるヒント：【${labels[minK].name}】</strong><br>${labels[minK].tip}`;
        }
    }

    /**
     * 前回の記録より上がっていたらバッジをつける
     */
    function applyGrowthBadges(currentScores, prevScores) {
        if (!prevScores) return;
        Object.keys(currentScores).forEach(k => {
            if (currentScores[k] > (prevScores[k] || 0)) {
                const recEl = document.getElementById(`result-rec-${k}`);
                if (recEl && !recEl.querySelector('.record-up-badge')) {
                    const diff = currentScores[k] - prevScores[k];
                    recEl.innerHTML += `<span class="record-up-badge">▲ +${diff}pt UP!</span>`;
                }
            }
        });
    }

    return { calculate, draw, applyGrowthBadges };
})();
