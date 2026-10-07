# import re
# from typing import List, Dict, Any

# class RequirementExtractor:
#     @staticmethod
#     def extract_requirements(text: str, source_name: str = "document.pdf") -> List[Dict[str, Any]]:
#         """
#         Parses text into structured procurement requirements using page/section heuristics 
#         and keyword/modal verb triggers without hallucinating unverified data.
#         """
#         requirements = []
#         lines = text.split("\n")
        
#         current_section = "General Specifications"
#         current_page = 1
#         req_counter = 1

#         # Keywords indicating mandatory procurement specifications
#         trigger_keywords = ["shall", "must", "required", "compliant", "conformance", "specification", "supply", "install"]

#         for idx, line in enumerate(lines):
#             line_stripped = line.strip()
#             if not line_stripped:
#                 continue

#             # Detect section headers (heuristic: short lines ending with colon or uppercase headers)
#             if len(line_stripped) < 60 and (line_stripped.isupper() or line_stripped.endswith(":") or "SECTION" in line_stripped.upper()):
#                 current_section = line_stripped.rstrip(":")
#                 continue

#             # Check if line contains mandatory procurement language or standard mentions
#             lower_line = line_stripped.lower()
#             is_mandatory = any(kw in lower_line for kw in ["shall", "must", "required"]) or "is " in lower_line

#             if is_mandatory or len(line_stripped) > 40:
#                 # Extract explicit standard references if present (e.g., IS 10500, IS 456)
#                 explicit_stds = re.findall(r'IS\s+\d+(?:\s*\(Pt\s*\d+\))?(?::\d{4})?', line_stripped, re.IGNORECASE)
                
#                 # Determine category
#                 category = "general_procurement"
#                 if any(w in lower_line for w in ["water", "tank", "chlorine", "reservoir"]):
#                     category = "water_sanitation"
#                 elif any(w in lower_line for w in ["steel", "tube", "pipe", "bar", "reinforcement"]):
#                     category = "civil_structural"
#                 elif any(w in lower_line for w in ["concrete", "cement", "aggregate", "paving"]):
#                     category = "construction_materials"
#                 elif any(w in lower_line for w in ["cable", "wire", "voltage", "electrical"]):
#                     category = "electrical_safety"

#                 req_id = f"REQ-{req_counter:03d}"
#                 requirements.append({
#                     "requirement_id": req_id,
#                     "text": line_stripped,
#                     "page": current_page,
#                     "section": current_section,
#                     "category": category,
#                     "explicit_standards": [s.upper() for s in explicit_stds],
#                     "mandatory": is_mandatory,
#                     "attributes": {
#                         "contains_modal_shall": "shall" in lower_line or "must" in lower_line
#                     }
#                 })
#                 req_counter += 1

#         # Fallback if text has no explicit modal verbs but has content
#         if not requirements and text.strip():
#             requirements.append({
#                 "requirement_id": "REQ-001",
#                 "text": text[:300].strip(),
#                 "page": 1,
#                 "section": "General Scope",
#                 "category": "general_procurement",
#                 "explicit_standards": re.findall(r'IS\s+\d+(?::\d{4})?', text, re.IGNORECASE),
#                 "mandatory": True,
#                 "attributes": {"contains_modal_shall": False}
#             })

#         return requirements

import re
from typing import List, Dict, Any

class RequirementExtractor:
    @staticmethod
    def extract_from_pages(pages_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Extracts structured requirements with precise categories and strict modal-verb checks.
        No generic length > 40 rules or unsafe 'is' checks.
        """
        requirements = []
        req_counter = 1

        modal_verbs = ["shall", "must", "required", "mandatory"]
        
        for page_obj in pages_data:
            page_num = page_obj["page_number"]
            lines = page_obj["text"].split("\n")
            current_section = "General Specifications"

            for line in lines:
                line_str = line.strip()
                if not line_str:
                    continue

                # Section heuristic
                if len(line_str) < 50 and (line_str.isupper() or line_str.endswith(":") or "SECTION" in line_str.upper()):
                    current_section = line_str.rstrip(":")
                    continue

                lower_line = line_str.lower()
                is_mandatory = any(modal in lower_line for modal in modal_verbs)
                
                # Check for explicit standard mentions
                explicit_stds = re.findall(r'IS\s+\d+(?:\s*\(Pt\s*\d+\))?(?::\d{4})?', line_str, re.IGNORECASE)

                # Categorization rules
                category = "GENERAL_SCOPE"
                if explicit_stds:
                    category = "EXPLICIT_STANDARD_REFERENCE"
                elif any(w in lower_line for w in ["test", "testing", "inspect", "trial"]):
                    category = "TEST_REQUIREMENT"
                elif any(w in lower_line for w in ["material", "grade", "steel", "concrete", "cement"]):
                    category = "MATERIAL_REQUIREMENT"
                elif any(w in lower_line for w in ["safety", "pressure", "load", "protection"]):
                    category = "SAFETY_REQUIREMENT"
                elif any(w in lower_line for w in ["install", "commission", "erection", "lay"]):
                    category = "INSTALLATION_REQUIREMENT"
                elif any(w in lower_line for w in ["capacity", "dimension", "size", "weight", "mm", "litres", "m3"]):
                    category = "TECHNICAL_SPECIFICATION"
                elif is_mandatory:
                    category = "PERFORMANCE_REQUIREMENT"

                # Only extract if it has clear procurement relevance (contains modal verb, explicit standard, or specific technical terms)
                if is_mandatory or explicit_stds or category != "GENERAL_SCOPE":
                    requirements.append({
                        "requirement_id": f"REQ-{req_counter:03d}",
                        "text": line_str,
                        "page": page_num,
                        "section": current_section,
                        "category": category,
                        "explicit_standards": [s.upper() for s in explicit_stds],
                        "mandatory": is_mandatory,
                        "attributes": {
                            "modal_verb_detected": is_mandatory
                        }
                    })
                    req_counter += 1

        return requirements