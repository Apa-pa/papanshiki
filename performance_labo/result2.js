/* ============================================
   result2.js — 感覚測定ラボ（Labo 2）のリザルト集計と描画
   ============================================ */
'use strict';

window.ResultModule2 = (function() {

    function normalize(rawResults, outScores) {
        // 1. 量の感覚 (平均誤差でスコアを計算)
        if (rawResults.quantity) {
            if (rawResults.quantity.hasOwnProperty('correctRate')) {
                // 過去のデータ用フォーールバック
                outScores.quantity = rawResults.quantity.correctRate || 0;
            } else {
                const err = rawResults.quantity.avgErrorCount || 0;
                // 最大誤差（ズレ）は12個。0個なら100点、6個ズレで約10点になる緩やかなカーブ
                let score = 100 - (err * 15);
                outScores.quantity = Math.max(0, Math.min(100, Math.round(score)));
            }
        }

        // 2. 速度の感覚 (100点は難しいが、0点にはなりにくい評価)
        if (rawResults.speed) {
            const err = rawResults.speed.avgErrorMs || 0;
            // 0msで100点。1500msズレてはじめて0点になるゆるやかなカーブ
            let score = 100 - (err / 15);
            outScores.speed = Math.max(0, Math.min(100, Math.round(score)));
        }

        // 3. 空間の感覚 (correctRateそのまま)
        if (rawResults.space) {
            outScores.space = rawResults.space.correctRate || 0;
        }

        // 4. 長さの感覚 (100点は難しいが、0点にはなりにくい評価)
        if (rawResults.length) {
            const errPct = rawResults.length.avgErrorPct || 0;
            // 0%で100点満点。45%ズレてはじめて0点になるゆるやかなカーブ
            let score = 100 - (errPct * 2.22);
            outScores.length = Math.max(0, Math.min(100, Math.round(score)));
        }

        // 5. 色の感覚 (correctRateそのまま)
        if (rawResults.color) {
            outScores.color = rawResults.color.correctRate || 0;
        }
    }

    function draw(scores) {
        const ids = ['quantity', 'speed', 'space', 'length', 'color'];
        ids.forEach(id => {
            const el = document.getElementById(`result-score-${id}`);
            if (el) el.textContent = scores[id] + '点';
        });

        const canvas = document.getElementById('radar-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dataValues = [
            scores.quantity,
            scores.speed,
            scores.space,
            scores.length,
            scores.color
        ];

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['量の感覚', 'スピードの感覚', '空間・形', '長さの感覚', '色彩感覚'],
                datasets: [{
                    label: 'あなたの直感力',
                    data: dataValues,
                    backgroundColor: 'rgba(255, 152, 0, 0.2)', // orange/accent
                    borderColor: 'rgba(255, 152, 0, 1)',
                    pointBackgroundColor: 'rgba(255, 152, 0, 1)',
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
                            color: '#555'
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

    return { normalize, draw };
})();
