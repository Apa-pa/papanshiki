/* ============================================
   game3_stroop.js — いろとことばのわな
   文字の「色」を答えるストループ課題
   はんだんりょく・しゅうちゅうりょくを測定する
   ============================================ */

'use strict';

window.Game3 = (() => {

    /* ---------- 定数 ---------- */
    const TOTAL_QUESTIONS = 20;
    const TIME_LIMIT_MS   = 30000; // 30秒

    /* ---------- 色データ ---------- */
    const COLOR_DATA = [
        { text: 'あか', color: '#e53935', label: 'あか', btnBg: '#ffcdd2' },
        { text: 'あお', color: '#1e88e5', label: 'あお', btnBg: '#bbdefb' },
        { text: 'きいろ', color: '#f9a825', label: 'きいろ', btnBg: '#fff9c4' },
        { text: 'みどり', color: '#388e3c', label: 'みどり', btnBg: '#c8e6c9' },
    ];

    /* ---------- 状態変数 ---------- */
    let qIndex       = 0;
    let correct      = 0;
    let startTime    = 0;
    let qStartTime   = 0;
    let responseTimes = [];
    let timerHandle  = null;
    let rafHandle    = null;
    let currentAnswer = '';
    let answering    = false; // 連打防止フラグ
    let audioCtx     = null;

    /* ---------- AudioContext ---------- */
    function getAudioCtx() {
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) {}
        }
        return audioCtx;
    }

    function playCorrect() {
        const ctx = getAudioCtx(); if (!ctx) return;
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.value = 880;
        g.gain.setValueAtTime(0.15, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
    }

    function playWrong() {
        const ctx = getAudioCtx(); if (!ctx) return;
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'sawtooth'; osc.frequency.value = 220;
        g.gain.setValueAtTime(0.1, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
    }

    /* ---------- start ---------- */
    function start() {
        qIndex        = 0;
        correct       = 0;
        responseTimes = [];
        answering     = false;
        startTime     = performance.now();

        App.setGameHTML(buildHTML());
        attachEvents();

        timerHandle = setTimeout(endGame, TIME_LIMIT_MS);
        startTimerBar();
        nextQuestion();
    }

    /* ---------- UIのHTML生成 ---------- */
    function buildHTML() {
        const choices = COLOR_DATA.map(c =>
            `<button class="stroop-btn" data-label="${c.label}"
                style="--btn-bg:${c.btnBg}; --btn-border:${c.color};">
                <span class="stroop-btn-dot" style="background:${c.color}"></span>
                ${c.text}
            </button>`
        ).join('');

        return `
        <div class="stroop-top-bar">
            <div class="stroop-timer-bar">
                <div class="stroop-timer-fill" id="stroop-timer-fill"></div>
            </div>
            <div class="stroop-progress-line">
                <span id="stroop-q-num">1 / ${TOTAL_QUESTIONS}</span>
                <span id="stroop-score">✅ 0 &nbsp; ❌ 0</span>
            </div>
        </div>
        <div class="stroop-question-wrap">
            <div class="stroop-instruction">もじの<strong>「いろ」</strong>はどっち？</div>
            <div class="stroop-word" id="stroop-word"></div>
        </div>
        <div class="stroop-choices">${choices}</div>`;
    }

    /* ---------- イベント付加 ---------- */
    function attachEvents() {
        document.querySelectorAll('.stroop-btn').forEach(btn => {
            btn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                onAnswer(btn.dataset.label, btn);
            });
        });
    }

    /* ---------- タイマーバー（rAFでスムーズ更新） ---------- */
    function startTimerBar() {
        const tick = () => {
            const elapsed = performance.now() - startTime;
            const ratio   = Math.max(0, 1 - elapsed / TIME_LIMIT_MS);
            const fill    = document.getElementById('stroop-timer-fill');
            if (fill) {
                fill.style.width = `${ratio * 100}%`;
                // 残り5秒で赤く
                fill.style.background = ratio < 0.17
                    ? 'linear-gradient(90deg, #e53935, #ef9a9a)'
                    : 'linear-gradient(90deg, #ab47bc, #7b1fa2)';
            }
            if (ratio > 0) rafHandle = requestAnimationFrame(tick);
        };
        rafHandle = requestAnimationFrame(tick);
    }

    /* ---------- 次の問題 ---------- */
    function nextQuestion() {
        if (qIndex >= TOTAL_QUESTIONS) {
            clearTimeout(timerHandle);
            endGame();
            return;
        }

        answering = false;

        // テキストとインクカラーをずらす（65%の確率で不一致）
        const textIdx  = Math.floor(Math.random() * COLOR_DATA.length);
        let   colorIdx = textIdx;
        if (Math.random() < 0.65) {
            do { colorIdx = Math.floor(Math.random() * COLOR_DATA.length); }
            while (colorIdx === textIdx);
        }

        currentAnswer = COLOR_DATA[colorIdx].label;
        const wordEl  = document.getElementById('stroop-word');
        if (wordEl) {
            wordEl.textContent = COLOR_DATA[textIdx].text;
            wordEl.style.color = COLOR_DATA[colorIdx].color;
            // 次の問題が表示されたときのアニメ
            wordEl.classList.remove('stroop-word-in');
            void wordEl.offsetWidth;
            wordEl.classList.add('stroop-word-in');
        }

        const qNumEl = document.getElementById('stroop-q-num');
        if (qNumEl) qNumEl.textContent = `${qIndex + 1} / ${TOTAL_QUESTIONS}`;

        qStartTime = performance.now();
    }

    /* ---------- 回答処理 ---------- */
    function onAnswer(label, btnEl) {
        if (answering) return;
        answering = true;

        const rt      = Math.round(performance.now() - qStartTime);
        const isRight = label === currentAnswer;

        responseTimes.push(rt);
        if (isRight) {
            correct++;
            playCorrect();
        } else {
            playWrong();
        }

        // ボタン自体を一瞬フラッシュ（オーバーレイなし）
        if (btnEl) {
            btnEl.classList.add(isRight ? 'stroop-flash-ok' : 'stroop-flash-ng');
            setTimeout(() => btnEl.classList.remove('stroop-flash-ok', 'stroop-flash-ng'), 250);
        }

        // スコア更新
        const wrong  = qIndex + 1 - correct;
        const scoreEl = document.getElementById('stroop-score');
        if (scoreEl) scoreEl.innerHTML = `✅ ${correct} &nbsp; ❌ ${wrong}`;

        qIndex++;
        setTimeout(nextQuestion, 300);
    }

    /* ---------- ゲーム終了 ---------- */
    function endGame() {
        clearTimeout(timerHandle);
        cancelAnimationFrame(rafHandle);

        const avgSpeedMs = responseTimes.length > 0
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
            : 9999;

        App.saveResult('stroop', {
            correctRate: qIndex > 0 ? correct / qIndex : 0,
            avgSpeedMs,
            answered:    qIndex,
            correct,
        });
    }

    return { start };

})();

