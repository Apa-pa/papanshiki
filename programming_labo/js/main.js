(function () {
    const { state, getAsset, getSelectedObject } = window.ProgramLaboState;
    const canvasApi = window.ProgramLaboCanvas;
    const DEFAULT_MAX_SIZE = 140;
    const HEART_MAX_SIZE = 220;
    const RULE_COMMAND_GROUPS = [
        { id: "edge", label: "はしについたら" },
        { id: "hit", label: "ぶつかったら" },
        { id: "tap", label: "タップしたら" }
    ];
    const USER_LIST_KEY = "programming_labo_users_v1";
    const CURRENT_USER_KEY = "programming_labo_current_user_v1";

    const els = {};
    let activeRuleGroup = null;

    function init() {
        bindElements();
        renderAssets();
        renderCommandButtons();
        bindEvents();
        initUserSelection();
        canvasApi.initCanvas({
            canvas: els.canvas,
            onSelectionChange: updateSelectedPanel,
            onStatus: setStatus
        });
        canvasApi.loadImages().then(() => {
            canvasApi.drawStage();
            updateSelectedPanel();
        });
    }

    function bindElements() {
        els.homeScreen = document.getElementById("home-screen");
        els.labScreen = document.getElementById("lab-screen");
        els.startBtn = document.getElementById("start-btn");
        els.modeBadge = document.getElementById("mode-badge");
        els.assetPalette = document.getElementById("asset-palette");
        els.canvas = document.getElementById("stage-canvas");
        els.statusText = document.getElementById("status-text");
        els.selectedPreview = document.getElementById("selected-preview");
        els.selectedName = document.getElementById("selected-name");
        els.sizeEditor = document.getElementById("size-editor");
        els.sizeRange = document.getElementById("size-range");
        els.sizeValue = document.getElementById("size-value");
        els.sizePresetButtons = document.querySelectorAll(".size-presets button");
        els.stepButtons = document.getElementById("step-command-buttons");
        els.loopButtons = document.getElementById("loop-command-buttons");
        els.ruleButtons = document.getElementById("rule-command-buttons");
        els.stepList = document.getElementById("step-command-list");
        els.loopList = document.getElementById("loop-command-list");
        els.ruleList = document.getElementById("rule-command-list");
        els.playBtn = document.getElementById("play-btn");
        els.pauseBtn = document.getElementById("pause-btn");
        els.resetBtn = document.getElementById("reset-btn");
        els.stagePlayBtn = document.getElementById("stage-play-btn");
        els.stagePauseBtn = document.getElementById("stage-pause-btn");
        els.stageResetBtn = document.getElementById("stage-reset-btn");
        els.deleteObjectBtn = document.getElementById("delete-object-btn");
        els.clearBtn = document.getElementById("clear-btn");
        els.pointBtn = document.getElementById("point-btn");
        els.userSwitchBtn = document.getElementById("user-switch-btn");
        els.currentUserName = document.getElementById("current-user-name");
        els.userSelectDialog = document.getElementById("user-select-dialog");
        els.userChoiceList = document.getElementById("user-choice-list");
        els.newUserForm = document.getElementById("new-user-form");
        els.newUserName = document.getElementById("new-user-name");
    }

    function bindEvents() {
        els.startBtn.addEventListener("click", () => {
            if (!requireCurrentUser()) return;
            els.homeScreen.classList.remove("active");
            els.labScreen.classList.add("active");
            canvasApi.drawStage();
        });
        els.userSwitchBtn.addEventListener("click", showUserDialog);
        els.newUserForm.addEventListener("submit", (ev) => {
            ev.preventDefault();
            selectUser(els.newUserName.value);
        });
        els.playBtn.addEventListener("click", playStage);
        els.stagePlayBtn.addEventListener("click", playStage);
        els.pauseBtn.addEventListener("click", pauseStage);
        els.stagePauseBtn.addEventListener("click", pauseStage);
        els.resetBtn.addEventListener("click", resetStage);
        els.stageResetBtn.addEventListener("click", resetStage);
        els.deleteObjectBtn.addEventListener("click", deleteSelectedObject);
        els.clearBtn.addEventListener("click", clearAll);
        els.pointBtn.addEventListener("click", claimPoint);
        els.sizeRange.addEventListener("input", () => updateSelectedObjectSize(Number(els.sizeRange.value)));
        els.sizePresetButtons.forEach((button) => {
            button.addEventListener("click", () => updateSelectedObjectSize(Number(button.dataset.size)));
        });
    }

    function initUserSelection() {
        const savedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (savedUser) {
            state.currentUserName = savedUser;
            updateCurrentUserDisplay();
        }
        renderUserChoices();
        showUserDialog();
    }

    function getSelectableUsers() {
        const users = new Set(getStoredLabUsers());
        if (typeof getUserNames === "function") {
            getUserNames().forEach((name) => users.add(name));
        }
        return [...users].filter(Boolean).sort();
    }

    function getStoredLabUsers() {
        try {
            const parsed = JSON.parse(localStorage.getItem(USER_LIST_KEY) || "[]");
            return Array.isArray(parsed) ? parsed.filter((name) => typeof name === "string") : [];
        } catch (error) {
            return [];
        }
    }

    function saveStoredLabUsers(users) {
        localStorage.setItem(USER_LIST_KEY, JSON.stringify([...new Set(users)].sort()));
    }

    function renderUserChoices() {
        const users = getSelectableUsers();
        els.userChoiceList.innerHTML = "";
        users.forEach((name) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = name;
            button.classList.toggle("active", name === state.currentUserName);
            button.addEventListener("click", () => selectUser(name));
            els.userChoiceList.appendChild(button);
        });
    }

    function showUserDialog() {
        renderUserChoices();
        els.userSelectDialog.classList.remove("hidden");
        els.newUserName.value = "";
        els.newUserName.focus();
    }

    function hideUserDialog() {
        els.userSelectDialog.classList.add("hidden");
    }

    function selectUser(rawName) {
        const name = rawName.trim();
        if (!name) {
            setStatus("あそぶ人の名前を入れてね");
            return false;
        }
        const users = getSelectableUsers();
        if (!users.includes(name)) {
            saveStoredLabUsers([...users, name]);
        }
        state.currentUserName = name;
        localStorage.setItem(CURRENT_USER_KEY, name);
        updateCurrentUserDisplay();
        renderUserChoices();
        hideUserDialog();
        document.dispatchEvent(new CustomEvent("programlabo:userchange", { detail: { userName: name } }));
        setStatus(`${name}さんであそぶよ`);
        return true;
    }

    function updateCurrentUserDisplay() {
        els.currentUserName.textContent = state.currentUserName || "えらんでね";
    }

    function requireCurrentUser() {
        if (state.currentUserName) return true;
        showUserDialog();
        setStatus("あそぶ人をえらんでね");
        return false;
    }

    function awardPointsToCurrentUser(amount) {
        if (!requireCurrentUser()) return null;
        const userName = state.currentUserName;
        if (typeof addPoints === "function") {
            addPoints(userName, amount);
        }
        if (typeof toggleStamp === "function" && typeof getTodayString === "function") {
            toggleStamp(userName, getTodayString(), true);
        }
        if (typeof savePlayLog === "function") {
            savePlayLog(userName, "programming_labo");
        }
        const parentBonus = typeof checkAndAwardParentBonus === "function"
            ? checkAndAwardParentBonus(userName, "programming_labo")
            : 0;
        state.lastPointAward = {
            userName,
            amount,
            parentBonus
        };
        return userName;
    }

    function playStage() {
            if (!state.objects.length) {
                setStatus("まずキャラをおいてね");
                return;
            }
            canvasApi.play();
            setStatus("再生中");
    }

    function pauseStage() {
        canvasApi.pause();
        setStatus("とめたよ");
    }

    function resetStage() {
        canvasApi.reset();
        setStatus("さいしょの場所にもどしたよ");
        updateSelectedPanel();
    }

    function renderAssets() {
        els.assetPalette.innerHTML = "";
        state.assets.forEach((asset) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "asset-button";
            button.dataset.assetId = asset.id;
            button.innerHTML = `<img src="${asset.src}" alt=""><span>${asset.label}</span>`;
            button.addEventListener("click", () => {
                state.selectedAssetId = asset.id;
                updateAssetActiveState();
                setStatus(`${asset.label}をえらんだよ`);
            });
            els.assetPalette.appendChild(button);
        });
        updateAssetActiveState();
    }

    function updateAssetActiveState() {
        [...els.assetPalette.children].forEach((button) => {
            button.classList.toggle("active", button.dataset.assetId === state.selectedAssetId);
        });
    }

    function renderCommandButtons() {
        renderCommandGroup(els.stepButtons, window.PROGRAMMING_LABO_STEP_COMMANDS, addStepCommand);
        renderCommandGroup(els.loopButtons, window.PROGRAMMING_LABO_LOOP_COMMANDS, addLoopCommand);
        renderRuleCommandButtons();
    }

    function renderCommandGroup(container, commands, handler) {
        container.innerHTML = "";
        commands.forEach((command) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = command.label;
            button.addEventListener("click", () => handler(command));
            container.appendChild(button);
        });
    }

    function renderRuleCommandButtons() {
        els.ruleButtons.innerHTML = "";

        const groupRow = document.createElement("div");
        groupRow.className = "rule-command-groups";
        RULE_COMMAND_GROUPS.forEach((group) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = group.label;
            button.className = "rule-group-button";
            button.classList.toggle("active", activeRuleGroup === group.id);
            button.addEventListener("click", () => {
                activeRuleGroup = activeRuleGroup === group.id ? null : group.id;
                renderRuleCommandButtons();
            });
            groupRow.appendChild(button);
        });
        els.ruleButtons.appendChild(groupRow);

        if (!activeRuleGroup) return;

        const actionRow = document.createElement("div");
        actionRow.className = "rule-command-actions";
        window.PROGRAMMING_LABO_RULE_COMMANDS
            .filter((command) => command.when === activeRuleGroup)
            .forEach((command) => {
                const button = document.createElement("button");
                button.type = "button";
                button.textContent = getRuleActionLabel(command);
                button.addEventListener("click", () => addRuleCommand(command));
                actionRow.appendChild(button);
            });
        els.ruleButtons.appendChild(actionRow);
    }

    function getRuleActionLabel(command) {
        const prefix = `${RULE_COMMAND_GROUPS.find((group) => group.id === command.when)?.label} `;
        return command.label.startsWith(prefix) ? command.label.slice(prefix.length) : command.label;
    }

    function addStepCommand(command) {
        const object = requireSelectedObject();
        if (!object) return;
        object.commands.push(window.cloneCommand(command));
        updateSelectedPanel();
        setStatus(`${object.label}に「${command.label}」をつけたよ`);
    }

    function addLoopCommand(command) {
        const object = requireSelectedObject();
        if (!object) return;
        const cloned = window.cloneCommand(command);
        if (cloned.direction) cloned.startDirection = cloned.direction;
        object.loops.push(cloned);
        updateSelectedPanel();
        setStatus(`${object.label}に「${command.label}」をつけたよ`);
    }

    function addRuleCommand(command) {
        const object = requireSelectedObject();
        if (!object) return;
        object.rules.push(window.cloneCommand(command));
        updateSelectedPanel();
        setStatus(`${object.label}に「${command.label}」をつけたよ`);
    }

    function requireSelectedObject() {
        const object = getSelectedObject();
        if (!object) {
            setStatus("命令をつけるキャラをえらんでね");
        }
        return object;
    }

    function updateSelectedPanel() {
        const object = getSelectedObject();
        if (!object) {
            const asset = getAsset(state.selectedAssetId);
            els.selectedPreview.src = asset.src;
            els.selectedName.textContent = "まだいません";
            updateSizeEditor(null);
            renderList(els.stepList, [], "キャラをえらんでね");
            renderList(els.loopList, [], "キャラをえらんでね");
            renderList(els.ruleList, [], "キャラをえらんでね");
            return;
        }
        const asset = getAsset(object.assetId);
        els.selectedPreview.src = asset.src;
        els.selectedName.textContent = object.label;
        updateSizeEditor(object);
        renderList(els.stepList, object.commands, "上からじゅんの命令はまだありません", (index) => {
            object.commands.splice(index, 1);
            updateSelectedPanel();
        });
        renderList(els.loopList, object.loops, "ずっと命令はまだありません", (index) => {
            object.loops.splice(index, 1);
            updateSelectedPanel();
        });
        renderList(els.ruleList, object.rules, "もしもルールはまだありません", (index) => {
            object.rules.splice(index, 1);
            updateSelectedPanel();
        });
    }

    function updateSizeEditor(object) {
        const hasObject = Boolean(object);
        els.sizeEditor.classList.toggle("disabled", !hasObject);
        els.sizeRange.disabled = !hasObject;
        els.sizePresetButtons.forEach((button) => {
            button.disabled = !hasObject;
            button.classList.toggle("active", hasObject && Number(button.dataset.size) === Math.round(object.startSize));
        });
        if (!hasObject) {
            els.sizeValue.textContent = "--";
            els.sizeRange.value = 72;
            els.sizeRange.max = DEFAULT_MAX_SIZE;
            return;
        }
        els.sizeRange.max = getObjectMaxSize(object);
        els.sizeRange.value = String(Math.round(object.startSize));
        els.sizeValue.textContent = `${Math.round(object.startSize)}`;
    }

    function updateSelectedObjectSize(size) {
        const object = getSelectedObject();
        if (!object) {
            setStatus("大きさを変えるキャラをえらんでね");
            return;
        }
        const nextSize = Math.max(36, Math.min(getObjectMaxSize(object), size));
        if (state.isPlaying) {
            canvasApi.pause();
            setStatus("大きさを変えるために再生をとめたよ");
        } else {
            setStatus(`${object.label}の大きさを ${nextSize} にしたよ`);
        }
        object.startSize = nextSize;
        object.size = nextSize;
        object.activeCommand = null;
        object.activeCommandIndex = 0;
        canvasApi.drawStage();
        updateSizeEditor(object);
    }

    function getObjectMaxSize(object) {
        return object && object.assetId === "heart" ? HEART_MAX_SIZE : DEFAULT_MAX_SIZE;
    }

    function renderList(container, commands, emptyText, onRemove) {
        container.innerHTML = "";
        container.classList.toggle("empty-list", commands.length === 0);
        if (!commands.length) {
            container.textContent = emptyText;
            return;
        }
        commands.forEach((command, index) => {
            const row = document.createElement("div");
            row.className = "command-chip";
            const number = container === els.stepList ? `${index + 1}. ` : "";
            row.innerHTML = `<span>${number}${command.label}</span>`;
            if (onRemove) {
                const remove = document.createElement("button");
                remove.type = "button";
                remove.textContent = "けす";
                remove.addEventListener("click", () => onRemove(index));
                row.appendChild(remove);
            }
            container.appendChild(row);
        });
    }

    function deleteSelectedObject() {
        const object = getSelectedObject();
        if (!object) {
            setStatus("けすキャラをえらんでね");
            return;
        }
        state.objects = state.objects.filter((item) => item.id !== object.id);
        state.selectedObjectId = state.objects.length ? state.objects[state.objects.length - 1].id : null;
        canvasApi.drawStage();
        updateSelectedPanel();
        setStatus(`${object.label}をけしたよ`);
    }

    function clearAll() {
        canvasApi.pause();
        state.objects = [];
        state.effects = [];
        state.events = [];
        state.activeHitPairs.clear();
        state.selectedObjectId = null;
        canvasApi.drawStage();
        updateSelectedPanel();
        setStatus("ぜんぶけしたよ");
    }

    function claimPoint() {
        if (state.rewardClaimed) return;
        if (typeof showPointGetDialog === "function") {
            els.pointBtn.disabled = true;
            els.pointBtn.textContent = "えらんでね";
            setStatus("ポイントを受け取る人をえらんでね");
            showPointGetDialog(30, "programming_labo", (userName) => {
                if (!userName) {
                    els.pointBtn.disabled = false;
                    els.pointBtn.textContent = "30ptをもらう";
                    setStatus("ポイントを受け取るときは、もう一度ボタンを押してね");
                    return;
                }
                state.rewardClaimed = true;
                els.pointBtn.textContent = "もらいました";
                setStatus("30ポイントを受け取ったよ");
                if (typeof addMissionStock === "function" && addMissionStock(userName, "programming_labo")) {
                    setStatus("すごろくミッションもクリアしたよ");
                }
            });
            return;
        }
        state.rewardClaimed = true;
        els.pointBtn.disabled = true;
        els.pointBtn.textContent = "もらいました";
        setStatus("30ポイントを受け取ったよ");
    }

    function setStatus(text) {
        els.statusText.textContent = text;
    }

    function openLab() {
        if (!requireCurrentUser()) return false;
        els.homeScreen.classList.remove("active");
        els.labScreen.classList.add("active");
        canvasApi.drawStage();
        return true;
    }

    function setModeLabel(label) {
        els.modeBadge.textContent = label;
    }

    function setObjectsFromData(objects) {
        canvasApi.pause();
        state.objects = [];
        state.effects = [];
        state.events = [];
        state.activeHitPairs.clear();
        objects.forEach((item) => {
            const object = window.ProgramLaboState.createObject(item.assetId, item.x, item.y);
            if (item.key) object.key = item.key;
            if (item.size) {
                object.size = item.size;
                object.startSize = item.size;
            }
            if (item.commands) object.commands = item.commands.map(window.cloneCommand);
            if (item.loops) object.loops = item.loops.map(window.cloneCommand);
            if (item.rules) object.rules = item.rules.map(window.cloneCommand);
            state.objects.push(object);
        });
        state.selectedObjectId = state.objects[0] ? state.objects[0].id : null;
        canvasApi.drawStage();
        updateSelectedPanel();
    }

    window.ProgramLaboMain = {
        openLab,
        clearAll,
        getCurrentUser: () => state.currentUserName,
        requireCurrentUser,
        awardPointsToCurrentUser,
        getLastPointAward: () => state.lastPointAward,
        refresh: updateSelectedPanel,
        setModeLabel,
        setObjectsFromData,
        setStatus
    };

    document.addEventListener("DOMContentLoaded", init);
})();
