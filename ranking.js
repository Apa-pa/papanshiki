/* ranking.js - 記録・目標・ポイント・スタンプ・どんぐり・株 管理 (全国ランキングUI改善版) */

const GAME_LIST = {
    'make10': { name: 'あわせて10', type: 'time', unit: '秒' },
    'math_add_easy': { name: 'たしざん(くりあがりなし)', type: 'time', unit: '秒' },
    'math_add_hard': { name: 'たしざん(くりあがりあり)', type: 'time', unit: '秒' },
    'math_sub_easy': { name: 'ひきざん(くりさがりなし)', type: 'time', unit: '秒' },
    'math_sub_hard': { name: 'ひきざん(くりさがりあり)', type: 'time', unit: '秒' },
    'math_multi': { name: 'かけざん九九', type: 'time', unit: '秒' },
    'rain_math': { name: 'あめふり算数', type: 'score', unit: '点' },
    'clock_read': { name: 'とけいの読み方', type: 'time', unit: '秒' },
    'triangle_angle': { name: '三角形の内角', type: 'time', unit: '秒' },
    'katakana': { name: 'カタカナ変換', type: 'time', unit: '秒' },
    'alphabet': { name: 'a-zアルファベット', type: 'time', unit: '秒' },
    'romaji_hole': { name: 'ローマ字虫くい', type: 'time', unit: '秒' },
    'rain_vowel': { name: 'あめふりローマ字(母)', type: 'score', unit: '点' },
    'rain_consonant': { name: 'あめふりローマ字(子)', type: 'score', unit: '点' },
    'touch25': { name: '1から25までタッチ', type: 'time', unit: '秒' },
    'tsumitsumi': { name: '漢字つみつみ', type: 'score', unit: 'こ' },
    'eawase': { name: 'えあわせ', type: 'time', unit: '秒' },
    'shopping': { name: 'ぴったりしはらい', type: 'time', unit: '秒' },
    'water': { name: '水槽パズル', type: 'time', unit: '秒' },
    'rail': { name: 'つなげて！トロッコ', type: 'time', unit: '秒' }
};

// --- リアル株価連動設定 ---
// ユーザーが作成したGoogleスプレッドシートの「Webに公開(CSV)」URLをここに入れます
const REAL_MARKET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT11R_97G1YmVITxEtQ7zspehsp2SsjKbflETP1_0VDkLzJQAYLnVjXJXOIE32WJDTUTcZ8PnlxTJa6/pub?output=csv';

// 新しい銘柄を追加
const STOCK_MASTER = {
    'motor': { name: 'ぱぱん自動車', currency: 'point', initPrice: 500, volatility: 0.02, dividendRate: 0.01, bias: 0.002, desc: 'あんぜん運転で 人気の会社' },
    'food': { name: 'どんぐり食品', currency: 'point', initPrice: 500, volatility: 0.05, dividendRate: 0.03, bias: 0.0, desc: '配当(はいとう)が 多いよ' },
    'tech': { name: 'ギャラクシーIT', currency: 'donguri', initPrice: 10, volatility: 0.20, dividendRate: 0.0, bias: 0.0, desc: 'あがったり さがったり' },
    // ▼ 追加分 ▼
    'nikkei': { name: 'ぱぱんの森平均株価', type: 'linked', linkage: 'NI225', currency: 'point', initPrice: 1000, volatility: 0.0, dividendRate: 0.005, divisor: 100, desc: 'ぱぱんの森の平均株価と連動するよ' },
    'sp500': { name: 'とおくの山SP500', type: 'linked', linkage: 'SP500', currency: 'point', initPrice: 100, volatility: 0.0, dividendRate: 0.005, divisor: 10, desc: 'とおくの山を代表する500社の株価と連動するよ' }
};

// --- 定数定義 ---
const STORAGE_KEY = 'papan_records_v1';
const GOAL_KEY = 'papan_goals_v1';
const POINT_KEY = 'papan_points_v1';
const REWARDED_KEY = 'papan_rewarded_goals_v1';
const STAMP_KEY = 'papan_stamps_v3';
const MARKET_KEY = 'papan_market_v1';
const STOCK_KEY = 'papan_stocks_v1';
const COLLECTION_KEY = 'papan_collection_v1';

