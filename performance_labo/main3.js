/* ============================================
   main3.js — きおく力測定ラボ（Labo 3） 進行管理
   体力測定型（どこまでできるか）の適応進行・スコア管理
   ============================================ */

'use strict';

/* ---------- ラボ3記録のストレージキー ---------- */
const LABO_RECORDS_KEY = 'papan_labo3_records_v1';

/**
 * ラボ測定結果を localStorage に保存する。
 * @param {string} userName - ユーザー名
 * @param {object} scores   - 各能力の0〜100スコア (photo, space, order, work, ear)
 * @param {object} records  - 生の測定値 (例: 到達レベル、桁数など)
 */
function saveLaboRecord(userName, scores, records) {
    const all = JSON.parse(localStorage.getItem(LABO_RECORDS_KEY) || '{}');
    if (!all[userName]) all[userName] = [];
    const total = Math.round(
        Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
    );
    const dateStr = (typeof getTodayString === 'function') ? getTodayString() : new Date().toISOString().slice(0, 10);
    all[userName].push({
        date: dateStr,
        scores: { ...scores },
        records: { ...records },
        total
    });
    localStorage.setItem(LABO_RECORDS_KEY, JSON.stringify(all));
}

/**
 * ユーザーの前回記録を取得（成長表示用）
 */
function getPreviousRecord(userName) {
    const all = JSON.parse(localStorage.getItem(LABO_RECORDS_KEY) || '{}');
    const userRecs = all[userName];
    if (userRecs && userRecs.length >= 2) {
        return userRecs[userRecs.length - 2];
    }
    return null;
}

/* ---------- 全体の状態オブジェクト ---------- */
const measurementState = {
    currentScene: 'title',   // 現在のシーン名
    currentGameIndex: 0,     // 現在のゲーム番号（0〜4）
    rawResults: {            // 各ゲームからの戻り値
        flash: null,
        route: null,
        pairs: null,
        passcode: null,
        sound: null,
    },
    scores: {                // 5つの能力値（0〜100）
        photo: 0,
        space: 0,
        order: 0,
        work: 0,
        ear: 0,
    },
    recordsText: {           // 画面表示用の実績テキスト
        photo: '',
        space: '',
        order: '',
        work: '',
        ear: '',
    }
};

/* ---------- ゲーム定義一覧 ---------- */
const GAME_SEQUENCE = [
    {
        id: 'flash',
        moduleKey: 'Labo3Game1',
        name: 'フラッシュキャッチ',
        icon: '📷',
        ability: '一瞬の映像を覚える力',
        bannerClass: 'l3-g1',
    },
    {
        id: 'route',
        moduleKey: 'Labo3Game2',
        name: 'ピカピカ・ルート',
        icon: '🗺',
        ability: '場所と順番を覚える力',
        bannerClass: 'l3-g2',
    },
    {
        id: 'pairs',
        moduleKey: 'Labo3Game3',
        name: 'スピード神経衰弱',
        icon: '🃏',
        ability: '位置をキープする力',
        bannerClass: 'l3-g3',
    },
    {
        id: 'passcode',
        moduleKey: 'Labo3Game4',
        name: 'ぎゃくふごうパスコード',
        icon: '🔢',
        ability: '順序記憶とワーキングメモリ',
        bannerClass: 'l3-g4',
    },
    {
        id: 'sound',
        moduleKey: 'Labo3Game5',
        name: 'おと・メロディきおく',
        icon: '👂',
        ability: '音のながれを覚える力',
        bannerClass: 'l3-g5',
    },
];

/* ---------- シーン遷移 ---------- */
function changeScene(nextScene) {
    document.querySelectorAll('.scene').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`${nextScene}-scene`);
    if (target) {
        target.classList.add('active');
    }
    measurementState.currentScene = nextScene;
    updateProgressBar();
}

/* ---------- プログレスバー更新 ---------- */
function updateProgressBar() {
    const total = GAME_SEQUENCE.length;
    const idx = measurementState.currentGameIndex;
    const scene = measurementState.currentScene;

    let progress = 0;
    if (scene === 'title') progress = 0;
    else if (scene === 'game') progress = ((idx) / total) * 100;
    else if (scene === 'result') progress = 100;

    const fill = document.getElementById('progress-bar-fill');
    if (fill) fill.style.width = `${progress}%`;

    document.querySelectorAll('.step-label').forEach((el, i) => {
        el.classList.toggle('active', i < idx || scene === 'result');
    });
}

