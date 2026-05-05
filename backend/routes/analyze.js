// routes/analyze.js
// POST /analyze  — accepts { description, startupId } and returns a structured
// mock AI analysis shaped after the prompt:
//   "Analyze this startup for a potential investor. Provide:
//    1. One sentence summary
//    2. Market opportunity
//    3. Key risks
//    4. Bull case
//    5. Bear case"

const express = require("express");
const router = express.Router();
const startups = require("../data/startups");

// ─── In-process cache (survives the request, resets on server restart) ────────
const cache = {};

// ─── Per-startup curated mock responses ──────────────────────────────────────
// Each entry matches the exact 5-section shape the prompt asks for.
// Add more IDs here as you seed new startups.
const MOCK_ANALYSES = {
  "1": {
    summary:
      "NeuralNest is an early-traction, hardware-software PropTech company leveraging on-device AI to cut home energy costs by 34%—without requiring a separate hub.",
    marketOpportunity:
      "The global smart-home market is projected to exceed $330B by 2030, driven by rising energy costs and sustainability mandates. NeuralNest targets the 140M US households that have not yet adopted any smart-energy product—an immediately addressable segment of ~$18B. Partnerships already signed with three top-10 home builders give them a low-CAC channel directly into new construction.",
    keyRisks: [
      "Hardware gross margins are inherently compressed (target 35–40%) and could deteriorate further if component costs rise or a larger competitor subsidises hardware.",
      "Always-on cameras create a privacy surface that could trigger regulatory scrutiny or consumer backlash, particularly in California.",
      "Home-builder sales cycles average 6–9 months, which may strain a 14-month runway if pilots don't convert quickly.",
    ],
    bullCase:
      "If NeuralNest closes two of the three Fortune 500 builder LOIs within the next quarter, they gain captive distribution across ~12,000 new homes per year—creating a subscription flywheel that justifies a SaaS multiple rather than a hardware multiple. At $8/mo per home and a 40% attach rate, that channel alone is worth $460K ARR, nearly doubling current MRR. A strategic acquirer (Google Nest, Amazon Ring, or a major utility) could bid at 8–12× revenue within 18 months.",
    bearCase:
      "Google Nest already has brand recognition, existing hardware installed in millions of homes, and a Gemini integration roadmap that covers NeuralNest's core AI angle. If Google releases an energy-optimisation feature in its next update—something it has the data and ML infrastructure to do—NeuralNest's differentiation narrows to manufacturing and channel relationships, which are both replicable with capital. A stalled fundraise at the end of this 14-month runway could be existential.",
    score: 74,
    verdict: "Watch",
  },
  "2": {
    summary:
      "CarbonLedger automates Scope 1–3 emissions reporting for SMEs through accounting-software integrations, targeting a compliance wave triggered by incoming SEC disclosure rules.",
    marketOpportunity:
      "33M US SMEs will need some form of climate disclosure in the next 2–3 years. The incumbent solution—hiring Big 4 consultants—costs $80–200K per engagement; CarbonLedger charges $1,500–6,000/yr. Even capturing 0.5% of addressable SMEs would yield a $250M ARR business. Carbon credit market integration adds a revenue-share layer on top of SaaS.",
    keyRisks: [
      "The SEC climate disclosure timeline has already slipped once and could slip again or be rolled back, removing the urgency that drives conversions.",
      "Intuit, Xero, and Sage all have the distribution and integration depth to build this natively and bundle it at zero marginal cost.",
      "Carbon market pricing is volatile; offset recommendations made today could look wrong in 18 months, creating client trust and liability issues.",
    ],
    bullCase:
      "SEC rules that survive legal challenge create a hard compliance deadline—the best possible sales forcing function. CarbonLedger's 0% churn and 22% MoM growth suggest genuine product-market fit, not promotional signups. A fast Series A ($4–6M) would let them hire a compliance-focused sales team to land mid-market companies ($10–50M revenue) who have more urgency and willingness to pay than micro-SMEs.",
    bearCase:
      "If regulation softens, the company pivots to 'ESG storytelling' tooling—a crowded, low-urgency market where Salesforce and HubSpot have existing footholds. Pre-seed valuation of $4M is defensible today, but a down-round risk emerges if the regulatory catalyst disappears before the next raise.",
    score: 63,
    verdict: "Neutral",
  },
  "3": {
    summary:
      "MedBridge AI is a Series A-stage HealthTech company reducing specialist wait times from 26 days to 3 using fine-tuned clinical LLMs—already deployed in 12 hospital networks.",
    marketOpportunity:
      "US healthcare spends over $935B annually on specialist referrals, yet 30% of referrals are misrouted on the first attempt. MedBridge operates in a sub-segment of the $50B care coordination market. At $310K MRR across only 12 networks, the revenue-per-network ratio ($25K MRR) implies strong enterprise pricing power. Scaling to 200 networks—still <5% of US hospital systems—produces $60M ARR without a product change.",
    keyRisks: [
      "FDA's evolving guidance on AI as a Software as a Medical Device (SaMD) could require a 510(k) or De Novo pathway, which takes 12–36 months and costs $500K+.",
      "Hospital IT procurement committees are slow; adding networks requires dedicated enterprise sales reps at $180–250K OTE each.",
      "Any high-profile AI triage error—even if within acceptable clinical error rates—could generate press coverage that freezes sales pipeline for 6–12 months.",
    ],
    bullCase:
      "At 11% MoM growth on $310K MRR, MedBridge will organically cross $1M MRR within 12 months. HIPAA + SOC 2 certifications remove the most common enterprise procurement objections. A partnership with one of the three major EHR vendors (Epic, Cerner, Meditech) would provide distribution to 70% of US hospitals in a single deal—this is realistic given the team's existing network.",
    bearCase:
      "Epic, which powers 35% of US hospitals, launched its own AI routing module in 2024. If hospitals standardise on Epic's built-in tools to avoid multi-vendor complexity, MedBridge's TAM collapses to Epic-agnostic systems. With $280K/mo burn, a sales stall extending beyond two quarters would require an emergency bridge.",
    score: 86,
    verdict: "Strong Buy",
  },
  "4": {
    summary:
      "FleetZero is a Seed-stage SaaS company helping logistics operators decarbonise their fleets with AI-optimised EV routing, currently running 8 paid enterprise pilots.",
    marketOpportunity:
      "The US commercial vehicle fleet is 12M trucks strong; fewer than 3% are electric today. Federal EV mandates for fleet operators (CARB, EPA Phase 3) create non-discretionary demand for transition software. FleetZero's $2,500/vehicle/yr SaaS fee applied to even 0.1% of the fleet would yield $300M ARR. The $2.5M raise at a $14M valuation is modest relative to this TAM.",
    keyRisks: [
      "Rural charging infrastructure gaps make full fleet electrification impossible in 30–40% of US logistics routes today, limiting near-term addressable market to urban and suburban corridors.",
      "Tesla's fleet management software, Rivian's FleetOS, and Geotab's EV tools are all well-funded competitors with embedded hardware relationships.",
      "Fortune 500 LOIs are meaningful but non-binding; conversion to paid contracts depends on procurement timelines that can extend 12–18 months.",
    ],
    bullCase:
      "Regulatory tailwinds are unusually durable here—California's ACT rule mandates zero-emission trucks regardless of federal policy, and 16 states have adopted it. A FleetZero customer that uses the platform to document compliance reduces regulatory risk, making the software genuinely sticky. The founding team's Tesla Autopilot credentials create instant credibility in enterprise procurement discussions.",
    bearCase:
      "If the Trump administration rolls back EPA fleet emissions rules, the urgency narrative weakens and enterprise sales cycles extend. FleetZero then becomes a cost-savings product rather than a compliance product—still viable, but with a longer sales cycle and lower willingness to pay from CFOs.",
    score: 70,
    verdict: "Watch",
  },
  "5": {
    summary:
      "Stitch Labs is a Pre-Seed marketplace connecting independent fashion designers to US micro-manufacturers, compressing design-to-delivery from 16 weeks to 3 at MOQs as low as 10 units.",
    marketOpportunity:
      "The US fashion market generates $350B annually, but independent designers represent only ~$12B of it—constrained by minimum order quantities and overseas lead times that make rapid iteration impossible. Stitch Labs' just-in-time model unlocks a market of ~200K active indie designers who cannot currently access domestic manufacturing. If 5% of those designers spend $10K/yr on the platform, that's a $100M GMV opportunity.",
    keyRisks: [
      "Manufacturer quality is the brand—one bad batch damages the designer relationship and is amplified on social media.",
      "Fashion demand is inherently seasonal and trend-driven; GMV could swing 50%+ quarter-over-quarter, making financial planning difficult.",
      "Shein and Alibaba operate at price points that Stitch Labs cannot match; the differentiation is speed + domestic sourcing, which may not be sufficient for price-sensitive designers.",
    ],
    bullCase:
      "30% MoM growth without a dedicated sales team suggests genuine word-of-mouth within the tight-knit indie fashion community. A 'made in USA' label is increasingly valuable as import tariffs on Chinese goods rise. The natural next product is a designer-facing inventory management and drop-shipping layer—a $500/mo SaaS add-on that would 10× revenue per designer.",
    bearCase:
      "Marketplace businesses have a well-documented cold-start and disintermediation problem. Once a designer builds a relationship with a manufacturer through Stitch Labs, that manufacturer has every incentive to go direct. Without a sticky software layer or exclusivity agreements, GMV can evaporate quickly as the network matures.",
    score: 58,
    verdict: "Neutral",
  },
  "6": {
    summary:
      "VaultFi is a Series A-stage FinTech infrastructure company enabling any neobank or fintech to launch banking products—KYC, ledger, cards—through a single API.",
    marketOpportunity:
      "There are 10,000+ fintech startups globally and the number building financial products on top of banking infrastructure is growing 25% YoY. Unit, Treasury Prime, and Synctera serve the top tier; VaultFi is positioned for mid-market fintechs that need more customisation than Stripe Treasury offers. The embedded finance infrastructure market is forecast to reach $7.2T in transaction volume by 2030.",
    keyRisks: [
      "VaultFi's entire product rests on sponsor bank relationships; if one sponsor exits (as Synapse's collapse in 2024 demonstrated), customer funds and operations can be paralysed within days.",
      "Regulatory scrutiny on BaaS providers has intensified—OCC and FDIC issued guidance in 2024 requiring more direct bank oversight of fintech partners.",
      "Unit, the category leader, is well-capitalised and actively expanding downmarket.",
    ],
    bullCase:
      "24% MoM growth on $195K MRR is exceptional for infrastructure software. The $180M+ in monthly transaction volume processed by 42 customers means VaultFi already has the data and risk signals to build a credit underwriting layer—a product that could generate interchange and interest income on top of SaaS fees, dramatically improving unit economics.",
    bearCase:
      "The Synapse bankruptcy in 2024 sent regulatory shockwaves through BaaS. If regulators impose capital requirements or direct examination on middleware providers like VaultFi, compliance costs could consume most of gross margin and slow product development to a crawl.",
    score: 80,
    verdict: "Watch",
  },
  "7": {
    summary:
      "Gradly is an AI tutoring platform for middle schoolers that cuts tutoring costs by 60% through adaptive personalisation, with 2,800 active subscriptions after just 7 months.",
    marketOpportunity:
      "US families spend $12B/yr on K-12 tutoring; middle school is the highest-spend cohort as students bridge to high school entrance exams. Gradly's $480/yr price point is 85% cheaper than a human tutor while offering 24/7 availability. The international expansion opportunity (India, South Korea, UK) each represent comparable or larger markets.",
    keyRisks: [
      "13-month runway is the tightest in this cohort; a fundraising process that extends beyond Q2 puts the company in distress territory.",
      "Khan Academy's Khanmigo, built on GPT-4, is free and has a 30-year brand advantage in the exact demographic Gradly targets.",
      "School districts are the natural distribution channel but procurement is slow, political, and often blocked by teacher-union concerns about AI replacing educators.",
    ],
    bullCase:
      "Average grade improvement of 1.4 letter grades in 90 days is a defensible, measurable outcome that justifies the subscription price and drives referrals among parents. If Gradly pilots with three school districts in the next 12 months—even at a discounted institutional rate—the distribution advantage becomes a moat. A B2B2C model (district pays, parents opt in for premium) could unlock 10× the current subscriber count.",
    bearCase:
      "The 13-month runway is a critical vulnerability. If the next fundraise at target valuation ($6M post) doesn't close by Q2, the company will need to bridge at unfavourable terms or cut headcount—both of which risk losing the engineering talent that makes the AI product competitive. Khan Academy's free offering will be the first objection every investor hears.",
    score: 61,
    verdict: "Neutral",
  },
};

