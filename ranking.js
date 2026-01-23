/* ranking.js - 記録と目標とポイントの管理 */

const GAME_LIST = {
    'make10':         { name: 'あわせて10',         type: 'time',  unit: '秒' },
    'math_add_easy':  { name: 'たしざん(なし)',     type: 'time',  unit: '秒' },
    'math_add_hard':  { name: 'たしざん(あり)',     type: 'time',  unit: '秒' },
    'math_sub_easy':  { name: 'ひきざん(なし)',     type: 'time',  unit: '秒' },
    'math_sub_hard':  { name: 'ひきざん(あり)',     type: 'time',  unit: '秒' },
    'math_multi':     { name: 'かけざん九九',       type: 'time',  unit: '秒' },
    'rain_math':      { name: 'あめふり算数',       type: 'score', unit: '点' },
    'clock_read':     { name: 'とけいの読み方',     type: 'time',  unit: '秒' },
    'triangle_angle': { name: '三角形の内角',       type: 'time',  unit: '秒' },
    'katakana':       { name: 'カタカナ変換',       type: 'time',  unit: '秒' },
    'alphabet':       { name: 'a-zアルファベット',  type: 'time',  unit: '秒' },
    'romaji_hole':    { name: 'ローマ字虫くい',     type: 'time',  unit: '秒' },
    'rain_vowel':     { name: 'あめふりローマ字(母)', type: 'score', unit: '点' },
    'rain_consonant': { name: 'あめふりローマ字(子)', type: 'score', unit: '点' },
    'touch25':        { name: '1から25までタッチ',  type: 'time',  unit: '秒' },
    'tsumitsumi':     { name: '漢字つみつみ',       type: 'score', unit: 'こ' },
    'eawase':         { name: 'えあわせ',           type: 'time',  unit: '秒' }
};

// 保存キー定義
const STORAGE_KEY = 'papan_records_v1';
const GOAL_KEY = 'papan_goals_v1';
const POINT_KEY = 'papan_points_v1';
const REWARDED_KEY = 'papan_rewarded_history_v1';
const STAMP_KEY = 'papan_stamps_v3';
const COLLECTION_KEY = 'papan_collection_v1';

// --- データ取得・保存系 ---

function getAllRecords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}
function getAllGoals() {
    return JSON.parse(localStorage.getItem(GOAL_KEY) || '{}');
}

// ▼▼▼ 今回追加した部分（目標の保存） ▼▼▼
function saveGoal(userName, gameId, value) {
    const goals = getAllGoals();
    if (!goals[userName]) goals[userName] = {};
    
    goals[userName][gameId] = value;
    localStorage.setItem(GOAL_KEY, JSON.stringify(goals));
}
// ▲▲▲ ここまで ▲▲▲

function getAllStamps() {
    return JSON.parse(localStorage.getItem(STAMP_KEY) || '{}');
}

// ユーザー名一覧を取得（記録、ポイント、スタンプのいずれかがある人）
function getUserNames() {
    const r = getAllRecords();
    const p = JSON.parse(localStorage.getItem(POINT_KEY) || '{}');
    const s = getAllStamps();
    
    // 全てのキー（名前）をマージして重複をなくす
    const names = new Set([
        ...Object.keys(r),
        ...Object.keys(p),
        ...Object.keys(s)
    ]);
    return Array.from(names);
}

// ポイント関連
function getUserPoints(userName) {
    const data = JSON.parse(localStorage.getItem(POINT_KEY) || '{}');
    return data[userName] || 0;
}

function addPoints(userName, amount) {
    const allPoints = JSON.parse(localStorage.getItem(POINT_KEY) || '{}');
    const current = allPoints[userName] || 0;
    allPoints[userName] = current + amount;
    localStorage.setItem(POINT_KEY, JSON.stringify(allPoints));
    return allPoints[userName];
}

