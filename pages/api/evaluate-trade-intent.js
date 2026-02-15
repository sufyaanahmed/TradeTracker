// POST /api/evaluate-trade-intent
// Main Quantitative Decision Engine API
//
// Input:  { text: "I want to buy 20 AAPL at market price" }
// Output: { parsedIntent, quantScore, riskMetrics, recommendation, summary }

import { authenticate } from '../../lib/auth';
import { connectToDatabase } from '../../lib/db';
import { parseTradeIntent } from '../../lib/intent-parser';
import {
  computeFundamentalScore,
  computeTechnicalScore,
  computeSectorScore,
  computeSentimentScore,
  computePortfolioFitScore,
  computeQuantScore
} from '../../lib/factor-model';
import { computeRiskMetrics } from '../../lib/risk-engine';
import { computePortfolioStats } from '../../lib/portfolio-metrics';

const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';

async function fetchAlphaVantage(fn, symbol) {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(`${ALPHA_VANTAGE_BASE}?function=${fn}&symbol=${symbol}&apikey=${key}`);
    if (!res.ok) return null;
    const data = await res.json();

    if (data['Note']) {
      console.warn('[quant] Alpha Vantage rate limit hit');
      return { rateLimited: true };
    }
    if (data['Error Message']) {
      console.warn('[quant] Alpha Vantage error:', data['Error Message']);
      return null;
    }
    return data;
  } catch (e) {
    console.error('[quant] Alpha Vantage fetch error:', e.message);
    return null;
  }
}

