/* ============================================
   labo3_game3_pairs.js — スピード神経衰弱（G3）
   開始前の全カード表向き表示（先行記憶）＋位置想起精度の測定
   ============================================ */

'use strict';

window.Labo3Game3 = (function () {

    const CARD_EMOJIS = [
        '🦁', '🐼', '🐨', '🦊', '🦒',
        '🐬', '🐧', '🦉', '🐝', '🐞',
        '🍉', '🍓', '🍇', '🍒', '🍑'
    ];

    // ステージ構成 (ペア数, 先行記憶秒数, グリッド列数)
    const STAGES = [
        { pairs: 3, previewSec: 3, cols: 3 },  // 6枚 (3x2)
        { pairs: 6, previewSec: 5, cols: 4 },  // 12枚 (4x3)
        { pairs: 10, previewSec: 8, cols: 5 }, // 20枚 (5x4)
        { pairs: 15, previewSec: 10, cols: 6 }, // 30枚 (6x5)
    ];

    const STATE = {
        stageIdx: 0,
        totalTimeLimitSec: 120,
        remainSec: 120,
        totalClearedPairs: 0,
        // 記憶想起の追跡
        seenCardIndexes: new Set(), // 過去にめくられたカード（先行記憶後は全カード既知として扱う）
        recallAttempts: 0,          // 記憶想起チャンスの回数
        recallSuccess: 0,           // 成功回数
        cards: [],                  // 現在ステージのカード配列 { id, emoji, matched }
        flippedIndices: [],         // 現在めくられているカードのインデックス (最大2枚)
        isPreviewing: false,
        isPlaying: false,
        timerIntervalId: null,
        timeoutIds: []
    };

    function clearAllTimers() {
        STATE.timeoutIds.forEach(id => clearTimeout(id));
        STATE.timeoutIds = [];
        if (STATE.timerIntervalId) {
            clearInterval(STATE.timerIntervalId);
            STATE.timerIntervalId = null;
        }
    }

    function addTimer(fn, ms) {
        const id = setTimeout(fn, ms);
        STATE.timeoutIds.push(id);
        return id;
    }

    function start() {
        clearAllTimers();
        STATE.stageIdx = 0;
        STATE.remainSec = STATE.totalTimeLimitSec;
        STATE.totalClearedPairs = 0;
        STATE.recallAttempts = 0;
        STATE.recallSuccess = 0;
        STATE.isPlaying = true;

        renderBaseHTML();
        startStage(0);

        // 全体タイマー開始
        STATE.timerIntervalId = setInterval(() => {
            if (!STATE.isPlaying) return;
            STATE.remainSec--;
            updateTimerDisplay();
            if (STATE.remainSec <= 0) {
                endGame('timeover');
            }
        }, 1000);
    }

    function renderBaseHTML() {
        const html = `
            <div id="m3-container" style="text-align:center; padding: 10px 0; max-width:440px; margin:0 auto;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div class="level-indicator" style="margin-bottom:0;">
                        <span id="m3-stage-text">ステージ 1</span>
                    </div>
                    <div style="font-size:1.15rem; font-weight:bold; color:#e65100; background:#fff3e0; padding:4px 12px; border-radius:12px; border:1px solid #ffcc80;">
                        ⏱ のこり <strong id="m3-timer-text">120</strong>びょう
                    </div>
                </div>

                <div id="m3-message" style="font-size:1.15rem; font-weight:bold; min-height:1.6em; margin-bottom:10px; color:var(--text-main);">
                    カードの位置を まばたきせずにおぼえてね！
                </div>

                <!-- カードグリッド盤面 -->
                <div id="m3-card-grid" style="
                    display: grid;
                    gap: 6px;
                    margin: 0 auto 12px auto;
                    background: #fff8e1;
                    padding: 8px;
                    border-radius: 16px;
                    border: 2px solid #ffe082;
                    min-height: 280px;
                    box-shadow: inset 0 2px 6px rgba(0,0,0,0.06);
                "></div>

                <!-- 先行記憶カウントダウン表示 -->
                <div id="m3-preview-banner" style="
                    display: none;
                    background: #ffecb3;
                    color: #d84315;
                    font-weight: bold;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 1rem;
                    animation: pulse 1s infinite;
                ">
                    👀 全開オープン中！あと <span id="m3-preview-sec">3</span>秒でおぼえて！
                </div>
            </div>
            <style>
                .pair-card {
                    background: #7986cb;
                    color: #fff;
                    border: 2px solid #5c6bc0;
                    border-radius: 10px;
                    font-size: 1.8rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 3px #3949ab;
                    aspect-ratio: 1 / 1.1;
                    transition: transform 0.15s ease, background 0.15s ease;
                    user-select: none;
                }
                .pair-card:active {
                    transform: translateY(2px);
                    box-shadow: 0 1px #3949ab;
                }
                .pair-card.flipped {
                    background: #fff !important;
                    border-color: #ff9800 !important;
                    box-shadow: 0 2px #f57c00 !important;
                    transform: scale(1.02);
                }
                .pair-card.matched {
                    background: #e8f5e9 !important;
                    border-color: #81c784 !important;
                    box-shadow: none !important;
                    opacity: 0.65;
                    cursor: default;
                }
                .pair-card.preview {
                    background: #fff !important;
                    border-color: #ba68c8 !important;
                }
            </style>
        `;
        App.setGameHTML(html);
    }

    function updateTimerDisplay() {
        const timerEl = document.getElementById('m3-timer-text');
        if (timerEl) timerEl.textContent = Math.max(0, STATE.remainSec);
    }

    function startStage(stageIdx) {
        if (!STATE.isPlaying || stageIdx >= STAGES.length) {
            endGame('all_cleared');
            return;
        }

        STATE.stageIdx = stageIdx;
        const config = STAGES[stageIdx];

        const stageText = document.getElementById('m3-stage-text');
        if (stageText) stageText.textContent = `ステージ ${stageIdx + 1} (${config.pairs}ペア)`;

        // カードデッキの準備
        const selectedEmojis = CARD_EMOJIS.slice(0, config.pairs);
        const deck = [];
        selectedEmojis.forEach((em, id) => {
            deck.push({ id, emoji: em, matched: false });
            deck.push({ id, emoji: em, matched: false });
        });

        // シャッフル
        STATE.cards = deck.sort(() => Math.random() - 0.5);
        STATE.flippedIndices = [];
        STATE.seenCardIndexes = new Set();

        renderGrid(config.cols);

        // ★先行記憶フェーズ開始：全カードを表向きにする
        runPreviewPhase(config.previewSec);
    }

    function renderGrid(cols) {
        const grid = document.getElementById('m3-card-grid');
        if (!grid) return;
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        let html = '';
        STATE.cards.forEach((card, idx) => {
            html += `<button class="pair-card l3-btn" data-idx="${idx}" onclick="Labo3Game3.flipCard(${idx})">❓</button>`;
        });
        grid.innerHTML = html;
    }

    function runPreviewPhase(seconds) {
        STATE.isPreviewing = true;
        const grid = document.getElementById('m3-card-grid');
        const banner = document.getElementById('m3-preview-banner');
        const secText = document.getElementById('m3-preview-sec');
        const msg = document.getElementById('m3-message');

        if (grid) grid.style.pointerEvents = 'none';
        if (banner) banner.style.display = 'inline-block';
        if (msg) msg.innerHTML = `いまのうちに <span style="color:#d84315;">ぜんぶの場所</span> をおぼえてね！`;

        // 全カードを表向きにする
        document.querySelectorAll('.pair-card').forEach((btn, idx) => {
            btn.classList.add('preview');
            btn.textContent = STATE.cards[idx].emoji;
        });

        // 全カードの位置を「一度見た」として登録
        for (let i = 0; i < STATE.cards.length; i++) {
            STATE.seenCardIndexes.add(i);
        }

        let remainPreview = seconds;
        if (secText) secText.textContent = remainPreview;

        const previewInterval = setInterval(() => {
            remainPreview--;
            if (secText) secText.textContent = remainPreview;
            if (remainPreview <= 0) {
                clearInterval(previewInterval);
                finishPreviewPhase();
            }
        }, 1000);
        STATE.timeoutIds.push(previewInterval);
    }

    function finishPreviewPhase() {
        STATE.isPreviewing = false;
        const grid = document.getElementById('m3-card-grid');
        const banner = document.getElementById('m3-preview-banner');
        const msg = document.getElementById('m3-message');

        if (banner) banner.style.display = 'none';

        // 全カードを裏返す
        document.querySelectorAll('.pair-card').forEach(btn => {
            btn.classList.remove('preview');
            btn.textContent = '❓';
        });

        if (msg) msg.textContent = 'スタート！ペアを見つけてめくろう！';
        if (grid) grid.style.pointerEvents = 'auto';
    }

    function flipCard(idx) {
        if (!STATE.isPlaying || STATE.isPreviewing) return;
        if (STATE.flippedIndices.length >= 2) return;
        if (STATE.flippedIndices.includes(idx)) return;
        if (STATE.cards[idx].matched) return;

        STATE.flippedIndices.push(idx);

        const cardBtn = document.querySelector(`.pair-card[data-idx="${idx}"]`);
        if (cardBtn) {
            cardBtn.classList.add('flipped');
            cardBtn.textContent = STATE.cards[idx].emoji;
        }

        // 2枚めくった時の判定
        if (STATE.flippedIndices.length === 2) {
            judgePair();
        }
    }

    function judgePair() {
        const [idx1, idx2] = STATE.flippedIndices;
        const card1 = STATE.cards[idx1];
        const card2 = STATE.cards[idx2];
        const isMatch = (card1.id === card2.id);

        // 先行記憶で全カードを見せているため、2枚目の選択は常に「記憶想起の試行」としてカウント
        STATE.recallAttempts++;
        if (isMatch) {
            STATE.recallSuccess++;
        }

        const btn1 = document.querySelector(`.pair-card[data-idx="${idx1}"]`);
        const btn2 = document.querySelector(`.pair-card[data-idx="${idx2}"]`);

        if (isMatch) {
            App.showFeedback('correct');
            card1.matched = true;
            card2.matched = true;
            STATE.totalClearedPairs++;

            addTimer(() => {
                if (btn1) { btn1.className = 'pair-card matched'; }
                if (btn2) { btn2.className = 'pair-card matched'; }
                STATE.flippedIndices = [];

                // ステージクリア判定
                const isStageComplete = STATE.cards.every(c => c.matched);
                if (isStageComplete) {
                    App.showFeedback('correct');
                    const msg = document.getElementById('m3-message');
                    if (msg) msg.innerHTML = `🎉 ステージ ${STATE.stageIdx + 1} クリア！`;
                    addTimer(() => {
                        startStage(STATE.stageIdx + 1);
                    }, 1400);
                }
            }, 400);

        } else {
            // 不一致 -> 0.8秒後に裏返し
            addTimer(() => {
                if (btn1) {
                    btn1.classList.remove('flipped');
                    btn1.textContent = '❓';
                }
                if (btn2) {
                    btn2.classList.remove('flipped');
                    btn2.textContent = '❓';
                }
                STATE.flippedIndices = [];
            }, 800);
        }
    }

    function endGame(reason) {
        STATE.isPlaying = false;
        clearAllTimers();

        const grid = document.getElementById('m3-card-grid');
        if (grid) grid.style.pointerEvents = 'none';

        const msg = document.getElementById('m3-message');
        if (msg) {
            msg.textContent = (reason === 'timeover') ? '⏰ タイムアップ！' : '🏆 全ステージ完全制覇！！';
        }

        const accuracy = STATE.recallAttempts > 0
            ? (STATE.recallSuccess / STATE.recallAttempts)
            : 0;

        addTimer(() => {
            App.saveResult('pairs', {
                clearedPairs: STATE.totalClearedPairs,
                accuracy: accuracy
            });
        }, 1500);
    }

    return { start, flipCard };
})();