/* ====== ゲーム専用CSS ====== */
(function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .stroop-top-bar { margin-bottom: 10px; }

        .stroop-timer-bar {
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 5px;
        }
        .stroop-timer-fill {
            height: 100%;
            background: linear-gradient(90deg, #ab47bc, #7b1fa2);
            width: 100%;
            border-radius: 4px;
        }
        .stroop-progress-line {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            color: #666;
            font-weight: bold;
        }

        /* 問題エリア */
        .stroop-question-wrap {
            text-align: center;
            background: #f3e5f5;
            border-radius: 18px;
            padding: 18px 14px;
            margin-bottom: 16px;
        }
        .stroop-instruction {
            font-size: 0.82rem;
            color: #777;
            margin-bottom: 10px;
        }
        .stroop-word {
            font-size: 3.2rem;
            font-weight: bold;
            letter-spacing: 6px;
            opacity: 0;
        }
        .stroop-word-in {
            animation: stroopWordIn 0.18s ease forwards;
        }
        @keyframes stroopWordIn {
            from { opacity: 0; transform: scale(0.85); }
            to   { opacity: 1; transform: scale(1); }
        }

        /* 選択肢 */
        .stroop-choices {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .stroop-btn {
            background: var(--btn-bg, #f5f5f5);
            color: #222;
            border: 3px solid var(--btn-border, #ddd);
            border-radius: 16px;
            padding: 14px 8px;
            font-size: 1.05rem;
            font-weight: bold;
            cursor: pointer;
            font-family: inherit;
            box-shadow: 0 4px 0 rgba(0,0,0,0.12);
            transition: transform 0.08s, box-shadow 0.08s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            touch-action: manipulation;
        }
        .stroop-btn:active {
            transform: translateY(3px);
            box-shadow: 0 1px 0 rgba(0,0,0,0.12);
        }
        .stroop-btn-dot {
            width: 14px; height: 14px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        /* 正誤フラッシュ */
        .stroop-btn.stroop-flash-ok {
            background: #a5d6a7 !important;
            border-color: #388e3c !important;
        }
        .stroop-btn.stroop-flash-ng {
            background: #ef9a9a !important;
            border-color: #c62828 !important;
        }
    `;
    document.head.appendChild(style);
})();
