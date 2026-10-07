import Analysis from "../models/analysis.model.js";
import Feedback from "../models/Feedback.js";

export async function createFeedback(req, res) {
  try {
    const { id } = req.params;
    const { standardNumber, isRelevant, comment } = req.body;

    if (!standardNumber || typeof isRelevant !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "standardNumber and isRelevant are required",
      });
    }

    const analysis = await Analysis.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    const recommendationExists = analysis.recommendations.some(
      (recommendation) =>
        recommendation.standardNumber === standardNumber
    );

    if (!recommendationExists) {
      return res.status(400).json({
        success: false,
        message: "Standard is not part of this analysis",
      });
    }

    const feedback = await Feedback.create({
      userId: req.user.userId,
      analysisId: id,
      standardNumber,
      isRelevant,
      comment: comment || "",
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Feedback creation failed:");
    console.error(error);
    

    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
    });
  }
}