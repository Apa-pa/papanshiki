/* sugoroku.js - ミッションすごろく ゲームロジック */

// ===============================================
// マスの座標定義（%指定。ボードエリアに対する相対位置）
// S字ルート: 左下スタート → 右上ゴール
// ボードを3列（left: L/C/R）×4行（top: B1/B2/B3/B4）に分割
// ===============================================
const SQ_POSITIONS = [
    // マス0 = スタート（左下）
    { left: '18%', top: '85%' },
    // マス1（右に進む）
    { left: '42%', top: '85%' },
    // マス2（右端）
    { left: '66%', top: '85%' },
    // マス3（折り返し・上へ）
    { left: '82%', top: '65%' },
    // マス4（左に進む）
    { left: '58%', top: '65%' },
    // マス5（左）
    { left: '34%', top: '65%' },
    // マス6（折り返し・上へ）
    { left: '18%', top: '44%' },
    // マス7（右に進む）
    { left: '42%', top: '44%' },
    // マス8（右）
    { left: '66%', top: '44%' },
    // マス9（背景ゴール絵柄のある位置の手前）
    { left: '58%', top: '22%' },
    // マス10 = ゴール（背景のゴール絵柄に合わせた位置）
    { left: '82%', top: '22%' },
];

// サイコロの絵文字対応
const DICE_EMOJI = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// 通常マス報酬変換
function calcReward(diceResult) {
    if (diceResult <= 3) return 1;
    if (diceResult <= 5) return 2;
    return 3;
}

// ゴールマス報酬変換
function calcGoalReward(diceResult) {
    if (diceResult <= 2) return 4;
    if (diceResult <= 4) return 5;
    return 6;
}

// ===============================================
// 状態変数
// ===============================================
let currentUser = null;
let isAnimating  = false;

// ===============================================
// 初期化
// ===============================================
window.addEventListener('DOMContentLoaded', () => {
    buildBoard();
    showUserSelectOverlay();
});

/** すごろくボードのマスとコマを描画する */
function buildBoard() {
    const board = document.getElementById('sugoroku-board');

    SQ_POSITIONS.forEach((pos, i) => {
        const div = document.createElement('div');
        div.className = `sq sq-${i}`;
        div.id = `sq-${i}`;
        div.style.left = pos.left;
        div.style.top  = pos.top;

        if (i === 0) {
            div.innerHTML = '<span class="sq-num">🌿</span><span>スタート</span>';
        } else if (i === 10) {
            div.innerHTML = '<span class="sq-num">🏆</span><span>ゴール</span>';
        } else {
            div.innerHTML = ''; // マスの数字を非表示にする
        }
        board.appendChild(div);
    });

    // マス間の点線動線を描画
    drawPath();
}

/**
 * SVGでマス間にうっすら点線を引いて動線を表示する
 * SVGのviewBox="0 0 100 100" に対してSQ_POSITIONSの%数値をそのまま使う
 */
function drawPath() {
    const svg = document.getElementById('path-svg');
    if (!svg) return;
    svg.innerHTML = ''; // 重複防止

    for (let i = 0; i < SQ_POSITIONS.length - 1; i++) {
        const from = SQ_POSITIONS[i];
        const to   = SQ_POSITIONS[i + 1];
        // '%' を除いて数値に変換
        const x1 = parseFloat(from.left);
        const y1 = parseFloat(from.top);
        const x2 = parseFloat(to.left);
        const y2 = parseFloat(to.top);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'rgba(255,255,255,0.55)');
        line.setAttribute('stroke-width', '0.9');
        line.setAttribute('stroke-dasharray', '2.5 2.5');
        line.setAttribute('stroke-linecap', 'round');
        svg.appendChild(line);
    }
}

// ===============================================
// ユーザー選択
// ===============================================
function showUserSelectOverlay() {
    const overlay = document.getElementById('user-select-overlay');
    const grid    = document.getElementById('user-btn-grid');
    overlay.classList.remove('hidden');

    // ユーザーボタンを生成
    grid.innerHTML = '';
    const users = (typeof getUserNames === 'function') ? getUserNames() : [];
    if (users.length === 0) {
        grid.innerHTML = '<p style="color:#888;">まだユーザーがいません</p>';
    } else {
        users.forEach(u => {
            const btn = document.createElement('button');
            btn.className = 'user-btn';
            btn.textContent = u;
            btn.onclick = () => selectUser(u);
            grid.appendChild(btn);
        });
    }
}

