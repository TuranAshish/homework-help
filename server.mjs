import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function getQuestion(body = {}) {
  return body.question || body.message || body.prompt || body.text || "";
}

async function handleAsk(req, res) {
  const question = getQuestion(req.body).trim();

  if (!question) {
    return res.status(400).json({
      error: "Question is required.",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY. Add it inside your .env file.",
    });
  }

  try {
    const prompt = `
You are StudyBuddy AI, a homework helper for kids.

Rules:
- Do not give direct answers immediately.
- Explain step by step.
- Give hints first.
- Use simple language.
- Add small examples.
- End with one quick quiz question.

Student question:
${question}
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      contents: prompt,
    });

    const answer = response.text || "Sorry, I could not generate an answer.";

    res.json({
      answer,
      reply: answer,
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    res.status(500).json({
      error: "AI request failed. Check your API key or model name.",
    });
  }
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend running" });
});

// Your frontend is calling /api/ask
app.post("/api/ask", handleAsk);

// Keeping /api/chat also, in case old frontend code uses it
app.post("/api/chat", handleAsk);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
