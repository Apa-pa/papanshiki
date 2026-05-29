(function () {
    window.PROGRAMMING_LABO_QUIZZES = [
        {
            id: "hit_hanamaru_sample",
            title: "ぶつかったら花丸",
            description: "アンがヒーにぶつかったら、花丸が出るようにしよう。",
            initialObjects: [
                { key: "an", assetId: "an", x: 210, y: 300, size: 74 },
                { key: "hi", assetId: "hi", x: 610, y: 300, size: 72 }
            ],
            clearConditions: [
                { type: "hit", assets: ["an", "hi"] },
                { type: "effectShown", effect: "hanamaru" }
            ],
            hint: "アンに「右へすすむ」をいくつか入れて、「ぶつかったら 花丸を出す」をつけてみよう。"
        },
        {
            id: "pippi_monster_hide",
            title: "モンスターをけそう",
            description: "ピッピがモンスターにぶつかったら、モンスターがきえるようにしよう。",
            initialObjects: [
                { key: "pippi", assetId: "pippi", x: 220, y: 310, size: 68 },
                { key: "monster", assetId: "monster", x: 610, y: 310, size: 78 }
            ],
            clearConditions: [
                { type: "hit", assets: ["pippi", "monster"] },
                { type: "hidden", asset: "monster" }
            ],
            hint: "モンスターをえらんで「ぶつかったら きえる」をつけよう。ピッピを右へ進ませるとクリアできるよ。"
        },
        {
            id: "collect_donguri",
            title: "どんぐりをひろおう",
            description: "アンがどんぐりにふれたら、どんぐりがきえるようにしよう。",
            initialObjects: [
                { key: "an", assetId: "an", x: 210, y: 260, size: 74 },
                { key: "donguri", assetId: "donguri", x: 580, y: 260, size: 62 }
            ],
            clearConditions: [
                { type: "hit", assets: ["an", "donguri"] },
                { type: "hidden", asset: "donguri" }
            ],
            hint: "どんぐりに「ぶつかったら きえる」をつけて、アンを右へ進ませよう。"
        },
        {
            id: "hi_heart_hanamaru",
            title: "ハートにタッチ",
            description: "ヒーがハートにぶつかったら、花丸が出るようにしよう。",
            initialObjects: [
                { key: "hi", assetId: "hi", x: 240, y: 380, size: 72 },
                { key: "heart", assetId: "heart", x: 620, y: 380, size: 74 }
            ],
            clearConditions: [
                { type: "hit", assets: ["hi", "heart"] },
                { type: "effectShown", effect: "hanamaru" }
            ],
            hint: "ヒーを右へ進ませて、「ぶつかったら 花丸を出す」をつけよう。"
        },
        {
            id: "pippi_reset",
            title: "あたったらもどる",
            description: "ピッピがモンスターにぶつかったら、ピッピがスタートにもどるようにしよう。",
            initialObjects: [
                { key: "pippi", assetId: "pippi", x: 210, y: 220, size: 68 },
                { key: "monster", assetId: "monster", x: 590, y: 220, size: 78 }
            ],
            clearConditions: [
                { type: "hit", assets: ["pippi", "monster"] },
                { type: "resetPosition", asset: "pippi" }
            ],
            hint: "ピッピに「ぶつかったら スタートにもどる」をつけてから、右へ進ませよう。"
        },
        {
            id: "edge_stop",
            title: "はしでストップ",
            description: "アンを右に進み続けさせて、はしについたらとまるようにしよう。",
            initialObjects: [
                { key: "an", assetId: "an", x: 220, y: 300, size: 74 }
            ],
            clearConditions: [
                { type: "edgeAction", asset: "an", action: "stopLoops" }
            ],
            hint: "アンに「右に進み続ける」と「はしについたら とまる」をつけよう。"
        },
        {
            id: "edge_bounce",
            title: "はしではねかえる",
            description: "ヒーを右に進み続けさせて、はしについたらはねかえるようにしよう。",
            initialObjects: [
                { key: "hi", assetId: "hi", x: 230, y: 300, size: 72 }
            ],
            clearConditions: [
                { type: "edgeAction", asset: "hi", action: "bounce" }
            ],
            hint: "ヒーに「右に進み続ける」と「はしについたら はねかえる」をつけよう。"
        },
        {
            id: "hit_start_move",
            title: "ぶつかったら動き出す",
            description: "アンがヒーにぶつかったら、ヒーが右に動き出すようにしよう。",
            initialObjects: [
                { key: "an", assetId: "an", x: 190, y: 300, size: 74 },
                { key: "hi", assetId: "hi", x: 520, y: 300, size: 72 }
            ],
            clearConditions: [
                { type: "hit", assets: ["an", "hi"] },
                { type: "moveStarted", asset: "hi", direction: "right" }
            ],
            hint: "ヒーに「ぶつかったら 右にうごきだす」をつけて、アンを右へ進ませよう。"
        },
        {
            id: "relay_three",
            title: "じゅんばんリレー",
            description: "アンがヒーにぶつかり、ヒーがピッピにぶつかり、ピッピが下に動き出すようにしよう。",
            initialObjects: [
                { key: "an", assetId: "an", x: 160, y: 260, size: 74 },
                { key: "hi", assetId: "hi", x: 410, y: 260, size: 72 },
                { key: "pippi", assetId: "pippi", x: 650, y: 260, size: 68 }
            ],
            clearConditions: [
                { type: "hit", assets: ["an", "hi"] },
                { type: "moveStarted", asset: "hi", direction: "right" },
                { type: "hit", assets: ["hi", "pippi"] },
                { type: "moveStarted", asset: "pippi", direction: "down" }
            ],
            hint: "ヒーには「ぶつかったら 右にうごきだす」、ピッピには「ぶつかったら 下にうごきだす」をつけよう。"
        },
        {
            id: "heart_relay",
            title: "ハートまでリレー",
            description: "アン、ヒー、ピッピが順番に動き、最後にピッピがハートにぶつかったら花丸が出るようにしよう。",
            initialObjects: [
                { key: "an", assetId: "an", x: 120, y: 360, size: 74 },
                { key: "hi", assetId: "hi", x: 310, y: 360, size: 72 },
                { key: "pippi", assetId: "pippi", x: 500, y: 360, size: 68 },
                { key: "heart", assetId: "heart", x: 720, y: 360, size: 74 }
            ],
            clearConditions: [
                { type: "hit", assets: ["an", "hi"] },
                { type: "moveStarted", asset: "hi", direction: "right" },
                { type: "hit", assets: ["hi", "pippi"] },
                { type: "moveStarted", asset: "pippi", direction: "right" },
                { type: "hit", assets: ["pippi", "heart"] },
                { type: "effectShown", effect: "hanamaru" }
            ],
            hint: "ヒーに「ぶつかったら 右にうごきだす」。ピッピには1番目に「ぶつかったら 右にうごきだす」、2番目に「ぶつかったら 花丸を出す」をつけよう。"
        }
    ];
})();
