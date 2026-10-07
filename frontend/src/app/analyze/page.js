"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, ArrowLeft, X, ScanLine } from "lucide-react";
import { analyzePDF } from "../../../features/apis/analysisApi.js";
import { getToken } from "../../../features/states/authState.js";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

/* same dotted texture kept from the dashboard */
function DotGridBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-stone-300/60"
      aria-hidden="true"
    >
      <defs>
        <pattern id="analyzeDots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#analyzeDots)" />
    </svg>
  );
}

export default function AnalyzePage() {
  const router = useRouter();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function validateAndSetFile(selectedFile) {
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setFile(null);
      setError("Only PDF files are allowed.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("PDF size must be less than 10 MB.");
      return;
    }

    setFile(selectedFile);
  }

  function handleFileChange(event) {
    validateAndSetFile(event.target.files?.[0]);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    validateAndSetFile(event.dataTransfer.files?.[0]);
  }

  function handleRemoveFile() {
    setFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await analyzePDF(file, token);

      router.push(`/analysis/${data.analysis.id}`);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to analyze PDF. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-stone-50 text-stone-900">
      <DotGridBackground />

      <nav className="relative border-b border-stone-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-4">
          <Link
            href="/dashboard"
            data-cursor-hover
            className="flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
            Dashboard
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto max-w-3xl px-6 py-14">
        <motion.div
          className="mb-8"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <p className="mb-2 text-sm font-medium text-emerald-700">
            Standard analysis
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Analyze a procurement document
          </h1>

          <p className="mt-3 text-stone-500">
            Upload a procurement specification or tender PDF to identify the
            Indian Standards that apply to it.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
        >
          <label
            htmlFor="pdf"
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            data-cursor-hover
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-16 text-center transition-colors ${
              dragging
                ? "border-emerald-600 bg-emerald-50/60"
                : "border-stone-300 bg-stone-50 hover:border-emerald-500 hover:bg-emerald-50/30"
            }`}
          >
            <motion.div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"
              animate={dragging ? { scale: 1.1, rotate: -4 } : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {dragging ? (
                <ScanLine size={26} strokeWidth={1.75} />
              ) : (
                <Upload size={26} strokeWidth={1.75} />
              )}
            </motion.div>

            <h2 className="text-lg font-semibold text-stone-900">
              {dragging ? "Drop it here" : "Choose a PDF document"}
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              PDF only · Maximum 10 MB · or drag and drop
            </p>

            <input
              ref={inputRef}
              id="pdf"
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-5 flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4"
              >
                <FileText size={22} strokeWidth={1.75} className="shrink-0 text-emerald-700" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-900">
                    {file.name}
                  </p>

                  <p className="text-xs text-stone-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  data-cursor-hover
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-stone-400 transition hover:bg-stone-200 hover:text-stone-700"
                  aria-label="Remove file"
                >
                  <X size={16} strokeWidth={1.75} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading || !file}
            data-cursor-hover
            whileHover={!loading && file ? { scale: 1.01 } : {}}
            whileTap={!loading && file ? { scale: 0.98 } : {}}
            className="mt-6 w-full rounded-md bg-emerald-700 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing document…" : "Analyze PDF"}
          </motion.button>
        </motion.form>
      </section>
    </main>
  );
}