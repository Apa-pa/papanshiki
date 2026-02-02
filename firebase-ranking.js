// firebase-ranking.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// ★
import { getFirestore, collection, addDoc, setDoc, doc, getDocs, getDoc, deleteDoc, writeBatch, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebaseコンソールで取得した設定
const firebaseConfig = {
    apiKey: "AIzaSyCYHfZ5ya_HuhutF6eI5vtbXugYb4zKC9g",
    authDomain: "papan-shiki.firebaseapp.com",
    projectId: "papan-shiki",
    storageBucket: "papan-shiki.firebasestorage.app",
    messagingSenderId: "157576103115",
    appId: "1:157576103115:web:1278e7167cbb60ee71c74e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ------------------------------------------------
// 🏆 ランキング機能 (既存のまま)
// ------------------------------------------------
window.uploadToWorldRanking = async function(gameId, localName, score, publicInput) {
    let finalName = (publicInput || localName).trim();
    const ngList = ["ばか", "あほ", "うんち", "うんこ", "ちんこ", "まんこ", "死ね", "殺す"]; 
    if (finalName === "" || ngList.some(ng => finalName.includes(ng))) {
        finalName = "名無しさん";
    }

    try {
        const colRef = collection(db, "world_rankings_" + gameId);
        await addDoc(colRef, {
            name: finalName,
            score: Number(score),
            date: serverTimestamp() 
        });
        console.log("ランキング送信完了");
        return true;
    } catch (e) {
        console.error("送信エラー:", e);
        alert("ランキング送信に失敗しました");
        return false;
    }
};

// ------------------------------------------------
// 🏠 マイルーム公開機能 (★ここから新規追加)
// ------------------------------------------------

// 1. 自分の部屋データを送信（公開）する関数
// ★第一引数を userName から userId (ユニークID) に変更
window.publishMyRoom = async function(userId, roomData, publicName) {
    if(!userId) return; // IDがないなら中止

    // 名前の決定とチェック
    let finalName = (publicName || "名無しさん").trim();
    const ngList = ["ばか", "あほ", "うんち", "うんこ", "ちんこ", "まんこ", "死ね", "殺す"]; 
    if (finalName === "" || ngList.some(ng => finalName.includes(ng))) {
        finalName = "名無しさん";
        alert("その名前は使えません。「名無しさん」として登録します。");
    }

    const publicData = {
        name: finalName,              // 公開ネーム
        avatar: roomData.current || "none",
        bg: roomData.currentRoom || "none",
        furniture: roomData.furniture || {},
        medals: roomData.medals || {},
        updatedAt: serverTimestamp()
    };

    try {
        // ★ userId (ランダムなID) を場所の名前として使う
        const docRef = doc(db, "public_rooms", userId);
        await setDoc(docRef, publicData);
        
        alert(`「${finalName}」のお部屋を公開しました！🌏\n(ID: ${userId})`);
    } catch (e) {
        console.error("公開エラー:", e);
        alert("公開に失敗しました...");
    }
};
// ...fetchPublicRoomListなどはそのままでOK

// 2. 公開されているみんなの部屋リストを取得する関数
window.fetchPublicRoomList = async function() {
    try {
        // 更新が新しい順に並べ替えたい場合は orderBy を使いますが、
        // まずは単純に全件取得します
        const colRef = collection(db, "public_rooms");
        const snapshot = await getDocs(colRef);
        
        let rooms = [];
        snapshot.forEach(doc => {
            // ★重要: データの中身(...doc.data())だけでなく、
            // ID(doc.id)も一緒にセットにして返します
            rooms.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return rooms;
    } catch (e) {
        console.error("取得エラー:", e);
        return [];
    }
};

// ★追加: ID(uid)を指定して、特定の部屋データを1つ取得する関数
window.fetchPublicRoom = async function(uid) {
    try {
        const docRef = doc(db, "public_rooms", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (e) {
        console.error("取得エラー:", e);
        return null;
    }
};

// --- 🐑 全国レース・エントリー機能 (更新) ---
window.registerNationalRaceEntry = async function(userId, sheepData, ownerName) {
    if(!userId || !sheepData) return;

    const entryData = {
        ownerName: ownerName || "名無しオーナー",
        sheepName: sheepData.name || "名無しひつじ",
        speed: sheepData.speed,
        stamina: sheepData.stamina,
        tenacity: sheepData.tenacity,
        rank: sheepData.rank,
        // ★残り契約数を追加（ボーナス計算に使用）
        contractRaces: sheepData.contractRaces !== undefined ? sheepData.contractRaces : 24,
        entryTime: serverTimestamp()
    };

    try {
        const docRef = doc(db, "national_entries", userId);
        await setDoc(docRef, entryData);
        return true;
    } catch (e) {
        console.error("エントリーエラー:", e);
        return false;
    }
};

/**
 * 最新のレース結果（先週の優勝者など）を取得する
 */
window.fetchLatestNationalResults = async function() {
    try {
        // "national_results" コレクションの "latest" ドキュメントを取得する想定
        const docRef = doc(db, "national_results", "latest");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (e) {
        console.error("結果取得エラー:", e);
        return null;
    }
};

/**
 * 現在の時刻から「直近の土曜16時」のIDを生成する
 */
function getTargetRaceId() {
    const now = new Date();
    const raceDay = 6; // 土曜日
    const raceHour = 16; // 16時

    let lastSaturday = new Date(now);
    // 土曜日の16時を基準にする
    const diff = now.getDay() - raceDay;
    lastSaturday.setDate(now.getDate() - (diff < 0 ? diff + 7 : diff));
    lastSaturday.setHours(raceHour, 0, 0, 0);

    // もし今が土曜の16時前なら、1週間前の土曜がターゲット
    if (now < lastSaturday) {
        lastSaturday.setDate(lastSaturday.getDate() - 7);
    }

    // ID形式: "2024-05-18-1600"
    return lastSaturday.getFullYear() + "-" + 
           (lastSaturday.getMonth() + 1).toString().padStart(2, '0') + "-" + 
           lastSaturday.getDate().toString().padStart(2, '0') + "-1600";
}

/**
 * 全国レースの状況をチェックし、必要なら計算を実行する
 */
window.checkAndRunNationalRace = async function() {
    const raceId = getTargetRaceId();
    
    try {
        // 1. すでに結果が出ているか確認
        const resultRef = doc(db, "national_results", "latest");
        const resultSnap = await getDoc(resultRef);
        const latestData = resultSnap.exists() ? resultSnap.data() : null;

        // すでに最新レースの結果が書き込まれていれば、それを返す
        if (latestData && latestData.raceId === raceId) {
            return { status: "finished", data: latestData };
        }

        // --- 🏁 ここからレース実行ロジック (最初の一人だけが実行) ---

        // 2. エントリーを全取得
        const entriesRef = collection(db, "national_entries");
        const snapshot = await getDocs(entriesRef);
        if (snapshot.empty) return { status: "no_entries" };

        let entries = [];
        snapshot.forEach(d => entries.push({ id: d.id, ...d.data() }));

        // 3. ランク別に計算
        const leagues = { Rookie: [], Pro: [], Legend: [] };
        const luckMax = { Rookie: 60, Pro: 80, Legend: 100 };

        entries.forEach(e => {
            const lMax = luckMax[e.rank] || 60;
            const luck = Math.random() * lMax;
            
            // ★ ベテランボーナスの計算 (24回から減るほど最大12点加算)
            const remaining = e.contractRaces !== undefined ? e.contractRaces : 24;
            const experienceBonus = (24 - remaining) * 0.5;

            // スコア計算式にボーナスを追加
            e.totalScore = (e.speed * 1.2) + (e.stamina * 0.8) + (e.tenacity * 1.0) + luck + experienceBonus;
            
            if (leagues[e.rank]) leagues[e.rank].push(e);
        });

        // 4. 各ランクの上位3名を決定
        const finalResults = { raceId: raceId, rookie: [], pro: [], legend: [] };
        for (let key in leagues) {
            leagues[key].sort((a, b) => b.totalScore - a.totalScore);
            finalResults[key.toLowerCase()] = leagues[key].slice(0, 3).map((r, idx) => ({
                rank: idx + 1,
                sheepName: r.sheepName,
                ownerName: r.ownerName,
                uid: r.id, // 賞金判定用
                score: Math.floor(r.totalScore)
            }));
        }

        // 5. 結果をFirebaseに保存
        await setDoc(resultRef, { ...finalResults, createdAt: serverTimestamp() });

        // 6. エントリーをリセット (全削除)
        const batch = writeBatch(db);
        snapshot.forEach(d => batch.delete(d.ref));
        await batch.commit();

        return { status: "new_result", data: finalResults };

    } catch (e) {
        console.error("Race Process Error:", e);
        return { status: "error" };
    }
};