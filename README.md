# Equal — Adaptive Tutor (ET617)

A mobile-first adaptive tutor for Class 8 linear equations in one variable.

**Identity token:** `24B0418`  
**Problem:** P4 — Adaptive Tutor  
**Topic:** T3 — Linear equations in one variable  
**Learner:** L5 — learner revisiting a topic after a previous failure  
**Constraint:** C4 — 10-minute sessions

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Keep the default Vite build settings (`npm run build`, output directory `dist`).
4. Deploy.

## Optional AI explanation evaluator

The app works without an API key using its built-in feedback and transparent rule-based adaptation.

To enable AI evaluation of the learner's written explanation on Vercel:
1. In Vercel → Project Settings → Environment Variables, add `OPENAI_API_KEY`.
2. Optionally add `OPENAI_MODEL` (default: `gpt-4o-mini`).
3. Redeploy.

Never put an API key in frontend code or commit it to Git. The serverless function in `api/tutor.js` uses structured JSON output and validates the returned fields. If the request fails, the app falls back to its built-in tutor flow.

## Adaptive decision rules in this prototype

- **Prerequisite instruction:** incorrect arithmetic warm-up (`13 − 5`).
- **Alternative explanation:** response patterns indicate an inverse-operation or coefficient misconception.
- **Harder question:** correct responses with no hint build an independent-success streak; the tutor can show a bracketed-equation challenge.
- **Unclear written explanation:** ask for a clearer explanation rather than assigning a misconception automatically.

## Main screens

Welcome → Practice questions → Targeted feedback / adaptive branch → Reflection.

Progress is saved locally in the learner's browser.
