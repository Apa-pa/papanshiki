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
        els.assetPalette = document.getElementById("asset-palette");
        els.canvas = document.getElementById("stage-canvas");
        els.statusText = document.getElementById("status-text");
        els.selectedPreview = document.getElementById("selected-preview");
        els.selectedName = document.getElementById("selected-name");
        els.stepButtons = document.getElementById("step-command-buttons");
        els.loopButtons = document.getElementById("loop-command-buttons");
        els.ruleButtons = document.getElementById("rule-command-buttons");
        els.stepList = document.getElementById("step-command-list");
        els.loopList = document.getElementById("loop-command-list");
        els.ruleList = document.getElementById("rule-command-list");
        els.playBtn = document.getElementById("play-btn");
        els.pauseBtn = document.getElementById("pause-btn");
        els.resetBtn = document.getElementById("reset-btn");
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
        els.playBtn.addEventListener("click", () => {
            if (!state.objects.length) {
                setStatus("まずキャラをおいてね");
                return;
            }
            canvasApi.play();
            setStatus("再生中");
        });
        els.pauseBtn.addEventListener("click", () => {
            canvasApi.pause();
            setStatus("とめたよ");
        });
        els.resetBtn.addEventListener("click", () => {
            canvasApi.reset();
            setStatus("さいしょの場所にもどしたよ");
            updateSelectedPanel();
        });
        els.deleteObjectBtn.addEventListener("click", deleteSelectedObject);
        els.clearBtn.addEventListener("click", clearAll);
        els.pointBtn.addEventListener("click", claimPoint);
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
            renderList(els.stepList, [], "キャラをえらんでね");
            renderList(els.loopList, [], "キャラをえらんでね");
            renderList(els.ruleList, [], "キャラをえらんでね");
            return;
        }
        const asset = getAsset(object.assetId);
        els.selectedPreview.src = asset.src;
        els.selectedName.textContent = object.label;
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

    document.addEventListener("DOMContentLoaded", init);
})();
