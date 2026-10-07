# from typing import Dict, Any, List

# class EvidenceMapper:
#     @staticmethod
#     def map_evidence(requirement: Dict[str, Any], standard: Dict[str, Any], match_type: str = "DIRECT_MATCH") -> Dict[str, Any]:
#         """
#         Maps a requirement to a recommended standard, providing structured provenance 
#         and honestly handling missing clause text.
#         """
#         evidence_list = [
#             {
#                 "type": "REQUIREMENT_TEXT",
#                 "page": requirement.get("page", 1),
#                 "section": requirement.get("section", "General"),
#                 "text": requirement.get("text", "")
#             },
#             {
#                 "type": "STANDARD_SCOPE",
#                 "source": f"BIS Standard {standard['standard_id']} - {standard['title']}: {standard['scope']}"
#             }
#         ]

#         # Handle clause evidence honesty constraint
#         clause_evidence = "Clause-level evidence unavailable from current indexed source."
#         if standard.get("test_methods"):
#             clause_evidence = f"Aligned testing/parameter requirements: {', '.join(standard['test_methods'])}"

#         return {
#             "standard_id": standard["standard_id"],
#             "title": standard["title"],
#             "match_type": match_type,
#             "evidence": evidence_list,
#             "clause_summary": clause_evidence,
#             "status": standard.get("status", "ACTIVE"),
#             "amendments": standard.get("amendments", []),
#             "certification": {
#                 "scheme": standard.get("certification", ["Not Specified"])[0],
#                 "mandatory_status": "POTENTIALLY_APPLICABLE",
#                 "verification_required": True
#             }
#         }



from typing import Dict, Any, List

class EvidenceMapper:
    @staticmethod
    def map_evidence(requirement: Dict[str, Any], standard: Dict[str, Any], match_type: str = "DIRECT_MATCH") -> Dict[str, Any]:
        """
        Maps evidence strictly adhering to honest terminology. No fabricated clause numbers.
        """
        evidence_list = [
            {
                "type": "REQUIREMENT_TEXT",
                "page": requirement.get("page", 1),
                "section": requirement.get("section", "General"),
                "text": requirement.get("text", "")
            },
            {
                "type": "STANDARD_SCOPE",
                "source": f"BIS Standard {standard['standard_id']} - {standard['title']}: {standard['scope']}"
            }
        ]

        # Strict evidence honesty: clause-level text is unavailable from indexed source metadata
        return {
            "standard_id": standard["standard_id"],
            "title": standard["title"],
            "match_type": match_type,
            "evidence": evidence_list,
            "clause_evidence": None,
            "clause_evidence_status": "UNAVAILABLE",
            "status": standard.get("status", "ACTIVE"),
            "amendments": standard.get("amendments", []),
            "certification": {
                "scheme": "NOT_EVALUATED",
                "mandatory_status": "NOT_EVALUATED",
                "verification_required": True,
                "reason": "No explicit certification rule evaluated for this record."
            }
        }