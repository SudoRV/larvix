import express from "express";
import { handleAIRequest } from "../services/ai.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { api, message } = req.body;

    // 1️⃣ Tell client this is a stream
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Flush headers immediately
    res.flushHeaders?.();

    if (!api || !message) {
      return res.status(400).json({
        error: "api and message are required"
      });
    }

    const response = await handleAIRequest(api, message, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI processing failed"
    });
  }
});

export default router;