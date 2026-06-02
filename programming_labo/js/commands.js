(function () {
    window.PROGRAMMING_LABO_STEP_COMMANDS = [
        { id: "step-right", label: "右へすすむ", type: "stepMove", direction: "right", amount: 70, duration: 520 },
        { id: "step-left", label: "左へすすむ", type: "stepMove", direction: "left", amount: 70, duration: 520 },
        { id: "step-up", label: "上へすすむ", type: "stepMove", direction: "up", amount: 70, duration: 520 },
        { id: "step-down", label: "下へすすむ", type: "stepMove", direction: "down", amount: 70, duration: 520 },
        { id: "turn", label: "くるっと回る", type: "turn", amount: Math.PI * 2, duration: 650 },
        { id: "grow", label: "大きくなる", type: "scale", factor: 1.18, duration: 450 },
        { id: "shrink", label: "小さくなる", type: "scale", factor: 0.86, duration: 450 }
    ];

    window.PROGRAMMING_LABO_LOOP_COMMANDS = [
        { id: "forever-right", label: "右に進み続ける", type: "moveForever", direction: "right", speed: 125 },
        { id: "forever-left", label: "左に進み続ける", type: "moveForever", direction: "left", speed: 125 },
        { id: "forever-up", label: "上に進み続ける", type: "moveForever", direction: "up", speed: 125 },
        { id: "forever-down", label: "下に進み続ける", type: "moveForever", direction: "down", speed: 125 },
        { id: "forever-spin", label: "くるくる回り続ける", type: "spinForever", speed: 2.8 }
    ];

    window.PROGRAMMING_LABO_RULE_COMMANDS = [
        { id: "edge-bounce", label: "はしについたら はねかえる", when: "edge", action: "bounce" },
        { id: "edge-hide", label: "はしについたら きえる", when: "edge", action: "hide" },
        { id: "edge-hanamaru", label: "はしについたら 花丸を出す", when: "edge", action: "showHanamaru" },
        { id: "edge-start-right", label: "はしについたら 右にうごきだす", when: "edge", action: "startMove", direction: "right", speed: 125 },
        { id: "edge-start-left", label: "はしについたら 左にうごきだす", when: "edge", action: "startMove", direction: "left", speed: 125 },
        { id: "edge-start-up", label: "はしについたら 上にうごきだす", when: "edge", action: "startMove", direction: "up", speed: 125 },
        { id: "edge-start-down", label: "はしについたら 下にうごきだす", when: "edge", action: "startMove", direction: "down", speed: 125 },
        { id: "edge-stop", label: "はしについたら とまる", when: "edge", action: "stopLoops" },
        { id: "edge-reset", label: "はしについたら スタートにもどる", when: "edge", action: "resetPosition" },
        { id: "tap-bounce", label: "タップしたら はねかえる", when: "tap", action: "bounce" },
        { id: "tap-hide", label: "タップしたら きえる", when: "tap", action: "hide" },
        { id: "tap-hanamaru", label: "タップしたら 花丸を出す", when: "tap", action: "showHanamaru" },
        { id: "tap-start-right", label: "タップしたら 右にうごきだす", when: "tap", action: "startMove", direction: "right", speed: 125 },
        { id: "tap-start-left", label: "タップしたら 左にうごきだす", when: "tap", action: "startMove", direction: "left", speed: 125 },
        { id: "tap-start-up", label: "タップしたら 上にうごきだす", when: "tap", action: "startMove", direction: "up", speed: 125 },
        { id: "tap-start-down", label: "タップしたら 下にうごきだす", when: "tap", action: "startMove", direction: "down", speed: 125 },
        { id: "tap-stop", label: "タップしたら とまる", when: "tap", action: "stopLoops" },
        { id: "tap-reset", label: "タップしたら スタートにもどる", when: "tap", action: "resetPosition" },
        { id: "hit-bounce", label: "ぶつかったら はねかえる", when: "hit", action: "bounce" },
        { id: "hit-hide", label: "ぶつかったら きえる", when: "hit", action: "hide" },
        { id: "hit-hanamaru", label: "ぶつかったら 花丸を出す", when: "hit", action: "showHanamaru" },
        { id: "hit-start-right", label: "ぶつかったら 右にうごきだす", when: "hit", action: "startMove", direction: "right", speed: 125 },
        { id: "hit-start-left", label: "ぶつかったら 左にうごきだす", when: "hit", action: "startMove", direction: "left", speed: 125 },
        { id: "hit-start-up", label: "ぶつかったら 上にうごきだす", when: "hit", action: "startMove", direction: "up", speed: 125 },
        { id: "hit-start-down", label: "ぶつかったら 下にうごきだす", when: "hit", action: "startMove", direction: "down", speed: 125 },
        { id: "hit-stop", label: "ぶつかったら とまる", when: "hit", action: "stopLoops" },
        { id: "hit-reset", label: "ぶつかったら スタートにもどる", when: "hit", action: "resetPosition" }
    ];

    window.cloneCommand = function cloneCommand(command) {
        return JSON.parse(JSON.stringify(command));
    };
})();
