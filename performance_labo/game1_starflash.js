/* ============================================
   game1_starflash.js — スターフラッシュ
   5×5グリッドのボタンが光り、素早くタップ！
   はっけんスピード・周辺視野を測定する
   ============================================ */

'use strict';

window.Game1 = (() => {

    /* ---------- 定数 ---------- */
    const GRID_SIZE          = 5;    // 5×5 グリッド
    const GAME_DURATION      = 30;   // ゲーム時間（秒）
    const FLASH_INTERVAL_MIN = 500;  // 光る間隔の最小（ms）
    const FLASH_INTERVAL_MAX = 900;  // 光る間隔の最大（ms）
    const LIT_DURATION       = 800;  // 光り続ける時間の上限（ms）

    /* ---------- 状態変数 ---------- */
    let taps          = 0;
    let reactionTimes = [];
    let flashedAt     = 0;
    let currentCell   = -1;
    let timerInterval = null;
    let flashTimeout  = null;
    let litTimeout    = null;   // 自動消灯タイマー
    let timeLeft      = GAME_DURATION;
    let audioCtx      = null;   // Web Audio API コンテキスト

    /* ---------- AudioContext 遅延生成 ---------- */
    function getAudioCtx() {
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) { /* 非対応ブラウザは無音で動作 */ }
        }
        return audioCtx;
    }

    /* ---------- 効果音: 正解（明るい短音） ---------- */
    function playHit() {
        const ctx = getAudioCtx();
        if (!ctx) return;

        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type            = 'sine';
        osc.frequency.value = 880;       // A5
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
    }

    /* ---------- 効果音: ミス（低めの短音） ---------- */
    function playMiss() {
        const ctx = getAudioCtx();
        if (!ctx) return;

        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type            = 'sine';
        osc.frequency.value = 300;       // D4 あたり
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    }

    /* ---------- start: ゲーム開始 ---------- */
    function start() {
        taps          = 0;
        reactionTimes = [];
        timeLeft      = GAME_DURATION;
        currentCell   = -1;

        App.setGameHTML(buildHTML());
        attachEvents();

        timerInterval = setInterval(onTick, 1000);
        scheduleFlash();
    }

    /* ---------- UIのHTML生成 ---------- */
    function buildHTML() {
        let cells = '';
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            cells += `<button class="sf-cell" data-idx="${i}" id="sf-cell-${i}">⭐</button>`;
        }
        return `
        <div class="timer-bar-wrap">
            <div class="timer-bar-fill" id="g1-timer" style="width:100%"></div>
        </div>
        <div class="sf-info">
            <span id="sf-count">タップ: <strong>0</strong> かい</span>
            <span id="sf-time">${GAME_DURATION}びょう</span>
        </div>
        <div class="sf-grid" id="sf-grid">${cells}</div>`;
    }

    /* ---------- イベント付加 ---------- */
    function attachEvents() {
        const grid = document.getElementById('sf-grid');
        if (!grid) return;

        // クリック（PC）
        grid.addEventListener('click', onCellClick);

        // タッチ（スマートフォン・タブレット）
        grid.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch  = e.changedTouches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            if (target && target.classList.contains('sf-cell')) {
                onCellClick({ target });
            }
        }, { passive: false });
    }

    /* ---------- セルクリック処理 ---------- */
    function onCellClick(e) {
        const idx = parseInt(e.target.dataset.idx, 10);

        if (idx !== currentCell) {
            // 光っていないセルをタップ → ミス音のみ（進行は止めない）
            playMiss();
            return;
        }

        // 反応時間を記録
        reactionTimes.push(Date.now() - flashedAt);
        taps++;

        // ---- フィードバック: セルのきらめきアニメーションのみ ----
        const cell = document.getElementById(`sf-cell-${idx}`);
        if (cell) {
            cell.classList.remove('lit');
            cell.classList.add('tapped');                 // 専用アニメClass
            setTimeout(() => cell.classList.remove('tapped'), 200);
        }
        playHit();   // 効果音

        // カウント表示更新
        const countEl = document.querySelector('#sf-count strong');
        if (countEl) countEl.textContent = taps;

        currentCell = -1;

        // 自動消灯タイマーをキャンセルして即座に次フラッシュ
        clearTimeout(litTimeout);
        clearTimeout(flashTimeout);
        scheduleFlash(220);
    }

    /* ---------- 毎秒タイマー ---------- */
    function onTick() {
        timeLeft--;
        const el = document.getElementById('sf-time');
        if (el) el.textContent = `${timeLeft}びょう`;
        setTimerBar(timeLeft / GAME_DURATION);

        if (timeLeft <= 0) {
            endGame();
        }
    }

    /* ---------- タイマーバー更新 ---------- */
    function setTimerBar(ratio) {
        const bar = document.getElementById('g1-timer');
        if (bar) bar.style.width = `${Math.max(0, ratio * 100)}%`;
    }

    /* ---------- 次のフラッシュをスケジュール ---------- */
    function scheduleFlash(delay) {
        // 必ず既存タイマーをキャンセルしてから再設定（二重発火を防ぐ）
        clearTimeout(flashTimeout);
        const wait = delay !== undefined
            ? delay
            : FLASH_INTERVAL_MIN + Math.random() * (FLASH_INTERVAL_MAX - FLASH_INTERVAL_MIN);
        flashTimeout = setTimeout(flashRandomCell, wait);
    }

    /* ---------- ランダムなセルを光らせる ---------- */
    function flashRandomCell() {
        if (timeLeft <= 0) return;

        // 前のセルの litTimeout を必ずキャンセル（staleタイマーの多重発火を防ぐ）
        clearTimeout(litTimeout);

        // 前のセルが残っていれば消す
        if (currentCell >= 0) clearCell(currentCell);

        // 直前と同じセルが連続しないよう再抽選
        let newIdx;
        do {
            newIdx = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
        } while (newIdx === currentCell && GRID_SIZE * GRID_SIZE > 1);

        currentCell = newIdx;
        flashedAt   = Date.now();

        const cell = document.getElementById(`sf-cell-${newIdx}`);
        if (cell) cell.classList.add('lit');

        // LIT_DURATION 後に自動消灯（タップされなかった場合）
        // scheduleFlash は呼ばず、次フラッシュの予約は litTimeout の中だけで行う
        litTimeout = setTimeout(() => {
            if (currentCell === newIdx) {
                clearCell(newIdx);
                currentCell = -1;
                // ミス後は通常間隔（INTERVAL_MIN〜MAX）で次を出す（急加速しない）
                scheduleFlash();
            }
        }, LIT_DURATION);
    }

    /* ---------- セルを消す ---------- */
    function clearCell(idx) {
        const cell = document.getElementById(`sf-cell-${idx}`);
        if (cell) cell.classList.remove('lit', 'tapped');
    }

    /* ---------- ゲーム終了 ---------- */
    function endGame() {
        clearInterval(timerInterval);
        clearTimeout(flashTimeout);
        clearTimeout(litTimeout);
        timerInterval = null;
        flashTimeout  = null;
        litTimeout    = null;
        currentCell   = -1;

        const avgMs = reactionTimes.length > 0
            ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
            : 9999;

        App.saveResult('starflash', {
            taps:          taps,
            avgReactionMs: avgMs,
        });
    }

    /* ---------- 公開インターフェース ---------- */
    return { start };

})();

