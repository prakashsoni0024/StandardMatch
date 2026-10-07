import json
import os
from typing import List, Dict, Any

class StandardsLoader:
    def __init__(self, json_path: str = "data/bis_knowledge_base.json"):
        self.json_path = json_path
        self.standards: List[Dict[str, Any]] = []
        self.standards_map: Dict[str, Dict[str, Any]] = {}
        self._load_and_validate()

    def _load_and_validate(self):
        if not os.path.exists(self.json_path):
            # Fallback path check
            alt_path = "standard-match-model/data/bis_knowledge_base.json"
            if os.path.exists(alt_path):
                self.json_path = alt_path
            else:
                raise FileNotFoundError(f"Knowledge base not found at {self.json_path}")

        with open(self.json_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError as e:
                raise ValueError(f"Malformed JSON in knowledge base: {e}")

        if not isinstance(data, list):
            raise ValueError("Knowledge base root must be a list of standard objects.")

        required_fields = ["standard_id", "title", "scope", "status"]
        for idx, std in enumerate(data):
            for field in required_fields:
                if field not in std:
                    raise ValueError(f"Standard at index {idx} missing required field: '{field}'")
            
            # Normalize and store
            self.standards.append(std)
            self.standards_map[std["standard_id"]] = std

    get_all_standards = lambda self: self.standards
    get_standard = lambda self, std_id: self.standards_map.get(std_id)