// --- 共通ヘルパー関数 ---
function getUserNames() {
    // ポイント、記録、株保有者などから全ユーザー名を収集
    const points = JSON.parse(localStorage.getItem(POINT_KEY) || '{}');
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const stocks = JSON.parse(localStorage.getItem(STOCK_KEY) || '{}');

    const users = new Set([
        ...Object.keys(points),
        ...Object.keys(records),
        ...Object.keys(stocks)
    ]);
    return Array.from(users).sort();
}

function getUserPoints(userName) {
    const points = JSON.parse(localStorage.getItem(POINT_KEY) || '{}');
    return points[userName] || 0;
}

function addPoints(userName, amount) {
    if (!userName || amount <= 0) return;
    const points = JSON.parse(localStorage.getItem(POINT_KEY) || '{}');
    points[userName] = (points[userName] || 0) + amount;
    localStorage.setItem(POINT_KEY, JSON.stringify(points));
}

function spendPoints(userName, amount) {
    const points = JSON.parse(localStorage.getItem(POINT_KEY) || '{}');
    const current = points[userName] || 0;
    if (current >= amount) {
        points[userName] = current - amount;
        localStorage.setItem(POINT_KEY, JSON.stringify(points));
        return true;
    }
    return false;
}

// どんぐり（第2通貨）の処理
const DONGURI_KEY = 'papan_donguri_v1';
function addDonguri(userName, amount) {
    if (!userName || amount <= 0) return;
    const db = JSON.parse(localStorage.getItem(DONGURI_KEY) || '{}');
    db[userName] = (db[userName] || 0) + amount;
    localStorage.setItem(DONGURI_KEY, JSON.stringify(db));
}
function spendDonguri(userName, amount) {
    const db = JSON.parse(localStorage.getItem(DONGURI_KEY) || '{}');
    const current = db[userName] || 0;
    if (current >= amount) {
        db[userName] = current - amount;
        localStorage.setItem(DONGURI_KEY, JSON.stringify(db));
        return true;
    }
    return false;
}
function getUserDonguri(userName) {
    const db = JSON.parse(localStorage.getItem(DONGURI_KEY) || '{}');
    return db[userName] || 0;
}

