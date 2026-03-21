/* ============================================
   main.js — パフォーマンスラボ 進行管理
   各ゲームの切り替えとスコア集計を担当
   ============================================ */

'use strict';

/* ---------- 全体の状態オブジェクト ---------- */
const measurementState = {
    currentScene: 'title',   // 現在のシーン名
    currentGameIndex: 0,      // 現在のゲーム番号（0〜4）
    results: {                // 各ゲームの生結果
        starflash:  null,     // { taps, avgReactionMs }
        ruler:      null,     // { bestMs }
        stroop:     null,     // { correctRate, avgSpeedMs }
        animalMot:  null,     // { correctRate }
        timing:     null,     // { avgOffset, shots }
    },
    scores: {                 // 正規化後の0〜100スコア
        starflash:  0,
        ruler:      0,
        stroop:     0,
        animalMot:  0,
        timing:     0,
    }
};

/* ---------- ゲーム定義一覧 ---------- */
const GAME_SEQUENCE = [
    {
        id: 'starflash',
        moduleKey: 'Game1',            // window.Game1 として登録される
        scene: 'game',                 // 遷移先シーンID
        name: 'スターフラッシュ',
        icon: '⭐',
        ability: 'はっけんスピード',
        bannerClass: 'g1',
    },
    {
        id: 'ruler',
        moduleKey: 'Game2',
        scene: 'game',
        name: 'ものさしキャッチ',
        icon: '📏',
        ability: 'はんのうスピード',
        bannerClass: 'g2',
    },
    {
        id: 'stroop',
        moduleKey: 'Game3',
        scene: 'game',
        name: 'いろとことばのわな',
        icon: '🎨',
        ability: 'はんだんりょく',
        bannerClass: 'g3',
    },
    {
        id: 'animalMot',
        moduleKey: 'Game4',
        scene: 'game',
        name: 'アニマルついせき',
        icon: '🐿️',
        ability: 'きおく・しゅうちゅう',
        bannerClass: 'g4',
    },
    {
        id: 'timing',
        moduleKey: 'Game5',
        scene: 'game',
        name: 'シャッターチャンス',
        icon: '📷',
        ability: 'タイミング・どうたいしりょく',
        bannerClass: 'g5',
    },
];

/* ---------- シーン遷移 ---------- */
/**
 * 指定したシーンに切り替える。
 * @param {string} nextScene - 遷移先シーンID
 */
function changeScene(nextScene) {
    // 全シーンを非表示に
    document.querySelectorAll('.scene').forEach(el => el.classList.remove('active'));
    // 対象シーンを表示
    const target = document.getElementById(`${nextScene}-scene`);
    if (target) {
        target.classList.add('active');
    }
    measurementState.currentScene = nextScene;
    updateProgressBar();
}

/* ---------- プログレスバー更新 ---------- */
function updateProgressBar() {
    const total = GAME_SEQUENCE.length; // 5ゲーム
    const idx   = measurementState.currentGameIndex;
    const scene = measurementState.currentScene;

    let progress = 0;
    if (scene === 'title')    progress = 0;
    else if (scene === 'game') progress = ((idx) / total) * 100;
    else if (scene === 'result') progress = 100;

    const fill = document.getElementById('progress-bar-fill');
    if (fill) fill.style.width = `${progress}%`;

    // ステップラベルのハイライト
    document.querySelectorAll('.step-label').forEach((el, i) => {
        el.classList.toggle('active', i < idx || scene === 'result');
    });
}

/* ---------- App インターフェース ---------- */
/**
 * 各ゲームJSが終了時に呼び出す共通インターフェース。
 * @param {string} gameId   - ゲームID（measurementState.results のキー）
 * @param {object} data     - ゲームの生データ（ゲームごとに異なる構造）
 */
const App = {
    saveResult(gameId, data) {
        // 結果を保存
        if (gameId in measurementState.results) {
            measurementState.results[gameId] = data;
        }

        // 次のゲームへ進む
        measurementState.currentGameIndex++;

        if (measurementState.currentGameIndex < GAME_SEQUENCE.length) {
            // 次のゲームを開始
            startNextGame();
        } else {
            // 全ゲーム終了 → リザルトへ
            showResult();
        }
    },

    // ゲームエリアの HTML を設定するヘルパー
    setGameHTML(html) {
        const area = document.getElementById('game-area');
        if (area) area.innerHTML = html;
    },

    // ゲームバナーのスタイルを更新するヘルパー
    setGameBanner(gameIdx) {
        const info = GAME_SEQUENCE[gameIdx];
        const banner = document.getElementById('game-banner');
        if (!banner || !info) return;
        banner.className = `game-banner ${info.bannerClass}`;
        banner.querySelector('.game-banner-icon').textContent = info.icon;
        banner.querySelector('.game-banner-name').textContent = info.name;
        banner.querySelector('.game-banner-ability').textContent = info.ability;
    },

    // フィードバック（正解・不正解）を表示するヘルパー
    showFeedback(type) {  // type: 'correct' | 'wrong'
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
/**
 * カウントダウン後にコールバックを実行する。
 * @param {Function} callback - カウントダウン完了後に呼ぶ関数
 */
function startCountdown(callback) {
    changeScene('countdown');
    let count = 3;
    const display = document.getElementById('countdown-display');

    const tick = () => {
        if (!display) return;
        if (count > 0) {
            display.textContent = count;
            display.style.animation = 'none';
            // リフロー強制でアニメーションをリセット
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
    const idx  = measurementState.currentGameIndex;
    const info = GAME_SEQUENCE[idx];

    startCountdown(() => {
        changeScene('game');
        App.setGameBanner(idx);

        // 対応するゲームモジュールを呼び出す
        const gameModule = window[info.moduleKey];
        if (gameModule && typeof gameModule.start === 'function') {
            gameModule.start();
        } else {
            console.warn(`ゲームモジュール ${info.moduleKey} が見つかりません`);
            // スタブ: ゲームがない場合は5秒後に自動でダミーデータを保存して次へ
            setTimeout(() => {
                App.saveResult(info.id, { stub: true });
            }, 2000);
        }
    });
}

/* ---------- リザルト表示 ---------- */
function showResult() {
    // スコア正規化を実行してからリザルト画面へ
    if (window.ResultModule && typeof ResultModule.normalize === 'function') {
        ResultModule.normalize(measurementState.results, measurementState.scores);
    }
    changeScene('result');

    if (window.ResultModule && typeof ResultModule.draw === 'function') {
        ResultModule.draw(measurementState.scores);
    }

    // ポイント付与（タイプD: 全ゲームプレイ完了で固定報酬）
    const totalScore = Object.values(measurementState.scores).reduce((a, b) => a + b, 0);
    const pt = Math.round(totalScore / GAME_SEQUENCE.length); // 平均スコアをポイントに
    if (typeof showPointGetDialog === 'function') {
        showPointGetDialog(pt);
    }
}

/* ---------- DOMContentLoaded 後の初期化 ---------- */
document.addEventListener('DOMContentLoaded', () => {
    initTitle();
    changeScene('title');

    // スタートボタン
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            measurementState.currentGameIndex = 0;
            // 全結果をリセット
            Object.keys(measurementState.results).forEach(k => measurementState.results[k] = null);
            Object.keys(measurementState.scores).forEach(k => measurementState.scores[k] = 0);
            startNextGame();
        });
    }
});
