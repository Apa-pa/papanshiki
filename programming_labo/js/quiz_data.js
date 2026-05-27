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
        }
    ];
})();
