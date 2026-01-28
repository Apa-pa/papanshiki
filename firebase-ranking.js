// firebase-ranking.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebaseコンソールで取得した設定をここに貼り付け
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

// 全国ランキングにデータを送る関数
window.uploadToWorldRanking = async function(gameId, localName, score, publicInput) {
    // 1. 名前の決定とチェック
    let finalName = (publicInput || localName).trim();

    // NGワードチェック
    const ngList = ["ばか", "あほ", "うんち", "うんこ", "ちんこ", "まんこ"]; 
    if (finalName === "" || ngList.some(word => finalName.includes(word))) {
        finalName = "森のなかま"; 
    }

    // 文字数制限 (6文字まで)
    if (finalName.length > 6) {
        finalName = finalName.substring(0, 6);
    }

    // 2. Firebaseに送信
    try {
        await addDoc(collection(db, "world_rankings"), {
            gameId: gameId,
            name: finalName,
            score: parseFloat(score),
            timestamp: serverTimestamp()
        });
        console.log(`「${finalName}」でランキング登録したよ！`);
    } catch (e) {
        console.error("登録エラー: ", e);
    }
};