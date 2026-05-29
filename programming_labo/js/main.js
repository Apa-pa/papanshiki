(function () {
    const { state, getAsset, getSelectedObject } = window.ProgramLaboState;
    const canvasApi = window.ProgramLaboCanvas;

    const els = {};

    function init() {
        bindElements();
        renderAssets();
        renderCommandButtons();
        bindEvents();
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
    }

    function bindEvents() {
        els.startBtn.addEventListener("click", () => {
            els.homeScreen.classList.remove("active");
            els.labScreen.classList.add("active");
            canvasApi.drawStage();
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
        renderCommandGroup(els.ruleButtons, window.PROGRAMMING_LABO_RULE_COMMANDS, addRuleCommand);
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
            return;
        }
        els.sizeRange.value = String(Math.round(object.startSize));
        els.sizeValue.textContent = `${Math.round(object.startSize)}`;
    }

    function updateSelectedObjectSize(size) {
        const object = getSelectedObject();
        if (!object) {
            setStatus("大きさを変えるキャラをえらんでね");
            return;
        }
        const nextSize = Math.max(36, Math.min(140, size));
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
        els.homeScreen.classList.remove("active");
        els.labScreen.classList.add("active");
        canvasApi.drawStage();
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
        refresh: updateSelectedPanel,
        setModeLabel,
        setObjectsFromData,
        setStatus
    };

    document.addEventListener("DOMContentLoaded", init);
})();