function getAllRecords() { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
function getAllGoals() { return JSON.parse(localStorage.getItem(GOAL_KEY) || '{}'); }
function getAllStamps() { return JSON.parse(localStorage.getItem(STAMP_KEY) || '{}'); }

// --- 日替わりミッション機能 (3つ版) ---

// ミッション対象にするゲームIDリスト
const DAILY_MISSION_CANDIDATES = [
    'make10',         // あわせて10
    'math_add_hard',  // 足し算（繰り上がり）
    'math_sub_easy',  // 引き算
    'math_sub_hard',  // 引き算（繰り下がり）
    'math_multi',     // 九九
    'clock_read',     // 時計
    'triangle_angle', // 三角形
    'katakana',       // カタカナ
    'alphabet',       // アルファベット
    'romaji_hole',    // ローマ字
    'shopping',       // おかいもの
    'rain_math'       // あめふり算数
];

const DAILY_MISSION_KEY = 'papan_daily_mission_v1';
function getDailyMissionData() { return JSON.parse(localStorage.getItem(DAILY_MISSION_KEY) || '{}'); }
function getTodayMissionIds() {
    const today = getTodayString();
    // 日替わりロジック（日付から乱数シードっぽく決定）
    const seed = parseInt(today.replace(/-/g, ''));

    // 修正: 全ゲームではなく、勉強系リストから選ぶ
    const gameIds = DAILY_MISSION_CANDIDATES;

    const count = 3; // 1日3つ
    let missions = [];
    for (let i = 0; i < count; i++) {
        const idx = (seed + i * 13) % gameIds.length;
        missions.push(gameIds[idx]);
    }
    return missions;
}
function checkMissionStatus(userName, gameId) {
    const today = getTodayString();
    const targets = getTodayMissionIds();
    if (!targets.includes(gameId)) return { isTarget: false, isCleared: false };

    // クリア済みかチェック
    const data = getDailyMissionData();
    const userMissions = data[userName] || {};
    const clearedDate = userMissions[gameId];

    return { isTarget: true, isCleared: (clearedDate === today) };
}
function setDailyMissionCompleted(userName, gameId) {
    const data = getDailyMissionData();
    if (!data[userName]) data[userName] = {};
    data[userName][gameId] = getTodayString();
    localStorage.setItem(DAILY_MISSION_KEY, JSON.stringify(data));
}

// （オプション）トップページ用ウィジェット表示（コンパクト・1行版）
function showDailyMissionWidget(elementId) {
    const targets = getTodayMissionIds();
    const BONUS_PT = 150; // 表記用

    let htmlList = targets.map(id => {
        const info = GAME_LIST[id];
        const name = info ? info.name : id;
        // ゲーム名のチップ
        return `<span style="display:inline-block; background:white; color:#e65100; padding:2px 8px; margin-left:5px; border-radius:10px; font-size:12px; border:1px solid #ffcc80; white-space:nowrap;">${name}</span>`;
    }).join('');

    // 横並びコンテナ (flexbox)
    const html = `
        <div style="background:#fff3e0; padding:8px 5px; border-radius:8px; margin:5px auto; max-width:95%; overflow-x:auto; white-space:nowrap; -webkit-overflow-scrolling: touch; border:1px dashed #ffb74d;">
            <div style="display:inline-flex; align-items:center;">
                <span style="font-weight:bold; color:#bf360c; font-size:12px; margin-right:5px;">📅 きょうのボーナスコンテンツ(ひとつ+${BONUS_PT}):</span>
                ${htmlList}
            </div>
        </div>
    `;

    const container = document.getElementById(elementId);
    if (container) container.innerHTML = html;
}


// --- 市場関連・日付計算 ---
function getMarketData() {
    let market = JSON.parse(localStorage.getItem(MARKET_KEY));
    if (!market) {
        const initialPrices = {};
        const initialLastPrices = {};
        for (let key in STOCK_MASTER) {
            initialPrices[key] = STOCK_MASTER[key].initPrice;
            initialLastPrices[key] = STOCK_MASTER[key].initPrice;
        }
        market = { prices: initialPrices, lastPrices: initialLastPrices, news: "ぱぱん証券、本日オープン！", trend: { 'motor': 0, 'food': 0, 'tech': 0 }, lastUpdate: "" };
        localStorage.setItem(MARKET_KEY, JSON.stringify(market));
    }

    // データ構造のマイグレーション（後から銘柄を追加した場合の対応）
    for (let key in STOCK_MASTER) {
        if (market.prices[key] === undefined) {
            market.prices[key] = STOCK_MASTER[key].initPrice;
            market.lastPrices[key] = STOCK_MASTER[key].initPrice;
        }
    }

    return market;
}

function getDaysDiff(dateStr1, dateStr2) {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    const diffTime = d2 - d1;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}

// 外部データ（Google Sheets）を取得する
async function fetchRealMarketData() {
    if (!REAL_MARKET_URL) return null;

    try {
        const res = await fetch(REAL_MARKET_URL);
        if (!res.ok) throw new Error('Network response was not ok');
        const text = await res.text();

        // CSVパース: 期待する形式は "Key,Value" のリスト
        // 例: 
        // NI225,38500
        // SP500,5100
        const rows = text.split('\n');
        const data = {};
        rows.forEach(row => {
            const cols = row.split(',');
            if (cols.length >= 2) {
                const key = cols[0].trim();
                const val = parseFloat(cols[1].trim());
                if (key && !isNaN(val)) {
                    data[key] = val;
                }
            }
        });
        return data;
    } catch (e) {
        console.warn("Real market fetch failed:", e);
        return null; // 失敗時はnullを返す（ランダム変動にフォールバック）
    }
}

// Asyncに変更
async function checkAndAdvanceDate() {
    const today = getTodayString();
    let market = getMarketData();
    let isPriceUpdated = false;

    // 1. リアル連動銘柄は「常に」最新データを取得して反映する（同日でも更新）
    // ★ 修正: 1日1回更新に戻すため、このブロックはコメントアウト（または削除）
    const realData = await fetchRealMarketData();
    /*
    if (realData) {
        for (let id in STOCK_MASTER) {
            const info = STOCK_MASTER[id];
            // 連動銘柄かつデータがある場合
            if (info.type === 'linked' && realData[info.linkage]) {
                const newPrice = Math.floor(realData[info.linkage] / info.divisor);
                // 価格が変わっていたら更新
                if (market.prices[id] !== newPrice) {
                    market.prices[id] = newPrice;
                    isPriceUpdated = true;
                }
            }
        }
        if (isPriceUpdated) {
            localStorage.setItem(MARKET_KEY, JSON.stringify(market));
        }
    }
    */

    // 2. 日付変更チェック（配当や通常銘柄の変動）
    if (market.lastUpdate !== today) {
        let daysElapsed = market.lastUpdate ? getDaysDiff(market.lastUpdate, today) : 0;
        if (daysElapsed < 0) daysElapsed = 1;

        // updateMarketDay に realData を渡して再利用する
        return await updateMarketDay(today, daysElapsed, realData);
    }

    // 日付変更なしかつ価格更新があった場合は、空配列を返してUI更新だけトリガーする
    return isPriceUpdated ? [] : null;
}

// Asyncに変更
async function updateMarketDay(todayStr, daysElapsed, preFetchedRealData = null) {
    const market = getMarketData();
    market.lastPrices = { ...market.prices };

    // リアルデータの取得（checkAndAdvanceDateから渡されていればそれを使う）
    const realData = preFetchedRealData || await fetchRealMarketData();

    const prevRealDataKey = 'papan_real_market_prev_v1';
    let prevRealData = JSON.parse(localStorage.getItem(prevRealDataKey) || '{}');

    // ニュース決定ロジック
    const eventRoll = Math.random();
    if (eventRoll < 0.1) { market.news = "【特報】新型エンジンが大発明！自動車株が急上昇！"; market.trend['motor'] = 0.1; }
    else if (eventRoll < 0.2) { market.news = "【悲報】どんぐりが不作... 食品株に影響か"; market.trend['food'] = -0.1; }
    else if (eventRoll < 0.3) { market.news = "【IT】次世代ゲーム機が大コケ。IT株が暴落の危機"; market.trend['tech'] = -0.3; }
    else if (eventRoll < 0.4) { market.news = "【IT】AIがすごい発明！IT株に買い注文殺到！"; market.trend['tech'] = 0.4; }
    else { market.news = "本日は穏やかな市場です。"; market.trend = { 'motor': 0, 'food': 0, 'tech': 0 }; }

    // リアル連動ニュースの上書き
    if (realData) {
        // もしリアルデータが取れていれば、ニュースもそれっぽくする
        market.news += " (世界市場データ受信中)";
    }

    market.lastUpdate = todayStr;

    for (let id in STOCK_MASTER) {
        const info = STOCK_MASTER[id];
        let newPrice = market.prices[id];
        let changeRate = 0;
        let isRealDataApplied = false;

        // ★ リアル連動銘柄の場合
        if (info.type === 'linked' && realData && realData[info.linkage]) {
            const currentReal = realData[info.linkage];

            // 修正: 変化率ではなく、実数 ÷ divisor で価格を決定する
            // 例: 日経38500円 ÷ 100 = 385ポイント
            if (info.divisor) {
                newPrice = Math.floor(currentReal / info.divisor);
                isRealDataApplied = true;

                // 変動幅の計算（表示用などで使うかも）
                /* 
                   ここは絶対値で決まるので changeRate の計算は厳密には不要だが、
                   ニュース判定などで急激な変動があったかを検知したければ計算してもよい。
                   今回はシンプルに価格代入のみ。
                */
            }
        }

        // リアルデータが適用されなかった場合（通常銘柄 or 取得失敗時）
        if (!isRealDataApplied) {
            changeRate = (market.trend[id] || 0) + (info.bias || 0) + ((Math.random() * info.volatility * 2) - info.volatility);
            let currentPrice = market.prices[id];
            newPrice = Math.floor(currentPrice * (1 + changeRate));

            // 修正: 上昇トレンドなのに価格が変わらない（1のままなど）場合、最低でも+1する
            if (changeRate > 0 && newPrice <= currentPrice) {
                newPrice = currentPrice + 1;
            }
        }

        market.prices[id] = newPrice < 1 ? 1 : newPrice;
    }

    // 今日のリアルデータを「前回データ」として保存（明日の比較用）
    if (realData) {
        // 既存データとマージして保存
        const merged = { ...prevRealData, ...realData };
        localStorage.setItem(prevRealDataKey, JSON.stringify(merged));
    }

    localStorage.setItem(MARKET_KEY, JSON.stringify(market));
    return daysElapsed > 0 ? distributeDividends(daysElapsed) : [];
}

function distributeDividends(days) {
    const market = getMarketData();
    const allStocks = JSON.parse(localStorage.getItem(STOCK_KEY) || '{}');
    let report = [];
    for (let user in allStocks) {
        let totalP = 0, totalD = 0;
        for (let id in allStocks[user]) {
            const count = allStocks[user][id];
            if (count > 0) {
                const info = STOCK_MASTER[id];
                const div = Math.floor(market.prices[id] * count * info.dividendRate * days);
                if (div > 0) info.currency === 'point' ? totalP += div : totalD += div;
            }
        }
        if (totalP > 0 || totalD > 0) {
            addPoints(user, totalP); addDonguri(user, totalD);
            report.push(`${user}さんに 配当: ${totalP}pt / ${totalD}🌰${days > 1 ? ` (${days}日分!)` : ''}`);
        }
    }
    return report;
}

// --- 株・取引システム ---

// ユーザーの持っている株のリストを取得する
function getUserStocks(userName) {
    const allStocks = JSON.parse(localStorage.getItem(STOCK_KEY) || '{}');
    return allStocks[userName] || {};
}

// 株を買う関数
function buyStock(userName, stockId, amount) {
    const market = getMarketData();
    const info = STOCK_MASTER[stockId];
    // 今の株価 × 買う数
    const cost = market.prices[stockId] * amount;

    // お金（ポイント or どんぐり）が足りるかチェックして支払う
    let success = false;
    if (info.currency === 'point') {
        success = spendPoints(userName, cost);
    } else {
        success = spendDonguri(userName, cost);
    }

    // 支払いができたら、株を増やす
    if (success) {
        const allStocks = JSON.parse(localStorage.getItem(STOCK_KEY) || '{}');
        if (!allStocks[userName]) allStocks[userName] = {};

        allStocks[userName][stockId] = (allStocks[userName][stockId] || 0) + amount;
        localStorage.setItem(STOCK_KEY, JSON.stringify(allStocks));
        return true;
    }
    return false; // お金が足りなかったとき
}

// 株を売る関数
function sellStock(userName, stockId, amount) {
    const allStocks = JSON.parse(localStorage.getItem(STOCK_KEY) || '{}');
    const currentHoldings = allStocks[userName]?.[stockId] || 0;

    // 持っている株が、売る数より多いかチェック
    if (currentHoldings >= amount) {
        // 株を減らす
        allStocks[userName][stockId] = currentHoldings - amount;
        localStorage.setItem(STOCK_KEY, JSON.stringify(allStocks));

        // お金を増やす
        const market = getMarketData();
        const price = market.prices[stockId];
        const gain = price * amount;
        const info = STOCK_MASTER[stockId];

        if (info.currency === 'point') {
            addPoints(userName, gain);
        } else {
            addDonguri(userName, gain);
        }
        return true;
    }
    return false; // 持っている株が足りないとき
}
// ▲▲▲ ここまで ▲▲▲


// --- スタンプ・レコード ---
function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
}
function setStamp(userName, dateStr, imageName) {
    const allStamps = getAllStamps();
    if (!allStamps[userName]) allStamps[userName] = {};
    allStamps[userName][dateStr] = imageName;
    localStorage.setItem(STAMP_KEY, JSON.stringify(allStamps));
}
function toggleStamp(userName, dateStr, forceAdd = false) {
    const allStamps = getAllStamps();
    const current = allStamps[userName] ? allStamps[userName][dateStr] : null;
    if (forceAdd || !current) setStamp(userName, dateStr, 'hi-an-192.png');
    else { delete allStamps[userName][dateStr]; localStorage.setItem(STAMP_KEY, JSON.stringify(allStamps)); }
}

