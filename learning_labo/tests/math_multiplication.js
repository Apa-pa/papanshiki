(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function makeChoices(answer) {
        const choices = new Set([String(answer)]);
        while (choices.size < 4) {
            const diff = randomInt(-12, 12);
            const value = answer + diff;
            if (diff !== 0 && value > 0) choices.add(String(value));
        }
        return Array.from(choices);
    }

    window.LearningLaboTests.math_multiplication = {
        createQuestions(count) {
            return Array.from({ length: count }, () => {
                const a = randomInt(2, 9);
                const b = randomInt(2, 9);
                const answer = a * b;
                return {
                    prompt: `${a} × ${b} = ?`,
                    answer: String(answer),
                    choices: makeChoices(answer)
                };
            });
        }
    };
})();
