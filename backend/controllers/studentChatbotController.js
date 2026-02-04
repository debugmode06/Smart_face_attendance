// backend/controllers/studentChatbotController.js
import { Ollama } from "ollama";

const client = new Ollama({ host: "http://localhost:11434" });

export const chatWithAI = async (req, res) => {
  try {
    const { messages, question } = req.body;

    // Build conversation history
    let chatMessages = [];

    if (Array.isArray(messages) && messages.length > 0) {
      chatMessages = messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content || "",
      }));
    } else if (question) {
      chatMessages = [{ role: "user", content: question }];
    } else {
      return res
        .status(400)
        .json({ answer: "Please ask a question for the mentor." });
    }

    const response = await client.chat({
      model: "llama3.2:1b",
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "You are VIDYATRA AI Mentor, helping Indian college students with academics, exams, projects and career planning. Explain clearly, be friendly and concise. Avoid writing code unless asked.",
        },
        ...chatMessages,
      ],
    });

    const answer =
      response?.message?.content ||
      "I’m not sure about that. Try rephrasing your question.";

    res.json({ answer });
  } catch (err) {
    console.error("Ollama Chat Error:", err);
    res
      .status(500)
      .json({ answer: "AI Mentor is not available right now. Please try again." });
  }
};
