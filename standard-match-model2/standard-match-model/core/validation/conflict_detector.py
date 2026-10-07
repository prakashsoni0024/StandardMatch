from typing import List, Dict, Any

class ConflictDetector:
    @staticmethod
    def detect_conflicts(recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        conflicts = []
        
        # Check for version/supersession conflicts in recommendations
        active_ids = [r["standard_id"] for r in recommendations if r.get("status") == "ACTIVE"]
        superseded_ids = [r["standard_id"] for r in recommendations if r.get("status") != "ACTIVE"]

        if active_ids and superseded_ids:
            conflicts.append({
                "conflict_type": "VERSION_CONFLICT",
                "severity": "HIGH",
                "description": "Both active and superseded standards are referenced in the recommendation set.",
                "affected_standards": active_ids + superseded_ids,
                "rule_triggered": "RULE_VERSION_COLLISION"
            })

        if len(recommendations) > 1 and all(r.get("hybrid_scores", {}).get("final", 0) > 0.4 for r in recommendations[:2]):
            score_diff = abs(recommendations[0]["hybrid_scores"]["final"] - recommendations[1]["hybrid_scores"]["final"])
            if score_diff < 0.03:
                conflicts.append({
                    "conflict_type": "POTENTIAL_CONFLICT — HUMAN_REVIEW_REQUIRED",
                    "severity": "MEDIUM",
                    "description": f"Close semantic scores between {recommendations[0]['standard_id']} and {recommendations[1]['standard_id']}.",
                    "affected_standards": [recommendations[0]["standard_id"], recommendations[1]["standard_id"]],
                    "rule_triggered": "RULE_CLOSE_CANDIDATE_COLLISION"
                })

        return conflicts