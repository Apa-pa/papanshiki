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
                { key: "pippi", assetId: "pippi", x: 220, y: 310, size: 102 },
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
                { key: "heart", assetId: "heart", x: 620, y: 380, size: 160 }
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
                { key: "pippi", assetId: "pippi", x: 210, y: 220, size: 102 },
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
                { key: "pippi", assetId: "pippi", x: 650, y: 260, size: 102 }
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
                { key: "pippi", assetId: "pippi", x: 500, y: 360, size: 102 },
                { key: "heart", assetId: "heart", x: 720, y: 360, size: 160 }
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
        },
        {
            id: "corner_to_corner_hanamaru",
            title: "すみからすみへ",
            description: "左下のアンを右上のヒーのところまで進ませて、ぶつかったら花丸を出そう。",
            initialObjects: [
                { key: "an", assetId: "an", x: 130, y: 500, size: 74 },
                { key: "hi", assetId: "hi", x: 760, y: 120, size: 72 }
            ],
            clearConditions: [
                { type: "hit", keys: ["an", "hi"] },
                { type: "effectShown", effect: "hanamaru" }
            ],
            hint: "アンに右へすすむ、上へすすむを組み合わせて、ヒーに「ぶつかったら 花丸を出す」をつけよう。"
        },
        {
            id: "two_donguri_corner_relay",
            title: "どんぐりリレー",
            description: "左下のアンがどんぐりを1つ拾って右上のヒーへ。つぎにヒーがもう1つのどんぐりを拾うようにしよう。",
            initialObjects: [
                { key: "an", assetId: "an", x: 130, y: 500, size: 74 },
                { key: "hi", assetId: "hi", x: 760, y: 120, size: 72 },
                { key: "donguri_bottom", assetId: "donguri", x: 450, y: 500, size: 62 },
                { key: "donguri_top", assetId: "donguri", x: 450, y: 120, size: 62 }
            ],
            clearConditions: [
                { type: "hit", keys: ["an", "donguri_bottom"] },
                { type: "hidden", key: "donguri_bottom" },
                { type: "hit", keys: ["an", "hi"] },
                { type: "moveStarted", key: "hi", direction: "left" },
                { type: "hit", keys: ["hi", "donguri_top"] },
                { type: "hidden", key: "donguri_top" }
            ],
            hint: "どんぐり2つに「ぶつかったら きえる」。ヒーには「ぶつかったら 左にうごきだす」をつけて、アンを右上まで進ませよう。"
        },
        {
            id: "edge_hanamaru",
            title: "はしで花丸",
            description: "ピッピを右に進み続けさせて、はしについたら花丸を出そう。",
            initialObjects: [
                { key: "pippi", assetId: "pippi", x: 180, y: 300, size: 102 }
            ],
            clearConditions: [
                { type: "effectShown", effect: "hanamaru" }
            ],
            hint: "ピッピに「右に進み続ける」と「はしについたら 花丸を出す」をつけよう。"
        },
        {
            id: "edge_reset_start",
            title: "はしでスタートへ",
            description: "アンを上に進み続けさせて、はしについたらスタートにもどるようにしよう。",
            initialObjects: [
                { key: "an", assetId: "an", x: 450, y: 480, size: 74 }
            ],
            clearConditions: [
                { type: "resetPosition", key: "an" }
            ],
            hint: "アンに「上に進み続ける」と「はしについたら スタートにもどる」をつけよう。"
        },
        {
            id: "hit_bounce_challenge",
            title: "ぶつかったらはねかえる",
            description: "ヒーを右に進み続けさせて、モンスターにぶつかったらはねかえるようにしよう。",
            initialObjects: [
                { key: "hi", assetId: "hi", x: 220, y: 320, size: 72 },
                { key: "monster", assetId: "monster", x: 620, y: 320, size: 78 }
            ],
            clearConditions: [
                { type: "hit", keys: ["hi", "monster"] },
                { type: "bounce", key: "hi" }
            ],
            hint: "ヒーに「右に進み続ける」と「ぶつかったら はねかえる」をつけよう。"
        },
        {
            id: "donguri_then_edge_stop",
            title: "ひろってストップ",
            description: "アンがどんぐりをひろって、そのまま進み、はしについたらとまるようにしよう。",
            initialObjects: [
                { key: "an", assetId: "an", x: 180, y: 310, size: 74 },
                { key: "donguri", assetId: "donguri", x: 470, y: 310, size: 62 }
            ],
            clearConditions: [
                { type: "hit", keys: ["an", "donguri"] },
                { type: "hidden", key: "donguri" },
                { type: "edgeAction", key: "an", action: "stopLoops" }
            ],
            hint: "どんぐりに「ぶつかったら きえる」。アンには「右に進み続ける」と「はしについたら とまる」をつけよう。"
        },
        {
            id: "hit_start_edge_hanamaru",
            title: "動き出して花丸",
            description: "アンがヒーにぶつかったらヒーが右に動き出し、ヒーがはしについたら花丸を出すようにしよう。",
            initialObjects: [
                { key: "an", assetId: "an", x: 170, y: 320, size: 74 },
                { key: "hi", assetId: "hi", x: 430, y: 320, size: 72 }
            ],
            clearConditions: [
                { type: "hit", keys: ["an", "hi"] },
                { type: "moveStarted", key: "hi", direction: "right" },
                { type: "effectShown", effect: "hanamaru" }
            ],
            hint: "ヒーに「ぶつかったら 右にうごきだす」と「はしについたら 花丸を出す」をつけて、アンを右へ進ませよう。"
        },
        {
            id: "edge_bounce_then_hit_start",
            title: "はねかえりスイッチ",
            description: "アンがはしではねかえってからヒーにぶつかり、ヒーが上に動き出すようにしよう。",
            initialObjects: [
                { key: "an", assetId: "an", x: 660, y: 360, size: 74 },
                { key: "hi", assetId: "hi", x: 360, y: 360, size: 72 }
            ],
            clearConditions: [
                { type: "edgeAction", key: "an", action: "bounce" },
                { type: "hit", keys: ["an", "hi"] },
                { type: "moveStarted", key: "hi", direction: "up" }
            ],
            hint: "アンに「右に進み続ける」と「はしについたら はねかえる」。ヒーには「ぶつかったら 上にうごきだす」をつけよう。"
        },
        {
            id: "tap_start_collect_stop",
            title: "タップで出発",
            description: "アンをタップして出発させ、どんぐりをひろってから、はしでとまるようにしよう。",
            initialObjects: [
                { key: "an", assetId: "an", x: 170, y: 300, size: 74 },
                { key: "donguri", assetId: "donguri", x: 470, y: 300, size: 62 }
            ],
            clearConditions: [
                { type: "tapAction", key: "an", action: "startMove" },
                { type: "moveStarted", key: "an", direction: "right" },
                { type: "hit", keys: ["an", "donguri"] },
                { type: "hidden", key: "donguri" },
                { type: "edgeAction", key: "an", action: "stopLoops" }
            ],
            hint: "アンに「タップしたら 右にうごきだす」と「はしについたら とまる」。どんぐりに「ぶつかったら きえる」をつけて、再生中にアンをタップしよう。"
        },
        {
            id: "tap_relay_edge_goal",
            title: "タップリレーゴール",
            description: "アンをタップしてヒーへ動かし、ヒーがピッピを動かし、ピッピがはしについたら花丸を出すようにしよう。",
            initialObjects: [
                { key: "an", assetId: "an", x: 150, y: 360, size: 74 },
                { key: "hi", assetId: "hi", x: 390, y: 360, size: 72 },
                { key: "pippi", assetId: "pippi", x: 620, y: 360, size: 102 }
            ],
            clearConditions: [
                { type: "tapAction", key: "an", action: "startMove" },
                { type: "moveStarted", key: "an", direction: "right" },
                { type: "hit", keys: ["an", "hi"] },
                { type: "moveStarted", key: "hi", direction: "right" },
                { type: "hit", keys: ["hi", "pippi"] },
                { type: "moveStarted", key: "pippi", direction: "right" },
                { type: "effectShown", effect: "hanamaru" }
            ],
            hint: "アンに「タップしたら 右にうごきだす」。ヒーとピッピに「ぶつかったら 右にうごきだす」。ピッピには「はしについたら 花丸を出す」もつけよう。"
        }
    ];
})();
