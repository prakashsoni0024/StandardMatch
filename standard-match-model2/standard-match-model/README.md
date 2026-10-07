# StandardTrace AI 🛡️📜
### Evidence-Backed Indian Standards Recommendation, Compliance & Traceability Engine
**Smart India Hackathon 2026 | Problem Statement: SIH26108**  
**Organization:** Ministry of Consumer Affairs, Food & Public Distribution | **Department:** Department of Consumer Affairs (DoCA)  
**Theme:** Smart Automation | **Category:** Software

---

## 🚀 Overview
**StandardTrace AI** is an enterprise-grade, deterministic compliance intelligence engine designed to ingest government procurement specifications, technical descriptions, or tender PDFs, and automatically map, validate, and audit applicable **Indian Standards (BIS)**. 

Unlike generic LLM chatbots that suffer from hallucinations, StandardTrace combines **Hybrid Retrieval (BM25 + Semantic Embeddings + Fuzzy Matching)** with a **NetworkX Knowledge Graph**, explicit version/obsolescence tracking, and clause-level provenance to deliver audit-ready compliance reports.

---

## 🛠️ Key Features
1. **Document Intelligence:** Page-aware PDF parsing (`pdfplumber`) that preserves page boundaries and section contexts.
2. **Hybrid Retrieval:** Multi-signal ranking combining lexical search (`rank-bm25`), dense vector embeddings (`sentence-transformers`), and fuzzy matching (`rapidfuzz`).
3. **Standards Knowledge Graph:** NetworkX-based relationship traversal for normative references, test methods, and related standards (`GRAPH_DERIVED` candidate injection).
4. **Version & Amendment Intelligence:** Automatic detection of active, superseded, or withdrawn standards with obsolescence penalties and explicit warnings.
5. **Calibrated Decision States:** Transparent decision categorization (`HIGH_CONFIDENCE`, `REVIEW_RECOMMENDED`, `INSUFFICIENT_EVIDENCE`) without fake probability claims.
6. **Compliance Gap & Conflict Detection:** Automated detection of un-matched explicit standards, missing test requirements, and version collisions.
7. **Audit-Ready Reporting:** Exportable structured JSON and human-readable HTML compliance audit reports.

---

## 📂 Project Directory Structure
```text
standard-match-model/
├── core/
│   ├── loader.py               # Schema validation & KB loader
│   ├── hybrid_retriever.py     # BM25 + Semantic + Fuzzy hybrid search & graph expansion
│   ├── graph_engine.py         # NetworkX relationship graph traversal
│   ├── requirement_extractor.py# Page-aware requirement parser
│   ├── evidence_mapper.py      # Provenance & evidence mapping
│   ├── confidence.py           # Decision state evaluation engine
│   └── gap_detector.py         # Compliance gap & conflict rules
├── data/
│   └── bis_knowledge_base.json # Curated prototype standards corpus
├── evaluation/
│   ├── run_evaluation.py       # Automated 30-case evaluation runner
│   └── standardtrace_evaluation_dataset_30.json
├── reports/
│   └── audit_report.py         # JSON and HTML audit report generator
├── main.py                     # FastAPI unified application entry point
├── requirements.txt            # Project dependencies
└── README.md