import Analysis from "../models/analysis.model.js";
import { analyzePDF } from "../services/modelService.js";
import { generateAnalysisPDF } from "../services/pdfService.js";

export async function uploadAnalysis(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    const modelResult = await analyzePDF(req.file.path);

    const analysis = await Analysis.create({
      userId: req.user.userId,

      inputType: modelResult.input_type,

      filename: req.file.originalname,

      extractedTextPreview: modelResult.extracted_text_preview,

      recommendations: modelResult.recommendations.map((recommendation) => ({
        standardNumber: recommendation.standard_number,
        title: recommendation.title,
        category: recommendation.category,
        status: recommendation.status,

        hybridScores: {
          hybridScore: recommendation.hybrid_scores.hybrid_score,
          semantic: recommendation.hybrid_scores.semantic,
          lexical: recommendation.hybrid_scores.lexical,
          fuzzy: recommendation.hybrid_scores.fuzzy,
          scopeMatch: recommendation.hybrid_scores.scope_match,
          obsolescencePenalty:
            recommendation.hybrid_scores.obsolescence_penalty,
        },

        keyClauses: recommendation.key_clauses,

        graphRelations: {
          normativeReferences:
            recommendation.graph_relations.normative_references,

          testMethods:
            recommendation.graph_relations.test_methods,

          certifications:
            recommendation.graph_relations.certifications,

          supersedes:
            recommendation.graph_relations.supersedes,
        },

        warnings: recommendation.warnings,

        provenance: {
          type: recommendation.provenance.type,

          urlOrReference:
            recommendation.provenance.url_or_reference,

          retrievedAt:
            recommendation.provenance.retrieved_at,
        },

        matchJustification:
          recommendation.match_justification,
      })),
    });

    return res.status(201).json({
      success: true,
      message: "PDF analyzed successfully",

      analysis: {
        id: analysis._id,
        input_type: analysis.inputType,
        filename: analysis.filename,
        extracted_text_preview: analysis.extractedTextPreview,
        recommendations: modelResult.recommendations,
      },
    });
  } catch (error) {
    console.error("Analysis failed:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to analyze PDF",
    });
  }
}

export async function getAnalyses(req, res) {
  try {
    const analyses = await Analysis.find({
      userId: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .select(
        "inputType filename extractedTextPreview recommendations createdAt updatedAt"
      );

    return res.status(200).json({
      success: true,
      count: analyses.length,
      analyses,
    });
  } catch (error) {
    console.error("Failed to fetch analyses:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analysis history",
    });
  }
}

export async function getAnalysisById(req, res) {
  try {
    const { id } = req.params;

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

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Failed to fetch analysis:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analysis",
    });
  }
}

export async function exportAnalysisPDF(req, res) {
  try {
    const { id } = req.params;

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

    generateAnalysisPDF(analysis, res);
  } catch (error) {
    console.error("PDF export failed:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
    });
  }
}