function removeStamp(userName, dateStr) {
    const allStamps = getAllStamps();
    if (allStamps[userName]) {
        delete allStamps[userName][dateStr];
        localStorage.setItem(STAMP_KEY, JSON.stringify(allStamps));
    }
}

function saveRecord(userName, gameId, value) {
    const records = getAllRecords();
    if (!records[userName]) records[userName] = {};
    const currentBest = records[userName][gameId];
    const gameType = GAME_LIST[gameId]?.type || 'score';
    let isNew = currentBest === undefined || (gameType === 'score' ? parseFloat(value) > parseFloat(currentBest) : parseFloat(value) < parseFloat(currentBest));
    if (isNew) { records[userName][gameId] = value; localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
    return isNew;
}

// 目標達成チェック＆ポイント付与（修正・強化版）
function checkAndAwardPoints(userName, gameId, currentRecord) {
    // 必要なキーや関数が存在しない場合の安全策
    const _POINT_KEY = (typeof POINT_KEY !== 'undefined') ? POINT_KEY : 'papan_points';
    const _REWARDED_KEY = (typeof REWARDED_KEY !== 'undefined') ? REWARDED_KEY : 'papan_rewarded_goals';
    const _getAllGoals = (typeof getAllGoals === 'function') ? getAllGoals : () => {
        // getAllGoalsがない場合は直接localStorageから取る
        const _GOAL_KEY = (typeof GOAL_KEY !== 'undefined') ? GOAL_KEY : 'papan_goals';
        return JSON.parse(localStorage.getItem(_GOAL_KEY) || '{}');
    };

    const goals = _getAllGoals();
    const userGoal = goals[userName]?.[gameId];

    // 目標が設定されていなければ終了
    if (!userGoal) return 0;

    const allPoints = JSON.parse(localStorage.getItem(_POINT_KEY) || '{}');
    const allHistory = JSON.parse(localStorage.getItem(_REWARDED_KEY) || '{}');
    const info = GAME_LIST[gameId];

    // 達成判定（タイムなら「以下」、スコアなら「以上」）
    // 数値として比較するために parseFloat を使用
    let isAchieved = false;
    if (info.type === 'time') {
        isAchieved = parseFloat(currentRecord) <= parseFloat(userGoal);
    } else {
        isAchieved = parseFloat(currentRecord) >= parseFloat(userGoal);
    }

    // 「達成している」かつ「まだその目標値で報酬をもらっていない」場合
    // ※parseFloatで数値化して比較することで、"10" と 10 の違いによるミスを防ぐ
    if (isAchieved && allHistory[userName]?.[gameId] !== parseFloat(userGoal)) {
        const reward = 150; // 報酬ポイント

        // ポイント加算
        allPoints[userName] = (allPoints[userName] || 0) + reward;

        // 履歴更新（今の目標値を記録する）
        if (!allHistory[userName]) allHistory[userName] = {};
        allHistory[userName][gameId] = parseFloat(userGoal);

        // 保存
        localStorage.setItem(_POINT_KEY, JSON.stringify(allPoints));
        localStorage.setItem(_REWARDED_KEY, JSON.stringify(allHistory));

        return reward; // 獲得ポイント(150)を返す
    }

    return 0; // 条件を満たさなければ 0 を返す
}

// ★★★ セーブダイアログ (UI改善＆空欄送信防止版) ★★★
// ★★★ セーブダイアログ (UI改善 & 全国ランキング & 日替わりミッション統合版) ★★★
function showSaveDialog(gameId, resultValue) {
    const old = document.getElementById('ranking-overlay');
    if (old) old.remove();

    const gameInfo = GAME_LIST[gameId] || { name: 'このゲーム', unit: '' };
    const users = getUserNames(); // 既存の関数を使用
    const isGlobalRankingEnabled = (typeof window.uploadToWorldRanking === 'function');
    const BONUS_PT = 150; // 日替わりボーナス点

    let usersHtml = '';
    if (users.length > 0) {
        usersHtml += '<p style="margin:10px 0; font-size:14px; color:#666;">きろくする人を選んでね</p>';
        users.forEach(u => {
            // --- ★ここを追加: ミッション状態の判定 ---
            // (ヘルパー関数 checkMissionStatus が必要です)
            let badge = "";
            if (typeof checkMissionStatus === 'function') {
                const status = checkMissionStatus(u, gameId);
                if (status.isTarget) {
                    if (status.isCleared) {
                        badge = "<div style='font-size:10px; color:#c8e6c9;'>★クリア済</div>";
                    } else {
                        badge = "<div style='font-size:10px; color:#ffeb3b; font-weight:bold; animation: flash 1s infinite;'>★ボーナス対象</div>";
                    }
                }
            }
            // ---------------------------------------

            usersHtml += `<button onclick="Ranking.selectUser('${u}')" style="margin:5px; padding:10px 20px; font-size:16px; cursor:pointer; background:#4CAF50; color:white; border:none; border-radius:15px; font-weight:bold; min-width:80px; vertical-align:middle;">
                ${u}
                ${badge}
            </button>`;
        });
    }

    const overlay = document.createElement('div');
    overlay.id = 'ranking-overlay';
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 99999; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; font-family: sans-serif; text-align: center;`;

    // 点滅アニメーション用スタイルを追加
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `@keyframes flash { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`;
    overlay.appendChild(styleTag);

    const globalNameHtml = isGlobalRankingEnabled ? `
        <div style="background:#e3f2fd; border-radius:10px; padding:10px; margin: 15px 0; border: 1px solid #bbdefb;">
            <p style="margin:0 0 5px 0; font-size:14px; color:#1976d2; font-weight:bold;">🌏 ランキングに のせる？</p>
            <input type="text" id="public-username" maxlength="6" placeholder="みんなにみえるなまえ（6文字まで）" style="padding:8px; font-size:14px; width:90%; border:2px solid #90caf9; border-radius:5px; text-align:center;">
            <p style="margin:5px 0 0 0; font-size:11px; color:#666;">※かかないと 自分だけのきろくになるよ</p>
        </div>
    ` : '';

    // ミッション対象ならヘッダーにアイコンを表示
    let missionHeader = "";
    if (typeof checkMissionStatus === 'function') {
        // 誰か一人でも対象ならアイコンを出す（簡易判定）
        const targets = getTodayMissionIds();
        if (targets.includes(gameId)) {
            missionHeader = `<div style="background:#ff9800; color:white; font-size:12px; padding:2px 8px; border-radius:10px; display:inline-block; margin-bottom:5px;">📅 今日のボーナス対象</div><br>`;
        }
    }

    overlay.innerHTML += `
        <div style="background:white; color:#333; padding:25px; border-radius:20px; width:90%; max-width:400px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            ${missionHeader}
            <h2 style="margin:0 0 10px 0; color:#555; font-size:20px;">${gameInfo.name}</h2>
            <div style="background:#fce4ec; border-radius:10px; padding:15px; margin-bottom:15px;">
                <div style="font-size:14px; color:#880e4f;">今回のきろく</div>
                <div style="font-size:36px; font-weight:bold; color:#e91e63;">${resultValue} <span style="font-size:16px;">${gameInfo.unit}</span></div>
            </div>
            ${globalNameHtml}
            <div id="user-list" style="margin-bottom:20px;">${usersHtml}</div>
            <div style="border-top:2px dashed #eee; padding-top:20px;">
                <p style="margin:0 0 10px 0; font-size:14px; font-weight:bold;">あたらしく 登録する</p>
                <div style="display:flex; justify-content:center; gap:5px;">
                    <input type="text" id="new-username" placeholder="おなまえ" style="padding:10px; font-size:16px; width:60%; border:2px solid #ddd; border-radius:5px;">
                    <button onclick="Ranking.registerNew()" style="padding:10px 20px; font-size:16px; background:#2196F3; color:white; border:none; border-radius:5px; font-weight:bold;">OK</button>
                </div>
            </div>
            <button onclick="document.getElementById('ranking-overlay').remove()" style="margin-top:25px; background:none; border:none; color:#999; text-decoration:underline; cursor:pointer;">とじる</button>
        </div>
    `;
    document.body.appendChild(overlay);

    window.Ranking = {
        selectUser: (localName) => {
            // 1. 基本ポイント付与 (参加賞)
            addPoints(localName, 30);

            // 2. 記録保存 & 自己ベスト判定
            const isNew = saveRecord(localName, gameId, resultValue);

            // 3. 目標達成ポイント判定
            const earnedPoints = checkAndAwardPoints(localName, gameId, resultValue);

            // --- ★ここを追加: ミッションボーナス付与処理 ---
            let missionBonus = 0;
            if (typeof checkMissionStatus === 'function') {
                const status = checkMissionStatus(localName, gameId);
                if (status.isTarget && !status.isCleared) {
                    missionBonus = BONUS_PT;
                    addPoints(localName, missionBonus); // ボーナス加算
                    setDailyMissionCompleted(localName, gameId); // 完了フラグ更新
                }
            }
            // ----------------------------------------------

            if (typeof toggleStamp === 'function') toggleStamp(localName, getTodayString(), true);

            // 全国ランキング送信
            let sentToRanking = false;
            if (isGlobalRankingEnabled) {
                const publicInput = document.getElementById('public-username').value.trim();
                if (publicInput !== "") {
                    window.uploadToWorldRanking(gameId, localName, resultValue, publicInput);
                    sentToRanking = true;
                }
            }

            document.getElementById('ranking-overlay').remove();

            // メッセージ生成
            setTimeout(() => {
                let msg = `${localName}さんの記録として保存しました。\n💰 参加賞 30ポイント GET!`;
                if (isNew) msg = `すごい！ ${localName}さんの\nじこベスト更新！🎉\n💰 参加賞 30ポイント GET!`;

                if (earnedPoints) msg += `\n🎁 目標クリア！さらに ${earnedPoints}ポイント！`;

                // ★ボーナスメッセージ追加
                if (missionBonus > 0) {
                    msg += `\n\n🎉 デイリーミッション達成！\n特別ボーナス +${missionBonus}ポイント！！`;
                }

                if (sentToRanking) {
                    msg += `\n🌏 全国ランキングに 送信したよ！`;
                } else if (isGlobalRankingEnabled) {
                    msg += `\n🔒 ランキングには 送らなかったよ（ひみつ）`;
                }

                alert(msg);
            }, 100);
        },
        registerNew: () => {
            const name = document.getElementById('new-username').value.trim();
            if (!name) return;
            Ranking.selectUser(name);
        }
    };
}

function showPointGetDialog(amount) {
    const old = document.getElementById('ranking-overlay');
    if (old) old.remove();
    const users = getUserNames();
    let usersHtml = users.length > 0 ? users.map(u => `<button onclick="RankingPoint.selectUser('${u}', ${amount})" style="margin:5px; padding:12px 20px; font-size:18px; cursor:pointer; background:#ff9800; color:white; border:none; border-radius:30px; font-weight:bold;">${u}</button>`).join('') : '<p style="color:#aaa;">まだ ユーザーがいません</p>';
    const overlay = document.createElement('div');
    overlay.id = 'ranking-overlay';
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 99999; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; font-family: sans-serif; text-align: center;`;
    overlay.innerHTML = `<div style="background:white; color:#333; padding:25px; border-radius:20px; width:90%; max-width:400px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);"><h2>🎁 クリアおめでとう！</h2><div style="background:#fff3e0; border-radius:10px; padding:15px; margin-bottom:20px;"><div>ごほうび</div><div style="font-size:36px; font-weight:bold;">${amount} ポイント</div></div>${usersHtml}<button onclick="document.getElementById('ranking-overlay').remove()" style="margin-top:20px; background:none; border:none; color:#999; text-decoration:underline; cursor:pointer;">とじる</button></div>`;
    document.body.appendChild(overlay);
    window.RankingPoint = { selectUser: (name, pts) => { addPoints(name, pts); if (typeof toggleStamp === 'function') toggleStamp(name, getTodayString(), true); document.getElementById('ranking-overlay').remove(); alert(`${name}さんに ${pts}ポイント！`); } };
}

// --- ガチャ・コレクション管理 ---

// ユーザーの持っているコレクション（IDのリスト）を取得する
function getCollection(userName) {
    // COLLECTION_KEY は ranking.js の最初の方で定義されています
    // もし見つからない場合は 'papan_collection_v1' を使います
    const key = (typeof COLLECTION_KEY !== 'undefined') ? COLLECTION_KEY : 'papan_collection_v1';
    const allCollections = JSON.parse(localStorage.getItem(key) || '{}');
    return allCollections[userName] || [];
}

// コレクションに追加する (初めてなら true を返す)
function addToCollection(userName, itemId) {
    const key = (typeof COLLECTION_KEY !== 'undefined') ? COLLECTION_KEY : 'papan_collection_v1';
    const allCollections = JSON.parse(localStorage.getItem(key) || '{}');

    if (!allCollections[userName]) {
        allCollections[userName] = [];
    }

    // すでに持っているかチェック
    if (allCollections[userName].includes(itemId)) {
        return false; // すでに持っている
    }

    // 新しいアイテムを追加
    allCollections[userName].push(itemId);
    localStorage.setItem(key, JSON.stringify(allCollections));
    return true; // 新しくゲットした！
}
// ▲▲▲ ここまで ▲▲▲