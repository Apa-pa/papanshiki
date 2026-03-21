/* ============================================
   game4_animal_mot.js — アニマルついせき (MOT)
   光った3匹を覚えて、動き回った後どこにいるか当てる
   きおく・しゅうちゅうりょくを測定する
   ============================================ */

'use strict';

window.Game4 = (() => {

    /* ---------- 定数 ---------- */
    const NUM_ANIMALS    = 8;
    const NUM_TARGETS    = 3;
    const STAGES         = 3;
    const SHOW_DURATION  = 2200;  // ハイライト表示時間（ms）
    const MOVE_DURATION  = 5000;  // 移動時間（ms）
    const AREA_W         = 290;
    const AREA_H         = 200;
    const ANIMAL_SIZE    = 36;    // px
    const BASE_SPEED     = 1.8;   // 基本速度（px/frame）
    const SPEED_INC      = 0.4;   // ステージごとの加速

    /* ---------- キャラクターデータ ---------- */
    const ANIMALS = [
        { emoji: '🐿️', name: 'ヒー' },
        { emoji: '🦔', name: 'アン' },
        { emoji: '🐰', name: 'ウサギ' },
        { emoji: '🦊', name: 'キツネ' },
        { emoji: '🐹', name: 'ハムスター' },
        { emoji: '🐻', name: 'クマ' },
        { emoji: '🐼', name: 'パンダ' },
        { emoji: '🦝', name: 'アライグマ' },
    ];

    /* ---------- 状態変数 ---------- */
    let stage        = 0;
    let totalCorrect = 0;
    let totalPicks   = 0;
    let targets      = new Set();
    let positions    = [];
    let velocities   = [];
    let phase        = 'idle';
    let rafHandle    = null;
    let moveStart    = 0;
    let selected     = new Set();
    let audioCtx     = null;

    /* ---------- AudioContext ---------- */
    function getAudioCtx() {
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) {}
        }
        return audioCtx;
    }

    function playPop(freq = 660) {
        const ctx = getAudioCtx(); if (!ctx) return;
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.value = freq;
        g.gain.setValueAtTime(0.15, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(); osc.stop(ctx.currentTime + 0.12);
    }

    function playFanfare() {
        const ctx = getAudioCtx(); if (!ctx) return;
        [523, 659, 784].forEach((f, i) => {
            const osc = ctx.createOscillator(), g = ctx.createGain();
            osc.connect(g); g.connect(ctx.destination);
            osc.type = 'sine'; osc.frequency.value = f;
            g.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15);
            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 0.15);
        });
    }

    function playBuzz() {
        const ctx = getAudioCtx(); if (!ctx) return;
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'square'; osc.frequency.value = 200;
        g.gain.setValueAtTime(0.1, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
    }

    /* ---------- start ---------- */
    function start() {
        stage        = 0;
        totalCorrect = 0;
        totalPicks   = 0;

        App.setGameHTML(buildHTML());
        startStage();
    }

    /* ---------- UIのHTML生成 ---------- */
    function buildHTML() {
        const stageDots = Array.from({ length: STAGES }, (_, i) =>
            `<span class="mot-stage-dot" id="mot-sdot-${i}">○</span>`
        ).join('');

        return `
        <div class="mot-header">
            <div class="mot-stages">${stageDots}</div>
            <div id="mot-score">せいかい: 0 / 0</div>
        </div>
        <div id="mot-msg" class="mot-msg">スタート！</div>
        <div class="mot-area-wrap">
            <div class="mot-area" id="mot-area"></div>
        </div>
        <div id="mot-ctrl"></div>`;
    }

    /* ---------- ステージ開始 ---------- */
    function startStage() {
        phase     = 'show';
        selected  = new Set();
        const speed = BASE_SPEED + stage * SPEED_INC;

        // 重ならないように初期位置を設定
        positions  = [];
        velocities = [];
        for (let i = 0; i < NUM_ANIMALS; i++) {
            let pos, tries = 0;
            do {
                pos = {
                    x: ANIMAL_SIZE + Math.random() * (AREA_W - ANIMAL_SIZE * 2),
                    y: ANIMAL_SIZE + Math.random() * (AREA_H - ANIMAL_SIZE * 2),
                };
                tries++;
            } while (tries < 50 && positions.some(p => dist(p, pos) < ANIMAL_SIZE * 1.5));
            positions.push(pos);

            // 各キャラに速度を与える（方向はランダム、大きさはspeed）
            const angle = Math.random() * Math.PI * 2;
            velocities.push({
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
            });
        }

        // あたりをランダム選択
        targets = new Set();
        while (targets.size < NUM_TARGETS) {
            targets.add(Math.floor(Math.random() * NUM_ANIMALS));
        }

        updateStageDot(stage, 'current');
        setMsg(`おぼえて！あたりは ${NUM_TARGETS}ひき`, '#e3f2fd');
        setCtrl('');
        renderAnimals(true);  // ハイライト表示

        // SHOW_DURATION後に移動フェーズへ
        setTimeout(() => startMoving(speed), SHOW_DURATION);
    }

    /* ---------- 移動フェーズ ---------- */
    function startMoving(speed) {
        phase     = 'move';
        moveStart = performance.now();

        setMsg('ついせけ！👀', '#fff9c4');
        renderAnimals(false);  // ハイライト消す
        animateLoop(speed);
    }

    /* ---------- アニメーションループ ---------- */
    function animateLoop(speed) {
        if (phase !== 'move') return;

        const elapsed = performance.now() - moveStart;

        for (let i = 0; i < NUM_ANIMALS; i++) {
            positions[i].x += velocities[i].vx;
            positions[i].y += velocities[i].vy;

            // 壁反射
            if (positions[i].x < 4 || positions[i].x > AREA_W - ANIMAL_SIZE) {
                velocities[i].vx *= -1;
                // たまにランダムに少し変化
                if (Math.random() < 0.08) velocities[i].vy += (Math.random() - 0.5) * 0.5;
            }
            if (positions[i].y < 4 || positions[i].y > AREA_H - ANIMAL_SIZE) {
                velocities[i].vy *= -1;
                if (Math.random() < 0.08) velocities[i].vx += (Math.random() - 0.5) * 0.5;
            }

            // 速度の大きさをspeedに正規化（加速しすぎ防止）
            const mag = Math.sqrt(velocities[i].vx ** 2 + velocities[i].vy ** 2);
            if (mag > 0) {
                velocities[i].vx = (velocities[i].vx / mag) * speed;
                velocities[i].vy = (velocities[i].vy / mag) * speed;
            }
        }

        renderAnimals(false);

        if (elapsed < MOVE_DURATION) {
            rafHandle = requestAnimationFrame(() => animateLoop(speed));
        } else {
            startGuess();
        }
    }

    /* ---------- 解答フェーズ ---------- */
    function startGuess() {
        phase = 'guess';
        cancelAnimationFrame(rafHandle);
        renderAnimals(false);

        setMsg(`あたりだった${NUM_TARGETS}ひきをえらんでね！`, '#f3e5f5');
        setCtrl(`<button class="btn btn-accent" id="mot-ok-btn" disabled>これ！（${NUM_TARGETS}ひきえらぶ）</button>`);

        const okBtn = document.getElementById('mot-ok-btn');
        if (okBtn) okBtn.addEventListener('click', onConfirm);

        // キャラをポインタで選択できるように
        const area = document.getElementById('mot-area');
        if (area) area.addEventListener('pointerdown', onAnimalPointer);
    }

    /* ---------- キャラクタータップ ---------- */
    function onAnimalPointer(e) {
        if (phase !== 'guess') return;
        e.preventDefault();

        // ポインタ位置から最も近いキャラを選択
        const rect  = document.getElementById('mot-area').getBoundingClientRect();
        const px    = e.clientX - rect.left;
        const py    = e.clientY - rect.top;

        let closestIdx = -1, closestDist = ANIMAL_SIZE * 1.5;
        positions.forEach((pos, i) => {
            const cx = pos.x + ANIMAL_SIZE / 2;
            const cy = pos.y + ANIMAL_SIZE / 2;
            const d  = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
            if (d < closestDist) { closestDist = d; closestIdx = i; }
        });

        if (closestIdx < 0) return;

        if (selected.has(closestIdx)) {
            selected.delete(closestIdx);
            playPop(440);
        } else if (selected.size < NUM_TARGETS) {
            selected.add(closestIdx);
            playPop(660);
        }

        renderAnimals(false, true);

        const okBtn = document.getElementById('mot-ok-btn');
        if (okBtn) {
            okBtn.disabled = selected.size < NUM_TARGETS;
            okBtn.textContent = selected.size < NUM_TARGETS
                ? `これ！（あと${NUM_TARGETS - selected.size}ひき）`
                : 'これ！（かくてい）';
        }
    }

    /* ---------- 解答確定 ---------- */
    function onConfirm() {
        phase = 'feedback';
        const area = document.getElementById('mot-area');
        if (area) area.removeEventListener('pointerdown', onAnimalPointer);

        let stageCorrect = 0;
        selected.forEach(idx => { if (targets.has(idx)) stageCorrect++; });
        totalCorrect += stageCorrect;
        totalPicks   += NUM_TARGETS;

        const perfect = stageCorrect === NUM_TARGETS;
        renderAnimals(true); // 正解ハイライト
        perfect ? playFanfare() : playBuzz();

        const msg = perfect
            ? '🎉 パーフェクト！'
            : `${stageCorrect} / ${NUM_TARGETS} せいかい`;
        setMsg(msg, perfect ? '#c8e6c9' : '#ffcdd2');

        // スコア表示
        const scoreEl = document.getElementById('mot-score');
        if (scoreEl) scoreEl.textContent = `せいかい: ${totalCorrect} / ${totalPicks}`;

        updateStageDot(stage, perfect ? 'perfect' : stageCorrect > 0 ? 'partial' : 'wrong');
        setCtrl('');

        stage++;
        if (stage < STAGES) {
            setTimeout(startStage, 2000);
        } else {
            setTimeout(endGame, 2000);
        }
    }

    /* ---------- キャラクター描画 ---------- */
    function renderAnimals(showTargets, showSelected) {
        const area = document.getElementById('mot-area');
        if (!area) return;
        area.innerHTML = '';

        for (let i = 0; i < NUM_ANIMALS; i++) {
            const el = document.createElement('div');
            el.className   = 'mot-animal';
            el.dataset.idx = i;
            el.textContent = ANIMALS[i].emoji;
            el.style.left  = `${positions[i].x}px`;
            el.style.top   = `${positions[i].y}px`;

            if (showTargets && targets.has(i)) {
                el.classList.add('mot-target');
            }
            if (showSelected && selected.has(i)) {
                el.classList.add('mot-selected');
            }
            area.appendChild(el);
        }
    }

    /* ---------- ヘルパー ---------- */
    function dist(a, b) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }

    function setMsg(text, bg = '#e0f7fa') {
        const el = document.getElementById('mot-msg');
        if (el) { el.textContent = text; el.style.background = bg; }
    }

    function setCtrl(html) {
        const el = document.getElementById('mot-ctrl');
        if (el) el.innerHTML = html;
    }

    function updateStageDot(idx, state) {
        const dot = document.getElementById(`mot-sdot-${idx}`);
        if (!dot) return;
        dot.textContent = state === 'perfect' ? '⭐' : state === 'partial' ? '△' : state === 'wrong' ? '❌' : '▶';
        dot.style.color = state === 'perfect' ? '#f9a825' : state === 'partial' ? '#fb8c00' : state === 'wrong' ? '#e53935' : '#5c6bc0';
    }

    /* ---------- ゲーム終了 ---------- */
    function endGame() {
        cancelAnimationFrame(rafHandle);
        App.saveResult('animalMot', {
            correctRate:  totalPicks > 0 ? totalCorrect / totalPicks : 0,
            totalCorrect,
            totalPicks,
        });
    }

    return { start };

})();

