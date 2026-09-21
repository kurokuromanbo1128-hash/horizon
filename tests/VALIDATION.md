# Horizon vNext validation — 2026-09-20

Base: `main` at `3ebecaf12d7de6ee964e2bb5a0752205b237ecd8`.
Branch: `feat/morning-100-guided-night`.

## Implementation

- Morning previously contained 40 objects with `category`, `text`, `japanese`, and `thought`. The existing category filter and navigation derive their count from the array. Added 60 objects after the original 40, keeping original indices and all five other categories unchanged.
- Added sentences cover daily routine (9), work (9), health/feelings (9), weather (8), plans (8), small talk (9), and starting an English conversation (8). All 100 Morning English/Japanese pairs were reviewed for naturalness and matching meaning. No exact/normalized duplicates in Morning; no new duplicate English sentences across categories. Existing duplicates in other categories were left intact.
- Night retains the existing three Japanese questions. Each has five choices, including Other, optional blank-based Hint, and optional completed English/Japanese example. Examples are prompts for learners to adapt; they do not populate an answer or award completion automatically.
- Speak and typed answers share submission and the existing Gemini Worker request contract. All three nonblank answers are required for completion, in any order. Previously, answering question three alone could award completion.
- Existing `lastNightTalk`, altitude, XP, streak and activity persistence are retained. As before, individual Night answers are session state; this change does not introduce persistent answer history.
- Older AI requests are cancelled when the question changes or a new answer is submitted. A 15-second timeout and failure message allow practice to continue. Answers are rendered as text in the summary.
- `app.js` changes are limited to Night Talk and its initialization. No API key, Worker deployment, manifest or service worker changes.

## Automated results: PASS

Executed `tests/regression.cjs` using Playwright 1.62.1 and installed desktop Chrome in headless mode.

- 100 Morning items; 100 unique normalized English sentences; Japanese text and all required fields present.
- Original 40 Morning objects and all 200 non-Morning objects exactly preserved.
- Morning sequence wraparound, Previous/Next, random order, all six categories, Listen and Speak integration.
- Morning completion, XP +10, altitude +10, streak, localStorage reload, duplicate reward prevention.
- All three Night questions and all 15 choices; Hint blanks and complete bilingual Build it examples; optional guidance; no auto-submission.
- Speak → AI Coach → Retry for each of the three questions without viewing guidance.
- Typed answers, unsupported speech recognition, recognition permission error, synchronous speech startup error, empty answers.
- Three-answer completion including out-of-order answers; question three alone does not complete; summary safely renders markup as text.
- Night altitude +10 and existing completion persistence; no extra XP or duplicate reward.
- AI success, HTTP 503, network failure, malformed JSON, 15-second timeout, and stale response cancellation. These scenarios use deterministic test responses.
- 320, 390, 430, and 1280px viewport layout: no horizontal overflow; buttons at least 44px high. 320/390px Night screenshots also visually reviewed.
- Service worker registration and unchanged manifest/service-worker contents; no uncaught browser errors.
- JavaScript syntax checks and `git -c core.whitespace=cr-at-eol diff --check` pass. The latter respects the CRLF already stored in `app.js` and `english.js`.

## Live integration

A real POST from Node to the unchanged Worker endpoint returned HTTP 200 with `meaning`, `naturalEnglish`, and `tip` for “I went shopping after work.” No key was added or exposed. This confirms the endpoint responds; it does not substitute for a deployed-browser CORS/device test.

## Run locally

```sh
npm install --no-save playwright@1.62.1
npx playwright install chromium
node tests/regression.cjs
```

Optional environment variables: `HORIZON_BROWSER` for an installed Chrome/Edge executable; `HORIZON_SCREENSHOTS` for screenshot output; `HORIZON_BASE` for the comparison commit. Node 18+ is required. Tests serve the app on loopback and use an isolated browser context; no production learning data is modified. Microphone and speech synthesis are mocked to test the app's handlers and state changes deterministically.

## Pending physical-device verification

- Real microphone recognition and audible Listen playback on iOS Safari and Android Chrome, including denied microphone permission.
- Gemini request/display from the deployed site, including browser CORS and a real mobile connection.
- Home-screen/PWA launch/update behavior on physical devices. The existing service worker only registers install/fetch listeners and does not cache the app for offline use; no new offline/PWA guarantees are made.

Stop at PR review / physical-device verification. Do not merge automatically or push directly to main.
