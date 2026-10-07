"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Lock, CheckCircle2, Flag, ScanLine } from "lucide-react";
import { registerUser } from "../../../features/apis/authApi.js";
import { saveAuth } from "../../../features/states/authState.js";

const LABEL_CHECKS = [
  { field: "MRP (inclusive of taxes)", status: "ok" },
  { field: "Net quantity", status: "ok" },
  { field: "Manufacturing date", status: "flag" },
  { field: "Consumer care details", status: "ok" },
];

/* ---------- custom illustration: a jar label mid-scan ---------- */
/* Kept as a hand-built SVG on purpose — a stock photo here would look
   generic and raises licensing questions. Swap for a real product photo
   with next/image whenever you have one; the layout won't need to change. */

function LabelScanIllustration() {
  return (
    <svg viewBox="0 0 220 220" fill="none" className="h-full w-full">
      <ellipse cx="110" cy="196" rx="58" ry="8" fill="black" fillOpacity="0.18" />
      <rect x="58" y="46" width="104" height="140" rx="10" fill="#F5F3EF" stroke="#D6D0C4" strokeWidth="1.5" />
      <rect x="58" y="46" width="104" height="26" rx="10" fill="#E7E2D6" />
      <rect x="70" y="86" width="80" height="6" rx="3" fill="#C9C2B2" />
      <rect x="70" y="100" width="60" height="6" rx="3" fill="#C9C2B2" />
      <rect x="70" y="114" width="70" height="6" rx="3" fill="#C9C2B2" />
      <rect x="70" y="128" width="45" height="6" rx="3" fill="#C9C2B2" />
      <rect x="70" y="150" width="80" height="1" fill="#D6D0C4" />
      <rect x="70" y="158" width="50" height="7" rx="3" fill="#046C4E" fillOpacity="0.7" />
      <rect x="128" y="158" width="22" height="7" rx="3" fill="#B45309" fillOpacity="0.55" />

      {/* scanning sweep — framer-motion drives this, not CSS keyframes */}
      <motion.rect
        x="54"
        width="112"
        height="10"
        fill="url(#scanGradient)"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: [40, 170, 40], opacity: [0, 1, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.1, type: "spring", stiffness: 300, damping: 15 }}
      >
        <circle cx="168" cy="96" r="12" fill="#046C4E" />
        <path d="M163 96l3.4 3.4 7.6-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>

      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 300, damping: 15 }}
      >
        <circle cx="52" cy="150" r="11" fill="#B45309" />
        <path d="M52 145v6" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="52" cy="154.5" r="1.1" fill="white" />
      </motion.g>

      <defs>
        <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#34D399" stopOpacity="0" />
          <stop offset="0.5" stopColor="#34D399" stopOpacity="0.55" />
          <stop offset="1" stopColor="#34D399" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await registerUser(form);

      saveAuth(data.token, data.user);

      router.push("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* Brand / context panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden border-r border-stone-200 bg-stone-900 px-14 py-12 text-stone-50 lg:flex">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2 text-sm font-medium tracking-tight text-emerald-400">
              <ScanLine className="h-4 w-4" strokeWidth={1.75} />
              StandardMatch
            </div>

            <h1 className="mt-10 max-w-md text-4xl font-semibold leading-[1.1] tracking-tight">
              Scan a label. Know exactly which rule it breaks.
            </h1>
            <p className="mt-5 max-w-sm text-stone-400">
              StandardMatch reads product images and packaging labels and
              checks them against the Legal Metrology (Packaged Commodities)
              Rules, 2011 — line by line, declaration by declaration.
            </p>
          </motion.div>

          {/* illustration + mock scan result, side by side */}
          <motion.div
            className="flex items-center gap-6"
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          >
            <div className="h-40 w-40 flex-shrink-0">
              <LabelScanIllustration />
            </div>

            <div className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] p-5 font-mono text-[13px]">
              <div className="mb-4 flex items-center justify-between text-stone-400">
                <span>ghee-jar-500g.jpg</span>
                <span className="rounded bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-400">
                  3 of 4 found
                </span>
              </div>
              <ul className="space-y-2.5">
                {LABEL_CHECKS.map((item, i) => (
                  <motion.li
                    key={item.field}
                    className="flex items-center justify-between gap-3 border-b border-white/5 pb-2.5 last:border-none last:pb-0"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.12, duration: 0.35 }}
                  >
                    <span className="flex items-center gap-2 text-stone-300">
                      {item.status === "ok" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                      ) : (
                        <Flag className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
                      )}
                      {item.field}
                    </span>
                    <span
                      className={
                        item.status === "ok"
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }
                    >
                      {item.status === "ok" ? "declared" : "missing"}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.p
            className="text-xs text-stone-500"
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          >
            Built for Ministry of Consumer Affairs, Food &amp; Public
            Distribution — Legal Metrology compliance
          </motion.p>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center px-6 py-16">
          <motion.div
            className="w-full max-w-sm"
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700 lg:hidden">
              <ScanLine className="h-4 w-4" strokeWidth={1.75} />
              StandardMatch
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Start checking labels against Indian Standards.
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
              >
                <label className="mb-1.5 block text-sm text-stone-700">
                  Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" strokeWidth={1.75} />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                    minLength={3}
                    maxLength={50}
                    className="w-full rounded-md border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.35 }}
              >
                <label className="mb-1.5 block text-sm text-stone-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" strokeWidth={1.75} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-md border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, duration: 0.35 }}
              >
                <label className="mb-1.5 block text-sm text-stone-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" strokeWidth={1.75} />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                    className="w-full rounded-md border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                data-cursor-hover
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34, duration: 0.35 }}
                className="w-full rounded-md bg-emerald-700 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account…" : "Create account"}
              </motion.button>
            </form>

            <p className="mt-6 text-center text-sm text-stone-500">
              Already have an account?{" "}
              <a
                href="/"
                data-cursor-hover
                className="font-medium text-emerald-700 hover:text-emerald-600"
              >
                Log in
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}