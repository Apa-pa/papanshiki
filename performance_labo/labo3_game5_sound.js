/* ============================================
   labo3_game5_sound.js — おと・ルールきおく（G5）
   聴覚・ルール連想記憶と順序記憶の測定
   ピアノ音（ド・ミ・ソ）＋鍵盤発光ヒント付き
   ============================================ */

'use strict';

window.Labo3Game5 = (function () {

    const SOUNDS = {
        'C4': { file: '../se/C4.mp3', noteName: 'ド', name: 'ド（ひくい音）', color: '#e53935', label: 'あか', id: 'red' },
        'E4': { file: '../se/E4.mp3', noteName: 'ミ', name: 'ミ（まんなか）', color: '#fbc02d', label: 'きいろ', id: 'yellow' },
        'G4': { file: '../se/G4.mp3', noteName: 'ソ', name: 'ソ（たかい音）', color: '#1e88e5', label: 'あお', id: 'blue' },
    };

    const NOTE_KEYS = ['C4', 'E4', 'G4'];
    const audioObjects = {};

    const STATE = {
        phase: 'check',   // 'check' -> 'test'
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
                    if (callback) addTimer(callback, 480);
                }).catch(() => {
                    // 自動再生ブロック時のフォールバック
                    if (callback) addTimer(callback, 480);
                });
            }
        } catch (e) {
            if (callback) addTimer(callback, 480);
        }
    }

    // 鍵盤を光らせる演出
    function highlightPianoKey(key, durationMs = 420) {
        const keyEl = document.getElementById(`s5-pkey-${key}`);
        if (!keyEl) return;
        keyEl.classList.add('lit');
        addTimer(() => {
            keyEl.classList.remove('lit');
        }, durationMs);
    }

    function start() {
        clearAllTimers();
        preloadAudio();
        STATE.phase = 'check';
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
                <div class="level-indicator" id="s5-level-indicator" style="display:none;">
                    <span>きく音の数: <strong id="s5-level-text">2おと</strong></span>
                    <div class="dots">
                        <span class="dot" id="s5-dot-1"></span>
                        <span class="dot" id="s5-dot-2"></span>
                    </div>
                </div>

                <div id="s5-message" style="font-size:1.15rem; font-weight:bold; min-height:1.6em; margin-bottom:12px; color:var(--text-main);">
                    「おと」と「いろ」のルールをおぼえよう！
                </div>

                <!-- 音チェック＆ルール説明エリア -->
                <div id="s5-intro-card" style="
                    background: #fff;
                    border: 2px solid #ce93d8;
                    border-radius: 16px;
                    padding: 15px;
                    margin-bottom: 15px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                ">
                    <p style="font-size:0.95rem; color:#555; margin-bottom:12px; line-height:1.5;">
                        どの音が <strong>どの色</strong> かおぼえてね！<br>
                        本番では鍵盤が光って「ド・ミ・ソ」を教えてくれるよ。<br>
                        まずはボタンを押して音をたしかめてみよう！
                    </p>
                    <div style="display:flex; justify-content:center; gap:10px; margin-bottom:15px;">
                        <button class="l3-btn sample-note-btn" style="background:#e53935; color:#fff;" onclick="Labo3Game5.testSound('C4')">
                            <strong>ド ＝ あか</strong> 🎵<br><small style="font-size:0.75rem;">ひくい音</small>
                        </button>
                        <button class="l3-btn sample-note-btn" style="background:#fbc02d; color:#333;" onclick="Labo3Game5.testSound('E4')">
                            <strong>ミ ＝ きいろ</strong> 🎵<br><small style="font-size:0.75rem;">まんなか</small>
                        </button>
                        <button class="l3-btn sample-note-btn" style="background:#1e88e5; color:#fff;" onclick="Labo3Game5.testSound('G4')">
                            <strong>ソ ＝ あお</strong> 🎵<br><small style="font-size:0.75rem;">たかい音</small>
                        </button>
                    </div>

                    <button class="btn btn-accent l3-btn" style="font-size:1.1rem; padding:10px 25px; border-radius:30px;" onclick="Labo3Game5.startRealTest()">
                        ✅ ルールをおぼえた！本番へGO！
                    </button>
                </div>

                <!-- 本番のピアノ鍵盤ステージ（音が鳴るときに鍵盤が光る） -->
                <div id="s5-speaker-stage" style="
                    display: none;
                    background: #37474f;
                    border-radius: 20px;
                    padding: 16px 12px 14px;
                    margin-bottom: 15px;
                    box-shadow: inset 0 3px 8px rgba(0,0,0,0.3);
                ">
                    <div id="s5-notes-visual" style="min-height:28px; margin-bottom:10px; font-size:1.15rem; font-weight:bold; color:#fff;">
                        🎵 よく見て・聞いてね
                    </div>

                    <!-- 5鍵盤（ド・レ・ミ・ファ・ソ） -->
                    <div class="s5-piano-wrap">
                        <div class="s5-pkey target-key" id="s5-pkey-C4">
                            <span class="pkey-note">ド</span>
                        </div>
                        <div class="s5-pkey dummy-key">
                            <span class="pkey-note" style="color:#bbb; font-size:0.85rem;">レ</span>
                        </div>
                        <div class="s5-pkey target-key" id="s5-pkey-E4">
                            <span class="pkey-note">ミ</span>
                        </div>
                        <div class="s5-pkey dummy-key">
                            <span class="pkey-note" style="color:#bbb; font-size:0.85rem;">ファ</span>
                        </div>
                        <div class="s5-pkey target-key" id="s5-pkey-G4">
                            <span class="pkey-note">ソ</span>
                        </div>
                        <!-- 黒鍵（飾り） -->
                        <div class="s5-bkey" style="left: 14%;"></div>
                        <div class="s5-bkey" style="left: 34%;"></div>
                        <div class="s5-bkey" style="left: 74%;"></div>
                    </div>
                </div>

                <!-- 回答用 3色ボタン（本番は色と色名のみ） -->
                <div id="s5-buttons-stage" style="
                    display: none;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 15px;
                ">
                    <button class="l3-btn sound-input-btn" style="background:#e53935;" data-key="C4" onclick="Labo3Game5.inputColor('C4')">
                        <span class="btn-sound-label">あか</span>
                    </button>
                    <button class="l3-btn sound-input-btn" style="background:#fbc02d;" data-key="E4" onclick="Labo3Game5.inputColor('E4')">
                        <span class="btn-sound-label" style="color:#333;">きいろ</span>
                    </button>
                    <button class="l3-btn sound-input-btn" style="background:#1e88e5;" data-key="G4" onclick="Labo3Game5.inputColor('G4')">
                        <span class="btn-sound-label">あお</span>
                    </button>
                </div>

                <div id="s5-input-history" style="display:none; justify-content:center; gap:8px; min-height:30px;"></div>
            </div>
            <style>
                .sample-note-btn {
                    padding: 10px 12px;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    box-shadow: 0 3px rgba(0,0,0,0.2);
                }
                .s5-piano-wrap {
                    position: relative;
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 4px;
                    max-width: 300px;
                    height: 110px;
                    margin: 0 auto;
                    background: #263238;
                    padding: 6px;
                    border-radius: 12px;
                }
                .s5-pkey {
                    background: #fafafa;
                    border: 2px solid #cfd8dc;
                    border-radius: 0 0 8px 8px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    align-items: center;
                    padding-bottom: 8px;
                    box-shadow: 0 4px #b0bec5;
                    transition: transform 0.1s ease, background 0.1s ease, box-shadow 0.1s ease;
                    user-select: none;
                }
                .s5-pkey.dummy-key {
                    background: #eceff1;
                    opacity: 0.75;
                }
                .pkey-note {
                    font-size: 1.15rem;
                    font-weight: bold;
                    color: #37474f;
                }
                /* 鍵盤が光ったときのスタイル（色の答えは出さず、明るいオレンジゴールドに光る） */
                .s5-pkey.lit {
                    background: #fff59d !important;
                    border-color: #fbc02d !important;
                    box-shadow: 0 0 18px #ffee58, inset 0 0 10px #fdd835 !important;
                    transform: translateY(3px) scale(1.03);
                    z-index: 2;
                }
                .s5-pkey.lit .pkey-note {
                    color: #d84315;
                    font-size: 1.35rem;
                }
                .s5-bkey {
                    position: absolute;
                    top: 6px;
                    width: 11%;
                    height: 56px;
                    background: #212121;
                    border-radius: 0 0 5px 5px;
                    box-shadow: 0 3px #000;
                    pointer-events: none;
                    z-index: 3;
                }
                .sound-input-btn {
                    height: 85px;
                    border-radius: 18px;
                    color: #fff;
                    font-size: 1.3rem;
                    box-shadow: 0 5px rgba(0,0,0,0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .sound-input-btn:active {
                    transform: translateY(3px);
                    box-shadow: 0 2px rgba(0,0,0,0.25);
                }
                .input-history-dot {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 2px solid #fff;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
            </style>
        `;
        App.setGameHTML(html);
    }

    function testSound(key) {
        playNote(key);
    }

    function startRealTest() {
        STATE.phase = 'test';
        document.getElementById('s5-intro-card').style.display = 'none';
        document.getElementById('s5-level-indicator').style.display = 'inline-flex';
        document.getElementById('s5-speaker-stage').style.display = 'block';
        document.getElementById('s5-buttons-stage').style.display = 'grid';
        document.getElementById('s5-input-history').style.display = 'flex';

        const msg = document.getElementById('s5-message');
        if (msg) msg.textContent = '本番スタート！光る鍵盤と音をおぼえてね！';

        addTimer(startTrial, 1000);
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
        renderHistory();

        const msg = document.getElementById('s5-message');
        const btnsStage = document.getElementById('s5-buttons-stage');
        const visual = document.getElementById('s5-notes-visual');

        if (btnsStage) {
            btnsStage.style.opacity = '0.4';
            btnsStage.style.pointerEvents = 'none';
        }
        if (msg) msg.textContent = '光る鍵盤と音を じゅんばんにおぼえてね...';
        if (visual) visual.textContent = '🎵 じゅんび...';

        // 1秒待ってから連続再生
        addTimer(() => {
            let noteIdx = 0;

            function playNext() {
                if (noteIdx < STATE.currentSequence.length) {
                    const key = STATE.currentSequence[noteIdx];
                    const noteName = SOUNDS[key].noteName;

                    // 鍵盤を光らせ、何の音が出たかを表示
                    highlightPianoKey(key, 420);
                    if (visual) {
                        visual.innerHTML = `${noteIdx + 1}こ目： <span style="color:#ffee58; font-size:1.35rem;">「${noteName}」</span> ♪`;
                    }

                    playNote(key, () => {
                        noteIdx++;
                        // 0.32秒空けて次の音
                        addTimer(playNext, 320);
                    });
                } else {
                    // 全音再生完了 -> 入力受付開始
                    STATE.isPlayingAudio = false;
                    if (btnsStage) {
                        btnsStage.style.opacity = '1';
                        btnsStage.style.pointerEvents = 'auto';
                    }
                    if (msg) msg.textContent = '鳴った順に 対応する「色ボタン」を押してね！';
                    if (visual) visual.textContent = 'どの色だったかな？';
                }
            }

            playNext();
        }, 1000);
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

    function renderHistory() {
        const historyEl = document.getElementById('s5-input-history');
        if (!historyEl) return;
        let html = '';
        for (let i = 0; i < STATE.level; i++) {
            if (i < STATE.userInput.length) {
                const k = STATE.userInput[i];
                html += `<div class="input-history-dot" style="background:${SOUNDS[k].color};"></div>`;
            } else {
                html += `<div class="input-history-dot" style="background:#ddd;"></div>`;
            }
        }
        historyEl.innerHTML = html;
    }

    function inputColor(key) {
        if (!STATE.isPlaying || STATE.isPlayingAudio) return;

        highlightPianoKey(key, 300);
        playNote(key);
        STATE.userInput.push(key);
        renderHistory();

        if (STATE.userInput.length === STATE.level) {
            judgeTrial();
        }
    }

    function judgeTrial() {
        const btnsStage = document.getElementById('s5-buttons-stage');
        if (btnsStage) btnsStage.style.pointerEvents = 'none';

        const isCorrect = STATE.userInput.every((k, i) => k === STATE.currentSequence[i]);
        const msg = document.getElementById('s5-message');
        const visual = document.getElementById('s5-notes-visual');

        if (isCorrect) {
            App.showFeedback('correct');
            STATE.maxClearedNotes = Math.max(STATE.maxClearedNotes, STATE.level);
            msg.innerHTML = `<span style="color:#2e7d32;">大正解！！ルールも順番もバッチリ！</span>`;
            if (visual) visual.textContent = '⭕ かんぺき！';

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

            // 正解の並び（音名＋色名）を提示
            const correctNames = STATE.currentSequence.map(k => `${SOUNDS[k].noteName}(${SOUNDS[k].label})`).join(' → ');
            msg.innerHTML = `<span style="color:#c62828;">おしい！正解は「${correctNames}」でした</span>`;
            if (visual) visual.textContent = '❌';

            if (STATE.missCountInLevel >= 2) {
                // 2回ミスで終了
                addTimer(endGame, 2200);
            } else {
                addTimer(() => {
                    msg.textContent = 'もういちど 同じ音数に ちょうせん！';
                    addTimer(startTrial, 1200);
                }, 2000);
            }
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

    return { start, testSound, startRealTest, inputColor };
})();