/* ====== ゲーム専用CSS ====== */
(function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* グリッド */
        .sf-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 7px;
            margin: 0 auto;
            max-width: 340px;
        }

        /* 通常セル */
        .sf-cell {
            aspect-ratio: 1;
            background: #ececec;
            border: none;
            border-radius: 12px;
            font-size: 1.15rem;
            cursor: pointer;
            transition: background 0.12s, opacity 0.12s;
            box-shadow: 0 3px 0 #c8c8c8;
            opacity: 0.28;
            touch-action: manipulation;
        }

        /* 光っているセル */
        .sf-cell.lit {
            background: #fff59d;
            opacity: 1;
            box-shadow: 0 0 14px rgba(255, 210, 0, 0.85), 0 3px 0 #c8a800;
            animation: sfPulse 0.45s ease infinite alternate;
        }

        @keyframes sfPulse {
            from { transform: scale(1.0); }
            to   { transform: scale(1.08); }
        }

        /* タップ成功時のフラッシュ */
        .sf-cell.tapped {
            background: #a5d6a7 !important;
            opacity: 1 !important;
            animation: sfTap 0.18s ease forwards;
        }

        @keyframes sfTap {
            0%   { transform: scale(1.18); }
            100% { transform: scale(1.0); }
        }

        /* 情報バー */
        .sf-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 1rem;
            font-weight: bold;
            color: #555;
            margin: 8px 0 10px;
        }
    `;
    document.head.appendChild(style);
})();