function selectUser(userName) {
    currentUser = userName;
    document.getElementById('user-select-overlay').classList.add('hidden');
    updateHeaderUI();
    updateKomaImage();
    placeKomaAt(getCurrentPosition(), false /* アニメなし */);
    updateAdvanceBtn();
    
    // ユーザー選択直後にミッション一覧を自動表示する
    showMissionList();
}

function updateKomaImage() {
    const imgEl = document.querySelector('#koma img');
    if (!imgEl) return;
    
    const defaultImg = '../an192.webp';
    if (!currentUser) {
        imgEl.src = defaultImg;
        document.getElementById('koma').classList.remove('is-avatar');
        return;
    }
    
    try {
        const allData = JSON.parse(localStorage.getItem('papan_avatar_v1') || '{}');
        const userData = allData[currentUser];
        
        const komaEl = document.getElementById('koma');

        if (userData && userData.current && userData.current !== 'none') {
            imgEl.src = `../avatar/${userData.current}.webp`;
            komaEl.classList.add('is-avatar');
        } else {
            imgEl.src = defaultImg;
            komaEl.classList.remove('is-avatar');
        }
    } catch (e) {
        document.getElementById('koma').classList.remove('is-avatar');
        imgEl.src = defaultImg;
    }
}

// ===============================================
// localStorage アクセサ
// ===============================================
function getCurrentPosition() {
    const pos = JSON.parse(localStorage.getItem('currentPosition') || '{}');
    return pos[currentUser] || 0;
}

function setCurrentPosition(p) {
    const pos = JSON.parse(localStorage.getItem('currentPosition') || '{}');
    pos[currentUser] = p;
    localStorage.setItem('currentPosition', JSON.stringify(pos));
}

// ===============================================
// UI 更新
// ===============================================
function updateHeaderUI() {
    document.getElementById('header-username').textContent = `👤 ${currentUser}`;
    const stock = (typeof getMissionStock === 'function') ? getMissionStock(currentUser) : 0;
    document.getElementById('header-stock').textContent = `🌰 ストック：${stock}かい`;
}

function updateAdvanceBtn() {
    if (!currentUser) return;
    const stock = (typeof getMissionStock === 'function') ? getMissionStock(currentUser) : 0;
    const pos   = getCurrentPosition();
    const btn   = document.getElementById('advance-btn');
    const hint  = document.getElementById('advance-hint');

    if (pos >= 10) {
        btn.disabled = true;
        btn.textContent = '🏆 ゴールおめでとう！';
        hint.textContent = 'もういちどまわるには ゴール演出のあとに スタートへもどります';
    } else if (stock <= 0) {
        btn.disabled = true;
        btn.textContent = '1ます すすむ';
        hint.textContent = 'ストックが0です。ミッションをクリアして ストックをもらおう！';
    } else {
        btn.disabled = false;
        btn.textContent = `1ます すすむ（ストック：${stock}）`;
        hint.textContent = 'ボタンをおして コマをすすめよう！';
    }
}

// ===============================================
// コマ配置・移動
// ===============================================
function placeKomaAt(squareIndex, animated = true) {
    const koma = document.getElementById('koma');
    const pos  = SQ_POSITIONS[squareIndex];
    if (!pos) return;

    if (!animated) {
        // アニメなしで即配置
        koma.style.transition = 'none';
        koma.style.left = pos.left;
        koma.style.top  = pos.top;
        // 次フレームから transition を戻す
        requestAnimationFrame(() => {
            koma.style.transition = '';
        });
    } else {
        koma.classList.add('walking');
        koma.style.left = pos.left;
        koma.style.top  = pos.top;
    }
}

// ===============================================
// メインフロー：コマを1マス進める
// ===============================================
document.getElementById('advance-btn').addEventListener('click', advanceOne);

