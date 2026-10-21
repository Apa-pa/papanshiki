/* ============================================
   labo3_game5_sound.js — おと・メロディきおく（G5）
   純粋な聴覚記憶（音の並び・メロディ）の測定
   ピアノ音（ド・ミ・ソ）を使用し、鍵盤でそのまま答える形式
   ============================================ */

'use strict';

window.Labo3Game5 = (function () {

    const SOUNDS = {
        'C4': { file: '../se/C4.mp3', label: 'ひくい音' },
        'E4': { file: '../se/E4.mp3', label: 'まんなか' },
        'G4': { file: '../se/G4.mp3', label: 'たかい音' },
    };

    const NOTE_KEYS = ['C4', 'E4', 'G4'];
    const audioObjects = {};

    const STATE = {
        level: 2,         // 現在の音数 (2〜9)
        maxLevel: 9,
        missCountInLevel: 0,
        maxClearedNotes: 0,
        currentSequence: [],
        userInput: [],
        isPlayingAudio: false,
        isPlaying: false,
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

    function preloadAudio() {
        NOTE_KEYS.forEach(key => {
            if (!audioObjects[key]) {
                const audio = new Audio(SOUNDS[key].file);
                audio.preload = 'auto';
                audioObjects[key] = audio;
            }
        });
    }

    function playNote(key, callback) {
        try {
            const audio = audioObjects[key] || new Audio(SOUNDS[key].file);
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    if (callback) addTimer(callback, 450);
                }).catch(() => {
                    if (callback) addTimer(callback, 450);
                });
            }
        } catch (e) {
            if (callback) addTimer(callback, 450);
        }
    }

    // 鍵盤が光る演出
    function highlightPianoKey(key, durationMs = 400) {
        const keyEl = document.getElementById(`s5-key-${key}`);
        if (!keyEl) return;
        keyEl.classList.add('active-play');
        addTimer(() => {
            keyEl.classList.remove('active-play');
        }, durationMs);
    }

    function start() {
        clearAllTimers();
        preloadAudio();
        STATE.level = 2;
        STATE.maxLevel = 9;
        STATE.missCountInLevel = 0;
        STATE.maxClearedNotes = 0;
        STATE.isPlaying = true;

        renderBaseHTML();
    }

    function renderBaseHTML() {
        const html = `
            <div id="s5-container" style="text-align:center; padding: 10px 0; max-width:400px; margin:0 auto;">
                <div class="level-indicator" id="s5-level-indicator">
                    <span>おぼえる音: <strong id="s5-level-text">2おと</strong></span>
                    <div class="dots">
                        <span class="dot" id="s5-dot-1"></span>
                        <span class="dot" id="s5-dot-2"></span>
                    </div>
                </div>

                <div id="s5-message" style="font-size:1.15rem; font-weight:bold; min-height:1.6em; margin-bottom:15px; color:var(--text-main);">
                    おとの ながれを よくおぼえてね！
                </div>

                <!-- ピアノ鍵盤エリア（出題＆回答で共用） -->
                <div class="s5-piano-card">
                    <div id="s5-status-icon" style="font-size:2.4rem; min-height:48px; margin-bottom:10px;">
                        🎹
                    </div>

                    <div class="s5-keyboard" id="s5-keyboard">
                        <button class="s5-white-key" id="s5-key-C4" onclick="Labo3Game5.tapKey('C4')">
                            <span class="key-mark">♪</span>
                        </button>
                        <button class="s5-white-key" id="s5-key-E4" onclick="Labo3Game5.tapKey('E4')">
                            <span class="key-mark">♪</span>
                        </button>
                        <button class="s5-white-key" id="s5-key-G4" onclick="Labo3Game5.tapKey('G4')">
                            <span class="key-mark">♪</span>
                        </button>
                    </div>

                    <div style="display:flex; justify-content:space-around; width:100%; max-width:270px; margin:10px auto 0; font-size:0.85rem; color:#888;">
                        <span>ひくい音</span>
                        <span>まんなか</span>
                        <span>たかい音</span>
                    </div>
                </div>

                <!-- 回答ステップのインジケーター（ドット） -->
                <div id="s5-input-dots" style="display:flex; justify-content:center; gap:10px; margin-top:20px; min-height:26px;"></div>

                <!-- 開始前の音チェック用（初回のみ表示） -->
                <div id="s5-sound-check-bar" style="margin-top:15px;">
                    <button class="l3-btn" style="background:#ede7f6; color:#5e35b1; padding:8px 18px; border-radius:20px; font-size:0.9rem;" onclick="Labo3Game5.playCheckSound()">
                        🔊 音が出るかテスト（ポーン♪）
                    </button>
                </div>
            </div>

            <style>
                .s5-piano-card {
                    background: #fdfbf7;
                    border: 2px solid #ce93d8;
                    border-radius: 20px;
                    padding: 16px 12px 14px;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.06);
                }
                .s5-keyboard {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    max-width: 280px;
                    margin: 0 auto;
                }
                .s5-white-key {
                    flex: 1;
                    height: 140px;
                    background: #ffffff;
                    border: 2px solid #b0bec5;
                    border-radius: 0 0 16px 16px;
                    box-shadow: 0 6px #90a4ae;
                    position: relative;
                    cursor: pointer;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    padding-bottom: 15px;
                    transition: transform 0.08s ease, background 0.1s ease, box-shadow 0.08s ease;
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                }
                .s5-white-key:active {
                    transform: translateY(4px);
                    box-shadow: 0 2px #90a4ae;
                }
                .key-mark {
                    font-size: 1.4rem;
                    color: #78909c;
                }
                /* 音が鳴っている時の発光 */
                .s5-white-key.active-play {
                    background: #fff59d !important;
                    border-color: #fbc02d !important;
                    box-shadow: 0 0 16px #ffee58, inset 0 0 12px #fdd835 !important;
                    transform: translateY(4px);
                }
                .s5-white-key.active-play .key-mark {
                    color: #e65100;
                    transform: scale(1.3);
                }
                .s5-step-dot {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #e0e0e0;
                    transition: background 0.2s ease, transform 0.2s ease;
                }
                .s5-step-dot.done {
                    background: #7e57c2;
                    transform: scale(1.15);
                }
            </style>
        `;
        App.setGameHTML(html);

        addTimer(startTrial, 1400);
    }

    function playCheckSound() {
        playNote('C4', () => {
            highlightPianoKey('C4', 300);
        });
    }

    function generateSequence(length) {
        const arr = [];
        for (let i = 0; i < length; i++) {
            const randKey = NOTE_KEYS[Math.floor(Math.random() * NOTE_KEYS.length)];
            arr.push(randKey);
        }
        return arr;
    }

    function startTrial() {
        if (!STATE.isPlaying) return;

        STATE.userInput = [];
        STATE.isPlayingAudio = true;
        STATE.currentSequence = generateSequence(STATE.level);

        updateIndicator();
        renderDots();

        const msg = document.getElementById('s5-message');
        const keyboard = document.getElementById('s5-keyboard');
        const statusIcon = document.getElementById('s5-status-icon');
        const checkBar = document.getElementById('s5-sound-check-bar');

        if (checkBar) checkBar.style.display = 'none';

        if (keyboard) {
            keyboard.style.pointerEvents = 'none';
            keyboard.style.opacity = '0.7';
        }
        if (msg) msg.textContent = '耳をすましてね... ♪';
        if (statusIcon) statusIcon.textContent = '👂';

        // 1秒待ってから連続再生
        addTimer(() => {
            let noteIdx = 0;

            function playNext() {
                if (noteIdx < STATE.currentSequence.length) {
                    const key = STATE.currentSequence[noteIdx];

                    highlightPianoKey(key, 400);
                    playNote(key, () => {
                        noteIdx++;
                        addTimer(playNext, 300);
                    });
                } else {
                    // 全音再生完了 -> 入力受付開始
                    STATE.isPlayingAudio = false;
                    if (keyboard) {
                        keyboard.style.pointerEvents = 'auto';
                        keyboard.style.opacity = '1';
                    }
                    if (msg) msg.textContent = '鳴った順に 鍵盤を押してね！';
                    if (statusIcon) statusIcon.textContent = '🎹';
                }
            }

            playNext();
        }, 800);
    }

    function updateIndicator() {
        const levelText = document.getElementById('s5-level-text');
        if (levelText) levelText.textContent = `${STATE.level}おと`;

        const dot1 = document.getElementById('s5-dot-1');
        const dot2 = document.getElementById('s5-dot-2');
        if (dot1 && dot2) {
            dot1.className = STATE.missCountInLevel >= 1 ? 'dot active' : 'dot';
            dot2.className = STATE.missCountInLevel >= 2 ? 'dot active' : 'dot';
        }
    }

    function renderDots() {
        const dotsEl = document.getElementById('s5-input-dots');
        if (!dotsEl) return;
        let html = '';
        for (let i = 0; i < STATE.level; i++) {
            const isDone = i < STATE.userInput.length;
            html += `<div class="s5-step-dot ${isDone ? 'done' : ''}"></div>`;
        }
        dotsEl.innerHTML = html;
    }

    function tapKey(key) {
        if (!STATE.isPlaying || STATE.isPlayingAudio) return;

        playNote(key);
        highlightPianoKey(key, 250);
        STATE.userInput.push(key);
        renderDots();

        if (STATE.userInput.length === STATE.level) {
            judgeTrial();
        }
    }

    function judgeTrial() {
        const keyboard = document.getElementById('s5-keyboard');
        if (keyboard) keyboard.style.pointerEvents = 'none';

        let matchedNotes = 0;
        for (let i = 0; i < STATE.level; i++) {
            if (STATE.userInput[i] === STATE.currentSequence[i]) {
                matchedNotes++;
            }
        }
        const isCorrect = (matchedNotes === STATE.level);
        const msg = document.getElementById('s5-message');
        const statusIcon = document.getElementById('s5-status-icon');

        // 部分評価の計算（実際に順番通り合っていた音の数をベースに評価）
        let partialNotes = matchedNotes;
        if (isCorrect) {
            partialNotes = STATE.level;
        } else if (STATE.level > 2 && matchedNotes === STATE.level - 1) {
            // 前の音数をクリア済みで、今回あと1音だった場合は +0.5
            partialNotes = STATE.level - 0.5;
        }
        STATE.maxClearedNotes = Math.max(STATE.maxClearedNotes, partialNotes);

        if (isCorrect) {
            App.showFeedback('correct');
            msg.innerHTML = `<span style="color:#2e7d32;">正解！！音がしっかり残ってたね！</span>`;
            if (statusIcon) statusIcon.textContent = '⭕';

            STATE.missCountInLevel = 0;
            STATE.level++;

            if (STATE.level > STATE.maxLevel) {
                endGame();
            } else {
                addTimer(startTrial, 1600);
            }

        } else {
            App.showFeedback('wrong');
            STATE.missCountInLevel++;

            msg.innerHTML = `<span style="color:#c62828;">おしい！</span>`;
            if (statusIcon) statusIcon.textContent = '❌';

            // 正解のメロディをもう一度鳴らしておさらい
            addTimer(() => {
                msg.textContent = 'せいかいの音は これだったよ：';
                let replayIdx = 0;
                function replayNext() {
                    if (replayIdx < STATE.currentSequence.length) {
                        const key = STATE.currentSequence[replayIdx];
                        highlightPianoKey(key, 350);
                        playNote(key, () => {
                            replayIdx++;
                            addTimer(replayNext, 250);
                        });
                    } else {
                        if (STATE.missCountInLevel >= 2) {
                            addTimer(endGame, 1500);
                        } else {
                            addTimer(() => {
                                msg.textContent = 'もういちど 同じ音数に ちょうせん！';
                                addTimer(startTrial, 1000);
                            }, 1500);
                        }
                    }
                }
                replayNext();
            }, 800);
        }
    }

    function endGame() {
        STATE.isPlaying = false;
        clearAllTimers();
        const msg = document.getElementById('s5-message');
        if (msg) msg.textContent = 'そくてい 終了！';

        addTimer(() => {
            App.saveResult('sound', {
                maxNotes: STATE.maxClearedNotes
            });
        }, 1200);
    }

    return { start, tapKey, playCheckSound };
})();
