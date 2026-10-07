"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  ExternalLink,
  Loader2,
  MessageSquare,
  AlertTriangle,
  Database,
  Layers3,
  GitBranch,
  Download,
  ScanLine,
} from "lucide-react";

import {
  getAnalysisById,
  downloadAnalysisPDF,
} from "../../../../features/apis/analysisApi";

import { submitFeedback } from "../../../../features/apis/feedbackApi";

import { getToken } from "../../../../features/states/authState";

/* ---------- small SVG ring used for the headline hybrid-match number ---------- */

function ScoreRing({ percent = 0 }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(percent, 0), 100);
  const offset = c - (clamped / 100) * c;

  return (
    <svg viewBox="0 0 76 76" className="h-[76px] w-[76px] flex-shrink-0">
      <circle cx="38" cy="38" r={r} fill="none" stroke="#E7E2D6" strokeWidth="7" />
      <motion.circle
        cx="38"
        cy="38"
        r={r}
        fill="none"
        stroke="#047857"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        transform="rotate(-90 38 38)"
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      <text
        x="38"
        y="43"
        textAnchor="middle"
        fill="#1c1917"
        fontSize="15"
        fontWeight="600"
      >
        {clamped.toFixed(0)}%
      </text>
    </svg>
  );
}

function ScoreItem({ label, value }) {
  const numericValue = Number(value ?? 0);
  const pct = Math.min(Math.max(numericValue * 100, 0), 100);

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm text-stone-500">{label}</span>

        <span className="text-sm font-semibold text-stone-900">
          {numericValue.toFixed(4)}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
        <motion.div
          className="h-full rounded-full bg-emerald-700"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function RelationList({ title, items }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-stone-700">{title}</h4>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pdfLoading, setPdfLoading] = useState(false);

  const [feedbackState, setFeedbackState] = useState({});
  const [feedbackLoading, setFeedbackLoading] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState({});

  useEffect(() => {
    async function fetchAnalysis() {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await getAnalysisById(id, token);

        setAnalysis(response.analysis);
      } catch (err) {
        console.error("Failed to fetch analysis:", err);

        setError(err?.response?.data?.message || "Failed to load analysis");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [id, router]);

  async function handleDownloadPDF() {
    try {
      setPdfLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const blob = await downloadAnalysisPDF(id, token);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `${analysis?.filename || "analysis"}-report.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);

      setError(err?.response?.data?.message || "Failed to download PDF");
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleFeedback(recommendation, isRelevant) {
    const standardNumber =
      recommendation.standard_number || recommendation.standardNumber;

    if (!standardNumber) {
      return;
    }

    try {
      setFeedbackLoading((prev) => ({
        ...prev,
        [standardNumber]: true,
      }));

      setFeedbackMessage((prev) => ({
        ...prev,
        [standardNumber]: "",
      }));

      const token = getToken();

      await submitFeedback(
        id,
        {
          standardNumber,
          isRelevant,
          comment: "",
        },
        token
      );

      setFeedbackState((prev) => ({
        ...prev,
        [standardNumber]: isRelevant,
      }));

      setFeedbackMessage((prev) => ({
        ...prev,
        [standardNumber]: "Feedback submitted successfully.",
      }));
    } catch (err) {
      console.error("Feedback submission failed:", err);

      setFeedbackMessage((prev) => ({
        ...prev,
        [standardNumber]:
          err?.response?.data?.message || "Failed to submit feedback.",
      }));
    } finally {
      setFeedbackLoading((prev) => ({
        ...prev,
        [standardNumber]: false,
      }));
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 text-stone-500">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
            Loading analysis…
          </div>
        </div>
      </main>
    );
  }

  if (error && !analysis) {
    return (
      <main className="min-h-screen bg-stone-50">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
          <div className="w-full rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-600" strokeWidth={1.5} />

            <h1 className="mb-2 text-xl font-semibold text-stone-900">
              Failed to load analysis
            </h1>

            <p className="mb-6 text-sm text-stone-500">{error}</p>

            <button
              onClick={() => router.back()}
              data-cursor-hover
              className="rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Go back
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!analysis) {
    return null;
  }

  const recommendations = analysis.recommendations || [];

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          data-cursor-hover
          className="mb-8 flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back
        </button>

        {/* Header */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-emerald-50 text-emerald-700">
                <FileText className="h-5 w-5" strokeWidth={1.75} />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-stone-500">Analysis result</p>

                <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                  {analysis.filename}
                </h1>
              </div>
            </div>

            {/* Export PDF */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              data-cursor-hover
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pdfLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" strokeWidth={1.75} />
                  Export PDF
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-stone-500">
              Input type:{" "}
              <span className="font-medium text-stone-900">
                {analysis.inputType || analysis.input_type || "PDF"}
              </span>
            </span>

            <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-stone-500">
              Recommendations:{" "}
              <span className="font-medium text-stone-900">
                {recommendations.length}
              </span>
            </span>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </motion.section>

        {/* Extracted Text */}
        {(analysis.extractedTextPreview || analysis.extracted_text_preview) && (
          <motion.section
            className="mb-8 rounded-xl border border-stone-200 bg-white p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
          >
            <div className="mb-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-emerald-700" strokeWidth={1.75} />

              <h2 className="text-lg font-semibold text-stone-900">
                Extracted text preview
              </h2>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-lg border border-stone-200 bg-stone-50 p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-stone-600">
                {analysis.extractedTextPreview || analysis.extracted_text_preview}
              </p>
            </div>
          </motion.section>
        )}

        {/* Recommendations */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                Applicable Indian Standards
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Standards matched against the uploaded procurement document.
              </p>
            </div>
          </div>

          {recommendations.length === 0 ? (
            <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
              <Database className="mx-auto mb-3 h-8 w-8 text-stone-300" strokeWidth={1.5} />

              <p className="text-stone-500">No recommendations found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {recommendations.map((recommendation, index) => {
                const standardNumber =
                  recommendation.standard_number ||
                  recommendation.standardNumber ||
                  "Unknown Standard";

                const scores =
                  recommendation.hybrid_scores || recommendation.hybridScores || {};

                const relations =
                  recommendation.graph_relations || recommendation.graphRelations || {};

                const provenance = recommendation.provenance || {};

                const hybridScore = Number(
                  scores.hybrid_score ?? scores.hybridScore ?? 0
                );

                const percentage = hybridScore * 100;

                const keyClauses =
                  recommendation.key_clauses || recommendation.keyClauses || [];

                const matchJustification =
                  recommendation.match_justification ||
                  recommendation.matchJustification ||
                  "";

                const url = provenance.url_or_reference || provenance.urlOrReference || "";

                const retrievedAt = provenance.retrieved_at || provenance.retrievedAt || "";

                const feedback = feedbackState[standardNumber];

                const isFeedbackLoading = feedbackLoading[standardNumber];

                return (
                  <motion.article
                    key={`${standardNumber}-${index}`}
                    className="overflow-hidden rounded-xl border border-stone-200 bg-white"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.06 * index, ease: "easeOut" }}
                  >
                    {/* Recommendation Header */}
                    <div className="border-b border-stone-200 p-6">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              #{index + 1}
                            </span>

                            {recommendation.status && (
                              <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {recommendation.status}
                              </span>
                            )}
                          </div>

                          <h3 className="break-words text-xl font-semibold text-stone-900">
                            {standardNumber}
                          </h3>

                          <p className="mt-2 text-base text-stone-600">
                            {recommendation.title || "Untitled Standard"}
                          </p>

                          {recommendation.category && (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600">
                              <Layers3 className="h-4 w-4" strokeWidth={1.75} />
                              {recommendation.category}
                            </div>
                          )}
                        </div>

                        {/* Match Score */}
                        <div className="flex shrink-0 items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 lg:min-w-[220px]">
                          <ScoreRing percent={percentage} />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-stone-500">
                              Hybrid match
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-emerald-700">
                              {percentage.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="border-b border-stone-200 p-6">
                      <div className="mb-5 flex items-center gap-2">
                        <Database className="h-5 w-5 text-emerald-700" strokeWidth={1.75} />

                        <h4 className="font-semibold text-stone-900">Score breakdown</h4>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <ScoreItem label="Semantic" value={scores.semantic} />

                        <ScoreItem label="Lexical" value={scores.lexical} />

                        <ScoreItem label="Fuzzy" value={scores.fuzzy} />

                        <ScoreItem
                          label="Scope match"
                          value={scores.scope_match ?? scores.scopeMatch}
                        />

                        <ScoreItem
                          label="Obsolescence penalty"
                          value={scores.obsolescence_penalty ?? scores.obsolescencePenalty}
                        />

                        <ScoreItem label="Hybrid score" value={hybridScore} />
                      </div>
                    </div>

                    {/* Key Clauses */}
                    {keyClauses.length > 0 && (
                      <div className="border-b border-stone-200 p-6">
                        <div className="mb-4 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-emerald-700" strokeWidth={1.75} />

                          <h4 className="font-semibold text-stone-900">Key clauses</h4>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {keyClauses.map((clause, clauseIndex) => (
                            <div
                              key={clauseIndex}
                              className="rounded-lg border border-stone-200 bg-stone-50 p-4"
                            >
                              <div className="flex gap-3">
                                <span className="mt-0.5 font-mono text-xs font-semibold text-emerald-700">
                                  {String(clauseIndex + 1).padStart(2, "0")}
                                </span>

                                <p className="text-sm leading-6 text-stone-600">{clause}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Graph Relations */}
                    <div className="border-b border-stone-200 p-6">
                      <div className="mb-5 flex items-center gap-2">
                        <GitBranch className="h-5 w-5 text-emerald-700" strokeWidth={1.75} />

                        <h4 className="font-semibold text-stone-900">Graph relations</h4>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <RelationList
                          title="Normative references"
                          items={relations.normative_references || relations.normativeReferences}
                        />

                        <RelationList
                          title="Test methods"
                          items={relations.test_methods || relations.testMethods}
                        />

                        <RelationList title="Certifications" items={relations.certifications} />

                        <RelationList title="Supersedes" items={relations.supersedes} />
                      </div>
                    </div>

                    {/* Match Justification */}
                    {matchJustification && (
                      <div className="border-b border-stone-200 p-6">
                        <h4 className="mb-3 text-sm font-semibold text-stone-700">
                          Match justification
                        </h4>

                        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                          <p className="text-sm leading-6 text-stone-600">
                            {matchJustification}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Warnings */}
                    {recommendation.warnings?.length > 0 && (
                      <div className="border-b border-stone-200 p-6">
                        <div className="mb-4 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-600" strokeWidth={1.75} />

                          <h4 className="font-semibold text-stone-900">Warnings</h4>
                        </div>

                        <div className="space-y-2">
                          {recommendation.warnings.map((warning, warningIndex) => (
                            <div
                              key={warningIndex}
                              className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                            >
                              {warning}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Provenance */}
                    {(url || retrievedAt) && (
                      <div className="border-b border-stone-200 p-6">
                        <h4 className="mb-4 text-sm font-semibold text-stone-700">Provenance</h4>

                        <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
                          {provenance.type && (
                            <div>
                              <p className="text-xs text-stone-500">Source type</p>

                              <p className="mt-1 text-sm text-stone-700">{provenance.type}</p>
                            </div>
                          )}

                          {url && (
                            <div>
                              <p className="text-xs text-stone-500">Source</p>

                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-cursor-hover
                                className="mt-1 inline-flex items-center gap-2 break-all text-sm text-emerald-700 transition hover:text-emerald-600"
                              >
                                {url}

                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              </a>
                            </div>
                          )}

                          {retrievedAt && (
                            <div>
                              <p className="text-xs text-stone-500">Retrieved</p>

                              <p className="mt-1 text-sm text-stone-700">{retrievedAt}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    <div className="p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-emerald-700" strokeWidth={1.75} />

                        <div>
                          <h4 className="font-semibold text-stone-900">
                            Is this recommendation relevant?
                          </h4>

                          <p className="mt-1 text-xs text-stone-500">
                            Your feedback can help improve future matching.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={isFeedbackLoading}
                          onClick={() => handleFeedback(recommendation, true)}
                          data-cursor-hover
                          className={`rounded-md px-4 py-2.5 text-sm font-medium transition ${
                            feedback === true
                              ? "bg-emerald-700 text-white"
                              : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {isFeedbackLoading && feedback === true ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving…
                            </span>
                          ) : (
                            "Yes, relevant"
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isFeedbackLoading}
                          onClick={() => handleFeedback(recommendation, false)}
                          data-cursor-hover
                          className={`rounded-md px-4 py-2.5 text-sm font-medium transition ${
                            feedback === false
                              ? "bg-red-600 text-white"
                              : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {isFeedbackLoading && feedback === false ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving…
                            </span>
                          ) : (
                            "Not relevant"
                          )}
                        </button>
                      </div>

                      {feedbackMessage[standardNumber] && (
                        <p
                          className={`mt-3 text-sm ${
                            feedbackMessage[standardNumber].includes("successfully")
                              ? "text-emerald-700"
                              : "text-red-600"
                          }`}
                        >
                          {feedbackMessage[standardNumber]}
                        </p>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}