function spendPoints(userName, amount) {
    const allPoints = JSON.parse(localStorage.getItem(POINT_KEY) || '{}');
    const current = allPoints[userName] || 0;
    if (current >= amount) {
        allPoints[userName] = current - amount;
        localStorage.setItem(POINT_KEY, JSON.stringify(allPoints));
        return true;
    }
    return false;
}

// コレクション関連
function getCollection(userName) {
    const data = JSON.parse(localStorage.getItem(COLLECTION_KEY) || '{}');
    return data[userName] || [];
}

function addToCollection(userName, itemId) {
    const data = JSON.parse(localStorage.getItem(COLLECTION_KEY) || '{}');
    if (!data[userName]) data[userName] = [];
    if (!data[userName].includes(itemId)) {
        data[userName].push(itemId);
        localStorage.setItem(COLLECTION_KEY, JSON.stringify(data));
        return true; 
    }
    return false;
}

// スタンプ関連
function getTodayString() {
    const d = new Date();
    const y = d.getFullYear();
    const m = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${y}-${m}-${day}`;
}

function setStamp(userName, dateStr, imageName) {
    const allStamps = getAllStamps();
    if (!allStamps[userName]) allStamps[userName] = {}; 
    allStamps[userName][dateStr] = imageName; 
    localStorage.setItem(STAMP_KEY, JSON.stringify(allStamps));
}

function removeStamp(userName, dateStr) {
    const allStamps = getAllStamps();
    if (allStamps[userName] && allStamps[userName][dateStr]) {
        delete allStamps[userName][dateStr];
        localStorage.setItem(STAMP_KEY, JSON.stringify(allStamps));
    }
}

function toggleStamp(userName, dateStr, forceAdd = false) {
    const allStamps = getAllStamps();
    const current = allStamps[userName] ? allStamps[userName][dateStr] : null;
    const defaultStamp = 'hi-an-192.png';

    if (forceAdd) {
        if (!current) setStamp(userName, dateStr, defaultStamp);
    } else {
        if (current) removeStamp(userName, dateStr);
        else setStamp(userName, dateStr, defaultStamp);
    }
}

// 記録保存
function saveRecord(userName, gameId, value) {
    const records = getAllRecords();
    if (!records[userName]) records[userName] = {};
    
    const currentBest = records[userName][gameId];
    const gameType = GAME_LIST[gameId] ? GAME_LIST[gameId].type : 'score';
    let isNewRecord = false;

    if (currentBest === undefined) {
        isNewRecord = true;
    } else {
        if (gameType === 'score') {
            if (parseFloat(value) > parseFloat(currentBest)) isNewRecord = true;
        } else {
            if (parseFloat(value) < parseFloat(currentBest)) isNewRecord = true;
        }
    }

    if (isNewRecord) {
        records[userName][gameId] = value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        return true; 
    }
    return false;
}

// ポイント付与判定（目標達成時）
function checkAndAwardPoints(userName, gameId, currentRecord) {
    const goals = getAllGoals();
    const userGoal = goals[userName] ? goals[userName][gameId] : null;
    if (userGoal === null || userGoal === undefined || userGoal === "") return false;

    const allPoints = JSON.parse(localStorage.getItem(POINT_KEY) || '{}');
    const allHistory = JSON.parse(localStorage.getItem(REWARDED_KEY) || '{}');
    if (!allPoints[userName]) allPoints[userName] = 0;
    if (!allHistory[userName]) allHistory[userName] = {};

    const recordVal = parseFloat(currentRecord);
    const goalVal = parseFloat(userGoal);
    const info = GAME_LIST[gameId];
    if (isNaN(recordVal) || isNaN(goalVal) || !info) return false;

    let isAchieved = false;
    if (info.type === 'score') {
        if (recordVal >= goalVal) isAchieved = true;
    } else {
        if (recordVal <= goalVal) isAchieved = true;
    }

    if (!isAchieved) return false;

    const lastRewardedGoal = allHistory[userName][gameId];
    if (lastRewardedGoal !== goalVal) {
        allPoints[userName] += 100;
        allHistory[userName][gameId] = goalVal;
        localStorage.setItem(POINT_KEY, JSON.stringify(allPoints));
        localStorage.setItem(REWARDED_KEY, JSON.stringify(allHistory));
        return true; 
    }
    return false;
}

// ポイントリセット
function resetUserPoints(userName) {
    const allPoints = JSON.parse(localStorage.getItem(POINT_KEY) || '{}');
    if (allPoints[userName]) {
        allPoints[userName] = 0;
        localStorage.setItem(POINT_KEY, JSON.stringify(allPoints));
    }
    const allHistory = JSON.parse(localStorage.getItem(REWARDED_KEY) || '{}');
    if (allHistory[userName]) {
        allHistory[userName] = {};
        localStorage.setItem(REWARDED_KEY, JSON.stringify(allHistory));
    }
}

// --- ダイアログ表示系 ---

// 1. 記録保存ダイアログ
function showSaveDialog(gameId, resultValue) {
    const old = document.getElementById('ranking-overlay');
    if(old) old.remove();

    const gameInfo = GAME_LIST[gameId] || { name: 'このゲーム', unit: '' };
    const users = getUserNames();
    
    let usersHtml = '';
    if (users.length > 0) {
        usersHtml += '<p style="margin:10px 0; font-size:14px; color:#ccc;">きろくする人を選んでね</p>';
        users.forEach(u => {
            usersHtml += `<button onclick="Ranking.selectUser('${u}')" style="margin:5px; padding:12px 20px; font-size:18px; cursor:pointer; background:#4CAF50; color:white; border:none; border-radius:30px; font-weight:bold;">${u}</button>`;
        });
    }

    const overlay = document.createElement('div');
    overlay.id = 'ranking-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 99999;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        color: white; font-family: sans-serif; text-align: center;
    `;

    overlay.innerHTML = `
        <div style="background:white; color:#333; padding:25px; border-radius:20px; width:90%; max-width:400px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            <h2 style="margin:0 0 10px 0; color:#555; font-size:20px;">${gameInfo.name}</h2>
            <div style="background:#fce4ec; border-radius:10px; padding:15px; margin-bottom:20px;">
                <div style="font-size:14px; color:#880e4f;">今回のきろく</div>
                <div style="font-size:36px; font-weight:bold; color:#e91e63;">
                    ${resultValue} <span style="font-size:16px;">${gameInfo.unit}</span>
                </div>
            </div>
            <div id="user-list" style="margin-bottom:20px;">${usersHtml}</div>
            <div style="border-top:2px dashed #eee; padding-top:20px; margin-top:10px;">
                <p style="margin:0 0 10px 0; font-size:14px; font-weight:bold;">あたらしく 登録する</p>
                <div style="display:flex; justify-content:center; gap:5px;">
                    <input type="text" id="new-username" placeholder="おなまえ" style="padding:10px; font-size:16px; width:60%; border:2px solid #ddd; border-radius:5px;">
                    <button onclick="Ranking.registerNew()" style="padding:10px 20px; font-size:16px; background:#2196F3; color:white; border:none; border-radius:5px; font-weight:bold;">OK</button>
                </div>
            </div>
            <button onclick="document.getElementById('ranking-overlay').remove()" style="margin-top:25px; background:none; border:none; color:#999; text-decoration:underline; cursor:pointer;">保存しないで とじる</button>
        </div>
    `;
    document.body.appendChild(overlay);

    window.Ranking = {
        selectUser: (name) => {
            const isNew = saveRecord(name, gameId, resultValue);
            const earnedPoints = checkAndAwardPoints(name, gameId, resultValue);
            
            if(typeof toggleStamp === 'function') {
                toggleStamp(name, getTodayString(), true);
            }

            document.getElementById('ranking-overlay').remove();
            
            setTimeout(() => {
                let msg = `${name}さんの記録として保存しました。`;
                if (isNew) msg = `すごい！ ${name}さんの\nじこベスト更新！🎉`;
                if (earnedPoints) msg += `\n\n🎁 目標クリア！\n100ポイント ゲット！！`;
                alert(msg);
            }, 100);
        },
        registerNew: () => {
            const name = document.getElementById('new-username').value.trim();
            if(!name) { alert("なまえを入れてね"); return; }
            Ranking.selectUser(name);
        }
    };
}

