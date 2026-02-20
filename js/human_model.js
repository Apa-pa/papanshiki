
// 臓器の豆知識データ
const ORGAN_INFO = {
    "brain": { title: "<ruby>脳<rt>のう</rt></ruby>", text: "考えたり、体を動かす命令を出す司令塔だよ！" }, // 未使用
    "suizo": { title: "<ruby>膵臓<rt>すいぞう</rt></ruby>", text: "食べ物を消化する液を出したり、体のエネルギー調節をするよ！" },
    "heart": { title: "<ruby>心臓<rt>しんぞう</rt></ruby>", text: "体中に血液を送るポンプだよ！1日に10万回も動くんだ。" },
    "shinzo": { title: "<ruby>心臓<rt>しんぞう</rt></ruby>", text: "体中に血液を送るポンプだよ！1日に10万回も動くんだ。" },
    "lungs": { title: "<ruby>肺<rt>はい</rt></ruby>", text: "空気中の酸素を体に取り入れて、二酸化炭素を出すよ！" },
    "hai": { title: "<ruby>肺<rt>はい</rt></ruby>", text: "空気中の酸素を体に取り入れて、二酸化炭素を出すよ！" },
    "stomach": { title: "<ruby>胃<rt>い</rt></ruby>", text: "食べ物を消化液でドロドロに溶かす袋だよ！" },
    "i": { title: "<ruby>胃<rt>い</rt></ruby>", text: "食べ物を消化液でドロドロに溶かす袋だよ！" },
    "liver": { title: "<ruby>肝臓<rt>かんぞう</rt></ruby>", text: "栄養を蓄えたり、体に悪いものを分解する、働き者だよ！" },
    "kanzo": { title: "<ruby>肝臓<rt>かんぞう</rt></ruby>", text: "栄養を蓄えたり、体に悪いものを分解する、働き者だよ！" },
    "intestine_s": { title: "<ruby>小腸<rt>しょうちょう</rt></ruby>", text: "食べ物から栄養を吸収する、長〜い管だよ！" },
    "shocho": { title: "<ruby>小腸<rt>しょうちょう</rt></ruby>", text: "食べ物から栄養を吸収する、長〜い管だよ！" },
    "intestine_l": { title: "<ruby>大腸<rt>だいちょう</rt></ruby>", text: "水分を吸収して、ウンチを作るところだよ！" },
    "daicho": { title: "<ruby>大腸<rt>だいちょう</rt></ruby>", text: "水分を吸収して、ウンチを作るところだよ！" },
    "kidneys": { title: "<ruby>腎臓<rt>じんぞう</rt></ruby>", text: "血液をろ過して、オシッコを作るよ！背中側にあるんだ。" },
    "jinzo": { title: "<ruby>腎臓<rt>じんぞう</rt></ruby>", text: "血液をろ過して、オシッコを作るよ！背中側にあるんだ。" }
};

// 臓器の配置順序 (奥から手前)
const PLACEMENT_ORDER = [
    "jinzo",      // 腎臓 (最奥)
    "suizo",      // 膵臓
    "daicho",     // 大腸
    "shocho",     // 小腸
    "i",          // 胃
    "kanzo",      // 肝臓
    "hai",        // 肺
    "shinzo"      // 心臓 (最前)
];

let currentTargetIndex = 0;

// ゲーム状態
let placedCount = 0;
const TOTAL_PARTS = 8;

document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

function initGame() {
    setupDragAndDrop();
    updateInstruction();
}

