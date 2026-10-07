import dotenv from "dotenv";
import mongoose from "mongoose";
import Analysis from "./src/models/analysis.model.js";

dotenv.config();

const sampleAnalysis = {
  // Temporary userId will be added after fetching a user
  inputType: "pdf",

  filename: "testsih_docs.pdf",

  extractedTextPreview:
    "AN ISO 9001 & 14001 COMPANY\nTENDER DOCUMENT\nNIT No: SRO/CON/ETS/189 dated 22.12.2023.",

  recommendations: [
    {
      standardNumber: "IS 800:2007",
      title: "General Construction in Steel - Code of Practice",
      category: "Structural Engineering",
      status: "ACTIVE",

      hybridScores: {
        hybridScore: 0.5397,
        semantic: 0.3237,
        lexical: 1.0,
        fuzzy: 0.57,
        scopeMatch: 0.3,
        obsolescencePenalty: 0.0,
      },

      keyClauses: [
        "Non-destructive testing of welds",
        "Load testing",
      ],

      graphRelations: {
        normativeReferences: ["IS 2062", "IS 808"],
        testMethods: [
          "Non-destructive testing of welds",
          "Load testing",
        ],
        certifications: [
          "Compliance certification by licensed structural engineers",
        ],
        supersedes: ["IS 800:1984"],
      },

      warnings: [],

      provenance: {
        type: "BIS Official Published Catalogue Metadata",
        urlOrReference: "https://www.services.bis.gov.in/",
        retrievedAt: "2026-01-15",
      },

      matchJustification:
        "Extracted from tender text. Hybrid Match Score: 0.5397.",
    },
  ],
};

async function testAnalysis() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const user = await mongoose.connection
      .collection("users")
      .findOne({});

    if (!user) {
      console.log("No user found. Register a user first.");
      process.exit(1);
    }

    sampleAnalysis.userId = user._id;

    const analysis = await Analysis.create(sampleAnalysis);

    console.log("Analysis created successfully");
    console.log("Analysis ID:", analysis._id);

    console.log(
      JSON.stringify(analysis.toObject(), null, 2)
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error("Analysis test failed:");
    console.error(error);
    process.exit(1);
  }
}

testAnalysis();