function generateSummary(intent, quantResult, riskMetrics, fundamental, technical, sector, sentiment) {
  const { recommendation, totalScore } = quantResult;
  const sym = intent.symbol;
  const action = intent.action;
  const qty = intent.quantity;

  const lines = [];

  // Headline
  if (recommendation === 'STRONG BUY') {
    lines.push(`${sym} scores ${totalScore}/100 — STRONG BUY signal across all factors.`);
  } else if (recommendation === 'BUY') {
    lines.push(`${sym} scores ${totalScore}/100 — Favorable setup supports a BUY.`);
  } else if (recommendation === 'NEUTRAL') {
    lines.push(`${sym} scores ${totalScore}/100 — Mixed signals suggest caution.`);
  } else {
    lines.push(`${sym} scores ${totalScore}/100 — Weak factors indicate AVOID.`);
  }

  // Price context
  if (technical.currentPrice) {
    const priceStr = `$${technical.currentPrice.toFixed(2)}`;
    const changeStr = technical.changePct !== null ? ` (${technical.changePct > 0 ? '+' : ''}${technical.changePct}%)` : '';
    lines.push(`Current price: ${priceStr}${changeStr}.`);
  }

  // Factor highlights
  const factors = quantResult.breakdown;
  const strongest = Object.entries(factors).reduce((a, b) => b[1].score > a[1].score ? b : a);
  const weakest = Object.entries(factors).reduce((a, b) => b[1].score < a[1].score ? b : a);
  lines.push(`Strongest factor: ${strongest[0]} (${strongest[1].score}/100). Weakest: ${weakest[0]} (${weakest[1].score}/100).`);

  // Risk
  if (riskMetrics.riskViolation) {
    lines.push(`⚠️ Risk violations: ${riskMetrics.violations.join('; ')}.`);
  } else {
    lines.push(`Position size: ${riskMetrics.positionSizePercent}% of portfolio. Concentration risk: ${riskMetrics.concentrationRisk}.`);
  }

  // Sector
  if (sector.sector && sector.sector !== 'Unknown') {
    lines.push(`Sector: ${sector.sector} (${sector.industry || 'N/A'}).`);
  }

  // Sentiment
  if (sentiment.brief) {
    lines.push(`Sentiment: ${sentiment.brief}`);
  }

  // Action summary
  if (intent.action === 'BUY' && recommendation !== 'AVOID') {
    lines.push(`Recommendation: ${action} ${qty} shares of ${sym} at ${intent.priceType.toLowerCase()} price.`);
  } else if (recommendation === 'AVOID') {
    lines.push(`Recommendation: Consider waiting for better entry conditions.`);
  }

  return lines.join(' ');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  // 1. Authenticate
  const auth = await authenticate(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }
  const userId = auth.uid;

  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 3) {
      return res.status(400).json({ error: 'Please provide a trade intent (e.g., "Buy 20 AAPL at market price")' });
    }

    console.log('[quant] Evaluating intent for user:', userId, '| Input:', text);

    // 2. Parse intent
    const parseResult = await parseTradeIntent(text);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error || 'Could not parse trade intent' });
    }
    const intent = parseResult.intent;
    console.log('[quant] Parsed intent:', JSON.stringify(intent));

    // 3. Fetch market data (2 Alpha Vantage calls)
    const [quoteData, overviewData] = await Promise.all([
      fetchAlphaVantage('GLOBAL_QUOTE', intent.symbol),
      fetchAlphaVantage('OVERVIEW', intent.symbol)
    ]);

    const quote = quoteData?.['Global Quote'] || null;
    const overview = overviewData?.Symbol ? overviewData : null;

    if (quoteData?.rateLimited || overviewData?.rateLimited) {
      return res.status(429).json({
        error: 'Alpha Vantage API rate limit reached (25 calls/day on free tier). Try again later.',
        parsedIntent: intent
      });
    }

    // 4. Get user's portfolio from MongoDB
    let portfolio = [];
    try {
      const { db } = await connectToDatabase();
      portfolio = await db.collection('trades').find({ userId }).sort({ date: -1 }).toArray();
      console.log('[quant] Portfolio has', portfolio.length, 'trades');
    } catch (dbError) {
      console.error('[quant] DB error (continuing without portfolio):', dbError.message);
    }

    // 5. Compute all factor scores
    const fundamental = computeFundamentalScore(overview);
    const technical = computeTechnicalScore(quote, overview);
    const sector = computeSectorScore(overview);
    const sentiment = await computeSentimentScore(intent.symbol, overview);
    const portfolioFit = computePortfolioFitScore(intent, portfolio);

    // 6. Aggregate quant score
    const quantResult = computeQuantScore(
      fundamental.score,
      technical.score,
      sector.score,
      sentiment.score,
      portfolioFit.score
    );

    // 7. Compute risk metrics
    const riskMetrics = computeRiskMetrics(intent, portfolio, quote, overview);

    // 8. Portfolio stats
    const portfolioStats = computePortfolioStats(portfolio);

    // 9. Generate summary
    const summary = generateSummary(intent, quantResult, riskMetrics, fundamental, technical, sector, sentiment);

    // 10. Return structured response
    const response = {
      parsedIntent: intent,
      quantScore: {
        totalScore: quantResult.totalScore,
        recommendation: quantResult.recommendation,
        confidence: quantResult.confidence,
        breakdown: {
          fundamental: { score: fundamental.score, weight: '30%', details: fundamental.breakdown },
          technical: { score: technical.score, weight: '25%', details: technical.breakdown },
          sector: { score: sector.score, weight: '15%', details: sector.breakdown, sectorName: sector.sector, industry: sector.industry },
          sentiment: { score: sentiment.score, weight: '10%', details: sentiment.breakdown, brief: sentiment.brief },
          portfolioFit: { score: portfolioFit.score, weight: '20%', details: portfolioFit.breakdown }
        }
      },
      riskMetrics: {
        tradeValue: riskMetrics.tradeValue,
        currentPrice: riskMetrics.currentPrice,
        positionSizePercent: riskMetrics.positionSizePercent,
        portfolioValue: riskMetrics.portfolioValue,
        betaStock: riskMetrics.betaStock,
        betaPortfolioAfter: riskMetrics.betaPortfolioAfter,
        concentrationRisk: riskMetrics.concentrationRisk,
        riskPerTradePct: riskMetrics.riskPerTradePct,
        kellyOptimalPct: riskMetrics.kellyOptimalPct,
        riskViolation: riskMetrics.riskViolation,
        violations: riskMetrics.violations
      },
      portfolioStats: {
        totalTrades: portfolioStats.totalTrades,
        totalPnL: portfolioStats.totalPnL,
        winRate: portfolioStats.winRate,
        sharpeProxy: portfolioStats.sharpeProxy
      },
      recommendation: quantResult.recommendation,
      summary,
      timestamp: new Date().toISOString(),
      dataSource: {
        quote: !!quote,
        overview: !!overview,
        sentiment: sentiment.source || 'default',
        portfolio: portfolio.length > 0
      }
    };

    console.log('[quant] Result:', quantResult.recommendation, `(${quantResult.totalScore}/100)`);
    return res.status(200).json(response);

  } catch (error) {
    console.error('[quant] Evaluation error:', error);
    return res.status(500).json({
      error: 'Trade evaluation failed',
      details: error.message
    });
  }
}
