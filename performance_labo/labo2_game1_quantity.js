/* ============================================
   labo2_game1_quantity.js — 量の感覚測定
   ============================================ */
'use strict';

window.Labo2Game1 = (function() {
    const STATE = {
        trialsTotal: 5,
        currentTrial: 0,
        correctCount: 0,
        leftCount: 0,
        rightCount: 0,
        isPlaying: false,
        timeoutId: null
    };

    function start() {
        STATE.currentTrial = 0;
        STATE.correctCount = 0;
        STATE.isPlaying = true;

        const html = `
            <div id="q-game-container" style="text-align:center; padding: 20px 0;">
                <div id="q-message" style="font-size: 1.2rem; font-weight:bold; margin-bottom: 20px; color:var(--text-main); height:1.5em;">
                    どっちがおおい？よくみてね！
                </div>
                
                <div style="display: flex; justify-content: space-around; gap: 10px; margin-bottom: 20px; height: 50px;">
                    <button id="q-btn-left" class="btn" style="flex:1; background: #fff; border: 3px solid #ff9800; color: #ff9800; font-size: 1.2rem; display:none; padding:10px;" onclick="Labo2Game1.answer('left')">◀ ひだり</button>
                    <button id="q-btn-right" class="btn" style="flex:1; background: #fff; border: 3px solid #ff9800; color: #ff9800; font-size: 1.2rem; display:none; padding:10px;" onclick="Labo2Game1.answer('right')">みぎ ▶</button>
                </div>

                <div style="display: flex; justify-content: space-around; gap: 10px; height: 260px;">
                    <div id="q-box-left" style="flex:1; background: #fdfdfd; border-radius: 16px; border: 3px dashed #ccc; position: relative; overflow: hidden; display:flex; flex-wrap:wrap; align-content:center; justify-content:center; padding:10px; gap:4px; box-shadow: inset 0 3px 6px rgba(0,0,0,0.05);"></div>
                    <div id="q-box-right" style="flex:1; background: #fdfdfd; border-radius: 16px; border: 3px dashed #ccc; position: relative; overflow: hidden; display:flex; flex-wrap:wrap; align-content:center; justify-content:center; padding:10px; gap:4px; box-shadow: inset 0 3px 6px rgba(0,0,0,0.05);"></div>
                </div>
            </div>
        `;
        App.setGameHTML(html);

        setTimeout(nextTrial, 1500);
    }

    function generateApples(count) {
        let html = '';
        // 5x5の仮想グリッド（25マス）のうち、ランダムなセルに配置して完全に重なるのを防ぎつつ散らす
        const cells = Array.from({length: 25}, (_, i) => i).sort(() => Math.random() - 0.5);
        
        for(let i=0; i<count; i++) {
            const cellId = cells[i];
            const row = Math.floor(cellId / 5);
            const col = cellId % 5;
            
            // 枠からはみ出ないように配置。少しだけランダムな揺らぎを加える
            const topPct = (row * 16) + 5 + (Math.random() * 8 - 4);
            const leftPct = (col * 16) + 4 + (Math.random() * 8 - 4);
            const rot = (Math.random() - 0.5) * 60;
            
            html += `<span style="position:absolute; top:${topPct}%; left:${leftPct}%; font-size: 1.8rem; transform: rotate(${rot}deg);">🍎</span>`;
        }
        return html;
    }

    function nextTrial() {
        if (STATE.currentTrial >= STATE.trialsTotal) {
            endGame();
            return;
        }

        STATE.currentTrial++;
        const msg = document.getElementById('q-message');
        const boxL = document.getElementById('q-box-left');
        const boxR = document.getElementById('q-box-right');
        const btnL = document.getElementById('q-btn-left');
        const btnR = document.getElementById('q-btn-right');

        if (!msg) return;

        msg.textContent = `第${STATE.currentTrial}もん：よくみてね...`;
        boxL.innerHTML = '';
        boxR.innerHTML = '';
        boxL.style.background = '#fdfdfd';
        boxR.style.background = '#fdfdfd';
        btnL.style.display = 'none';
        btnR.style.display = 'none';

        // 難易度調整 (8〜16個、差は1〜4個)
        const baseCount = Math.floor(Math.random() * 9) + 8; 
        const diff = Math.floor(Math.random() * 4) + 1; 

        if (Math.random() > 0.5) {
            STATE.leftCount = baseCount + diff;
            STATE.rightCount = baseCount;
        } else {
            STATE.leftCount = baseCount;
            STATE.rightCount = baseCount + diff;
        }

        setTimeout(() => {
            boxL.innerHTML = generateApples(STATE.leftCount);
            boxR.innerHTML = generateApples(STATE.rightCount);
            msg.textContent = 'パッ！';

            // 0.8秒後に隠す
            STATE.timeoutId = setTimeout(() => {
                boxL.innerHTML = '<div style="font-size:4rem; color:#bbb; align-self:center;">？</div>';
                boxR.innerHTML = '<div style="font-size:4rem; color:#bbb; align-self:center;">？</div>';
                boxL.style.background = '#eceff1'; // 隠した感
                boxR.style.background = '#eceff1';
                msg.textContent = 'どっちがおおかった？';
                btnL.style.display = 'block';
                btnR.style.display = 'block';
            }, 800);
        }, 1000);
    }

    function answer(choice) {
        if (!STATE.isPlaying) return;
        clearTimeout(STATE.timeoutId);

        const btnL = document.getElementById('q-btn-left');
        const btnR = document.getElementById('q-btn-right');
        btnL.style.display = 'none';
        btnR.style.display = 'none';

        let isCorrect = false;
        if (choice === 'left' && STATE.leftCount > STATE.rightCount) isCorrect = true;
        if (choice === 'right' && STATE.rightCount > STATE.leftCount) isCorrect = true;

        if (isCorrect) {
            STATE.correctCount++;
            App.showFeedback('correct');
        } else {
            App.showFeedback('wrong');
        }

        const boxL = document.getElementById('q-box-left');
        const boxR = document.getElementById('q-box-right');
        boxL.innerHTML = generateApples(STATE.leftCount) + `<div style="position:absolute; bottom:5px; left:0; width:100%; text-align:center; font-size:1.7rem; font-weight:bold; color:#1565c0; background:rgba(255,255,255,0.7); border-radius:10px; z-index:10;">${STATE.leftCount}こ</div>`;
        boxR.innerHTML = generateApples(STATE.rightCount) + `<div style="position:absolute; bottom:5px; left:0; width:100%; text-align:center; font-size:1.7rem; font-weight:bold; color:#1565c0; background:rgba(255,255,255,0.7); border-radius:10px; z-index:10;">${STATE.rightCount}こ</div>`;
        boxL.style.background = '#fdfdfd';
        boxR.style.background = '#fdfdfd';

        setTimeout(nextTrial, 2000);
    }

    function endGame() {
        STATE.isPlaying = false;
        const correctRate = Math.round((STATE.correctCount / STATE.trialsTotal) * 100);
        App.saveResult('quantity', { correctRate: correctRate, trials: STATE.trialsTotal, correct: STATE.correctCount });
    }

    return { start, answer };
})();
