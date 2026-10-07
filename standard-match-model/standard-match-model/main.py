from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from utils.matcher import StandardsMatcher
from utils.extractor import DocumentExtractor

app = FastAPI(
    title="StandardMatch AI Engine",
    description="AI-powered recommendation engine for identifying applicable Indian Standards.",
    version="1.0"
)

# Initialize the matcher
matcher = StandardsMatcher()

class QueryRequest(BaseModel):
    text: str

@app.get("/")
def home():
    return {"message": "StandardMatch AI Model API is running successfully!"}

@app.post("/predict-text")
def predict_from_text(request: QueryRequest):
    """
    Endpoint for free-text procurement queries.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, description="Query text cannot be empty.")
    
    results = matcher.match(request.text, limit=3)
    return {
        "input_type": "text",
        "query": request.text,
        "recommendations": results
    }

@app.post("/predict-pdf")
async def predict_from_pdf(file: UploadFile = File(...)):
    """
    Endpoint for uploaded draft tender or specification PDFs.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, description="Only PDF files are supported.")
    
    file_bytes = await file.read()
    extracted_text = DocumentExtractor.extract_text_from_pdf(file_bytes)
    
    if not extracted_text:
        raise HTTPException(status_code=400, description="Could not extract text from the uploaded PDF.")
    
    # Match using the extracted text (taking first 1000 characters for robust matching context)
    query_context = extracted_text[:1000]
    results = matcher.match(query_context, limit=3)
    
    return {
        "input_type": "pdf",
        "filename": file.filename,
        "extracted_text_preview": query_context[:200] + "...",
        "recommendations": results
    }