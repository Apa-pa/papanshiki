/* sound.js - ぱぱん式 共通効果音スクリプト (Web Audio API) */
(function (global) {
    'use strict';

    // localStorage の保存キー（全ゲーム共通で ON/OFF 設定を引き継ぐ）
    const STORAGE_KEY = 'papan_sound_v1';
    // マスター音量（全体の一括調整用）
    const MASTER_VOLUME = 1.0;
    // 壁衝突音の連続再生を防ぐクールダウン時間（ミリ秒）
    const WALL_COOLDOWN_MS = 50;

    let audioCtx = null;
    let masterGain = null;
    let enabled = readStoredEnabled();
    let lastWallPlayedAt = 0;
    let unlockListenersBound = false;
    const boundButtons = [];

    // 保存された効果音設定を読み込む（未設定・読み込み不可時は ON）
    function readStoredEnabled() {
        try {
            if (typeof global.localStorage === 'undefined') return true;
            const saved = global.localStorage.getItem(STORAGE_KEY);
            return saved !== 'off';
        } catch (err) {
            return true;
        }
    }

    // 効果音設定を localStorage へ保存する
    function writeStoredEnabled(nextEnabled) {
        try {
            if (typeof global.localStorage === 'undefined') return;
            global.localStorage.setItem(STORAGE_KEY, nextEnabled ? 'on' : 'off');
        } catch (err) {
            // プライベートブラウズ等の制限環境でもゲームを止めない
        }
    }

    // 0〜1 の範囲に丸めるヘルパー
    function clamp01(value, fallback) {
        const num = Number(value);
        if (!Number.isFinite(num)) return fallback;
        return Math.max(0, Math.min(1, num));
    }

    // AudioContext とマスターゲインを遅延生成する
    function ensureContext() {
        try {
            if (!audioCtx) {
                const AudioCtx = global.AudioContext || global.webkitAudioContext;
                if (!AudioCtx) return null;
                audioCtx = new AudioCtx();
                masterGain = audioCtx.createGain();
                masterGain.gain.setValueAtTime(MASTER_VOLUME, audioCtx.currentTime);
                masterGain.connect(audioCtx.destination);
            }
            if (audioCtx.state === 'suspended' && typeof audioCtx.resume === 'function') {
                const res = audioCtx.resume();
                if (res && typeof res.catch === 'function') {
                    res.catch(function () { /* 自動再生制限による拒否は無視 */ });
                }
            }
            return audioCtx;
        } catch (err) {
            return null;
        }
    }

    // ユーザー操作をきっかけに AudioContext をアンロックする
    function unlock() {
        const ctx = ensureContext();
        return Boolean(ctx);
    }

    // 初回操作時の自動アンロックリスナーを登録する
    function bindAutoUnlock() {
        if (unlockListenersBound || typeof document === 'undefined' || !document.addEventListener) {
            return;
        }
        unlockListenersBound = true;

        const events = ['pointerdown', 'touchstart', 'keydown'];
        const onFirstInteraction = function () {
            unlock();
            events.forEach(function (ev) {
                try {
                    document.removeEventListener(ev, onFirstInteraction, true);
                } catch (err) {
                    // 無視
                }
            });
        };

        events.forEach(function (ev) {
            try {
                document.addEventListener(ev, onFirstInteraction, { capture: true, passive: true });
            } catch (err) {
                // 古いブラウザ向けのフォールバック
                try {
                    document.addEventListener(ev, onFirstInteraction, true);
                } catch (err2) {
                    // 無視
                }
            }
        });
    }

    // 単音・スウィープ音を再生する低レベル関数
    function tone(options) {
        if (!enabled) return;
        const opts = options || {};
        const ctx = ensureContext();
        if (!ctx || !masterGain) return;

        try {
            const rawFreq = Number(opts.freq);
            const freq = Number.isFinite(rawFreq) && rawFreq > 0 ? rawFreq : 440;
            const rawEndFreq = opts.endFreq !== null && opts.endFreq !== undefined ? Number(opts.endFreq) : null;
            const endFreq = rawEndFreq !== null && Number.isFinite(rawEndFreq) && rawEndFreq > 0 ? rawEndFreq : null;
            const rawDuration = Number(opts.duration);
            const duration = Number.isFinite(rawDuration) && rawDuration > 0 ? Math.max(0.01, rawDuration) : 0.12;
            const type = opts.type || 'sine';
            const rawVolume = Number(opts.volume);
            const volume = Number.isFinite(rawVolume) && rawVolume > 0 ? rawVolume : 0.08;
            const rawDelay = Number(opts.delay);
            const delay = Number.isFinite(rawDelay) && rawDelay > 0 ? rawDelay : 0;

            const startTime = ctx.currentTime + delay;
            const attackTime = Math.min(startTime + 0.004, startTime + duration * 0.4);
            const endTime = startTime + duration;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);
            if (endFreq !== null) {
                osc.frequency.exponentialRampToValueAtTime(endFreq, endTime);
            }

            // クリックノイズを防ぐため 0.0001 から素早く立ち上げて滑らかに減衰させる
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.linearRampToValueAtTime(volume, attackTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(startTime);
            osc.stop(endTime + 0.01);
        } catch (err) {
            // 再生失敗時もゲーム進行に影響させない
        }
    }

    // 連続音を順番に再生する内部ヘルパー
    function playSequence(notes, opts) {
        const step = opts.step || 0.085;
        const duration = opts.duration || 0.2;
        const type = opts.type || 'sine';
        const volume = opts.volume || 0.085;

        notes.forEach(function (freq, index) {
            tone({
                freq: freq,
                duration: duration,
                type: type,
                volume: volume,
                delay: index * step
            });
        });
    }

    // シンプルな共通プリセット効果音を再生する
    function play(name, options) {
        if (!enabled) return;
        const opts = options || {};

        switch (name) {
            case 'tap':
            case 'click':
                tone({ freq: 520, endFreq: 620, duration: 0.055, type: 'sine', volume: 0.06 });
                break;

            case 'shot': {
                const power = clamp01(opts.power, 0.5);
                tone({
                    freq: 250 + power * 110,
                    endFreq: 140 + power * 55,
                    duration: 0.095,
                    type: 'sine',
                    volume: 0.075 + power * 0.035
                });
                break;
            }

            case 'wall':
            case 'bounce': {
                const now = Date.now();
                if (now - lastWallPlayedAt < WALL_COOLDOWN_MS) return;
                lastWallPlayedAt = now;
                const intensity = clamp01(opts.intensity, 0.5);
                tone({
                    freq: 145 + intensity * 35,
                    endFreq: 90,
                    duration: 0.055,
                    type: 'triangle',
                    volume: 0.03 + intensity * 0.05
                });
                break;
            }

            case 'hit':
            case 'pickup': {
                // 連続吸収・連続ヒットで少しずつ音程が上がるペンタトニック音階
                const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
                const rawCombo = Number(opts.combo);
                const combo = Number.isFinite(rawCombo) && rawCombo > 0 ? Math.floor(rawCombo) : 0;
                const index = Math.min(combo, scale.length - 1);
                tone({
                    freq: scale[index],
                    duration: 0.14,
                    type: 'sine',
                    volume: 0.09
                });
                break;
            }

            case 'good':
            case 'correct':
                playSequence([659.25, 783.99], {
                    step: 0.08,
                    duration: 0.16,
                    type: 'sine',
                    volume: 0.085
                });
                break;

            case 'miss':
            case 'ng':
                playSequence([220, 165], {
                    step: 0.09,
                    duration: 0.16,
                    type: 'triangle',
                    volume: 0.07
                });
                break;

            case 'clear':
                playSequence([523.25, 659.25, 783.99], {
                    step: 0.085,
                    duration: 0.22,
                    type: 'sine',
                    volume: 0.09
                });
                break;

            case 'fanfare':
                playSequence([523.25, 659.25, 783.99], {
                    step: 0.1,
                    duration: 0.22,
                    type: 'sine',
                    volume: 0.09
                });
                // 最後の音にやさしい長3度（ミ）を薄く重ねる
                tone({ freq: 1046.5, duration: 0.36, type: 'sine', volume: 0.095, delay: 0.3 });
                tone({ freq: 659.25, duration: 0.36, type: 'sine', volume: 0.045, delay: 0.3 });
                break;

            case 'gameover':
                playSequence([392.0, 329.63, 261.63], {
                    step: 0.11,
                    duration: 0.22,
                    type: 'triangle',
                    volume: 0.075
                });
                break;

            default:
                break;
        }
    }

    // 登録済みのボタン1件の表示を現在の状態に合わせる
    function syncButton(entry) {
        const el = entry.el;
        if (!el) return;
        try {
            el.textContent = enabled ? entry.onText : entry.offText;
            if (typeof el.setAttribute === 'function') {
                el.setAttribute('aria-pressed', enabled ? 'true' : 'false');
                el.setAttribute('aria-label', enabled ? entry.onLabel : entry.offLabel);
            }
            if (el.classList && typeof el.classList.toggle === 'function') {
                el.classList.toggle('is-muted', !enabled);
            }
        } catch (err) {
            // DOM操作失敗時も無視
        }
    }

    // 登録済みのすべてのボタン表示を同期する
    function syncAllButtons() {
        boundButtons.forEach(syncButton);
    }

    // 効果音の有効・無効を返す
    function isEnabled() {
        return enabled;
    }

    // 効果音の有効・無効を設定する
    function setEnabled(nextEnabled) {
        enabled = Boolean(nextEnabled);
        writeStoredEnabled(enabled);
        syncAllButtons();
        return enabled;
    }

    // 効果音の ON/OFF を切り替え、ON になった時だけ確認音を鳴らす
    function toggle() {
        const next = !enabled;
        if (next) {
            unlock();
        }
        setEnabled(next);
        if (next) {
            play('tap');
        }
        return next;
    }

    // 効果音 ON/OFF ボタンを紐づけて状態を同期する
    function bindButton(buttonEl, options) {
        if (!buttonEl) return;
        const opts = options || {};

        let entry = boundButtons.find(function (item) {
            return item.el === buttonEl;
        });

        if (!entry) {
            entry = {
                el: buttonEl,
                onText: opts.onText || '🔊',
                offText: opts.offText || '🔇',
                onLabel: opts.onLabel || '効果音をオフにする',
                offLabel: opts.offLabel || '効果音をオンにする'
            };
            boundButtons.push(entry);

            if (typeof buttonEl.addEventListener === 'function') {
                buttonEl.addEventListener('click', function () {
                    toggle();
                });
            }
        } else {
            if (opts.onText) entry.onText = opts.onText;
            if (opts.offText) entry.offText = opts.offText;
            if (opts.onLabel) entry.onLabel = opts.onLabel;
            if (opts.offLabel) entry.offLabel = opts.offLabel;
        }

        syncButton(entry);
    }

    // 別タブ・別画面でのミュート切り替えを即時同期する
    if (typeof global.addEventListener === 'function') {
        global.addEventListener('storage', function (event) {
            if (event && event.key === STORAGE_KEY) {
                enabled = readStoredEnabled();
                syncAllButtons();
            }
        });
    }

    bindAutoUnlock();

    global.PapanSE = {
        unlock: unlock,
        isEnabled: isEnabled,
        setEnabled: setEnabled,
        toggle: toggle,
        tone: tone,
        play: play,
        bindButton: bindButton
    };
})(typeof window !== 'undefined' ? window : globalThis);
