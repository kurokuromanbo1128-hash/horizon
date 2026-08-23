"use strict";

/* Horizon AI Night Talk Add-on */
(() => {
    const HORIZON_AI_URL = "https://horizon-ai.kurokuromanbo1128.workers.dev/";
    const nightQuestion = document.getElementById("nightQuestion");
    const nightSpeechResult = document.getElementById("nightSpeechResult");
    const nightSpeakBtn = document.getElementById("nightSpeakBtn");

    if(!nightQuestion || !nightSpeechResult || !nightSpeakBtn){
        console.warn("Horizon AI: Night Talk elements not found.");
        return;
    }

    const panel = document.createElement("div");
    panel.id = "nightAiFeedback";
    panel.setAttribute("aria-live", "polite");
    panel.style.marginTop = "14px";
    panel.style.textAlign = "left";
    nightSpeechResult.insertAdjacentElement("afterend", panel);

    let lastSignature = "";
    let lastHeard = "";

    const escapeHtml = (value) => {
        const div = document.createElement("div");
        div.textContent = String(value ?? "");
        return div.innerHTML;
    };

    function retryButton(){
        return `<button id="nightRetryBtn" type="button" style="margin-top:10px;">🎤 Retry</button>`;
    }

    function wireRetry(){
        const retry = document.getElementById("nightRetryBtn");
        if(!retry) return;
        retry.addEventListener("click", () => {
            panel.innerHTML = "";
            lastSignature = "";
            lastHeard = "";
            nightSpeechResult.textContent = "🎤 You said:";
            nightSpeakBtn.click();
        }, { once:true });
    }

    function showChecking(heard){
        panel.innerHTML = `
            <div style="padding:14px;border-radius:14px;background:rgba(255,255,255,0.12);line-height:1.6;">
                <strong>🎧 Speech recognition</strong><br>
                ${escapeHtml(heard)}<br><br>
                🤖 Checking your English...
                ${retryButton()}
            </div>`;
        wireRetry();
    }

    function showError(){
        panel.innerHTML = `
            <div style="padding:14px;border-radius:14px;background:rgba(255,255,255,0.12);line-height:1.6;">
                <strong>🎧 Speech recognition</strong><br>
                ${escapeHtml(lastHeard)}<br><br>
                <strong>🤖 Horizon AI Coach</strong><br>
                AI correction is temporarily unavailable.<br>
                If the recognized sentence is different from what you said, try again.
                ${retryButton()}
            </div>`;
        wireRetry();
    }

    function showCorrection(data){
        const inferred = data.intendedEnglish || data.aiThinksYouMeant || "";
        panel.innerHTML = `
            <div style="padding:14px;border-radius:14px;background:rgba(255,255,255,0.14);line-height:1.6;">
                <strong>🎧 Speech recognition</strong><br>
                ${escapeHtml(lastHeard)}
                ${inferred ? `<p><strong>💭 AI thinks you meant</strong><br>${escapeHtml(inferred)}</p>` : ""}
                <p><strong>🤖 Meaning</strong><br>${escapeHtml(data.meaning || "")}</p>
                <p><strong>✨ Natural English</strong><br>${escapeHtml(data.naturalEnglish || "")}</p>
                <p><strong>💡 Tip</strong><br>${escapeHtml(data.tip || "")}</p>
                ${retryButton()}
            </div>`;
        wireRetry();
    }

    async function requestCorrection(question, english){
        lastHeard = english;
        showChecking(english);
        try{
            const response = await fetch(HORIZON_AI_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, english })
            });
            const data = await response.json();
            if(!response.ok){
                throw new Error(data.details || data.error || "AI correction failed.");
            }
            showCorrection(data);
        }catch(error){
            console.error("Horizon AI Error:", error);
            showError();
        }
    }

    const speechObserver = new MutationObserver(() => {
        const text = nightSpeechResult.textContent.trim();
        const prefix = "🎤 You said:";
        if(!text.startsWith(prefix)) return;
        const english = text.slice(prefix.length).trim();
        if(!english) return;
        const question = nightQuestion.textContent.trim();
        const signature = `${question}|||${english}`;
        if(signature === lastSignature) return;
        lastSignature = signature;
        requestCorrection(question, english);
    });

    speechObserver.observe(nightSpeechResult, {
        childList:true,
        subtree:true,
        characterData:true
    });

    const questionObserver = new MutationObserver(() => {
        panel.innerHTML = "";
        lastSignature = "";
        lastHeard = "";
    });

    questionObserver.observe(nightQuestion, {
        childList:true,
        subtree:true,
        characterData:true
    });
})();
