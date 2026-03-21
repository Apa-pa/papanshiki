/* ============================================
   game2_ruler.js — ものさしキャッチ（反射神経テスト）
   定規が突然落ち始めたら素早くタップ！
   タップが早いほどメモリが小さい（少ししか落ちていない）
   t = sqrt(2 * d / g) で反応時間（ms）を算出
   ============================================ */

'use strict';

window.Game2 = (() => {

    /* ---------- 定数 ---------- */
    const TRIALS         = 3;      // 試行回数
    const RULER_PX_PER_CM = 24;   // 1cm あたりのピクセル数（定規の見た目の比率）
    const MAX_CM         = 30;     // 定規の最大長（cm）
    const G_CM_PER_S2    = 300;    // 見た目の落下加速度（実重力980の約1/3に調整）
    const WAIT_MIN_MS    = 1200;   // 待機時間の最小
    const WAIT_MAX_MS    = 3500;   // 待機時間の最大（フォールスタート防止のため広め）

    /* ---------- 状態変数 ---------- */
    let trialsDone   = 0;
    let bestMs       = Infinity;
    let allResults   = [];      // { ms, cm, valid } の配列
    let phase        = 'idle';  // idle → ready → falling → result
    let fallStart    = 0;       // 落下開始時刻（performance.now()）
    let rafHandle    = null;
    let waitTimeout  = null;
    let audioCtx     = null;
    let falseStartLocked = false;  // フォールスタート後のロック

    /* ---------- AudioContext ---------- */
    function getAudioCtx() {
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) {}
        }
        return audioCtx;
    }

    /* 効果音: 落下開始（低音ドン） */
    function playDrop() {
        const ctx = getAudioCtx(); if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.value = 120;
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.25);
    }

    /* 効果音: キャッチ成功（明るいピン） */
    function playCatch() {
        const ctx = getAudioCtx(); if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.value = 750;
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
    }

    /* 効果音: フォールスタート（ブブー） */
    function playFalseStart() {
        const ctx = getAudioCtx(); if (!ctx) return;
        [260, 220].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'square'; osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.1);
            osc.start(ctx.currentTime + i * 0.12);
            osc.stop(ctx.currentTime + i * 0.12 + 0.1);
        });
    }

    /* ---------- start: ゲーム開始 ---------- */
    function start() {
        trialsDone = 0;
        bestMs     = Infinity;
        allResults = [];
        phase      = 'idle';

        App.setGameHTML(buildHTML());
        attachEvents();
        prepareNext();
    }

    /* ---------- UIのHTML生成 ---------- */
    function buildHTML() {
        let dots = '';
        for (let i = 0; i < TRIALS; i++) {
            dots += `<span class="ruler-dot" id="ruler-dot-${i}">📏</span>`;
        }

        // 定規の目盛りHTML（5cmごとに大きい目盛り、1cmごとに小さい目盛り）
        let ticksHTML = '';
        for (let cm = 0; cm <= MAX_CM; cm++) {
            const y     = cm * RULER_PX_PER_CM;
            const isBig = cm % 5 === 0;
            ticksHTML += `
                <div class="ruler-tick ${isBig ? 'big' : 'small'}" style="top:${y}px"></div>
                ${isBig ? `<div class="ruler-label" style="top:${y - 8}px">${cm}</div>` : ''}`;
        }

        return `
        <div class="ruler-header">
            <div class="ruler-dots">${dots}</div>
            <div id="ruler-best-disp">ベスト: --</div>
        </div>
        <div id="ruler-msg" class="ruler-msg">じゅんびちゅう…</div>
        <div class="ruler-stage-wrap">
            <!-- 手のひらエリア（下部固定） -->
            <div class="ruler-hand" id="ruler-hand">
                <div class="ruler-hand-inner">✋</div>
            </div>
            <!-- 定規が動くエリア -->
            <div class="ruler-drop-area" id="ruler-drop-area">
                <div class="ruler-body" id="ruler-body">
                    <div class="ruler-ticks">${ticksHTML}</div>
                    <!-- キャッチ位置マーカー（タップ時に表示） -->
                    <div class="ruler-catch-marker" id="ruler-catch-marker"></div>
                </div>
            </div>
        </div>
        <div id="ruler-result-line" class="ruler-result-line"></div>`;
    }

    /* ---------- イベント付加 ---------- */
    function attachEvents() {
        // 画面全体へのタップを検知（定規がどこにあっても押せる）
        const area = document.getElementById('game-area');
        if (!area) return;
        area.addEventListener('pointerdown', onTap);
    }

    /* ---------- 次の試行の準備 ---------- */
    function prepareNext() {
        phase            = 'ready';
        falseStartLocked = false;
        cancelAnimationFrame(rafHandle);

        // 定規を上部に戻す
        const body = document.getElementById('ruler-body');
        if (body) {
            body.style.transition = 'none';
            body.style.top = '0px';
        }

        const marker = document.getElementById('ruler-catch-marker');
        if (marker) marker.style.display = 'none';

        const msg = document.getElementById('ruler-msg');
        if (msg) msg.textContent = 'すきなときに トン！とおとすよ…';

        setHandState('ready');

        // ランダム待機後に落下開始
        const wait = WAIT_MIN_MS + Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS);
        waitTimeout = setTimeout(startFall, wait);
    }

    /* ---------- 落下開始 ---------- */
    function startFall() {
        phase     = 'falling';
        fallStart = performance.now();

        setHandState('open');
        playDrop();

        const msg = document.getElementById('ruler-msg');
        if (msg) msg.textContent = 'いまだ！タップ！';

        animateFall();
    }

    /* ---------- 落下アニメーション（requestAnimationFrame） ---------- */
    function animateFall() {
        if (phase !== 'falling') return;

        const elapsed   = (performance.now() - fallStart) / 1000; // 秒
        const dropCm    = 0.5 * G_CM_PER_S2 * elapsed * elapsed;  // 自由落下の距離（cm）
        const dropPx    = dropCm * RULER_PX_PER_CM;
        const maxDropPx = MAX_CM * RULER_PX_PER_CM;

        const body = document.getElementById('ruler-body');
        if (body) body.style.top = `${Math.min(dropPx, maxDropPx)}px`;

        if (dropPx >= maxDropPx) {
            // 落ちきった → 失敗（タップなし）
            onMiss();
        } else {
            rafHandle = requestAnimationFrame(animateFall);
        }
    }

    /* ---------- タップ処理 ---------- */
    function onTap() {
        if (falseStartLocked) return;

        if (phase === 'ready') {
            // フォールスタート
            falseStartLocked = true;
            clearTimeout(waitTimeout);
            playFalseStart();

            const msg = document.getElementById('ruler-msg');
            if (msg) msg.textContent = '⚡ はやまった！もういちど…';
            setHandState('false_start');

            setTimeout(prepareNext, 1800);
            return;
        }

        if (phase !== 'falling') return;

        // ---- 正規タップ ----
        phase = 'caught';
        cancelAnimationFrame(rafHandle);

        const reactionMs = Math.round(performance.now() - fallStart);

        // 落下距離を cm で計算
        const elSec   = reactionMs / 1000;
        const dropCm  = Math.min(0.5 * G_CM_PER_S2 * elSec * elSec, MAX_CM);
        const dropPx  = dropCm * RULER_PX_PER_CM;

        // キャッチマーカーを落下位置に表示
        const marker = document.getElementById('ruler-catch-marker');
        if (marker) {
            marker.style.display = 'block';
            marker.style.top     = `${dropPx}px`;
            marker.textContent   = `${Math.round(dropCm * 10) / 10} cm`;
        }

        playCatch();
        setHandState('caught');

        // ベスト更新
        if (reactionMs < bestMs) bestMs = reactionMs;

        allResults.push({ ms: reactionMs, cm: dropCm, valid: true });
        recordDot(trialsDone, reactionMs);
        updateBestDisp();

        // 結果ラインに表示
        const line = document.getElementById('ruler-result-line');
        if (line) {
            line.textContent = `${Math.round(dropCm * 10) / 10} cm → ${reactionMs} ms`;
            line.style.color = reactionMs < 200 ? '#2e7d32' : reactionMs < 350 ? '#f57f17' : '#c62828';
        }

        const msg = document.getElementById('ruler-msg');
        if (msg) msg.textContent = reactionMs < 200 ? 'すごい！電光石火！⚡'
                                  : reactionMs < 300 ? 'はやい！🎉'
                                  : reactionMs < 400 ? 'いいね！'
                                  : 'もっとはやく！';

        trialsDone++;
        if (trialsDone < TRIALS) {
            setTimeout(prepareNext, 2000);
        } else {
            setTimeout(endGame, 2000);
        }
    }

    /* ---------- タップしなかった → ミス ---------- */
    function onMiss() {
        phase = 'caught';
        allResults.push({ ms: 9999, cm: MAX_CM, valid: false });
        recordDot(trialsDone, 9999);

        const msg = document.getElementById('ruler-msg');
        if (msg) msg.textContent = 'おそかった…💦';

        setHandState('open');
        playFalseStart();

        trialsDone++;
        if (trialsDone < TRIALS) {
            setTimeout(prepareNext, 1800);
        } else {
            setTimeout(endGame, 1800);
        }
    }

    /* ---------- ドット更新 ---------- */
    function recordDot(idx, ms) {
        const dot = document.getElementById(`ruler-dot-${idx}`);
        if (!dot) return;
        if (ms >= 9999) {
            dot.textContent = '❌';
        } else {
            dot.textContent = ms < 200 ? '⚡' : ms < 350 ? '✅' : '🟡';
        }
    }

    /* ---------- ベスト表示更新 ---------- */
    function updateBestDisp() {
        const el = document.getElementById('ruler-best-disp');
        if (!el || bestMs === Infinity) return;
        el.textContent = `ベスト: ${bestMs} ms`;
    }

    /* ---------- 手の状態を切り替える ---------- */
    function setHandState(state) {
        const hand = document.getElementById('ruler-hand');
        const inner = hand ? hand.querySelector('.ruler-hand-inner') : null;
        if (!hand || !inner) return;
        hand.className = `ruler-hand ${state}`;
        inner.textContent = state === 'caught' ? '✊' : state === 'false_start' ? '😅' : '✋';
    }

    /* ---------- ゲーム終了 ---------- */
    function endGame() {
        clearTimeout(waitTimeout);
        cancelAnimationFrame(rafHandle);

        App.saveResult('ruler', {
            bestMs:  bestMs === Infinity ? 9999 : bestMs,
            results: allResults,
        });
    }

    /* ---------- 公開インターフェース ---------- */
    return { start };

})();

