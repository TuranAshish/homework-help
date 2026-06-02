app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    res.json({
      reply: "AI response here",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong",
    });
  }
});
