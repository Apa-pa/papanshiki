/* ============================================
   labo2_game1_quantity.js — 量の感覚測定
   ============================================ */
'use strict';

window.Labo2Game1 = (function() {
    const STATE = {
        trialsTotal: 5,
        currentTrial: 0,
        errors: [],
        leftCount: 0,
        rightCount: 0,
        isPlaying: false,
        timeoutId: null
    };

    function start() {
        STATE.currentTrial = 0;
        STATE.errors = [];
        STATE.isPlaying = true;

        const html = `
            <div id="q-game-container" style="text-align:center; padding: 10px 0;">
                <div id="q-message" style="font-size: 1.2rem; font-weight:bold; margin-bottom: 15px; color:var(--text-main); height:1.5em;">
                    どっちが どのくらい おおい？
                </div>
                
                <div style="display: flex; justify-content: space-around; gap: 10px; height: 180px; margin-bottom: 20px;">
                    <div id="q-box-left" style="flex:1; background: #fdfdfd; border-radius: 16px; border: 3px dashed #ccc; position: relative; overflow: hidden; display:flex; flex-wrap:wrap; align-content:center; justify-content:center; padding:10px; gap:4px; box-shadow: inset 0 3px 6px rgba(0,0,0,0.05);"></div>
                    <div id="q-box-right" style="flex:1; background: #fdfdfd; border-radius: 16px; border: 3px dashed #ccc; position: relative; overflow: hidden; display:flex; flex-wrap:wrap; align-content:center; justify-content:center; padding:10px; gap:4px; box-shadow: inset 0 3px 6px rgba(0,0,0,0.05);"></div>
                </div>

                <div id="q-input-area" style="display:none; flex-direction:column; align-items:center; background:#fff; border-radius:12px; padding:15px; border:2px dashed #ff9800;">
                    <div id="q-slider-val" style="font-size:1.2rem; font-weight:bold; color:#ff9800; margin-bottom:10px;">おなじ かず</div>
                    <input type="range" id="q-slider" min="-6" max="6" value="0" style="width: 280px; max-width: 100%; height:30px; accent-color:#ff9800; cursor:pointer;" oninput="Labo2Game1.updateSliderText()">
                    <div style="display:flex; justify-content:space-between; width:280px; max-width:100%; padding:0 5px; font-size:0.8rem; color:#777; margin-top:5px; margin-bottom:15px;">
                        <span>◀ ひだり</span>
                        <span>おなじ</span>
                        <span>みぎ ▶</span>
                    </div>
                    <button class="btn btn-accent" style="font-size: 1.2rem; padding: 12px 30px; border-radius: 50px;" onclick="Labo2Game1.answer()">
                        ✨ けってい！
                    </button>
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

        if (!msg) return;

        msg.textContent = `第${STATE.currentTrial}もん：よくみてね...`;
        boxL.innerHTML = '';
        boxR.innerHTML = '';
        boxL.style.background = '#fdfdfd';
        boxR.style.background = '#fdfdfd';
        
        const inputArea = document.getElementById('q-input-area');
        if (inputArea) inputArea.style.display = 'none';

        // 難易度調整 (8〜14個、差は1〜4個)
        const baseCount = Math.floor(Math.random() * 7) + 8; 
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

            // ちょっと見せてから隠す (1秒)
            STATE.timeoutId = setTimeout(() => {
                boxL.innerHTML = '<div style="font-size:4rem; color:#bbb; align-self:center;">？</div>';
                boxR.innerHTML = '<div style="font-size:4rem; color:#bbb; align-self:center;">？</div>';
                boxL.style.background = '#eceff1'; // 隠した感
                boxR.style.background = '#eceff1';
                msg.innerHTML = 'どっちが どれくらい おおい？';
                
                const slider = document.getElementById('q-slider');
                slider.value = 0;
                Labo2Game1.updateSliderText();
                document.getElementById('q-input-area').style.display = 'flex';
            }, 1000);
        }, 1000);
    }

    function updateSliderText() {
        if (!STATE.isPlaying) return;
        const val = parseInt(document.getElementById('q-slider').value, 10);
        const textEl = document.getElementById('q-slider-val');
        if (val < 0) {
            textEl.innerHTML = `「ひだり」が <span style="font-size:1.5rem; color:#ef5350;">${Math.abs(val)}こ</span> おおい`;
        } else if (val > 0) {
            textEl.innerHTML = `「みぎ」が <span style="font-size:1.5rem; color:#1e88e5;">${val}こ</span> おおい`;
        } else {
            textEl.innerHTML = `おなじ かず`;
        }
    }

    function answer() {
        if (!STATE.isPlaying) return;

        document.getElementById('q-input-area').style.display = 'none';

        const slider = document.getElementById('q-slider');
        const userVal = parseInt(slider.value, 10);
        // actualVal > 0 means Right is more
        const actualVal = STATE.rightCount - STATE.leftCount; 

        const errorCount = Math.abs(userVal - actualVal);
        STATE.errors.push(errorCount);

        const msg = document.getElementById('q-message');
        if (errorCount === 0) {
            msg.innerHTML = `<span style="color:#ef5350;">ピッタリ大正解！！すごすぎる！</span>`;
            App.showFeedback('correct');
        } else if (errorCount <= 2) {
            const txt = actualVal < 0 ? 'ひだり' : 'みぎ';
            msg.innerHTML = `<span style="color:#ff9800;">おしい！いいセンいってる！</span><br><span style="font-size:1rem;">正解は「${txt}」が ${Math.abs(actualVal)}こ おおい</span>`;
            App.showFeedback('correct');
        } else {
            const txt = actualVal < 0 ? 'ひだり' : 'みぎ';
            msg.innerHTML = `<span style="color:#3949ab;">ちょっとズレちゃった...</span><br><span style="font-size:1rem;">正解は「${txt}」が ${Math.abs(actualVal)}こ おおい</span>`;
            App.showFeedback('wrong');
        }

        const boxL = document.getElementById('q-box-left');
        const boxR = document.getElementById('q-box-right');
        boxL.innerHTML = generateApples(STATE.leftCount) + `<div style="position:absolute; bottom:5px; left:0; width:100%; text-align:center; font-size:1.7rem; font-weight:bold; color:#1565c0; background:rgba(255,255,255,0.7); border-radius:10px; z-index:10;">${STATE.leftCount}こ</div>`;
        boxR.innerHTML = generateApples(STATE.rightCount) + `<div style="position:absolute; bottom:5px; left:0; width:100%; text-align:center; font-size:1.7rem; font-weight:bold; color:#1565c0; background:rgba(255,255,255,0.7); border-radius:10px; z-index:10;">${STATE.rightCount}こ</div>`;
        boxL.style.background = '#fdfdfd';
        boxR.style.background = '#fdfdfd';

        setTimeout(nextTrial, 3500);
    }

    function endGame() {
        STATE.isPlaying = false;
        const avgError = STATE.errors.reduce((a, b) => a + b, 0) / STATE.trialsTotal;
        App.saveResult('quantity', { avgErrorCount: avgError, trials: STATE.trialsTotal });
    }

    return { start, answer, updateSliderText };
})();
