// app/deal-room/[id]/page.tsx
"use client";

import { use, useState, useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { STARTUP_MAP, type Startup } from "@/lib/startups";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// ─── API response shape ───────────────────────────────────────────────────────
// Matches exactly what POST /api/analyze returns.

interface Analysis {
  summary: string;
  marketOpportunity: string;
  keyRisks: string[];
  bullCase: string;
  bearCase: string;
  score: number;           // 1–100
  verdict: string;         // "Strong Buy" | "Watch" | "Neutral" | "Pass" | "Strong Pass"
  mock: boolean;
  cached: boolean;
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function fetchAnalysis(startup: Startup): Promise<Analysis> {
  const res = await fetch(`${API}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Send both the id (for curated mock) and description (fallback)
    body: JSON.stringify({
      startupId: startup.id,
      description: startup.description,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Verdict config ───────────────────────────────────────────────────────────

const VERDICT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "Strong Buy": { bg: "bg-emerald-500",  text: "text-white",        border: "border-emerald-500" },
  "Watch":      { bg: "bg-[#c8ff00]",    text: "text-[#1a2200]",    border: "border-[#c8ff00]" },
  "Neutral":    { bg: "bg-gray-200",     text: "text-gray-700",     border: "border-gray-200" },
  "Pass":       { bg: "bg-amber-100",    text: "text-amber-800",    border: "border-amber-200" },
  "Strong Pass":{ bg: "bg-red-500",      text: "text-white",        border: "border-red-500" },
};

// ─── Loading steps (shown one at a time while fetching) ───────────────────────

const LOADING_STEPS = [
  "Reading the deal memo…",
  "Analyzing market opportunity…",
  "Stress-testing the bull case…",
  "Identifying key risks…",
  "Generating investment verdict…",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const ringColor =
    score >= 75 ? "#22c55e" : score >= 55 ? "#c8ff00" : "#f97316";

  return (
    <div className="relative w-[88px] h-[88px] flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
        <circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white leading-none">{score}</span>
        <span className="text-[10px] text-white/60 mt-0.5">/100</span>
      </div>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const s = VERDICT_STYLES[verdict] ?? VERDICT_STYLES["Neutral"];
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${s.bg} ${s.text}`}>
      {verdict}
    </span>
  );
}

function SectionCard({
  title,
  icon,
  children,
  accent,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: "green" | "amber" | "red";
}) {
  const accentBar = {
    green: "border-l-emerald-400",
    amber: "border-l-amber-400",
    red:   "border-l-red-400",
  };

  return (
    <div
      className={`border border-white/30 rounded-2xl overflow-hidden ${
        accent ? `border-l-2 ${accentBar[accent]}` : ""
      }`}
    >
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/30">
        <span className="text-base leading-none">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
      </div>
      <div className="px-5 py-4 text-white/70">{children}</div>
    </div>
  );
}

function BulletList({ items, color }: { items: string[]; color: "red" | "amber" }) {
  const dot = color === "red" ? "bg-red-400" : "bg-amber-400";
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-white/80 leading-snug">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function LoadingOverlay({ startup }: { startup: Startup }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)),
      520
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-[#0a0a0f] rounded-3xl px-6 py-10 text-center mb-5">
      {/* Pulsing ring */}
      <div className="relative w-14 h-14 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-t-[#c8ff00] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full bg-white/5 flex items-center justify-center">
          <span className="text-lg">🤖</span>
        </div>
      </div>

      <p className="text-xs uppercase tracking-widest text-white/30 mb-1">AI Analyst</p>
      <h2 className="text-xl font-semibold text-white mb-3">Analyzing {startup.name}</h2>

      {/* Step progress */}
      <div className="max-w-xs mx-auto">
        {LOADING_STEPS.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 text-sm py-1.5 transition-all duration-300 ${
              i < step
                ? "text-white/25"
                : i === step
                ? "text-white/90"
                : "text-white/15"
            }`}
          >
            <span className="w-4 flex-shrink-0 text-center">
              {i < step ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="inline text-emerald-400">
                  <polyline points="2,7 6,11 12,3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : i === step ? (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c8ff00] animate-pulse" />
              ) : (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/10" />
              )}
            </span>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-2xl px-5 py-4 flex items-start gap-3 mb-5">
      <span className="text-red-400 text-lg flex-shrink-0">⚠</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-red-700">Analysis failed</p>
        <p className="text-xs text-red-500 mt-0.5">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="text-xs text-red-600 font-medium border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors flex-shrink-0"
      >
        Retry
      </button>
    </div>
  );
}

function ColdStart({ startup, onRun }: { startup: Startup; onRun: () => void }) {
  return (
    <div className="border border-gray-200 rounded-3xl px-6 py-10 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">🤖</span>
      </div>
      <h2 className="text-xl font-semibold text-white-40 mb-1.5">
        Ready to analyze {startup.name}?
      </h2>
      <p className="text-sm text-gray-200 max-w-xs mx-auto mb-6 leading-relaxed">
        The AI analyst will review the deal and generate a full investment brief — summary,
        market opportunity, risks, bull case, and bear case.
      </p>
      <button
        onClick={onRun}
        className="flex-1 text-center px-8 py-3 rounded-2xl border border-gray-100 
        text-sm font-semibold hover:bg-white/30 active:scale-[0.98] transition-all"
          //"flex-1 text-center py-3 rounded-2xl border border-gray-200 
         // text-sm font-medium hover:bg-white transition-all"
      >
        Generate AI Deal Room
      </button>
      <p className="text-xs text-gray-300 mt-3">Takes ~2 seconds · Free mock AI</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Status = "idle" | "loading" | "done" | "error";

export default function DealRoomPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const startup = STARTUP_MAP[id];
  if (!startup) notFound();

  const [status, setStatus]       = useState<Status>("idle");
  const [analysis, setAnalysis]   = useState<Analysis | null>(null);
  const [errorMsg, setErrorMsg]   = useState<string>("");

  const run = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const data = await fetchAnalysis(startup);
      setAnalysis(data);
      setStatus("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">

      {/* Back */}
      <Link
        href={`/startup/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-200 hover:text-gray-700 transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <polyline points="9,2 5,7 9,12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to profile
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
          🏢
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">AI Deal Room</p>
          <h1 className="text-xl font-semibold text-white leading-tight">{startup.name}</h1>
        </div>
        {analysis?.mock && (
          <span className="ml-auto text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
            Mock AI
          </span>
        )}
      </div>

      {/* State machine */}
      {status === "idle" && <ColdStart startup={startup} onRun={run} />}
      {status === "loading" && <LoadingOverlay startup={startup} />}
      {status === "error" && <ErrorBanner message={errorMsg} onRetry={run} />}

      {/* Results */}
      {status === "done" && analysis && (
        <Results startup={startup} analysis={analysis} onRerun={run} />
      )}
    </div>
  );
}

// ─── Results section (extracted to keep the page component readable) ──────────

function Results({
  startup,
  analysis,
  onRerun,
}: {
  startup: Startup;
  analysis: Analysis;
  onRerun: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">

      {/* Hero: score + verdict + summary */}
      <div className="bg-[#0a0a0f] border border-white/30 rounded-3xl px-6 py-6 flex gap-5 items-start">
        <ScoreRing score={analysis.score} />
        <div className="flex-1 min-w-0">
          <VerdictBadge verdict={analysis.verdict} />
          <p className="text-white/80 text-sm mt-2.5 leading-relaxed">{analysis.summary}</p>
        </div>
      </div>

      {/* 1 — Market opportunity */}
      <SectionCard title="Market opportunity" icon="🌐" accent="green">
        <p className="text-sm text-white/80 leading-relaxed">{analysis.marketOpportunity}</p>
      </SectionCard>

      {/* 2 — Key risks */}
      <SectionCard title="Key risks" icon="⚠️" accent="amber">
        <BulletList items={analysis.keyRisks} color="amber" />
      </SectionCard>

      {/* 3 — Bull case */}
      <SectionCard title="Bull case" icon="📈" accent="green">
        <p className="text-sm text-white/80 leading-relaxed">{analysis.bullCase}</p>
      </SectionCard>

      {/* 4 — Bear case */}
      <SectionCard title="Bear case" icon="📉" accent="red">
        <p className="text-sm text-white/80 leading-relaxed">{analysis.bearCase}</p>
      </SectionCard>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Link
          href={`/startup/${startup.id}`}
          className="flex-1 text-center py-3 rounded-2xl border border-gray-200
            text-sm font-medium hover:bg-black/80 transition-all"
        >
          ← Back to profile
        </Link>
        <button
          onClick={onRerun}
          className="flex-1 text-center py-3 rounded-2xl border border-gray-200 
          text-sm font-medium hover:bg-black/80 transition-all"
        >
          🔄 Re-run analysis
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[11px] text-gray-300 pb-2 leading-relaxed">
        This is a mock AI analysis for demo purposes only.
        Not investment advice.
      </p>
    </div>
  );
}