function updateInstruction() {
    const currentOrganKey = PLACEMENT_ORDER[currentTargetIndex];
    if (!currentOrganKey) return; // 全て完了

    const startBtn = document.getElementById('start-overlay');
    if (startBtn) startBtn.style.display = 'none';

    // ガイド表示の更新
    const guideText = document.getElementById('guide-text');
    if (guideText) {
        // 答えは言わずに場所だけ示す
        guideText.innerHTML = `光っている場所にある臓器はどれかな？`;
        guideText.classList.add('pop-anim');
        setTimeout(() => guideText.classList.remove('pop-anim'), 500);
    }

    // ドラッグ可能状態の更新
    // 全ての未配置パーツをドラッグ可能にする（正解以外も触れるようにする）
    const draggables = document.querySelectorAll('.organ-part');
    draggables.forEach(el => {
        if (!el.classList.contains('placed')) {
            el.classList.remove('disabled');
        }
    });

    // ドロップゾーンのハイライト（ヒント）
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
        if (zone.dataset.organ === currentOrganKey) {
            zone.classList.add('target-zone');
        } else {
            zone.classList.remove('target-zone');
        }
    });
}

function setupDragAndDrop() {
    const draggables = document.querySelectorAll('.organ-part');

    // モバイル/PC両対応のためのポインターイベント実装
    draggables.forEach(draggable => {
        draggable.addEventListener('pointerdown', onPointerDown);
        draggable.ondragstart = () => false; // デフォルトのドラッグ無効化
        // iPad対策：タッチ操作でスクロール等を抑制
        draggable.style.touchAction = 'none';
        draggable.style.userSelect = 'none';
        draggable.style.webkitUserSelect = 'none';
    });
}

// ドラッグ中の状態保持
let currentDragElement = null;
let dragClone = null;
let isDragging = false; // ドラッグ中フラグ（重複防止）
let dragOffsetX, dragOffsetY;

function onPointerDown(e) {
    if (e.target.classList.contains('placed')) return; // 配置済みは動かせない
    if (isDragging) return; // 既にドラッグ中なら無視（マルチタッチ対策）

    e.preventDefault(); // デフォルト動作無効化
    isDragging = true;
    currentDragElement = e.target;

    // iPad対策：Pointer Captureで確実にイベントを追跡
    try {
        e.target.setPointerCapture(e.pointerId);
    } catch (ex) {
        // setPointerCaptureが使えない場合は無視
    }

    // クローンを作成してドラッグ追従させる
    dragClone = currentDragElement.cloneNode(true);
    dragClone.classList.add('dragging');
    dragClone.style.position = 'absolute';
    dragClone.style.zIndex = 1000;
    dragClone.style.width = '80px'; // 少し大きく
    dragClone.style.height = '80px';
    dragClone.style.pointerEvents = 'none'; // 下の要素の判定を邪魔しない

    document.body.appendChild(dragClone);

    // 初期位置設定
    moveClone(e.clientX, e.clientY);

    // イベントリスナー追加
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerCancel);

    // 元の要素を少し薄くする
    currentDragElement.style.opacity = '0.3';
}

function onPointerMove(e) {
    if (!dragClone) return;
    e.preventDefault();
    moveClone(e.clientX, e.clientY);
}

function moveClone(x, y) {
    dragClone.style.left = `${x - 40}px`; // 中心に合わせる簡易補正
    dragClone.style.top = `${y - 40}px`;
}

function onPointerUp(e) {
    if (!dragClone) return;

    // Pointer Captureの解放
    if (currentDragElement) {
        try { currentDragElement.releasePointerCapture(e.pointerId); } catch (ex) { }
    }

    // ドロップ判定
    // マウス/指の位置にある要素を取得
    const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
    const dropZone = dropTarget ? dropTarget.closest('.drop-zone') : null;

    if (dropZone) {
        checkDrop(dropZone);
    } else {
        // ドロップ失敗（元に戻る）
        playSe('cancel');
        resetDrag();
    }

    // 後始末
    cleanupDrag();
}

// iPad対策：タッチがキャンセルされた場合のハンドリング
function onPointerCancel(e) {
    if (!dragClone) return;
    resetDrag();
    cleanupDrag();
}

// ドラッグ後始末の共通処理
function cleanupDrag() {
    if (dragClone && dragClone.parentNode) {
        dragClone.parentNode.removeChild(dragClone);
    }
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerCancel);

    dragClone = null;
    currentDragElement = null;
    isDragging = false;
}

function resetDrag() {
    if (currentDragElement) {
        currentDragElement.style.opacity = '1';
        // ビヨンというアニメーションを入れるならここ
    }
}

