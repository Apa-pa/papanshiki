(function () {
    const RECORD_KEY = "papan_learning_labo_records_v1";
    const LAST_USER_KEY = "papan_learning_labo_last_user";

    const state = {
        userName: "",
        subject: null,
        category: null,
        questions: [],
        currentIndex: 0,
        correctCount: 0,
        startedAt: 0,
        questionStartedAt: 0,
        answerTimes: [],
        result: null,
        saved: false,
        numericInput: "",
        matchSelection: [],
        matchMistakes: 0,
        answerLocked: false
    };

    const $ = (id) => document.getElementById(id);

    const panels = {
        user: $("user-panel"),
        subject: $("subject-panel"),
        category: $("category-panel"),
        test: $("test-panel"),
        result: $("result-panel")
    };

    function showPanel(name) {
        Object.keys(panels).forEach((key) => {
            panels[key].classList.toggle("hidden", key !== name);
        });
    }

    function getRecords() {
        return JSON.parse(localStorage.getItem(RECORD_KEY) || "{}");
    }

    function saveRecords(records) {
        localStorage.setItem(RECORD_KEY, JSON.stringify(records));
    }

    function getRecord(userName, categoryId) {
        const records = getRecords();
        return records[userName] && records[userName][categoryId] ? records[userName][categoryId] : null;
    }

    function formatDate(dateText) {
        if (!dateText) return "まだ";
        const d = new Date(dateText);
        if (Number.isNaN(d.getTime())) return "まだ";
        return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    }

    function getMasteryLabel(score) {
        if (score >= 90) return "マスター";
        if (score >= 70) return "とくい";
        if (score >= 40) return "いいかんじ";
        return "れんしゅう中";
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char]));
    }

    function getChoiceValue(choice) {
        return typeof choice === "object" ? String(choice.value) : String(choice);
    }

    function getChoiceLabel(choice) {
        return typeof choice === "object" ? choice.labelHtml : escapeHtml(choice);
    }

    function shuffle(items) {
        const list = [...items];
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }

    function findCategory(categoryId) {
        for (const subject of window.LearningLaboCategories) {
            const category = subject.categories.find((item) => item.id === categoryId);
            if (category) return { subject, category };
        }
        return null;
    }

    function renderUsers() {
        const users = typeof getUserNames === "function" ? getUserNames() : [];
        const userList = $("user-list");
        const lastUser = localStorage.getItem(LAST_USER_KEY) || "";

        if (users.length === 0) {
            userList.innerHTML = `<div class="empty-users">まだユーザーがいません。なまえをとうろくしてはじめよう。</div>`;
        } else {
            userList.innerHTML = users.map((name) => {
                const active = name === state.userName || (!state.userName && name === lastUser);
                return `<button class="user-chip ${active ? "active" : ""}" type="button" data-user="${escapeHtml(name)}">${escapeHtml(name)}</button>`;
            }).join("");
        }

        userList.querySelectorAll(".user-chip").forEach((button) => {
            button.addEventListener("click", () => selectUser(button.dataset.user));
        });

        if (!state.userName && lastUser && users.includes(lastUser)) {
            selectUser(lastUser, false);
        }
    }

    function selectUser(userName, moveNext = true) {
        state.userName = userName;
        localStorage.setItem(LAST_USER_KEY, userName);
        $("selected-user-label").textContent = userName;
        renderUsers();
        renderSubjects();
        if (moveNext) showPanel("subject");
        else panels.subject.classList.remove("hidden");
    }

    function registerUser(event) {
        event.preventDefault();
        const input = $("new-user-name");
        const name = input.value.trim();
        if (!name) return;

        if (typeof addPoints === "function") {
            addPoints(name, 1);
            const points = JSON.parse(localStorage.getItem("papan_points_v1") || "{}");
            points[name] = Math.max(0, (points[name] || 0) - 1);
            localStorage.setItem("papan_points_v1", JSON.stringify(points));
        }

        input.value = "";
        selectUser(name);
    }

    function renderSubjects() {
        $("subject-list").innerHTML = window.LearningLaboCategories.map((subject) => `
            <button class="subject-card ${subject.className}" type="button" data-subject="${subject.id}">
                <span class="subject-icon">${subject.icon}</span>
                <strong>${subject.name}</strong>
                <span>${subject.description}</span>
            </button>
        `).join("");

        $("subject-list").querySelectorAll(".subject-card").forEach((button) => {
            button.addEventListener("click", () => {
                state.subject = window.LearningLaboCategories.find((item) => item.id === button.dataset.subject);
                renderCategories();
                showPanel("category");
            });
        });
    }

    function renderCategories() {
        $("category-title").textContent = `${state.subject.name}のカテゴリ`;
        $("category-list").innerHTML = state.subject.categories.map((category) => {
            const record = getRecord(state.userName, category.id);
            const mastery = record ? record.mastery : 0;
            const label = record ? getMasteryLabel(mastery) : "未テスト";
            const correct = record ? `${record.lastCorrect} / ${record.totalQuestions}` : "まだ";
            const average = record ? `${record.lastAverageSeconds.toFixed(1)} 秒` : "まだ";
            const attempts = record ? `${record.attempts} 回` : "0 回";
            return `
                <button class="category-card" type="button" data-category="${category.id}">
                    <h3>${category.name}</h3>
                    <div class="mastery-row">
                        <div class="mastery-score">${mastery}<small>点</small></div>
                        <div class="mastery-label">${label}</div>
                    </div>
                    <div class="meter"><div class="meter-fill" style="width:${mastery}%"></div></div>
                    <div class="category-meta">
                        <span>前回: ${correct}</span>
                        <span>平均時間: ${average}</span>
                        <span>受験: ${attempts} / 最終: ${formatDate(record && record.lastTestedAt)}</span>
                    </div>
                </button>
            `;
        }).join("");

        $("category-list").querySelectorAll(".category-card").forEach((button) => {
            button.addEventListener("click", () => startTest(button.dataset.category));
        });
    }

    function startTest(categoryId) {
        const found = findCategory(categoryId);
        if (!found) return;
        const test = window.LearningLaboTests && window.LearningLaboTests[categoryId];
        if (!test || typeof test.createQuestions !== "function") {
            alert("このテストはまだ準備中です。");
            return;
        }

        state.subject = found.subject;
        state.category = found.category;
        state.questions = test.createQuestions(found.category.questionCount).slice(0, found.category.questionCount);
        state.currentIndex = 0;
        state.correctCount = 0;
        state.answerTimes = [];
        state.startedAt = Date.now();
        state.questionStartedAt = Date.now();
        state.result = null;
        state.saved = false;

        $("test-category-name").textContent = found.category.name;
        renderQuestion();
        showPanel("test");
    }

    function renderQuestion() {
        const question = state.questions[state.currentIndex];
        const currentNumber = state.currentIndex + 1;
        state.numericInput = "";
        state.matchSelection = [];
        state.matchMistakes = 0;
        state.answerLocked = false;
        $("question-number").textContent = currentNumber;
        $("correct-count").textContent = state.correctCount;
        $("progress-bar").style.width = `${((currentNumber - 1) / state.questions.length) * 100}%`;
        $("question-prompt").innerHTML = question.promptHtml || escapeHtml(question.prompt);
        if (Array.isArray(question.matchItems) && question.matchItems.length > 0) {
            renderMatchButtons(question);
        } else if (Array.isArray(question.choices) && question.choices.length > 0) {
            renderChoices(question);
        } else {
            renderNumberKeypad();
        }
        state.questionStartedAt = Date.now();
    }

    function renderChoices(question) {
        $("choices").className = "choices";
        $("choices").innerHTML = shuffle(question.choices).map((choice) => `
            <button class="choice-button" type="button" data-choice="${escapeHtml(getChoiceValue(choice))}">${getChoiceLabel(choice)}</button>
        `).join("");
        $("choices").querySelectorAll(".choice-button").forEach((button) => {
            button.addEventListener("click", () => answerQuestion(button.dataset.choice, button));
        });
    }

    function renderMatchButtons(question) {
        $("choices").className = question.matchClass || "kana-match";
        $("choices").innerHTML = shuffle(question.matchItems).map((item) => `
            <button class="kana-match-button" type="button" data-match-value="${escapeHtml(item.value)}" data-match-answer="${escapeHtml(item.answerKey)}">${escapeHtml(item.label)}</button>
        `).join("");
        $("choices").querySelectorAll(".kana-match-button").forEach((button) => {
            button.addEventListener("click", () => handleMatchButton(button));
        });
    }

    function handleMatchButton(button) {
        if (state.answerLocked) return;
        if (button.classList.contains("matched")) return;
        if (button.classList.contains("selected")) {
            button.classList.remove("selected");
            state.matchSelection = state.matchSelection.filter((item) => item !== button);
            return;
        }
        if (state.matchSelection.length >= 2) return;
        button.classList.add("selected");
        state.matchSelection.push(button);
        if (state.matchSelection.length === 2) {
            checkMatchPair();
        }
    }

    function checkMatchPair() {
        const selectedButtons = [...state.matchSelection];
        const [first, second] = selectedButtons;
        state.matchSelection = [];

        if (first.dataset.matchAnswer === second.dataset.matchAnswer) {
            selectedButtons.forEach((button) => {
                button.classList.remove("selected");
                button.classList.add("matched", "correct");
                button.disabled = true;
            });
            const question = state.questions[state.currentIndex];
            const matchedCount = $("choices").querySelectorAll(".kana-match-button.matched").length;
            if (matchedCount === question.matchItems.length) {
                answerQuestion(state.matchMistakes === 0 ? String(question.answer) : "__wrong_match__", selectedButtons);
            }
            return;
        }

        state.matchMistakes += 1;
        selectedButtons.forEach((button) => {
            button.classList.add("wrong");
        });
        setTimeout(() => {
            selectedButtons.forEach((button) => {
                button.classList.remove("selected", "wrong");
            });
        }, 320);
    }

    function renderNumberKeypad() {
        $("choices").className = "number-answer";
        $("choices").innerHTML = `
            <div class="number-display" aria-live="polite">
                <span id="number-input-display" class="number-input-display">こたえをいれてね</span>
            </div>
            <div class="keypad" aria-label="数字入力">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => `
                    <button class="keypad-button" type="button" data-key="${number}">${number}</button>
                `).join("")}
                <button class="keypad-button keypad-clear" type="button" data-action="backspace">けす</button>
                <button class="keypad-button" type="button" data-key="0">0</button>
                <button class="keypad-button keypad-submit" type="button" data-action="submit">こたえる</button>
            </div>
        `;
        $("choices").querySelectorAll(".keypad-button").forEach((button) => {
            button.addEventListener("click", () => handleKeypad(button));
        });
    }

    function updateNumberDisplay() {
        $("number-input-display").textContent = state.numericInput || "こたえをいれてね";
    }

    function handleKeypad(button) {
        if (state.answerLocked) return;
        if (button.dataset.key) {
            if (state.numericInput.length >= 3) return;
            if (state.numericInput === "0") state.numericInput = "";
            state.numericInput += button.dataset.key;
            updateNumberDisplay();
            return;
        }
        if (button.dataset.action === "backspace") {
            state.numericInput = state.numericInput.slice(0, -1);
            updateNumberDisplay();
            return;
        }
        if (button.dataset.action === "submit" && state.numericInput) {
            answerQuestion(state.numericInput, button);
        }
    }

    function answerQuestion(selected, sourceButton) {
        if (state.answerLocked) return;
        state.answerLocked = true;
        const question = state.questions[state.currentIndex];
        const elapsed = (Date.now() - state.questionStartedAt) / 1000;
        const isCorrect = selected === String(question.answer);

        state.answerTimes.push(elapsed);
        if (isCorrect) state.correctCount += 1;

        if (Array.isArray(question.matchItems) && question.matchItems.length > 0) {
            $("choices").querySelectorAll(".kana-match-button").forEach((matchButton) => {
                matchButton.disabled = true;
                matchButton.classList.add("correct");
            });
            if (!isCorrect) {
                (Array.isArray(sourceButton) ? sourceButton : [sourceButton]).forEach((button) => {
                    if (button) button.classList.add("wrong");
                });
            }
        } else if (Array.isArray(question.choices) && question.choices.length > 0) {
            $("choices").querySelectorAll(".choice-button").forEach((choiceButton) => {
                choiceButton.disabled = true;
                if (choiceButton.dataset.choice === String(question.answer)) choiceButton.classList.add("correct");
            });
            if (!isCorrect) sourceButton.classList.add("wrong");
        } else {
            $("choices").querySelectorAll(".keypad-button").forEach((keypadButton) => {
                keypadButton.disabled = true;
            });
            $("number-input-display").textContent = isCorrect ? "せいかい！" : `こたえは ${question.answer}`;
            $("number-input-display").classList.add(isCorrect ? "correct" : "wrong");
            sourceButton.classList.add(isCorrect ? "correct" : "wrong");
        }

        setTimeout(() => {
            state.currentIndex += 1;
            if (state.currentIndex >= state.questions.length) finishTest();
            else renderQuestion();
        }, 420);
    }

    function handleKeyboard(event) {
        const question = state.questions[state.currentIndex];
        if (panels.test.classList.contains("hidden") || !question || question.choices || question.matchItems || state.answerLocked) return;
        if (/^[0-9]$/.test(event.key)) {
            event.preventDefault();
            if (state.numericInput.length >= 3) return;
            if (state.numericInput === "0") state.numericInput = "";
            state.numericInput += event.key;
            updateNumberDisplay();
        } else if (event.key === "Backspace") {
            event.preventDefault();
            state.numericInput = state.numericInput.slice(0, -1);
            updateNumberDisplay();
        } else if (event.key === "Enter" && state.numericInput) {
            event.preventDefault();
            answerQuestion(state.numericInput, $("choices").querySelector("[data-action='submit']"));
        }
    }

    function calculateMastery(correctCount, totalQuestions, averageSeconds, targetSeconds) {
        const accuracyRate = correctCount / totalQuestions;
        const accuracyScore = accuracyRate * 75;
        const speedRate = Math.max(0, Math.min(1, targetSeconds / Math.max(averageSeconds, 0.1)));
        const speedScore = speedRate * 25;
        return Math.max(0, Math.min(100, Math.round(accuracyScore + speedScore)));
    }

    function finishTest() {
        const totalQuestions = state.questions.length;
        const totalSeconds = state.answerTimes.reduce((sum, value) => sum + value, 0);
        const averageSeconds = totalSeconds / totalQuestions;
        const mastery = calculateMastery(state.correctCount, totalQuestions, averageSeconds, state.category.targetSeconds);
        state.result = {
            mastery,
            correctCount: state.correctCount,
            totalQuestions,
            totalSeconds,
            averageSeconds,
            accuracy: state.correctCount / totalQuestions
        };
        $("progress-bar").style.width = "100%";
        renderResult();
        showPanel("result");
    }

    function renderResult() {
        const result = state.result;
        const label = getMasteryLabel(result.mastery);
        $("result-content").innerHTML = `
            <div class="result-summary">
                <div class="result-tile"><strong>${result.mastery}</strong><span>習熟度</span></div>
                <div class="result-tile"><strong>${result.correctCount}/${result.totalQuestions}</strong><span>正答数</span></div>
                <div class="result-tile"><strong>${result.averageSeconds.toFixed(1)}</strong><span>平均秒</span></div>
            </div>
            <div class="result-message">
                ${state.userName}さんの「${state.category.name}」は ${label}。${result.mastery} ポイントを受け取れるよ。
            </div>
        `;
        $("save-result").disabled = false;
        $("save-result").textContent = "ほぞんしてポイントGET";
    }

    function saveResult() {
        if (!state.result || state.saved) return;

        const records = getRecords();
        if (!records[state.userName]) records[state.userName] = {};
        const previous = records[state.userName][state.category.id];
        records[state.userName][state.category.id] = {
            mastery: state.result.mastery,
            bestMastery: Math.max(previous ? previous.bestMastery || 0 : 0, state.result.mastery),
            attempts: (previous ? previous.attempts || 0 : 0) + 1,
            lastCorrect: state.result.correctCount,
            totalQuestions: state.result.totalQuestions,
            lastAccuracy: Number(state.result.accuracy.toFixed(3)),
            lastAverageSeconds: Number(state.result.averageSeconds.toFixed(2)),
            lastTotalSeconds: Number(state.result.totalSeconds.toFixed(2)),
            lastTestedAt: new Date().toISOString()
        };
        saveRecords(records);

        if (typeof addPoints === "function") addPoints(state.userName, state.result.mastery);
        if (typeof savePlayLog === "function") savePlayLog(state.userName, state.category.gameId);
        if (typeof toggleStamp === "function" && typeof getTodayString === "function") {
            toggleStamp(state.userName, getTodayString(), true);
        }

        state.saved = true;
        $("save-result").disabled = true;
        $("save-result").textContent = "ほぞんしました";
        alert(`${state.userName}さんに ${state.result.mastery}ポイント！`);
    }

    function backToCategories() {
        renderCategories();
        showPanel("category");
    }

    function quitTest() {
        if (confirm("テストをやめますか？けっかとポイントはほぞんされません。")) {
            backToCategories();
        }
    }

    function init() {
        $("new-user-form").addEventListener("submit", registerUser);
        $("back-to-subjects").addEventListener("click", () => showPanel("subject"));
        $("quit-test").addEventListener("click", quitTest);
        $("save-result").addEventListener("click", saveResult);
        $("back-to-categories").addEventListener("click", backToCategories);
        document.addEventListener("keydown", handleKeyboard);
        renderUsers();
    }

    init();
})();
