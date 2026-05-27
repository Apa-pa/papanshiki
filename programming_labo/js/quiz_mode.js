(function () {
    const { state } = window.ProgramLaboState;
    let currentQuiz = null;
    let quizStartedAt = 0;
    let cleared = false;
    const els = {};

    function init() {
        els.quizStartBtn = document.getElementById("quiz-start-btn");
        els.quizPanel = document.getElementById("quiz-panel");
        els.quizTitle = document.getElementById("quiz-title");
        els.quizDescription = document.getElementById("quiz-description");
        els.quizResult = document.getElementById("quiz-result");
        els.quizResetBtn = document.getElementById("quiz-reset-btn");
        els.freeModeBtn = document.getElementById("free-mode-btn");

        els.quizStartBtn.addEventListener("click", () => startQuiz(window.PROGRAMMING_LABO_QUIZZES[0]));
        els.quizResetBtn.addEventListener("click", () => {
            if (currentQuiz) startQuiz(currentQuiz);
        });
        els.freeModeBtn.addEventListener("click", exitQuizMode);
        document.addEventListener("programlabo:event", checkQuizProgress);
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
        els.quizDescription.textContent = quiz.description;
        els.quizResult.textContent = quiz.hint;
        els.quizResult.classList.remove("clear");
        window.ProgramLaboMain.setStatus("クイズのお題をセットしたよ");
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
            els.quizResult.classList.add("clear");
            window.ProgramLaboMain.setStatus("クイズクリア！");
        }
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
            return false;
        });
    }

    document.addEventListener("DOMContentLoaded", init);
})();
