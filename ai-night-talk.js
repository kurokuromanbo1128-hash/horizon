"use strict";

/* ==================================================
   Horizon AI Night Talk Add-on
   Isolated from app.js so main Horizon logic stays intact.
================================================== */

(() => {

    const HORIZON_AI_URL =
        "https://horizon-ai.kurokuromanbo1128.workers.dev/";

    const nightQuestion =
        document.getElementById("nightQuestion");

    const nightSpeechResult =
        document.getElementById("nightSpeechResult");

    if(!nightQuestion || !nightSpeechResult){
        console.warn("Horizon AI: Night Talk elements not found.");
        return;
    }

    const feedback =
        document.createElement("div");

    feedback.id = "nightAiFeedback";
    feedback.setAttribute("aria-live", "polite");

    feedback.style.marginTop = "14px";
    feedback.style.textAlign = "left";

    nightSpeechResult.insertAdjacentElement(
        "afterend",
        feedback
    );

    let lastSignature = "";

    function escapeHtml(value){

        const div =
            document.createElement("div");

        div.textContent =
            String(value ?? "");

        return div.innerHTML;

    }

    function showChecking(){

        feedback.innerHTML = `
            <div style="
                padding:14px;
                border-radius:14px;
                background:rgba(255,255,255,0.12);
            ">
                🤖 Checking your English...
            </div>
        `;

    }

    function showError(){

        feedback.innerHTML = `
            <div style="
                padding:14px;
                border-radius:14px;
                background:rgba(255,255,255,0.12);
            ">
                <strong>🤖 Horizon AI Coach</strong><br><br>
                AI correction is temporarily unavailable.<br>
                Your Night Talk answer was still recorded.
            </div>
        `;

    }

    function showCorrection(data){

        feedback.innerHTML = `
            <div style="
                padding:14px;
                border-radius:14px;
                background:rgba(255,255,255,0.14);
                line-height:1.6;
            ">
                <strong>🤖 Horizon AI Coach</strong>

                <p>
                    <strong>Meaning</strong><br>
                    ${escapeHtml(data.meaning || "")}
                </p>

                <p>
                    <strong>Natural English</strong><br>
                    ${escapeHtml(data.naturalEnglish || "")}
                </p>

                <p>
                    <strong>Tip</strong><br>
                    ${escapeHtml(data.tip || "")}
                </p>
            </div>
        `;

    }

    async function requestCorrection(
        question,
        english
    ){

        showChecking();

        try{

            const response =
                await fetch(
                    HORIZON_AI_URL,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            question,
                            english
                        })
                    }
                );

            const data =
                await response.json();

            if(!response.ok){

                throw new Error(
                    data.details ||
                    data.error ||
                    "AI correction failed."
                );

            }

            showCorrection(data);

        }
        catch(error){

            console.error(
                "Horizon AI Error:",
                error
            );

            showError();

        }

    }

    const speechObserver =
        new MutationObserver(() => {

            const text =
                nightSpeechResult.textContent.trim();

            const prefix =
                "🎤 You said:";

            if(!text.startsWith(prefix)){
                return;
            }

            const english =
                text.slice(prefix.length).trim();

            if(!english){
                return;
            }

            const question =
                nightQuestion.textContent.trim();

            const signature =
                `${question}|||${english}`;

            if(signature === lastSignature){
                return;
            }

            lastSignature = signature;

            requestCorrection(
                question,
                english
            );

        });

    speechObserver.observe(
        nightSpeechResult,
        {
            childList: true,
            subtree: true,
            characterData: true
        }
    );

    const questionObserver =
        new MutationObserver(() => {

            feedback.innerHTML = "";
            lastSignature = "";

        });

    questionObserver.observe(
        nightQuestion,
        {
            childList: true,
            subtree: true,
            characterData: true
        }
    );

})();
