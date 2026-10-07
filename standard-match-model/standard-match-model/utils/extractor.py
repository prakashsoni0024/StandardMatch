import pdfplumber
import io

class DocumentExtractor:
    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        """
        Extracts text from uploaded PDF bytes using pdfplumber.
        """
        extracted_text = ""
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
            
        return extracted_text.strip()