/* ============================================
   game5_timing.js — シャッターチャンス
   猛スピードで走るキャラをカメラ枠でパシャリ！
   タイミング・どうたいしりょくを測定する
   ============================================ */

'use strict';

window.Game5 = (() => {

    /* ---------- 定数 ---------- */
    const SHOTS       = 5;
    const TRACK_W     = 300;
    const TRACK_H     = 72;
    const CHAR_W      = 44;
    const FRAME_W     = 70;
    const FRAME_CX    = TRACK_W / 2;   // フレーム中心X
    const BASE_SPEED  = 180;           // px/秒
    const SPEED_STEP  = 45;            // ショットごとの加速
    const WAIT_MIN    = 400;           // 走り出す前の最小待機ms
    const WAIT_MAX    = 1400;          // 走り出す前の最大待機ms

    /* ---------- キャラデータ ---------- */
    const CHARS = ['🐿️', '🦔', '🐻', '🐰', '🦊'];

    /* ---------- 状態変数 ---------- */
    let shotsDone  = 0;
    let offsets    = [];
    let charX      = 0;
    let dir        = 1;
    let speed      = BASE_SPEED;
    let lastTime   = 0;
    let rafHandle  = null;
    let waitHandle = null;
    let running    = false;
    let canShoot   = false;
    let audioCtx   = null;

    /* ---------- AudioContext ---------- */
    function getAudioCtx() {
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) {}
        }
        return audioCtx;
    }

    function playShutter() {
        const ctx = getAudioCtx(); if (!ctx) return;
        // シャッター音：カチッ（短いホワイトノイズ風）
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3));
        }
        const src = ctx.createBufferSource();
        const g   = ctx.createGain();
        src.buffer = buf;
        src.connect(g); g.connect(ctx.destination);
        g.gain.value = 0.4;
        src.start();
    }

    function playMiss() {
        const ctx = getAudioCtx(); if (!ctx) return;
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'sawtooth'; osc.frequency.value = 250;
        g.gain.setValueAtTime(0.08, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
    }

    function playPerfect() {
        const ctx = getAudioCtx(); if (!ctx) return;
        [784, 1047].forEach((f, i) => {
            const osc = ctx.createOscillator(), g = ctx.createGain();
            osc.connect(g); g.connect(ctx.destination);
            osc.type = 'sine'; osc.frequency.value = f;
            g.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.15);
            osc.start(ctx.currentTime + i * 0.08);
            osc.stop(ctx.currentTime + i * 0.08 + 0.15);
        });
    }

    /* ---------- start ---------- */
    function start() {
        shotsDone = 0;
        offsets   = [];
        speed     = BASE_SPEED;

        App.setGameHTML(buildHTML());
        attachEvents();
        nextShot();
    }

    /* ---------- UIのHTML生成 ---------- */
    function buildHTML() {
        const dots = Array.from({ length: SHOTS }, (_, i) =>
            `<span class="timing-dot" id="timing-dot-${i}">📷</span>`
        ).join('');

        const frameLeft = FRAME_CX - FRAME_W / 2;

        return `
        <div class="timing-header">
            <div class="timing-dots">${dots}</div>
            <div id="timing-best">へいきん: --</div>
        </div>
        <div id="timing-msg" class="timing-msg">よーい…</div>

        <!-- トラック全体 -->
        <div class="timing-track-wrap">
            <div class="timing-track" id="timing-track"
                 style="width:${TRACK_W}px; height:${TRACK_H}px;">
                <!-- カメラ枠 -->
                <div class="timing-frame" id="timing-frame"
                     style="left:${frameLeft}px; width:${FRAME_W}px; height:${TRACK_H}px;"></div>
                <!-- 角マーカー（フレームの四隅）-->
                <div class="timing-corner tl" style="left:${frameLeft}px;"></div>
                <div class="timing-corner tr" style="left:${frameLeft + FRAME_W - 10}px;"></div>
                <div class="timing-corner bl" style="left:${frameLeft}px; bottom:0;"></div>
                <div class="timing-corner br" style="left:${frameLeft + FRAME_W - 10}px; bottom:0;"></div>
                <!-- キャラクター -->
                <div class="timing-char" id="timing-char"></div>
            </div>
        </div>

        <!-- 判定バー（フレームとの重なり具合） -->
        <div class="timing-overlap-bar-wrap">
            <div class="timing-overlap-label">📷 センター</div>
            <div class="timing-overlap-bar" id="timing-overlap-bar"></div>
        </div>

        <!-- 結果テキスト -->
        <div id="timing-result-text" class="timing-result-text"></div>

        <button class="btn btn-accent" id="timing-shutter-btn">
            📷 シャッター！
        </button>`;
    }

    /* ---------- イベント ---------- */
    function attachEvents() {
        const btn = document.getElementById('timing-shutter-btn');
        if (!btn) return;
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            onShoot();
        });
    }

    /* ---------- 次のショット ---------- */
    function nextShot() {
        running  = false;
        canShoot = false;

        const char = document.getElementById('timing-char');
        if (char) char.style.opacity = '0';

        const btn = document.getElementById('timing-shutter-btn');
        if (btn) btn.disabled = true;

        const msg = document.getElementById('timing-msg');
        if (msg) msg.textContent = `ショット ${shotsDone + 1} / ${SHOTS}  よーい…`;

        resetOverlapBar();

        // ランダム方向から登場
        dir   = Math.random() < 0.5 ? 1 : -1;
        charX = dir === 1 ? -CHAR_W : TRACK_W + CHAR_W;

        const wait = WAIT_MIN + Math.random() * (WAIT_MAX - WAIT_MIN);
        waitHandle = setTimeout(startRun, wait);
    }

    /* ---------- 走り出す ---------- */
    function startRun() {
        running  = true;
        canShoot = true;

        const char = document.getElementById('timing-char');
        if (char) {
            char.textContent  = CHARS[shotsDone % CHARS.length];
            char.style.opacity = '1';
            char.style.transform = dir === -1 ? 'scaleX(-1)' : 'none';
        }

        const btn = document.getElementById('timing-shutter-btn');
        if (btn) btn.disabled = false;

        const msg = document.getElementById('timing-msg');
        if (msg) msg.textContent = '📷 シャッターを切れ！';

        lastTime  = performance.now();
        rafHandle = requestAnimationFrame(animateChar);
    }

    /* ---------- キャラアニメーション ---------- */
    function animateChar(now) {
        if (!running) return;

        const dt = (now - lastTime) / 1000;
        lastTime = now;
        charX   += dir * speed * dt;

        const char = document.getElementById('timing-char');
        if (char) char.style.left = `${charX}px`;

        // 判定バー更新（視覚的フィードバック）
        const charCX  = charX + CHAR_W / 2;
        const dist    = Math.abs(charCX - FRAME_CX);
        updateOverlapBar(dist);

        // 画面外に出たらミス
        if (charX > TRACK_W + CHAR_W * 2 || charX < -CHAR_W * 3) {
            onMiss();
            return;
        }

        rafHandle = requestAnimationFrame(animateChar);
    }

    /* ---------- シャッターを切る ---------- */
    function onShoot() {
        if (!canShoot || !running) return;
        canShoot = false;
        running  = false;
        cancelAnimationFrame(rafHandle);

        const charCX  = charX + CHAR_W / 2;
        const offset  = Math.abs(charCX - FRAME_CX);
        offsets.push(offset);

        const inFrame = offset <= FRAME_W / 2;

        // シャッター音
        if (inFrame) playPerfect();
        playShutter();

        // 結果表示
        const resultText = document.getElementById('timing-result-text');
        if (resultText) {
            const pct = Math.max(0, Math.round((1 - offset / (FRAME_W * 0.8)) * 100));
            resultText.textContent = inFrame
                ? `🎉 ${pct}% センター！`
                : `もう少し！（ズレ：${Math.round(offset)}px）`;
            resultText.style.color = inFrame ? '#2e7d32' : '#e65100';
        }

        // キャラ演出
        const char = document.getElementById('timing-char');
        if (char) char.style.filter = 'brightness(3)';
        setTimeout(() => { if (char) char.style.filter = ''; }, 200);

        recordDot(shotsDone, offset);
        updateBest();

        shotsDone++;
        speed += SPEED_STEP;

        const btn = document.getElementById('timing-shutter-btn');
        if (btn) btn.disabled = true;

        if (shotsDone < SHOTS) {
            setTimeout(nextShot, 1500);
        } else {
            setTimeout(endGame, 1500);
        }
    }

    /* ---------- 画面外に出た ---------- */
    function onMiss() {
        running  = false;
        canShoot = false;
        offsets.push(999);
        playMiss();

        const resultText = document.getElementById('timing-result-text');
        if (resultText) {
            resultText.textContent = 'にがした！💦';
            resultText.style.color = '#c62828';
        }

        recordDot(shotsDone, 999);

        shotsDone++;
        speed += SPEED_STEP;

        if (shotsDone < SHOTS) {
            setTimeout(nextShot, 1200);
        } else {
            setTimeout(endGame, 1200);
        }
    }

    /* ---------- 判定バー更新 ---------- */
    function updateOverlapBar(dist) {
        const bar = document.getElementById('timing-overlap-bar');
        if (!bar) return;
        // dist=0で100%、FRAME_W/2を超えると0%
        const ratio = Math.max(0, 1 - dist / (FRAME_W * 0.8));
        bar.style.width = `${ratio * 100}%`;
        bar.style.background = ratio > 0.7
            ? '#43a047'
            : ratio > 0.35 ? '#fb8c00' : '#e53935';
    }

    function resetOverlapBar() {
        const bar = document.getElementById('timing-overlap-bar');
        if (bar) { bar.style.width = '0%'; }
        const txt = document.getElementById('timing-result-text');
        if (txt) txt.textContent = '';
    }

    /* ---------- ドット更新 ---------- */
    function recordDot(idx, offset) {
        const dot = document.getElementById(`timing-dot-${idx}`);
        if (!dot) return;
        dot.textContent = offset <= FRAME_W / 2 ? '✅' : offset < 999 ? '🟡' : '❌';
    }

    /* ---------- 平均オフセット表示 ---------- */
    function updateBest() {
        const valid = offsets.filter(v => v < 999);
        if (!valid.length) return;
        const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
        const el  = document.getElementById('timing-best');
        if (el) el.textContent = `へいきん: ${Math.round(avg)}px`;
    }

    /* ---------- ゲーム終了 ---------- */
    function endGame() {
        clearTimeout(waitHandle);
        cancelAnimationFrame(rafHandle);

        const valid = offsets.filter(v => v < 999);
        const avg   = valid.length > 0
            ? valid.reduce((a, b) => a + b, 0) / valid.length
            : 999;

        App.saveResult('timing', {
            avgOffset: Math.round(avg),
            shots:     SHOTS,
            offsets,
        });
    }

    return { start };

})();

