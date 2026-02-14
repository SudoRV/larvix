import express from "express";
import { handleAIRequest } from "../services/ai.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { api, message } = req.body;

    if (!api || !message) {
      return res.status(400).json({
        error: "api and message are required"
      });
    }

    const response = await handleAIRequest(api, message);

    return res.json({
      success: true,
      provider: api,
      output: response
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI processing failed"
    });
  }
});

export default router;