// Fallback for any startup not in the curated map above
function buildFallbackAnalysis(startup) {
  return {
    summary: `${startup.name} is a ${startup.stage}-stage company in the ${startup.sector} space, generating ${startup.traction} with a team of ${startup.teamSize} based in ${startup.location}.`,
    marketOpportunity: `The ${startup.sector} market is experiencing meaningful tailwinds. ${startup.name}'s ${startup.raise} raise at a ${startup.valuation} valuation positions it to capture early market share if it can sustain its current ${startup.financials.growth} growth trajectory.`,
    keyRisks: startup.risks,
    bullCase: `If ${startup.name} sustains its current growth rate and converts its pipeline, it could reach a defensible market position before better-funded competitors enter. The ${startup.stage} stage valuation leaves significant upside for investors who enter now.`,
    bearCase: `At ${startup.financials.burnRate} burn with ${startup.financials.runway} of runway, ${startup.name} faces a near-term fundraising mandate. Any slowdown in growth or deterioration in the competitive landscape could make the next raise difficult at the current valuation.`,
    score: 65,
    verdict: "Neutral",
  };
}

// Simulate a realistic network delay so the loading states are visible
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Route: POST /analyze ─────────────────────────────────────────────────────
// Body: { startupId: string }          ← preferred (uses curated mock)
// Body: { description: string }        ← fallback (generates generic mock)
router.post("/", async (req, res) => {
  const { startupId, description } = req.body;

  if (!startupId && !description) {
    return res
      .status(400)
      .json({ error: "Provide either startupId or description in the request body." });
  }

  const cacheKey = startupId || description.slice(0, 60);

  // Return cached result instantly
  if (cache[cacheKey]) {
    return res.json({ ...cache[cacheKey], cached: true });
  }

  // Simulate AI thinking time (1.8–2.4 s)
  await sleep(1800 + Math.random() * 600);

  let analysis;

  if (startupId) {
    const startup = startups.find((s) => s.id === startupId);
    if (!startup) {
      return res.status(404).json({ error: `Startup with id "${startupId}" not found.` });
    }
    analysis = MOCK_ANALYSES[startupId] ?? buildFallbackAnalysis(startup);
  } else {
    // Description-only path: build a generic response from the text
    const words = description.split(" ");
    const nameGuess = words.slice(0, 2).join(" ");
    analysis = {
      summary: `${nameGuess} appears to be an early-stage company solving a focused problem. Based on the description, the team has identified a real pain point and is pursuing an interesting approach.`,
      marketOpportunity:
        "Without detailed financials or market data, a precise TAM is difficult to quantify—but the description suggests a market large enough to support a venture-scale outcome if the team executes on distribution.",
      keyRisks: [
        "Insufficient information to assess team depth and domain expertise.",
        "Competitive landscape and differentiation from existing solutions are unclear.",
        "Go-to-market strategy and customer acquisition cost are unknown.",
      ],
      bullCase:
        "If the core insight is correct and the team can find a repeatable customer acquisition channel, the company could establish category leadership before incumbents react. Early-stage valuations at this stage leave substantial upside for seed investors.",
      bearCase:
        "Without traction data, it's impossible to confirm product-market fit. The risk of building for a problem customers don't urgently pay to solve is the primary bear case at this stage.",
      score: 55,
      verdict: "Neutral",
      cached: false,
    };
  }

  const result = { ...analysis, mock: true, cached: false };
  cache[cacheKey] = result;

  res.json(result);
});

module.exports = router;