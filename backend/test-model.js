import dotenv from "dotenv";
import { analyzePDF } from "./src/services/modelService.js";

dotenv.config();

const filePath = "./uploads/sih_test_data.pdf";
console.log("MODEL_SERVICE_URL:", process.env.MODEL_SERVICE_URL);

async function testModel() {
  try {
    const result = await analyzePDF(filePath);

    console.log("Model service working successfully");

    console.log(
      JSON.stringify(result, null, 2)
    );
  } catch (error) {
    console.error("Model service test failed:");
    console.error(error.message);
  }
}

testModel();