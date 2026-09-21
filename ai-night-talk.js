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

    let lastHeard = "";
    let requestId = 0;
    let activeRequest;

    function cancelCorrection(){
        requestId++;
        if(activeRequest) activeRequest.abort();
        activeRequest = null;
    }

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
            cancelCorrection();
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
                AI添削は一時的に利用できません。回答は受け付けました。<br>
                このまま次の質問へ進めます。手入力で直して再送信することもできます。
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
        cancelCorrection();
        const id = requestId;
        const controller = new AbortController();
        activeRequest = controller;
        const timeout = setTimeout(() => controller.abort(), 15000);
        lastHeard = english;
        showChecking(english);
        try{
            const response = await fetch(HORIZON_AI_URL, {
                method: "POST",
                signal: controller.signal,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, english })
            });
            const data = await response.json();
            if(!response.ok){
                throw new Error(data.details || data.error || "AI correction failed.");
            }
            if(id === requestId) showCorrection(data);
        }catch(error){
            if(id === requestId) showError();
        }finally{
            clearTimeout(timeout);
            if(id === requestId) activeRequest = null;
        }
    }

    document.addEventListener("night-answer", (event) => {
        const { question, english } = event.detail;
        requestCorrection(question, english);
    });

    const questionObserver = new MutationObserver(() => {
        cancelCorrection();
        panel.innerHTML = "";
        lastHeard = "";
    });

    questionObserver.observe(nightQuestion, {
        childList:true,
        subtree:true,
        characterData:true
    });
})();
