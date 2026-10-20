/* ============================================
   labo3_game2_route.js — ピカピカ・ルート（G2）
   場所記憶（空間）と順序記憶の測定
   ============================================ */

'use strict';

window.Labo3Game2 = (function () {

    const STATE = {
        level: 3,         // 現在の光るマス数
        maxLevel: 10,     // 上限マス数
        missCountInLevel: 0,
        route: [],        // 光ったセルのインデックス配列
        userSteps: [],    // ユーザーがタップしたセルのインデックス配列
        maxSpace: 0,      // 場所を全部当てられた最高マス数
        maxOrder: 0,      // 順番まで全部当てられた最高マス数
        isPlaying: false,
        isShowing: false,
        timeoutIds: []
    };

    function clearAllTimers() {
        STATE.timeoutIds.forEach(id => clearTimeout(id));
        STATE.timeoutIds = [];
    }

    function addTimer(fn, ms) {
        const id = setTimeout(fn, ms);
        STATE.timeoutIds.push(id);
        return id;
    }

    function start() {
        clearAllTimers();
        STATE.level = 3;
        STATE.maxLevel = 10;
        STATE.missCountInLevel = 0;
        STATE.maxSpace = 0;
        STATE.maxOrder = 0;
        STATE.isPlaying = true;

        renderBaseHTML();
        addTimer(startTrial, 1200);
    }

    function renderBaseHTML() {
        let gridHtml = '';
        for (let i = 0; i < 25; i++) {
            gridHtml += `<button class="route-cell l3-btn" data-idx="${i}" onclick="Labo3Game2.tapCell(${i})"></button>`;
        }

        const html = `
            <div id="r2-container" style="text-align:center; padding: 10px 0; max-width:400px; margin:0 auto;">
                <div class="level-indicator">
                    <span>ルートのながさ: <strong id="r2-level-text">3マス</strong></span>
                    <div class="dots">
                        <span class="dot" id="r2-dot-1"></span>
                        <span class="dot" id="r2-dot-2"></span>
                    </div>
                </div>

                <div id="r2-message" style="font-size:1.15rem; font-weight:bold; min-height:1.6em; margin-bottom:12px; color:var(--text-main);">
                    光るじゅんばんを よくおぼえてね！
                </div>

                <!-- 5x5 グリッド -->
                <div id="r2-grid" style="
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 8px;
                    width: 320px;
                    height: 320px;
                    margin: 0 auto 15px auto;
                    background: #e0f2f1;
                    padding: 10px;
                    border-radius: 20px;
                    box-shadow: inset 0 3px 8px rgba(0,0,0,0.08);
                    pointer-events: none;
                ">
                    ${gridHtml}
                </div>

                <div id="r2-status" style="font-size:0.95rem; color:#00796b; font-weight:bold; min-height:1.4em;">
                    のこり: 3マス
                </div>
            </div>
            <style>
                .route-cell {
                    background: #fff;
                    border: 2px solid #b2dfdb;
                    border-radius: 12px;
                    box-shadow: 0 3px #80cbc4;
                    position: relative;
                }
                .route-cell:active {
                    box-shadow: 0 1px #80cbc4;
                    transform: translateY(2px);
                }
                .route-cell.highlight {
                    background: #ffeb3b !important;
                    border-color: #fbc02d !important;
                    box-shadow: 0 0 15px #fbc02d !important;
                    transform: scale(1.08);
                    z-index: 5;
                }
                .route-cell.tapped {
                    background: #80deea !important;
                    border-color: #00acc1 !important;
                }
                .route-cell.correct-cell {
                    background: #a5d6a7 !important;
                    border-color: #43a047 !important;
                }
                .route-cell.wrong-cell {
                    background: #ef9a9a !important;
                    border-color: #e53935 !important;
                }
                .route-step-badge {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 1.1rem;
                    font-weight: bold;
                    color: #004d40;
                }
            </style>
        `;
        App.setGameHTML(html);
    }

    function generateRoute(length) {
        const arr = [];
        // 重複なしでランダムにセルを選ぶ
        const pool = Array.from({ length: 25 }, (_, i) => i);
        for (let i = 0; i < length; i++) {
            const randIdx = Math.floor(Math.random() * pool.length);
            arr.push(pool.splice(randIdx, 1)[0]);
        }
        return arr;
    }

    function startTrial() {
        if (!STATE.isPlaying) return;

        STATE.userSteps = [];
        STATE.isShowing = true;
        STATE.route = generateRoute(STATE.level);

        updateIndicator();
        resetGridVisuals();

        const grid = document.getElementById('r2-grid');
        const msg = document.getElementById('r2-message');
        const status = document.getElementById('r2-status');

        if (grid) grid.style.pointerEvents = 'none';
        if (msg) msg.textContent = 'じっと見てね... ピカッと光るよ！';
        if (status) status.textContent = `ぜんぶで ${STATE.level}マス 光るよ`;

        // 1秒待ってから順番に光らせる
        addTimer(() => {
            let step = 0;
            function showNext() {
                if (step < STATE.route.length) {
                    const cellIdx = STATE.route[step];
                    const cellBtn = document.querySelector(`.route-cell[data-idx="${cellIdx}"]`);
                    if (cellBtn) {
                        cellBtn.classList.add('highlight');
                    }

                    // 0.55秒点灯
                    addTimer(() => {
                        if (cellBtn) cellBtn.classList.remove('highlight');
                        step++;
                        // 0.25秒空けて次へ
                        addTimer(showNext, 250);
                    }, 550);
                } else {
                    // 全マス点灯終了 -> タップ受付開始
                    STATE.isShowing = false;
                    if (grid) grid.style.pointerEvents = 'auto';
                    if (msg) msg.textContent = '光ったじゅんばんに タップしてね！';
                    updateStatusText();
                }
            }
            showNext();
        }, 1000);
    }

    function updateIndicator() {
        const levelText = document.getElementById('r2-level-text');
        if (levelText) levelText.textContent = `${STATE.level}マス`;

        const dot1 = document.getElementById('r2-dot-1');
        const dot2 = document.getElementById('r2-dot-2');
        if (dot1 && dot2) {
            dot1.className = STATE.missCountInLevel >= 1 ? 'dot active' : 'dot';
            dot2.className = STATE.missCountInLevel >= 2 ? 'dot active' : 'dot';
        }
    }

    function updateStatusText() {
        const status = document.getElementById('r2-status');
        if (!status) return;
        const remain = STATE.level - STATE.userSteps.length;
        status.textContent = `のこり: ${remain}マス`;
    }

    function resetGridVisuals() {
        document.querySelectorAll('.route-cell').forEach(cell => {
            cell.className = 'route-cell l3-btn';
            cell.innerHTML = '';
        });
    }

    function tapCell(idx) {
        if (!STATE.isPlaying || STATE.isShowing) return;
        // 既に同じマスをタップしている場合は重複防止
        if (STATE.userSteps.includes(idx)) return;

        STATE.userSteps.push(idx);
        const cell = document.querySelector(`.route-cell[data-idx="${idx}"]`);
        if (cell) {
            cell.classList.add('tapped');
            cell.innerHTML = `<span class="route-step-badge">${STATE.userSteps.length}</span>`;
        }

        updateStatusText();

        if (STATE.userSteps.length === STATE.level) {
            judgeTrial();
        }
    }

    function judgeTrial() {
        const grid = document.getElementById('r2-grid');
        if (grid) grid.style.pointerEvents = 'none';

        // 1. 順番まで完全一致しているか判定
        let orderMatchCount = 0;
        for (let i = 0; i < STATE.level; i++) {
            if (STATE.userSteps[i] === STATE.route[i]) {
                orderMatchCount++;
            }
        }
        const isOrderPerfect = (orderMatchCount === STATE.level);

        // 2. 場所が合っていた数（順番無視）
        let spaceMatchCount = 0;
        STATE.userSteps.forEach(idx => {
            if (STATE.route.includes(idx)) {
                spaceMatchCount++;
            }
        });
        const isSpacePerfect = (spaceMatchCount === STATE.level);

        // 正解マスと不正解マスの色分け表示
        document.querySelectorAll('.route-cell').forEach(cell => {
            const idx = parseInt(cell.getAttribute('data-idx'), 10);
            const inRoute = STATE.route.includes(idx);
            const userTapOrder = STATE.userSteps.indexOf(idx);

            if (inRoute) {
                const correctOrder = STATE.route.indexOf(idx) + 1;
                cell.className = 'route-cell correct-cell';
                cell.innerHTML = `<span class="route-step-badge">正:${correctOrder}</span>`;
            } else if (userTapOrder !== -1) {
                cell.className = 'route-cell wrong-cell';
                cell.innerHTML = `<span class="route-step-badge">✕</span>`;
            }
        });

        const msg = document.getElementById('r2-message');

        if (isSpacePerfect) {
            STATE.maxSpace = Math.max(STATE.maxSpace, STATE.level);
        }

        if (isOrderPerfect) {
            App.showFeedback('correct');
            STATE.maxOrder = Math.max(STATE.maxOrder, STATE.level);
            msg.innerHTML = `<span style="color:#2e7d32;">かんぺき大正解！！順番もバッチリ！</span>`;

            STATE.missCountInLevel = 0;
            STATE.level++;

            if (STATE.level > STATE.maxLevel) {
                endGame();
            } else {
                addTimer(startTrial, 1800);
            }

        } else {
            App.showFeedback('wrong');
            STATE.missCountInLevel++;

            if (isSpacePerfect) {
                msg.innerHTML = `<span style="color:#f57c00;">場所は全部あってた！順番が惜しかった！</span>`;
            } else {
                msg.innerHTML = `<span style="color:#c62828;">おしい！緑のマスが正解ルートだよ</span>`;
            }

            if (STATE.missCountInLevel >= 2) {
                // 2回ミスで終了
                addTimer(endGame, 2000);
            } else {
                addTimer(() => {
                    msg.textContent = 'もういちど 同じマス数に ちょうせん！';
                    addTimer(startTrial, 1200);
                }, 1800);
            }
        }
    }

    function endGame() {
        STATE.isPlaying = false;
        clearAllTimers();
        const msg = document.getElementById('r2-message');
        if (msg) msg.textContent = 'そくてい 終了！';

        addTimer(() => {
            App.saveResult('route', {
                maxSpace: STATE.maxSpace,
                maxOrder: STATE.maxOrder
            });
        }, 1200);
    }

    return { start, tapCell };
})();