/* ---------- App インターフェース ---------- */
const App = {
    /**
     * 各ゲームの完了時に呼ばれる
     */
    saveResult(gameId, data) {
        if (gameId in measurementState.rawResults) {
            measurementState.rawResults[gameId] = data;
        }

        measurementState.currentGameIndex++;

        if (measurementState.currentGameIndex < GAME_SEQUENCE.length) {
            startNextGame();
        } else {
            showResult();
        }
    },

    setGameHTML(html) {
        const area = document.getElementById('game-area');
        if (area) area.innerHTML = html;
    },

    setGameBanner(gameIdx) {
        const info = GAME_SEQUENCE[gameIdx];
        const banner = document.getElementById('game-banner');
        if (!banner || !info) return;
        banner.className = `game-banner ${info.bannerClass}`;
        banner.querySelector('.game-banner-icon').textContent = info.icon;
        banner.querySelector('.game-banner-name').textContent = info.name;
        banner.querySelector('.game-banner-ability').textContent = info.ability;
    },

    showFeedback(type) {
        const overlay = document.getElementById('feedback-overlay');
        if (!overlay) return;
        overlay.className = `show ${type}`;
        overlay.textContent = type === 'correct' ? '⭕' : '❌';
        setTimeout(() => { overlay.className = ''; }, 450);
    },
};

/* ---------- タイトル画面初期化 ---------- */
function initTitle() {
    const list = document.getElementById('game-list-preview');
    if (!list) return;
    list.innerHTML = '';
    GAME_SEQUENCE.forEach((g, i) => {
        list.innerHTML += `
        <div class="game-card">
            <div class="game-card-icon">${g.icon}</div>
            <div class="game-card-info">
                <div class="game-card-name">${i + 1}. ${g.name}</div>
                <div class="game-card-desc">${g.ability}をそくてい</div>
            </div>
        </div>`;
    });
}

/* ---------- カウントダウン ---------- */
function startCountdown(callback) {
    changeScene('countdown');
    let count = 3;
    const display = document.getElementById('countdown-display');

    const tick = () => {
        if (!display) return;
        if (count > 0) {
            display.textContent = count;
            display.style.animation = 'none';
            void display.offsetWidth;
            display.style.animation = '';
            count--;
            setTimeout(tick, 700);
        } else {
            display.textContent = 'GO!';
            setTimeout(() => {
                callback();
            }, 500);
        }
    };
    tick();
}

/* ---------- ゲーム開始 ---------- */
function startNextGame() {
    const idx = measurementState.currentGameIndex;
    const info = GAME_SEQUENCE[idx];

    startCountdown(() => {
        changeScene('game');
        App.setGameBanner(idx);

        const gameModule = window[info.moduleKey];
        if (gameModule && typeof gameModule.start === 'function') {
            gameModule.start();
        } else {
            console.warn(`ゲームモジュール ${info.moduleKey} が見つかりません`);
            App.setGameHTML(`<div style="padding:40px;text-align:center;">まだ工事中だよ！<br>（自動でつぎへすすみます）</div>`);
            setTimeout(() => {
                App.saveResult(info.id, { stub: true, level: 3 });
            }, 2500);
        }
    });
}

/* ---------- リザルト表示 ---------- */
function showResult() {
    if (window.ResultModule3 && typeof ResultModule3.calculate === 'function') {
        ResultModule3.calculate(
            measurementState.rawResults,
            measurementState.scores,
            measurementState.recordsText
        );
    }
    changeScene('result');

    if (window.ResultModule3 && typeof ResultModule3.draw === 'function') {
        ResultModule3.draw(measurementState.scores, measurementState.recordsText);
    }

    const totalScore = Object.values(measurementState.scores).reduce((a, b) => a + b, 0);
    const pt = Math.max(10, Math.round(totalScore / 5)); // 最低10pt保証

    const scoreSnapshot = { ...measurementState.scores };
    const rawSnapshot = { ...measurementState.rawResults };

    if (typeof showPointGetDialog === 'function') {
        showPointGetDialog(pt, 'labo3', (selectedUserName) => {
            if (selectedUserName) {
                saveLaboRecord(selectedUserName, scoreSnapshot, rawSnapshot);
                // 前回の自分と比較してアップバッジを更新表示
                if (window.ResultModule3 && typeof ResultModule3.applyGrowthBadges === 'function') {
                    const prev = getPreviousRecord(selectedUserName);
                    if (prev) {
                        ResultModule3.applyGrowthBadges(scoreSnapshot, prev.scores);
                    }
                }
                // ミッションすごろく達成通知
                if (typeof addMissionStock === 'function') {
                    addMissionStock(selectedUserName, 'labo3');
                }
            }
        });
    }
}

/* ---------- 初期化 ---------- */
document.addEventListener('DOMContentLoaded', () => {
    initTitle();
    changeScene('title');

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            measurementState.currentGameIndex = 0;
            Object.keys(measurementState.rawResults).forEach(k => measurementState.rawResults[k] = null);
            Object.keys(measurementState.scores).forEach(k => measurementState.scores[k] = 0);
            startNextGame();
        });
    }
});
