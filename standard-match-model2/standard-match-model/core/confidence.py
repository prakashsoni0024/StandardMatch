from typing import Dict, Any, List

class ConfidenceEngine:
    @staticmethod
    def evaluate_decision(hybrid_score: float, status: str, has_explicit_mention: bool, evidence_count: int) -> Dict[str, Any]:
        """
        Evaluates decision state: HIGH_CONFIDENCE, REVIEW_RECOMMENDED, or INSUFFICIENT_EVIDENCE.
        Avoids calling raw similarity scores calibrated probabilities.
        """
        reasons = []

        if hybrid_score < 0.25:
            return {
                "decision": "INSUFFICIENT_EVIDENCE",
                "required": True,
                "reason": ["Hybrid retrieval score is below acceptable threshold (< 0.25)", "Weak semantic/lexical overlap"]
            }

        if status != "ACTIVE":
            reasons.append(f"Standard status is {status} (Obsolescence penalty applied)")

        if has_explicit_mention:
            reasons.append("Explicit standard reference found in requirement text")
        else:
            reasons.append("Implicit semantic/lexical match derived from scope alignment")

        if hybrid_score >= 0.50 and status == "ACTIVE":
            decision = "HIGH_CONFIDENCE"
            required = False
        else:
            decision = "REVIEW_RECOMMENDED"
            required = True
            reasons.append("Score falls in review range or standard is inactive")

        return {
            "decision": decision,
            "required": required,
            "reason": reasons
        }