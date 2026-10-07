import pdfplumber
from typing import List, Dict, Any

class DocumentParser:
    @staticmethod
    def parse_pdf(file_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Extracts text preserving actual page numbers and sections using pdfplumber.
        Returns a list of page objects with text and page numbers.
        """
        pages_data = []
        import io
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                pages_data.append({
                    "page_number": i + 1,
                    "text": text
                })
        return pages_data