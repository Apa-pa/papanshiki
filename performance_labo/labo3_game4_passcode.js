/* ============================================
   labo3_game4_passcode.js — ぎゃくふごうパスコード（G4）
   順序記憶（順唱）とワーキングメモリ（逆唱）の測定
   ============================================ */

'use strict';

window.Labo3Game4 = (function () {

    const STATE = {
        phase: 'forward', // 'forward'（順唱）または 'backward'（逆唱）
        level: 3,         // 現在の桁数
        maxLevel: 9,      // 最大桁数
        missCountInLevel: 0,
        currentCode: [],
        inputCode: [],
        forwardSpan: 0,
        backwardSpan: 0,
        isPlaying: false,
        isDisplaying: false,
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
        STATE.phase = 'forward';
        STATE.level = 3;
        STATE.maxLevel = 9;
        STATE.missCountInLevel = 0;
        STATE.forwardSpan = 0;
        STATE.backwardSpan = 0;
        STATE.isPlaying = true;

        renderBaseHTML();
        showPhaseIntro();
    }

    function renderBaseHTML() {
        const html = `
            <div id="p4-container" style="text-align:center; padding: 10px 0; max-width:400px; margin:0 auto;">
                <div class="level-indicator" id="p4-level-indicator">
                    <span id="p4-phase-badge" style="background:#e3f2fd; color:#1976d2; padding:2px 8px; border-radius:10px; font-size:0.85rem;">順唱</span>
                    <span id="p4-level-text">3けた</span>
                    <div class="dots" id="p4-dots">
                        <span class="dot" id="p4-dot-1"></span>
                        <span class="dot" id="p4-dot-2"></span>
                    </div>
                </div>

                <div id="p4-message" style="font-size:1.15rem; font-weight:bold; min-height:1.6em; margin-bottom:12px; color:var(--text-main);">
                    準備中...
                </div>

                <!-- 数字表示ディスプレイ -->
                <div id="p4-screen" style="
                    background: #263238;
                    color: #00e676;
                    font-size: 3.2rem;
                    font-family: monospace;
                    font-weight: bold;
                    height: 90px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 18px;
                    margin-bottom: 15px;
                    box-shadow: inset 0 3px 8px rgba(0,0,0,0.4);
                    letter-spacing: 4px;
                ">---</div>

                <!-- 入力スロット表示 -->
                <div id="p4-slots" style="display:flex; justify-content:center; gap:6px; margin-bottom:15px; min-height:36px;">
                </div>

                <!-- テンキー (0〜9 + 取消) -->
                <div id="p4-keypad" style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    padding: 8px;
                    opacity: 0.5;
                    pointer-events: none;
                ">
                    <button class="l3-btn keypad-btn" onclick="Labo3Game4.inputKey(1)">1</button>
                    <button class="l3-btn keypad-btn" onclick="Labo3Game4.inputKey(2)">2</button>
                    <button class="l3-btn keypad-btn" onclick="Labo3Game4.inputKey(3)">3</button>
                    <button class="l3-btn keypad-btn" onclick="Labo3Game4.inputKey(4)">4</button>
                    <button class="l3-btn keypad-btn" onclick="Labo3Game4.inputKey(5)">5</button>
                    <button class="l3-btn keypad-btn" onclick="Labo3Game4.inputKey(6)">6</button>
                    <button class="l3-btn keypad-btn" onclick="Labo3Game4.inputKey(7)">7</button>
                    <button class="l3-btn keypad-btn" onclick="Labo3Game4.inputKey(8)">8</button>
                    <button class="l3-btn keypad-btn" onclick="Labo3Game4.inputKey(9)">9</button>
                    <button class="l3-btn keypad-btn" style="background:#ffebee; color:#c62828;" onclick="Labo3Game4.clearInput()">けす</button>
                    <button class="l3-btn keypad-btn" onclick="Labo3Game4.inputKey(0)">0</button>
                    <button class="l3-btn keypad-btn" style="background:#e8f5e9; color:#2e7d32;" onclick="Labo3Game4.submit()">OK</button>
                </div>
            </div>
            <style>
                .keypad-btn {
                    background: #fff;
                    color: #333;
                    font-size: 1.5rem;
                    padding: 14px 0;
                    box-shadow: 0 4px #cfd8dc;
                    border: 2px solid #b0bec5;
                    border-radius: 12px;
                }
                .keypad-btn:active {
                    box-shadow: 0 1px #cfd8dc;
                    transform: translateY(3px);
                }
                .slot-box {
                    width: 30px;
                    height: 34px;
                    border-bottom: 3px solid #78909c;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.3rem;
                    font-weight: bold;
                    color: #37474f;
                }
            </style>
        `;
        App.setGameHTML(html);
    }

    function showPhaseIntro() {
        const msg = document.getElementById('p4-message');
        const screen = document.getElementById('p4-screen');
        const badge = document.getElementById('p4-phase-badge');
        const levelText = document.getElementById('p4-level-text');

        if (!msg) return;

        if (STATE.phase === 'forward') {
            badge.textContent = 'そのまま入力';
            badge.style.background = '#e3f2fd';
            badge.style.color = '#1565c0';
            levelText.textContent = `${STATE.level}けた`;
            msg.innerHTML = `出た数字を <span style="color:#1976d2;">そのままの順番</span> で入れてね！`;
            screen.textContent = 'START!';
            addTimer(startTrial, 1800);
        } else {
            badge.textContent = 'ぎゃくから入力';
            badge.style.background = '#fce4ec';
            badge.style.color = '#c2185b';
            levelText.textContent = `${STATE.level}けた`;
            msg.innerHTML = `こんどは <span style="color:#d81b60;">「ぎゃくの順番」</span> で入れてね！<br><small style="font-size:0.85rem; color:#666;">（例：1 → 2 → 3 なら 3・2・1）</small>`;
            screen.textContent = 'ぎゃく！';
            addTimer(startTrial, 2400);
        }
    }

    function generateCode(length) {
        const arr = [];
        for (let i = 0; i < length; i++) {
            // 直前と同じ数字の連続は避ける
            let num;
            do {
                num = Math.floor(Math.random() * 10);
            } while (i > 0 && num === arr[i - 1]);
            arr.push(num);
        }
        return arr;
    }

    function startTrial() {
        if (!STATE.isPlaying) return;

        STATE.inputCode = [];
        STATE.isDisplaying = true;
        STATE.currentCode = generateCode(STATE.level);

        updateIndicator();
        renderSlots();

        const msg = document.getElementById('p4-message');
        const screen = document.getElementById('p4-screen');
        const keypad = document.getElementById('p4-keypad');

        keypad.style.opacity = '0.4';
        keypad.style.pointerEvents = 'none';

        msg.textContent = `画面をよく見てね...`;
        screen.textContent = '---';

        // 1秒待ってから数字を1桁ずつ点滅表示
        addTimer(() => {
            let idx = 0;
            function showNextDigit() {
                if (idx < STATE.currentCode.length) {
                    screen.textContent = STATE.currentCode[idx];
                    screen.style.color = '#00e676';
                    // 0.6秒表示
                    addTimer(() => {
                        screen.textContent = '';
                        // 0.25秒空白
                        addTimer(() => {
                            idx++;
                            showNextDigit();
                        }, 250);
                    }, 600);
                } else {
                    // 全桁表示終了 -> 入力受付開始
                    screen.textContent = '？';
                    screen.style.color = '#ffeb3b';
                    STATE.isDisplaying = false;
                    keypad.style.opacity = '1';
                    keypad.style.pointerEvents = 'auto';

                    if (STATE.phase === 'forward') {
                        msg.textContent = '出た順にタップしてね！';
                    } else {
                        msg.textContent = '★ ぎゃく順（さいごの数字から）でタップしてね！';
                    }
                }
            }
            showNextDigit();
        }, 800);
    }

    function updateIndicator() {
        const levelText = document.getElementById('p4-level-text');
        if (levelText) levelText.textContent = `${STATE.level}けた`;

        const dot1 = document.getElementById('p4-dot-1');
        const dot2 = document.getElementById('p4-dot-2');
        if (dot1 && dot2) {
            dot1.className = STATE.missCountInLevel >= 1 ? 'dot active' : 'dot';
            dot2.className = STATE.missCountInLevel >= 2 ? 'dot active' : 'dot';
        }
    }

    function renderSlots() {
        const slotsEl = document.getElementById('p4-slots');
        if (!slotsEl) return;
        let html = '';
        for (let i = 0; i < STATE.level; i++) {
            const val = (i < STATE.inputCode.length) ? STATE.inputCode[i] : '';
            html += `<div class="slot-box">${val}</div>`;
        }
        slotsEl.innerHTML = html;
    }

    function inputKey(num) {
        if (!STATE.isPlaying || STATE.isDisplaying) return;
        if (STATE.inputCode.length < STATE.level) {
            STATE.inputCode.push(num);
            renderSlots();

            // 満杯になったら自動判定へ
            if (STATE.inputCode.length === STATE.level) {
                submit();
            }
        }
    }

    function clearInput() {
        if (!STATE.isPlaying || STATE.isDisplaying) return;
        STATE.inputCode = [];
        renderSlots();
    }

    function submit() {
        if (!STATE.isPlaying || STATE.isDisplaying) return;
        if (STATE.inputCode.length !== STATE.level) return;

        const keypad = document.getElementById('p4-keypad');
        keypad.style.pointerEvents = 'none';

        // 正解コードの算出
        let targetCode = [];
        if (STATE.phase === 'forward') {
            targetCode = [...STATE.currentCode];
        } else {
            targetCode = [...STATE.currentCode].reverse();
        }

        const isCorrect = STATE.inputCode.every((val, i) => val === targetCode[i]);
        const msg = document.getElementById('p4-message');
        const screen = document.getElementById('p4-screen');

        if (isCorrect) {
            App.showFeedback('correct');
            msg.innerHTML = `<span style="color:#2e7d32;">正解！！すごい！</span>`;
            screen.textContent = targetCode.join('');
            screen.style.color = '#00e676';

            // クリア実績更新
            if (STATE.phase === 'forward') {
                STATE.forwardSpan = Math.max(STATE.forwardSpan, STATE.level);
            } else {
                STATE.backwardSpan = Math.max(STATE.backwardSpan, STATE.level);
            }

            // 次のレベルへ昇格
            STATE.missCountInLevel = 0;
            STATE.level++;

            if (STATE.level > STATE.maxLevel) {
                // 上限到達
                advanceToNextPhase();
            } else {
                addTimer(startTrial, 1400);
            }

        } else {
            App.showFeedback('wrong');
            STATE.missCountInLevel++;
            msg.innerHTML = `<span style="color:#c62828;">ざんねん！正解は「${targetCode.join('')}」でした</span>`;
            screen.textContent = targetCode.join('');
            screen.style.color = '#ef5350';

            if (STATE.missCountInLevel >= 2) {
                // 2回ミスで終了
                advanceToNextPhase();
            } else {
                // 同じレベルでリトライ
                addTimer(() => {
                    msg.textContent = 'もういちど 同じけたに ちょうせん！';
                    addTimer(startTrial, 1200);
                }, 1600);
            }
        }
    }

    function advanceToNextPhase() {
        if (STATE.phase === 'forward') {
            // 前半終了 -> 後半（逆唱）へ
            STATE.phase = 'backward';
            STATE.level = 2; // 逆唱は2桁から
            STATE.maxLevel = 8;
            STATE.missCountInLevel = 0;
            addTimer(showPhaseIntro, 2000);
        } else {
            // 後半終了 -> ゲーム終了
            endGame();
        }
    }

    function endGame() {
        STATE.isPlaying = false;
        clearAllTimers();
        const msg = document.getElementById('p4-message');
        if (msg) msg.textContent = 'そくてい 終了！';

        addTimer(() => {
            App.saveResult('passcode', {
                forwardSpan: STATE.forwardSpan,
                backwardSpan: STATE.backwardSpan
            });
        }, 1200);
    }

    return { start, inputKey, clearInput, submit };
})();
