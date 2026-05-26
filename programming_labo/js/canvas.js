(function () {
    const { state, getAsset, createObject, resetObjectRuntime } = window.ProgramLaboState;
    let canvas;
    let ctx;
    let onSelectionChange = function () {};
    let onStatus = function () {};

    function initCanvas(options) {
        canvas = options.canvas;
        ctx = canvas.getContext("2d");
        onSelectionChange = options.onSelectionChange;
        onStatus = options.onStatus;

        canvas.addEventListener("pointerdown", handlePointerDown);
        drawStage();
    }

    function loadImages() {
        const loaders = state.assets.map((asset) => new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = asset.src;
            state.images[asset.id] = img;
        }));
        return Promise.all(loaders);
    }

    function canvasPoint(ev) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (ev.clientX - rect.left) * (canvas.width / rect.width),
            y: (ev.clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    function handlePointerDown(ev) {
        const point = canvasPoint(ev);
        const hit = findObjectAt(point.x, point.y);
        if (hit) {
            state.selectedObjectId = hit.id;
            if (state.isPlaying) {
                runTapRules(hit);
            }
            onSelectionChange();
            drawStage();
            return;
        }

        if (state.isPlaying) return;

        const object = createObject(state.selectedAssetId, point.x, point.y);
        state.objects.push(object);
        state.selectedObjectId = object.id;
        onStatus(`${object.label}をおいたよ`);
        onSelectionChange();
        drawStage();
    }

    function findObjectAt(x, y) {
        for (let i = state.objects.length - 1; i >= 0; i--) {
            const object = state.objects[i];
            if (!object.visible) continue;
            const radius = object.size * 0.58;
            if (Math.hypot(object.x - x, object.y - y) <= radius) {
                return object;
            }
        }
        return null;
    }

    function drawStage() {
        if (!ctx) return;
        drawBackground();
        state.objects.forEach(drawObject);
    }

    function drawBackground() {
        const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        g.addColorStop(0, "#f9feff");
        g.addColorStop(0.46, "#eef8ff");
        g.addColorStop(1, "#fff8ec");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#d6edf7";
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += 60) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    function drawObject(object) {
        if (!object.visible) return;
        const img = state.images[object.assetId];
        const asset = getAsset(object.assetId);
        const selected = object.id === state.selectedObjectId;

        ctx.save();
        ctx.translate(object.x, object.y);
        ctx.rotate(object.rotation);
        if (selected) {
            ctx.save();
            ctx.rotate(-object.rotation);
            ctx.strokeStyle = "#ff9f1c";
            ctx.lineWidth = 5;
            ctx.setLineDash([10, 7]);
            ctx.beginPath();
            ctx.arc(0, 0, object.size * 0.68, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        const w = object.size;
        const h = object.size;
        if (img && img.complete && img.naturalWidth > 0) {
            const aspect = img.naturalWidth / img.naturalHeight;
            const drawW = aspect >= 1 ? w : w * aspect;
            const drawH = aspect >= 1 ? h / aspect : h;
            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        } else {
            ctx.fillStyle = "#79c6d8";
            ctx.beginPath();
            ctx.arc(0, 0, object.size * 0.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 18px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(asset.label, 0, 6);
        }
        ctx.restore();
    }

    function play() {
        if (state.isPlaying || !state.objects.length) return;
        state.isPlaying = true;
        state.lastFrameTime = performance.now();
        state.objects.forEach((object) => {
            object.activeCommandIndex = 0;
            object.activeCommand = null;
            object.commandStartedAt = 0;
            object.commandFrom = null;
            applyLoopVelocity(object);
        });
        state.currentRunner = requestAnimationFrame(tick);
    }

    function pause() {
        state.isPlaying = false;
        if (state.currentRunner) cancelAnimationFrame(state.currentRunner);
        state.currentRunner = null;
    }

    function reset() {
        pause();
        state.objects.forEach(resetObjectRuntime);
        drawStage();
    }

    function tick(now) {
        const delta = Math.min(0.04, (now - state.lastFrameTime) / 1000);
        state.lastFrameTime = now;
        state.objects.forEach((object) => {
            if (!object.visible) return;
            runStepCommand(object, now);
            runLoopCommands(object, delta);
            keepInStage(object);
        });
        runHitRules();
        drawStage();
        if (state.isPlaying) state.currentRunner = requestAnimationFrame(tick);
    }

    function runStepCommand(object, now) {
        if (object.activeCommandIndex >= object.commands.length) return;
        if (!object.activeCommand) {
            object.activeCommand = object.commands[object.activeCommandIndex];
            object.commandStartedAt = now;
            object.commandFrom = {
                x: object.x,
                y: object.y,
                rotation: object.rotation,
                size: object.size
            };
        }

        const command = object.activeCommand;
        const t = Math.min(1, (now - object.commandStartedAt) / command.duration);
        const eased = easeInOut(t);
        if (command.type === "stepMove") {
            const offset = directionOffset(command.direction, command.amount);
            object.x = object.commandFrom.x + offset.x * eased;
            object.y = object.commandFrom.y + offset.y * eased;
        } else if (command.type === "turn") {
            object.rotation = object.commandFrom.rotation + command.amount * eased;
        } else if (command.type === "scale") {
            object.size = object.commandFrom.size * (1 + (command.factor - 1) * eased);
        }

        if (t >= 1) {
            object.activeCommandIndex += 1;
            object.activeCommand = null;
        }
    }

    function runLoopCommands(object, delta) {
        object.loops.forEach((command) => {
            if (command.type === "moveForever") {
                const offset = directionOffset(command.direction, command.speed * delta);
                object.x += offset.x;
                object.y += offset.y;
            } else if (command.type === "spinForever") {
                object.rotation += command.speed * delta;
            }
        });
    }

    function applyLoopVelocity(object) {
        const moveLoop = object.loops.find((command) => command.type === "moveForever");
        if (!moveLoop) {
            object.velocityX = 0;
            object.velocityY = 0;
            return;
        }
        const offset = directionOffset(moveLoop.direction, moveLoop.speed);
        object.velocityX = offset.x;
        object.velocityY = offset.y;
    }

    function keepInStage(object) {
        const r = object.size * 0.5;
        let touchedEdge = false;
        if (object.x < r) {
            object.x = r;
            touchedEdge = true;
        } else if (object.x > canvas.width - r) {
            object.x = canvas.width - r;
            touchedEdge = true;
        }
        if (object.y < r) {
            object.y = r;
            touchedEdge = true;
        } else if (object.y > canvas.height - r) {
            object.y = canvas.height - r;
            touchedEdge = true;
        }
        if (touchedEdge) runEdgeRules(object);
    }

    function runEdgeRules(object) {
        object.rules.filter((rule) => rule.when === "edge").forEach((rule) => {
            if (rule.action === "bounce") {
                object.loops.forEach((command) => {
                    if (command.type !== "moveForever") return;
                    command.direction = oppositeDirection(command.direction, object);
                });
            } else if (rule.action === "stopLoops") {
                object.loops = object.loops.filter((command) => command.type !== "moveForever");
            }
        });
    }

    function runTapRules(object) {
        object.rules.filter((rule) => rule.when === "tap").forEach((rule) => {
            if (rule.action === "hide") object.visible = false;
        });
    }

    function runHitRules() {
        for (let i = 0; i < state.objects.length; i++) {
            const a = state.objects[i];
            if (!a.visible) continue;
            for (let j = i + 1; j < state.objects.length; j++) {
                const b = state.objects[j];
                if (!b.visible) continue;
                const minDistance = (a.size + b.size) * 0.36;
                if (Math.hypot(a.x - b.x, a.y - b.y) <= minDistance) {
                    applyHitRule(a);
                    applyHitRule(b);
                }
            }
        }
    }

    function applyHitRule(object) {
        object.rules.filter((rule) => rule.when === "hit").forEach((rule) => {
            if (rule.action === "hide") object.visible = false;
        });
    }

    function directionOffset(direction, amount) {
        if (direction === "left") return { x: -amount, y: 0 };
        if (direction === "up") return { x: 0, y: -amount };
        if (direction === "down") return { x: 0, y: amount };
        return { x: amount, y: 0 };
    }

    function oppositeDirection(direction, object) {
        if (direction === "right" && object.x >= canvas.width - object.size * 0.5) return "left";
        if (direction === "left" && object.x <= object.size * 0.5) return "right";
        if (direction === "down" && object.y >= canvas.height - object.size * 0.5) return "up";
        if (direction === "up" && object.y <= object.size * 0.5) return "down";
        if (direction === "right") return "left";
        if (direction === "left") return "right";
        if (direction === "down") return "up";
        return "down";
    }

    function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    window.ProgramLaboCanvas = {
        initCanvas,
        loadImages,
        drawStage,
        play,
        pause,
        reset
    };
})();
