/* ============================================
   labo2_game5_color.js — 色の感覚（色合わせ）
   ============================================ */
'use strict';

window.Labo2Game5 = (function() {
    const STATE = {
        trialsTotal: 3,
        currentTrial: 0,
        errors: [],
        isPlaying: false,
        targetHue: 0,
        fixedS: 80,
        fixedL: 60
    };

    function start() {
        STATE.currentTrial = 0;
        STATE.errors = [];
        STATE.isPlaying = true;

        const html = `
            <div id="clr-game-container" style="text-align:center; padding: 10px 0;">
                <div id="clr-message" style="font-size: 1.1rem; font-weight:bold; margin-bottom: 20px; color:var(--text-main); height: 2.5em;">
                    おてほんと おなじ色を つくってね！
                </div>
                
                <div style="display:flex; justify-content:center; align-items:center; gap: 20px; margin-bottom:30px;">
                    <!-- おてほん -->
                    <div>
                        <div style="font-size:0.9rem; color:#777; font-weight:bold; margin-bottom:5px;">おてほん</div>
                        <div id="clr-target-box" style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.15);"></div>
                    </div>
                    
                    <!-- じぶん -->
                    <div>
                        <div style="font-size:0.9rem; color:#777; font-weight:bold; margin-bottom:5px;">きみの色</div>
                        <div id="clr-user-box" style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.15);"></div>
                    </div>
                </div>

                <div id="clr-input-area" style="display:flex; flex-direction:column; align-items:center; background:#fff; border-radius:12px; padding:20px; border:2px dashed #00acc1;">
                    <span style="font-size:0.9rem; color:#777; font-weight:bold; margin-bottom:10px;">スライダーをうごかしてね</span>
                    <input type="range" id="clr-slider" min="0" max="360" value="180" style="width: 280px; max-width: 100%; height:20px; cursor:pointer; 
                        -webkit-appearance: none;
                        background: linear-gradient(to right, hsl(0,80%,60%), hsl(60,80%,60%), hsl(120,80%,60%), hsl(180,80%,60%), hsl(240,80%,60%), hsl(300,80%,60%), hsl(360,80%,60%));
                        border-radius: 10px; outline: none; box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);" oninput="Labo2Game5.updateColor()">
                    
                    <button id="clr-btn" class="btn btn-primary" style="font-size: 1.2rem; padding: 12px 30px; border-radius: 50px; background:#00bcd4; box-shadow:0 6px 0 #00838f; margin-top:25px;" onclick="Labo2Game5.answer()">
                        ✨ できた！
                    </button>
                </div>
            </div>
        `;
        App.setGameHTML(html);

        // 虹色スライダー用のつまみカスタムCSSを追加
        let styleEl = document.getElementById('clr-custom-thumb');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = "clr-custom-thumb";
            styleEl.innerHTML = `
                #clr-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: #fff;
                    border: 3px solid #777;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                }
            `;
            document.head.appendChild(styleEl);
        }

        setTimeout(nextTrial, 1000);
    }

    function nextTrial() {
        if (STATE.currentTrial >= STATE.trialsTotal) {
            endGame();
            return;
        }

        STATE.currentTrial++;
        const msg = document.getElementById('clr-message');
        const btn = document.getElementById('clr-btn');
        const slider = document.getElementById('clr-slider');
        const targetBox = document.getElementById('clr-target-box');

        if (!msg) return;

        msg.innerHTML = `第${STATE.currentTrial}もん：<br>おてほんと おなじ色をつくってね！`;
        btn.style.display = "block";
        btn.style.transform = "translateY(0)";
        btn.style.boxShadow = "0 6px 0 #00838f";
        slider.disabled = false;
        
        // 0と360の両端は同じ赤色になるため、それを避けて出題
        STATE.targetHue = Math.floor(Math.random() * 320) + 20;
        targetBox.style.background = `hsl(${STATE.targetHue}, ${STATE.fixedS}%, ${STATE.fixedL}%)`;
        
        // 最初はランダムな離れた位置からスタートさせる
        let startH = (STATE.targetHue + 180 + (Math.random()*60 - 30)) % 360;
        slider.value = Math.floor(startH);
        
        updateColor();
    }

    function updateColor() {
        if (!STATE.isPlaying) return;
        const val = parseInt(document.getElementById('clr-slider').value, 10);
        const userBox = document.getElementById('clr-user-box');
        userBox.style.background = `hsl(${val}, ${STATE.fixedS}%, ${STATE.fixedL}%)`;
    }

    function answer() {
        if (!STATE.isPlaying) return;

        const btn = document.getElementById('clr-btn');
        const slider = document.getElementById('clr-slider');
        btn.style.display = "none";
        slider.disabled = true;

        const userVal = parseInt(slider.value, 10);
        
        // 誤差を計算（円環なので最大誤差は180）
        let diff = Math.abs(userVal - STATE.targetHue);
        if (diff > 180) {
            diff = 360 - diff;
        }
        
        STATE.errors.push(diff);

        const msg = document.getElementById('clr-message');

        if (diff <= 3) {
            msg.innerHTML = `<span style="color:#ef5350;">ピッタリ大正解！！</span><br><span style="font-size:1rem;">パーフェクトな色彩感覚！</span>`;
            App.showFeedback('correct');
        } else if (diff <= 12) {
            msg.innerHTML = `<span style="color:#ff9800;">おしい！いいセンいってる！</span><br><span style="font-size:1rem;">ごさ: ${diff}</span>`;
            App.showFeedback('correct');
        } else {
            msg.innerHTML = `<span style="color:#3949ab;">ちょっとズレちゃった...</span><br><span style="font-size:1rem;">ごさ: ${diff}</span>`;
            App.showFeedback('wrong');
        }

        setTimeout(nextTrial, 3000);
    }

    function endGame() {
        STATE.isPlaying = false;
        
        // 追加したスタイルをクリーンアップ
        const styleEl = document.getElementById('clr-custom-thumb');
        if (styleEl) styleEl.remove();

        const avgError = STATE.errors.reduce((a, b) => a + b, 0) / STATE.trialsTotal;
        App.saveResult('color', { avgErrorDeg: avgError, trials: STATE.trialsTotal });
    }

    return { start, answer, updateColor };
})();
