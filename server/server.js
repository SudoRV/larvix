import "./config/env.js";   // MUST BE FIRST

import express from "express";
import cors from "cors";
import aiRouter from "./routes/ai.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/ai", aiRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`AI Server running on port ${PORT}`);
});