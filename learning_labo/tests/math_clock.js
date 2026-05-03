(function () {
    window.LearningLaboTests = window.LearningLaboTests || {};

    const PLAN = [
        { count: 2, maker: makeHourQuestion },
        { count: 2, maker: makeHalfHourQuestion },
        { count: 2, maker: makeFiveMinuteQuestion },
        { count: 2, maker: makeMinuteQuestion },
        { count: 2, maker: makeHoursLaterQuestion },
        { count: 1, maker: makeHoursLaterWrapQuestion },
        { count: 1, maker: makeHoursEarlierQuestion },
        { count: 1, maker: makeHoursEarlierWrapQuestion },
        { count: 2, maker: makeMinutesLaterQuestion },
        { count: 1, maker: makeMinutesLaterWrapQuestion },
        { count: 1, maker: makeMinutesEarlierQuestion },
        { count: 1, maker: makeMinutesEarlierWrapQuestion },
        { count: 2, maker: makeHourAndHalfLaterQuestion }
    ];

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function padMinute(minute) {
        return String(minute).padStart(2, "0");
    }

    function toClockParts(totalMinutes) {
        const normalized = ((totalMinutes % 720) + 720) % 720;
        const hour24 = Math.floor(normalized / 60);
        const minute = normalized % 60;
        const hour = hour24 === 0 ? 12 : hour24;
        return { hour, minute };
    }

    function addMinutes(hour, minute, deltaMinutes) {
        return toClockParts(((hour % 12) * 60) + minute + deltaMinutes);
    }

    function createClockScene(hour, minute, storyHtml) {
        return `<span class="clock-scene">${makeClockFace(hour, minute)}${storyHtml ? `<span class="clock-story">${storyHtml}</span>` : ""}</span>`;
    }

    function makeClockFace(hour, minute) {
        const hourAngle = (hour % 12) * 30 + (minute / 60) * 30;
        const minuteAngle = minute * 6;
        const marks = Array.from({ length: 12 }, (_, index) => {
            const angle = `${index * 30}deg`;
            return `<span class="clock-mark major" style="--angle:${angle}"></span>`;
        }).join("") + Array.from({ length: 60 }, (_, index) => {
            if (index % 5 === 0) return "";
            return `<span class="clock-mark" style="--angle:${index * 6}deg"></span>`;
        }).join("");
        return `
            <span class="clock-face" aria-hidden="true">
                ${marks}
                <span class="clock-hand hour" style="--angle:${hourAngle}deg"></span>
                <span class="clock-hand minute" style="--angle:${minuteAngle}deg"></span>
            </span>
        `;
    }

    function makeClockQuestion(type, title, promptHtml, answerHour, answerMinute) {
        return {
            type,
            title,
            promptHtml,
            answerHour,
            answerMinute,
            inputMode: "clock"
        };
    }

    function makeHourQuestion() {
        const hour = randomInt(1, 12);
        return makeClockQuestion(
            "clock_hour",
            "なんじ",
            createClockScene(hour, 0, "<ruby>何時<rt>なんじ</rt></ruby>？"),
            hour,
            0
        );
    }

    function makeHalfHourQuestion() {
        const hour = randomInt(1, 12);
        return makeClockQuestion(
            "clock_half_hour",
            "なんじはん",
            createClockScene(hour, 30, "<ruby>何時半<rt>なんじはん</rt></ruby>？"),
            hour,
            30
        );
    }

    function makeFiveMinuteQuestion() {
        const hour = randomInt(1, 12);
        const minute = [5, 10, 15, 20, 25, 35, 40, 45, 50, 55][randomInt(0, 9)];
        return makeClockQuestion(
            "clock_five_minute",
            "なんじなんぷん",
            createClockScene(hour, minute, "<ruby>何時何分<rt>なんじなんぷん</rt></ruby>？"),
            hour,
            minute
        );
    }

    function makeMinuteQuestion() {
        const hour = randomInt(1, 12);
        const minute = [1, 4, 7, 12, 18, 23, 26, 32, 38, 44, 47, 53, 58][randomInt(0, 12)];
        return makeClockQuestion(
            "clock_minute",
            "なんじなんぷん",
            createClockScene(hour, minute, "<ruby>何時何分<rt>なんじなんぷん</rt></ruby>？"),
            hour,
            minute
        );
    }

    function makeHoursLaterQuestion() {
        const startHour = randomInt(1, 9);
        const deltaHours = randomInt(1, 3);
        const answer = addMinutes(startHour, 0, deltaHours * 60);
        return makeClockQuestion(
            "clock_hours_later",
            "〇時間後",
            createClockScene(startHour, 0, `${startHour}<ruby>時<rt>じ</rt></ruby>の ${deltaHours}<ruby>時間後<rt>じかんご</rt></ruby> は？`),
            answer.hour,
            answer.minute
        );
    }

    function makeHoursLaterWrapQuestion() {
        const startHour = randomInt(10, 11);
        const deltaHours = randomInt(2, 3);
        const answer = addMinutes(startHour, 0, deltaHours * 60);
        return makeClockQuestion(
            "clock_hours_later_wrap",
            "〇時間後",
            createClockScene(startHour, 0, `${startHour}<ruby>時<rt>じ</rt></ruby>の ${deltaHours}<ruby>時間後<rt>じかんご</rt></ruby> は？`),
            answer.hour,
            answer.minute
        );
    }

    function makeHoursEarlierQuestion() {
        const startHour = randomInt(4, 11);
        const deltaHours = randomInt(1, 3);
        const answer = addMinutes(startHour, 0, deltaHours * -60);
        return makeClockQuestion(
            "clock_hours_earlier",
            "〇時間前",
            createClockScene(startHour, 0, `${startHour}<ruby>時<rt>じ</rt></ruby>の ${deltaHours}<ruby>時間前<rt>じかんまえ</rt></ruby> は？`),
            answer.hour,
            answer.minute
        );
    }

    function makeHoursEarlierWrapQuestion() {
        const startHour = randomInt(1, 2);
        const deltaHours = randomInt(2, 3);
        const answer = addMinutes(startHour, 0, deltaHours * -60);
        return makeClockQuestion(
            "clock_hours_earlier_wrap",
            "〇時間前",
            createClockScene(startHour, 0, `${startHour}<ruby>時<rt>じ</rt></ruby>の ${deltaHours}<ruby>時間前<rt>じかんまえ</rt></ruby> は？`),
            answer.hour,
            answer.minute
        );
    }

    function makeMinutesLaterQuestion() {
        const startHour = randomInt(1, 10);
        const startMinute = [0, 5, 10, 15, 20, 25, 30, 35][randomInt(0, 7)];
        const deltaMinutes = [5, 10, 15, 20][randomInt(0, 3)];
        const answer = addMinutes(startHour, startMinute, deltaMinutes);
        return makeClockQuestion(
            "clock_minutes_later",
            "〇分後",
            createClockScene(startHour, startMinute, `${startHour}<ruby>時<rt>じ</rt></ruby>${padMinute(startMinute)}<ruby>分<rt>ふん</rt></ruby>の ${deltaMinutes}<ruby>分後<rt>ふんご</rt></ruby> は？`),
            answer.hour,
            answer.minute
        );
    }

    function makeMinutesLaterWrapQuestion() {
        const startHour = randomInt(2, 10);
        const startMinute = [45, 50, 55][randomInt(0, 2)];
        const deltaMinutes = [10, 15][randomInt(0, 1)];
        const answer = addMinutes(startHour, startMinute, deltaMinutes);
        return makeClockQuestion(
            "clock_minutes_later_wrap",
            "〇分後",
            createClockScene(startHour, startMinute, `${startHour}<ruby>時<rt>じ</rt></ruby>${padMinute(startMinute)}<ruby>分<rt>ふん</rt></ruby>の ${deltaMinutes}<ruby>分後<rt>ふんご</rt></ruby> は？`),
            answer.hour,
            answer.minute
        );
    }

    function makeMinutesEarlierQuestion() {
        const startHour = randomInt(2, 11);
        const startMinute = [20, 25, 30, 35, 40, 45][randomInt(0, 5)];
        const deltaMinutes = [5, 10, 15][randomInt(0, 2)];
        const answer = addMinutes(startHour, startMinute, deltaMinutes * -1);
        return makeClockQuestion(
            "clock_minutes_earlier",
            "〇分前",
            createClockScene(startHour, startMinute, `${startHour}<ruby>時<rt>じ</rt></ruby>${padMinute(startMinute)}<ruby>分<rt>ふん</rt></ruby>の ${deltaMinutes}<ruby>分前<rt>ふんまえ</rt></ruby> は？`),
            answer.hour,
            answer.minute
        );
    }

    function makeMinutesEarlierWrapQuestion() {
        const startHour = randomInt(2, 11);
        const startMinute = [0, 5, 10][randomInt(0, 2)];
        const deltaMinutes = [10, 15][randomInt(0, 1)];
        const answer = addMinutes(startHour, startMinute, deltaMinutes * -1);
        return makeClockQuestion(
            "clock_minutes_earlier_wrap",
            "〇分前",
            createClockScene(startHour, startMinute, `${startHour}<ruby>時<rt>じ</rt></ruby>${padMinute(startMinute)}<ruby>分<rt>ふん</rt></ruby>の ${deltaMinutes}<ruby>分前<rt>ふんまえ</rt></ruby> は？`),
            answer.hour,
            answer.minute
        );
    }

    function makeHourAndHalfLaterQuestion() {
        const startHour = randomInt(1, 10);
        const startMinute = [0, 30][randomInt(0, 1)];
        const answer = addMinutes(startHour, startMinute, 90);
        return makeClockQuestion(
            "clock_hour_and_half_later",
            "〇時間30分後",
            createClockScene(startHour, startMinute, `${startHour}<ruby>時<rt>じ</rt></ruby>${padMinute(startMinute)}<ruby>分<rt>ふん</rt></ruby>の 1<ruby>時間<rt>じかん</rt></ruby>30<ruby>分後<rt>ぷんご</rt></ruby> は？`),
            answer.hour,
            answer.minute
        );
    }

    window.LearningLaboTests.math_clock = {
        createQuestions(count) {
            const questions = PLAN.flatMap((item) => (
                Array.from({ length: item.count }, () => item.maker())
            ));
            return questions.slice(0, count);
        }
    };
})();
