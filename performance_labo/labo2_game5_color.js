/* ============================================
   labo2_game5_color.js — 色の感覚
   ============================================ */
'use strict';

window.Labo2Game5 = (function() {
    const STATE = {
        trialsTotal: 6,
        currentTrial: 0,
        correctCount: 0,
        isPlaying: false,
    };

    function start() {
        STATE.currentTrial = 0;
        STATE.correctCount = 0;
        STATE.isPlaying = true;

        const html = `
            <div id="clr-game-container" style="text-align:center; padding: 10px 0;">
                <div id="clr-message" style="font-size: 1.1rem; font-weight:bold; margin-bottom: 20px; color:var(--text-main); height: 2.5em;">
                    ひとつだけ「ちがういろ」があるよ！
                </div>
                
                <div id="clr-choices" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:15px; padding:0 20px;">
                </div>
            </div>
        `;
        App.setGameHTML(html);

        setTimeout(nextTrial, 1000);
    }

    function nextTrial() {
        if (STATE.currentTrial >= STATE.trialsTotal) {
            endGame();
            return;
        }

        STATE.currentTrial++;
        const msg = document.getElementById('clr-message');
        const choicesDiv = document.getElementById('clr-choices');

        if (!msg) return;

        msg.innerHTML = `第${STATE.currentTrial}もん：<br>なかまはずれ はどれ？`;
        choicesDiv.innerHTML = '';
        choicesDiv.style.pointerEvents = "auto";

        const h = Math.floor(Math.random() * 360);
        const s = 60 + Math.floor(Math.random() * 20); 
        const l = 40 + Math.floor(Math.random() * 20); 

        // 難易度調整 (だんだん難しくなる)
        const diffs = [18, 12, 8, 4, 4, 4];
        const diff = diffs[STATE.currentTrial - 1];
        
        const baseColor = `hsl(${h}, ${s}%, ${l}%)`;
        const oddColor = `hsl(${h}, ${s}%, ${l + diff}%)`;

        const options = [];
        const correctIndex = Math.floor(Math.random() * 6); 
        for (let i = 0; i < 6; i++) {
            options.push({
                color: i === correctIndex ? oddColor : baseColor,
                isCorrect: i === correctIndex
            });
        }

        options.forEach(opt => {
            choicesDiv.innerHTML += `
                <div onclick="Labo2Game5.answer(${opt.isCorrect})" style="background:${opt.color}; height:80px; border-radius:16px; cursor:pointer; box-shadow:0 4px 6px rgba(0,0,0,0.1); transition:transform 0.1s;">
                </div>
            `;
        });
    }

    function answer(isCorrect) {
        if (!STATE.isPlaying) return;
        const choicesDiv = document.getElementById('clr-choices');
        choicesDiv.style.pointerEvents = "none";

        if (isCorrect) {
            STATE.correctCount++;
            App.showFeedback('correct');
        } else {
            App.showFeedback('wrong');
        }

        setTimeout(() => {
            nextTrial();
        }, 1200);
    }

    function endGame() {
        STATE.isPlaying = false;
        const correctRate = Math.round((STATE.correctCount / STATE.trialsTotal) * 100);
        App.saveResult('color', { correctRate, trials: STATE.trialsTotal, correct: STATE.correctCount });
    }

    return { start, answer };
})();
