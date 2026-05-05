// app/startup/[id]/page.tsx
"use client";

import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { STARTUP_MAP, type Startup } from "../../../lib/startups";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

const INDUSTRY_COLORS: Record<string, string> = {
  "AI / PropTech":        "#7F77DD",
  "CleanTech":            "#639922",
  "CleanTech / Logistics":"#639922",
  "HealthTech":           "#D4537E",
  "FinTech":              "#1D9E75",
  "Marketplace / Fashion":"#378ADD",
  "EdTech":               "#BA7517",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroBadge({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`text-xs font-medium px-3 py-1 rounded-full ${
        accent
          ? "bg-[#c8ff00] text-[#1a2200]"
          : "bg-white/10 text-white/70"
      }`}
    >
      {children}
    </span>
  );
}

function MetricCard({
  label,
  value,
  green,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${green ? "text-emerald-600" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-2xl px-5 py-4">
      <h2 className="text-sm font-semibold text-white mb-3">{title}</h2>
      {children}
    </div>
  );
}

function BulletList({
  items,
  variant = "success",
}: {
  items: string[];
  variant?: "success" | "warning";
}) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-200 leading-snug">
          <span
            className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              variant === "success" ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function FundingBar({ startup }: { startup: Startup }) {
  // Visual only — shows a mock "% raised" bar. Replace with real committed data later.
  const mockPct = 38;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-200 mb-1.5">
        <span>{mockPct}% raised</span>
        <span>Goal: {startup.raise}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full"
          style={{ width: `${mockPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-gray-200 mt-1.5">
        <span>{fmt(startup.mrr * 12)} ARR</span>
        <span>Val: {startup.valuation}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StartupProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const startup = STARTUP_MAP[id];

  if (!startup) notFound();

  const accentColor = INDUSTRY_COLORS[startup.industry] ?? "#888780";

  return (
    <div className="max-w-lg mx-auto px-4 py-10">

      {/* ── Back link ── */}
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-sm text-gray-200 hover:text-gray-700 transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <polyline
            points="9,2 5,7 9,12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to feed
      </Link>

      {/* ── Hero ── */}
      <div className="bg-[#0a0a0f] rounded-3xl px-6 pt-6 pb-7 mb-5 relative overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/[0.03]" />
        <div
          className="absolute right-8 top-14 w-20 h-20 rounded-full opacity-20"
          style={{ background: accentColor }}
        />

        <div className="relative z-10">
          <span className="text-5xl mb-4 block">🏢</span>
          <h1 className="text-3xl font-semibold text-white leading-tight mb-1.5">
            {startup.name}
          </h1>
          <p className="text-white/90 text-sm mb-4 leading-relaxed">{startup.tagline}</p>

          <div className="flex flex-wrap gap-2">
            <HeroBadge accent>{startup.stage}</HeroBadge>
            <HeroBadge>{startup.industry}</HeroBadge>
            <HeroBadge>{startup.location}</HeroBadge>
            <HeroBadge>Founded {startup.founded}</HeroBadge>
            <HeroBadge>{startup.teamSize} people</HeroBadge>
          </div>
        </div>
      </div>

      {/* ── Key metrics ── */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <MetricCard label="Raising"   value={startup.raise} />
        <MetricCard label="Valuation" value={startup.valuation} />
        <MetricCard label="MRR"       value={fmt(startup.mrr)} />
        <MetricCard label="Growth"    value={startup.growth} green />
      </div>

      {/* ── Funding goal ── */}
      <SectionCard title="Funding round">
        <FundingBar startup={startup} />
        <div className="grid grid-cols-2 gap-2 mt-3 ">
          <MetricCard label="Burn rate" value={startup.burnRate} />
          <MetricCard label="Runway"    value={startup.runway} />
        </div>
      </SectionCard>

      {/* ── Description ── */}
      <div className="mt-4">
        <SectionCard title="About">
          <p className="text-sm text-gray-200 leading-relaxed">{startup.description}</p>
        </SectionCard>
      </div>

      {/* ── Location & team ── */}
      <div className="mt-4">
        <SectionCard title="Location & team">
          <div className="flex flex-col gap-2.5 text-white">
            <LocationRow icon="pin"  label={startup.location} />
            <LocationRow icon="team" label={`${startup.teamSize} team members`} />
            <LocationRow icon="year" label={`Founded ${startup.founded}`} />
          </div>
        </SectionCard>
      </div>

      {/* ── Highlights ── */}
      <div className="mt-4">
        <SectionCard title="Highlights">
          <BulletList items={startup.highlights} variant="success" />
        </SectionCard>
      </div>

      {/* ── Risks ── */}
      <div className="mt-4">
        <SectionCard title="Key risks">
          <BulletList items={startup.risks} variant="warning" />
        </SectionCard>
      </div>

      {/* ── CTAs ── */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <a
          href={startup.deckUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl
            border border-gray-200 text-sm font-medium text-white
            hover:border-gray-400 transition-all"
        >
          View deck
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 10L10 2M10 2H5M10 2v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

        <Link
          href={`/deal-room/${startup.id}`}
          className="flex items-center justify-center gap-2 py-3.5 rounded-2xl
            bg-[#c8ff00] text-[#1a2200] text-sm font-semibold
            hover:bg-[#b8ef00] active:scale-[0.98] transition-all"
        >
          🤖 Generate AI Deal Room
        </Link>
      </div>

      {/* ── Invest / Pass quick actions ── */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <button
          onClick={() => router.push("/feed")}
          className="py-3 rounded-2xl border border-red-100 text-sm font-medium text-red-500
            hover:bg-red-50 transition-all"
        >
          👎 Pass
        </button>
        <button
          onClick={() => router.push("/feed")}
          className="py-3 rounded-2xl border border-emerald-100 text-sm font-medium text-emerald-600
            hover:bg-emerald-50 transition-all"
        >
          👍 Invest
        </button>
      </div>

    </div>
  );
}

// ─── Location row helper ───────────────────────────────────────────────────────

function LocationRow({ icon, label }: { icon: "pin" | "team" | "year"; label: string }) {
  const icons = {
    pin: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/70 flex-shrink-0 mt-px">
        <circle cx="7" cy="6" r="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7 1C4.24 1 2 3.24 2 6c0 3.5 5 8 5 8s5-4.5 5-8c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    team: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/70 flex-shrink-0 mt-px">
        <circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M1 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="10" cy="4.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M12 11.5c0-1.38-.9-2.56-2.14-2.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    year: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/70 flex-shrink-0 mt-px">
        <rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M1 6h12" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4 1v3M10 1v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  };

  return (
    <div className="flex items-start gap-2.5 text-sm text-gray-200">
      {icons[icon]}
      {label}
    </div>
  );
}