(function () {
    const { state } = window.ProgramLaboState;
    let currentQuiz = null;
    let currentQuizIndex = 0;
    let quizStartedAt = 0;
    let cleared = false;
    let clearRewardTimer = null;
    let clearCelebrationTimer = null;
    const CLEAR_CELEBRATION_DELAY_MS = 1000;
    const CLEAR_REWARD_DELAY_MS = 1000;
    const CLEAR_RECORD_KEY = "programming_labo_quiz_clears_v1";
    const els = {};

    function init() {
        els.quizStartBtn = document.getElementById("quiz-start-btn");
        els.quizPanel = document.getElementById("quiz-panel");
        els.quizTitle = document.getElementById("quiz-title");
        els.quizCount = document.getElementById("quiz-count");
        els.quizDescription = document.getElementById("quiz-description");
        els.quizResult = document.getElementById("quiz-result");
        els.quizMenuBtn = document.getElementById("quiz-menu-btn");
        els.quizNav = document.getElementById("quiz-nav");
        els.quizNextBtn = document.getElementById("quiz-next-btn");
        els.quizResetBtn = document.getElementById("quiz-reset-btn");
        els.freeModeBtn = document.getElementById("free-mode-btn");
        els.clearCelebration = document.getElementById("clear-celebration");
        els.rewardToast = document.getElementById("reward-toast");

        renderQuizNav();
        els.quizStartBtn.addEventListener("click", () => startQuizByIndex(0));
        els.quizMenuBtn.addEventListener("click", toggleQuizNav);
        els.quizNextBtn.addEventListener("click", () => startQuizByIndex(currentQuizIndex + 1));
        els.quizResetBtn.addEventListener("click", () => {
            if (currentQuiz) startQuizByIndex(currentQuizIndex);
        });
        els.freeModeBtn.addEventListener("click", exitQuizMode);
        document.addEventListener("programlabo:event", checkQuizProgress);
        document.addEventListener("programlabo:userchange", () => {
            renderQuizNav();
            updateQuizNavActive();
        });
    }

    function startQuizByIndex(index) {
        if (!window.ProgramLaboMain.requireCurrentUser()) return;
        const quizzes = window.PROGRAMMING_LABO_QUIZZES;
        currentQuizIndex = ((index % quizzes.length) + quizzes.length) % quizzes.length;
        startQuiz(quizzes[currentQuizIndex]);
    }

    function startQuiz(quiz) {
        currentQuiz = quiz;
        cleared = false;
        cancelClearRewardTimer();
        cancelClearCelebrationTimer();
        quizStartedAt = performance.now();
        if (!window.ProgramLaboMain.openLab()) return;
        window.ProgramLaboMain.setModeLabel("クイズ");
        window.ProgramLaboMain.setObjectsFromData(quiz.initialObjects);
        els.quizPanel.classList.remove("hidden");
        els.quizTitle.textContent = quiz.title;
        els.quizCount.textContent = `お題 ${currentQuizIndex + 1} / ${window.PROGRAMMING_LABO_QUIZZES.length}`;
        els.quizDescription.textContent = quiz.description;
        els.quizResult.textContent = quiz.hint;
        els.quizResult.classList.remove("clear");
        els.quizNextBtn.classList.remove("quiz-next-ready");
        els.quizNextBtn.disabled = true;
        hideRewardToast();
        closeQuizNav();
        updateQuizNavActive();
        window.ProgramLaboMain.setStatus("クイズのお題をセットしたよ");
    }

    function renderQuizNav() {
        els.quizNav.innerHTML = "";
        window.PROGRAMMING_LABO_QUIZZES.forEach((quiz, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = String(index + 1);
            button.title = quiz.title;
            if (isQuizAlreadyCleared(quiz)) {
                button.classList.add("cleared");
                button.setAttribute("aria-label", `お題${index + 1}: ${quiz.title} クリア済み`);
            } else {
                button.setAttribute("aria-label", `お題${index + 1}: ${quiz.title}`);
            }
            button.addEventListener("click", () => {
                startQuizByIndex(index);
                closeQuizNav();
            });
            els.quizNav.appendChild(button);
        });
    }

    function updateQuizNavActive() {
        [...els.quizNav.children].forEach((button, index) => {
            button.classList.toggle("active", index === currentQuizIndex);
        });
    }

    function toggleQuizNav() {
        const willOpen = els.quizNav.classList.contains("hidden");
        els.quizNav.classList.toggle("hidden", !willOpen);
        els.quizMenuBtn.setAttribute("aria-expanded", String(willOpen));
        els.quizMenuBtn.textContent = willOpen ? "お題を閉じる" : "お題を選ぶ";
    }

    function closeQuizNav() {
        els.quizNav.classList.add("hidden");
        els.quizMenuBtn.setAttribute("aria-expanded", "false");
        els.quizMenuBtn.textContent = "お題を選ぶ";
    }

    function exitQuizMode() {
        currentQuiz = null;
        cleared = false;
        cancelClearRewardTimer();
        cancelClearCelebrationTimer();
        els.quizPanel.classList.add("hidden");
        window.ProgramLaboMain.setModeLabel("自由制作");
        window.ProgramLaboMain.clearAll();
        window.ProgramLaboMain.setStatus("自由制作にしたよ");
    }

    function checkQuizProgress() {
        if (!currentQuiz || cleared) return;
        if (isQuizCleared(currentQuiz)) {
            cleared = true;
            els.quizResult.textContent = "クリア！花丸が出たよ。";
            if (currentQuiz.clearMessage) {
                els.quizResult.textContent = currentQuiz.clearMessage;
            } else {
                els.quizResult.textContent = "クリア！お題どおりに動いたよ。";
            }
            els.quizResult.classList.add("clear");
            els.quizNextBtn.disabled = false;
            markQuizCleared(currentQuiz);
            window.ProgramLaboMain.setStatus("クイズクリア！");
            scheduleClearCelebration(currentQuiz, currentQuizIndex);
        }
    }

    function scheduleClearCelebration(quiz, quizIndex) {
        cancelClearCelebrationTimer();
        clearCelebrationTimer = setTimeout(() => {
            clearCelebrationTimer = null;
            if (currentQuiz !== quiz || !cleared) return;
            showClearCelebration();
            updateQuizNavClearStates(quizIndex);
            highlightNextButton();
            scheduleQuizPointAward(quiz);
        }, CLEAR_CELEBRATION_DELAY_MS);
    }

    function cancelClearCelebrationTimer() {
        if (!clearCelebrationTimer) return;
        clearTimeout(clearCelebrationTimer);
        clearCelebrationTimer = null;
    }

    function scheduleQuizPointAward(quiz) {
        cancelClearRewardTimer();
        clearRewardTimer = setTimeout(() => {
            clearRewardTimer = null;
            if (currentQuiz !== quiz || !cleared) return;
            awardQuizPoint(quiz);
        }, CLEAR_REWARD_DELAY_MS);
    }

    function cancelClearRewardTimer() {
        if (!clearRewardTimer) return;
        clearTimeout(clearRewardTimer);
        clearRewardTimer = null;
    }

    function awardQuizPoint(quiz) {
        const userName = window.ProgramLaboMain.awardPointsToCurrentUser(20);
        if (!userName) {
            return;
        }
        const awardInfo = window.ProgramLaboMain.getLastPointAward
            ? window.ProgramLaboMain.getLastPointAward()
            : null;
        let status = `${userName}さんに20ポイント`;
        if (awardInfo && awardInfo.parentBonus > 0) {
            status += `、おすすめ+${awardInfo.parentBonus}ポイント`;
        }
        if (typeof addMissionStock === "function" && addMissionStock(userName, "programming_labo")) {
            status += "、すごろくミッションもクリア";
        }
        window.ProgramLaboMain.setStatus(status);
        showRewardToast(userName, awardInfo);
    }

    function showClearCelebration() {
        if (!els.clearCelebration) return;
        els.clearCelebration.classList.remove("active");
        els.clearCelebration.querySelectorAll(".confetti-piece").forEach((piece) => piece.remove());
        const colors = ["#ffd166", "#3f9fcb", "#64b96a", "#e85d75", "#ff9f1c"];
        for (let i = 0; i < 28; i += 1) {
            const piece = document.createElement("span");
            piece.className = "confetti-piece";
            piece.style.setProperty("--x", `${8 + Math.random() * 84}%`);
            piece.style.setProperty("--size", `${7 + Math.random() * 9}px`);
            piece.style.setProperty("--color", colors[i % colors.length]);
            piece.style.setProperty("--delay", `${Math.random() * 0.22}s`);
            piece.style.setProperty("--duration", `${1.35 + Math.random() * 0.7}s`);
            piece.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
            piece.style.setProperty("--rotate", `${160 + Math.random() * 420}deg`);
            els.clearCelebration.appendChild(piece);
        }
        void els.clearCelebration.offsetWidth;
        els.clearCelebration.classList.add("active");
        setTimeout(() => {
            els.clearCelebration.classList.remove("active");
            els.clearCelebration.querySelectorAll(".confetti-piece").forEach((piece) => piece.remove());
        }, 2300);
    }

    function showRewardToast(userName, awardInfo) {
        if (!els.rewardToast) return;
        const parentBonus = awardInfo && awardInfo.parentBonus > 0 ? awardInfo.parentBonus : 0;
        els.rewardToast.textContent = parentBonus > 0
            ? `${userName}さん +20pt / おすすめ +${parentBonus}pt`
            : `${userName}さん +20pt`;
        els.rewardToast.classList.remove("active");
        void els.rewardToast.offsetWidth;
        els.rewardToast.classList.add("active");
        setTimeout(hideRewardToast, 2600);
    }

    function hideRewardToast() {
        if (!els.rewardToast) return;
        els.rewardToast.classList.remove("active");
    }

    function highlightNextButton() {
        els.quizNextBtn.classList.remove("quiz-next-ready");
        void els.quizNextBtn.offsetWidth;
        els.quizNextBtn.classList.add("quiz-next-ready");
    }

    function readClearRecords() {
        try {
            const parsed = JSON.parse(localStorage.getItem(CLEAR_RECORD_KEY) || "{}");
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch (error) {
            return {};
        }
    }

    function writeClearRecords(records) {
        localStorage.setItem(CLEAR_RECORD_KEY, JSON.stringify(records));
    }

    function getCurrentUserName() {
        return window.ProgramLaboMain.getCurrentUser();
    }

    function getQuizRecordId(quiz) {
        return quiz.id || quiz.title;
    }

    function markQuizCleared(quiz) {
        const userName = getCurrentUserName();
        if (!userName || !quiz) return;
        const records = readClearRecords();
        if (!records[userName]) records[userName] = {};
        records[userName][getQuizRecordId(quiz)] = true;
        writeClearRecords(records);
    }

    function isQuizAlreadyCleared(quiz) {
        const userName = getCurrentUserName();
        if (!userName || !quiz) return false;
        const records = readClearRecords();
        return Boolean(records[userName] && records[userName][getQuizRecordId(quiz)]);
    }

    function updateQuizNavClearStates(justClearedIndex = null) {
        [...els.quizNav.children].forEach((button, index) => {
            const quiz = window.PROGRAMMING_LABO_QUIZZES[index];
            const isCleared = isQuizAlreadyCleared(quiz);
            button.classList.toggle("cleared", isCleared);
            button.classList.toggle("just-cleared", index === justClearedIndex);
            button.setAttribute(
                "aria-label",
                `お題${index + 1}: ${quiz.title}${isCleared ? " クリア済み" : ""}`
            );
            if (index === justClearedIndex) {
                setTimeout(() => button.classList.remove("just-cleared"), 850);
            }
        });
    }

    function isQuizCleared(quiz) {
        return quiz.clearConditions.every((condition) => hasEvent(condition));
    }

    function hasEvent(condition) {
        return state.events.some((event) => {
            if (event.time < quizStartedAt) return false;
            if (condition.type === "hit") {
                if (event.type !== "hit") return false;
                const assetsMatch = !condition.assets || condition.assets.every((assetId) => event.assetIds.includes(assetId));
                const keysMatch = !condition.keys || condition.keys.every((key) => event.keys && event.keys.includes(key));
                return assetsMatch && keysMatch;
            }
            if (condition.type === "effectShown") {
                return event.type === "effectShown" && event.effect === condition.effect;
            }
            if (condition.type === "hidden") {
                return event.type === "hidden" && matchesEventTarget(event, condition);
            }
            if (condition.type === "resetPosition") {
                return event.type === "resetPosition" && matchesEventTarget(event, condition);
            }
            if (condition.type === "edgeAction") {
                return event.type === "edgeAction" && matchesEventTarget(event, condition) && event.action === condition.action;
            }
            if (condition.type === "tapAction") {
                const actionMatches = !condition.action || event.action === condition.action;
                return event.type === "tapAction" && matchesEventTarget(event, condition) && actionMatches;
            }
            if (condition.type === "bounce") {
                return event.type === "bounce" && matchesEventTarget(event, condition);
            }
            if (condition.type === "moveStarted") {
                return event.type === "moveStarted" && matchesEventTarget(event, condition) && event.direction === condition.direction;
            }
            return false;
        });
    }

    function matchesEventTarget(event, condition) {
        const assetMatches = !condition.asset || event.assetId === condition.asset;
        const keyMatches = !condition.key || event.key === condition.key;
        return assetMatches && keyMatches;
    }

    document.addEventListener("DOMContentLoaded", init);
})();
