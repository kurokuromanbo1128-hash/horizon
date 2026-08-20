"use strict";

/* ==================================================
   Horizon 1.0
   Part 1: Data / DOM / Common UI
================================================== */


/* ===== Basic State ===== */

let altitude =
Number(localStorage.getItem("altitude")) || 0;

let xp =
Number(localStorage.getItem("xp")) || 0;

let currentPracticeIndex = 0;

/* ===== Date Helper ===== */

function getTodayKey(){

    return new Date().toLocaleDateString();

}


/* ===== DOM Elements ===== */

const altitudeText =
document.getElementById("altitude");

const xpText =
document.getElementById("xpText");

const rankText =
document.getElementById("rank");

const nextRankText =
document.getElementById("nextRank");

const progressFill =
document.getElementById("progress-fill");

const streakText =
document.getElementById("streak");

const bestStreakText =
document.getElementById("bestStreak");

const messageText =
document.getElementById("message");

const spokenCheck =
document.getElementById("spokenCheck");

const morningBtn =
document.getElementById("morningBtn");

const listenBtn =
document.getElementById("listenBtn");

const speakBtn =
document.getElementById("speakBtn");

const prevEnglishBtn =
document.getElementById("prevEnglishBtn");

const nextEnglishBtn =
document.getElementById("nextEnglishBtn");

const speechResult =
document.getElementById("speechResult");

const resetBtn =
document.getElementById("resetBtn");

const historyDiv =
document.getElementById("history");

const achievementsDiv =
document.getElementById("achievements");

const achievementToast =
document.getElementById("achievementToast");

const hero =
document.querySelector(".hero");

const englishSentence =
document.getElementById("englishSentence");

const englishCategory =
document.getElementById("englishCategory");

const phraseProgress =
document.getElementById("phraseProgress");

const practiceMode =
document.getElementById("practiceMode");

const japaneseSentence =
document.getElementById("japaneseSentence");

const horizonThought =
document.getElementById("horizonThought");

/* ===== Night Talk ===== */

const nightQuestion =
document.getElementById("nightQuestion");

const nightSpeakBtn =
document.getElementById("nightSpeakBtn");

const nightSpeechResult =
document.getElementById("nightSpeechResult");

const nightProgress =
document.getElementById("nightProgress");

const nightSummary =
document.getElementById("nightSummary");

const nextNightBtn =
document.getElementById("nextNightBtn");



/* ===== Daily English Data moved to english.js ===== */


/* ==================================================
   Common State Functions
================================================== */


/* ===== Morning Button ===== */

function updateMorningButton(){

    morningBtn.disabled =
    !spokenCheck.checked;

}


/* ===== Spoken Status ===== */

function setSpokenStatus(isCompleted){

    spokenCheck.checked =
    isCompleted;

    localStorage.setItem(
        "spokenChecked",
        String(isCompleted)
    );

    if(isCompleted){

        localStorage.setItem(
            "spokenDate",
            getTodayKey()
        );

    }

    updateMorningButton();

}


/* ===== Restore Today's Spoken Status ===== */

function restoreSpokenStatus(){

    const today =
    getTodayKey();

    const spokenDate =
    localStorage.getItem("spokenDate");

    const savedSpoken =
    localStorage.getItem("spokenChecked");

    const completedToday =
    spokenDate === today &&
    savedSpoken === "true";

    spokenCheck.checked =
    completedToday;

    if(!completedToday){

        localStorage.setItem(
            "spokenChecked",
            "false"
        );

    }

    updateMorningButton();

}


/* ===== Text Normalization ===== */

