(function () {
    "use strict";

    let stage = window.PapanCrosswordStages[0];
    const gameId = "word_crossword";
    const progressKey = "papan_crossword_progress_v2";
    const lastUserKey = "papan_crossword_last_user";
    const directionLabel = { across: "よこ", down: "たて" };
    const letterPool = [
        "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ",
        "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と",
        "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ",
        "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り",
        "る", "れ", "ろ", "わ", "ん", "が", "ぎ", "ぐ", "げ", "ご",
        "ざ", "じ", "ず", "ぜ", "ぞ", "だ", "で", "ど", "ば", "び",
        "ぶ", "べ", "ぼ", "ぱ", "ぴ", "ぷ", "ぺ", "ぽ"
    ];

    const gridEl = document.getElementById("crossword-grid");
    const acrossCluesEl = document.getElementById("across-clues");
    const downCluesEl = document.getElementById("down-clues");
    const activeLabelEl = document.getElementById("active-label");
    const activeClueEl = document.getElementById("active-clue");
    const answerSlotsEl = document.getElementById("answer-slots");
    const letterBankEl = document.getElementById("letter-bank");
    const feedbackEl = document.getElementById("feedback");
    const checkButton = document.getElementById("check-button");
    const eraseButton = document.getElementById("erase-button");
    const keywordSection = document.getElementById("keyword-section");
    const keywordSlotsEl = document.getElementById("keyword-slots");
    const keywordBankEl = document.getElementById("keyword-bank");
    const keywordHintEl = document.getElementById("keyword-hint");
    const keywordFeedbackEl = document.getElementById("keyword-feedback");
    const keywordCheckButton = document.getElementById("keyword-check");
    const keywordEraseButton = document.getElementById("keyword-erase");
    const clearModal = document.getElementById("clear-modal");
    const claimLaterButton = document.getElementById("claim-later-button");
    const startScreen = document.getElementById("start-screen");
    const gameScreen = document.getElementById("game-screen");
    const gameTopbar = document.getElementById("game-topbar");
    const userOptionsEl = document.getElementById("user-options");
    const userMessageEl = document.getElementById("user-message");
    const startButton = document.getElementById("start-button");
    const newUserInput = document.getElementById("new-user-name");

    let selectedUser = "";
    let selectedStageId = "stage_1";
    let activeEntryId = null;
    let solvedEntries = new Set();
    let gridValues = new Map();
    let activeDraft = [];
    let keywordDraft = [];
    let earnedPoints = 0;
    let stageCleared = false;
    let rewardClaimed = false;
    let rewardFlowActive = false;

    const cellKey = (row, col) => `${row},${col}`;

    function getEntryCells(entry) {
        return Array.from(entry.answer).map((letter, index) => ({
            row: entry.row + (entry.direction === "down" ? index : 0),
            col: entry.col + (entry.direction === "across" ? index : 0),
            letter
        }));
    }

    function buildCellMap() {
        const map = new Map();
        stage.entries.forEach(entry => {
            getEntryCells(entry).forEach(cell => {
                const key = cellKey(cell.row, cell.col);
                if (!map.has(key)) map.set(key, { answer: cell.letter, entries: [] });
                map.get(key).entries.push(entry.id);
            });
        });
        return map;
    }

    let cellMap = buildCellMap();

    function renderGrid() {
        gridEl.style.setProperty("--rows", stage.rows);
        gridEl.style.setProperty("--cols", stage.cols);
        gridEl.innerHTML = "";

        for (let row = 0; row < stage.rows; row += 1) {
            for (let col = 0; col < stage.cols; col += 1) {
                const key = cellKey(row, col);
                const data = cellMap.get(key);
                const cell = document.createElement("div");
                cell.setAttribute("role", "gridcell");

                if (!data) {
                    cell.className = "grid-cell block";
                    cell.setAttribute("aria-hidden", "true");
                } else {
                    cell.className = "grid-cell letter-cell";
                    cell.dataset.key = key;
                    cell.dataset.entries = data.entries.join(" ");
                    const startEntries = stage.entries.filter(entry => entry.row === row && entry.col === col);
                    if (startEntries.length) {
                        const number = document.createElement("span");
                        number.className = "cell-number";
                        number.textContent = startEntries[0].number;
                        cell.appendChild(number);
                    }
                    const keywordIndex = stage.keyword.cells.findIndex(item => item.row === row && item.col === col);
                    if (keywordIndex >= 0) {
                        cell.classList.add("keyword-cell");
                        const badge = document.createElement("span");
                        badge.className = "keyword-number";
                        badge.textContent = keywordIndex + 1;
                        cell.appendChild(badge);
                    }
                    const value = document.createElement("span");
                    value.className = "cell-value";
                    value.textContent = gridValues.get(key) || "";
                    cell.appendChild(value);
                    cell.addEventListener("click", () => selectEntryFromCell(data.entries));
                    cell.setAttribute("aria-label", `${row + 1}ぎょう ${col + 1}れつ`);
                }
                gridEl.appendChild(cell);
            }
        }
        updateGridState();
    }

    function renderClues() {
        acrossCluesEl.innerHTML = "";
        downCluesEl.innerHTML = "";
        stage.entries.forEach(entry => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "clue-button";
            button.dataset.entryId = entry.id;
            button.innerHTML = `<span class="clue-number">${entry.number}</span><span>${entry.clueHtml}</span><span class="clue-check" aria-hidden="true">✓</span>`;
            button.addEventListener("click", () => selectEntry(entry.id));
            (entry.direction === "across" ? acrossCluesEl : downCluesEl).appendChild(button);
        });
    }

    function selectEntryFromCell(entryIds) {
        const unsolved = entryIds.find(id => !solvedEntries.has(id));
        selectEntry(unsolved || entryIds[0]);
    }

    function selectEntry(entryId) {
        const entry = stage.entries.find(item => item.id === entryId);
        if (!entry) return;
        activeEntryId = entryId;
        feedbackEl.textContent = solvedEntries.has(entryId) ? "せいかいした ことばだよ！" : "";
        activeLabelEl.textContent = `${directionLabel[entry.direction]} ${entry.number} の こたえ`;
        activeClueEl.innerHTML = entry.clueHtml;
        activeDraft = getEntryCells(entry).map(cell => gridValues.get(cellKey(cell.row, cell.col)) || "");
        renderAnswerSlots(entry);
        renderLetterBank(letterBankEl, entry.letters, addActiveLetter, solvedEntries.has(entryId));
        updateControls();
        updateGridState();
        document.querySelectorAll(".clue-button").forEach(button => {
            button.classList.toggle("active", button.dataset.entryId === entryId);
        });
    }

    function renderAnswerSlots(entry) {
        answerSlotsEl.innerHTML = "";
        Array.from(entry.answer).forEach((_, index) => {
            const slot = document.createElement("span");
            slot.className = "answer-slot";
            slot.textContent = activeDraft[index] || "";
            answerSlotsEl.appendChild(slot);
        });
    }

    function renderLetterBank(container, letters, handler, disabled) {
        container.innerHTML = "";
        const choices = Array.from(new Set(letters));
        const extras = shuffle(letterPool.filter(letter => !choices.includes(letter)));
        while (choices.length < 14 && extras.length) choices.push(extras.pop());
        shuffle(choices).forEach(letter => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "letter-button";
            button.textContent = letter;
            button.disabled = disabled;
            button.addEventListener("click", () => handler(letter));
            container.appendChild(button);
        });
    }

    function shuffle(items) {
        const shuffled = items.slice();
        for (let index = shuffled.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        }
        return shuffled;
    }

    function addActiveLetter(letter) {
        const entry = stage.entries.find(item => item.id === activeEntryId);
        if (!entry || solvedEntries.has(entry.id)) return;
        const cells = getEntryCells(entry);
        const index = activeDraft.findIndex((value, position) => {
            if (value) return false;
            const memberships = cellMap.get(cellKey(cells[position].row, cells[position].col)).entries;
            return !memberships.some(id => solvedEntries.has(id));
        });
        if (index < 0) return;
        activeDraft[index] = letter;
        syncDraftToGrid(entry);
    }

    function eraseActiveLetter() {
        const entry = stage.entries.find(item => item.id === activeEntryId);
        if (!entry || solvedEntries.has(entry.id)) return;
        const cells = getEntryCells(entry);
        for (let index = activeDraft.length - 1; index >= 0; index -= 1) {
            const memberships = cellMap.get(cellKey(cells[index].row, cells[index].col)).entries;
            const locked = memberships.some(id => solvedEntries.has(id));
            if (activeDraft[index] && !locked) {
                activeDraft[index] = "";
                break;
            }
        }
        syncDraftToGrid(entry);
    }

    function syncDraftToGrid(entry) {
        getEntryCells(entry).forEach((cell, index) => {
            const key = cellKey(cell.row, cell.col);
            const memberships = cellMap.get(key).entries;
            const locked = memberships.some(id => solvedEntries.has(id));
            if (!locked) {
                if (activeDraft[index]) gridValues.set(key, activeDraft[index]);
                else gridValues.delete(key);
            }
        });
        renderGrid();
        renderAnswerSlots(entry);
        updateControls();
    }

    function checkActiveAnswer() {
        const entry = stage.entries.find(item => item.id === activeEntryId);
        if (!entry || solvedEntries.has(entry.id)) return;
        const answer = activeDraft.join("");
        if (answer === entry.answer) {
            solvedEntries.add(entry.id);
            getEntryCells(entry).forEach(cell => gridValues.set(cellKey(cell.row, cell.col), cell.letter));
            earnedPoints += stage.clueReward;
            feedbackEl.textContent = `せいかい！ ＋${stage.clueReward}ポイント`;
            feedbackEl.className = "feedback correct";
            updateSummary();
            renderGrid();
            renderClueStates();
            renderLetterBank(letterBankEl, entry.letters, addActiveLetter, true);
            updateControls();
            if (solvedEntries.size === stage.entries.length) unlockKeyword();
            else window.setTimeout(selectNextUnsolved, 650);
        } else {
            feedbackEl.textContent = "おしい！ マスの もじも てがかりにしてね。";
            feedbackEl.className = "feedback wrong";
            document.getElementById("answer-panel").classList.remove("shake");
            void document.getElementById("answer-panel").offsetWidth;
            document.getElementById("answer-panel").classList.add("shake");
        }
    }

    function selectNextUnsolved() {
        const next = stage.entries.find(entry => !solvedEntries.has(entry.id));
        if (next) selectEntry(next.id);
    }

    function renderClueStates() {
        document.querySelectorAll(".clue-button").forEach(button => {
            const solved = solvedEntries.has(button.dataset.entryId);
            button.classList.toggle("solved", solved);
            button.classList.toggle("active", button.dataset.entryId === activeEntryId);
            button.setAttribute("aria-label", solved ? "せいかいずみ" : "");
        });
    }

    function updateGridState() {
        document.querySelectorAll(".letter-cell").forEach(cell => {
            const entries = cell.dataset.entries.split(" ");
            cell.classList.toggle("active", Boolean(activeEntryId && entries.includes(activeEntryId)));
            cell.classList.toggle("solved", entries.some(id => solvedEntries.has(id)));
            const value = cell.querySelector(".cell-value");
            if (value) value.textContent = gridValues.get(cell.dataset.key) || "";
        });
    }

    function updateControls() {
        const entry = stage.entries.find(item => item.id === activeEntryId);
        const disabled = !entry || solvedEntries.has(entry.id);
        eraseButton.disabled = disabled || !activeDraft.some(Boolean);
        checkButton.disabled = disabled || activeDraft.some(value => !value);
    }

    function updateSummary() {
        document.getElementById("score").textContent = earnedPoints;
        document.getElementById("solved-count").textContent = solvedEntries.size;
    }

    function renderKeywordSlots() {
        keywordSlotsEl.innerHTML = "";
        Array.from(stage.keyword.answer).forEach((_, index) => {
            const wrap = document.createElement("span");
            wrap.className = "keyword-slot";
            wrap.innerHTML = `<small>${index + 1}</small><b>${keywordDraft[index] || ""}</b>`;
            keywordSlotsEl.appendChild(wrap);
        });
    }

    function unlockKeyword() {
        keywordSection.classList.remove("locked");
        keywordSection.classList.add("unlocked");
        keywordHintEl.textContent = "ばんごうの もじを、じゅんに いれてね。";
        keywordDraft = [];
        renderKeywordSlots();
        renderLetterBank(keywordBankEl, stage.keyword.letters, addKeywordLetter, false);
        updateKeywordControls();
        keywordSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function addKeywordLetter(letter) {
        if (stageCleared || keywordDraft.length >= stage.keyword.answer.length) return;
        keywordDraft.push(letter);
        keywordFeedbackEl.textContent = "";
        renderKeywordSlots();
        updateKeywordControls();
    }

    function eraseKeywordLetter() {
        if (stageCleared) return;
        keywordDraft.pop();
        renderKeywordSlots();
        updateKeywordControls();
    }

    function updateKeywordControls() {
        const unlocked = solvedEntries.size === stage.entries.length && !stageCleared;
        keywordEraseButton.disabled = !unlocked || keywordDraft.length === 0;
        keywordCheckButton.disabled = !unlocked || keywordDraft.length !== stage.keyword.answer.length;
    }

    function checkKeyword() {
        if (keywordDraft.join("") === stage.keyword.answer) {
            stageCleared = true;
            earnedPoints += stage.keywordReward;
            updateSummary();
            keywordFeedbackEl.textContent = `だいせいかい！ ＋${stage.keywordReward}ポイント`;
            keywordFeedbackEl.className = "feedback correct";
            saveProgress();
            updateKeywordControls();
            document.getElementById("clear-title").textContent = `ステージ ${stage.number} クリア！`;
            document.getElementById("clear-keyword").textContent = `「${stage.keyword.answer}」`;
            window.setTimeout(() => { clearModal.hidden = false; }, 450);
        } else {
            keywordFeedbackEl.textContent = "じゅんばんを もういちど たしかめよう。";
            keywordFeedbackEl.className = "feedback wrong";
        }
    }

    function saveProgress() {
        let records = {};
        try { records = JSON.parse(localStorage.getItem(progressKey) || "{}"); } catch (_) { records = {}; }
        records[selectedUser] = records[selectedUser] || {};
        records[selectedUser][stage.id] = { cleared: true, clearedAt: new Date().toISOString() };
        localStorage.setItem(progressKey, JSON.stringify(records));
    }

    function getUserNamesForMenu() {
        if (typeof getUserNames === "function") return getUserNames();
        try { return Object.keys(JSON.parse(localStorage.getItem("papan_points_v1") || "{}")); }
        catch (_) { return []; }
    }

    function renderUserOptions() {
        const users = getUserNamesForMenu();
        userOptionsEl.innerHTML = "";
        if (!users.length) {
            const empty = document.createElement("p");
            empty.className = "empty-users";
            empty.textContent = "まだ ユーザーが いないよ。なまえを ついかしてね。";
            userOptionsEl.appendChild(empty);
        } else {
            users.forEach(name => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "user-button";
                button.textContent = name;
                button.classList.toggle("selected", name === selectedUser);
                button.setAttribute("aria-pressed", String(name === selectedUser));
                button.addEventListener("click", () => selectUser(name));
                userOptionsEl.appendChild(button);
            });
        }
        updateMenuState();
    }

    function selectUser(name) {
        selectedUser = name;
        localStorage.setItem(lastUserKey, name);
        userMessageEl.textContent = "";
        renderUserOptions();
    }

    function registerUser(event) {
        event.preventDefault();
        const name = newUserInput.value.trim();
        if (!name) {
            userMessageEl.textContent = "なまえを いれてね。";
            newUserInput.focus();
            return;
        }
        if (typeof addPoints === "function") {
            addPoints(name, 0);
        } else {
            let points = {};
            try { points = JSON.parse(localStorage.getItem("papan_points_v1") || "{}"); } catch (_) { points = {}; }
            if (!(name in points)) points[name] = 0;
            localStorage.setItem("papan_points_v1", JSON.stringify(points));
        }
        newUserInput.value = "";
        selectUser(name);
    }

    function hasClearedStage(userName, stageId) {
        if (!userName) return false;
        try {
            const records = JSON.parse(localStorage.getItem(progressKey) || "{}");
            return Boolean(records[userName] && records[userName][stageId] && records[userName][stageId].cleared);
        } catch (_) {
            return false;
        }
    }

    function updateMenuState() {
        startButton.disabled = !selectedUser;
        const selectedStage = window.PapanCrosswordStages.find(item => item.id === selectedStageId);
        startButton.textContent = selectedUser
            ? `${selectedUser}さん・ステージ ${selectedStage.number}で はじめる！`
            : "ユーザーを えらんでね";
        document.querySelectorAll(".stage-button[data-stage]").forEach(button => {
            const stageId = button.dataset.stage;
            const cleared = hasClearedStage(selectedUser, stageId);
            button.querySelector("small").textContent = cleared
                ? "クリアずみ！ もういちど あそべるよ"
                : "ちょうせんできるよ";
            button.classList.toggle("cleared", cleared);
            button.classList.toggle("selected", stageId === selectedStageId);
            button.setAttribute("aria-pressed", String(stageId === selectedStageId));
        });
    }

    function selectStage(stageId) {
        if (!window.PapanCrosswordStages.some(item => item.id === stageId)) return;
        selectedStageId = stageId;
        updateMenuState();
    }

    function startGame() {
        if (!selectedUser) return;
        const selectedStage = window.PapanCrosswordStages.find(item => item.id === selectedStageId);
        if (!selectedStage) return;
        stage = selectedStage;
        cellMap = buildCellMap();
        localStorage.setItem(lastUserKey, selectedUser);
        document.getElementById("current-user").textContent = `${selectedUser}さん`;
        document.getElementById("current-stage-icon").textContent = stage.icon;
        document.getElementById("current-stage-label").textContent = `ステージ ${stage.number}`;
        document.getElementById("play-stage-label").textContent = `しょうがく 1・2ねんせい・ステージ ${stage.number}`;
        startScreen.hidden = true;
        gameTopbar.hidden = false;
        gameScreen.hidden = false;
        resetGame(false);
        window.scrollTo({ top: 0, behavior: "auto" });
    }

    function showMenu() {
        clearModal.hidden = true;
        gameTopbar.hidden = true;
        gameScreen.hidden = true;
        startScreen.hidden = false;
        renderUserOptions();
        window.scrollTo({ top: 0, behavior: "auto" });
    }

    function awardPointsToSelectedUser() {
        if (rewardClaimed || !selectedUser || earnedPoints <= 0) return 0;
        if (typeof addPoints === "function") addPoints(selectedUser, earnedPoints);
        if (typeof toggleStamp === "function" && typeof getTodayString === "function") {
            toggleStamp(selectedUser, getTodayString(), true);
        }
        if (typeof savePlayLog === "function") savePlayLog(selectedUser, gameId);
        const parentBonus = typeof checkAndAwardParentBonus === "function"
            ? checkAndAwardParentBonus(selectedUser, gameId)
            : 0;
        rewardClaimed = true;
        return parentBonus;
    }

    function showAwardMessage(parentBonus) {
        let message = `${selectedUser}さんに ${earnedPoints}ポイント！`;
        if (parentBonus > 0) message += `\n\nおうちのかたの おすすめボーナス ＋${parentBonus}ポイント！`;
        window.alert(message);
    }

    function getMaximumPoints() {
        return stage.entries.length * stage.clueReward + stage.keywordReward;
    }

    function claimReward() {
        if (rewardClaimed || rewardFlowActive) return;
        rewardFlowActive = true;
        const button = document.getElementById("reward-button");
        button.disabled = true;
        button.textContent = "うけとり がめんを ひらいています";
        claimLaterButton.hidden = true;
        clearModal.hidden = true;
        const parentBonus = awardPointsToSelectedUser();
        rewardFlowActive = false;
        keywordHintEl.textContent = `${selectedUser}さんが ポイントを うけとったよ！`;
        button.textContent = "うけとりずみ";
        showAwardMessage(parentBonus);
    }

    function quitGame(event) {
        event.preventDefault();
        if (rewardFlowActive) return;

        if (rewardClaimed || earnedPoints === 0) {
            if (window.confirm("クロスワードを おわって、ステージえらびに もどる？")) {
                showMenu();
            }
            return;
        }

        const shouldQuit = window.confirm(`いまの ${earnedPoints}ポイントを もらって、おわる？`);
        if (!shouldQuit) return;

        rewardFlowActive = true;
        const parentBonus = awardPointsToSelectedUser();
        rewardFlowActive = false;
        showAwardMessage(parentBonus);
        showMenu();
    }

    function resetGame(askBeforeReset = true) {
        if (askBeforeReset && !window.confirm("いまの こたえを けして、はじめから やりなおす？")) return;
        activeEntryId = null;
        solvedEntries = new Set();
        gridValues = new Map();
        activeDraft = [];
        keywordDraft = [];
        earnedPoints = 0;
        stageCleared = false;
        rewardClaimed = false;
        rewardFlowActive = false;
        clearModal.hidden = true;
        const rewardButton = document.getElementById("reward-button");
        rewardButton.disabled = false;
        rewardButton.textContent = `${getMaximumPoints()}ポイントを もらう`;
        keywordSection.className = "keyword-card locked";
        keywordHintEl.textContent = "6もん せいかいすると、ここが ひらくよ。";
        keywordFeedbackEl.textContent = "";
        activeLabelEl.textContent = "もんだいを えらんでね";
        activeClueEl.textContent = "たてか よこの もんだいを おしてね。";
        answerSlotsEl.innerHTML = "";
        letterBankEl.innerHTML = "";
        keywordBankEl.innerHTML = "";
        claimLaterButton.hidden = true;
        feedbackEl.textContent = "";
        renderKeywordSlots();
        renderGrid();
        renderClues();
        updateSummary();
        updateControls();
        updateKeywordControls();
    }

    checkButton.addEventListener("click", checkActiveAnswer);
    eraseButton.addEventListener("click", eraseActiveLetter);
    keywordCheckButton.addEventListener("click", checkKeyword);
    keywordEraseButton.addEventListener("click", eraseKeywordLetter);
    document.getElementById("reset-button").addEventListener("click", resetGame);
    document.getElementById("reward-button").addEventListener("click", claimReward);
    document.getElementById("quit-link").addEventListener("click", quitGame);
    claimLaterButton.addEventListener("click", claimReward);
    document.getElementById("close-modal").addEventListener("click", () => {
        clearModal.hidden = true;
        claimLaterButton.hidden = false;
        keywordHintEl.textContent = "ポイントは、したの ボタンから もらえるよ。";
    });

    document.getElementById("new-user-form").addEventListener("submit", registerUser);
    startButton.addEventListener("click", startGame);
    document.querySelectorAll(".stage-button[data-stage]").forEach(button => {
        button.addEventListener("click", () => selectStage(button.dataset.stage));
    });

    renderGrid();
    renderClues();
    renderKeywordSlots();
    updateSummary();
    const lastUser = localStorage.getItem(lastUserKey);
    if (lastUser && getUserNamesForMenu().includes(lastUser)) selectedUser = lastUser;
    renderUserOptions();
})();
