"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileSearch,
  History,
  LogOut,
  ArrowRight,
  ScanLine,
  ShieldCheck,
  Flag,
} from "lucide-react";
import { getUser, clearAuth } from "../../../features/states/authState.js";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

/* small compliance-ring illustration for the hero band */
function ComplianceRing({ percent = 82 }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28 flex-shrink-0">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#ffffff1a" strokeWidth="8" />
      <motion.circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="#34D399"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        transform="rotate(-90 50 50)"
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
      />
      <text
        x="50"
        y="47"
        textAnchor="middle"
        fill="#fff"
        fontSize="20"
        fontWeight="600"
        fontFamily="inherit"
      >
        {percent}%
      </text>
      <text
        x="50"
        y="63"
        textAnchor="middle"
        fill="#a8a29e"
        fontSize="8"
      >
        avg. match
      </text>
    </svg>
  );
}

/* faint dot-grid used as a page-background texture, not a card decoration */
function DotGridBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-stone-300/60"
      aria-hidden="true"
    >
      <defs>
        <pattern id="dashDots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dashDots)" />
    </svg>
  );
}

const STATS = [
  { label: "Documents scanned", value: "24", icon: FileSearch },
  { label: "Standards matched", value: "97", icon: ShieldCheck },
  { label: "Flagged for review", value: "5", icon: Flag },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getUser();

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    setUser(currentUser);
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.replace("/login");
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-sm text-stone-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-stone-50 text-stone-900">
      <DotGridBackground />

      {/* Navbar */}
      <nav className="relative border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            data-cursor-hover
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-stone-900"
          >
            <ScanLine className="h-5 w-5 text-emerald-700" strokeWidth={1.75} />
            StandardMatch
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-stone-900">{user.name}</p>
              <p className="text-xs text-stone-500">{user.email}</p>
            </div>

            <button
              onClick={handleLogout}
              data-cursor-hover
              className="flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-600 transition hover:border-stone-400 hover:bg-stone-100 hover:text-stone-900"
            >
              <LogOut size={16} strokeWidth={1.75} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="relative mx-auto max-w-6xl px-6 py-12">
        {/* Dark hero band — same panel language as the login/register brand side */}
        <motion.div
          className="relative mb-10 overflow-hidden rounded-xl bg-stone-900 px-8 py-9 text-stone-50 sm:px-10"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-sm font-medium text-emerald-400">Dashboard</p>
              <h1 className="max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
                Welcome, {user.name}
              </h1>
              <p className="mt-3 max-w-md text-sm text-stone-400">
                Identify the Indian Standards that apply to your procurement
                specifications, and see how each one was matched.
              </p>
            </div>

            <ComplianceRing percent={82} />
          </div>
        </motion.div>

        {/* Quick stats strip */}
        <motion.div
          className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
        >
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white px-5 py-4"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-xl font-semibold leading-none text-stone-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Actions */}
        <div className="grid gap-5 md:grid-cols-2">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.16, ease: "easeOut" }}
          >
            <Link
              href="/analyze"
              data-cursor-hover
              className="group block h-full rounded-lg border border-stone-200 bg-white p-6 transition-colors hover:border-emerald-600"
            >
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md border border-stone-200 bg-emerald-50 text-emerald-700">
                <FileSearch size={20} strokeWidth={1.75} />
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    New analysis
                  </h2>

                  <p className="mt-2 text-sm text-stone-500">
                    Upload a procurement PDF and find the Indian Standards
                    that apply to it.
                  </p>
                </div>

                <ArrowRight
                  size={18}
                  strokeWidth={1.75}
                  className="flex-shrink-0 text-stone-300 transition group-hover:translate-x-1 group-hover:text-emerald-700"
                />
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.24, ease: "easeOut" }}
          >
            <Link
              href="/history"
              data-cursor-hover
              className="group block h-full rounded-lg border border-stone-200 bg-white p-6 transition-colors hover:border-emerald-600"
            >
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md border border-stone-200 bg-emerald-50 text-emerald-700">
                <History size={20} strokeWidth={1.75} />
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    Analysis history
                  </h2>

                  <p className="mt-2 text-sm text-stone-500">
                    View your previous procurement analyses and the
                    standards they matched.
                  </p>
                </div>

                <ArrowRight
                  size={18}
                  strokeWidth={1.75}
                  className="flex-shrink-0 text-stone-300 transition group-hover:translate-x-1 group-hover:text-emerald-700"
                />
              </div>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}