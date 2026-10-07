import json
import os
import requests

API_URL = "http://localhost:8000/predict-text"
DATASET_PATH = "evaluation/standardtrace_evaluation_dataset_30.json"
RESULTS_PATH = "evaluation/results/evaluation_results.json"
ERROR_PATH = "evaluation/results/error_analysis.json"

def run_evaluation():
    os.makedirs("evaluation/results", exist_ok=True)
    
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset not found at {DATASET_PATH}")
        return

    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    cases = data.get("cases", [])
    results = []
    error_analyses = []

    total_cases = len(cases)
    passed_cases = 0
    top1_hits = 0
    mrr_sum = 0.0

    for case in cases:
        case_id = case["id"]
        query = case["query"]
        expected_standards = set(case.get("expected_standards", []))
        expected_decision = case.get("expected_decision")

        # Call production API
        try:
            response = requests.post(API_URL, json={"text": query}, timeout=10)
            if response.status_code == 200:
                resp_json = response.json()
            else:
                resp_json = {"error": f"HTTP {response.status_code}"}
        except Exception as e:
            resp_json = {"error": str(e)}

        recommendations = resp_json.get("recommendations", [])
        predicted_standards = [rec.get("standard_number") or rec.get("standard_id") for rec in recommendations]
        
        # Determine actual decision state
        actual_decision = "HIGH_CONFIDENCE"
        if not recommendations:
            actual_decision = "INSUFFICIENT_EVIDENCE"
        elif recommendations and recommendations[0].get("hybrid_scores", {}).get("final", recommendations[0].get("hybrid_scores", {}).get("hybrid_score", 1.0)) < 0.4:
            actual_decision = "REVIEW_RECOMMENDED"

        top_match = predicted_standards[0] if predicted_standards else None

        # Metrics calculation
        is_passed = False
        if not expected_standards:
            # No-match case
            if len(predicted_standards) == 0 or actual_decision == "INSUFFICIENT_EVIDENCE":
                is_passed = True
                top1_hits += 1
                mrr_sum += 1.0
        else:
            if top_match in expected_standards:
                top1_hits += 1
            
            found_rank = None
            for idx, pred in enumerate(predicted_standards[:3]):
                if pred in expected_standards:
                    found_rank = idx + 1
                    break
            if found_rank:
                mrr_sum += 1.0 / found_rank

            pred_set_3 = set(predicted_standards[:3])
            if expected_standards.issubset(pred_set_3) or top_match in expected_standards:
                is_passed = True

        if is_passed:
            passed_cases += 1

        match_types = [rec.get("match_type", "DIRECT_MATCH") for rec in recommendations]
        graph_derived = [rec.get("standard_number") for rec in recommendations if rec.get("match_type") == "GRAPH_DERIVED"]

        results.append({
            "id": case_id,
            "query": query,
            "expected_standards": list(expected_standards),
            "predicted_standards": predicted_standards,
            "expected_decision": expected_decision,
            "actual_decision": actual_decision,
            "top_match": top_match,
            "match_types": match_types,
            "graph_derived": graph_derived,
            "passed": is_passed,
            "raw_response": resp_json
        })

        if not is_passed:
            error_analyses.append({
                "id": case_id,
                "query": query,
                "expected_standards": list(expected_standards),
                "predicted_standards": predicted_standards,
                "expected_decision": expected_decision,
                "actual_decision": actual_decision,
                "likely_failure_category": "WRONG_STANDARD" if predicted_standards else "MISSED_STANDARD"
            })

    with open(RESULTS_PATH, "w", encoding="utf-8") as f:
        json.dump({"total": total_cases, "passed": passed_cases, "results": results}, f, indent=2)

    with open(ERROR_PATH, "w", encoding="utf-8") as f:
        json.dump({"error_cases": error_analyses}, f, indent=2)

    print(f"Evaluation complete. Executed: {total_cases}, Passed: {passed_cases}, Failed: {total_cases - passed_cases}")

if __name__ == "__main__":
    run_evaluation()