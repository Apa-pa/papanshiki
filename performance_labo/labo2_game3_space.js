/* ============================================
   labo2_game3_space.js — 空間の感覚（ブロックいくつ？）
   ============================================ */
'use strict';

window.Labo2Game3 = (function () {
    const STATE = {
        trialsTotal: 3,
        currentTrial: 0,
        errors: [],
        isPlaying: false,
        actualCount: 0
    };

    function start() {
        STATE.currentTrial = 0;
        STATE.errors = [];
        STATE.isPlaying = true;

        const html = `
            <div id="spc-game-container" style="text-align:center; padding: 10px 0;">
                <div id="spc-message" style="font-size: 1.1rem; font-weight:bold; margin-bottom: 20px; color:var(--text-main); height: 2.5em;">
                    かくれているのも いれて<br>ぜんぶで いくつある？
                </div>
                
                <div style="display:flex; justify-content:center; align-items:center; height: 260px; margin-bottom:10px;">
                    <canvas id="spc-canvas" width="260" height="260"></canvas>
                </div>

                <div id="spc-input-area" style="display:flex; flex-direction:column; align-items:center; background:#fff; border-radius:12px; padding:15px; border:2px dashed #9c27b0;">
                    <div id="spc-slider-val" style="font-size:1.6rem; font-weight:bold; color:#9c27b0; margin-bottom:10px;">10こ</div>
                    <input type="range" id="spc-slider" min="5" max="25" value="10" style="width: 280px; max-width: 100%; height:30px; accent-color:#9c27b0; cursor:pointer;" oninput="Labo2Game3.updateSliderText()">
                    <div style="display:flex; justify-content:space-between; width:280px; max-width:100%; padding:0 5px; font-size:0.8rem; color:#777; margin-top:5px; margin-bottom:15px;">
                        <span>すくない</span>
                        <span>おおい</span>
                    </div>
                    <button id="spc-btn" class="btn btn-primary" style="font-size: 1.2rem; padding: 12px 30px; border-radius: 50px; background:#ab47bc; box-shadow:0 6px 0 #7b1fa2;" onclick="Labo2Game3.answer()">
                        ✨ これだ！
                    </button>
                </div>
            </div>
        `;
        App.setGameHTML(html);

        setTimeout(nextTrial, 1000);
    }

    // アイソメトリック描画用 (x:右下, y:左下, z:上)
    function drawCube(ctx, ox, oy, x, y, z, size) {
        // 等角投影法の変換 (30度)
        const dx = (x - y) * size * Math.cos(Math.PI / 6);
        const dy = (x + y) * size * Math.sin(Math.PI / 6) - (z * size);

        const cx = ox + dx;
        const cy = oy + dy;

        const h = size * Math.sin(Math.PI / 6); // 半分の高さ
        const w = size * Math.cos(Math.PI / 6); // 半分の幅

        // 上面 (明るい)
        ctx.fillStyle = '#4dd0e1';
        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx + w, cy - size + h);
        ctx.lineTo(cx, cy); // 2*h == size
        ctx.lineTo(cx - w, cy - size + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 左面 (少し暗い)
        ctx.fillStyle = '#00bcd4';
        ctx.beginPath();
        ctx.moveTo(cx - w, cy - size + h);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + size);
        ctx.lineTo(cx - w, cy + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 右面 (最も暗い)
        ctx.fillStyle = '#00acc1';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + w, cy - size + h);
        ctx.lineTo(cx + w, cy + h);
        ctx.lineTo(cx, cy + size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    function generateCubes() {
        const grid = [];
        let count = 0;
        for (let x = 0; x < 3; x++) {
            grid[x] = [];
            for (let y = 0; y < 3; y++) {
                // 0〜3段
                const h = Math.floor(Math.random() * 4);
                grid[x][y] = h;
                count += h;
            }
        }

        // 5〜25個に収まるようにリトライ
        if (count < 5 || count > 20) {
            return generateCubes();
        }

        return { grid, count };
    }

    function renderCubes(gridConfig) {
        const canvas = document.getElementById('spc-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#006064';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 1.0;

        // 起点
        const ox = canvas.width / 2;
        const oy = canvas.height / 2 + 15;
        const size = 30; // ブロックの辺サイズ

        // ペインターズアルゴリズム：x+yが大きい（奥）順に描画して手前を正しく重ねる
        for (let xy = 0; xy <= 4; xy++) {
            for (let x = 0; x < 3; x++) {
                const y = xy - x;
                if (y < 0 || y > 2) continue;
                const height = gridConfig.grid[x][y];
                for (let z = 0; z < height; z++) {
                    drawCube(ctx, ox, oy, x, y, z, size);
                }
            }
        }
    }

    function nextTrial() {
        if (STATE.currentTrial >= STATE.trialsTotal) {
            endGame();
            return;
        }

        STATE.currentTrial++;
        const msg = document.getElementById('spc-message');
        const btn = document.getElementById('spc-btn');
        const slider = document.getElementById('spc-slider');
        const inputArea = document.getElementById('spc-input-area');

        if (!msg) return;

        msg.innerHTML = `第${STATE.currentTrial}もん：<br>ぜんぶで いくつある？`;
        inputArea.style.pointerEvents = "auto";
        btn.style.display = "block";
        btn.style.transform = "translateY(0)";
        btn.style.boxShadow = "0 6px 0 #7b1fa2";

        const gridConfig = generateCubes();
        STATE.actualCount = gridConfig.count;

        slider.value = 10;
        updateSliderText();

        renderCubes(gridConfig);
    }

    function updateSliderText() {
        if (!STATE.isPlaying) return;
        const val = parseInt(document.getElementById('spc-slider').value, 10);
        const textEl = document.getElementById('spc-slider-val');
        textEl.innerText = `${val} こ`;
    }

    function answer() {
        if (!STATE.isPlaying) return;

        const btn = document.getElementById('spc-btn');
        btn.style.display = "none";

        const inputArea = document.getElementById('spc-input-area');
        inputArea.style.pointerEvents = "none";

        const slider = document.getElementById('spc-slider');
        const userVal = parseInt(slider.value, 10);

        const errorCount = Math.abs(userVal - STATE.actualCount);
        STATE.errors.push(errorCount);

        const msg = document.getElementById('spc-message');

        if (errorCount === 0) {
            msg.innerHTML = `<span style="color:#ef5350;">ピッタリ大正解！！</span><br><span style="font-size:1rem;">すごい空間認識力！</span>`;
            App.showFeedback('correct');
        } else if (errorCount <= 1) {
            msg.innerHTML = `<span style="color:#ff9800;">おしい！ほぼ正解！</span><br><span style="font-size:1rem;">正解は ${STATE.actualCount}こ</span>`;
            App.showFeedback('correct');
        } else {
            msg.innerHTML = `<span style="color:#3949ab;">ズレちゃった...</span><br><span style="font-size:1rem;">正解は ${STATE.actualCount}こ</span>`;
            App.showFeedback('wrong');
        }

        setTimeout(nextTrial, 3000);
    }

    function endGame() {
        STATE.isPlaying = false;
        const avgError = STATE.errors.reduce((a, b) => a + b, 0) / STATE.trialsTotal;
        App.saveResult('space', { avgErrorCount: avgError, trials: STATE.trialsTotal });
    }

    return { start, answer, updateSliderText };
})();
