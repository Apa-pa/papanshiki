(function () {
    const { state } = window.ProgramLaboState;
    let currentQuiz = null;
    let currentQuizIndex = 0;
    let quizStartedAt = 0;
    let cleared = false;
    const awardedQuizIds = new Set();
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

        renderQuizNav();
        els.quizStartBtn.addEventListener("click", () => startQuizByIndex(0));
        els.quizMenuBtn.addEventListener("click", toggleQuizNav);
        els.quizNextBtn.addEventListener("click", () => startQuizByIndex(currentQuizIndex + 1));
        els.quizResetBtn.addEventListener("click", () => {
            if (currentQuiz) startQuizByIndex(currentQuizIndex);
        });
        els.freeModeBtn.addEventListener("click", exitQuizMode);
        document.addEventListener("programlabo:event", checkQuizProgress);
    }

    function startQuizByIndex(index) {
        const quizzes = window.PROGRAMMING_LABO_QUIZZES;
        currentQuizIndex = ((index % quizzes.length) + quizzes.length) % quizzes.length;
        startQuiz(quizzes[currentQuizIndex]);
    }

    function startQuiz(quiz) {
        currentQuiz = quiz;
        cleared = false;
        quizStartedAt = performance.now();
        window.ProgramLaboMain.openLab();
        window.ProgramLaboMain.setModeLabel("クイズ");
        window.ProgramLaboMain.setObjectsFromData(quiz.initialObjects);
        els.quizPanel.classList.remove("hidden");
        els.quizTitle.textContent = quiz.title;
        els.quizCount.textContent = `お題 ${currentQuizIndex + 1} / ${window.PROGRAMMING_LABO_QUIZZES.length}`;
        els.quizDescription.textContent = quiz.description;
        els.quizResult.textContent = quiz.hint;
        els.quizResult.classList.remove("clear");
        els.quizNextBtn.disabled = true;
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
            button.setAttribute("aria-label", `お題${index + 1}: ${quiz.title}`);
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
            window.ProgramLaboMain.setStatus("クイズクリア！");
            awardQuizPoint(currentQuiz);
        }
    }

    function awardQuizPoint(quiz) {
        if (awardedQuizIds.has(quiz.id)) {
            window.ProgramLaboMain.setStatus("このお題のポイントは受け取り済みだよ");
            return;
        }
        if (typeof showPointGetDialog !== "function") {
            window.ProgramLaboMain.setStatus("20ポイントゲット");
            awardedQuizIds.add(quiz.id);
            return;
        }
        window.ProgramLaboMain.setStatus("20ポイントを受け取る人をえらんでね");
        showPointGetDialog(20, (userName) => {
            if (!userName) {
                window.ProgramLaboMain.setStatus("ポイントはまだ受け取っていないよ");
                return;
            }
            awardedQuizIds.add(quiz.id);
            window.ProgramLaboMain.setStatus(`${userName}さんに20ポイント`);
            if (typeof addMissionStock === "function" && addMissionStock(userName, "programming_labo")) {
                window.ProgramLaboMain.setStatus(`${userName}さん、すごろくミッションもクリア`);
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
                return event.type === "hit" && condition.assets.every((assetId) => event.assetIds.includes(assetId));
            }
            if (condition.type === "effectShown") {
                return event.type === "effectShown" && event.effect === condition.effect;
            }
            if (condition.type === "hidden") {
                return event.type === "hidden" && event.assetId === condition.asset;
            }
            if (condition.type === "resetPosition") {
                return event.type === "resetPosition" && event.assetId === condition.asset;
            }
            if (condition.type === "edgeAction") {
                return event.type === "edgeAction" && event.assetId === condition.asset && event.action === condition.action;
            }
            if (condition.type === "moveStarted") {
                return event.type === "moveStarted" && event.assetId === condition.asset && event.direction === condition.direction;
            }
            return false;
        });
    }

    document.addEventListener("DOMContentLoaded", init);
})();
