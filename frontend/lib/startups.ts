// lib/startups.ts — canonical startup data, imported by both feed and profile pages

export type Decision = "invest" | "pass";

export interface Startup {
  id: string;
  name: string;
  tagline: string;       // short pitch shown on the feed card
  description: string;   // full paragraph shown on the profile page
  industry: string;
  stage: string;
  raise: string;         // funding goal e.g. "$1.2M"
  valuation: string;
  location: string;
  founded: number;
  teamSize: number;
  mrr: number;           // monthly recurring revenue in dollars
  growth: string;        // e.g. "+18% MoM"
  burnRate: string;
  runway: string;
  highlights: string[];
  risks: string[];
  deckUrl: string;
}

export const STARTUPS: Startup[] = [
  {
    id: "1",
    name: "NeuralNest",
    tagline:
      "On-device AI that turns any home into an adaptive smart environment—cutting energy bills by 34%, no hub required.",
    description:
      "NeuralNest combines computer vision and on-device ML to turn any home into an adaptive living environment—no hub required. Our proprietary edge models cut energy bills by 34% on average while learning occupant routines within 7 days. We've signed hardware partnerships with three of the top-10 US home builders and are on track to ship our first retail SKU in Q1 next year.",
    industry: "AI / PropTech",
    stage: "Seed",
    raise: "$1.2M",
    valuation: "$8M",
    location: "San Francisco, CA",
    founded: 2023,
    teamSize: 6,
    mrr: 42000,
    growth: "+18% MoM",
    burnRate: "$85K / mo",
    runway: "14 months",
    highlights: [
      "34% avg energy reduction across 4,200 beta users",
      "Partnerships with 3 top-10 US home builders",
      "Ex-Google, Apple, and Nest founding team",
    ],
    risks: [
      "Hardware margin compression in a competitive market",
      "Consumer privacy concerns around always-on cameras",
      "Long sales cycles with home builders (avg 6–9 months)",
    ],
    deckUrl: "https://example.com/neuralnest-deck",
  },
  {
    id: "2",
    name: "CarbonLedger",
    tagline:
      "Real-time Scope 1–3 emissions accounting for SMEs, plugging directly into QuickBooks and Xero.",
    description:
      "CarbonLedger plugs into a company's existing ERP and accounting tools to automatically calculate, report, and offset Scope 1–3 emissions. Built for the 33M SMEs in the US who face incoming SEC climate disclosure rules but can't afford Big 4 consultants. We generate audit-ready reports in minutes and connect directly to verified carbon offset markets.",
    industry: "CleanTech",
    stage: "Pre-Seed",
    raise: "$600K",
    valuation: "$4M",
    location: "Austin, TX",
    founded: 2024,
    teamSize: 4,
    mrr: 18000,
    growth: "+22% MoM",
    burnRate: "$40K / mo",
    runway: "15 months",
    highlights: [
      "280 paying customers in 8 months, 0% churn",
      "Integrations with QuickBooks, Xero, and SAP",
      "SEC climate disclosure rules take effect 2026",
    ],
    risks: [
      "Regulatory timeline could shift under new administration",
      "Enterprise competitors building SME-tier products",
      "Carbon market pricing volatility",
    ],
    deckUrl: "https://example.com/carbonledger-deck",
  },
  {
    id: "3",
    name: "MedBridge AI",
    tagline:
      "LLM-powered triage that routes patients to the right specialist in 90 seconds, cutting wait times from 26 days to 3.",
    description:
      "MedBridge AI uses large language models fine-tuned on clinical data to triage patients and route them to the right specialist in under 90 seconds. We reduce average specialist wait times from 26 days to 3 days and cut no-show rates by 41%. All infrastructure is HIPAA-compliant and SOC 2 Type II certified. Currently live in 12 hospital networks across 6 states.",
    industry: "HealthTech",
    stage: "Series A",
    raise: "$5M",
    valuation: "$28M",
    location: "Boston, MA",
    founded: 2022,
    teamSize: 22,
    mrr: 310000,
    growth: "+11% MoM",
    burnRate: "$280K / mo",
    runway: "18 months",
    highlights: [
      "12 hospital networks in production across 6 states",
      "41% reduction in no-show rates",
      "HIPAA-compliant, SOC 2 Type II certified",
    ],
    risks: [
      "FDA regulatory pathway for AI diagnostic tools",
      "Hospital IT procurement cycles average 9 months",
      "Liability concerns around AI-assisted triage decisions",
    ],
    deckUrl: "https://example.com/medbridge-deck",
  },
  {
    id: "4",
    name: "FleetZero",
    tagline:
      "SaaS that helps logistics companies swap diesel fleets for EVs with AI-optimised routing and charging.",
    description:
      "FleetZero's SaaS platform helps logistics companies transition their diesel fleets to EVs with AI-optimized routing, charging scheduling, and driver behavior coaching. Our ROI calculator shows a payback period under 18 months for fleets of 50+ vehicles. We have letters of intent from three Fortune 500 logistics companies and are currently running 8 paid enterprise pilots.",
    industry: "CleanTech / Logistics",
    stage: "Seed",
    raise: "$2.5M",
    valuation: "$14M",
    location: "Detroit, MI",
    founded: 2023,
    teamSize: 11,
    mrr: 67000,
    growth: "+15% MoM",
    burnRate: "$120K / mo",
    runway: "20 months",
    highlights: [
      "LOIs from 3 Fortune 500 logistics companies",
      "28% average cost reduction vs diesel in pilots",
      "Founding team from Tesla Autopilot & Amazon Logistics",
    ],
    risks: [
      "EV charging infrastructure gaps on rural routes",
      "Large fleet purchase commitments slow sales cycles",
      "Tesla and Rivian building competing fleet software",
    ],
    deckUrl: "https://example.com/fleetzero-deck",
  },
  {
    id: "5",
    name: "Stitch Labs",
    tagline:
      "Connecting indie fashion designers to 60+ US manufacturers with MOQs as low as 10 units—3-week turnaround.",
    description:
      "Stitch Labs connects independent fashion designers to a network of 60+ small US-based manufacturers for minimum order quantities as low as 10 units. Our platform handles design-to-delivery in 3 weeks vs the industry standard of 16 weeks, enabling true just-in-time fashion. Designers upload tech packs and receive binding quotes within 24 hours.",
    industry: "Marketplace / Fashion",
    stage: "Pre-Seed",
    raise: "$800K",
    valuation: "$5M",
    location: "New York, NY",
    founded: 2024,
    teamSize: 7,
    mrr: 28000,
    growth: "+30% MoM",
    burnRate: "$55K / mo",
    runway: "14 months",
    highlights: [
      "340 active brands, growing 30% MoM",
      "60+ vetted US manufacturers in the network",
      "3-week average design-to-delivery turnaround",
    ],
    risks: [
      "Manufacturer quality consistency at scale",
      "Competition from Alibaba and overseas alternatives",
      "Fashion is trend-dependent; demand can be volatile",
    ],
    deckUrl: "https://example.com/stitch-deck",
  },
  {
    id: "6",
    name: "VaultFi",
    tagline:
      "Embedded banking infrastructure for neobanks and fintechs—full KYC, ledger, and card issuance via one API.",
    description:
      "VaultFi provides embedded banking infrastructure as a service. Any fintech or neobank can integrate KYC onboarding, a real-time transaction ledger, ACH/wire transfers, and physical/virtual card issuance through a single REST API. We handle all bank partnerships, compliance, and settlement—so our customers ship financial products in weeks, not years.",
    industry: "FinTech",
    stage: "Series A",
    raise: "$8M",
    valuation: "$40M",
    location: "New York, NY",
    founded: 2022,
    teamSize: 18,
    mrr: 195000,
    growth: "+24% MoM",
    burnRate: "$210K / mo",
    runway: "19 months",
    highlights: [
      "42 active fintech customers processing $180M+ monthly",
      "Banking partnerships with 4 FDIC-insured institutions",
      "SOC 2 Type II, PCI DSS Level 1 certified",
    ],
    risks: [
      "Bank sponsor relationships are a single point of failure",
      "Regulatory risk if embedded finance rules tighten",
      "Stripe and Unit building overlapping products",
    ],
    deckUrl: "https://example.com/vaultfi-deck",
  },
  {
    id: "7",
    name: "Gradly",
    tagline:
      "AI tutor that adapts to each student's learning pace, reducing tutoring spend by 60% for middle-school families.",
    description:
      "Gradly is an AI-powered tutoring platform that builds a unique learning model for each student, continuously adapting difficulty, pacing, and teaching style based on response patterns. Middle-school families spend an average of $3,200/year on tutoring; Gradly delivers equivalent outcomes at $480/year. Currently covers math, science, and English for grades 5–9.",
    industry: "EdTech",
    stage: "Seed",
    raise: "$900K",
    valuation: "$6M",
    location: "Chicago, IL",
    founded: 2023,
    teamSize: 8,
    mrr: 34000,
    growth: "+19% MoM",
    burnRate: "$65K / mo",
    runway: "13 months",
    highlights: [
      "2,800 active student subscriptions after 7 months",
      "Avg grade improvement of 1.4 letter grades in 90 days",
      "Curriculum aligned to Common Core and state standards",
    ],
    risks: [
      "School district procurement is slow and political",
      "Khan Academy and Duolingo have massive brand advantage",
      "13-month runway is tight; needs next raise by Q2",
    ],
    deckUrl: "https://example.com/gradly-deck",
  },
];

export const STARTUP_MAP = Object.fromEntries(STARTUPS.map((s) => [s.id, s]));