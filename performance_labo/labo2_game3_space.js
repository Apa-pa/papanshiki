/* ============================================
   labo2_game3_space.js — 空間の感覚（くるくるシルエット）
   ============================================ */
'use strict';

window.Labo2Game3 = (function() {
    const STATE = {
        trialsTotal: 3,
        currentTrial: 0,
        correctCount: 0,
        isPlaying: false,
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
        STATE.correctCount = 0;
        STATE.isPlaying = true;
        clearAllTimers();

        const html = `
            <div id="spc-game-container" style="text-align:center; padding: 10px 0;">
                <div id="spc-message" style="font-size: 1.1rem; font-weight:bold; margin-bottom: 20px; color:var(--text-main); height: 2.5em;">
                    このかたちをまわすと、<br>どの影になるかな？
                </div>
                
                <div style="display:flex; justify-content:center; align-items:center; height: 140px; margin-bottom:20px;">
                    <div id="spc-target" style="display:grid; grid-template-columns:repeat(3, 40px); grid-template-rows:repeat(3, 40px); gap:3px; transition: transform 0.8s ease-in-out;">
                    </div>
                </div>

                <div id="spc-choices" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:0 20px;">
                </div>
            </div>
        `;
        App.setGameHTML(html);

        addTimer(nextTrial, 1000);
    }

    function getRandomGrid() {
        const grid = [0,0,0,0,0,0,0,0,0];
        let count = 0;
        while(count < 5) {
            let r = Math.floor(Math.random()*9);
            if (grid[r] === 0) {
                grid[r] = 1;
                count++;
            }
        }
        return grid;
    }

    function rotate90(grid) {
        return [
            grid[6], grid[3], grid[0],
            grid[7], grid[4], grid[1],
            grid[8], grid[5], grid[2]
        ];
    }

    function rotate180(grid) { return rotate90(rotate90(grid)); }
    function rotate270(grid) { return rotate90(rotate180(grid)); }
    
    function mirrorX(grid) {
        return [
            grid[2], grid[1], grid[0],
            grid[5], grid[4], grid[3],
            grid[8], grid[7], grid[6]
        ];
    }
    
    function createGridHTML(grid, color) {
        return grid.map(v => `<div style="background-color:${v ? color : 'transparent'}; border-radius:4px; ${v ? 'box-shadow:inset 0 -2px 0 rgba(0,0,0,0.15)' : ''}"></div>`).join('');
    }

    function gridToString(grid) {
        return grid.join('');
    }

    function nextTrial() {
        if (STATE.currentTrial >= STATE.trialsTotal) {
            endGame();
            return;
        }

        STATE.currentTrial++;
        const msg = document.getElementById('spc-message');
        const targetDiv = document.getElementById('spc-target');
        const choicesDiv = document.getElementById('spc-choices');

        if (!msg) return;

        msg.innerHTML = `第${STATE.currentTrial}もん：<br>まわすと、どの影になる？`;
        choicesDiv.style.pointerEvents = "auto";
        
        const baseGrid = getRandomGrid();
        targetDiv.style.transition = 'none';
        targetDiv.style.transform = 'rotate(0deg) scale(1)';
        targetDiv.innerHTML = createGridHTML(baseGrid, '#29b6f6'); // 水色
        
        const rotDegrees = [90, 180, 270];
        const rotDeg = rotDegrees[Math.floor(Math.random() * rotDegrees.length)];
        let correctGrid = baseGrid;
        if (rotDeg === 90) correctGrid = rotate90(baseGrid);
        if (rotDeg === 180) correctGrid = rotate180(baseGrid);
        if (rotDeg === 270) correctGrid = rotate270(baseGrid);

        // 正解になり得る「すべての回転パターン」を記録
        const validRotations = new Set([
            gridToString(baseGrid),
            gridToString(rotate90(baseGrid)),
            gridToString(rotate180(baseGrid)),
            gridToString(rotate270(baseGrid))
        ]);

        // クイズの選択肢の重複を防ぐための Set
        const correctStr = gridToString(correctGrid);
        const optionSet = new Set();
        optionSet.add(correctStr);
        const options = [{ grid: correctGrid, isCorrect: true }];

        function tryAddDummy(dummyGrid) {
            const str = gridToString(dummyGrid);
            // ダミーが「別の角度に回しただけの正解」になってしまうのを防ぐ！
            // （※プレイヤーから見て複数正解があるように見えるバグの修正）
            if (!validRotations.has(str) && !optionSet.has(str)) {
                optionSet.add(str);
                options.push({ grid: dummyGrid, isCorrect: false });
            }
        }

        // まずは鏡文字の回転をダミー候補に入れる
        tryAddDummy(rotate90(mirrorX(baseGrid)));
        tryAddDummy(rotate180(mirrorX(baseGrid)));
        tryAddDummy(rotate270(mirrorX(baseGrid)));
        tryAddDummy(mirrorX(baseGrid));
        
        // 十字のような対称的な形などによって、もし重複して選択肢が4つ作れなかった場合は、完全な別ブロックを生成して追加
        while(options.length < 4) {
            tryAddDummy(getRandomGrid());
        }

        options.sort(() => Math.random() - 0.5);

        choicesDiv.innerHTML = '';
        options.forEach(opt => {
            choicesDiv.innerHTML += `
                <div onclick="Labo2Game3.answer(this, ${opt.isCorrect}, ${rotDeg})" style="display:grid; grid-template-columns:repeat(3, 24px); grid-template-rows:repeat(3, 24px); gap:1px; background:#fff; padding:15px; border-radius:12px; border:3px solid #e0e0e0; justify-content:center; cursor:pointer; box-shadow:0 5px 0 #e0e0e0; transition: transform 0.1s;">
                    ${createGridHTML(opt.grid, '#424242')}
                </div>
            `;
        });
    }

    function answer(el, isCorrect, rotDeg) {
        if (!STATE.isPlaying) return;
        clearAllTimers();
        
        const choicesDiv = document.getElementById('spc-choices');
        choicesDiv.style.pointerEvents = "none";
        
        // 押したボタンをへこませる
        el.style.transform = "translateY(5px)";
        el.style.boxShadow = "none";
        
        if (isCorrect) {
            el.style.borderColor = "#66bb6a";
        } else {
            el.style.borderColor = "#ef5350";
        }

        const msg = document.getElementById('spc-message');
        msg.innerHTML = `くるっとまわすと...<br>せいかいはこれ！`;

        const targetDiv = document.getElementById('spc-target');
        
        // アニメーション付きで回転して黒色になる（答え合わせ）
        targetDiv.style.transition = `transform 0.8s ease-in-out`;
        targetDiv.style.transform = `rotate(${rotDeg}deg) scale(0.8)`;
        
        Array.from(targetDiv.children).forEach(child => {
            if (child.style.backgroundColor !== 'transparent') {
                child.style.backgroundColor = '#424242';
                child.style.boxShadow = 'none';
            }
        });

        // 回転を見せてからフィードバック
        addTimer(() => {
            if (isCorrect) {
                STATE.correctCount++;
                App.showFeedback('correct');
            } else {
                App.showFeedback('wrong');
            }
            
            addTimer(nextTrial, 1800);
        }, 900);
    }

    function endGame() {
        STATE.isPlaying = false;
        const correctRate = Math.round((STATE.correctCount / STATE.trialsTotal) * 100);
        App.saveResult('space', { correctRate, trials: STATE.trialsTotal, correct: STATE.correctCount });
    }

    return { start, answer };
})();