/* ====== ゲーム専用CSS ====== */
(function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .mot-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.88rem;
            font-weight: bold;
            color: #555;
            margin-bottom: 6px;
        }
        .mot-stages { font-size: 1.3rem; letter-spacing: 6px; }
        .mot-msg {
            text-align: center;
            font-size: 0.95rem;
            font-weight: bold;
            color: #333;
            border-radius: 10px;
            padding: 7px;
            margin-bottom: 10px;
            min-height: 34px;
            transition: background 0.3s;
        }
        .mot-area-wrap {
            display: flex;
            justify-content: center;
            margin-bottom: 10px;
        }
        .mot-area {
            position: relative;
            width: 290px;
            height: 200px;
            background: linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%);
            border-radius: 16px;
            overflow: hidden;
            border: 2px solid #c8e6c9;
            touch-action: none;
        }
        .mot-animal {
            position: absolute;
            font-size: ${36}px;
            line-height: 1;
            cursor: pointer;
            user-select: none;
            transition: filter 0.15s;
        }
        .mot-animal.mot-target {
            filter: drop-shadow(0 0 8px gold) drop-shadow(0 0 4px orange);
            animation: motPulse 0.6s ease infinite alternate;
        }
        @keyframes motPulse {
            from { transform: scale(1); }
            to   { transform: scale(1.25); }
        }
        .mot-animal.mot-selected {
            filter: drop-shadow(0 0 8px #1e88e5);
            animation: motSelected 0.3s ease;
        }
        @keyframes motSelected {
            0%   { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
        #mot-ctrl { min-height: 50px; }
    `;
    document.head.appendChild(style);
})();
