import express from "express";
import { createFeedback } from "../controllers/feedbackController.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/analysis/:id/feedback",
  authenticate,
  createFeedback
);

export default router;