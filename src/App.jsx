import React, { useEffect, useMemo, useState } from "react";

const ID = "24B0418";
const KEY = "equal-adaptive-v2";
const TOPICS = {
  inverse: { title: "Inverse operations", subtitle: "Undo addition and subtraction", equation: "4x + 6 = 22", choices: ["Subtract 6 from both sides", "Add 6 to both sides", "Subtract 6 from the left only", "Divide both sides by 4"], microPrompt: "If 7 is added to a number and the result is 15, what undoes +7?", microChoices: ["Add 7", "Subtract 7", "Multiply by 7"], microAnswer: "Subtract 7", transfer: "6x + 3 = 27", transferAnswer: "4", transferWork: "Subtract 3 to get 6x = 24, then divide by 6.", worked: ["4x + 6 = 22", "Subtract 6 from both sides", "4x = 16", "Divide both sides by 4", "x = 4"], check: "6(4) + 3 = 27, so 27 = 27" },
  balance: { title: "Keeping equality balanced", subtitle: "Why both sides must stay equal", equation: "2x + 5 = 17", choices: ["Subtract 5 from both sides", "Add 5 to both sides", "Subtract 5 from the left only", "Divide both sides by 2"], microPrompt: "If you add 4 to the left side, what keeps the equation balanced?", microChoices: ["Do nothing to the right", "Add 4 to the right too", "Subtract 4 from the right"], microAnswer: "Add 4 to the right too", transfer: "3x + 8 = 20", transferAnswer: "4", transferWork: "Subtract 8 from both sides to get 3x = 12, then divide by 3.", worked: ["2x + 5 = 17", "Subtract 5 from both sides", "2x = 12", "Divide both sides by 2", "x = 6"], check: "3(4) + 8 = 20, so 20 = 20" },
  coefficient: { title: "Understanding coefficients", subtitle: "What does the number beside x mean?", equation: "5x + 2 = 22", choices: ["Subtract 2 from both sides", "Add 2 to both sides", "Subtract 2 from the left only", "Divide both sides by 5 first"], microPrompt: "If 6x = 30, what does the 6 tell you and how do you undo it?", microChoices: ["Subtract 6", "Divide by 6", "Add 6"], microAnswer: "Divide by 6", transfer: "4x + 8 = 24", transferAnswer: "4", transferWork: "Subtract 8 to get 4x = 16, then divide by 4.", worked: ["5x + 2 = 22", "Subtract 2 from both sides", "5x = 20", "Divide both sides by 5", "x = 4"], check: "4(4) + 8 = 24, so 24 = 24" },
  multistep: { title: "Two-step equations", subtitle: "Choose the order of inverse operations", equation: "3x - 4 = 11", choices: ["Add 4 to both sides first", "Subtract 4 from both sides first", "Divide by 3 first", "Change only the left side"], microPrompt: "For 2x − 5 = 9, what should you undo first?", microChoices: ["Multiply by 2", "Subtract 5", "Add 5 to both sides"], microAnswer: "Add 5 to both sides", transfer: "7x - 6 = 29", transferAnswer: "5", transferWork: "Add 6 to get 7x = 35, then divide by 7.", worked: ["3x − 4 = 11", "Add 4 to both sides", "3x = 15", "Divide both sides by 3", "x = 5"], check: "7(5) − 6 = 29, so 29 = 29" }
};

const initial = {
  screen: "welcome",
  learner: "Aarav",
  confidence: null,
  diagnostic: "",
  reason: "",
  misconception: null,
  attempts: 0,
  hints: 0,
  independentWins: 0,
  assistedWins: 0,
  prerequisiteFeedback: "",
  priorMisconception: null,
  recurringMisconception: false,
  events: [],
  completed: [],
  sessionStatus: "new",
  savedScreen: "welcome",
  initialConfidence: null,
  elapsedMs: 0,
  sessionStartedAt: null,
  lastActivityAt: null,
  currentAnswer: "",
  transferAnswer: "",
  reflection: "",
  showHint: false,
  topicId: "inverse",
  sessionTitle: "Inverse operations",
  sessionId: null,
  viewingHistory: false,
};

