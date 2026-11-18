# DESIGN.md — Adaptive Tutor

**Course:** ET617  
**Problem:** P4 — Adaptive Tutor with Automatic Question Generation  
**Topic:** T3 — Linear Equations in One Variable (Class 8)  
**Learner Context:** L5 — Learner revisiting a topic after previously failing, with high anxiety and low self-efficacy  
**Design Constraint:** C4 — 10-minute learning sessions  
**Identity Token:** 24B0418

---

## 1. Educational Problem

Class 8 students learning linear equations in one variable may memorise steps without understanding why particular operations are performed on both sides of an equation. A learner who has previously struggled with the topic may also hesitate to attempt questions independently due to fear of making mistakes.

A fixed sequence of questions and explanations may not address the learner's specific misconceptions. The proposed adaptive tutor identifies patterns in the learner's answers and reasoning, then selects an appropriate next learning activity.

The tutor aims to improve both conceptual understanding and confidence through targeted explanations, guided practice and gradually increasing independence.

## 2. Learning Outcomes

By the end of the learning session, the learner should be able to:

1. **Understand:** Explain why the same operation must be performed on both sides of an equation.
2. **Apply:** Solve linear equations in one variable using appropriate inverse operations.
3. **Reason:** Identify an incorrect solution step, explain the error and correct it independently.

**Confidence goal:** Encourage the learner to attempt unfamiliar questions and rely less on hints as their understanding improves.

## 3. Learner Persona

**Name:** Aarav  
**Age:** 14 years  
**Class:** 8

**Prior knowledge:**
- Understands basic arithmetic operations.
- Has been introduced to variables and simple algebraic expressions.
- Has previously studied linear equations but struggles to solve them independently.

**Learning difficulties:**
- Hesitates before attempting unfamiliar questions.
- Often depends on memorised procedures.
- Loses confidence after making mistakes.

**Likely misconceptions:**

### M1 — Incorrect use of inverse operations

The learner changes the sign of a term while moving it across the equals sign without understanding which inverse operation is required.

Example:

For `3x + 7 = 19`, the learner writes:

`3x = 19 + 7`

instead of subtracting 7 from both sides.

### M2 — Incorrect treatment of coefficients

The learner does not understand that a coefficient represents multiplication and may use multiplication instead of division to isolate the variable.

Example:

For `4x = 20`, the learner writes:

`x = 20 × 4`

instead of dividing both sides by 4.

**Device:** Smartphone  
**Session availability:** Approximately 10 minutes  
**Motivation:** Wants to understand the topic and become confident enough to solve questions without constant help.

## 4. Learning Content Plan

The learning activity will follow five stages:

| Stage | Activity | Purpose |
|---|---|---|
| 1. Diagnose | Short questions about equations and operations | Identify prior understanding |
| 2. Explain | Conceptual explanation using equality and inverse operations | Build understanding |
| 3. Guided practice | Questions with optional hints and feedback | Correct misconceptions |
| 4. Independent challenge | Questions with reduced assistance | Assess independent understanding |
| 5. Reflect | Confidence check and learning summary | Encourage self-awareness |

### Question formats

The tutor will support at least three formats:

1. Multiple-choice questions.
2. Numerical answer questions.
3. Step-by-step or written reasoning questions.

### Initial question set

1. **Conceptual MCQ:** What does the equation `x + 4 = 10` tell us about the two sides?
2. **Numerical:** Solve `x + 6 = 14`.
3. **Error identification:** A student solves `2x + 5 = 13` by writing `2x = 13 + 5`. Is this correct? Explain.
4. **Step-by-step:** Solve `3x + 4 = 19`, showing each operation.
5. **Written explanation:** Why do we subtract 5 from both sides when solving `2x + 5 = 13`?

Model answers and misconception-specific feedback will be provided for each relevant task.

## 5. Adaptive Decision Rules

The tutor will choose the next activity based on correctness, reasoning and the learner's previous responses.

### Outcome A — Harder question

**Condition:** The learner answers correctly and demonstrates valid reasoning independently across multiple interactions.

**Response:** Provide a more challenging equation with additional steps.

Example progression:

`3x + 4 = 19`

followed by:

`4(x - 2) = 20`

### Outcome B — Alternative explanation

**Condition:** The learner demonstrates a specific misconception, such as incorrectly applying inverse operations.

**Response:** Explain the concept using a different representation or analogy, followed by a targeted question.

Example: If the learner adds 5 instead of subtracting 5 in `2x + 5 = 13`, explain how subtraction undoes addition and demonstrate why the same operation is applied to both sides.

