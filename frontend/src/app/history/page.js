"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  Database,
  AlertTriangle,
} from "lucide-react";

import { getAnalyses } from "../../../features/apis/analysisApi";
import { getToken } from "../../../features/states/authState";

/* a stacked-documents + timeline illustration for the empty state */
function ArchiveIllustration() {
  return (
    <svg viewBox="0 0 200 150" fill="none" className="mx-auto h-32 w-40">
      <rect x="46" y="58" width="90" height="66" rx="7" fill="#EFEBE1" stroke="#D9D3C6" strokeWidth="1.5" />
      <rect x="58" y="42" width="90" height="66" rx="7" fill="#F5F3EF" stroke="#D9D3C6" strokeWidth="1.5" />
      <rect x="72" y="58" width="62" height="5" rx="2.5" fill="#DAD3C3" />
      <rect x="72" y="70" width="46" height="5" rx="2.5" fill="#DAD3C3" />
      <rect x="72" y="82" width="52" height="5" rx="2.5" fill="#DAD3C3" />

      <path d="M20 132 h64" stroke="#D9D3C6" strokeWidth="1.5" strokeDasharray="1 6" strokeLinecap="round" />
      <path d="M150 132 h30" stroke="#D9D3C6" strokeWidth="1.5" strokeDasharray="1 6" strokeLinecap="round" />

      <motion.circle
        cx="20" cy="132" r="4.5" fill="#047857"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 14 }}
      />
      <motion.circle
        cx="180" cy="132" r="4.5" fill="#B45309"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 14 }}
      />
    </svg>
  );
}

/* a little "document thumbnail" used per history row instead of a plain icon —
   each one reads as a small preview image of a scanned page rather than a generic icon */
function DocThumb({ flagged }) {
  return (
    <svg viewBox="0 0 56 56" className="h-11 w-11 flex-shrink-0">
      <rect x="4" y="3" width="40" height="50" rx="5" fill="#F5F3EF" stroke="#D9D3C6" strokeWidth="1.3" />
      <rect x="11" y="12" width="26" height="4" rx="2" fill="#DAD3C3" />
      <rect x="11" y="21" width="20" height="4" rx="2" fill="#DAD3C3" />
      <rect x="11" y="30" width="24" height="4" rx="2" fill="#DAD3C3" />
      <circle cx="42" cy="40" r="12" fill={flagged ? "#FEF3C7" : "#ECFDF5"} stroke={flagged ? "#B45309" : "#047857"} strokeWidth="1.5" />
      {flagged ? (
        <path d="M42 35v6" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M37 40l3.4 3.4 7-7.4" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {flagged && <circle cx="42" cy="44.5" r="1.1" fill="#B45309" />}
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function HistoryPage() {
  const router = useRouter();

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        console.log("HISTORY TOKEN:", token);

        if (!token) {
          console.log("No token found");
          router.push("/login");
          return;
        }

        const response = await getAnalyses(token);

        console.log("HISTORY API RESPONSE:", response);

        setAnalyses(response.analyses || []);
      } catch (err) {
        console.error("Failed to fetch history:", err);

        setError(
          err?.response?.data?.message || "Failed to load analysis history",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [router]);

  function formatDate(date) {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getRecommendationCount(analysis) {
    return analysis.recommendations?.length || 0;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 text-stone-500">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
            Loading history…
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-stone-50">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
          <div className="w-full rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-600" strokeWidth={1.5} />

            <h1 className="mb-2 text-xl font-semibold text-stone-900">
              Failed to load history
            </h1>

            <p className="mb-6 text-sm text-stone-500">{error}</p>

            <button
              onClick={() => window.location.reload()}
              data-cursor-hover
              className="rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/dashboard"
          data-cursor-hover
          className="mb-6 inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Dashboard
        </Link>

        {/* Header */}
        <motion.section
          className="mb-8"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-stone-200 bg-emerald-50 text-emerald-700">
              <Database className="h-5 w-5" strokeWidth={1.75} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Analysis history
              </h1>

              <p className="mt-1 text-sm text-stone-500">
                View your previously analyzed procurement documents.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Empty State */}
        {analyses.length === 0 ? (
          <motion.div
            className="rounded-xl border border-stone-200 bg-white p-12 text-center"
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          >
            <ArchiveIllustration />

            <h2 className="mt-2 text-lg font-semibold text-stone-900">
              No analyses yet
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              Upload a procurement document to create your first analysis.
            </p>

            <button
              onClick={() => router.push("/analyze")}
              data-cursor-hover
              className="mt-6 rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600"
            >
              Analyze PDF
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis, i) => {
              const recommendationCount = getRecommendationCount(analysis);
              const flagged = recommendationCount === 0;

              return (
                <motion.button
                  key={analysis._id}
                  type="button"
                  onClick={() => router.push(`/analysis/${analysis._id}`)}
                  data-cursor-hover
                  className="group w-full rounded-xl border border-stone-200 bg-white p-5 text-left transition-colors hover:border-emerald-600"
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  transition={{ duration: 0.4, delay: 0.05 * i, ease: "easeOut" }}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left */}
                    <div className="flex min-w-0 items-center gap-4">
                      <DocThumb flagged={flagged} />

                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-stone-900 sm:text-lg">
                          {analysis.filename}
                        </h2>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-500">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} />
                            {formatDate(analysis.createdAt)}
                          </span>

                          <span>
                            {recommendationCount}{" "}
                            {recommendationCount === 1
                              ? "recommendation"
                              : "recommendations"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex shrink-0 items-center justify-end">
                      <span className="flex items-center gap-2 text-sm font-medium text-stone-400 transition group-hover:text-emerald-700">
                        View analysis
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}