function normalizeEnglish(text){

    return text
    .toLowerCase()
    .replace(/[.,!?'"’]/g, "")
    .replace(/\s+/g, " ")
    .trim();

}


/* ===== Toast ===== */

function showAchievementToast(
    message,
    type = "info"
){

    achievementToast.textContent =
    message;

    achievementToast.className = "";

    achievementToast.classList.add(
        "show",
        type
    );

    window.setTimeout(() => {

        achievementToast.className = "";

    }, 2500);

}


/* ==================================================
   Rank / Mountain UI
================================================== */

function updateRank(){

    let rank =
    "🥾 Trailhead";

    let nextRank =
    "🌲 Forest";

    let remaining =
    500 - altitude;


    if(altitude >= 3000){

        rank =
        "🏔️ Summit";

        nextRank =
        "Completed";

        remaining = 0;

    }
    else if(altitude >= 2000){

        rank =
        "❄️ Snowfield";

        nextRank =
        "🏔️ Summit";

        remaining =
        3000 - altitude;

    }
    else if(altitude >= 1000){

        rank =
        "⛰️ Ridge";

        nextRank =
        "❄️ Snowfield";

        remaining =
        2000 - altitude;

    }
    else if(altitude >= 500){

        rank =
        "🌲 Forest";

        nextRank =
        "⛰️ Ridge";

        remaining =
        1000 - altitude;

    }


    rankText.textContent =
    rank;

    if(nextRank === "Completed"){

        nextRankText.textContent =
        "Journey Completed";

    }
    else{

        nextRankText.textContent =
        `Next Rank: ${nextRank} ` +
        `(${remaining}m remaining)`;

    }


    let progress = 0;

    if(altitude < 500){

        progress =
        altitude / 500 * 100;

    }
    else if(altitude < 1000){

        progress =
        (altitude - 500) /
        500 * 100;

    }
    else if(altitude < 2000){

        progress =
        (altitude - 1000) /
        1000 * 100;

    }
    else if(altitude < 3000){

        progress =
        (altitude - 2000) /
        1000 * 100;

    }
    else{

        progress = 100;

    }

    progressFill.style.width =
    `${Math.min(progress, 100)}%`;


    document
    .querySelectorAll(
        "#mountainPath span"
    )
    .forEach((step) => {

        step.classList.remove(
            "active-step"
        );

    });


    let activeStep = "step1";

    if(altitude >= 3000){

        activeStep = "step5";

    }
    else if(altitude >= 2000){

        activeStep = "step4";

    }
    else if(altitude >= 1000){

        activeStep = "step3";

    }
    else if(altitude >= 500){

        activeStep = "step2";

    }

    document
    .getElementById(activeStep)
    .classList.add("active-step");


    hero.classList.remove(
        "trailhead",
        "forest",
        "ridge",
        "snowfield",
        "summit"
    );


    if(altitude >= 3000){

        hero.classList.add("summit");

    }
    else if(altitude >= 2000){

        hero.classList.add(
            "snowfield"
        );

    }
    else if(altitude >= 1000){

        hero.classList.add("ridge");

    }
    else if(altitude >= 500){

        hero.classList.add("forest");

    }
    else{

        hero.classList.add(
            "trailhead"
        );

    }

}


/* ===== Journey Message ===== */

function updateMessage(){

    let message =
    "Your journey continues.";


    if(altitude >= 3000){

        message =
        "You reached the summit. 🏔️";

    }
    else if(altitude >= 2000){

        message =
        "You're walking through " +
        "the snowfield now.";

    }
    else if(altitude >= 1000){

        message =
        "The ridge is getting closer.";

    }
    else if(altitude >= 500){

        message =
        "You've entered the forest. " +
        "Keep going.";

    }


    messageText.textContent =
    message;

}


/* ==================================================
   Daily English
================================================== */

function getPracticeEnglish(){

    const selectedCategory =
    practiceMode.value;

    return dailyEnglish.filter(
        (item) =>
        item.category === selectedCategory
    );

}

function getDailyEnglishIndex(practiceEnglish){

    const today =
    getTodayKey();

    const selectedCategory =
    practiceMode.value;

    const savedDate =
    localStorage.getItem(
        "englishDate"
    );

    const savedCategory =
    localStorage.getItem(
        "englishCategoryMode"
    );

    const savedIndex =
    Number(
        localStorage.getItem(
            "englishIndex"
        )
    );

    const validSavedIndex =
    Number.isInteger(savedIndex) &&
    savedIndex >= 0 &&
    savedIndex < practiceEnglish.length;

    if(
        savedDate === today &&
        savedCategory === selectedCategory &&
        validSavedIndex
    ){

        return savedIndex;

    }

    const newIndex =
    Math.floor(
        Math.random() *
        practiceEnglish.length
    );

    localStorage.setItem(
        "englishDate",
        today
    );

    localStorage.setItem(
        "englishCategoryMode",
        selectedCategory
    );

    localStorage.setItem(
        "englishIndex",
        String(newIndex)
    );

    return newIndex;

}


function updateDailyEnglish(){

    const practiceEnglish =
    getPracticeEnglish();

    if(practiceEnglish.length === 0){

        return;

    }

    const index =
    getDailyEnglishIndex(
        practiceEnglish
    );

    currentPracticeIndex = index;

    const item =
    practiceEnglish[index];

    phraseProgress.textContent =
`${index + 1} / ${practiceEnglish.length}`;

    englishSentence.textContent =
    item.text;

    englishCategory.textContent =
    `📂 ${item.category}`;

    japaneseSentence.textContent =
    item.japanese;

    horizonThought.textContent =
    item.thought;

}

/* ===== Next Phrase ===== */


function showNextEnglish(){

    const practiceEnglish =
    getPracticeEnglish();

    if(practiceEnglish.length === 0){

        return;

    }

    currentPracticeIndex++;

    if(
        currentPracticeIndex >=
        practiceEnglish.length
    ){

        currentPracticeIndex = 0;

    }

    const item =
    practiceEnglish[currentPracticeIndex];

    phraseProgress.textContent =
`${currentPracticeIndex + 1} / ${practiceEnglish.length}`;

    englishSentence.textContent =
    item.text;

    englishCategory.textContent =
    `📂 ${item.category}`;

    japaneseSentence.textContent =
    item.japanese;

    horizonThought.textContent =
    item.thought;

    speechResult.textContent =
    "🎤 You said:";

    setSpokenStatus(false);

}

function showPreviousEnglish(){

    const practiceEnglish =
    getPracticeEnglish();

    if(practiceEnglish.length === 0){

        return;

    }

    currentPracticeIndex--;

    if(currentPracticeIndex < 0){

        currentPracticeIndex =
        practiceEnglish.length - 1;

    }

    const item =
    practiceEnglish[currentPracticeIndex];

    phraseProgress.textContent =
    `${currentPracticeIndex + 1} / ${practiceEnglish.length}`;

    englishSentence.textContent =
    item.text;

    englishCategory.textContent =
    `📂 ${item.category}`;

    japaneseSentence.textContent =
    item.japanese;

    horizonThought.textContent =
    item.thought;

    speechResult.textContent =
    "🎤 You said:";

    setSpokenStatus(false);

}
/* ==================================================
   XP
================================================== */

function updateXP(){

    xpText.textContent =
    `⭐ XP : ${xp}`;

}

/* ==================================================
   Speech Synthesis
================================================== */

function createEnglishUtterance(text){

    const utterance =
    new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 0.85;

    const voices =
    window.speechSynthesis.getVoices();

    const englishVoice =
    voices.find((voice) => {

        return voice.lang
        .toLowerCase()
        .startsWith("en");

    });

    if(englishVoice){

        utterance.voice =
        englishVoice;

    }

    return utterance;

}


function speakEnglish(){

    const text =
    englishSentence.textContent.trim();

    if(text === ""){

        return;

    }

    window.speechSynthesis.cancel();


    const first =
    createEnglishUtterance(text);

    const second =
    createEnglishUtterance(text);


    first.onend = () => {

        window.setTimeout(() => {

            window.speechSynthesis.speak(
                second
            );

        }, 700);

    };


    window.speechSynthesis.speak(first);

}


/* ==================================================
   Speech Recognition
================================================== */

function getSpeechRecognitionClass(){

    return (
        window.SpeechRecognition ||
        window.webkitSpeechRecognition
    );

}


function speakPractice(){

    const SpeechRecognition =
    getSpeechRecognitionClass();


    if(!SpeechRecognition){

        speechResult.textContent =
        "❌ Speech recognition is " +
        "not supported in this browser.";

        return;

    }


    const recognition =
    new SpeechRecognition();


    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;


    recognition.onstart = () => {

        speechResult.textContent =
        "🎤 Listening...";

        speakBtn.disabled = true;

    };


    recognition.onresult = (event) => {

        const result =
        event.results[0][0]
        .transcript
        .trim();


        speechResult.textContent =
        `🎤 You said: ${result}`;


        const spoken =
        normalizeEnglish(result);

        const target =
        normalizeEnglish(
            englishSentence.textContent
        );


        if(spoken === target){

            setSpokenStatus(true);

            showAchievementToast(
                "Perfect! 🌄",
                "achievement"
            );

        }
        else{

            showAchievementToast(
                "Almost! Try once more. 🎤",
                "info"
            );

        }

    };


    recognition.onerror = (event) => {

        recognition.onerror = (event) => {

    console.log(event);

    speechResult.textContent =
    "❌ Error: " + event.error;

};

    };


    recognition.onend = () => {

        speakBtn.disabled = false;

    };


    recognition.start();

}


/* ==================================================
   Streak
================================================== */

function updateStreak(){

    const streak =
    Number(
        localStorage.getItem("streak")
    ) || 0;


    streakText.textContent =
    `🔥 ${streak} Days`;

}


function updateBestStreak(){

    const bestStreak =
    Number(
        localStorage.getItem(
            "bestStreak"
        )
    ) || 0;


    bestStreakText.textContent =
    `⭐ Best: ${bestStreak} Days`;

}


function getYesterdayKey(){

    const yesterday =
    new Date();

    yesterday.setDate(
        yesterday.getDate() - 1
    );

    return yesterday
    .toLocaleDateString();

}


function recordActivity(){

    const today =
    getTodayKey();

    const yesterday =
    getYesterdayKey();

    const lastActive =
    localStorage.getItem(
        "lastActive"
    );


    if(lastActive === today){

        updateStreak();
        updateBestStreak();

        return;

    }


    let streak =
    Number(
        localStorage.getItem("streak")
    ) || 0;


    if(lastActive === yesterday){

        streak += 1;

    }
    else{

        streak = 1;

    }


    localStorage.setItem(
        "streak",
        String(streak)
    );

    localStorage.setItem(
        "lastActive",
        today
    );


    const currentBest =
    Number(
        localStorage.getItem(
            "bestStreak"
        )
    ) || 0;


    if(streak > currentBest){

        localStorage.setItem(
            "bestStreak",
            String(streak)
        );

    }


    updateStreak();
    updateBestStreak();

}


/* ==================================================
   Achievements
================================================== */

const achievements = [

    {
        altitude: 100,
        label:
        "🥾 First Step (100m)"
    },

    {
        altitude: 500,
        label:
        "🌲 Forest Walker (500m)"
    },

    {
        altitude: 1000,
        label:
        "⛰️ Ridge Explorer (1000m)"
    },

    {
        altitude: 2000,
        label:
        "❄️ Snowfield Adventurer (2000m)"
    },

    {
        altitude: 3000,
        label:
        "🏔️ Summit Master (3000m)"
    }

];


function updateAchievements(){

    achievementsDiv.innerHTML =
    achievements
    .map((achievement) => {

        const unlocked =
        altitude >= achievement.altitude;

        const icon =
        unlocked ? "✅" : "⬜";

        return (
            `${icon} ${achievement.label}`
        );

    })
    .join("<br>");

}


const achievementToasts = [

    {
        altitude: 3000,
        key: "achievement3000",
        message:
        "🏆 Achievement Unlocked!\n" +
        "🏔️ Summit Master"
    },

    {
        altitude: 2000,
        key: "achievement2000",
        message:
        "🏆 Achievement Unlocked!\n" +
        "❄️ Snowfield Adventurer"
    },

    {
        altitude: 1000,
        key: "achievement1000",
        message:
        "🏆 Achievement Unlocked!\n" +
        "⛰️ Ridge Explorer"
    },

    {
        altitude: 500,
        key: "achievement500",
        message:
        "🏆 Achievement Unlocked!\n" +
        "🌲 Forest Walker"
    },

    {
        altitude: 100,
        key: "achievement100",
        message:
        "🏆 Achievement Unlocked!\n" +
        "🥾 First Step"
    }

];


const rankToasts = [

    {
        altitude: 3000,
        key: "rankSummit",
        message:
        "🏔️ You reached the Summit."
    },

    {
        altitude: 2000,
        key: "rankSnowfield",
        message:
        "❄️ You stepped into " +
        "the Snowfield."
    },

    {
        altitude: 1000,
        key: "rankRidge",
        message:
        "⛰️ You reached the Ridge."
    },

    {
        altitude: 500,
        key: "rankForest",
        message:
        "🌲 You entered the Forest."
    }

];


function showFirstUnlockedItem(items){

    const item =
    items.find((candidate) => {

        return (
            altitude >=
            candidate.altitude &&
            !localStorage.getItem(
                candidate.key
            )
        );

    });


    if(!item){

        return false;

    }


    localStorage.setItem(
        item.key,
        "true"
    );

    showAchievementToast(
        item.message,
        "achievement"
    );


    return true;

}


function checkAchievements(){

    const rankWasShown =
    showFirstUnlockedItem(
        rankToasts
    );


    if(rankWasShown){

        return;

    }


    showFirstUnlockedItem(
        achievementToasts
    );

}


/* ==================================================
   Trail Log
================================================== */

function getJournalEntries(){

    try{

        const entries =
        JSON.parse(
            localStorage.getItem(
                "entries"
            )
        );

        return Array.isArray(entries)
        ? entries
        : [];

    }
    catch(error){

        console.error(
            "Could not load entries:",
            error
        );

        return [];

    }

}


function saveJournalEntries(entries){

    localStorage.setItem(
        "entries",
        JSON.stringify(entries)
    );

}


function escapeHtml(value){

    const div =
    document.createElement("div");

    div.textContent =
    String(value ?? "");

    return div.innerHTML;

}


function loadHistory(){

    const entries =
    getJournalEntries();


    if(entries.length === 0){

        historyDiv.innerHTML = `
            <div class="log-card">
                <div class="log-text">
                    No entries yet.
                </div>
            </div>
        `;

        return;

    }


    historyDiv.innerHTML =
    entries
    .map((entry, index) => {

        const latestBadge =
        index === 0
        ? `
            <div class="latest-badge">
                Latest
            </div>
        `
        : "";


        const latestClass =
        index === 0
        ? "latest"
        : "";


        const date =
        escapeHtml(entry.date);

        const entryAltitude =
        Number(entry.altitude) || 0;

        const text =
        escapeHtml(entry.text);


        return `
            <div class=
            "log-card ${latestClass}">

                ${latestBadge}

                <div class="log-header">

                    <div class="log-date">
                        ${date}
                    </div>

                    <div class="log-altitude">
                        ⛰️ ${entryAltitude}m
                    </div>

                </div>

                <div class="log-text">
                    ${text}
                </div>

            </div>
        `;

    })
    .join("");

}
/* ==================================================
   Morning Step
================================================== */

function morningStep(){

    const today =
    getTodayKey();


    if(!spokenCheck.checked){

        showAchievementToast(
            "Please speak today's English first. 🌄",
            "info"
        );

        return;

    }


    const lastMorning =
    localStorage.getItem(
        "lastMorning"
    );


    if(lastMorning === today){

        showAchievementToast(
            "You've already taken today's step. 🌄",
            "info"
        );

        return;

    }


    altitude += 10;

xp += 10;

localStorage.setItem(
    "xp",
    String(xp)
);

updateXP();

localStorage.setItem(
    "altitude",
    String(altitude)
);


    localStorage.setItem(
        "altitude",
        String(altitude)
    );

    localStorage.setItem(
        "lastMorning",
        today
    );

    localStorage.setItem(
        "lastSpoken",
        today
    );


    altitudeText.textContent =
    `${altitude}m`;


    updateRank();
    updateMessage();
    updateAchievements();
    checkAchievements();
    recordActivity();


    showAchievementToast(
        "🌄 One step completed!\nAltitude +10m",
        "achievement"
    );

}


/* ==================================================
   Night Talk
================================================== */

const nightQuestions = [

    "今日、何をした？",

    "今日はどうだった？",

    "明日は何をする？"

];

let currentNightQuestion = 0;

let nightAnswers = [
    "",
    "",
    ""
];

function updateNightQuestion(){

    nightQuestion.textContent =
    nightQuestions[currentNightQuestion];

    nightProgress.textContent =
    `${currentNightQuestion + 1} / ${nightQuestions.length}`;

    nightSpeechResult.textContent =
    "🎤 You said:";

}

function showNextNightQuestion(){

    currentNightQuestion++;

    if(currentNightQuestion >= nightQuestions.length){

        currentNightQuestion = 0;

    }

    updateNightQuestion();

}

function speakNightAnswer(){

    const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

    if(!SpeechRecognition){

        nightSpeechResult.textContent =
        "❌ Speech recognition is not supported.";

        return;

    }

    const recognition =
    new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {

        nightSpeechResult.textContent =
        "🎤 Listening...";

        nightSpeakBtn.disabled = true;

    };

    recognition.onresult = (event) => {

        const result =
        event.results[0][0].transcript.trim();

        nightAnswers[currentNightQuestion] = result;

        nightSpeechResult.textContent =
        "🎤 You said: " + result;

        if(currentNightQuestion === nightQuestions.length - 1){

    showNightSummary();

    completeNightTalk();
    
}

    };

    recognition.onerror = (event) => {

        nightSpeechResult.textContent =
        "❌ Error: " + event.error;

    };

    recognition.onend = () => {

        nightSpeakBtn.disabled = false;

    };

    recognition.start();

}

function showNightSummary(){

    nightSummary.innerHTML =
    "<h3>🌙 Tonight's Talk</h3>" +
    "<p>1. " + nightAnswers[0] + "</p>" +
    "<p>2. " + nightAnswers[1] + "</p>" +
    "<p>3. " + nightAnswers[2] + "</p>";

}

function completeNightTalk(){

    const today =
    getTodayKey();

    const lastNightTalk =
    localStorage.getItem(
        "lastNightTalk"
    );

    if(lastNightTalk === today){

        showAchievementToast(
            "Today's Night Talk is already complete. 🌙",
            "info"
        );

        return;

    }

    altitude += 10;

    localStorage.setItem(
        "lastNightTalk",
        today
    );

    localStorage.setItem(
        "altitude",
        String(altitude)
    );

    altitudeText.textContent =
    `${altitude}m`;

    updateRank();
    updateMessage();
    updateAchievements();
    checkAchievements();
    recordActivity();

    showAchievementToast(
        "🌙 Night Talk Complete!\nAltitude +10m",
        "achievement"
    );

}
/* ==================================================
   Reset Journey
================================================== */

function resetJourney(){

    const confirmed =
    window.confirm(
        "Reset all progress and start from 0m?"
    );


    if(!confirmed){

        return;

    }


    const keysToRemove = [

        "altitude",
        "entries",

        "streak",
        "bestStreak",
        "lastActive",

        "lastMorning",
        "lastJournal",
        "lastSpoken",

        "spokenChecked",
        "spokenDate",

        "englishDate",
        "englishIndex",

        "achievement100",
        "achievement500",
        "achievement1000",
        "achievement2000",
        "achievement3000",

        "rankForest",
        "rankRidge",
        "rankSnowfield",
        "rankSummit"

    ];


    keysToRemove.forEach((key) => {

        localStorage.removeItem(key);

    });


    altitude = 0;


    altitudeText.textContent =
    "0m";

    journal.value = "";

    speechResult.textContent =
    "🎤 You said:";


    setSpokenStatus(false);

    updateDailyEnglish();
    updateRank();
    updateMessage();
    updateStreak();
    updateBestStreak();
    updateAchievements();
    loadHistory();


    showAchievementToast(
        "Journey has been reset. 🌱",
        "info"
    );

}


/* ==================================================
   Manual Spoken Check
================================================== */

function handleSpokenCheckChange(){

    const isCompleted =
    spokenCheck.checked;


    setSpokenStatus(
        isCompleted
    );


    if(isCompleted){

        showAchievementToast(
            "Good job! 🌄\n" +
            "You spoke today's English.",
            "achievement"
        );

    }

}


/* ==================================================
   Event Listeners
================================================== */

function registerEventListeners(){

    morningBtn.addEventListener(
        "click",
        morningStep
    );

        resetBtn.addEventListener(
        "click",
        resetJourney
    );

    listenBtn.addEventListener(
        "click",
        speakEnglish
    );

    speakBtn.addEventListener(
        "click",
        speakPractice
    );

    prevEnglishBtn.addEventListener(
    "click",
    showPreviousEnglish
);

    nextEnglishBtn.addEventListener(
        "click",
        showNextEnglish
    );

    spokenCheck.addEventListener(
        "change",
        handleSpokenCheckChange
    );

    nightSpeakBtn.addEventListener(
    "click",
    speakNightAnswer
);

    nextNightBtn.addEventListener(
    "click",
    showNextNightQuestion
);

    practiceMode.addEventListener(
        "change",
        () => {

            updateDailyEnglish();

            speechResult.textContent =
            "🎤 You said:";

            setSpokenStatus(false);

        }
    );

}


/* ==================================================
   Service Worker
================================================== */

function registerServiceWorker(){

    if(
        !("serviceWorker" in navigator)
    ){

        return;

    }


    window.addEventListener(
        "load",
        () => {

            navigator
            .serviceWorker
            .register(
                "./service-worker.js"
            )
            .then(() => {

                console.log(
                    "Service Worker Registered"
                );

            })
            .catch((error) => {

                console.error(
                    "Service Worker Error:",
                    error
                );

            });

        }
    );

}


/* ==================================================
   Application Start
================================================== */

function initializeApp(){

    altitudeText.textContent =
    `${altitude}m`;


    restoreSpokenStatus();

    updateDailyEnglish();
    updateRank();
    updateMessage();
    updateStreak();
    updateBestStreak();
    updateAchievements();
    loadHistory();

    registerEventListeners();
    registerServiceWorker();

}


initializeApp();