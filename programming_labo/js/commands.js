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
        { id: "edge-stop", label: "はしについたら とまる", when: "edge", action: "stopLoops" },
        { id: "tap-hide", label: "タップされたら きえる", when: "tap", action: "hide" },
        { id: "hit-hide", label: "だれかにあたったら きえる", when: "hit", action: "hide" }
    ];

    window.cloneCommand = function cloneCommand(command) {
        return JSON.parse(JSON.stringify(command));
    };
})();
