// routes/dealRoom.js
const express = require("express");
const router = express.Router();
const startups = require("../data/startups");
const state = require("../data/userState");

// POST /api/deal-room/:id/analyze — AI analysis of a startup
router.post("/:id/analyze", async (req, res) => {
  const startup = startups.find((s) => s.id === req.params.id);
  if (!startup) return res.status(404).json({ error: "Startup not found" });

  // Return cached analysis if available
  if (state.dealRoomCache[startup.id]) {
    return res.json({ ...state.dealRoomCache[startup.id], cached: true });
  }

  try {
    let analysis;

    if (USE_MOCK) {
      analysis = generateMockAnalysis(startup);
    } else {
      analysis = await generateAIAnalysis(startup);
    }

    state.dealRoomCache[startup.id] = analysis;
    res.json(analysis);
  } catch (err) {
    console.error("Deal Room error:", err.message);
    res.status(500).json({ error: "Analysis failed. Check your OpenAI key." });
  }
});

// POST /api/deal-room/:id/ask — follow-up Q&A about a startup
router.post("/:id/ask", async (req, res) => {
  const startup = startups.find((s) => s.id === req.params.id);
  if (!startup) return res.status(404).json({ error: "Startup not found" });

  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Question required" });

  try {
    let answer;

    if (USE_MOCK) {
      answer = generateMockAnswer(startup, question);
    } else {
      answer = await generateAIAnswer(startup, question);
    }

    res.json({ answer });
  } catch (err) {
    console.error("Q&A error:", err.message);
    res.status(500).json({ error: "Q&A failed." });
  }
});

// ── AI Helpers ─────────────────────────────────────────────────────────────

async function generateAIAnalysis(startup) {
  const OpenAI = require("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = buildAnalysisPrompt(startup);

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a seasoned venture capital analyst. Provide rigorous, balanced investment analysis in JSON format. Be concise, specific, and honest about risks.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  return JSON.parse(completion.choices[0].message.content);
}

async function generateAIAnswer(startup, question) {
  const OpenAI = require("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a VC analyst who has deeply studied ${startup.name}. Answer questions concisely and analytically. Startup context: ${JSON.stringify(startup)}`,
      },
      { role: "user", content: question },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  return completion.choices[0].message.content;
}

function buildAnalysisPrompt(startup) {
  return `Analyze this startup investment opportunity and return a JSON object with exactly these keys:

{
  "investmentScore": <number 1-100>,
  "verdict": "<one of: Strong Pass | Pass | Neutral | Watch | Strong Buy>",
  "summary": "<2-3 sentence executive summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern 1>", "<concern 2>", "<concern 3>"],
  "marketOpportunity": "<1-2 sentences on TAM and market timing>",
  "teamAssessment": "<1-2 sentences on team quality>",
  "financialHealth": "<1-2 sentences on financials and runway>",
  "comparableCompanies": ["<company 1>", "<company 2>"],
  "keyQuestion": "<The single most important question to ask the founders>"
}

Startup data:
${JSON.stringify(startup, null, 2)}`;
}

// ── Mock Helpers (used when no API key) ────────────────────────────────────

function generateMockAnalysis(startup) {
  const scores = { "1": 78, "2": 65, "3": 88, "4": 72, "5": 61 };
  const verdicts = { "1": "Watch", "2": "Neutral", "3": "Strong Buy", "4": "Watch", "5": "Pass" };

  return {
    investmentScore: scores[startup.id] || 70,
    verdict: verdicts[startup.id] || "Neutral",
    summary: `${startup.name} is a ${startup.stage}-stage ${startup.sector} company with ${startup.traction}. The team is tackling a real problem with early validation, though execution risk remains given the competitive landscape.`,
    strengths: startup.highlights,
    concerns: startup.risks,
    marketOpportunity: `The ${startup.sector} market is experiencing significant tailwinds. Timing appears favorable with regulatory and consumer behavior shifts accelerating adoption.`,
    teamAssessment: `The ${startup.teamSize}-person team shows domain expertise. Key hires in sales and engineering will be critical to scaling beyond current traction.`,
    financialHealth: `At ${startup.financials.burnRate} burn with ${startup.financials.runway} of runway, the company has adequate time to hit milestones for the next raise. ${startup.financials.growth} MoM growth is healthy for this stage.`,
    comparableCompanies: ["Notion", "Figma"],
    keyQuestion: `What is your primary customer acquisition channel, and what's your CAC vs LTV ratio today?`,
    cached: false,
    mock: true,
  };
}

function generateMockAnswer(startup, question) {
  return `Based on ${startup.name}'s profile: Given their ${startup.traction} and ${startup.financials.growth} MoM growth, this is a nuanced question. The company's ${startup.stage} stage positioning and ${startup.financials.runway} runway suggest they have time to address this, but it remains a key variable for investors to diligence. I'd recommend asking the founders directly about their specific strategy here during your next call.`;
}

module.exports = router;