async function advanceOne() {
    if (!currentUser || isAnimating) return;
    const stocks = JSON.parse(localStorage.getItem('missionStock') || '{}');
    const stock  = stocks[currentUser] || 0;
    if (stock <= 0) return;

    isAnimating = true;
    document.getElementById('advance-btn').disabled = true;

    // ① ストックを -1
    stocks[currentUser] = stock - 1;
    localStorage.setItem('missionStock', JSON.stringify(stocks));

    // ② コマを次のマスへ移動
    const oldPos = getCurrentPosition();
    const newPos = Math.min(oldPos + 1, 10);
    placeKomaAt(newPos, true);

    // ③ 移動完了を待つ（CSS transition 1.2s + 少し余裕）
    await wait(1400);
    document.getElementById('koma').classList.remove('walking');

    // ④ currentPosition を保存
    setCurrentPosition(newPos);
    updateHeaderUI();

    // ⑤ ゴール・各マスのイベント判定
    await handleSquareEvent(newPos);

    isAnimating = false;
    updateAdvanceBtn();
}

async function handleSquareEvent(pos) {
    if (pos >= 10) {
        await showGoalSequence();
    } else if (pos === 5) {
        await showAutoAdvanceEvent(pos, 'コロポックルの道案内で１マスすすむ！');
    } else if ([1, 3, 7, 8].includes(pos)) {
        await showDiceSequence(pos);
    }
}

async function showAutoAdvanceEvent(currentPos, msg) {
    const popup = document.getElementById('event-popup');
    document.getElementById('event-msg').textContent = msg;
    popup.classList.remove('hidden');

    await new Promise(resolve => {
        document.getElementById('event-close-btn').onclick = () => {
            popup.classList.add('hidden');
            resolve();
        };
    });

    // 1マス自動で進む (stock消費なし)
    const nextPos = Math.min(currentPos + 1, 10);
    placeKomaAt(nextPos, true);
    await wait(1400);
    document.getElementById('koma').classList.remove('walking');

    setCurrentPosition(nextPos);
    updateHeaderUI();

    // 進んだ先で再度イベント判定
    await handleSquareEvent(nextPos);
}

// ===============================================
// サイコロ演出 → 報酬付与
// ===============================================
async function showDiceSequence(currentSquare) {
    const diceResult = Math.floor(Math.random() * 6) + 1;
    const reward = calcReward(diceResult);

    // サイコロポップアップ表示
    const popup    = document.getElementById('dice-popup');
    const diceEl   = document.getElementById('sugoroku-dice');
    const rollBtn  = document.getElementById('roll-dice-btn');
    const waitText = document.getElementById('dice-wait-text');
    
    // 初期化状態
    diceEl.setAttribute('data-val', 1);
    diceEl.classList.remove('rolling');
    rollBtn.style.display = 'inline-block';
    waitText.textContent = 'ボタンをおしてね！';
    popup.classList.remove('hidden');

    // サイコロを振るボタンが押されるまで待機
    await new Promise(resolve => {
        rollBtn.onclick = resolve;
    });

    // アニメーション開始
    rollBtn.style.display = 'none';
    waitText.textContent = 'ドキドキ……';
    diceEl.classList.add('rolling');

    // サイコロがクルクル回る演出
    let t = 0;
    const rollInterval = setInterval(() => {
        const r = Math.floor(Math.random() * 6) + 1;
        diceEl.setAttribute('data-val', r);
        t += 150;
        if (t >= 1000) {
            clearInterval(rollInterval);
            diceEl.setAttribute('data-val', diceResult);
            diceEl.classList.remove('rolling');
        }
    }, 150);

    await wait(1500);

    // サイコロポップアップを閉じて報酬ポップアップへ
    popup.classList.add('hidden');
    await showRewardPopup(diceResult, reward, false);
}

