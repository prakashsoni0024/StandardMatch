import mongoose from "mongoose";

const hybridScoresSchema = new mongoose.Schema(
  {
    hybridScore: {
      type: Number,
      required: true,
    },

    semantic: {
      type: Number,
      default: 0,
    },

    lexical: {
      type: Number,
      default: 0,
    },

    fuzzy: {
      type: Number,
      default: 0,
    },

    scopeMatch: {
      type: Number,
      default: 0,
    },

    obsolescencePenalty: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const graphRelationsSchema = new mongoose.Schema(
  {
    normativeReferences: {
      type: [String],
      default: [],
    },

    testMethods: {
      type: [String],
      default: [],
    },

    certifications: {
      type: [String],
      default: [],
    },

    supersedes: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  }
);

const provenanceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "",
    },

    urlOrReference: {
      type: String,
      default: "",
    },

    retrievedAt: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const recommendationSchema = new mongoose.Schema(
  {
    standardNumber: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "",
    },

    hybridScores: {
      type: hybridScoresSchema,
      required: true,
    },

    keyClauses: {
      type: [String],
      default: [],
    },

    graphRelations: {
      type: graphRelationsSchema,
      default: () => ({}),
    },

    warnings: {
      type: [String],
      default: [],
    },

    provenance: {
      type: provenanceSchema,
      default: () => ({}),
    },

    matchJustification: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    inputType: {
      type: String,
      enum: ["text", "pdf"],
      required: true,
    },

    filename: {
      type: String,
      default: null,
    },

    extractedTextPreview: {
      type: String,
      default: "",
    },

    recommendations: {
      type: [recommendationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;