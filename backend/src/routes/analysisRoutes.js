import express from "express";

import {
  uploadAnalysis,
  getAnalyses,
  getAnalysisById,
  exportAnalysisPDF,
} from "../controllers/analysisController.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { uploadPDF } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  uploadPDF.single("file"),
  uploadAnalysis
);

router.get(
  "/",
  authenticate,
  getAnalyses
);



router.get(
  "/:id/pdf",
  authenticate,
  exportAnalysisPDF
);

router.get(
  "/:id",
  authenticate,
  getAnalysisById
);



export default router;