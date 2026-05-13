/* mission.js - ミッションすごろく 共通ミッション管理スクリプト */
/* ranking.js より後に読み込むこと（SeededRandom を共有利用するため） */

// ================================================================
// ミッションプール定義（ここにエントリを追加するだけで拡張可能）
// ================================================================
const MISSION_POOL = [
    // ゲームクリア系ミッション
    { id: 'labo',               name: 'スポーツのうりょくラボ',       type: 'game',   emoji: '🏃', url: '../learning_labo/labo.html' },
    { id: 'learning_labo_play', name: 'がくしゅうスターラボをプレイ', type: 'game',   emoji: '⭐', url: '../learning_labo/labo.html' },
    { id: 'labo2',              name: 'かんかくのラボ',               type: 'game',   emoji: '🧠', url: '../performance_labo/labo2.html' },
    { id: 'kanji_card_battle',  name: 'かんじカードバトル',           type: 'game',   emoji: '🃏', url: '../kanji_card_battle.html' },
    { id: 'math_strike',        name: 'けいさんビリヤード',           type: 'game',   emoji: '🎱', url: '../math_strike.html' },
    { id: 'passcode',           name: 'パスコードをあてよう！',       type: 'game',   emoji: '🔐', url: '../passcode.html' },
    { id: 'rail',               name: 'つなげて！トロッコ',           type: 'game',   emoji: '🚂', url: '../rail.html' },
    { id: 'rhythm',             name: 'アンのリズムきょうしつ',       type: 'game',   emoji: '🎵', url: '../rhythm.html' },
    { id: 'dokidoki_obstacle',  name: 'ドキドキしょうがいぶつレース', type: 'game',   emoji: '🏅', url: '../dokidoki_obstacle.html' },
    // ページ訪問系ミッション
    { id: 'visit_avatar_shop',  name: 'アバターショップへ',           type: 'visit',  emoji: '👗', url: '../avatar_shop.html' },
    { id: 'visit_room_shop',    name: 'インテリアショップへ',         type: 'visit',  emoji: '🛋️', url: '../room_shop.html' },
    { id: 'open_dashboard',     name: 'ダッシュボードをひらこう',     type: 'visit',  emoji: '📊', url: '../dashboard.html' },
    { id: 'visit_record',       name: 'きろくをかくにんしよう',       type: 'visit',  emoji: '🏆', url: '../record.html' },
    // アクション系ミッション
    { id: 'gacha',              name: 'ガチャをまわそう',             type: 'action', emoji: '💊', url: '../gacha.html' },
    { id: 'bank_exchange',      name: 'どんぐりとポイントをこうかん', type: 'action', emoji: '🏦', url: '../bank.html' },
    { id: 'stock_trade',        name: 'かぶのばいばいをしよう',       type: 'action', emoji: '📈', url: '../stock.html' },
    { id: 'sheep_stable',       name: 'ひつじぼくじょうをひらこう',   type: 'visit',  emoji: '🐑', url: '../ura/sheep_stable.html' },
    { id: 'auto_set_goals',     name: 'もくひょうをおまかせせってい', type: 'action', emoji: '🤖', url: '../record.html' },
];

// ================================================================
// コアAPI
// ================================================================

/**
 * 指定ユーザーのミッションストックを1増やす。
 * 今週の対象ミッションかつ未達成の場合のみ加算する。
 * @param {string} userName  - ユーザー名
 * @param {string} missionId - MISSION_POOL 内の id
 * @returns {boolean} ストックが増えた場合は true（達成演出を出すかどうかの判断に使う）
 */
function addMissionStock(userName, missionId) {
    if (!userName || !missionId) return false;

    // 週データを取得（週またぎ自動リセット含む）
    const weekly = getWeeklyData();

    // 今週の対象ミッションか？
    if (!weekly.missions.includes(missionId)) return false;

    // すでに達成済みか？
    if (!weekly.completedBy[userName]) weekly.completedBy[userName] = [];
    if (weekly.completedBy[userName].includes(missionId)) return false;

    // 達成を記録
    weekly.completedBy[userName].push(missionId);
    localStorage.setItem('sugoroku_weekly_v1', JSON.stringify(weekly));

    // ストックを加算
    const stocks = JSON.parse(localStorage.getItem('missionStock') || '{}');
    stocks[userName] = (stocks[userName] || 0) + 1;
    localStorage.setItem('missionStock', JSON.stringify(stocks));

    return true;
}

/**
 * 指定ユーザーの現在のミッションストック数を返す
 * @param {string} userName
 * @returns {number}
 */
function getMissionStock(userName) {
    if (!userName) return 0;
    // 最新の週データを取得し、必要ならリセットを発動させる
    getWeeklyData();
    const stocks = JSON.parse(localStorage.getItem('missionStock') || '{}');
    return stocks[userName] || 0;
}

/**
 * 今週のミッションデータを取得する（週またぎ時は自動リセット）
 * @returns {{ weekId: string, missions: string[], completedBy: Object }}
 */
function getWeeklyData() {
    let data = JSON.parse(localStorage.getItem('sugoroku_weekly_v1') || '{}');
    const wid = getWeekId();
    if (data.weekId !== wid) {
        // 週が変わった → リセット＆新ミッション選出
        data = {
            weekId: wid,
            missions: selectWeeklyMissions(wid),
            completedBy: {}
        };
        localStorage.setItem('sugoroku_weekly_v1', JSON.stringify(data));
        
        // 追加仕様: 週の切り替わりでストックとコマ位置も完全リセットする
        localStorage.removeItem('missionStock');
        localStorage.removeItem('currentPosition');
    }
    return data;
}

/**
 * 今週の月曜日起点の週IDを返す（日曜日の日付文字列 "YYYY-MM-DD"）
 * @returns {string}
 */
function getWeekId() {
    const d = new Date();
    // 今週の日曜日に戻す（ローカル時刻で0時0分0秒にする）
    const sun = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
    const yyyy = sun.getFullYear();
    const mm = String(sun.getMonth() + 1).padStart(2, '0');
    const dd = String(sun.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * weekId からシード付き乱数で10種のミッションIDを選出する
 * ranking.js の SeededRandom（Xorshift）を共用するため、
 * このファイルは必ず ranking.js の後に読み込むこと。
 * @param {string} weekId - "YYYY-MM-DD" 形式の週内容日付
 * @returns {string[]} 選出された10種のミッションID
 */
function selectWeeklyMissions(weekId) {
    const seed = parseInt(weekId.replace(/-/g, ''), 10);
    // ranking.js 内の SeededRandom クラスを利用
    const rng = (typeof SeededRandom === 'function')
        ? new SeededRandom(seed)
        : { next: () => Math.random() }; // フォールバック（テスト用）

    // プールをコピーして Fisher-Yates シャッフル
    const ids = MISSION_POOL.map(m => m.id);
    for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids.slice(0, 10);
}

/**
 * 今週のミッション一覧を { id, name, emoji, type, done } の配列で返す
 * @param {string} userName
 * @returns {Array}
 */
function getWeeklyMissionList(userName) {
    const weekly = getWeeklyData();
    const done = (weekly.completedBy[userName] || []);
    return weekly.missions.map(id => {
        const info = MISSION_POOL.find(m => m.id === id) || { id, name: id, emoji: '⭐', type: 'other' };
        return { ...info, done: done.includes(id) };
    });
}
