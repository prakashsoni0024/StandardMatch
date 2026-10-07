import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL;

export async function analyzePDF(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);

    const formData = new FormData();

    const pdfBlob = new Blob([fileBuffer], {
      type: "application/pdf",
    });

    formData.append("file", pdfBlob, "document.pdf");

    const response = await fetch(
      `${MODEL_SERVICE_URL}/predict-pdf`,
      {
        method: "POST",
        body: formData,
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error("FastAPI returned an error:");
      console.error("Status:", response.status);
      console.error("Response:", responseText);

      throw new Error(
        `Model service returned status ${response.status}`
      );
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Model service request failed:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    throw new Error("Failed to analyze PDF using AI model");
  }
}