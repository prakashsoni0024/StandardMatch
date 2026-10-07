# StandardMatch

StandardMatch is a web platform that helps procurement teams **identify the Indian Standards (IS/BIS) that apply to their procurement and tender specifications**. Upload a procurement PDF and the system recommends the relevant standards and shows how each one was matched.

Built as part of **Smart India Hackathon 2026**.

## Features

- **User authentication**: log in and log out
- **Dashboard**: documents scanned, standards matched, items flagged for review, and average match score
- **New analysis**: upload a procurement PDF and get the applicable Indian Standards
- **Match explanation**: relevance scores, key clauses and a justification for each recommended standard
- **Flag for review**: low-confidence matches are marked for manual checking
- **Analysis history**: revisit previous analyses and the standards they matched

## Architecture

```
Frontend (Next.js)
      |
      v
Main Backend (API)
      |
      v
StandardMatch AI Engine (FastAPI)
  - PDF text extraction
  - Hybrid retrieval (semantic + BM25)
  - Fuzzy and scope matching
  - Standard recommendation
```

The AI engine runs as an independent service, so the model can be developed separately from the web app.

## Project Structure

```
StandardMatch/
├── frontend/                          # Next.js web app
├── backend/                           # Main API server
├── standard-match-model2/             # AI engine(FastAPI)
├── standardtrace_evaluation_dataset   # Dataset for evaluating matching quality
└── README.md
```

## Tech Stack

| Layer     | Technology |
| --------- | ---------- |
| Frontend  | Next.js, React, Tailwind CSS |
| Backend   | BACKEND_TECH |
| Database  | DATABASE |
| AI Engine | Python, FastAPI, Uvicorn |
| Retrieval | Sentence Transformers, rank-bm25, scikit-learn, PyTorch |
| PDF       | pdfplumber |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+ (the AI engine was developed with Python 3.14)

### 1. Clone

```bash
git clone https://github.com/prakashsoni0024/StandardMatch.git
cd StandardMatch
```

### 2. Run the AI engine

```bash
cd standard-match-model
pip install fastapi uvicorn pdfplumber rank-bm25 sentence-transformers
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

### 3. Run the backend

```bash
cd backend
npm install
# create a .env file (see below)
npm start
```

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create a `.env` file in `backend/`. Example:

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
AI_ENGINE_URL=http://localhost:8000
```

Never commit your `.env` file.

## AI Engine API

### `GET /`

Health check. Returns:

```json
{ "message": "StandardMatch AI Model API is running successfully!" }
```

### `POST /predict-text`

Accepts procurement text and returns applicable standards.

Request:

```json
{ "text": "Construction of steel structural framework for the building..." }
```

Response (fields depend on the current pipeline):

```json
{
  "recommendations": [
    {
      "standard_number": "IS 800:2007",
      "title": "General Construction in Steel - Code of Practice",
      "category": "Structural Engineering",
      "status": "ACTIVE",
      "hybrid_scores": {},
      "key_clauses": [],
      "normative_references": [],
      "test_methods": [],
      "warnings": [],
      "match_justification": "",
      "provenance": {}
    }
  ]
}
```

## How Matching Works

1. Text is extracted from the uploaded PDF.
2. Semantic search (Sentence Transformers) and lexical search (BM25) run in parallel.
3. Results are combined into a hybrid score, refined with fuzzy matching and scope matching.
4. An obsolescence penalty lowers the rank of superseded standards.
5. The top standards are returned with scores, clauses and a match justification.

Example scores for one standard:

```
Hybrid Score:          0.5397
Semantic Score:        0.3237
Lexical Score:         1.0000
Fuzzy Score:           0.5700
Scope Match:           0.3000
Obsolescence Penalty:  0.0000
```

## Troubleshooting

- **`ModuleNotFoundError`**: install the missing package with `pip install <name>`, then restart Uvicorn.
- **Uvicorn cannot import `main`**: run the command from the folder that contains `main.py`.
- **Port 8000 in use**: start with `--port 8001` and update `AI_ENGINE_URL`.

## Development Status

- [x] AI engine service (FastAPI, hybrid retrieval)
- [x] Frontend dashboard, analysis and history pages
- [ ] Validate recommendation output
- [ ] End-to-end testing

## Team

- **Prakash Soni**: frontend and backend ([@prakashsoni0024](https://github.com/prakashsoni0024))
- TEAMMATE: ROLE (e.g. AI engine)

## License

Developed for Smart India Hackathon 2026 for project and demo purposes.
