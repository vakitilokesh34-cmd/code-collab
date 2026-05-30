import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getAIResponse } from "../services/aiService.js";

const router = express.Router();

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { code, language, error, prompt } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const result = await getAIResponse({ code, language, error, prompt });
    res.json(result);
  } catch (err) {
    console.error("AI Route Error:", err.message);
    res.status(500).json({ message: "AI service failed" });
  }
});

export default router;
