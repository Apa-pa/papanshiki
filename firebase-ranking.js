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
// 🏆 ランキング機能 (修正版)
// ------------------------------------------------
window.uploadToWorldRanking = async function (gameId, localName, score, publicInput) {
    let finalName = (publicInput || localName).trim();
    const ngList = ["ばか", "あほ", "うんち", "うんこ", "ちんこ", "まんこ", "死ね", "殺す"];
    if (finalName === "" || ngList.some(ng => finalName.includes(ng))) {
        finalName = "名無しさん";
    }

    try {
        // ▼▼▼ 修正: バラバラのコレクションではなく、共通の "world_rankings" に保存する ▼▼▼
        const colRef = collection(db, "world_rankings");

        await addDoc(colRef, {
            gameId: gameId,       // ▼▼▼ 重要: これがないと open_record.html で検索できません！
            name: finalName,
            score: Number(score),
            date: serverTimestamp()
        });
        console.log("ランキング送信完了");
        alert("ランキングに登録しました！"); // 成功したことがわかるようにアラートを追加
        return true;
    } catch (e) {
        console.error("送信エラー:", e);
        // エラー内容を詳しく表示する（デバッグ用）
        alert("ランキング送信に失敗しました。\n" + e.message);
        return false;
    }
};

// ------------------------------------------------
// 🏠 マイルーム公開機能 (★ここから新規追加)
// ------------------------------------------------

