import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import videoRoutes from "./routes/video.routes";

dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);

app.get("/", (_req, res) => {
  res.send("API is running");
});

export default app;