/* ====== ゲーム専用CSS ====== */
(function injectCSS() {
    const style = document.createElement('style');
    const RULER_PX_PER_CM = 24;
    const MAX_CM          = 30;

    style.textContent = `
        /* ヘッダー行 */
        .ruler-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.9rem;
            font-weight: bold;
            color: #555;
            margin-bottom: 8px;
        }
        .ruler-dots { font-size: 1.2rem; letter-spacing: 4px; }

        /* メッセージ行 */
        .ruler-msg {
            text-align: center;
            font-size: 1rem;
            font-weight: bold;
            color: #333;
            background: #e0f7fa;
            border-radius: 10px;
            padding: 7px;
            margin-bottom: 12px;
            min-height: 36px;
        }

        /* ステージ全体のレイアウト */
        .ruler-stage-wrap {
            display: flex;
            align-items: flex-start;
            justify-content: center;
            gap: 20px;
            height: ${MAX_CM * RULER_PX_PER_CM + 60}px;
            position: relative;
        }

        /* 落下エリア */
        .ruler-drop-area {
            position: relative;
            width: 70px;
            height: ${MAX_CM * RULER_PX_PER_CM}px;
            overflow: visible;
        }

        /* 定規本体 */
        .ruler-body {
            position: absolute;
            top: 0;
            left: 0;
            width: 64px;
            height: ${MAX_CM * RULER_PX_PER_CM}px;
            background: linear-gradient(90deg, #ffe082 0%, #fff9c4 60%, #ffe082 100%);
            border: 2px solid #f9a825;
            border-radius: 4px;
            overflow: visible;
            /* 落下アニメは JS の top 変更で行う */
        }

        /* 目盛り */
        .ruler-ticks { position: relative; height: 100%; }
        .ruler-tick {
            position: absolute;
            right: 0;
            height: 1px;
            background: #795548;
        }
        .ruler-tick.big  { width: 22px; height: 2px; background: #4e342e; }
        .ruler-tick.small{ width: 12px; }
        .ruler-label {
            position: absolute;
            right: 26px;
            font-size: 9px;
            color: #4e342e;
            font-weight: bold;
            line-height: 1;
        }

        /* キャッチマーカー */
        .ruler-catch-marker {
            display: none;
            position: absolute;
            left: -46px;
            width: 110px;
            background: #e53935;
            color: white;
            font-size: 0.75rem;
            font-weight: bold;
            text-align: center;
            border-radius: 6px;
            padding: 2px 4px;
            pointer-events: none;
            z-index: 10;
        }

        /* 手エリア */
        .ruler-hand {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            font-size: 2.5rem;
            text-align: center;
            transition: transform 0.15s;
            z-index: 5;
        }
        .ruler-hand.caught { animation: handCatch 0.2s ease; }
        @keyframes handCatch {
            0%   { transform: translateX(-50%) scale(1.3); }
            100% { transform: translateX(-50%) scale(1); }
        }
        .ruler-hand.false_start {
            animation: handShake 0.4s ease;
        }
        @keyframes handShake {
            0%,100% { transform: translateX(-50%); }
            25%     { transform: translateX(calc(-50% - 6px)); }
            75%     { transform: translateX(calc(-50% + 6px)); }
        }

        /* 結果テキスト */
        .ruler-result-line {
            text-align: center;
            font-size: 1.2rem;
            font-weight: bold;
            margin-top: 10px;
            min-height: 28px;
            letter-spacing: 1px;
        }
    `;
    document.head.appendChild(style);
})();
