import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const apiKey = process.env.GEMINI_API_KEY;

let ai = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
  });
} else {
  console.warn("Missing GEMINI_API_KEY. Add it inside your .env file.");
}

function buildTutorPrompt(question) {
  return `
You are Homework Help AI, a kind study buddy for children.

The child asked:
"${question}"

Rules:
- Understand spelling mistakes.
- Do NOT give only direct answers.
- Explain like a friendly teacher.
- Use simple words for kids.
- Give steps, example, hint, and mini quiz.
- If unsafe, adult, harmful, or not suitable for children, say:
  "Please ask a parent or teacher for help with this."
- If the question is not about study, gently bring the child back to learning.
- Never shame the child.
- Keep it short, clear, and useful.

Return exactly in this format:

📘 Topic:
Write the topic name.

✅ Simple Answer:
Give a simple child-friendly answer.

🧠 Step-by-Step:
1. First step
2. Second step
3. Third step

🌍 Example:
Give one real-life example.

💡 Hint:
Give one small helpful hint.

❓ Mini Quiz:
1. Ask one easy question.
2. Ask one more easy question.
`;
}

function demoAnswer(question) {
  const q = question.toLowerCase();

  if (q.includes("photo") || q.includes("plant")) {
    return `📘 Topic:
Photosynthesis

✅ Simple Answer:
Photosynthesis is how green plants make their own food using sunlight, water, and carbon dioxide.

🧠 Step-by-Step:
1. Roots take water from the soil.
2. Leaves take carbon dioxide from the air.
3. Sunlight gives energy to the plant.
4. The plant makes food called glucose.
5. Oxygen is released into the air.

🌍 Example:
A tree uses sunlight, air, and water to make its food.

💡 Hint:
Remember: sunlight + water + carbon dioxide = plant food.

❓ Mini Quiz:
1. What gas do plants take in?
2. What gas do plants release?`;
  }

  return `📘 Topic:
Homework Help

✅ Simple Answer:
I can help you learn this topic step by step.

🧠 Step-by-Step:
1. Read the question carefully.
2. Find the main topic.
3. Break the answer into small parts.

🌍 Example:
If you ask "What is a noun?", I will explain it with examples like person, place, animal, or thing.

💡 Hint:
Ask one clear homework question at a time.

❓ Mini Quiz:
1. What subject is your question from?
2. Can you give one example?`;
}

app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Please type your homework question first.",
      });
    }

    if (question.length > 800) {
      return res.status(400).json({
        error: "Question is too long. Please ask a shorter question.",
      });
    }

    if (!ai) {
      return res.status(200).json({
        answer:
          "Gemini API key is missing. Add GEMINI_API_KEY inside .env, restart the app, then try again.",
      });
    }

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      contents: buildTutorPrompt(question),
    });

    res.json({
      answer: response.text || demoAnswer(question),
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    res.status(200).json({
      answer:
        demoAnswer(req.body?.question || "") +
        "\n\nNote: Gemini API did not respond. Check your API key, free quota, or model name.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Homework Help AI server running on http://localhost:${PORT}`);
});