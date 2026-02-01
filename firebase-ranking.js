// firebase-ranking.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// ★ setDoc, doc, getDocs を追加でインポートしました
import { getFirestore, collection, addDoc, setDoc, doc, getDocs, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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