const misconceptionInfo = {
  correct: {
    title: "A strong first move",
    short: "You chose to subtract 7 from both sides. That undoes the +7 while preserving equality.",
    explanation: "Good reasoning. You noticed that 7 is being added to 3x, so subtraction is the inverse operation. Applying it to both sides keeps the equation balanced. Now the next question is: what does 3x mean, and how do we undo that operation?",
    worked: ["3x + 7 = 19", "Subtract 7 from each side", "3x = 12", "Divide each side by 3 to isolate x"],
    prompt: "If 4x = 20, which operation isolates x?",
    choices: ["Subtract 4", "Multiply by 4", "Divide by 4"],
    answer: "Divide by 4",
  },
  inverse: {
    title: "Choosing the inverse operation",
    short: "You tried to move the 7, but changed addition into addition again.",
    explanation: "The equation 3x + 7 = 19 says that 7 has been added to 3x. To get back to 3x, we undo that addition with subtraction. But an equation is a balance: subtract 7 from the left AND the right, so both sides change equally.",
    worked: ["3x + 7 = 19", "3x + 7 − 7 = 19 − 7", "3x = 12"],
    prompt: "If 5 is added to a number and the result is 13, what operation undoes the +5?",
    choices: ["Add 5", "Subtract 5", "Multiply by 5"],
    answer: "Subtract 5",
  },
  balance: {
    title: "Keeping the equation balanced",
    short: "You changed only one side of the equation.",
    explanation: "Think of the equals sign as saying both sides have the same value. If you remove 7 only from the left, the two sides are no longer equal. Whatever operation you perform on one side must also happen on the other side.",
    worked: ["3x + 7 = 19", "Left: subtract 7", "Right: subtract 7 too", "3x = 12"],
    prompt: "If you multiply the left side by 2, what must happen to the right side?",
    choices: ["Nothing", "Multiply it by 2 too", "Add 2"],
    answer: "Multiply it by 2 too",
  },
  coefficient: {
    title: "Undoing multiplication",
    short: "You reached 3x = 12, but treated 3x as if 3 were being added.",
    explanation: "3x means 3 × x. The 3 is multiplying x. To leave x on its own, undo multiplication by dividing BOTH sides by 3. The inverse of multiplication is division.",
    worked: ["3x = 12", "3x ÷ 3 = 12 ÷ 3", "x = 4"],
    prompt: "If 4x = 20, which operation isolates x?",
    choices: ["Subtract 4", "Multiply by 4", "Divide by 4"],
    answer: "Divide by 4",
  },
  arithmetic: {
    title: "Arithmetic slip",
    short: "Your equation setup was on the right track; the number calculation needs a second look.",
    explanation: "Let's separate the algebra from the arithmetic. From 3x + 7 = 19, subtracting 7 gives 3x = 12. Now check the small calculation carefully: 19 − 7 = 12. You can estimate or use the inverse check: 12 + 7 should return to 19.",
    worked: ["19 − 7 = 12", "Check: 12 + 7 = 19", "Then 12 ÷ 3 = 4"],
    prompt: "Quick check: 18 − 9 = ?",
    choices: ["7", "9", "11"],
    answer: "9",
  },
  unknown: {
    title: "Let's locate the tricky part",
    short: "Your answer alone doesn't tell me what you were thinking yet.",
    explanation: "There can be different reasons for the same answer. We'll slow down and look at one decision at a time instead of guessing what went wrong.",
    worked: ["Start with 3x + 7 = 19", "First ask: what is happening to x?", "Then choose the operation that undoes it"],
    prompt: "What is being done to 3x in this equation?",
    choices: ["7 is added to it", "It is divided by 7", "It is multiplied by 7"],
    answer: "7 is added to it",
  },
};

function classifyDiagnostic(choice) {
  if (choice === "Subtract 7 from both sides") return "correct";
  if (choice === "Add 7 to both sides") return "inverse";
  if (choice === "Subtract 7 from the left only") return "balance";
  if (choice === "Divide both sides by 3") return "coefficient";
  return null;
}

