import express from "express"
import authRoutes from "../routes/auth.routes.js"
import analysisRoutes from "../routes/analysisRoutes.js";
import feedbackRoutes from "../routes/feedbackRoutes.js";
import cors from "cors"

const app = express();

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api", feedbackRoutes);

export default app