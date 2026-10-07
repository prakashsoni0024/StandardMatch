import networkx as di
from typing import List, Dict, Any

class StandardsGraph:
    def __init__(self, standards: List[Dict[str, Any]]):
        self.graph = di.DiGraph()
        self._build_graph(standards)

    def _build_graph(self, standards: List[Dict[str, Any]]):
        for std in standards:
            std_id = std["standard_id"]
            self.graph.add_node(std_id, type="Standard", title=std["title"], status=std.get("status"))

            # Add Normative References
            for ref in std.get("normative_references", []):
                self.graph.add_node(ref, type="NormativeReference")
                self.graph.add_edge(std_id, ref, relationship="NORMATIVE_REFERENCE")

            # Add Superseded relations
            for sup in std.get("supersedes", []):
                self.graph.add_node(sup, type="SupersededStandard")
                self.graph.add_edge(std_id, sup, relationship="SUPERSEDES")

            # Add Test Methods
            for tm in std.get("test_methods", []):
                self.graph.add_node(tm, type="TestMethod")
                self.graph.add_edge(std_id, tm, relationship="TESTED_BY")

            # Add Certifications
            for cert in std.get("certification", []):
                self.graph.add_node(cert, type="Certification")
                self.graph.add_edge(std_id, cert, relationship="REQUIRES_CERTIFICATION")

    def get_neighborhood(self, standard_id: str) -> Dict[str, List[str]]:
        if standard_id not in self.graph:
            return {"normative_references": [], "test_methods": [], "certifications": [], "supersedes": []}

        neighbors = {
            "normative_references": [],
            "test_methods": [],
            "certifications": [],
            "supersedes": []
        }

        for _, target, data in self.graph.out_edges(standard_id, data=True):
            rel = data.get("relationship")
            if rel == "NORMATIVE_REFERENCE":
                neighbors["normative_references"].append(target)
            elif rel == "TESTED_BY":
                neighbors["test_methods"].append(target)
            elif rel == "REQUIRES_CERTIFICATION":
                neighbors["certifications"].append(target)
            elif rel == "SUPERSEDES":
                neighbors["supersedes"].append(target)

        return neighbors