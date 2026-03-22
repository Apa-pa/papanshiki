/* ============================================
   labo2_game2_speed.js — 速度・時間の感覚推論
   ============================================ */
'use strict';

window.Labo2Game2 = (function() {
    const STATE = {
        trialsTotal: 3,
        currentTrial: 0,
        errors: [],
        isPlaying: false,
        startTime: 0,
        expectedDuration: 0,
        speed: 0,
        animStartPos: -60
    };

    function start() {
        STATE.currentTrial = 0;
        STATE.errors = [];
        STATE.isPlaying = true;

        const html = `
            <div id="sp-game-container" style="text-align:center; padding: 10px 0;">
                <div id="sp-message" style="font-size: 1.1rem; font-weight:bold; margin-bottom: 20px; color:var(--text-main); height: 2.5em;">
                    トンネルからでてくる<br>タイミングをあててね！
                </div>
                
                <div style="position: relative; width: 100%; height: 120px; background: #e0f2f1; border-radius: 12px; overflow: hidden; margin-bottom: 30px; border: 3px solid #b2dfdb;">
                    <!-- レール -->
                    <div style="position:absolute; bottom:20px; left:0; width:100%; height:6px; background:#90a4ae; border-top:2px dashed #fff;"></div>
                    
                    <!-- 列車 -->
                    <div id="sp-train" style="position:absolute; bottom:23px; left:${STATE.animStartPos}px; font-size: 3rem; transition: transform linear; z-index:5; white-space:nowrap;">🚆</div>
                    
                    <!-- トンネル -->
                    <div style="position:absolute; bottom:0; left: 40%; width: 55%; height: 120px; background: #546e7a; border-radius: 20px 0 0 0; z-index: 10; border-left: 5px solid #37474f;">
                        <div style="position:absolute; top:40%; width:100%; text-align:center; color:#cfd8dc; font-weight:bold; letter-spacing:4px;">TUNNEL</div>
                    </div>
                    
                    <!-- 出口の線(ゴール) -->
                    <div id="sp-goal-line" style="position:absolute; bottom:0; left: 95%; width: 4px; height: 120px; background: #ef5350; z-index: 15;"></div>
                </div>

                <button id="sp-btn" class="btn btn-primary" style="font-size: 1.6rem; padding: 16px; border-radius: 50px; box-shadow: 0 8px 0 #3949ab; width:80%; margin:0 auto;" onmousedown="Labo2Game2.pushBtn()" ontouchstart="Labo2Game2.pushBtn(); event.preventDefault();" disabled>
                    🔴 でてきた！
                </button>
            </div>
        `;
        App.setGameHTML(html);

        setTimeout(nextTrial, 3500); 
    }

    function nextTrial() {
        if (STATE.currentTrial >= STATE.trialsTotal) {
            endGame();
            return;
        }

        STATE.currentTrial++;
        const msg = document.getElementById('sp-message');
        const btn = document.getElementById('sp-btn');
        const train = document.getElementById('sp-train');

        if (!msg) return;

        msg.innerHTML = `第${STATE.currentTrial}もん：<br>れっしゃがはしるよ！`;
        btn.disabled = true;
        btn.style.transform = "translateY(0)";
        btn.style.boxShadow = "0 8px 0 #3949ab";

        // 初期位置リセット
        train.style.transition = 'none';
        train.style.transform = `translateX(0px)`;
        train.style.zIndex = "5"; // トンネル(10)の下
        train.style.textShadow = "none";
        
        // 画面幅に基づく距離
        const containerWidth = document.getElementById('sp-game-container').offsetWidth;
        const trainWidth = train.offsetWidth || 48; // フォントサイズ3remの列車の幅(基本約48px)
        
        // ゴールラインは 95% の位置。
        const goalDistX = containerWidth * 0.95; 
        
        // 実際の「ピッタリ」移動量 = ゴール X 座標 - 列車の幅 - 初期位置 X 座標
        const perfectDist = (goalDistX - trainWidth) - STATE.animStartPos; 
        
        // 列車が画面外まで「完全に走り抜ける」ための移動距離
        const exitDist = (containerWidth + 150) - STATE.animStartPos;
        
        // ピッタリまでの目標時間 (2000ms 〜 4500ms)
        const perfectDuration = 2000 + (Math.random() * 2500);
        STATE.expectedDuration = perfectDuration;

        // 速度 (1ミリ秒あたりに進むピクセル)
        STATE.speed = perfectDist / perfectDuration;

        // 画面外まで走り抜けるのに必要なアニメーションの全体の時間
        const totalDuration = exitDist / STATE.speed;

        setTimeout(() => {
            msg.innerHTML = `よくみててね...`;
            
            // アニメーション開始 (等速直線運動で画面外まで進ませる)
            train.offsetWidth; // 強制リフロー
            train.style.transition = `transform ${totalDuration}ms linear`;
            train.style.transform = `translateX(${exitDist}px)`;
            
            STATE.startTime = performance.now();
            btn.disabled = false;
        }, 1500); 
    }

    function pushBtn() {
        if (!STATE.isPlaying) return;
        const btn = document.getElementById('sp-btn');
        if (btn.disabled) return;

        btn.disabled = true;
        btn.style.transform = "translateY(8px)";
        btn.style.boxShadow = "none";

        const pushTime = performance.now();
        const train = document.getElementById('sp-train');
        
        const elapsed = pushTime - STATE.startTime;
        let currentX = STATE.speed * elapsed;
        
        // アニメーション停止して今の位置に固定
        train.style.transition = 'none';
        train.style.transform = `translateX(${currentX}px)`;
        // 暗いトンネル内でも目立つようにトンネルの上に表示し、光らせる
        train.style.zIndex = "20"; 
        train.style.textShadow = "0 0 15px rgba(255, 255, 255, 1)";

        const errorMs = Math.abs(elapsed - STATE.expectedDuration);
        STATE.errors.push(errorMs);

        const msg = document.getElementById('sp-message');
        if (errorMs < 150) {
            msg.innerHTML = `<span style="color:#ef5350;">ピッタリ！！すごい！</span><br>ごさ: ${Math.round(errorMs)}ミリびょう`;
            App.showFeedback('correct');
        } else if (errorMs < 400) {
            msg.innerHTML = `<span style="color:#ff9800;">おしい！</span><br>ごさ: ${Math.round(errorMs)}ミリびょう`;
            App.showFeedback('correct');
        } else {
            msg.innerHTML = `<span style="color:#3949ab;">ズレちゃった...</span><br>ごさ: ${Math.round(errorMs)}ミリびょう`;
            App.showFeedback('wrong');
        }

        setTimeout(() => {
            nextTrial();
        }, 2000);
    }

    function endGame() {
        STATE.isPlaying = false;
        const avgError = STATE.errors.reduce((a, b) => a + b, 0) / STATE.trialsTotal;
        App.saveResult('speed', { avgErrorMs: avgError, trials: STATE.trialsTotal });
    }

    return { start, pushBtn };
})();
