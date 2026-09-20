"use strict";

// The order matches the three existing Night Talk questions.
const nightGuides = [
    [
        ["仕事", "I worked at ____ today.", "I worked at the office today.", "今日はオフィスで働いた。"],
        ["買い物", "I went shopping after ____.", "I went shopping after work.", "仕事の後に買い物に行った。"],
        ["家で休む", "I stayed home and ____.", "I stayed home and relaxed.", "家でのんびり過ごした。"],
        ["外出", "I went to ____ today.", "I went to the park today.", "今日は公園に行った。"],
        ["その他", "I ____ today.", "I cooked dinner today.", "今日は夕飯を作った。"]
    ],
    [
        ["良かった", "It was a good day because ____.", "It was a good day because I saw my friends.", "友達に会えたので、いい一日だった。"],
        ["忙しかった", "It was busy because ____.", "It was busy because I had a lot of work.", "仕事がたくさんあったので忙しかった。"],
        ["疲れた", "I was tired because ____.", "I was tired because I worked all day.", "一日中働いたので疲れた。"],
        ["楽しかった", "I had fun because ____.", "I had fun because I played a game with my friends.", "友達とゲームをして楽しかった。"],
        ["その他", "I felt ____ because ____.", "I felt happy because I learned something new.", "新しいことを学んでうれしかった。"]
    ],
    [
        ["仕事", "I'm going to work ____ tomorrow.", "I'm going to work from home tomorrow.", "明日は在宅勤務をする予定だ。"],
        ["休む", "I'm going to ____ tomorrow.", "I'm going to rest at home tomorrow.", "明日は家で休むつもり。"],
        ["出かける", "I'm going to visit ____ tomorrow.", "I'm going to visit a friend tomorrow.", "明日は友達に会いに行くつもり。"],
        ["勉強", "I'm going to study ____ tomorrow.", "I'm going to study English tomorrow.", "明日は英語を勉強するつもり。"],
        ["その他", "I'm going to ____ tomorrow.", "I'm going to practice English tomorrow.", "明日は英語を練習するつもり。"]
    ]
];

const nightChoices = [null, null, null];

function renderNightGuide(questionIndex){
    const root = document.getElementById("nightGuide");
    root.replaceChildren();
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = "答える内容を選ぶ";
    fieldset.append(legend);
    nightGuides[questionIndex].forEach((entry, index) => {
        const label = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "nightChoice";
        radio.value = index;
        radio.checked = nightChoices[questionIndex] === index;
        radio.addEventListener("change", () => {
            nightChoices[questionIndex] = index;
            renderHelp();
        });
        label.append(radio, entry[0]);
        fieldset.append(label);
    });
    const help = document.createElement("div");
    root.append(fieldset, help);
    function renderHelp(){
        help.replaceChildren();
        const selected = nightChoices[questionIndex];
        if(selected === null) return;
        const [, hint, example, japanese] = nightGuides[questionIndex][selected];
        [["Hint（穴埋め）", hint], ["Build it（完成例文）", `${example}\n${japanese}`]].forEach(([title, text]) => {
            const details = document.createElement("details");
            const summary = document.createElement("summary");
            const paragraph = document.createElement("p");
            summary.textContent = title;
            paragraph.textContent = text;
            details.append(summary, paragraph);
            help.append(details);
        });
    }
    renderHelp();
}