// 1. 自分の部屋データを送信（公開）する関数
// ★第一引数を userName から userId (ユニークID) に変更
window.publishMyRoom = async function (userId, roomData, publicName) {
    if (!userId) return; // IDがないなら中止

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
window.fetchPublicRoomList = async function () {
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
window.fetchPublicRoom = async function (uid) {
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

function formatRaceId(date) {
    return date.getFullYear() + "-" +
        (date.getMonth() + 1).toString().padStart(2, '0') + "-" +
        date.getDate().toString().padStart(2, '0') + "-1600";
}

function parseRaceId(raceId) {
    if (!raceId || raceId.length !== 15) return null;
    const year = Number(raceId.substring(0, 4));
    const month = Number(raceId.substring(5, 7)) - 1;
    const day = Number(raceId.substring(8, 10));
    return new Date(year, month, day, 16, 0, 0, 0);
}

function getNextRaceIdFromDate(baseDate) {
    const raceDay = 6; // 土曜日
    const raceHour = 16; // 16時
    const nextSaturday = new Date(baseDate);
    const diff = (raceDay - baseDate.getDay() + 7) % 7;
    nextSaturday.setDate(baseDate.getDate() + diff);
    nextSaturday.setHours(raceHour, 0, 0, 0);

    // 土曜16時以降の登録は翌週分に回す
    if (baseDate >= nextSaturday) {
        nextSaturday.setDate(nextSaturday.getDate() + 7);
    }

    return formatRaceId(nextSaturday);
}

/**
 * エントリー対象になる「次の土曜16時」のIDを生成する
 */
function getNextRaceId() {
    return getNextRaceIdFromDate(new Date());
}

window.getNextNationalRaceId = getNextRaceId;

// --- 🐑 全国レース・エントリー機能 (更新) ---
window.registerNationalRaceEntry = async function (userId, sheepData, ownerName, localEntryInfo = {}) {
    if (!userId || !sheepData) return false;

    const entryRaceId = getNextRaceId();

    const entryData = {
        ownerName: ownerName || "名無しオーナー",
        sheepName: sheepData.name || "名無しひつじ",
        speed: sheepData.speed,
        stamina: sheepData.stamina,
        tenacity: sheepData.tenacity,
        rank: sheepData.rank,
        entryRaceId: entryRaceId,
        localOwnerName: localEntryInfo.localOwnerName || "",
        entryKey: localEntryInfo.entryKey || "",
        // ★残り契約数を追加（ボーナス計算に使用）
        contractRaces: sheepData.contractRaces !== undefined ? sheepData.contractRaces : 24,
        entryTime: serverTimestamp()
    };

    try {
        const docRef = doc(db, "national_entries", userId);
        await setDoc(docRef, entryData);
        return { success: true, raceId: entryRaceId };
    } catch (e) {
        console.error("エントリーエラー:", e);
        return false;
    }
};

/**
 * 最新のレース結果（先週の優勝者など）を取得する
 */
window.fetchLatestNationalResults = async function () {
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
    return formatRaceId(lastSaturday);
}

function resolveEntryRaceId(entry) {
    if (entry.entryRaceId && parseRaceId(entry.entryRaceId)) {
        return entry.entryRaceId;
    }

    // 旧形式のエントリーは登録時刻から本来の対象レースを復元する
    if (!entry.entryTime || typeof entry.entryTime.toDate !== 'function') {
        return null;
    }

    return getNextRaceIdFromDate(entry.entryTime.toDate());
}

window.fetchNationalRaceResult = async function (raceId) {
    if (!parseRaceId(raceId)) return null;

    try {
        const resultSnap = await getDoc(doc(db, "national_results", raceId));
        return resultSnap.exists() ? resultSnap.data() : null;
    } catch (e) {
        console.error("レース履歴取得エラー:", e);
        return null;
    }
};

/**
 * 全国レースの状況をチェックし、必要なら計算を実行する
 */
window.checkAndRunNationalRace = async function () {
    const targetRaceId = getTargetRaceId();

    try {
        // 1. 最新結果を取得（未処理エントリーの確認前には終了しない）
        const resultRef = doc(db, "national_results", "latest");
        const resultSnap = await getDoc(resultRef);
        const latestData = resultSnap.exists() ? resultSnap.data() : null;

        // 2. 締切済みエントリーを全取得し、最古の未処理レースを選ぶ
        const entriesRef = collection(db, "national_entries");
        const snapshot = await getDocs(entriesRef);
        let entries = [];
        snapshot.forEach(d => {
            const entry = { id: d.id, ref: d.ref, ...d.data() };
            entry.resolvedRaceId = resolveEntryRaceId(entry);
            entries.push(entry);
        });

        const dueEntries = entries.filter(e =>
            e.resolvedRaceId && e.resolvedRaceId <= targetRaceId
        );

        // 対象エントリーが0件なら、空の結果は作らない
        if (dueEntries.length === 0) {
            if (latestData && latestData.raceId === targetRaceId) {
                return { status: "finished", data: latestData };
            }
            return { status: "no_entries" };
        }

        const raceIds = [...new Set(dueEntries.map(e => e.resolvedRaceId))].sort();
        const processedResults = [];
        let newestData = latestData;
        let createdNewResult = false;

        // 3. 未処理レースを古い順にすべて処理する
        for (const raceId of raceIds) {
            const raceEntries = dueEntries.filter(e => e.resolvedRaceId === raceId);
            const historyRef = doc(db, "national_results", raceId);
            const historySnap = await getDoc(historyRef);

            // 結果保存後に削除だけ失敗したケースでは、再抽選せず既存結果を使う
            if (historySnap.exists()) {
                const historyData = historySnap.data();
                const cleanupBatch = writeBatch(db);
                raceEntries.forEach(e => cleanupBatch.delete(e.ref));
                await cleanupBatch.commit();
                processedResults.push(historyData);
                continue;
            }

            const leagues = { Rookie: [], Pro: [], Legend: [] };
            const luckMax = { Rookie: 60, Pro: 80, Legend: 100 };

            raceEntries.forEach(e => {
                const lMax = luckMax[e.rank] || 60;
                const luck = Math.random() * lMax;

                // ★ ベテランボーナスの計算 (24回から減るほど最大12点加算)
                const remaining = e.contractRaces !== undefined ? e.contractRaces : 24;
                const experienceBonus = (24 - remaining) * 0.5;

                // スコア計算式にボーナスを追加
                e.totalScore = (e.speed * 1.2) + (e.stamina * 0.8) + (e.tenacity * 1.0) + luck + experienceBonus;

                // ランク名の大文字小文字ブレを吸収して安全に振り分ける
                const normalizedRank = (e.rank || "").toLowerCase();
                const rankKey = Object.keys(leagues).find(k => k.toLowerCase() === normalizedRank);

                if (rankKey) {
                    leagues[rankKey].push(e);
                } else {
                    console.warn("Unknown rank ignored:", e.rank);
                }
            });

            // 4. 各ランクの上位3名を決定
            const finalResults = {
                raceId: raceId,
                participants: raceEntries.map(e => e.id),
                rookie: [],
                pro: [],
                legend: []
            };
            for (const key in leagues) {
                leagues[key].sort((a, b) => b.totalScore - a.totalScore);
                finalResults[key.toLowerCase()] = leagues[key].slice(0, 3).map((r, idx) => ({
                    rank: idx + 1,
                    sheepName: r.sheepName,
                    ownerName: r.ownerName,
                    uid: r.id, // 賞金判定用
                    score: Math.floor(r.totalScore)
                }));
            }

            // 5. 履歴を保存。過去レースの後追い処理では latest を巻き戻さない
            await setDoc(historyRef, { ...finalResults, createdAt: serverTimestamp() });
            if (!newestData || !newestData.raceId || raceId >= newestData.raceId) {
                await setDoc(resultRef, { ...finalResults, createdAt: serverTimestamp() });
                newestData = finalResults;
            }

            // 6. 今回対象のエントリーだけをリセット（未来レース分は残す）
            const batch = writeBatch(db);
            raceEntries.forEach(e => batch.delete(e.ref));
            await batch.commit();

            processedResults.push(finalResults);
            createdNewResult = true;
        }

        return {
            status: createdNewResult ? "new_result" : "finished",
            data: processedResults[processedResults.length - 1],
            results: processedResults
        };

    } catch (e) {
        console.error("Race Process Error:", e);
        return { status: "error" };
    }
};
