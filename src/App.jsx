import React, { useEffect, useMemo, useState } from "react";

const ID = "24B0418";
const KEY = "equal-adaptive-v2";

const initial = {
  screen: "welcome",
  learner: "Aarav",
  confidence: 2,
  diagnostic: "",
  reason: "",
  misconception: null,
  attempts: 0,
  hints: 0,
  independentWins: 0,
  events: [],
  completed: [],
  currentAnswer: "",
  transferAnswer: "",
  reflection: "",
  showHint: false,
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
    title: "Undoing addition",
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
      return saved ? { ...initial, ...saved, screen: "welcome" } : initial;
    } catch { return initial; }
  });

  useEffect(() => {
    const { screen, ...persisted } = s;
    localStorage.setItem(KEY, JSON.stringify(persisted));
  }, [s]);

  const update = (patch) => setS(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  const record = (type, detail) => setS(prev => ({
    ...prev,
    events: [...prev.events, { type, detail, at: Date.now() }]
  }));

  const start = () => {
    update({ screen: "diagnostic", currentAnswer: "", showHint: false });
    record("session-start", "Started diagnostic conversation");
  };

  const chooseDiagnostic = (choice) => {
    const misconception = classifyDiagnostic(choice);
    update({
      diagnostic: choice,
      misconception: misconception || "unknown",
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

  const completeCoach = () => {
    update({ screen: "microcheck", currentAnswer: "" });
    record("microcheck-start", info.title);
  };

  const answerMicrocheck = (choice) => {
    const correct = choice === info.answer;
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
    const correct = normalized === "5" || normalized === "x=5";
    update(prev => ({
      screen: "transfer-feedback",
      transferAnswer: answer,
      independentWins: prev.independentWins + (correct ? 1 : 0),
      attempts: prev.attempts + (correct ? 0 : 1),
    }));
    record("transfer-answer", `${answer} (${correct ? "correct" : "needs-review"})`);
  };

  const finish = () => {
    update({ screen: "summary" });
    record("session-complete", "Completed adaptive learning journey");
  };

  const reset = () => {
    localStorage.removeItem(KEY);
    setS(initial);
  };

  const progress = useMemo(() => {
    const map = { welcome: 0, diagnostic: 12, reason: 22, coach: 34, microcheck: 48, "microcheck-help": 48, detective: 64, "detective-help": 64, transfer: 80, "transfer-feedback": 90, reflection: 96, summary: 100 };
    return map[s.screen] ?? 0;
  }, [s.screen]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">＝</span><span>equal<span className="dot">.</span></span></div>
        <div className="top-meta"><span>A 10-minute learning studio</span><b>ID&nbsp; {ID}</b></div>
      </header>

      {s.screen !== "welcome" && s.screen !== "summary" && (
        <div className="progress-wrap">
          <div className="progress-meta"><span>YOUR LEARNING JOURNEY</span><span>{progress}%</span></div>
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
          <button className="primary" onClick={start}>Begin learning journey <span>→</span></button>
          <div className="welcome-note">Your progress is saved on this device. You can pause and return later.</div>
          <div className="preview-card">
            <div className="preview-label">TODAY'S BIG IDEA <span>NO RUSH</span></div>
            <div className="equation">3x + 7 = 19</div>
            <div className="preview-arrow">↓</div>
            <div className="preview-caption">What is happening to x?</div>
            <div className="equation small">Let's reason it out.</div>
            <div className="preview-foot">A good mathematician explains the step, not only the result.</div>
          </div>
        </section>}

        {s.screen === "diagnostic" && <section className="panel narrow">
          <div className="step-label">01 / START WITH YOUR THINKING</div>
          <h2>Let's look at one equation together.</h2>
          <p className="muted">Imagine you're solving this. Don't calculate the final answer yet. Choose the first move you would make.</p>
          <div className="problem-card"><span>THE EQUATION</span><strong>3x + 7 = 19</strong></div>
          <h3>What would you do first?</h3>
          <div className="choice-list">
            {["Subtract 7 from both sides", "Add 7 to both sides", "Subtract 7 from the left only", "Divide both sides by 3"].map(c => <button className="choice" key={c} onClick={() => chooseDiagnostic(c)}>{c}<span>↗</span></button>)}
          </div>
          <p className="microcopy">There may be a reason behind every choice. This isn't a test.</p>
        </section>}

        {s.screen === "reason" && <section className="panel narrow">
          <div className="step-label">02 / MAKE YOUR THINKING VISIBLE</div>
          <h2>What made you choose that?</h2>
          <p className="muted">I'm interested in the idea you used, not just whether the choice was right.</p>
          <div className="quote-choice">“{s.diagnostic}”</div>
          <div className="choice-list">
            {["I want to undo the +7.", "I thought I should move the 7 across.", "I wanted to get x by itself immediately.", "I thought both sides might not need the same operation.", "I'm not sure yet."].map(c => <button className="choice" key={c} onClick={() => chooseReason(c)}>{c}<span>↗</span></button>)}
          </div>
        </section>}

        {s.screen === "coach" && <section className="panel">
          <div className="step-label">03 / YOUR TUTOR'S RESPONSE</div>
          <div className="coach-grid">
            <div>
              <div className="diagnosis-tag">WHAT I'M NOTICING</div>
              <h2>{info.title}</h2>
              <p className="lead small-lead">{info.short}</p>
              <p>{info.explanation}</p>
              <div className="thinking-box"><b>Let's unpack the equation</b>{info.worked.map((line, i) => <div className="worked-line" key={i}><span>{i + 1}</span>{line}</div>)}</div>
            </div>
            <aside className="tutor-aside"><div className="avatar">e.</div><b>One idea at a time</b><p>I'm adapting this explanation to the move you selected. You can take your time.</p><div className="aside-tip">A useful question: “What operation is being applied to x, and how can I undo it?”</div></aside>
          </div>
          <button className="primary" onClick={completeCoach}>Try a tiny check <span>→</span></button>
        </section>}

        {s.screen === "microcheck" && <section className="panel narrow">
          <div className="step-label">04 / CHECK THE IDEA, NOT YOUR MEMORY</div>
          <h2>Try this smaller situation.</h2>
          <p className="muted">Use the idea we just explored. You don't need to rush.</p>
          <div className="problem-card"><span>THINK IT THROUGH</span><strong>{info.prompt}</strong></div>
          <div className="choice-list">{info.choices.map(c => <button className="choice" key={c} onClick={() => answerMicrocheck(c)}>{c}<span>↗</span></button>)}</div>
        </section>}

        {s.screen === "microcheck-help" && <section className="panel narrow">
          <div className="step-label">A SMALLER STEP</div>
          <h2>Let's make the idea easier to see.</h2>
          <p>{info.explanation}</p>
          <div className="hint-card"><b>Try thinking of it this way</b><p>{s.misconception === "balance" ? "If two sides of a balance scale weigh the same, taking a weight off only one side makes it tilt." : s.misconception === "coefficient" ? "If 3 identical bags have a total weight of 12 kg, how do you find the weight of one bag?" : "If someone says “I added 5”, what would you do to reverse that exact action?"}</p></div>
          <p className="muted">No problem if that wasn't clear yet. Read it once more, then continue to a worked example.</p>
          <button className="primary" onClick={() => update({ screen: "detective", currentAnswer: "" })}>I want to try another example <span>→</span></button>
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
          <div className="problem-card"><span>YOUR CHALLENGE</span><strong>5x − 4 = 21</strong></div>
          <button className="text-button" onClick={() => update({ showHint: !s.showHint, hints: s.hints + (!s.showHint ? 1 : 0) })}>{s.showHint ? "Hide hint" : "I want a hint"}</button>
          {s.showHint && <div className="hint-card"><b>Plan before calculating</b><p>Ask yourself: what is happening to 5x? First undo the subtraction of 4. Then undo multiplication by 5. Remember to keep both sides balanced.</p></div>}
          <form onSubmit={e => { e.preventDefault(); answerTransfer(s.transferAnswer); }}>
            <label className="field-label" htmlFor="answer">Your answer for x</label>
            <input id="answer" value={s.transferAnswer} onChange={e => update({ transferAnswer: e.target.value })} placeholder="e.g. 5" />
            <button className="primary" type="submit">Check my reasoning <span>→</span></button>
          </form>
        </section>}

        {s.screen === "transfer-feedback" && <section className="panel narrow">
          <div className="step-label">YOUR THINKING IN A NEW CONTEXT</div>
          {s.transferAnswer.trim().replace(/\s/g, "").toLowerCase() === "5" || s.transferAnswer.trim().replace(/\s/g, "").toLowerCase() === "x=5" ? <>
            <div className="success-mark">✓</div><h2>You transferred the method.</h2>
            <p>From 5x − 4 = 21, add 4 to both sides: 5x = 25. Then divide both sides by 5: x = 5. You used the inverse operations in sequence and kept the equation balanced.</p>
            <div className="thinking-box"><b>Check your result</b><div className="worked-line"><span>✓</span>5(5) − 4 = 25 − 4 = 21</div><div className="worked-line"><span>✓</span>The original equation is true.</div></div>
          </> : <>
            <div className="soft-mark">↗</div><h2>Let's inspect the steps, not label the answer.</h2>
            <p>Your answer was <b>{s.transferAnswer || "blank"}</b>. For this equation, first undo −4 by adding 4 to both sides. That gives 5x = 25. Then divide both sides by 5, giving x = 5.</p>
            <div className="thinking-box"><b>Where could your path have changed?</b><div className="worked-line"><span>1</span>5x − 4 + 4 = 21 + 4</div><div className="worked-line"><span>2</span>5x = 25</div><div className="worked-line"><span>3</span>5x ÷ 5 = 25 ÷ 5</div></div>
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
          <p className="lead small-lead">You explored an idea, made your reasoning visible, checked a misconception, and applied the method in a new context.</p>
          <div className="summary-grid">
            <div><strong>{s.independentWins}</strong><span>ideas demonstrated</span></div>
            <div><strong>{s.attempts}</strong><span>moments to revisit</span></div>
            <div><strong>{s.hints}</strong><span>hints used</span></div>
          </div>
          <div className="thinking-box"><b>What your tutor noticed</b><p>{info.title}: {info.short}</p><p>Confidence now: {["","Still unsure","A little clearer","Mostly confident","I can explain it"][s.confidence]}.</p>{s.reflection && <p>Your reflection: “{s.reflection}”</p>}</div>
          <p className="muted">Next time, your tutor should begin with a short check on this idea, then move forward when you can explain the reasoning independently.</p>
          <button className="primary" onClick={reset}>Start a fresh learning journey <span>↻</span></button>
        </section>}
      </main>
      <footer><span>Made for learning, not perfection.</span><span>ET617 · {ID}</span></footer>
    </div>
  );
}

export default App;
