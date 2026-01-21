/* ranking.js - 記録保存システム */

// ゲームIDリスト（ここにあるゲームだけが記録されます）
const GAME_LIST = {
    'math_add_easy':  { name: 'たしざん', type: 'time', unit: '秒' },
    'math_add_hard':  { name: 'たしざん(くりあがり)', type: 'time', unit: '秒' },
    'math_sub_easy':  { name: 'ひきざん', type: 'time', unit: '秒' },
    'math_sub_hard':  { name: 'ひきざん(くりさがり)', type: 'time', unit: '秒' },
    'math_multi':     { name: 'かけざん九九',   type: 'time', unit: '秒' },
    'rain_math':      { name: 'あめふり算数',       type: 'score', unit: '点' },
    'clock_read':     { name: 'とけいの読み方',     type: 'time', unit: '秒' },
    'triangle_angle': { name: '三角形の内角',       type: 'time', unit: '秒' },
    'katakana':       { name: 'カタカナ変換',       type: 'time', unit: '秒' },
    'alphabet':       { name: 'アルファベット',     type: 'time', unit: '秒' },
    'romaji_hole':    { name: 'ローマ字虫くい',     type: 'time', unit: '秒' },
    'rain_vowel':     { name: 'あめふりローマ字(母音)', type: 'score', unit: '点' },
    'rain_consonant': { name: 'あめふりローマ字(子音)', type: 'score', unit: '点' },
    'touch25':        { name: '1から25までタッチ',  type: 'time',  unit: '秒' }
};

// データの保存場所キー
const STORAGE_KEY = 'papan_records_v1';

// 全データの取得
function getAllRecords() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

// 記録の保存（自己ベスト更新なら保存）
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
            // スコアは高い方が良い
            if (parseFloat(value) > parseFloat(currentBest)) isNewRecord = true;
        } else {
            // タイムは短い（小さい）方が良い
            if (parseFloat(value) < parseFloat(currentBest)) isNewRecord = true;
        }
    }

    if (isNewRecord) {
        records[userName][gameId] = value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        return true; // 更新した
    }
    return false; // 更新ならず
}

// ユーザー名のリスト取得
function getUserNames() {
    const records = getAllRecords();
    return Object.keys(records);
}

// --- ゲームオーバー時に呼び出す「保存画面」 ---
function showSaveDialog(gameId, resultValue) {
    // すでに表示されていたら消す
    const old = document.getElementById('ranking-overlay');
    if(old) old.remove();

    const gameInfo = GAME_LIST[gameId] || { name: 'このゲーム', unit: '' };

    // 画面全体を覆うレイヤーを作成
    const overlay = document.createElement('div');
    overlay.id = 'ranking-overlay';
    // スタイル設定（スマホでも見やすく）
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 99999;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        color: white; font-family: sans-serif; text-align: center;
    `;

    // 既存ユーザーのボタンを作成
    let usersHtml = '';
    const users = getUserNames();
    if (users.length > 0) {
        usersHtml += '<p style="margin:10px 0; font-size:14px; color:#ccc;">きろくする人を選んでね</p>';
        users.forEach(u => {
            usersHtml += `<button onclick="Ranking.selectUser('${u}')" style="margin:5px; padding:12px 20px; font-size:18px; cursor:pointer; background:#4CAF50; color:white; border:none; border-radius:30px; font-weight:bold;">${u}</button>`;
        });
    }

    // HTMLの中身
    overlay.innerHTML = `
        <div style="background:white; color:#333; padding:25px; border-radius:20px; width:90%; max-width:400px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            <h2 style="margin:0 0 10px 0; color:#555; font-size:20px;">${gameInfo.name}</h2>
            
            <div style="background:#fce4ec; border-radius:10px; padding:15px; margin-bottom:20px;">
                <div style="font-size:14px; color:#880e4f;">今回のきろく</div>
                <div style="font-size:36px; font-weight:bold; color:#e91e63;">
                    ${resultValue} <span style="font-size:16px;">${gameInfo.unit}</span>
                </div>
            </div>

            <div id="user-list" style="margin-bottom:20px;">
                ${usersHtml}
            </div>

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

    // HTML内のonclickから呼べるようにwindowに登録
    window.Ranking = {
        selectUser: (name) => {
            const isNew = saveRecord(name, gameId, resultValue);
            document.getElementById('ranking-overlay').remove();
            
            // 保存完了メッセージ
            setTimeout(() => {
                if(isNew) {
                    alert(`すごい！ ${name}さんの\nじこベスト更新！🎉`);
                } else {
                    alert(`${name}さんの記録として保存しました。`);
                }
            }, 100);
        },
        registerNew: () => {
            const name = document.getElementById('new-username').value.trim();
            if(!name) {
                alert("なまえを入れてね");
                return;
            }
            // 既存チェック
            const users = getUserNames();
            if(users.includes(name)) {
                Ranking.selectUser(name);
            } else {
                Ranking.selectUser(name);
            }
        }
    };
}