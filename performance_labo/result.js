/* ============================================
   result.js — リザルト・レーダーチャート
   各ゲームの生データを 0〜100 に正規化して
   Chart.js でレーダーチャートを描画する
   ============================================ */

'use strict';

window.ResultModule = (() => {

    /* ---------- 能力軸の定義 ---------- */
    const AXES = [
        { key: 'starflash', label: 'はっけん\nスピード', color: '#ff7043' },
        { key: 'ruler',     label: 'はんのう\nスピード', color: '#26c6da' },
        { key: 'stroop',    label: 'はんだん\nりょく',   color: '#ab47bc' },
        { key: 'animalMot', label: 'きおく・\nしゅうちゅう', color: '#26a69a' },
        { key: 'timing',    label: 'タイミング・\nどうたいしりょく', color: '#ec407a' },
    ];

    /* ---------- 補助: クランプ ---------- */
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    /* ---------- 正規化：生データ → 0〜100 ---------- */
    function normalize(results, scores) {

        /* ---- Game1: スターフラッシュ ----
         * taps: 30秒で20回=50pt、40回=80pt、50回=100pt
         * avgReactionMs: 300ms=20pt、600ms=0pt（上限20pt） */
        if (results.starflash) {
            const { taps, avgReactionMs } = results.starflash;
            const tapScore = clamp(taps / 50 * 80, 0, 80);
            const rtScore  = clamp((600 - avgReactionMs) / 300 * 20, 0, 20);
            scores.starflash = Math.round(tapScore + rtScore);
        }

        /* ---- Game2: ものさしキャッチ ----
         * bestMs: 150ms=100pt、800ms=10pt（反応時間が短いほど高得点） */
        if (results.ruler) {
            const { bestMs } = results.ruler;
            if (bestMs >= 9999) {
                scores.ruler = 5;
            } else {
                scores.ruler = Math.round(clamp((800 - bestMs) / 650 * 90 + 10, 5, 100));
            }
        }

        /* ---- Game3: ストループ ----
         * 正答率 × 70 + 速さボーナス × 30
         * avgSpeedMs: 350ms=30pt、1400ms=0pt */
        if (results.stroop) {
            const { correctRate, avgSpeedMs } = results.stroop;
            const rateScore  = clamp(correctRate * 70, 0, 70);
            const speedScore = clamp((1400 - avgSpeedMs) / 1050 * 30, 0, 30);
            scores.stroop = Math.round(rateScore + speedScore);
        }

        /* ---- Game4: アニマルMOT ----
         * 正答率をそのまま 0〜100 にマップ */
        if (results.animalMot) {
            scores.animalMot = Math.round(clamp(results.animalMot.correctRate * 100, 0, 100));
        }

        /* ---- Game5: シャッターチャンス ----
         * avgOffset: 0px=100pt、FRAME_W/2(35px)以内=70pt〜、70px以上=10pt */
        if (results.timing) {
            const { avgOffset } = results.timing;
            if (avgOffset >= 999) {
                scores.timing = 5;
            } else {
                scores.timing = Math.round(clamp((70 - avgOffset) / 70 * 90 + 10, 5, 100));
            }
        }
    }

    /* ---------- レーダーチャート描画 ---------- */
    function draw(scores) {

        // スコア一覧の数字を更新
        AXES.forEach(axis => {
            const el = document.getElementById(`result-score-${axis.key}`);
            if (el) el.textContent = scores[axis.key] ?? '0';
        });

        // 総合コメント
        const avg = Math.round(
            AXES.reduce((s, a) => s + (scores[a.key] || 0), 0) / AXES.length
        );
        const summaryEl = document.getElementById('result-summary');
        if (summaryEl) {
            if (avg >= 85)      summaryEl.textContent = 'えっ、このこ天才…？🌟';
            else if (avg >= 70) summaryEl.textContent = 'すごい！ポテンシャルたかいね！🎉';
            else if (avg >= 55) summaryEl.textContent = 'よくできました！練習するともっとのびるよ！';
            else if (avg >= 40) summaryEl.textContent = 'いいスタート！またちょうせんしてみよう！';
            else                summaryEl.textContent = 'これからドンドンのびていくよ！ファイト！';
        }

        // Chart.js が未ロードなら描画スキップ
        const canvas = document.getElementById('radar-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        // 既存チャートを破棄（reload防止）
        const existing = Chart.getChart(canvas);
        if (existing) existing.destroy();

        new Chart(canvas, {
            type: 'radar',
            data: {
                labels:   AXES.map(a => a.label),
                datasets: [{
                    label: 'あなたののうりょく',
                    data:  AXES.map(a => scores[a.key] || 0),
                    backgroundColor:   'rgba(92, 107, 192, 0.22)',
                    borderColor:       'rgba(92, 107, 192, 0.9)',
                    borderWidth:       2.5,
                    pointBackgroundColor: AXES.map(a => a.color),
                    pointBorderColor:     '#fff',
                    pointBorderWidth:     2,
                    pointRadius:          6,
                    pointHoverRadius:     8,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 800,
                    easing:   'easeOutQuart',
                },
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize:        25,
                            font:            { size: 9 },
                            color:           '#aaa',
                            backdropColor:   'transparent',
                        },
                        pointLabels: {
                            font: {
                                size:   10,
                                family: '"UD Digital Kyokasho-tai-R", "Helvetica Neue", sans-serif',
                            },
                            color: '#444',
                        },
                        grid:       { color: 'rgba(0,0,0,0.08)' },
                        angleLines: { color: 'rgba(0,0,0,0.1)' },
                    },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.raw} pt`,
                        },
                    },
                },
            },
        });

        // スコアバー演出（数字をゼロから数えあがるアニメーション）
        AXES.forEach(axis => {
            const el  = document.getElementById(`result-score-${axis.key}`);
            const end = scores[axis.key] || 0;
            if (!el) return;
            let cur = 0;
            const step = () => {
                cur = Math.min(cur + 3, end);
                el.textContent = cur;
                if (cur < end) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    }

    return { normalize, draw };

})();
