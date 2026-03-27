/* ============================================
   main2.js — 感覚測定ラボ（Labo 2） 進行管理
   各ゲームの切り替えとスコア集計を担当
   ============================================ */

'use strict';

/* ---------- ラボ2記録のストレージキー ---------- */
const LABO_RECORDS_KEY = 'papan_labo2_records_v1';

/**
 * ラボ測定結果を localStorage に保存する。
 * @param {string} userName - ユーザー名
 * @param {object} scores   - 各ゲームのスコア（0〜100）
 */
function saveLaboRecord(userName, scores) {
    const all = JSON.parse(localStorage.getItem(LABO_RECORDS_KEY) || '{}');
    if (!all[userName]) all[userName] = [];
    const total = Math.round(
        Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
    );
    const dateStr = (typeof getTodayString === 'function') ? getTodayString() : new Date().toISOString().slice(0, 10);
    all[userName].push({ date: dateStr, scores: { ...scores }, total });
    localStorage.setItem(LABO_RECORDS_KEY, JSON.stringify(all));
}

/* ---------- 全体の状態オブジェクト ---------- */
const measurementState = {
    currentScene: 'title',   // 現在のシーン名
    currentGameIndex: 0,      // 現在のゲーム番号（0〜4）
    results: {                // 各ゲームの生結果
        quantity: null,
        speed: null,
        space: null,
        length: null,
        color: null,
    },
    scores: {                 // 正規化後の0〜100スコア
        quantity: 0,
        speed: 0,
        space: 0,
        length: 0,
        color: 0,
    }
};

/* ---------- ゲーム定義一覧 ---------- */
const GAME_SEQUENCE = [
    {
        id: 'quantity',
        moduleKey: 'Labo2Game1',       // window.Labo2Game1 として登録される予定
        scene: 'game',
        name: 'ぱっと見どっち？',
        icon: '🍎',
        ability: 'りょうのかんかく',
        bannerClass: 'g1',
    },
    {
        id: 'speed',
        moduleKey: 'Labo2Game2',
        scene: 'game',
        name: 'トンネルれっしゃ',
        icon: '🚆',
        ability: 'スピードのかんかく',
        bannerClass: 'g2',
    },
    {
        id: 'space',
        moduleKey: 'Labo2Game3',
        scene: 'game',
        name: 'ブロックかぞえ',
        icon: '🧊',
        ability: 'くうかん・かたち',
        bannerClass: 'g3',
    },
    {
        id: 'length',
        moduleKey: 'Labo2Game4',
        scene: 'game',
        name: 'ピタッとおなじながさ',
        icon: '📏',
        ability: 'ながさ・きょり',
        bannerClass: 'g4',
    },
    {
        id: 'color',
        moduleKey: 'Labo2Game5',
        scene: 'game',
        name: 'ピタッとカラー',
        icon: '🎨',
        ability: 'いろのかんかく',
        bannerClass: 'g5',
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
    saveResult(gameId, data) {
        if (gameId in measurementState.results) {
            measurementState.results[gameId] = data;
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
        setTimeout(() => { overlay.className = ''; }, 400);
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
                App.saveResult(info.id, { stub: true });
            }, 3000);
        }
    });
}

/* ---------- リザルト表示 ---------- */
function showResult() {
    if (window.ResultModule2 && typeof ResultModule2.normalize === 'function') {
        ResultModule2.normalize(measurementState.results, measurementState.scores);
    }
    changeScene('result');

    if (window.ResultModule2 && typeof ResultModule2.draw === 'function') {
        ResultModule2.draw(measurementState.scores);
    }

    const totalScore = Object.values(measurementState.scores).reduce((a, b) => a + b, 0);
    const pt = Math.round(totalScore / GAME_SEQUENCE.length) || 10;

    const scoreSnapshot = { ...measurementState.scores };

    if (typeof showPointGetDialog === 'function') {
        showPointGetDialog(pt, (selectedUserName) => {
            if (selectedUserName) {
                saveLaboRecord(selectedUserName, scoreSnapshot);
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
            Object.keys(measurementState.results).forEach(k => measurementState.results[k] = null);
            Object.keys(measurementState.scores).forEach(k => measurementState.scores[k] = 0);
            startNextGame();
        });
    }
});
