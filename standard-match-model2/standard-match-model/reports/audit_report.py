import json
from datetime import datetime
from typing import Dict, Any

class AuditReportGenerator:
    @staticmethod
    def generate_json_report(analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "report_metadata": {
                "system": "StandardTrace AI - Compliance Intelligence Engine",
                "version": "3.0",
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "notice": "AI-Assisted Recommendation — Human Verification Required"
            },
            "analysis": analysis_result
        }

    @staticmethod
    def generate_html_report(analysis_result: Dict[str, Any]) -> str:
        report = AuditReportGenerator.generate_json_report(analysis_result)
        html = f"""
        <html>
        <head><title>StandardTrace Compliance Audit Report</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; color: #333; }}
            h1 {{ color: #1a365d; }}
            .section {{ margin-bottom: 20px; padding: 15px; border: 1px solid #cbd5e0; border-radius: 5px; background: #f8fafc; }}
            .badge-high {{ background: #c6f6d5; color: #22543d; padding: 3px 8px; border-radius: 4px; }}
            .badge-review {{ background: #feebc8; color: #744210; padding: 3px 8px; border-radius: 4px; }}
        </style>
        </head>
        <body>
            <h1>StandardTrace AI - Compliance Audit Report</h1>
            <p><b>Generated At:</b> {report['report_metadata']['generated_at']}</p>
            <div class="section">
                <h3>Extracted Requirements ({len(analysis_result.get('requirements', []))})</h3>
                <ul>
        """
        for req in analysis_result.get("requirements", []):
            html += f"<li><b>{req['requirement_id']}</b>: {req['text']} (Section: {req['section']})</li>"
        
        html += """
                </ul>
            </div>
            <div class="section">
                <h3>Recommendations & Evidence</h3>
        """
        for rec in analysis_result.get("recommendations", []):
            html += f"""
                <p><b>{rec['standard_id']}</b> - {rec['title']} <span class="badge-high">{rec['decision']}</span></p>
                <p><i>Match Type:</i> {rec['match_type']} | <i>Status:</i> {rec['status']}</p>
                <hr>
            """
        html += """
            </div>
        </body>
        </html>
        """
        return html