from typing import Dict, Any

class CertificationEngine:
    @staticmethod
    def evaluate_certification(standard: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates certification strictly from KB rules. Defaults to NOT_EVALUATED if absent.
        """
        certs = standard.get("certification", [])
        if not certs or any(c.lower() in ["not specified", "none"] for c in certs):
            return {
                "certification_scheme": "NONE",
                "applicability": "NOT_EVALUATED",
                "mandatory_status": "NOT_EVALUATED",
                "verification_required": True,
                "reason": "No certified compliance rules populated in KB for this standard."
            }

        return {
            "certification_scheme": certs[0],
            "applicability": "SUPPORTED_BY_KB",
            "mandatory_status": "POTENTIALLY_APPLICABLE",
            "verification_required": True,
            "reason": f"KB indicates applicable certification scheme: {certs[0]}"
        }