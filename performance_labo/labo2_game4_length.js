/* ============================================
   labo2_game4_length.js — 長さの感覚
   ============================================ */
'use strict';

window.Labo2Game4 = (function() {
    const STATE = {
        trialsTotal: 3,
        currentTrial: 0,
        errors: [],
        isPlaying: false,
        targetPct: 0,
        timerList: []
    };

    function clearAllTimers() {
        STATE.timerList.forEach(clearTimeout);
        STATE.timerList = [];
    }

    function addTimer(fn, delay) {
        const id = setTimeout(fn, delay);
        STATE.timerList.push(id);
        return id;
    }

    function start() {
        STATE.currentTrial = 0;
        STATE.errors = [];
        STATE.isPlaying = true;
        clearAllTimers();

        const html = `
            <div id="len-game-container" style="text-align:center; padding: 10px 0;">
                <div id="len-message" style="font-size: 1.1rem; font-weight:bold; margin-bottom: 20px; color:var(--text-main); height: 2.5em;">
                    おてほんのながさをおぼえてね！
                </div>
                
                <div style="background:#fff; border-radius:12px; padding:20px 10px; margin-bottom:20px; border:2px dashed #ccc;">
                    <!-- おてほん -->
                    <div style="margin-bottom:15px; text-align:left;">
                        <span style="font-size:0.8rem; color:#777; font-weight:bold;">おてほん</span>
                        <div style="width:100%; height:30px; background:#f5f5f5; border-radius:15px; position:relative; overflow:hidden;">
                            <div id="len-target-bar" style="height:100%; width:0%; background:#66bb6a; transition: width 0.3s, opacity 0.5s; opacity:1; border-radius:15px;"></div>
                        </div>
                    </div>
                    
                    <!-- じぶん -->
                    <div style="text-align:left; position:relative;">
                        <span style="font-size:0.8rem; color:#777; font-weight:bold;">きみのバー（つまみをうごかしてね）</span>
                        <input type="range" id="len-slider" min="0" max="100" value="0" style="width:100%; height:30px; margin-top:5px; accent-color:#ff9800; cursor:pointer;" disabled>
                    </div>
                </div>

                <button id="len-btn" class="btn btn-accent" style="font-size: 1.3rem; padding: 16px; border-radius: 50px; display:none; width:80%; margin:0 auto;" onclick="Labo2Game4.answer()">
                    ✨ ピタッとこれくらい！
                </button>
            </div>
        `;
        App.setGameHTML(html);

        addTimer(nextTrial, 1000);
    }

    function nextTrial() {
        if (STATE.currentTrial >= STATE.trialsTotal) {
            endGame();
            return;
        }

        STATE.currentTrial++;
        const msg = document.getElementById('len-message');
        const targetBar = document.getElementById('len-target-bar');
        const slider = document.getElementById('len-slider');
        const btn = document.getElementById('len-btn');

        if (!msg) return;

        slider.value = 0;
        slider.disabled = true;
        btn.style.display = 'none';
        
        targetBar.style.opacity = '1';
        targetBar.style.width = '0%';
        targetBar.style.background = '#66bb6a';
        msg.innerHTML = `第${STATE.currentTrial}もん：<br>ながさをおぼえて！`;

        STATE.targetPct = Math.floor(Math.random() * 60) + 20; // 20% to 80%

        addTimer(() => {
            targetBar.style.width = `${STATE.targetPct}%`;
            
            addTimer(() => {
                targetBar.style.opacity = '0'; // 隠す
                msg.innerHTML = `おてほんが消えたよ！<br>スライダーをおなじながさにしてね`;
                slider.disabled = false;
                btn.style.display = 'block';
            }, 2000); 
        }, 500);
    }

    function answer() {
        if (!STATE.isPlaying) return;
        clearAllTimers();
        
        const slider = document.getElementById('len-slider');
        const targetBar = document.getElementById('len-target-bar');
        const btn = document.getElementById('len-btn');
        const msg = document.getElementById('len-message');
        
        slider.disabled = true;
        btn.style.display = 'none';

        const userVal = parseInt(slider.value, 10);
        const errorPct = Math.abs(userVal - STATE.targetPct);
        STATE.errors.push(errorPct);

        // 正解表示
        targetBar.style.opacity = '0.4';
        targetBar.style.background = '#ef5350'; 

        if (errorPct <= 5) {
            msg.innerHTML = `<span style="color:#ef5350;">ピッタリ！！かんぺき！</span><br>ごさ: ${errorPct}%`;
            App.showFeedback('correct');
        } else if (errorPct <= 15) {
            msg.innerHTML = `<span style="color:#ff9800;">おしい！いいカンジ！</span><br>ごさ: ${errorPct}%`;
            App.showFeedback('correct');
        } else {
            msg.innerHTML = `<span style="color:#3949ab;">すこしズレちゃった...</span><br>ごさ: ${errorPct}%`;
            App.showFeedback('wrong');
        }

        addTimer(nextTrial, 2500);
    }

    function endGame() {
        STATE.isPlaying = false;
        const avgError = STATE.errors.reduce((a, b) => a + b, 0) / STATE.trialsTotal;
        App.saveResult('length', { avgErrorPct: avgError, trials: STATE.trialsTotal });
    }

    return { start, answer };
})();
