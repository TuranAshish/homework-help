import { useState } from "react";
import "./App.css";

const sampleQuestions = [
  "What is photosynthesis?",
  "Solve 2/4 + 1/4",
  "What is a noun?",
  "Why is the sky blue?",
  "Explain gravity for class 4",
];

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  async function askAI(customQuestion) {
    const finalQuestion = customQuestion || question;

    if (!finalQuestion.trim()) {
      setAnswer("Please type your homework question first 😊");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: finalQuestion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setAnswer(data.answer);
      setHistory((prev) => [
        {
          question: finalQuestion,
          answer: data.answer,
        },
        ...prev.slice(0, 4),
      ]);
    } catch (error) {
      setAnswer(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSampleClick(sample) {
    setQuestion(sample);
    askAI(sample);
  }

  function clearAll() {
    setQuestion("");
    setAnswer("");
  }

  return (
    <main className="app">
      <section className="hero">
        <div className="badge">AI Study Buddy for Kids</div>

        <h1>
          Turan's Homework Help <span>AI</span>
        </h1>

        <p>
          Ask any homework question. Get simple explanations, steps, examples,
          hints, and a mini quiz.
        </p>
      </section>

      <section className="card ask-card">
        <label htmlFor="question">Type your homework question</label>

        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Example: what is photosyntheses?"
          rows="5"
        />

        <div className="actions">
          <button onClick={() => askAI()} disabled={loading}>
            {loading ? "Thinking..." : "Ask AI"}
          </button>

          <button className="ghost" onClick={clearAll} disabled={loading}>
            Clear
          </button>
        </div>

        <div className="samples">
          {sampleQuestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSampleClick(item)}
              disabled={loading}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="card answer-card">
        <div className="answer-header">
          <h2>Answer</h2>
          {loading && <span className="loader">AI is teaching...</span>}
        </div>

        {!answer && !loading && (
          <p className="empty">
            Your answer will appear here. Try asking: “What is photosynthesis?”
          </p>
        )}

        {answer && <pre>{answer}</pre>}
      </section>

      {history.length > 0 && (
        <section className="card history-card">
          <h2>Recent Questions</h2>

          <div className="history-list">
            {history.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuestion(item.question);
                  setAnswer(item.answer);
                }}
              >
                {item.question}
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
