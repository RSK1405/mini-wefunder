// lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Startup types
export interface FinancialData {
  mrr: number;
  growth: string;
  burnRate: string;
  runway: string;
}

export interface Startup {
  id: string;
  name: string;
  tagline: string;
  sector: string;
  stage: string;
  raise: string;
  valuation: string;
  traction: string;
  founded: number;
  location: string;
  logo: string;
  teamSize: number;
  description: string;
  highlights: string[];
  risks: string[];
  financials: FinancialData;
  deck: string;
}

export interface DealRoomAnalysis {
  investmentScore: number;
  verdict: string;
  summary: string;
  strengths: string[];
  concerns: string[];
  marketOpportunity: string;
  teamAssessment: string;
  financialHealth: string;
  comparableCompanies: string[];
  keyQuestion: string;
  cached?: boolean;
  mock?: boolean;
}

// API calls
export const api = {
  startups: {
    feed: () => request<Startup[]>("/startups?mode=feed"),
    all: () => request<Startup[]>("/startups"),
    get: (id: string) => request<Startup>(`/startups/${id}`),
    like: (id: string) => request<void>(`/startups/${id}/like`, { method: "POST" }),
    pass: (id: string) => request<void>(`/startups/${id}/pass`, { method: "POST" }),
    watchlist: () => request<Startup[]>("/startups/user/watchlist"),
  },
  dealRoom: {
    analyze: (id: string) =>
      request<DealRoomAnalysis>(`/deal-room/${id}/analyze`, { method: "POST" }),
    ask: (id: string, question: string) =>
      request<{ answer: string }>(`/deal-room/${id}/ask`, {
        method: "POST",
        body: JSON.stringify({ question }),
      }),
  },
};
