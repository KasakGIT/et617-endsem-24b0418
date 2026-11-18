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

## AI endpoint status

The repository contains `api/tutor.js`, a server-side evaluator endpoint with schema validation. The current React learning flow does **not** call this endpoint; the learner-facing tutor currently uses transparent, rule-based feedback. Adding an API key alone will not change the learning flow. Keep keys server-side if the endpoint is connected in a future change.

## Adaptive decision rules in this prototype

- **Prerequisite instruction:** incorrect arithmetic warm-up (`13 − 5`).
- **Alternative explanation:** response patterns indicate an inverse-operation or coefficient misconception.
- **Harder question:** correct responses with no hint build an independent-success streak; the tutor can show a bracketed-equation challenge.
- **Unclear written explanation:** ask for a clearer explanation rather than assigning a misconception automatically.

## Focused learning sessions

The welcome screen now offers four distinct, topic-focused 10-minute sessions:

- **Inverse operations:** undoing addition and subtraction.
- **Keeping equality balanced:** applying the same operation to both sides.
- **Understanding coefficients:** interpreting the number multiplying x.
- **Two-step equations:** choosing the correct order of inverse operations.

Each session has its own diagnostic equation, micro-check and transfer challenge. The tutor reuses the existing learning journey and feedback structure while changing the mathematical examples and focus.

## Session library

The progress dashboard includes an archive of saved sessions. Each archived session shows its focus, date, independent successes, hint use and recorded misconception. Selecting **Open** returns to that session's learning snapshot. The current in-progress session remains separately resumable.

Progress and session history are stored locally in the learner's browser; they are not synced across devices.


## Learner memory, progress and pause/resume

- Every meaningful interaction updates the current learner record in `localStorage` (`equal-adaptive-v2`).
- The saved record includes the exact activity screen, selected diagnostic response, reasoning, answer drafts, hint state, event history, confidence reflection and session status.
- **Pause & save** returns to the welcome screen while retaining the exact activity. **Resume your session** restores that activity.
- Autosave runs whenever React learner state changes, including text entry. A refresh or browser close therefore restores the last saved activity when the learner chooses Resume.
- The welcome screen can record learner-reported starting confidence; the reflection stage records confidence after learning.
- The progress dashboard reports observed actions and evidence statuses. When a new session starts, the tutor checks the most recently archived misconception and flags the same pattern if it appears again, prompting a different representation before the next check. It does not convert screen completion into a mastery percentage.
- Starting a different focused session archives the previous active/paused session. The history key is `equal-adaptive-v2-history`; completed sessions are archived at completion. Starting fresh still asks for confirmation.

### Evidence interpretation

Concept statuses use conservative labels: *Demonstrated independently*, *Demonstrated with assistance*, *Needs more practice*, and *Not yet assessed*. The prototype only records evidence from interactions that are currently implemented; it does not claim that a learner has mastered a concept based on visiting a screen.

Active time is an approximate browser-side measure between recorded interactions. It is not a precise attention measure and should not be interpreted as time-on-task research data.
