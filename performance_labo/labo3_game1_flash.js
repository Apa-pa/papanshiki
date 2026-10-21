/* ============================================
   labo3_game1_flash.js — フラッシュキャッチ（G1）
   一瞬の映像をカメラのように焼き付ける力（瞬間記憶）
   ============================================ */

'use strict';

window.Labo3Game1 = (function () {

    // 紛らわしいペアを含む絵文字プール
    const EMOJI_PAIRS = [
        ['🍎', '🍅'], // リンゴとトマト
        ['🐶', '🐺'], // イヌとオオカミ
        ['🐱', '🐯'], // ネコとトラ
        ['🚗', '🚙'], // 赤い車とSUV
        ['🍌', '🌙'], // バナナと三日月
        ['⚽', '⚾'], // サッカーと野球
        ['🍓', '🍒'], // イチゴとサクランボ
        ['🌻', '🌼'], // ヒマワリと花
        ['🐰', '🐹'], // ウサギとハムスター
        ['✈️', '🚀'], // 飛行機とロケット
        ['🍇', '🫐'], // ブドウとブルーベリー
        ['🐸', '🐢'], // カエルとカメ
        ['🍩', '🍪'], // ドーナツとクッキー
        ['⭐', '✨'], // 星とキラキラ
        ['🍙', '🍣'], // おにぎりと寿司
    ];

    const STATE = {
        level: 2,         // 現在の表示絵文字数 (2〜10)
        maxLevel: 10,     // 上限
        missCountInLevel: 0,
        maxClearedLevel: 0,
        targetEmojis: [], // 表示された絵文字配列
        options: [],      // 選択肢絵文字配列
        selected: [],     // ユーザーが選んだ絵文字
        isPlaying: false,
        isFlashing: false,
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
        STATE.level = 2;
        STATE.maxLevel = 10;
        STATE.missCountInLevel = 0;
        STATE.maxClearedLevel = 0;
        STATE.isPlaying = true;

        renderBaseHTML();
        addTimer(startTrial, 1000);
    }

    function renderBaseHTML() {
        const html = `
            <div id="f1-container" style="text-align:center; padding: 10px 0; max-width:420px; margin:0 auto;">
                <div class="level-indicator">
                    <span>おぼえる数: <strong id="f1-level-text">2こ</strong></span>
                    <div class="dots">
                        <span class="dot" id="f1-dot-1"></span>
                        <span class="dot" id="f1-dot-2"></span>
                    </div>
                </div>

                <div id="f1-message" style="font-size:1.15rem; font-weight:bold; min-height:1.6em; margin-bottom:12px; color:var(--text-main);">
                    一瞬だけ出る絵を しっかりおぼえてね！
                </div>

                <!-- フラッシュ表示ステージ (1秒だけ絵が出る) -->
                <div id="f1-stage" style="
                    background: #f3e5f5;
                    border: 3px dashed #ba68c8;
                    border-radius: 20px;
                    min-height: 120px;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 15px;
                    margin-bottom: 15px;
                    box-shadow: inset 0 3px 6px rgba(0,0,0,0.05);
                "></div>

                <!-- 選択エリア (回答用) -->
                <div id="f1-select-area" style="display:none;">
                    <div style="font-size:0.95rem; color:#6a1b9a; font-weight:bold; margin-bottom:8px;">
                        さっき出たものを <span style="color:#d81b60;">ぜんぶえらんで</span>「けってい」を押してね！
                    </div>
                    <div id="f1-options-grid" style="
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 10px;
                        margin-bottom: 15px;
                    "></div>

                    <button class="btn btn-accent l3-btn" style="font-size:1.2rem; padding:12px 35px; border-radius:50px;" onclick="Labo3Game1.submit()">
                        ✨ けってい！ (<span id="f1-selected-count">0</span>こ えらんだ)
                    </button>
                </div>
            </div>
            <style>
                .flash-item {
                    font-size: 2.8rem;
                    animation: popIn 0.2s ease;
                }
                .option-btn {
                    background: #fff;
                    border: 2px solid #ce93d8;
                    border-radius: 14px;
                    font-size: 2.2rem;
                    padding: 10px 0;
                    box-shadow: 0 4px #ba68c8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .option-btn:active {
                    box-shadow: 0 1px #ba68c8;
                    transform: translateY(3px);
                }
                .option-btn.selected {
                    background: #e1bee7 !important;
                    border-color: #8e24aa !important;
                    box-shadow: 0 2px #6a1b9a !important;
                    transform: scale(0.96);
                }
                .option-btn.selected::after {
                    content: "✔";
                    position: absolute;
                    top: 2px;
                    right: 4px;
                    font-size: 1rem;
                    color: #4a148c;
                    font-weight: bold;
                }
                .option-btn.correct-reveal {
                    background: #c8e6c9 !important;
                    border-color: #43a047 !important;
                }
                .option-btn.wrong-reveal {
                    background: #ffcdd2 !important;
                    border-color: #e53935 !important;
                }
            </style>
        `;
        App.setGameHTML(html);
    }

    function setupTrialData() {
        // ペアをシャッフル
        const shuffledPairs = [...EMOJI_PAIRS].sort(() => Math.random() - 0.5);
        const selectedPairs = shuffledPairs.slice(0, STATE.level);

        STATE.targetEmojis = [];
        const dummyCandidates = [];

        selectedPairs.forEach(pair => {
            if (Math.random() > 0.5) {
                STATE.targetEmojis.push(pair[0]);
                dummyCandidates.push(pair[1]);
            } else {
                STATE.targetEmojis.push(pair[1]);
                dummyCandidates.push(pair[0]);
            }
        });

        // 選択肢の作成（正解 + 紛らわしいダミー + 余分なダミー、最低8個〜最大16個に調整）
        const optionPool = [...STATE.targetEmojis, ...dummyCandidates];

        // 余白があれば追加ペアから補充（最低8個は確保して選びがいを作る）
        const targetOptionCount = Math.min(16, Math.max(8, STATE.level * 2));
        let extraIdx = STATE.level;
        while (optionPool.length < targetOptionCount && extraIdx < shuffledPairs.length) {
            optionPool.push(shuffledPairs[extraIdx][0]);
            extraIdx++;
        }

        STATE.options = optionPool.sort(() => Math.random() - 0.5);
        STATE.selected = [];
    }

    function startTrial() {
        if (!STATE.isPlaying) return;

        STATE.isFlashing = true;
        setupTrialData();
        updateIndicator();

        const stage = document.getElementById('f1-stage');
        const msg = document.getElementById('f1-message');
        const selectArea = document.getElementById('f1-select-area');

        if (selectArea) selectArea.style.display = 'none';
        if (stage) stage.innerHTML = '<div style="font-size:1.4rem; color:#888;">３...</div>';
        if (msg) msg.textContent = 'よく見てね... パッと出るよ！';

        addTimer(() => {
            if (stage) stage.innerHTML = '<div style="font-size:1.8rem; color:#ab47bc; font-weight:bold;">パッ！</div>';

            addTimer(() => {
                // ターゲット絵文字のフラッシュ表示 (1.0秒)
                if (stage) {
                    let itemsHtml = '';
                    STATE.targetEmojis.forEach(em => {
                        itemsHtml += `<span class="flash-item">${em}</span>`;
                    });
                    stage.innerHTML = itemsHtml;
                }

                addTimer(() => {
                    // かくす
                    if (stage) {
                        stage.innerHTML = '<div style="font-size:2.5rem; color:#aaa;">？</div>';
                    }
                    STATE.isFlashing = false;
                    renderOptions();
                    if (selectArea) selectArea.style.display = 'block';
                    if (msg) msg.textContent = 'いま出たものを えらんでね！';
                }, 1000); // 1.0秒間表示

            }, 600);
        }, 700);
    }

    function updateIndicator() {
        const levelText = document.getElementById('f1-level-text');
        if (levelText) levelText.textContent = `${STATE.level}こ`;

        const dot1 = document.getElementById('f1-dot-1');
        const dot2 = document.getElementById('f1-dot-2');
        if (dot1 && dot2) {
            dot1.className = STATE.missCountInLevel >= 1 ? 'dot active' : 'dot';
            dot2.className = STATE.missCountInLevel >= 2 ? 'dot active' : 'dot';
        }
    }

    function renderOptions() {
        const grid = document.getElementById('f1-options-grid');
        if (!grid) return;
        let html = '';
        STATE.options.forEach((em, idx) => {
            html += `<button class="option-btn l3-btn" data-em="${em}" onclick="Labo3Game1.toggleOption('${em}')">${em}</button>`;
        });
        grid.innerHTML = html;
        updateSelectedCountText();
    }

    function toggleOption(em) {
        if (!STATE.isPlaying || STATE.isFlashing) return;
        const idx = STATE.selected.indexOf(em);
        if (idx !== -1) {
            STATE.selected.splice(idx, 1);
        } else {
            STATE.selected.push(em);
        }

        const btn = document.querySelector(`.option-btn[data-em="${em}"]`);
        if (btn) {
            btn.classList.toggle('selected', STATE.selected.includes(em));
        }
        updateSelectedCountText();
    }

    function updateSelectedCountText() {
        const countEl = document.getElementById('f1-selected-count');
        if (countEl) countEl.textContent = STATE.selected.length;
    }

    function submit() {
        if (!STATE.isPlaying || STATE.isFlashing) return;
        if (STATE.selected.length === 0) {
            alert('１つ以上えらんでね！');
            return;
        }

        const selectArea = document.getElementById('f1-select-area');
        if (selectArea) selectArea.style.pointerEvents = 'none';

        // 判定：ターゲットが全て選ばれており、かつ余分な間違いを1つも選んでいないこと
        let correctCount = 0;
        let wrongCount = 0;
        STATE.selected.forEach(em => {
            if (STATE.targetEmojis.includes(em)) {
                correctCount++;
            } else {
                wrongCount++;
            }
        });
        const netCorrect = Math.max(0, correctCount - wrongCount);

        const hasAllTargets = (correctCount === STATE.targetEmojis.length);
        const hasNoExtra = (wrongCount === 0);
        const isPerfect = (hasAllTargets && hasNoExtra);

        // 部分評価の計算（実際に正しく記憶できていた個数をベースに評価）
        let partialScore = netCorrect;
        if (isPerfect) {
            partialScore = STATE.level;
        } else if (STATE.level > 2 && netCorrect === STATE.level - 1 && wrongCount <= 1) {
            // 前のレベルをクリア済みで、今回あと1個で完全正解だった場合は +0.5 ボーナス
            partialScore = STATE.level - 0.5;
        }
        STATE.maxClearedLevel = Math.max(STATE.maxClearedLevel, partialScore);

        // 正解・不正解の可視化
        document.querySelectorAll('.option-btn').forEach(btn => {
            const em = btn.getAttribute('data-em');
            const isTarget = STATE.targetEmojis.includes(em);
            const isUserSelected = STATE.selected.includes(em);

            if (isTarget) {
                btn.className = 'option-btn correct-reveal';
            } else if (isUserSelected) {
                btn.className = 'option-btn wrong-reveal';
            }
        });

        const stage = document.getElementById('f1-stage');
        if (stage) {
            let correctHtml = '';
            STATE.targetEmojis.forEach(em => { correctHtml += `<span class="flash-item">${em}</span>`; });
            stage.innerHTML = correctHtml;
        }

        const msg = document.getElementById('f1-message');

        if (isPerfect) {
            App.showFeedback('correct');
            STATE.maxClearedLevel = Math.max(STATE.maxClearedLevel, STATE.level);
            msg.innerHTML = `<span style="color:#2e7d32;">ピッタリ大正解！！バッチリ見えてたね！</span>`;

            STATE.missCountInLevel = 0;
            STATE.level++;

            if (STATE.level > STATE.maxLevel) {
                endGame();
            } else {
                addTimer(() => {
                    if (selectArea) selectArea.style.pointerEvents = 'auto';
                    startTrial();
                }, 1800);
            }

        } else {
            App.showFeedback('wrong');
            STATE.missCountInLevel++;

            msg.innerHTML = `<span style="color:#c62828;">おしい！緑色が正解だったよ</span>`;

            if (STATE.missCountInLevel >= 2) {
                // 2回ミスで終了
                addTimer(endGame, 2000);
            } else {
                addTimer(() => {
                    if (selectArea) selectArea.style.pointerEvents = 'auto';
                    msg.textContent = 'もういちど 同じ数に ちょうせん！';
                    addTimer(startTrial, 1200);
                }, 1800);
            }
        }
    }

    function endGame() {
        STATE.isPlaying = false;
        clearAllTimers();
        const msg = document.getElementById('f1-message');
        if (msg) msg.textContent = 'そくてい 終了！';

        addTimer(() => {
            App.saveResult('flash', {
                maxItems: STATE.maxClearedLevel
            });
        }, 1200);
    }

    return { start, toggleOption, submit };
})();
