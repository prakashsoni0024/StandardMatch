# StandardMatch AI Model - API Documentation

Welcome! This is the AI/Matching microservice for **SIH26108**. It takes free-text procurement queries or uploaded tender PDFs and recommends the most applicable Indian Standards with clause-level justification.

---

## Base URL
`http://localhost:8000`

---

## Endpoints

### 1. Test Server
* **GET** `/`
* **Response:** Returns a welcome status message.

---

### 2. Predict from Free-Text Query
* **POST** `/predict-text`
* **Content-Type:** `application/json`
* **Request Body:**
  ```json
  {
    "text": "We need underground water storage tanks for a municipal project"
  }