### Outcome C — Prerequisite instruction

**Condition:** The learner cannot demonstrate a prerequisite skill required to solve the equation, even after a simpler diagnostic follow-up.

**Response:** Revisit the foundational operation before returning to algebra.

Example: If the learner cannot calculate `13 - 5`, provide a short subtraction activity before continuing.

**Uncertain responses:** If an incorrect answer does not clearly indicate a misconception, ask a diagnostic follow-up instead of immediately assigning a misconception.

## 6. Ten-Minute Session Constraint

The complete learning sequence is designed to fit within ten minutes.

| Time | Stage |
|---|---|
| 0–1 min | Diagnostic assessment |
| 1–3 min | Personalised explanation |
| 3–6 min | Guided practice |
| 6–9 min | Independent challenge |
| 9–10 min | Reflection and summary |

The application will include:
- A visible session progress indicator.
- Automatic progress saving after activities.
- The ability to resume from the last completed stage.
- No countdown timer that pressures the learner.

## 7. Confidence and Feedback Design

The tutor will:
- Treat mistakes as opportunities to learn rather than failures.
- Provide hints when requested.
- Distinguish between independent and hint-assisted answers.
- Give feedback that identifies what the learner did correctly and what needs improvement.
- Gradually reduce assistance when the learner demonstrates understanding.

The final reflection will ask the learner whether they feel more confident and which concept they understand better.

## 8. Initial Design Decisions

The application will prioritise:

- Adaptive feedback over a fixed question sequence.
- Diagnosis of specific misconceptions rather than generic wrong-answer feedback.
- Conceptual understanding rather than memorisation.
- Gradual movement from guided to independent practice.
- A complete, resumable learning experience within ten minutes.

Implementation details, AI behaviour, validation and fallback mechanisms will be documented as the application develops.

## 9. Learner memory and evidence-based progress

The learner record is stored locally under `equal-adaptive-v2`. It stores the current activity, saved activity position, answers, diagnostic choice, written reflection, confidence rating, hint state, event log, attempts and independent successes. State updates merge partial changes into the existing React state. Autosave persists the full record after state changes.

### Pause and resume (C4)

During an active activity, **Pause & save** stores the current screen as the resume point and returns to the welcome screen. **Resume your session** restores that screen and the saved inputs. The same saved state is available after a refresh or accidental browser close. A fresh session requires confirmation and archives the current session locally rather than silently deleting it.

### Progress evidence

The progress dashboard distinguishes activity completion from demonstrated understanding. It reports question attempts, reasoning entries, hints, misconception signals, independent correct responses and confidence change. Concept labels use four evidence states: demonstrated independently, demonstrated with assistance, needs more practice and not yet assessed.

The current prototype has a single diagnostic decision and a small number of follow-up tasks. Therefore its concept-level evidence is intentionally limited; it should not be presented as a validated mastery score. The event log is the source for dashboard indicators. Approximate elapsed time is based on browser timestamps between recorded interactions and is not a measure of attention.

### Adaptive response

When a learner misses a micro-check, the tutor moves to a support screen and changes the representation (for example, equal piles for balance or equal groups for coefficients). Repeated missed attempts trigger a prerequisite mini-practice prompt. At the start of a fresh session, the tutor also checks the most recently archived session for a misconception label. If the same label appears again in the new diagnostic, it flags a recurring pattern and foregrounds an alternative representation. This is a transparent rule-based adaptation; it does not claim that an AI model independently inferred a recurring pattern. The repository contains a server-side AI evaluator endpoint with schema validation, but the current React flow does not invoke it. The deployed learner experience therefore uses the transparent rule-based tutor; the endpoint must not be represented as active AI functionality until it is connected and tested.


## 10. Focused sessions and session library

The welcome screen offers four short learning paths within the same T3 topic: inverse operations, keeping equality balanced, understanding coefficients, and two-step equations. Each path uses a distinct diagnostic equation, a topic-aligned micro-check and a new transfer equation. This reduces repetition while retaining the same reassuring learning sequence: diagnose, explain, check, transfer and reflect.

The learner can browse the session archive from the progress dashboard. Completed sessions are archived when they finish; an active or paused session is archived when the learner starts another focus. The archive preserves its topic, recorded answers, event log, confidence, hint use and outcomes. Opening a past entry shows that session's summary. The current unfinished session can still be resumed independently.

Session data is browser-local (`localStorage`), so it persists on the same browser/device but is not a cross-device learner account or cloud database. Topic variation in this prototype is authored content selected by the learner; it is not presented as AI-generated question generation.