function App() {
  const [s, setS] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      return saved ? { ...initial, ...saved, sessionStatus: saved.sessionStatus || (saved.screen && saved.screen !== "welcome" ? "paused" : "new"), savedScreen: ["welcome", "dashboard"].includes(saved.screen) ? (saved.savedScreen || "welcome") : saved.screen, screen: "welcome" } : initial;
    } catch { return initial; }
  });

  useEffect(() => {
    if (s.viewingHistory) return;
    const persisted = { ...s, savedScreen: ["welcome", "dashboard"].includes(s.screen) ? (s.savedScreen || "welcome") : s.screen };
    localStorage.setItem(KEY, JSON.stringify(persisted));
  }, [s]);

  const update = (patch) => setS(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  const record = (type, detail) => setS(prev => {
    const now = Date.now();
    const activeDelta = prev.sessionStatus === "active" && prev.lastActivityAt
      ? Math.max(0, now - prev.lastActivityAt) : 0;
    return {
      ...prev,
      events: [...prev.events, { type, detail, at: now }],
      elapsedMs: (prev.elapsedMs || 0) + activeDelta,
      lastActivityAt: now
    };
  });

  const archiveSession = (session, status = "completed") => {
    if (!session || (!session.sessionStartedAt && !session.events?.length)) return;
    try {
      const history = JSON.parse(localStorage.getItem(`${KEY}-history`) || "[]");
      const id = session.sessionId || `session-${session.sessionStartedAt || Date.now()}`;
      const archived = { ...session, sessionId: id, sessionStatus: status, savedAt: Date.now() };
      const existingIndex = history.findIndex(item => item.sessionId === id);
      if (existingIndex >= 0) history.splice(existingIndex, 1);
      history.unshift(archived);
      localStorage.setItem(`${KEY}-history`, JSON.stringify(history.slice(0, 30)));
    } catch {}
  };

  const start = (topicId = "inverse") => {
    const topic = TOPICS[topicId] || TOPICS.inverse;
    if (s.sessionStatus === "active" || s.sessionStatus === "paused") {
      const ok = window.confirm(`Start ${topic.title}? Your current session will be saved in your learning library.`);
      if (!ok) return;
      archiveSession(s, s.sessionStatus);
    }
    const now = Date.now();
    let priorMisconception = null;
    try {
      const history = JSON.parse(localStorage.getItem(`${KEY}-history`) || "[]");
      if (Array.isArray(history)) priorMisconception = history.find(item => item.topicId === topicId && item.misconception)?.misconception || null;
    } catch {}
    setS({ ...initial, initialConfidence: s.initialConfidence, topicId, sessionTitle: topic.title,
      sessionId: `equal-${topicId}-${now}`, screen: "diagnostic", savedScreen: "diagnostic", sessionStatus: "active",
      sessionStartedAt: now, lastActivityAt: now, priorMisconception, events: [{ type: "session-start", detail: topic.title, at: now }] });
  };

  const resume = () => {
    const target = s.savedScreen && s.savedScreen !== "welcome" ? s.savedScreen : "diagnostic";
    update({ screen: target, sessionStatus: "active", lastActivityAt: Date.now() });
    record("session-resumed", `Resumed at ${target}`);
  };

  const pauseAndSave = () => {
    const now = Date.now();
    const elapsed = s.lastActivityAt ? Math.max(0, now - s.lastActivityAt) : 0;
    archiveSession({ ...s, screen: s.screen, savedScreen: s.screen, sessionStatus: "paused",
      elapsedMs: (s.elapsedMs || 0) + elapsed, lastActivityAt: null }, "paused");
    update(prev => ({ screen: "welcome", savedScreen: prev.screen, sessionStatus: "paused",
      elapsedMs: (prev.elapsedMs || 0) + elapsed, lastActivityAt: null }));
    record("session-paused", `Paused at ${s.screen}`);
  };

  const startFresh = () => {
    const ok = window.confirm("Start a new learning session? Your current session will be kept in your learning history.");
    if (!ok) return;
    archiveSession(s, s.sessionStatus === "completed" ? "completed" : "paused");
    localStorage.removeItem(KEY);
    setS({ ...initial, initialConfidence: s.initialConfidence, sessionStatus: "new" });
  };

  const openDashboard = () => update({ screen: "dashboard", savedScreen: s.screen !== "welcome" && s.screen !== "dashboard" ? s.screen : s.savedScreen });

  const openArchivedSession = (item) => {
    if (s.sessionId && s.sessionId !== item.sessionId && ["active", "paused"].includes(s.sessionStatus)) archiveSession(s, s.sessionStatus);
    if (item.sessionStatus === "paused") {
      const target = item.savedScreen || item.screen || "diagnostic";
      setS({ ...initial, ...item, screen: target, savedScreen: target, sessionStatus: "active", lastActivityAt: Date.now(), viewingHistory: false });
    } else {
      setS({ ...initial, ...item, screen: "summary", sessionStatus: "completed", lastActivityAt: null, viewingHistory: true });
    }
  };

  const chooseDiagnostic = (choice) => {
    const choices = (TOPICS[s.topicId] || TOPICS.inverse).choices;
    const choiceIndex = choices.indexOf(choice);
    const diagnosed = ["correct", "inverse", "balance", "coefficient"][choiceIndex] || classifyDiagnostic(choice) || "unknown";
    const misconception = diagnosed;
    update({
      diagnostic: choice,
      misconception: diagnosed,
      recurringMisconception: Boolean(diagnosed !== "unknown" && diagnosed === s.priorMisconception),
      screen: "reason",
      currentAnswer: "",
    });
    record("diagnostic-choice", choice);
  };

  const chooseReason = (choice) => {
    update({ reason: choice, screen: "coach" });
    record("reasoning", choice);
  };

  const info = misconceptionInfo[s.misconception || "unknown"];
  const topic = TOPICS[s.topicId] || TOPICS.inverse;

  const completeCoach = () => {
    update({ screen: "microcheck", currentAnswer: "" });
    record("microcheck-start", info.title);
  };

  const answerMicrocheck = (choice) => {
    const correct = choice === (s.misconception === "correct" ? topic.microAnswer : info.answer);
    if (correct) {
      update(prev => ({
        screen: "detective",
        independentWins: prev.independentWins + 1,
        currentAnswer: "",
        showHint: false,
      }));
      record("microcheck-correct", choice);
    } else {
      update(prev => ({
        screen: "microcheck-help",
        attempts: prev.attempts + 1,
        currentAnswer: choice,
      }));
      record("microcheck-missed", choice);
    }
  };

  const answerPrerequisite = (choice) => {
    const correctAnswers = {
      inverse: "Subtract 6",
      balance: "Subtract 3 from both sides",
      coefficient: "4",
    };
    const correct = choice === (correctAnswers[s.misconception] || "Subtract 6");
    if (correct) {
      update(prev => ({ screen: "detective", assistedWins: prev.assistedWins + 1, prerequisiteFeedback: "That is it. You used the smaller idea correctly; now try applying it in a new equation." }));
      record("prerequisite-correct", `${s.misconception}: ${choice}`);
    } else {
      update({ prerequisiteFeedback: "Not quite yet. Look at what is happening first, then choose the operation that undoes it." });
      record("prerequisite-missed", `${s.misconception}: ${choice}`);
    }
  };

  const answerDetective = (choice) => {
    const correct = choice === "2x + 6";
    update(prev => ({
      screen: correct ? "transfer" : "detective-help",
      attempts: prev.attempts + (correct ? 0 : 1),
      independentWins: prev.independentWins + (correct ? 1 : 0),
      currentAnswer: choice,
    }));
    record("error-detective", `${choice} (${correct ? "correct" : "incorrect"})`);
  };

  const answerTransfer = (answer) => {
    const normalized = answer.trim().replace(/\s/g, "").toLowerCase();
    const correct = normalized === topic.transferAnswer || normalized === `x=${topic.transferAnswer}`;
    update(prev => ({
      screen: "transfer-feedback",
      transferAnswer: answer,
      independentWins: prev.independentWins + (correct ? 1 : 0),
      attempts: prev.attempts + (correct ? 0 : 1),
    }));
    record("transfer-answer", `${answer} (${correct ? "correct" : "needs-review"})`);
  };

  const finish = () => {
    const now = Date.now();
    const elapsed = s.lastActivityAt ? Math.max(0, now - s.lastActivityAt) : 0;
    const completedSnapshot = { ...s, screen: "summary", sessionStatus: "completed", elapsedMs: (s.elapsedMs || 0) + elapsed, lastActivityAt: null,
      events: [...s.events, { type: "reflection-submitted", detail: `Confidence ${s.confidence}/4; ${s.reflection || "No written reflection"}`, at: now }, { type: "session-complete", detail: "Completed adaptive learning journey", at: now }] };
    archiveSession(completedSnapshot, "completed");
    update(prev => ({ screen: "summary", sessionStatus: "completed",
      elapsedMs: (prev.elapsedMs || 0) + elapsed, lastActivityAt: null }));
    record("reflection-submitted", `Confidence ${s.confidence}/4; ${s.reflection || "No written reflection"}`);
    record("session-complete", "Completed adaptive learning journey");
  };

  const evidence = useMemo(() => {
    const has = (type, predicate = () => true) => s.events.some(e => e.type === type && predicate(e));
    const count = (type) => s.events.filter(e => e.type === type).length;
    const diag = s.events.find(e => e.type === "diagnostic-choice")?.detail || "";
    const microCorrect = has("microcheck-correct");
    const detectiveCorrect = has("error-detective", e => String(e.detail).includes("correct"));
    const transferCorrect = has("transfer-answer", e => String(e.detail).includes("(correct)"));
    const status = (independent, assisted, attempted) => independent ? "Demonstrated independently" : assisted ? "Demonstrated with assistance" : attempted ? "Needs more practice" : "Not yet assessed";
    let history = [];
    try { const savedHistory = JSON.parse(localStorage.getItem(`${KEY}-history`) || "[]"); history = Array.isArray(savedHistory) ? savedHistory : []; } catch {}
    const pastSessions = history.length;
    return {
      history,
      pastSessions,
      inverseSignals: (s.misconception === "inverse" ? 1 : 0) + (s.misconception === "inverse" ? count("microcheck-missed") : 0),
      balanceSignals: (s.misconception === "balance" ? 1 : 0) + (s.misconception === "balance" ? count("microcheck-missed") : 0),
      coefficientSignals: (s.misconception === "coefficient" ? 1 + count("microcheck-missed") : 0),
      questions: count("diagnostic-choice") + count("microcheck-correct") + count("microcheck-missed") + count("error-detective") + count("transfer-answer"),
      reasoning: count("reasoning"),
      misconceptions: s.events.filter(e => e.type === "diagnostic-choice").length * (s.misconception && s.misconception !== "correct" ? 1 : 0),
      independent: s.independentWins,
      assisted: (s.assistedWins || 0) + count("microcheck-missed") + (s.hints || 0),
      inverse: status(microCorrect && (s.topicId === "inverse" || s.misconception === "inverse"), s.misconception === "inverse" && (s.assistedWins || 0) > 0, s.topicId === "inverse" || s.misconception === "inverse"),
      balance: status(microCorrect && (s.topicId === "balance" || s.misconception === "balance"), s.misconception === "balance" && (s.assistedWins || 0) > 0, s.topicId === "balance" || s.misconception === "balance"),
      coefficient: status(microCorrect && (s.topicId === "coefficient" || s.misconception === "coefficient"), s.misconception === "coefficient" && (s.assistedWins || 0) > 0, s.topicId === "coefficient" || s.misconception === "coefficient"),
      distributive: status(detectiveCorrect, false, has("error-detective")),
      solving: status(transferCorrect, count("transfer-answer") > 0 && !transferCorrect, count("transfer-answer") > 0),
      confidenceBefore: s.initialConfidence,
      confidenceAfter: s.confidence,
      microCorrect,
      prerequisiteCorrect: has("prerequisite-correct"),
      transferCorrect,
      diagnosticChoice: diag,
      hints: s.hints,
      elapsed: Math.round((s.elapsedMs || 0) / 60000)
    };
  }, [s]);

  const progress = useMemo(() => {
    const map = { welcome: 0, prerequisite: 58, diagnostic: 12, reason: 22, coach: 34, microcheck: 48, "microcheck-help": 48, detective: 64, "detective-help": 64, transfer: 80, "transfer-feedback": 90, reflection: 96, summary: 100, dashboard: 0 };
    return map[s.screen] ?? 0;
  }, [s.screen]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">＝</span><span>equal<span className="dot">.</span></span></div>
        <div className="top-meta"><span>{s.screen !== "welcome" && s.screen !== "dashboard" ? (s.sessionTitle || "A 10-minute learning studio") : "A 10-minute learning studio"}</span><b>ID&nbsp; {ID}</b>{s.sessionStatus === "active" && !["summary", "welcome", "dashboard"].includes(s.screen) && <button className="pause-button" onClick={pauseAndSave}>Ⅱ Pause &amp; save</button>}</div>
      </header>

      {s.screen !== "welcome" && s.screen !== "summary" && (
        <div className="progress-wrap">
          <div className="progress-meta"><span>SESSION FLOW · NOT A MASTERY SCORE</span><span>{progress}%</span></div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      <main>
        {s.screen === "welcome" && <section className="welcome layout">
          <div className="eyebrow">YOUR PERSONAL MATHS TUTOR</div>
          <h1>Understand the <em>why</em>,<br/>not just the answer.</h1>
          <p className="lead">A responsive learning space for linear equations. Explore ideas, explain your thinking, notice patterns in mistakes, and build understanding one decision at a time.</p>
          <div className="welcome-stats">
            <div><b>10 min</b><span>Self-paced</span></div><div><b>Think aloud</b><span>Reasoning matters</span></div><div><b>Adapts to you</b><span>Not a fixed quiz</span></div>
          </div>
          <div className="baseline-check">
            <b>Before we begin, how confident do you feel about linear equations?</b>
            <div className="baseline-options">{[["1","Not sure"],["2","A little"],["3","Mostly"],["4","Confident"]].map(([value,label]) => <button key={value} className={`baseline-option ${s.initialConfidence === Number(value) ? "selected" : ""}`} onClick={() => { update({ initialConfidence: Number(value) }); record("baseline-confidence", value); }}><strong>{value}</strong><span>{label}</span></button>)}</div>
          </div>
          {(s.sessionStatus === "paused" || (s.savedScreen && s.savedScreen !== "welcome" && s.sessionStatus === "active")) && <button className="primary" onClick={resume}>Resume your current session <span>→</span></button>}
          <div className="topic-picker"><div className="step-label">CHOOSE A FOCUSED 10-MINUTE SESSION</div><div className="topic-grid">{Object.entries(TOPICS).map(([key, item], i) => <button className="topic-card" key={key} onClick={() => start(key)}><span className="topic-number">0{i+1}</span><b>{item.title}</b><small>{item.subtitle}</small><span className="topic-start">Start session →</span></button>)}</div></div>
          <div className="welcome-actions"><button className="text-button" onClick={openDashboard}>View all learning sessions &amp; progress</button>{(s.sessionStatus === "paused" || s.sessionStatus === "active" || s.sessionStatus === "completed") && <button className="text-button" onClick={startFresh}>Clear current session</button>}</div>
          <div className="welcome-note">Your progress is saved on this device. You can pause and return later.</div>
          <div className="preview-card">
            <div className="preview-label">YOUR LEARNING LIBRARY <span>4 FOCUSES</span></div>
            <div className="equation">One skill</div>
            <div className="preview-arrow">↓</div>
            <div className="preview-caption">Different examples each time</div>
            <div className="equation small">One step at a time.</div>
            <div className="preview-foot">Choose a focused session. Your tutor will keep its own learning record.</div>
          </div>
        </section>}

        {s.screen === "dashboard" && <section className="panel summary-panel">
          <div className="step-label">AARAV'S LEARNING RECORD</div>
          <h2>Your learning, session by session.</h2>
          <p className="muted">This view uses recorded answers and learning actions. A concept is not marked as mastered just because you visited a screen.</p>
          <div className="summary-grid">
            <div><strong>{evidence.questions}</strong><span>question attempts</span></div>
            <div><strong>{evidence.reasoning}</strong><span>reasoning responses</span></div>
            <div><strong>{evidence.hints}</strong><span>hints requested</span></div>
          </div>
          <h3>Concept evidence</h3>
          <div className="evidence-list">
            {[["Inverse operations", evidence.inverse], ["Keeping equality balanced", evidence.balance], ["Understanding coefficients", evidence.coefficient], ["Expanding brackets", evidence.distributive], ["Solving a new equation", evidence.solving]].map(([name, status]) => <div className="evidence-row" key={name}><b>{name}</b><span>{status}</span></div>)}
          </div>
          <h3>Learning patterns</h3>
          <p className="muted">Misconception signals: inverse operations <b>{evidence.inverseSignals}</b>; equality balance <b>{evidence.balanceSignals}</b>; coefficient meaning <b>{evidence.coefficientSignals}</b>.</p>
          <p className="muted">Independent correct demonstrations: <b>{evidence.independent}</b>. Support signals (missed checks and hints): <b>{evidence.assisted}</b>. Saved sessions: <b>{evidence.pastSessions}</b>.</p>
          <p className="muted">Confidence: {evidence.confidenceBefore ? ["","Still unsure","A little clearer","Mostly confident","I can explain it"][evidence.confidenceBefore] : "Not recorded"} before → {evidence.confidenceAfter ? ["","Still unsure","A little clearer","Mostly confident","I can explain it"][evidence.confidenceAfter] : "Not recorded"} after.</p>
          <p className="muted">Recorded active time: approximately {evidence.elapsed} minutes, excluding time when the session is paused or the page is closed.</p>
          {evidence.history.length > 0 && <><h3>All learning sessions</h3><div className="evidence-list">{evidence.history.map((item, index) => <div className="history-card" key={item.sessionId || `${item.savedAt}-${index}`}><div><b>{item.sessionTitle || TOPICS[item.topicId]?.title || "Linear equations practice"}</b><small>{item.savedAt ? new Date(item.savedAt).toLocaleString() : "Date unavailable"} · {item.sessionStatus || "saved"}</small><small>{item.independentWins || 0} independent successes · {item.hints || 0} hints · {item.misconception || "No misconception recorded"}</small></div><button className="history-open" onClick={() => openArchivedSession(item)}>{item.sessionStatus === "paused" ? "Resume →" : "Review →"}</button></div>)}</div></>}
          <div className="hint-card"><b>Suggested next practice</b><p>{s.misconception === "inverse" ? "Practise choosing the inverse of addition and subtraction, then explain why the same operation applies to both sides." : s.misconception === "balance" ? "Use a balance-scale example and practise applying one operation to both sides." : s.misconception === "coefficient" ? "Practise interpreting 3x as 3 × x, then divide both sides to isolate x." : "Try a fresh two-step equation and explain each inverse operation aloud or in writing."}</p></div>
          <button className="primary" onClick={() => update({ screen: "welcome" })}>Back to welcome <span>→</span></button>
        </section>}

        {s.screen === "diagnostic" && <section className="panel narrow">
          <div className="step-label">01 / {s.sessionTitle?.toUpperCase()} · START WITH YOUR THINKING</div>
          <h2>Let's look at one equation together.</h2>
          <p className="muted">Imagine you're solving this. Don't calculate the final answer yet. Choose the first move you would make.</p>
          <div className="problem-card"><span>{topic.title.toUpperCase()} · THE EQUATION</span><strong>{topic.equation}</strong></div>
          <h3>What would you do first?</h3>
          <div className="choice-list">
            {topic.choices.map(c => <button className="choice" key={c} onClick={() => chooseDiagnostic(c)}>{c}<span>↗</span></button>)}
          </div>
          <p className="microcopy">There may be a reason behind every choice. This isn't a test.</p>
        </section>}

        {s.screen === "reason" && <section className="panel narrow">
          <div className="step-label">02 / MAKE YOUR THINKING VISIBLE</div>
          <h2>What made you choose that?</h2>
          <p className="muted">I'm interested in the idea you used, not just whether the choice was right.</p>
          <div className="quote-choice">“{s.diagnostic}”</div>
          <div className="choice-list">
            {["I want to undo the constant operation first.", "I may have reversed the operation in the wrong direction.", "I wanted to get x by itself immediately.", "I thought both sides might not need the same operation.", "I'm not sure yet."].map(c => <button className="choice" key={c} onClick={() => chooseReason(c)}>{c}<span>↗</span></button>)}
          </div>
        </section>}

        {s.screen === "coach" && <section className="panel">
          <div className="step-label">03 / YOUR TUTOR'S RESPONSE</div>
          <div className="coach-grid">
            <div>
              <div className="diagnosis-tag">WHAT I'M NOTICING</div>
              {s.recurringMisconception && <div className="hint-card"><b>I've noticed this pattern from an earlier session.</b><p>Let's use a different representation this time, then check whether the idea feels clearer.</p></div>}
              <h2>{info.title}</h2>
              <p className="lead small-lead">{s.misconception === "correct" ? `You chose a first step that matches the focus of ${topic.title.toLowerCase()}. Now let's check whether you can explain and transfer it.` : s.misconception === "inverse" ? "The operation you chose does not undo the constant term. Let's reverse the operation carefully." : s.misconception === "balance" ? "Your choice suggests the two sides of an equation may not be staying balanced. Let's examine that idea." : s.misconception === "coefficient" ? "Your choice suggests the coefficient and the constant may be getting mixed up. Let's separate their jobs." : "Your choice gives me a starting point, but I need to understand your reasoning before deciding what support will help."}</p>
              <p>{s.misconception === "inverse" ? `In ${topic.equation}, the constant is added to or subtracted from the term containing x. Undo that outside operation first, using its inverse on both sides.` : s.misconception === "balance" ? `An equation such as ${topic.equation} is a balance. Whatever operation changes the left side must also change the right side, or equality is lost.` : s.misconception === "coefficient" ? `In ${topic.equation}, the coefficient tells how many equal groups of x there are. Once the constant is removed, divide both sides by that coefficient to leave x.` : `Let's read ${topic.equation} one operation at a time. Name what is happening to the term with x, then choose the inverse operation and explain why it keeps both sides equal.`}</p>
              <div className="thinking-box"><b>Let's unpack the equation</b>{topic.worked.map((line, i) => <div className="worked-line" key={i}><span>{i + 1}</span>{line}</div>)}</div>
            </div>
            <aside className="tutor-aside"><div className="avatar">e.</div><b>{s.recurringMisconception ? "A new way to look at it" : "One idea at a time"}</b><p>{s.recurringMisconception ? (s.misconception === "balance" ? "Picture two equal piles. Whatever you remove from one pile, remove from the other." : s.misconception === "coefficient" ? "Think of the coefficient as the number of equal groups. Division shares the total equally." : "Think of subtraction as reversing the action of adding. We undo the exact operation that happened.") : "I'm adapting this explanation to the move you selected. You can take your time."}</p><div className="aside-tip">A useful question: “What operation is being applied to x, and how can I undo it?”</div></aside>
          </div>
          <button className="primary" onClick={completeCoach}>Try a tiny check <span>→</span></button>
        </section>}

        {s.screen === "microcheck" && <section className="panel narrow">
          <div className="step-label">04 / CHECK THE IDEA, NOT YOUR MEMORY</div>
          <h2>Try this smaller situation.</h2>
          <p className="muted">Use the idea we just explored. You don't need to rush.</p>
          <div className="problem-card"><span>{topic.title.toUpperCase()} · THINK IT THROUGH</span><strong>{s.misconception === "correct" ? topic.microPrompt : info.prompt}</strong></div>
          <div className="choice-list">{(s.misconception === "correct" ? topic.microChoices : info.choices).map(c => <button className="choice" key={c} onClick={() => answerMicrocheck(c)}>{c}<span>↗</span></button>)}</div>
        </section>}

        {s.screen === "microcheck-help" && <section className="panel narrow">
          <div className="step-label">A SMALLER STEP</div>
          <h2>Let's make the idea easier to see.</h2>
          <p>{s.misconception === "balance" ? `For ${topic.equation}, imagine both sides as equal amounts. Any operation you apply to one side must also be applied to the other.` : s.misconception === "coefficient" ? `In ${topic.equation}, the coefficient is multiplying x. Once the constant is handled, division undoes that multiplication.` : `Look at ${topic.equation}. Name the operation applied to the term with x, then use its inverse to undo it while keeping both sides equal.`}</p>
          <div className="hint-card"><b>{s.attempts > 0 ? "A different way to picture it" : "Try thinking of it this way"}</b><p>{s.misconception === "balance" ? "Imagine two equal piles of counters. If you remove 7 counters from one pile, remove 7 from the other pile too. The piles stay equal." : s.misconception === "coefficient" ? "Three identical bags hold 12 kg altogether. Sharing the 12 kg equally among 3 bags means 12 ÷ 3, not 12 × 3." : "A number has 5 added to it. To return to the starting number, take away exactly 5. Addition and subtraction undo each other."}</p></div>
          {s.attempts > 1 && <div className="problem-card"><span>PREREQUISITE MINI-PRACTICE</span><strong>{s.misconception === "coefficient" ? "3 equal groups make 15. How many are in each group?" : "If 8 + 4 = 12, what is 12 − 4?"}</strong></div>}
          <p className="muted">No problem if that wasn't clear yet. Read it once more, then continue to a worked example.</p>
          <button className="primary" onClick={() => update({ screen: "prerequisite", prerequisiteFeedback: "" })}>Try a smaller practice question <span>→</span></button>
        </section>}

        {s.screen === "prerequisite" && <section className="panel narrow">
          <div className="step-label">A SMALLER PRACTICE STEP</div>
          <h2>Let's practise the idea once more.</h2>
          <p className="muted">This short activity is selected from the difficulty we just noticed.</p>
          <div className="problem-card"><span>YOUR MINI PRACTICE</span><strong>{s.misconception === "balance" ? "If you subtract 3 from the left side, what must you do to the right?" : s.misconception === "coefficient" ? "4 equal groups have 16 counters. How many counters are in each group?" : "A number has 6 added to it. What undoes +6?"}</strong></div>
          <div className="choice-list">{(s.misconception === "balance" ? ["Nothing", "Subtract 3 from both sides", "Add 3 only to the right"] : s.misconception === "coefficient" ? ["12", "4", "64"] : ["Add 6", "Subtract 6", "Multiply by 6"]).map(choice => <button className="choice" key={choice} onClick={() => answerPrerequisite(choice)}>{choice}<span>↗</span></button>)}</div>
          {s.prerequisiteFeedback && <div className="hint-card"><p>{s.prerequisiteFeedback}</p></div>}
        </section>}

        {s.screen === "detective" && <section className="panel narrow">
          <div className="step-label">05 / MATHEMATICAL DETECTIVE</div>
          <h2>Which student's reasoning is sound?</h2>
          <p className="muted">A student is expanding the brackets in this equation:</p>
          <div className="problem-card"><span>NEW STRUCTURE</span><strong>2(x + 3) = 14</strong></div>
          <div className="choice-list">
            <button className="choice" onClick={() => answerDetective("2x + 3")}>“I multiply x by 2, then add 3: 2x + 3.”<span>↗</span></button>
            <button className="choice" onClick={() => answerDetective("2x + 6")}>“The 2 multiplies everything inside: 2x + 6.”<span>↗</span></button>
            <button className="choice" onClick={() => answerDetective("x + 6")}>“I only multiply the 3: x + 6.”<span>↗</span></button>
          </div>
          <div className="microcopy">This checks whether you can transfer the idea to a different-looking equation.</div>
        </section>}

        {s.screen === "detective-help" && <section className="panel narrow">
          <div className="step-label">LET'S LOOK AT THE STRUCTURE</div>
          <h2>The 2 has a job to do on both terms.</h2>
          <p>In 2(x + 3), the 2 multiplies the entire bracket. That means 2 × x and 2 × 3.</p>
          <div className="thinking-box"><div className="worked-line"><span>1</span>2 × x = 2x</div><div className="worked-line"><span>2</span>2 × 3 = 6</div><div className="worked-line"><span>3</span>So the expression becomes 2x + 6</div></div>
          <p className="muted">Notice how we used the structure of the expression, not a memorised “move it across” trick.</p>
          <button className="primary" onClick={() => update({ screen: "transfer", currentAnswer: "" })}>Try a new equation <span>→</span></button>
        </section>}

        {s.screen === "transfer" && <section className="panel narrow">
          <div className="step-label">06 / TRANSFER YOUR UNDERSTANDING</div>
          <h2>Now solve a new equation.</h2>
          <p className="muted">This one combines two operations. Write the value of x. If you want, use the hint to plan your steps first.</p>
          <div className="problem-card"><span>{topic.title.toUpperCase()} · YOUR CHALLENGE</span><strong>{topic.transfer}</strong></div>
          <button className="text-button" onClick={() => { const opening = !s.showHint; update({ showHint: opening, hints: s.hints + (opening ? 1 : 0) }); if (opening) record("hint-requested", "Transfer challenge hint"); }}>{s.showHint ? "Hide hint" : "I want a hint"}</button>
          {s.showHint && <div className="hint-card"><b>Plan before calculating</b><p>Look at {topic.transfer}. Identify the operation furthest from x, undo it first, and apply that change to both sides. Then isolate x.</p></div>}
          <form onSubmit={e => { e.preventDefault(); answerTransfer(s.transferAnswer); }}>
            <label className="field-label" htmlFor="answer">Your answer for x</label>
            <input id="answer" value={s.transferAnswer} onChange={e => update({ transferAnswer: e.target.value })} placeholder="e.g. 5" />
            <button className="primary" type="submit">Check my reasoning <span>→</span></button>
          </form>
        </section>}

        {s.screen === "transfer-feedback" && <section className="panel narrow">
          <div className="step-label">YOUR THINKING IN A NEW CONTEXT</div>
          {s.transferAnswer.trim().replace(/\s/g, "").toLowerCase() === topic.transferAnswer || s.transferAnswer.trim().replace(/\s/g, "").toLowerCase() === `x=${topic.transferAnswer}` ? <>
            <div className="success-mark">✓</div><h2>You transferred the method.</h2>
            <p>For {topic.transfer}, {topic.transferWork} You used the inverse operations in sequence and kept the equation balanced.</p>
            <div className="thinking-box"><b>Check your result</b><div className="worked-line"><span>✓</span>{topic.check}</div><div className="worked-line"><span>✓</span>The original equation is true.</div></div>
          </> : <>
            <div className="soft-mark">↗</div><h2>Let's inspect the steps, not label the answer.</h2>
            <p>Your answer was <b>{s.transferAnswer || "blank"}</b>. A reliable route is: {topic.transferWork} The value to check is x = {topic.transferAnswer}. Substitute it into the original equation to check both sides.</p>
            <div className="thinking-box"><b>Where could your path have changed?</b><div className="worked-line"><span>1</span>{topic.transfer} · use the inverse operation first</div><div className="worked-line"><span>2</span>{topic.transferWork}</div><div className="worked-line"><span>3</span>Check your result in the original equation</div></div>
          </>}
          <button className="primary" onClick={() => update({ screen: "reflection" })}>Reflect on what changed <span>→</span></button>
        </section>}

        {s.screen === "reflection" && <section className="panel narrow">
          <div className="step-label">07 / REFLECT ON YOUR LEARNING</div>
          <h2>How does this feel now?</h2>
          <p className="muted">Confidence is useful information too. It helps decide what kind of support comes next.</p>
          <div className="confidence-options">
            {[["1","Still unsure"],["2","A little clearer"],["3","Mostly confident"],["4","I can explain it"]].map(([v, label]) => <button className={`confidence ${s.confidence === Number(v) ? "selected" : ""}`} key={v} onClick={() => update({ confidence: Number(v) })}><b>{v}</b><span>{label}</span></button>)}
          </div>
          <label className="field-label" htmlFor="reflection">What helped you understand something today?</label>
          <textarea id="reflection" value={s.reflection} onChange={e => update({ reflection: e.target.value })} placeholder="For example: seeing why both sides need the same operation..." rows="3"/>
          <button className="primary" onClick={finish}>Finish my learning journey <span>→</span></button>
        </section>}

        {s.screen === "summary" && <section className="panel summary-panel">
          <div className="step-label">YOUR LEARNING SNAPSHOT</div>
          <div className="success-mark">✓</div>
          <h2>You did more than answer questions.</h2>
          <p className="lead small-lead">{s.misconception === "inverse" ? "You initially chose an addition step where subtraction was needed." : s.misconception === "balance" ? "You initially changed only one side of the equation." : s.misconception === "coefficient" ? "You initially needed support understanding what the coefficient does." : s.misconception === "correct" ? "You began by choosing the inverse operation on both sides." : "You explored the equation and shared your reasoning."} {evidence.prerequisiteCorrect ? "A smaller practice activity helped you work through the difficult idea." : evidence.microCorrect ? "You answered the follow-up check correctly without a hint." : "The idea still needs another practice opportunity."} {evidence.transferCorrect ? "You then solved the new equation independently." : "The new-equation challenge is a useful next step to revisit."}</p>
          <div className="summary-grid">
            <div><strong>{evidence.independent}</strong><span>independent successes</span></div>
            <div><strong>{evidence.questions}</strong><span>question attempts</span></div>
            <div><strong>{s.hints}</strong><span>hints used</span></div>
          </div>
          <div className="thinking-box"><b>What your tutor noticed</b><p>{info.title}: you chose “{s.diagnostic}”. Your tutor used that response to select the explanation and practice that followed.</p><p>Starting confidence: {s.initialConfidence ? ["","Still unsure","A little clearer","Mostly confident","I can explain it"][s.initialConfidence] : "Not recorded"}. Confidence now: {s.confidence ? ["","Still unsure","A little clearer","Mostly confident","I can explain it"][s.confidence] : "Not recorded"}.</p>{s.reflection && <p>Your reflection: “{s.reflection}”</p>}</div>
          <p className="muted">Next time, your tutor should begin with a short check on this idea, then move forward when you can explain the reasoning independently.</p>
          <button className="primary" onClick={openDashboard}>View my learning record <span>→</span></button><button className="text-button" onClick={startFresh}>Start a fresh learning journey ↻</button>
        </section>}
      </main>
      <footer><span>Made for learning, not perfection.</span><span>ET617 · {ID}</span></footer>
    </div>
  );
}

export default App;
