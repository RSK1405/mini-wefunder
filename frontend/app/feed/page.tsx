// app/feed/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Decision = "invest" | "pass";

interface Startup {
  id: string;
  name: string;
  pitch: string;
  industry: string;
  stage: string;
  raise: string;
  growth: string;
}

interface HistoryEntry {
  startup: Startup;
  decision: Decision;
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const STARTUPS: Startup[] = [
  {
    id: "1",
    name: "NeuralNest",
    pitch:
      "On-device AI that turns any home into an adaptive smart environment—cutting energy bills by 34%, no hub required.",
    industry: "AI / SaaS",
    stage: "Seed",
    raise: "$1.2M",
    growth: "+18% MoM",
  },
  {
    id: "2",
    name: "CarbonLedger",
    pitch:
      "Real-time Scope 1–3 emissions accounting for SMEs, plugging directly into QuickBooks and Xero.",
    industry: "CleanTech",
    stage: "Pre-Seed",
    raise: "$600K",
    growth: "+22% MoM",
  },
  {
    id: "3",
    name: "MedBridge AI",
    pitch:
      "LLM-powered triage that routes patients to the right specialist in 90 seconds, cutting wait times from 26 days to 3.",
    industry: "HealthTech",
    stage: "Series A",
    raise: "$5M",
    growth: "+11% MoM",
  },
  {
    id: "4",
    name: "FleetZero",
    pitch:
      "SaaS that helps logistics companies swap diesel fleets for EVs with AI-optimised routing and charging.",
    industry: "CleanTech",
    stage: "Seed",
    raise: "$2.5M",
    growth: "+15% MoM",
  },
  {
    id: "5",
    name: "Stitch Labs",
    pitch:
      "Connecting indie fashion designers to 60+ US manufacturers with MOQs as low as 10 units—3-week turnaround.",
    industry: "Marketplace",
    stage: "Pre-Seed",
    raise: "$800K",
    growth: "+30% MoM",
  },
  {
    id: "6",
    name: "VaultFi",
    pitch:
      "Embedded banking infrastructure for neobanks and fintechs—full KYC, ledger, and card issuance via one API.",
    industry: "FinTech",
    stage: "Series A",
    raise: "$8M",
    growth: "+24% MoM",
  },
  {
    id: "7",
    name: "Gradly",
    pitch:
      "AI tutor that adapts to each student's learning pace, reducing tutoring spend by 60% for middle-school families.",
    industry: "EdTech",
    stage: "Seed",
    raise: "$900K",
    growth: "+19% MoM",
  },
];

// Maps industry → Tailwind color classes for dot + badge
const INDUSTRY_STYLES: Record<string, { dot: string; badge: string }> = {
  "AI / SaaS": { dot: "bg-violet-500",  badge: "bg-violet-50 text-violet-700 border-violet-200" },
  FinTech:     { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  HealthTech:  { dot: "bg-pink-500",    badge: "bg-pink-50 text-pink-700 border-pink-200" },
  CleanTech:   { dot: "bg-green-500",   badge: "bg-green-50 text-green-700 border-green-200" },
  EdTech:      { dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  Marketplace: { dot: "bg-blue-500",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
};
const DEFAULT_STYLE = { dot: "bg-gray-400", badge: "bg-gray-50 text-gray-600 border-gray-200" };

// ─── Sub-components ───────────────────────────────────────────────────────────

function IndustryBadge({ industry }: { industry: string }) {
  const style = INDUSTRY_STYLES[industry] ?? DEFAULT_STYLE;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${style.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {industry}
    </span>
  );
}

function MetricPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-emerald-600" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}

interface StartupCardProps {
  startup: Startup;
  layer: "active" | "behind";
  exitDirection: "left" | "right" | null;
}

function StartupCard({ startup, layer, exitDirection }: StartupCardProps) {
  let transform = "";
  let opacity = "opacity-100";

  if (layer === "behind") {
    transform = "translate-y-2.5 scale-[0.96]";
    opacity = "opacity-50";
  }
  if (exitDirection === "left")  transform = "-translate-x-[110%] rotate-[-10deg]";
  if (exitDirection === "right") transform = "translate-x-[110%] rotate-[10deg]";

  const exitOpacity = exitDirection ? "opacity-0" : "";

  return (
    <div
      className={`
        absolute inset-0
        bg-white border border-gray-200 rounded-2xl shadow-sm
        flex flex-col gap-3 p-5
        transition-all duration-[320ms] ease-[cubic-bezier(.4,0,.2,1)]
        ${transform} ${opacity} ${exitOpacity}
        ${layer === "active" ? "z-10" : "z-0"}
      `}
    >
      <IndustryBadge industry={startup.industry} />

      <h2 className="text-2xl font-semibold text-gray-900 leading-tight">{startup.name}</h2>

      <p className="text-sm text-gray-700 leading-relaxed flex-1">{startup.pitch}</p>

      <div className="flex gap-5 pt-3 border-t border-gray-100">
        <MetricPill label="Stage"   value={startup.stage} />
        <MetricPill label="Raising" value={startup.raise} />
        <MetricPill label="Growth"  value={startup.growth} highlight />
      </div>

      <div className="flex gap-2 pt-1">
        <Link
          href={`/startup/${startup.id}`}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          View profile →
        </Link>
        <span className="text-gray-200">·</span>
        <Link
          href={`/deal-room/${startup.id}`}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          🤖 Deal Room →
        </Link>
      </div>
    </div>
  );
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const isInvest = entry.decision === "invest";
  return (
    <div className="flex items-center justify-between text-sm py-1.5">
      <span className="text-white/90">{entry.startup.name}</span>
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${isInvest ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
        {isInvest ? "Invested" : "Passed"}
      </span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [locked, setLocked] = useState(false);

  const current = STARTUPS[index];
  const next    = STARTUPS[index + 1];
  const isDone  = index >= STARTUPS.length;

  const swipe = useCallback(
    (decision: Decision) => {
      if (locked || isDone) return;

      setLocked(true);
      setExitDirection(decision === "invest" ? "right" : "left");
      setHistory((prev) => [{ startup: STARTUPS[index], decision }, ...prev]);

      setTimeout(() => {
        setIndex((i) => i + 1);
        setExitDirection(null);
        setLocked(false);
      }, 340);
    },
    [index, isDone, locked]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  swipe("pass");
      if (e.key === "ArrowRight") swipe("invest");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [swipe]);

  const restart = () => {
    setIndex(0);
    setHistory([]);
    setExitDirection(null);
    setLocked(false);
  };

  const invested = history.filter((h) => h.decision === "invest");
  const passed   = history.filter((h) => h.decision === "pass");
  const progress = Math.round((index / STARTUPS.length) * 100);

  return (
    <div className="max-w-md mx-auto px-4 py-10 bg-[#0f0f0f] min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold text-white-900">Deal flow</h1>
        <span className="text-sm text-gray-400">
          {isDone ? STARTUPS.length : index + 1} of {STARTUPS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/10 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-white rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card stack or done state */}
      {!isDone ? (
        <>
          <div className="relative h-[300px] mb-6">
            {next && <StartupCard startup={next}    layer="behind" exitDirection={null} />}
            <StartupCard startup={current} layer="active" exitDirection={exitDirection} />
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => swipe("pass")}
              disabled={locked}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl
                border border-red-500 text-red-300 text-medium font-medium
                hover:bg-red-500 active:scale-95
                transition-all duration-150 disabled:opacity-40 disabled:cursor-default"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Pass 👎
            </button>

            <button
              onClick={() => swipe("invest")}
              disabled={locked}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl
                border border-emerald-200 text-emerald-500 text-medium font-medium
                hover:bg-emerald-50 active:scale-95
                transition-all duration-150 disabled:opacity-40 disabled:cursor-default"
            >
              Invest 👍
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <polyline points="2,7 6,11 12,3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <p className="text-center text-xs text-gray-300 mt-4">← Pass &nbsp;·&nbsp; Invest →</p>
        </>
      ) : (
        /* Done state */
        <div className="text-center py-12">
          <p className="text-4xl font-semibold text-gray-900 mb-1">{STARTUPS.length}</p>
          <p className="text-sm text-gray-400 mb-4">startups reviewed</p>
          <div className="flex justify-center gap-5 text-sm mb-6">
            <span className="text-emerald-600 font-medium">{invested.length} invested</span>
            <span className="text-gray-200">·</span>
            <span className="text-red-500 font-medium">{passed.length} passed</span>
          </div>
          <button
            onClick={restart}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Review again
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8 border-t border-gray-100 pt-5">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Recent decisions
          </p>
          <div className="divide-y divide-neautral-800">
            {history.slice(0, 5).map((entry, i) => (
              <HistoryRow key={i} entry={entry} />
            ))}
          </div>
          {history.length > 5 && (
            <p className="text-xs text-gray-300 mt-2">+{history.length - 5} more</p>
          )}
        </div>
      )}
    </div>
  );
}