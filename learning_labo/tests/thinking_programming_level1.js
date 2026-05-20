(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    function shuffle(items) {
        const list = [...items];
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }

    function pickFromPool(pool, count) {
        return shuffle(pool).slice(0, count);
    }

    function buildPlan(plan) {
        return plan.flatMap((item) => (
            pickFromPool(item.pool, item.count).map((maker) => maker())
        ));
    }

    function makeMazeCommand(title, prompt, maze, answer) {
        return {
            type: "maze_command",
            title,
            prompt,
            answer,
            programming: {
                type: "maze_command",
                ...maze
            }
        };
    }

    function makeMazeFollow(title, prompt, maze, answer) {
        return {
            type: "maze_follow",
            title,
            prompt,
            promptHtml: `<span class="question-title">${title}</span><span class="simple-equation">${toArrowText(answer)}</span><span class="question-line">${prompt}</span>`,
            answer,
            programming: {
                type: "maze_follow",
                ...maze
            }
        };
    }

    function toArrowText(commands) {
        return commands.split("").map((command) => ({
            U: "↑",
            D: "↓",
            L: "←",
            R: "→"
        }[command])).join(" ");
    }

    function makeSequenceQuestion(title, prompt, orderedItems) {
        return {
            type: "command_order",
            title,
            promptHtml: `<span class="question-title">${title}</span><span class="question-line">${prompt}</span>`,
            answer: "ok",
            programming: {
                type: "command_order",
                items: orderedItems.map((label, index) => ({ label, index }))
            }
        };
    }

    function makeRepeatQuestion(pattern, distractors) {
        const sequence = Array.from({ length: 3 }, () => pattern).flat();
        const answer = pattern.join("");
        const choices = shuffle([pattern, ...distractors]).map((items) => ({
            value: items.join(""),
            labelHtml: items.join("")
        }));
        return {
            type: "repeat_pattern",
            title: "くりかえし発見",
            promptHtml: `<span class="question-title">くりかえし発見</span><span class="programming-emoji-line">${sequence.join("")}</span><span class="question-line">くりかえされている組み合わせはどれ？</span>`,
            choices,
            answer
        };
    }

    function makeMistakeQuestion(sample, mistake, mistakeIndex) {
        return {
            type: "mistake_find",
            title: "まちがいさがし",
            promptHtml: `<span class="question-title">まちがいさがし</span><span class="reading-card"><span class="reading-passage">おてほん: ${sample.join(" → ")}</span><span class="reading-question">ちがうところをタップしよう: ${mistake.join(" → ")}</span></span>`,
            choices: mistake.map((label, index) => ({
                value: String(index),
                labelHtml: `<span class="programming-choice-small">${index + 1}</span>${label}`
            })),
            answer: String(mistakeIndex)
        };
    }

    function makeIfQuestion(rule, today, choices, answer) {
        return {
            type: "if_then_choice",
            title: "もし〜なら",
            promptHtml: `<span class="question-title">もし〜なら</span><span class="reading-card"><span class="reading-passage">${rule}</span><span class="reading-question">${today}</span></span>`,
            choices,
            answer
        };
    }

    function makeIfBuildQuestion(prompt, items) {
        return {
            type: "if_then_build",
            title: "もし〜なら",
            promptHtml: `<span class="question-title">もし〜なら</span><span class="question-line">${prompt}</span>`,
            answer: "ok",
            programming: {
                type: "condition_build",
                items: items.map((label, index) => ({ label, index }))
            }
        };
    }

    const MAZES = [
        {
            width: 4,
            height: 4,
            start: { x: 0, y: 0 },
            goal: { x: 2, y: 2 },
            walls: [{ x: 1, y: 1 }, { x: 3, y: 1 }],
            answer: "RRDD"
        },
        {
            width: 4,
            height: 4,
            start: { x: 0, y: 2 },
            goal: { x: 2, y: 0 },
            walls: [{ x: 1, y: 2 }, { x: 2, y: 2 }],
            answer: "URRU"
        },
        {
            width: 5,
            height: 4,
            start: { x: 1, y: 3 },
            goal: { x: 4, y: 1 },
            walls: [{ x: 2, y: 2 }, { x: 3, y: 2 }],
            answer: "UURRR"
        },
        {
            width: 4,
            height: 4,
            start: { x: 3, y: 3 },
            goal: { x: 0, y: 1 },
            walls: [{ x: 2, y: 2 }, { x: 1, y: 2 }],
            answer: "UULLL"
        },
        {
            width: 5,
            height: 4,
            start: { x: 0, y: 1 },
            goal: { x: 3, y: 3 },
            walls: [{ x: 1, y: 2 }, { x: 2, y: 2 }],
            answer: "RRRDD"
        }
    ];

    const ORDER_QUESTIONS = [
        ["あさのじゅんび", "学校へ行くじゅんばんにタップしよう。", ["おきる", "かおをあらう", "ごはんをたべる", "ランドセルをせおう"]],
        ["てあらい", "手をきれいにするじゅんばんにタップしよう。", ["水を出す", "手をぬらす", "せっけんであらう", "水でながす"]],
        ["おえかき", "絵をかくじゅんばんにタップしよう。", ["紙を出す", "えんぴつを持つ", "線をかく", "色をぬる"]],
        ["はみがき", "歯をみがくじゅんばんにタップしよう。", ["歯ブラシをぬらす", "はみがきこをつける", "歯をみがく", "口をゆすぐ"]],
        ["おふろ", "おふろに入るじゅんばんにタップしよう。", ["服をぬぐ", "体をあらう", "おふろに入る", "体をふく"]],
        ["おべんとう", "おべんとうを食べるじゅんばんにタップしよう。", ["手をあらう", "ふたをあける", "いただきますを言う", "食べる"]]
    ];

    const REPEAT_QUESTIONS = [
        [["🍎", "🍌"], [["🍎"], ["🍌", "🍎"], ["🍎", "🍌", "🍌"]]],
        [["⭐", "🌙", "☁️"], [["⭐", "🌙"], ["🌙", "☁️"], ["⭐", "☁️", "🌙"]]],
        [["🚗", "🚙"], [["🚗"], ["🚙", "🚗"], ["🚗", "🚙", "🚙"]]],
        [["🟦", "🟨", "🟩"], [["🟦", "🟨"], ["🟨", "🟩"], ["🟦", "🟩", "🟨"]]],
        [["🐶", "🐱"], [["🐶"], ["🐱", "🐶"], ["🐶", "🐱", "🐱"]]],
        [["🍙", "🥛", "🍓"], [["🍙", "🥛"], ["🥛", "🍓"], ["🍙", "🍓", "🥛"]]]
    ];

    const MISTAKE_QUESTIONS = [
        [["水を出す", "手をぬらす", "せっけんであらう", "水でながす"], ["水を出す", "手をぬらす", "ごはんをたべる", "水でながす"], 2],
        [["紙を出す", "えんぴつを持つ", "線をかく", "色をぬる"], ["紙を出す", "えんぴつを持つ", "せっけんであらう", "色をぬる"], 2],
        [["くつをはく", "ドアをあける", "外に出る", "ドアをしめる"], ["くつをはく", "ドアをあける", "歯をみがく", "ドアをしめる"], 2],
        [["🍎", "🍌", "🍎", "🍌"], ["🍎", "🍌", "🍇", "🍌"], 2]
    ];

    const IF_CHOICE_QUESTIONS = [
        () => makeIfQuestion("もし雨なら、かさを持つ。", "今日は雨です。何をする？", ["かさを持つ", "サングラスをかける", "水とうをすてる", "くつをぬぐ"], "かさを持つ"),
        () => makeIfQuestion("もし赤いランプなら、止まる。", "ランプは赤です。何をする？", ["止まる", "走る", "ジャンプする", "ねる"], "止まる"),
        () => makeIfQuestion("もし手がよごれたら、手をあらう。", "手がよごれています。何をする？", ["手をあらう", "本を読む", "走る", "ねる"], "手をあらう")
    ];

    const IF_BUILD_QUESTIONS = [
        () => makeIfBuildQuestion("カードをえらんで、条件文を作ろう。", ["もし", "星を見つけたら", "なら", "タップする"]),
        () => makeIfBuildQuestion("カードをえらんで、条件文を作ろう。", ["もし", "ランプが赤", "なら", "止まる"]),
        () => makeIfBuildQuestion("カードをえらんで、条件文を作ろう。", ["もし", "雨がふったら", "なら", "かさを持つ"]),
        () => makeIfBuildQuestion("カードをえらんで、条件文を作ろう。", ["もし", "手がよごれたら", "なら", "手をあらう"])
    ];

    const PLAN = [
        {
            count: 3,
            pool: MAZES.map((maze) => () => makeMazeCommand(
                    "めいろ命令指示",
                    "ロボットが星まで行く命令を作って、じっこうしよう。",
                    maze,
                    maze.answer
                ))
        },
        {
            count: 3,
            pool: MAZES.map((maze) => () => makeMazeFollow(
                    "めいろ命令動かす",
                    "上の命令と同じ順に、ロボットのとなりのマスをタップしよう。",
                    maze,
                    maze.answer
                ))
        },
        {
            count: 4,
            pool: ORDER_QUESTIONS.map(([title, prompt, items]) => () => makeSequenceQuestion(title, prompt, items))
        },
        {
            count: 4,
            pool: REPEAT_QUESTIONS.map(([pattern, distractors]) => () => makeRepeatQuestion(pattern, distractors))
        },
        {
            count: 2,
            pool: MISTAKE_QUESTIONS.map(([sample, mistake, mistakeIndex]) => () => makeMistakeQuestion(sample, mistake, mistakeIndex))
        },
        {
            count: 2,
            pool: IF_CHOICE_QUESTIONS
        },
        {
            count: 2,
            pool: IF_BUILD_QUESTIONS
        }
    ];

    window.LearningLaboTests.thinking_programming_level1 = {
        createQuestions(count) {
            return buildPlan(PLAN).slice(0, count);
        }
    };
})();
