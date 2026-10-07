# from typing import List, Dict, Any

# class ComplianceGapDetector:
#     @staticmethod
#     def detect_gaps(requirements: List[Dict[str, Any]], recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
#         gaps = []
#         gap_counter = 1

#         for req in requirements:
#             # Check if requirement mentions a standard that is superseded or missing
#             for std_ref in req.get("explicit_standards", []):
#                 matched = any(rec["standard_id"].upper() == std_ref.upper() for rec in recommendations)
#                 if not matched:
#                     gaps.append({
#                         "gap_id": f"GAP-{gap_counter:03d}",
#                         "requirement_id": req["requirement_id"],
#                         "type": "EXPLICIT_STANDARD_UNMATCHED",
#                         "severity": "MEDIUM",
#                         "description": f"Requirement explicitly cites '{std_ref}', but it was not matched in top recommendations.",
#                         "evidence": [req["text"]]
#                     })
#                     gap_counter += 1

#         for rec in recommendations:
#             if rec.get("status") != "ACTIVE":
#                 gaps.append({
#                     "gap_id": f"GAP-{gap_counter:03d}",
#                     "requirement_id": "GLOBAL",
#                     "type": "SUPERSEDED_STANDARD",
#                     "severity": "HIGH",
#                     "description": f"Recommended standard {rec['standard_id']} has status '{rec['status']}'. Potential compliance risk.",
#                     "evidence": [rec["title"]]
#                 })
#                 gap_counter += 1

#         return gaps

from typing import List, Dict, Any

class ComplianceGapDetector:
    @staticmethod
    def detect_gaps(requirements: List[Dict[str, Any]], recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        gaps = []
        gap_counter = 1

        for req in requirements:
            # 1. EXPLICIT_STANDARD_UNMATCHED
            for std_ref in req.get("explicit_standards", []):
                matched = any(rec["standard_id"].upper() == std_ref.upper() for rec in recommendations)
                if not matched:
                    gaps.append({
                        "gap_id": f"GAP-{gap_counter:03d}",
                        "requirement_id": req["requirement_id"],
                        "type": "EXPLICIT_STANDARD_UNMATCHED",
                        "severity": "MEDIUM",
                        "description": f"Requirement cites explicit standard '{std_ref}', but it was not returned in top recommendations.",
                        "evidence": [req["text"]],
                        "rule_triggered": "RULE_EXPLICIT_STD_CHECK"
                    })
                    gap_counter += 1

            # 2. AMBIGUOUS_REQUIREMENT
            if req["category"] == "GENERAL_SCOPE" and not req["mandatory"]:
                gaps.append({
                    "gap_id": f"GAP-{gap_counter:03d}",
                    "requirement_id": req["requirement_id"],
                    "type": "AMBIGUOUS_REQUIREMENT",
                    "severity": "LOW",
                    "description": "Requirement text is underspecified or lacks distinct modal parameters.",
                    "evidence": [req["text"]],
                    "rule_triggered": "RULE_AMBIGUITY_CHECK"
                })
                gap_counter += 1

        for rec in recommendations:
            # 3. SUPERSEDED_STANDARD
            if rec.get("status") != "ACTIVE":
                gaps.append({
                    "gap_id": f"GAP-{gap_counter:03d}",
                    "requirement_id": "GLOBAL",
                    "type": "SUPERSEDED_STANDARD",
                    "severity": "HIGH",
                    "description": f"Recommended standard {rec['standard_id']} has status '{rec['status']}'. Potential compliance risk.",
                    "evidence": [rec["title"]],
                    "rule_triggered": "RULE_OBSOLESCENCE_CHECK"
                })
                gap_counter += 1

            # 4. WEAK_EVIDENCE
            if rec.get("hybrid_scores", {}).get("final", 0.3) < 0.35:
                gaps.append({
                    "gap_id": f"GAP-{gap_counter:03d}",
                    "requirement_id": "GLOBAL",
                    "type": "WEAK_EVIDENCE",
                    "severity": "MEDIUM",
                    "description": f"Recommendation {rec['standard_id']} has low retrieval confidence.",
                    "evidence": [str(rec.get("hybrid_scores"))],
                    "rule_triggered": "RULE_CONFIDENCE_THRESHOLD_CHECK"
                })
                gap_counter += 1

        if not recommendations:
            gaps.append({
                "gap_id": f"GAP-{gap_counter:03d}",
                "requirement_id": "GLOBAL",
                "type": "NO_APPLICABLE_STANDARD",
                "severity": "HIGH",
                "description": "No applicable standard found matching the procurement specification.",
                "evidence": [],
                "rule_triggered": "RULE_ZERO_MATCH_CHECK"
            })

        return gaps