/* ====== ゲーム専用CSS ====== */
(function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .timing-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.88rem;
            font-weight: bold;
            color: #555;
            margin-bottom: 6px;
        }
        .timing-dots { font-size: 1.1rem; letter-spacing: 3px; }
        .timing-msg {
            text-align: center;
            font-size: 0.95rem;
            font-weight: bold;
            color: #333;
            background: #fce4ec;
            border-radius: 10px;
            padding: 6px;
            margin-bottom: 10px;
        }

        /* トラック */
        .timing-track-wrap {
            display: flex;
            justify-content: center;
            margin-bottom: 8px;
        }
        .timing-track {
            position: relative;
            background: linear-gradient(180deg, #e8eaf6 0%, #c5cae9 100%);
            border-radius: 12px;
            overflow: hidden;
            border: 2px solid #9fa8da;
        }

        /* カメラ枠 */
        .timing-frame {
            position: absolute;
            top: 0;
            border: 3px solid #ec407a;
            border-radius: 4px;
            background: rgba(236, 64, 122, 0.07);
            pointer-events: none;
            z-index: 3;
        }

        /* 四隅マーカー */
        .timing-corner {
            position: absolute;
            width: 10px; height: 10px;
            border-color: #ec407a;
            border-style: solid;
            z-index: 4;
            pointer-events: none;
        }
        .timing-corner.tl { border-width: 3px 0 0 3px; top: 0; }
        .timing-corner.tr { border-width: 3px 3px 0 0; top: 0; }
        .timing-corner.bl { border-width: 0 0 3px 3px; }
        .timing-corner.br { border-width: 0 3px 3px 0; }

        /* キャラクター */
        .timing-char {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            font-size: 2.6rem;
            line-height: 1;
            z-index: 2;
            transition: filter 0.15s;
        }

        /* 判定バー */
        .timing-overlap-bar-wrap {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            padding: 0 4px;
        }
        .timing-overlap-label {
            font-size: 0.7rem;
            color: #888;
            white-space: nowrap;
        }
        .timing-overlap-bar {
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            width: 0%;
            transition: width 0.05s, background 0.1s;
            flex: 1;
        }

        /* 結果テキスト */
        .timing-result-text {
            text-align: center;
            font-size: 1rem;
            font-weight: bold;
            min-height: 22px;
            margin-bottom: 10px;
        }
    `;
    document.head.appendChild(style);
})();