// 2. ポイント獲得ダイアログ（記録なし）
function showPointGetDialog(amount) {
    const old = document.getElementById('ranking-overlay');
    if(old) old.remove();

    const users = getUserNames();
    let usersHtml = '';
    
    if (users.length > 0) {
        usersHtml += '<p style="margin:10px 0; font-size:14px; color:#ccc;">だれが ポイントをもらう？</p>';
        users.forEach(u => {
            usersHtml += `<button onclick="RankingPoint.selectUser('${u}', ${amount})" style="margin:5px; padding:12px 20px; font-size:18px; cursor:pointer; background:#ff9800; color:white; border:none; border-radius:30px; font-weight:bold;">${u}</button>`;
        });
    } else {
        usersHtml = '<p style="color:#aaa;">まだ ユーザーがいません</p>';
    }

    const overlay = document.createElement('div');
    overlay.id = 'ranking-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 99999;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        color: white; font-family: sans-serif; text-align: center;
    `;

    overlay.innerHTML = `
        <div style="background:white; color:#333; padding:25px; border-radius:20px; width:90%; max-width:400px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div style="font-size:60px; margin-bottom:10px;">🎁</div>
            <h2 style="margin:0 0 10px 0; color:#e65100; font-size:24px;">クリアおめでとう！</h2>
            <div style="background:#fff3e0; border-radius:10px; padding:15px; margin-bottom:20px;">
                <div style="font-size:14px; color:#ef6c00;">ごほうび</div>
                <div style="font-size:36px; font-weight:bold; color:#d84315;">
                    ${amount} <span style="font-size:16px;">ポイント</span>
                </div>
            </div>
            
            <div id="user-list" style="margin-bottom:10px;">${usersHtml}</div>

            <div style="border-top:2px dashed #eee; padding-top:20px; margin-top:10px;">
                <p style="margin:0 0 10px 0; font-size:14px; font-weight:bold;">あたらしく 登録してGET</p>
                <div style="display:flex; justify-content:center; gap:5px;">
                    <input type="text" id="point-new-user" placeholder="おなまえ" style="padding:10px; font-size:16px; width:60%; border:2px solid #ddd; border-radius:5px;">
                    <button onclick="RankingPoint.registerNew(${amount})" style="padding:10px 20px; font-size:16px; background:#2196F3; color:white; border:none; border-radius:5px; font-weight:bold;">OK</button>
                </div>
            </div>
            <button onclick="document.getElementById('ranking-overlay').remove()" style="margin-top:20px; background:none; border:none; color:#999; text-decoration:underline; cursor:pointer;">とじる</button>
        </div>
        <style>@keyframes popIn { from {transform:scale(0.8); opacity:0;} to {transform:scale(1); opacity:1;} }</style>
    `;
    document.body.appendChild(overlay);

    window.RankingPoint = {
        selectUser: (name, pts) => {
            const total = addPoints(name, pts);
            // スタンプも押してあげる
            if(typeof toggleStamp === 'function') {
                toggleStamp(name, getTodayString(), true);
            }

            document.getElementById('ranking-overlay').remove();
            setTimeout(() => {
                alert(`${name}さんに ${pts}ポイント！\n(ごうけい: ${total}ポイント)`);
            }, 100);
        },
        registerNew: (pts) => {
            const name = document.getElementById('point-new-user').value.trim();
            if(!name) { alert("なまえを入れてね"); return; }
            // 新規でもそのままポイント付与へ
            RankingPoint.selectUser(name, pts);
        }
    };
}