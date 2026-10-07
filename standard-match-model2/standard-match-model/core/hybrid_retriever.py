import numpy as np
from rank_bm25 import BM25Okapi
from rapidfuzz import fuzz
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any

class HybridRetriever:
    def __init__(self, standards: List[Dict[str, Any]], model_name: str = "all-MiniLM-L6-v2"):
        self.standards = standards
        self.corpus = []
        
        for std in self.standards:
            text = f"{std['standard_id']} - {std['title']}: {std['scope']} {' '.join(std.get('keywords', []))}"
            self.corpus.append(text)

        # 1. Lexical BM25 Index
        tokenized_corpus = [doc.lower().split() for doc in self.corpus]
        self.bm25 = BM25Okapi(tokenized_corpus)

        # 2. Semantic Embedding Index (with offline/fallback resilience)
        try:
            self.model = SentenceTransformer(model_name)
            self.embeddings = self.model.encode(self.corpus, show_progress_bar=False)
            self.has_semantic = True
        except Exception as e:
            print(f"Warning: Could not load sentence-transformer model ({e}). Falling back to lexical/fuzzy hybrid.")
            self.has_semantic = False
            self.embeddings = None

    def retrieve(self, query: str, top_k: int = 3, weights: Dict[str, float] = None) -> List[Dict[str, Any]]:
        if weights is None:
            weights = {
                "semantic": 0.45,
                "lexical": 0.25,
                "fuzzy": 0.20,
                "scope": 0.10
            }

        query_lower = query.lower()
        query_tokens = query_lower.split()

        # BM25 scores
        bm25_scores = self.bm25.get_scores(query_tokens)
        max_bm25 = np.max(bm25_scores) if np.max(bm25_scores) > 0 else 1.0
        norm_bm25 = bm25_scores / max_bm25

        # Semantic scores
        if self.has_semantic and self.embeddings is not None:
            query_emb = self.model.encode(query, show_progress_bar=False)
            # Cosine similarity
            norms = np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(query_emb)
            norms[norms == 0] = 1e-10
            semantic_scores = np.dot(self.embeddings, query_emb) / norms
            # Normalize to [0, 1] roughly
            semantic_scores = np.clip(semantic_scores, 0.0, 1.0)
        else:
            semantic_scores = np.zeros(len(self.standards))

        scored_results = []
        for idx, std in enumerate(self.standards):
            # Fuzzy score against title + id
            title_text = f"{std['standard_id']} {std['title']}"
            fuzzy_score = fuzz.WRatio(query, title_text) / 100.0

            # Scope keyword overlap score
            scope_score = 1.0 if any(kw in query_lower for kw in std.get("keywords", [])) else 0.3

            # Combined hybrid score
            hybrid_score = (
                weights["semantic"] * float(semantic_scores[idx]) +
                weights["lexical"] * float(norm_bm25[idx]) +
                weights["fuzzy"] * float(fuzzy_score) +
                weights["scope"] * float(scope_score)
            )

            # Obsolescence Penalty
            obs_penalty = 0.0
            if std.get("status") != "ACTIVE":
                obs_penalty = 0.35
                hybrid_score -= obs_penalty

            scored_results.append({
                "standard_id": std["standard_id"],
                "title": std["title"],
                "scope": std["scope"],
                "category": std.get("category", "General"),
                "status": std.get("status", "ACTIVE"),
                "revision_year": std.get("revision_year"),
                "amendments": std.get("amendments", []),
                "normative_references": std.get("normative_references", []),
                "test_methods": std.get("test_methods", []),
                "certification": std.get("certification", []),
                "provenance": std.get("source"),
                "scores": {
                    "hybrid_score": round(float(hybrid_score), 4),
                    "semantic": round(float(semantic_scores[idx]), 4),
                    "lexical": round(float(norm_bm25[idx]), 4),
                    "fuzzy": round(float(fuzzy_score), 4),
                    "scope_match": round(float(scope_score), 4),
                    "obsolescence_penalty": round(obs_penalty, 2)
                }
            })

        # Sort descending by hybrid score
        scored_results.sort(key=lambda x: x["scores"]["hybrid_score"], reverse=True)
        return scored_results[:top_k]

def retrieve_with_graph(self, query: str, graph_engine, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Executes hybrid retrieval, then traverses NetworkX graph to inject 
        GRAPH_DERIVED candidate standards via NORMATIVE_REFERENCE edges.
        """
        direct_results = self.retrieve(query, top_k=top_k)
        expanded_results = list(direct_results)
        
        seen_ids = {r["standard_id"] for r in direct_results}

        for res in direct_results:
            std_id = res["standard_id"]
            neighborhood = graph_engine.get_neighborhood(std_id)
            
            for ref_id in neighborhood.get("normative_references", []):
                if ref_id not in seen_ids:
                    # Find ref in standards KB
                    ref_std = loader_lookup(ref_id) # helper or loader reference
                    if ref_std:
                        expanded_results.append({
                            "standard_id": ref_std["standard_id"],
                            "title": ref_std["title"],
                            "scope": ref_std["scope"],
                            "category": ref_std.get("category", "General"),
                            "status": ref_std.get("status", "ACTIVE"),
                            "match_type": "GRAPH_DERIVED",
                            "graph_origin": std_id,
                            "scores": {
                                "hybrid_score": round(res["scores"]["hybrid_score"] * 0.75, 4), # discounted graph weight
                                "final": round(res["scores"]["hybrid_score"] * 0.75, 4)
                            },
                            "provenance": ref_std.get("source")
                        })
                        seen_ids.add(ref_id)

        expanded_results.sort(key=lambda x: x["scores"].get("final", x["scores"].get("hybrid_score", 0)), reverse=True)
        return expanded_results[:top_k + 2]