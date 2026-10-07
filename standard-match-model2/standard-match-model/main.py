# from fastapi import FastAPI, UploadFile, File, HTTPException
# from pydantic import BaseModel
# from utils.matcher import StandardsMatcher
# from utils.extractor import DocumentExtractor

# app = FastAPI(
#     title="StandardMatch AI Engine",
#     description="AI-powered recommendation engine for identifying applicable Indian Standards.",
#     version="1.0"
# )

# # Initialize the matcher
# matcher = StandardsMatcher()

# class QueryRequest(BaseModel):
#     text: str

# @app.get("/")
# def home():
#     return {"message": "StandardMatch AI Model API is running successfully!"}

# @app.post("/predict-text")
# def predict_from_text(request: QueryRequest):
#     """
#     Endpoint for free-text procurement queries.
#     """
#     if not request.text.strip():
#         raise HTTPException(status_code=400, description="Query text cannot be empty.")
    
#     results = matcher.match(request.text, limit=3)
#     return {
#         "input_type": "text",
#         "query": request.text,
#         "recommendations": results
#     }

# @app.post("/predict-pdf")
# async def predict_from_pdf(file: UploadFile = File(...)):
#     """
#     Endpoint for uploaded draft tender or specification PDFs.
#     """
#     if not file.filename.endswith(".pdf"):
#         raise HTTPException(status_code=400, description="Only PDF files are supported.")
    
#     file_bytes = await file.read()
#     extracted_text = DocumentExtractor.extract_text_from_pdf(file_bytes)
    
#     if not extracted_text:
#         raise HTTPException(status_code=400, description="Could not extract text from the uploaded PDF.")
    
#     # Match using the extracted text (taking first 1000 characters for robust matching context)
#     query_context = extracted_text[:1000]
#     results = matcher.match(query_context, limit=3)
    
#     return {
#         "input_type": "pdf",
#         "filename": file.filename,
#         "extracted_text_preview": query_context[:200] + "...",
#         "recommendations": results
#     }

from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from utils.extractor import DocumentExtractor
from core.loader import StandardsLoader
from core.hybrid_retriever import HybridRetriever
from core.graph_engine import StandardsGraph

app = FastAPI(
    title="StandardTrace AI Engine",
    description="Evidence-backed Indian Standards Recommendation, Compliance & Traceability Engine",
    version="2.0"
)

# Initialize core engines at startup
loader = StandardsLoader("data/bis_knowledge_base.json")
retriever = HybridRetriever(loader.get_all_standards())
graph_engine = StandardsGraph(loader.get_all_standards())

class QueryRequest(BaseModel):
    text: str

@app.get("/")
def home():
    return {"message": "StandardTrace AI Engine (Milestone 2) is running successfully!"}

@app.post("/predict-text")
def predict_from_text(request: QueryRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")
    
    candidates = retriever.retrieve(request.text, top_k=3)
    
    recommendations = []
    for cand in candidates:
        std_id = cand["standard_id"]
        graph_relations = graph_engine.get_neighborhood(std_id)
        
        # Version conflict / status validation check
        warnings = []
        if cand["status"] != "ACTIVE":
            warnings.append(f"OUTDATED STANDARD WARNING: {std_id} has status '{cand['status']}'.")

        recommendations.append({
            "standard_number": std_id,
            "title": cand["title"],
            "category": cand["category"],
            "status": cand["status"],
            "hybrid_scores": cand["scores"],
            "key_clauses": cand["test_methods"],
            "graph_relations": graph_relations,
            "warnings": warnings,
            "provenance": cand["provenance"],
            "match_justification": f"Matched via hybrid retrieval (Hybrid Score: {cand['scores']['hybrid_score']}). Scope alignment verified."
        })

    return {
        "input_type": "text",
        "query": request.text,
        "recommendations": recommendations
    }

@app.post("/predict-pdf")
async def predict_from_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    file_bytes = await file.read()
    extracted_text = DocumentExtractor.extract_text_from_pdf(file_bytes)
    
    if not extracted_text:
        raise HTTPException(status_code=400, detail="Could not extract text from the uploaded PDF.")
    
    query_context = extracted_text[:1500]
    candidates = retriever.retrieve(query_context, top_k=3)
    
    recommendations = []
    for cand in candidates:
        std_id = cand["standard_id"]
        graph_relations = graph_engine.get_neighborhood(std_id)
        
        warnings = []
        if cand["status"] != "ACTIVE":
            warnings.append(f"OUTDATED STANDARD WARNING: {std_id} has status '{cand['status']}'.")

        recommendations.append({
            "standard_number": std_id,
            "title": cand["title"],
            "category": cand["category"],
            "status": cand["status"],
            "hybrid_scores": cand["scores"],
            "key_clauses": cand["test_methods"],
            "graph_relations": graph_relations,
            "warnings": warnings,
            "provenance": cand["provenance"],
            "match_justification": f"Extracted from tender text. Hybrid Match Score: {cand['scores']['hybrid_score']}."
        })

    return {
        "input_type": "pdf",
        "filename": file.filename,
        "extracted_text_preview": query_context[:200] + "...",
        "recommendations": recommendations
    }