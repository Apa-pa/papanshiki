/* sheep_sound.js - ひつじレース関連ページ専用 独自効果音スクリプト (Web Audio API) */
(function (global) {
    'use strict';

    // ポータル全体でミュート設定を引き継ぐための共通キー
    const STORAGE_KEY = 'papan_sound_v1';
    // マスター音量（コンプレッサー後の最終出力）
    const MASTER_VOLUME = 0.95;
    // 根性オーラ発動音の連続再生を防ぐクールダウン（ミリ秒）
    const TENACITY_COOLDOWN_MS = 350;

    let audioCtx = null;
    let compressorNode = null;
    let masterGain = null;
    let outputNode = null;
    let noiseBuffer = null;

    let enabled = readStoredEnabled();
    let unlockListenersBound = false;
    let lifecycleListenersBound = false;
    let lastTenacityPlayedAt = 0;

    // ループ演出用ステート
    let gallopActive = false;
    let gallopTimer = null;
    let gallopStep = 0;
    let gallopSpeed = 1.0;

    let drumrollActive = false;
    let drumrollTimer = null;
    let drumrollStartedAt = 0;
    let drumrollDurationMs = 3500;
    let drumrollStep = 0;

    // 自動再生ブロック時のヒント表示用ステート
    let autoplayWatchEnabled = false;
    let autoplayHintShown = false;
    let autoplayHintDismissed = false;
    let autoplayHintEl = null;

    const boundButtons = [];

    // localStorage からミュート状態を読み込む（未設定・アクセス不可時は ON）
    function readStoredEnabled() {
        try {
            if (typeof global.localStorage === 'undefined') return true;
            return global.localStorage.getItem(STORAGE_KEY) !== 'off';
        } catch (err) {
            return true;
        }
    }

    // localStorage へミュート状態を書き込む
    function writeStoredEnabled(nextEnabled) {
        try {
            if (typeof global.localStorage === 'undefined') return;
            global.localStorage.setItem(STORAGE_KEY, nextEnabled ? 'on' : 'off');
        } catch (err) {
            // 制限環境でも進行を止めない
        }
    }

    // 数値を範囲内に収めるヘルパー
    function clamp(value, min, max, fallback) {
        const num = Number(value);
        if (!Number.isFinite(num)) return fallback;
        return Math.max(min, Math.min(max, num));
    }

    // 1秒分のホワイトノイズバッファを生成して再利用する
    function ensureNoiseBuffer(ctx) {
        if (noiseBuffer || !ctx || typeof ctx.createBuffer !== 'function') {
            return noiseBuffer;
        }
        try {
            const sampleRate = Number(ctx.sampleRate) > 0 ? ctx.sampleRate : 44100;
            const length = Math.floor(sampleRate * 1.0);
            const buffer = ctx.createBuffer(1, length, sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < length; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            noiseBuffer = buffer;
        } catch (err) {
            noiseBuffer = null;
        }
        return noiseBuffer;
    }

    // AudioContext・コンプレッサー・マスターゲインを遅延生成する
    function ensureContext() {
        try {
            if (!audioCtx) {
                const AudioCtx = global.AudioContext || global.webkitAudioContext;
                if (!AudioCtx) return null;
                audioCtx = new AudioCtx();

                masterGain = audioCtx.createGain();
                masterGain.gain.setValueAtTime(MASTER_VOLUME, audioCtx.currentTime);
                masterGain.connect(audioCtx.destination);

                // 多重和音やファンファーレでの音割れを防ぐコンプレッサー
                if (typeof audioCtx.createDynamicsCompressor === 'function') {
                    compressorNode = audioCtx.createDynamicsCompressor();
                    if (compressorNode.threshold) compressorNode.threshold.setValueAtTime(-14, audioCtx.currentTime);
                    if (compressorNode.knee) compressorNode.knee.setValueAtTime(18, audioCtx.currentTime);
                    if (compressorNode.ratio) compressorNode.ratio.setValueAtTime(6, audioCtx.currentTime);
                    if (compressorNode.attack) compressorNode.attack.setValueAtTime(0.003, audioCtx.currentTime);
                    if (compressorNode.release) compressorNode.release.setValueAtTime(0.18, audioCtx.currentTime);
                    compressorNode.connect(masterGain);
                    outputNode = compressorNode;
                } else {
                    outputNode = masterGain;
                }

                ensureNoiseBuffer(audioCtx);
            }

            if (audioCtx.state === 'suspended' && typeof audioCtx.resume === 'function') {
                const res = audioCtx.resume();
                if (res && typeof res.then === 'function') {
                    res.then(function () {
                        if (audioCtx && audioCtx.state === 'running') {
                            removeAutoplayHint(true);
                        }
                    }).catch(function () {
                        // 自動再生制限でブロックされた場合はヒント表示へ任せる
                    });
                }
            } else if (audioCtx.state === 'running') {
                removeAutoplayHint(true);
            }

            return audioCtx;
        } catch (err) {
            return null;
        }
    }

    // 自動再生制限により音が止まっている場合に控えめなタップ案内を出す
    function maybeShowAutoplayHint() {
        if (!autoplayWatchEnabled || !enabled || autoplayHintShown || autoplayHintDismissed) return;
        if (!audioCtx || audioCtx.state !== 'suspended') return;
        if (typeof document === 'undefined' || !document.body || !document.createElement) return;

        try {
            autoplayHintShown = true;
            const tip = document.createElement('button');
            tip.type = 'button';
            tip.id = 'sheep-autoplay-hint';
            tip.textContent = '🔊 タップでレースの効果音が鳴るよ！';
            tip.setAttribute('aria-label', 'タップして効果音を有効にする');
            tip.style.cssText = [
                'position:fixed',
                'left:50%',
                'bottom:16px',
                'transform:translateX(-50%)',
                'z-index:2500',
                'background:rgba(0,0,0,0.85)',
                'color:#ffd700',
                'border:2px solid #ffd700',
                'border-radius:999px',
                'padding:8px 16px',
                'font-size:13px',
                'font-weight:bold',
                'box-shadow:0 4px 12px rgba(0,0,0,0.45)',
                'cursor:pointer',
                'white-space:nowrap'
            ].join(';');

            tip.addEventListener('click', function () {
                unlock();
                play('ui');
                removeAutoplayHint(true);
            });

            document.body.appendChild(tip);
            autoplayHintEl = tip;
        } catch (err) {
            // DOM 操作失敗時も進行に影響させない
        }
    }

    // 自動再生案内ヒントを非表示・破棄する
    function removeAutoplayHint(markDismissed) {
        if (markDismissed) {
            autoplayHintDismissed = true;
        }
        if (autoplayHintEl && autoplayHintEl.parentNode) {
            try {
                autoplayHintEl.parentNode.removeChild(autoplayHintEl);
            } catch (err) {
                // 無視
            }
        }
        autoplayHintEl = null;
    }

    // 遷移直後に自動再生するページ向け：ブロック検出の準備を行う
    function watchAutoplayUnlock() {
        autoplayWatchEnabled = true;
        bindAutoUnlock();
        const ctx = ensureContext();
        if (ctx && ctx.state === 'suspended') {
            maybeShowAutoplayHint();
        }
    }

    // ユーザー操作をきっかけに AudioContext をアンロックする
    function unlock() {
        const ctx = ensureContext();
        if (ctx && ctx.state === 'running') {
            removeAutoplayHint(true);
        }
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
            removeAutoplayHint(true);
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
                try {
                    document.addEventListener(ev, onFirstInteraction, true);
                } catch (err2) {
                    // 無視
                }
            }
        });
    }

    // ページ非表示・離脱時に進行中のループ音を自動停止する
    function bindLifecycleStop() {
        if (lifecycleListenersBound) return;
        lifecycleListenersBound = true;

        if (typeof global.addEventListener === 'function') {
            global.addEventListener('pagehide', function () {
                stopGallop();
                stopDrumroll();
            });
            global.addEventListener('storage', function (event) {
                if (event && event.key === STORAGE_KEY) {
                    enabled = readStoredEnabled();
                    if (!enabled) {
                        removeAutoplayHint(false);
                    }
                    syncAllButtons();
                }
            });
        }

        if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    stopGallop();
                    stopDrumroll();
                }
            });
        }
    }

    // クリックノイズ防止エンベロープ付きの単音・スウィープ再生
    function tone(options) {
        if (!enabled) return;
        const opts = options || {};
        const ctx = ensureContext();
        if (!ctx || !outputNode) return;
        if (ctx.state === 'suspended') {
            maybeShowAutoplayHint();
        }

        try {
            const rawFreq = Number(opts.freq);
            const freq = Number.isFinite(rawFreq) && rawFreq > 0 ? rawFreq : 440;
            const rawEndFreq = opts.endFreq !== null && opts.endFreq !== undefined ? Number(opts.endFreq) : null;
            const endFreq = rawEndFreq !== null && Number.isFinite(rawEndFreq) && rawEndFreq > 0 ? rawEndFreq : null;
            const rawDuration = Number(opts.duration);
            const duration = Number.isFinite(rawDuration) && rawDuration > 0 ? Math.max(0.015, rawDuration) : 0.14;
            const type = opts.type || 'sine';
            const rawVolume = Number(opts.volume);
            const volume = Number.isFinite(rawVolume) && rawVolume > 0 ? rawVolume : 0.1;
            const rawDelay = Number(opts.delay);
            const delay = Number.isFinite(rawDelay) && rawDelay > 0 ? rawDelay : 0;

            const startTime = ctx.currentTime + delay;
            const attackTime = Math.min(startTime + 0.006, startTime + duration * 0.35);
            const endTime = startTime + duration;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);
            if (endFreq !== null) {
                osc.frequency.exponentialRampToValueAtTime(endFreq, endTime);
            }

            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.linearRampToValueAtTime(volume, attackTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

            osc.connect(gain);
            gain.connect(outputNode);

            osc.start(startTime);
            osc.stop(endTime + 0.015);
        } catch (err) {
            // 再生失敗時も進行を止めない
        }
    }

    // 競馬場ブラス風サウンド（2オシレータ＋ローパススウィープ）
    function brassNote(freq, startOffset, duration, volume) {
        if (!enabled) return;
        const ctx = ensureContext();
        if (!ctx || !outputNode) return;
        if (ctx.state === 'suspended') {
            maybeShowAutoplayHint();
        }

        try {
            const baseFreq = Number.isFinite(Number(freq)) && Number(freq) > 0 ? Number(freq) : 440;
            const delay = Math.max(0, Number(startOffset) || 0);
            const dur = Math.max(0.03, Number(duration) || 0.2);
            const vol = Math.max(0.01, Number(volume) || 0.11);

            const startTime = ctx.currentTime + delay;
            const attackTime = Math.min(startTime + 0.018, startTime + dur * 0.3);
            const endTime = startTime + dur;

            const oscMain = ctx.createOscillator();
            const oscSub = ctx.createOscillator();
            const gain = ctx.createGain();

            oscMain.type = 'sawtooth';
            oscMain.frequency.setValueAtTime(baseFreq, startTime);

            oscSub.type = 'triangle';
            oscSub.frequency.setValueAtTime(baseFreq * 1.004, startTime);

            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.linearRampToValueAtTime(vol, attackTime);
            gain.gain.setValueAtTime(vol * 0.85, Math.max(attackTime, endTime - Math.min(0.08, dur * 0.35)));
            gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

            if (typeof ctx.createBiquadFilter === 'function') {
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.Q.setValueAtTime(2.2, startTime);
                filter.frequency.setValueAtTime(650, startTime);
                filter.frequency.linearRampToValueAtTime(2600, Math.min(startTime + 0.04, endTime));
                filter.frequency.exponentialRampToValueAtTime(1300, endTime);

                oscMain.connect(filter);
                oscSub.connect(filter);
                filter.connect(gain);
            } else {
                oscMain.connect(gain);
                oscSub.connect(gain);
            }

            gain.connect(outputNode);

            oscMain.start(startTime);
            oscSub.start(startTime);
            oscMain.stop(endTime + 0.02);
            oscSub.stop(endTime + 0.02);
        } catch (err) {
            // 再生失敗時も無視
        }
    }

    // ホワイトノイズを使った打撃・風・ゲート・歓声サウンド
    function noiseBurst(startOffset, duration, volume, filterType, freq, q, endFreq) {
        if (!enabled) return;
        const ctx = ensureContext();
        if (!ctx || !outputNode) return;
        if (ctx.state === 'suspended') {
            maybeShowAutoplayHint();
        }

        const buf = ensureNoiseBuffer(ctx);
        if (!buf || typeof ctx.createBufferSource !== 'function') return;

        try {
            const delay = Math.max(0, Number(startOffset) || 0);
            const dur = Math.max(0.015, Number(duration) || 0.1);
            const vol = Math.max(0.005, Number(volume) || 0.08);
            const startTime = ctx.currentTime + delay;
            const attackTime = Math.min(startTime + 0.01, startTime + dur * 0.25);
            const endTime = startTime + dur;

            const src = ctx.createBufferSource();
            src.buffer = buf;
            if (dur > 0.95) {
                src.loop = true;
            }

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.linearRampToValueAtTime(vol, attackTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

            if (typeof ctx.createBiquadFilter === 'function') {
                const filter = ctx.createBiquadFilter();
                filter.type = filterType || 'bandpass';
                const startFreq = Number.isFinite(Number(freq)) && Number(freq) > 0 ? Number(freq) : 800;
                filter.frequency.setValueAtTime(startFreq, startTime);
                if (endFreq !== null && endFreq !== undefined && Number(endFreq) > 0) {
                    filter.frequency.exponentialRampToValueAtTime(Number(endFreq), endTime);
                }
                filter.Q.setValueAtTime(Number.isFinite(Number(q)) ? Number(q) : 1.5, startTime);
                src.connect(filter);
                filter.connect(gain);
            } else {
                src.connect(gain);
            }

            gain.connect(outputNode);
            src.start(startTime);
            src.stop(endTime + 0.02);
        } catch (err) {
            // 再生失敗時も無視
        }
    }

    // 歓声風のバンドパスノイズを鳴らす内部ヘルパー
    function playCheer(startOffset, duration, volume) {
        noiseBurst(startOffset, duration, volume, 'bandpass', 550, 1.3, 1150);
        noiseBurst(startOffset + 0.04, duration * 0.85, volume * 0.65, 'bandpass', 950, 1.8, 1650);
    }

    // キラキラのコイン／どんぐり音（連打）
    function playCoinChime(startOffset, count) {
        const notes = [1318.5, 1760.0, 2093.0, 2637.0];
        for (let i = 0; i < count; i++) {
            const freq = notes[i % notes.length];
            tone({
                freq: freq,
                duration: 0.14,
                type: 'sine',
                volume: 0.085,
                delay: startOffset + i * 0.055
            });
        }
    }

    // ひつじレース専用プリセット再生
    function play(name, options) {
        if (!enabled) return;
        const opts = options || {};

        switch (name) {
            case 'ui':
                tone({ freq: 587.33, duration: 0.06, type: 'triangle', volume: 0.085 });
                tone({ freq: 880.0, duration: 0.09, type: 'triangle', volume: 0.085, delay: 0.045 });
                break;

            case 'bet':
                tone({ freq: 1318.5, duration: 0.1, type: 'sine', volume: 0.095, delay: 0 });
                tone({ freq: 1760.0, duration: 0.11, type: 'sine', volume: 0.1, delay: 0.05 });
                tone({ freq: 2093.0, duration: 0.18, type: 'sine', volume: 0.11, delay: 0.1 });
                break;

            case 'train': {
                const trainType = opts.type || 'speed';
                if (trainType === 'speed') {
                    // 高速アルペジオ＋風切りノイズ
                    [523.25, 659.25, 783.99, 1046.5].forEach(function (freq, idx) {
                        tone({ freq: freq, duration: 0.11, type: 'triangle', volume: 0.1, delay: idx * 0.045 });
                    });
                    noiseBurst(0.02, 0.18, 0.075, 'highpass', 1400, 0.8, 3200);
                } else if (trainType === 'stamina') {
                    // 温かい回復和音上昇
                    [392.0, 493.88, 587.33, 783.99].forEach(function (freq, idx) {
                        tone({ freq: freq, duration: 0.18, type: 'triangle', volume: 0.095, delay: idx * 0.07 });
                        tone({ freq: freq * 1.5, duration: 0.16, type: 'sine', volume: 0.045, delay: idx * 0.07 });
                    });
                } else {
                    // 根性：力強いブラス連打＋上昇スウィープ
                    brassNote(293.66, 0, 0.11, 0.1);
                    brassNote(440.0, 0.09, 0.12, 0.11);
                    brassNote(587.33, 0.18, 0.24, 0.12);
                    tone({ freq: 293.66, endFreq: 587.33, duration: 0.24, type: 'triangle', volume: 0.07, delay: 0.08 });
                }
                break;
            }

            case 'contract':
                [523.25, 659.25, 783.99, 987.77, 1046.5].forEach(function (freq, idx) {
                    tone({ freq: freq, duration: 0.18, type: 'triangle', volume: 0.09, delay: idx * 0.055 });
                });
                brassNote(523.25, 0.24, 0.34, 0.085);
                brassNote(659.25, 0.24, 0.34, 0.075);
                brassNote(783.99, 0.24, 0.34, 0.085);
                break;

            case 'error':
                // はっきり分かる低音2連ブザー
                brassNote(196.0, 0, 0.11, 0.11);
                brassNote(155.56, 0.12, 0.18, 0.11);
                tone({ freq: 146.83, endFreq: 110.0, duration: 0.2, type: 'sawtooth', volume: 0.06, delay: 0.12 });
                break;

            case 'miracle':
                // キラキラ6音上昇ハープ＋追い風
                [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98].forEach(function (freq, idx) {
                    tone({ freq: freq, duration: 0.24, type: 'sine', volume: 0.095, delay: idx * 0.065 });
                });
                noiseBurst(0, 0.55, 0.09, 'bandpass', 600, 1.5, 2400);
                brassNote(783.99, 0.36, 0.38, 0.09);
                brassNote(1046.5, 0.42, 0.42, 0.1);
                break;

            case 'countdown': {
                const step = Number(opts.step);
                const freqMap = { 3: 523.25, 2: 587.33, 1: 659.25 };
                const base = freqMap[step] || 523.25;
                brassNote(base, 0, 0.16, 0.115);
                tone({ freq: base * 2, duration: 0.12, type: 'triangle', volume: 0.065 });
                if (step === 1) {
                    tone({ freq: base * 2.5, duration: 0.18, type: 'sine', volume: 0.055, delay: 0.03 });
                }
                break;
            }

            case 'start_fanfare':
                // 競馬場風の短い G1 導入ファンファーレ（約0.85秒）
                brassNote(392.0, 0.00, 0.11, 0.105);
                brassNote(392.0, 0.13, 0.11, 0.105);
                brassNote(392.0, 0.26, 0.11, 0.105);
                brassNote(523.25, 0.39, 0.12, 0.115);
                brassNote(659.25, 0.52, 0.12, 0.115);
                brassNote(783.99, 0.65, 0.34, 0.125);
                brassNote(523.25, 0.65, 0.34, 0.08);
                break;

            case 'gate_open':
                // ガシャン！＋ブラス一斉スタート＋歓声立ち上がり
                noiseBurst(0, 0.15, 0.16, 'bandpass', 950, 1.2, 420);
                tone({ freq: 980, endFreq: 320, duration: 0.1, type: 'square', volume: 0.07 });
                brassNote(523.25, 0.04, 0.28, 0.11);
                brassNote(783.99, 0.04, 0.28, 0.105);
                brassNote(1046.5, 0.04, 0.32, 0.11);
                playCheer(0.06, 0.55, 0.075);
                break;

            case 'tenacity': {
                const now = Date.now();
                if (now - lastTenacityPlayedAt < TENACITY_COOLDOWN_MS) return;
                lastTenacityPlayedAt = now;

                const isPlayer = opts.isPlayer !== false;
                const scale = isPlayer ? 1.0 : 0.48;
                tone({ freq: 392.0, endFreq: 1046.5, duration: 0.26, type: 'sawtooth', volume: 0.07 * scale });
                brassNote(783.99, 0.04, 0.18, 0.105 * scale);
                if (isPlayer) {
                    brassNote(1046.5, 0.11, 0.26, 0.115);
                    noiseBurst(0, 0.22, 0.08, 'highpass', 1200, 1.0, 2800);
                }
                break;
            }

            case 'goal':
                // ゴール板の鐘「カーン！」＋大歓声
                tone({ freq: 1174.66, duration: 0.55, type: 'sine', volume: 0.11 });
                tone({ freq: 2349.32, duration: 0.45, type: 'triangle', volume: 0.07 });
                tone({ freq: 3135.96, duration: 0.35, type: 'sine', volume: 0.045 });
                playCheer(0.05, 1.1, 0.105);
                break;

            case 'win_fanfare': {
                // 豪華ブラス＋ハーモニー＋どんぐりジャラジャラ＋歓声
                const jack = Boolean(opts.jackpot);
                brassNote(523.25, 0.00, 0.15, 0.11);
                brassNote(659.25, 0.13, 0.15, 0.11);
                brassNote(783.99, 0.26, 0.16, 0.115);
                brassNote(1046.5, 0.41, 0.58, 0.13);
                brassNote(659.25, 0.41, 0.58, 0.08);
                brassNote(783.99, 0.41, 0.58, 0.085);

                playCoinChime(0.45, jack ? 6 : 4);
                playCheer(0.12, 1.15, 0.09);

                if (jack) {
                    [1046.5, 1318.5, 1567.98, 2093.0].forEach(function (freq, idx) {
                        tone({ freq: freq, duration: 0.25, type: 'sine', volume: 0.09, delay: 0.52 + idx * 0.065 });
                    });
                }
                break;
            }

            case 'lose':
                // コミカルなトロンボーン風下降
                brassNote(392.0, 0.00, 0.15, 0.09);
                brassNote(369.99, 0.16, 0.15, 0.09);
                brassNote(349.23, 0.32, 0.15, 0.09);
                brassNote(329.63, 0.48, 0.28, 0.095);
                tone({ freq: 329.63, endFreq: 246.94, duration: 0.34, type: 'triangle', volume: 0.08, delay: 0.52 });
                break;

            case 'graduate':
                // 契約満了の温かいオルゴール／ブラス和音
                [523.25, 392.0, 440.0, 329.63, 349.23, 392.0, 523.25].forEach(function (freq, idx) {
                    tone({ freq: freq, duration: 0.26, type: 'sine', volume: 0.085, delay: idx * 0.13 });
                });
                brassNote(523.25, 0.78, 0.55, 0.07);
                brassNote(659.25, 0.78, 0.55, 0.06);
                break;

            case 'reveal':
                // 全国レース結果発表の「ジャジャーン！」＋シンバル＋歓声
                brassNote(523.25, 0.00, 0.13, 0.115);
                brassNote(783.99, 0.00, 0.13, 0.09);
                brassNote(523.25, 0.15, 0.55, 0.125);
                brassNote(659.25, 0.15, 0.55, 0.095);
                brassNote(783.99, 0.15, 0.55, 0.105);
                brassNote(1046.5, 0.15, 0.58, 0.11);
                noiseBurst(0.15, 0.55, 0.085, 'highpass', 3200, 0.8, 1800);
                playCheer(0.18, 1.0, 0.09);
                break;

            default:
                break;
        }
    }

    // 蹄のギャロップ1拍分を鳴らす
    function playGallopBeat(stepIndex) {
        if (!enabled) return;
        // 3拍鳴らして4拍目は休符（「タッタカ・」のリズム）
        const mod = stepIndex % 4;
        if (mod === 3) return;

        const accent = mod === 0 ? 1.0 : mod === 1 ? 0.78 : 0.68;
        const basePitch = mod === 0 ? 155 : mod === 1 ? 190 : 215;

        tone({
            freq: basePitch,
            endFreq: 85,
            duration: 0.042,
            type: 'triangle',
            volume: 0.05 * accent
        });
        noiseBurst(0, 0.036, 0.05 * accent, 'bandpass', 720 + mod * 180, 1.8, 480);
    }

    // ギャロップ音の次ステップを予約する
    function scheduleNextGallop() {
        if (!gallopActive) return;
        playGallopBeat(gallopStep);
        gallopStep++;

        const intervalMs = Math.max(36, Math.round(110 / gallopSpeed));
        gallopTimer = setTimeout(scheduleNextGallop, intervalMs);
    }

    // レース走行中のギャロップ音を開始する
    function startGallop(options) {
        const opts = options || {};
        stopGallop();
        if (opts.speed !== undefined) {
            setGallopSpeed(opts.speed);
        }
        gallopActive = true;
        gallopStep = 0;
        if (enabled) {
            unlock();
        }
        scheduleNextGallop();
    }

    // 倍速設定に応じてギャロップ速度を更新する
    function setGallopSpeed(multiplier) {
        gallopSpeed = clamp(multiplier, 0.5, 4.0, 1.0);
    }

    // ギャロップ音を停止する
    function stopGallop() {
        gallopActive = false;
        if (gallopTimer !== null) {
            clearTimeout(gallopTimer);
            gallopTimer = null;
        }
    }

    // ドラムロールの次ステップを予約する
    function scheduleNextDrumroll() {
        if (!drumrollActive) return;
        const elapsed = Date.now() - drumrollStartedAt;
        if (elapsed >= drumrollDurationMs) {
            stopDrumroll();
            return;
        }

        const progress = clamp(elapsed / Math.max(1, drumrollDurationMs), 0, 1, 0);
        if (enabled) {
            const accent = (drumrollStep % 2 === 0) ? 1.0 : 0.72;
            const vol = (0.045 + progress * 0.075) * accent;
            noiseBurst(0, 0.04, vol, 'bandpass', 1100 + progress * 500, 1.6, 850);
            tone({
                freq: 145 + progress * 35,
                endFreq: 95,
                duration: 0.035,
                type: 'triangle',
                volume: 0.035 * accent
            });
        }
        drumrollStep++;

        // 後半になるにつれて少しずつ連打を速くする
        const stepMs = Math.max(36, Math.round(70 - progress * 30));
        drumrollTimer = setTimeout(scheduleNextDrumroll, stepMs);
    }

    // 全国結果発表アニメーション用のドラムロールを開始する
    function startDrumroll(durationMs) {
        stopDrumroll();
        drumrollDurationMs = clamp(durationMs, 300, 15000, 3500);
        drumrollStartedAt = Date.now();
        drumrollStep = 0;
        drumrollActive = true;
        if (enabled) {
            unlock();
        }
        scheduleNextDrumroll();
    }

    // ドラムロールを停止する
    function stopDrumroll() {
        drumrollActive = false;
        if (drumrollTimer !== null) {
            clearTimeout(drumrollTimer);
            drumrollTimer = null;
        }
    }

    // 登録済みのボタン1件の表示を同期する
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
            // DOM 操作失敗時も無視
        }
    }

    // 登録済みボタンすべての表示を同期する
    function syncAllButtons() {
        boundButtons.forEach(syncButton);
    }

    // 現在の ON/OFF 状態を返す
    function isEnabled() {
        return enabled;
    }

    // 効果音の有効・無効を設定する
    function setEnabled(nextEnabled) {
        enabled = Boolean(nextEnabled);
        writeStoredEnabled(enabled);
        if (!enabled) {
            removeAutoplayHint(false);
        }
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
            play('ui');
        }
        return next;
    }

    // 効果音 ON/OFF ボタンを紐づける
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

    bindAutoUnlock();
    bindLifecycleStop();

    global.SheepSE = {
        unlock: unlock,
        isEnabled: isEnabled,
        setEnabled: setEnabled,
        toggle: toggle,
        bindButton: bindButton,
        watchAutoplayUnlock: watchAutoplayUnlock,
        tone: tone,
        play: play,
        startGallop: startGallop,
        setGallopSpeed: setGallopSpeed,
        stopGallop: stopGallop,
        startDrumroll: startDrumroll,
        stopDrumroll: stopDrumroll
    };
})(typeof window !== 'undefined' ? window : globalThis);