// ゴールのサイコロ演出
async function showGoalSequence() {
    // ゴールおめでとうポップアップ
    const goalPop = document.getElementById('goal-popup');
    goalPop.classList.remove('hidden');
    // ボタンを押すまで待つ
    await new Promise(resolve => {
        document.getElementById('goal-next-btn').onclick = () => {
            goalPop.classList.add('hidden');
            resolve();
        };
    });

    // ゴール用サイコロ演出（巨大サイコロへ切り替え）
    const diceResult = Math.floor(Math.random() * 6) + 1;
    const reward = calcGoalReward(diceResult);

    const popup    = document.getElementById('dice-popup');
    const diceEl   = document.getElementById('sugoroku-dice');
    const rollBtn  = document.getElementById('roll-dice-btn');
    const waitText = document.getElementById('dice-wait-text');
    
    document.getElementById('dice-popup-title').textContent = '🌟 ゴールのごほうびサイコロ！';
    
    diceEl.setAttribute('data-val', 1);
    diceEl.classList.remove('rolling');
    rollBtn.style.display = 'inline-block';
    waitText.textContent = 'ボタンをおしてね！';
    popup.classList.remove('hidden');

    // サイコロを振るアクション待機
    await new Promise(resolve => {
        rollBtn.onclick = resolve;
    });

    rollBtn.style.display = 'none';
    waitText.textContent = 'ドキドキ……';
    diceEl.classList.add('rolling');

    let t = 0;
    const rollInterval = setInterval(() => {
        const r = Math.floor(Math.random() * 6) + 1;
        diceEl.setAttribute('data-val', r);
        t += 150;
        if (t >= 1000) {
            clearInterval(rollInterval);
            diceEl.setAttribute('data-val', diceResult);
            diceEl.classList.remove('rolling');
        }
    }, 150);

    await wait(1500);
    popup.classList.add('hidden');
    document.getElementById('dice-popup-title').textContent = '🎲 サイコロをふるよ！';

    await showRewardPopup(diceResult, reward, true);

    // ゴール後リセット（スタートに戻る）
    setCurrentPosition(0);
    placeKomaAt(0, true);
    await wait(1400);
    document.getElementById('koma').classList.remove('walking');
}

// 報酬ポップアップ
async function showRewardPopup(diceResult, donguri, isGoal) {
    const popup = document.getElementById('reward-popup');
    document.getElementById('reward-dice-result').textContent = `${DICE_EMOJI[diceResult]} (${diceResult})`;
    document.getElementById('reward-amount').textContent = `🌰 × ${donguri}`;
    document.getElementById('reward-msg').textContent = isGoal
        ? `ゴールボーナス！ どんぐり ${donguri}こ ゲット！`
        : `どんぐり ${donguri}こ ゲット！`;

    popup.classList.remove('hidden');

    // ユーザー名に対してどんぐりを付与
    if (typeof addDonguri === 'function') {
        addDonguri(currentUser, donguri);
    }

    await new Promise(resolve => {
        document.getElementById('reward-close-btn').onclick = () => {
            popup.classList.add('hidden');
            resolve();
        };
    });
}

// ===============================================
// ミッションリスト表示
// ===============================================
document.getElementById('mission-list-btn').addEventListener('click', showMissionList);

function showMissionList() {
    if (!currentUser) { showUserSelectOverlay(); return; }
    const popup = document.getElementById('mission-popup');
    const list  = document.getElementById('mission-items');
    list.innerHTML = '';

    const missions = (typeof getWeeklyMissionList === 'function')
        ? getWeeklyMissionList(currentUser)
        : [];

    const doneCount = missions.filter(m => m.done).length;
    document.getElementById('mission-progress').textContent =
        `こんしゅうのミッション：${doneCount} / ${missions.length} クリア`;

    missions.forEach(m => {
        const div = document.createElement('div');
        div.className = `mission-item ${m.done ? 'done' : 'todo'}`;
        div.innerHTML = `
            <span class="mission-emoji">${m.emoji}</span>
            <span>${m.name}</span>
            <span class="mission-done-mark">${m.done ? '✅' : ''}</span>
        `;
        list.appendChild(div);
    });

    popup.classList.remove('hidden');
}

document.getElementById('mission-popup-close').addEventListener('click', () => {
    document.getElementById('mission-popup').classList.add('hidden');
});

// モーダル外（背景レイヤー）をクリックした際にも閉じるようにする
document.getElementById('mission-popup').addEventListener('click', (e) => {
    if (e.target.id === 'mission-popup') {
        document.getElementById('mission-popup').classList.add('hidden');
    }
});

// ===============================================
// ユーザー切り替えボタン
// ===============================================
document.getElementById('change-user-btn').addEventListener('click', () => {
    showUserSelectOverlay();
});

// ===============================================
// ユーティリティ
// ===============================================
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