function checkDrop(dropZone) {
    const organType = currentDragElement.dataset.organ;
    const zoneType = dropZone.dataset.organ;

    // 順番かつ正しい場所かチェック
    if (organType === zoneType && organType === PLACEMENT_ORDER[currentTargetIndex]) {
        // 正解！
        successDrop(dropZone, organType);
    } else {
        // 不正解
        playSe('wrong');
        resetDrag();
        // 視覚的フィードバック（震えるなど）
        dropZone.classList.add('shaking');
        setTimeout(() => dropZone.classList.remove('shaking'), 500);
    }
}

function successDrop(dropZone, organType) {
    playSe('correct');

    // 配置済みの見た目にする
    currentDragElement.classList.add('placed');
    currentDragElement.classList.remove('active-target');
    currentDragElement.style.opacity = '0.3'; // トレイの方は薄く

    // ドロップゾーンに画像を表示
    const placedImg = document.createElement('img');
    placedImg.src = currentDragElement.src;
    placedImg.classList.add('placed-organ');
    dropZone.appendChild(placedImg);
    dropZone.classList.add('correct-placed'); // 枠線を消すなど
    dropZone.style.background = 'none';
    dropZone.style.border = 'none'; // 枠線を消す

    // 豆知識表示
    showInfo(organType);

    placedCount++;
    // 最後のパーツ配置後、少し待ってから完了演出
    if (placedCount >= TOTAL_PARTS) {
        // ファンファーレ的な演出（ここでは簡易的にテキスト変更）
        const guideText = document.getElementById('guide-text');
        if (guideText) {
            guideText.innerText = "完成！！";
            guideText.style.color = "#ff4081";
            guideText.style.fontSize = "2rem";
        }

        // 3秒後にクリア画面表示
        setTimeout(() => {
            playSe('clear'); // ここで鳴らす
            showClearScreen();
        }, 3000);
    } else {
        currentTargetIndex++; // 次のターゲットへ
        updateInstruction();
    }
}

function showInfo(organType) {
    const info = ORGAN_INFO[organType];
    const popup = document.getElementById('info-popup');
    const title = document.getElementById('info-title');
    const text = document.getElementById('info-text');

    if (info) {
        title.innerHTML = info.title; // innerText -> innerHTML (ルビ対応)
        text.innerText = info.text;
        popup.style.display = 'flex';
    }
}

function closePopup() {
    document.getElementById('info-popup').style.display = 'none';
}

function showClearScreen() {
    const screen = document.getElementById('clear-screen');
    screen.style.display = 'flex';

    // 報酬ボタンのセットアップ
    const rewardBtn = document.getElementById('reward-btn');
    if (!rewardBtn) {
        // ボタンがなければ動的に追加（HTML側に追加しても良いが今回はJSで制御）
        const msgBox = screen.querySelector('.message-box');
        const newBtn = document.createElement('button');
        newBtn.id = 'reward-btn';
        newBtn.className = 'btn-reward';
        newBtn.innerText = '🎁 50ポイントゲット！';
        newBtn.onclick = getReward;

        // "もう一度あそぶ"ボタンの前に追加
        const retryBtn = screen.querySelector('.btn-retry');
        msgBox.insertBefore(newBtn, retryBtn);
    }
}

// ポイント獲得処理
function getReward() {
    const rewardBtn = document.getElementById('reward-btn');
    if (rewardBtn.disabled) return;

    if (typeof showPointGetDialog === 'function') {
        // ranking.js の機能を使ってポイント付与ダイアログを表示
        showPointGetDialog(50, () => {
            rewardBtn.disabled = true;
            rewardBtn.innerText = "受取済み";
            rewardBtn.style.background = "#ccc";
        });
    } else {
        alert("ポイントシステム(ranking.js)が読み込まれていません。\nクリアおめでとう！");
        rewardBtn.disabled = true;
    }
}

// 簡易SE再生
function playSe(type) {
    console.log(`Play SE: ${type}`);
    // 音声ファイルがあれば new Audio(src).play();
}
