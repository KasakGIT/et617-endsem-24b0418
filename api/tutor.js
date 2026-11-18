export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "AI is not configured. Use the built-in tutor feedback." });
  }

  const { question, answer } = req.body || {};
  if (typeof question !== "string" || typeof answer !== "string" || !answer.trim()) {
    return res.status(400).json({ error: "A question and written answer are required." });
  }

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      classification: {
        type: "string",
        enum: ["correct", "misconception_inverse", "misconception_coefficient", "prerequisite_gap", "unclear"]
      },
      feedback: { type: "string" },
      next_step: { type: "string" }
    },
    required: ["classification", "feedback", "next_step"]
  };

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        store: false,
        instructions: [
          "You are a patient Class 8 mathematics tutor.",
          "Evaluate the learner's explanation of solving a linear equation in one variable.",
          "The two target misconceptions are: (1) incorrect inverse operation when undoing addition/subtraction,",
          "(2) treating a coefficient as an operation other than multiplication and multiplying instead of dividing.",
          "Do not infer a misconception unless the learner's words provide evidence.",
          "If the explanation is too short or ambiguous, use unclear and ask one focused follow-up.",
          "Use encouraging, age-appropriate language. Never shame the learner.",
          "Return only JSON matching the requested schema."
        ].join(" "),
        input: `Question: ${question}\nLearner explanation: ${answer}`,
        text: {
          format: {
            type: "json_schema",
            name: "tutor_evaluation",
            strict: true,
            schema
          }
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: "The AI tutor could not respond right now." });
    }

    const output = data.output_text || (data.output || [])
      .flatMap((item) => item.content || [])
      .find((part) => part.type === "output_text")?.text;
    if (typeof output !== "string") {
      return res.status(502).json({ error: "The AI response was incomplete." });
    }

    const parsed = JSON.parse(output);
    const allowed = ["correct", "misconception_inverse", "misconception_coefficient", "prerequisite_gap", "unclear"];
    if (!allowed.includes(parsed.classification) ||
        typeof parsed.feedback !== "string" ||
        typeof parsed.next_step !== "string") {
      return res.status(502).json({ error: "The AI response did not pass validation." });
    }

    return res.status(200).json(parsed);
  } catch {
    return res.status(502).json({ error: "The AI tutor is temporarily unavailable." });
  }
}
