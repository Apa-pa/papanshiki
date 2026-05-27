(function () {
    const state = {
        assets: window.PROGRAMMING_LABO_ASSETS,
        images: {},
        objects: [],
        selectedAssetId: "an",
        selectedObjectId: null,
        isPlaying: false,
        rewardClaimed: false,
        currentRunner: null,
        lastFrameTime: 0,
        effects: [],
        events: [],
        activeHitPairs: new Set(),
        idSeed: 1
    };

    function getAsset(assetId) {
        return state.assets.find((asset) => asset.id === assetId) || state.assets[0];
    }

    function getSelectedObject() {
        return state.objects.find((object) => object.id === state.selectedObjectId) || null;
    }

    function createObject(assetId, x, y) {
        const asset = getAsset(assetId);
        return {
            id: `obj_${state.idSeed++}`,
            assetId,
            label: asset.label,
            x,
            y,
            startX: x,
            startY: y,
            size: asset.size,
            startSize: asset.size,
            rotation: 0,
            startRotation: 0,
            visible: true,
            commands: [],
            loops: [],
            rules: [],
            velocityX: 0,
            velocityY: 0,
            activeCommandIndex: 0,
            activeCommand: null,
            commandStartedAt: 0,
            commandFrom: null,
            ruleCursors: {
                hit: 0
            }
        };
    }

    function resetObjectRuntime(object) {
        object.x = object.startX;
        object.y = object.startY;
        object.size = object.startSize;
        object.rotation = object.startRotation;
        object.visible = true;
        object.velocityX = 0;
        object.velocityY = 0;
        object.activeCommandIndex = 0;
        object.activeCommand = null;
        object.commandStartedAt = 0;
        object.commandFrom = null;
        object.ruleCursors = {
            hit: 0
        };
        object.loops.forEach((command) => {
            if (command.type === "moveForever" && command.startDirection) {
                command.direction = command.startDirection;
            }
        });
    }

    window.ProgramLaboState = {
        state,
        getAsset,
        getSelectedObject,
        createObject,
        resetObjectRuntime
    };
})();
