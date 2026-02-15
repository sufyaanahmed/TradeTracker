// Multi-Factor Quantitative Scoring Engine
// 5 factor categories with deterministic, explainable scoring
//
// Weights:
//   Fundamental  30%
//   Technical    25%
//   Sector/Macro 15%
//   Sentiment    10%
//   Portfolio Fit 20%

// ─────────────────────────────────────────────
//  UTILITY
// ─────────────────────────────────────────────
function safeFloat(val) {
  if (val === null || val === undefined || val === 'None' || val === '-' || val === 'N/A') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function clamp(v, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, v)); }

function linearScore(value, worst, best) {
  if (value === null) return 50;
  if (best === worst) return 50;
  return clamp(((value - worst) / (best - worst)) * 100);
}

// ─────────────────────────────────────────────
//  1. FUNDAMENTAL SCORE  (30%)
// ─────────────────────────────────────────────

function scorePE(pe) {
  if (pe === null || pe <= 0) return 45; // negative PE = loss-making
  if (pe < 10) return 95;
  if (pe < 15) return 85;
  if (pe < 20) return 75;
  if (pe < 25) return 65;
  if (pe < 35) return 50;
  if (pe < 50) return 35;
  return 15;
}

function scoreEPSGrowth(growth) {
  // Alpha Vantage QuarterlyEarningsGrowthYOY returns decimal (0.15 = 15%)
  if (growth === null) return 50;
  const pct = growth * 100;
  if (pct > 50) return 95;
  if (pct > 30) return 85;
  if (pct > 20) return 75;
  if (pct > 10) return 65;
  if (pct > 5) return 55;
  if (pct > 0) return 45;
  if (pct > -10) return 30;
  return 15;
}

function scoreROE(roe) {
  if (roe === null) return 50;
  const pct = roe * 100;
  if (pct > 25) return 95;
  if (pct > 20) return 85;
  if (pct > 15) return 75;
  if (pct > 10) return 60;
  if (pct > 5) return 45;
  if (pct > 0) return 30;
  return 15;
}

function scoreDebtEquity(de) {
  // Lower is better
  if (de === null) return 50;
  if (de < 0.1) return 95;
  if (de < 0.3) return 85;
  if (de < 0.5) return 75;
  if (de < 0.8) return 65;
  if (de < 1.0) return 55;
  if (de < 1.5) return 40;
  if (de < 2.5) return 25;
  return 10;
}

function scoreRevenueGrowth(growth) {
  if (growth === null) return 50;
  const pct = growth * 100;
  if (pct > 30) return 95;
  if (pct > 20) return 85;
  if (pct > 15) return 75;
  if (pct > 10) return 65;
  if (pct > 5) return 55;
  if (pct > 0) return 45;
  if (pct > -5) return 30;
  return 15;
}

export function computeFundamentalScore(overview) {
  if (!overview || !overview.Symbol) {
    return { score: 50, breakdown: {}, dataAvailable: false };
  }

  const pe = safeFloat(overview.PERatio);
  const epsGrowth = safeFloat(overview.QuarterlyEarningsGrowthYOY);
  const roe = safeFloat(overview.ReturnOnEquityTTM);
  const profitMargin = safeFloat(overview.ProfitMargin);
  const revenueGrowth = safeFloat(overview.QuarterlyRevenueGrowthYOY);

  // Debt/Equity: estimate from BookValue and MarketCap
  const bookValue = safeFloat(overview.BookValue);
  const sharesOut = safeFloat(overview.SharesOutstanding);
  const marketCap = safeFloat(overview.MarketCapitalization);
  let debtEquity = null;
  if (bookValue && sharesOut && marketCap) {
    const totalEquity = bookValue * sharesOut;
    // Enterprise value proxy
    debtEquity = totalEquity > 0 ? Math.max(0, (marketCap - totalEquity) / totalEquity) : null;
  }

  const scores = {
    peRatio: { value: pe, score: scorePE(pe) },
    epsGrowth: { value: epsGrowth, score: scoreEPSGrowth(epsGrowth) },
    roe: { value: roe, score: scoreROE(roe) },
    debtEquity: { value: debtEquity, score: scoreDebtEquity(debtEquity) },
    revenueGrowth: { value: revenueGrowth, score: scoreRevenueGrowth(revenueGrowth) }
  };

  const values = Object.values(scores).map(s => s.score);
  const avgScore = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    score: Math.round(avgScore),
    breakdown: scores,
    dataAvailable: true
  };
}

// ─────────────────────────────────────────────
//  2. TECHNICAL SCORE  (25%)
// ─────────────────────────────────────────────

function scorePriceVsMA(price, ma) {
  if (price === null || ma === null || ma === 0) return 50;
  const ratio = (price - ma) / ma;
  // Above MA is bullish, but too far above is overbought
  if (ratio > 0.20) return 40;  // Very overbought
  if (ratio > 0.10) return 55;  // Overbought
  if (ratio > 0.03) return 80;  // Healthy bullish
  if (ratio > -0.03) return 60; // Neutral
  if (ratio > -0.10) return 35; // Below MA
  if (ratio > -0.20) return 20; // Bearish
  return 10; // Very bearish
}

function scoreMAAlignment(ma50, ma200) {
  // Golden cross (50 > 200) is bullish
  if (ma50 === null || ma200 === null || ma200 === 0) return 50;
  const ratio = (ma50 - ma200) / ma200;
  if (ratio > 0.10) return 90; // Strong golden cross
  if (ratio > 0.03) return 75; // Golden cross
  if (ratio > -0.03) return 50; // Near crossover
  if (ratio > -0.10) return 30; // Death cross
  return 15; // Strong death cross
}

function score52WeekPosition(price, high, low) {
  if (price === null || high === null || low === null || high === low) return 50;
  const position = (price - low) / (high - low); // 0 = at 52w low, 1 = at 52w high
  // Near highs could be momentum or overbought
  if (position > 0.90) return 55; // Near 52w high - momentum but risky
  if (position > 0.70) return 80; // Strong uptrend
  if (position > 0.50) return 70; // Above midpoint
  if (position > 0.30) return 45; // Below midpoint
  if (position > 0.10) return 25; // Near lows
  return 15; // At 52w low
}

function scoreVolume(volume, avgVolume) {
  if (volume === null || avgVolume === null || avgVolume === 0) return 50;
  const ratio = volume / avgVolume;
  // Higher volume confirms trend
  if (ratio > 2.0) return 80;
  if (ratio > 1.5) return 70;
  if (ratio > 1.0) return 60;
  if (ratio > 0.7) return 45;
  return 30; // Low volume - weak conviction
}

function scoreChangePercent(changePct) {
  if (changePct === null) return 50;
  // For BUY recommendation context
  if (changePct > 3) return 45;  // Already moved a lot today
  if (changePct > 1) return 65;  // Positive momentum
  if (changePct > 0) return 60;  // Slightly positive
  if (changePct > -1) return 50; // Slightly negative
  if (changePct > -3) return 55; // Pullback opportunity
  return 40; // Big drop - possible catch
}

export function computeTechnicalScore(quote, overview) {
  const price = safeFloat(quote?.['05. price']);
  const change = safeFloat(quote?.['09. change']);
  const changePctStr = quote?.['10. change percent'];
  const changePct = changePctStr ? safeFloat(changePctStr.replace('%', '')) : null;
  const volume = safeFloat(quote?.['06. volume']);

  const ma50 = safeFloat(overview?.['50DayMovingAverage']);
  const ma200 = safeFloat(overview?.['200DayMovingAverage']);
  const high52 = safeFloat(overview?.['52WeekHigh']);
  const low52 = safeFloat(overview?.['52WeekLow']);

  // Estimate average volume (not directly in OVERVIEW, use a rough proxy)
  const avgVolume = volume; // Would need TIME_SERIES for real avg

  const scores = {
    priceVsMA50: { value: { price, ma50 }, score: scorePriceVsMA(price, ma50) },
    priceVsMA200: { value: { price, ma200 }, score: scorePriceVsMA(price, ma200) },
    maAlignment: { value: { ma50, ma200 }, score: scoreMAAlignment(ma50, ma200) },
    weekPosition: { value: { price, high52, low52 }, score: score52WeekPosition(price, high52, low52) },
    momentum: { value: changePct, score: scoreChangePercent(changePct) }
  };

  const values = Object.values(scores).map(s => s.score);
  const avgScore = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    score: Math.round(avgScore),
    breakdown: scores,
    currentPrice: price,
    change,
    changePct
  };
}

// ─────────────────────────────────────────────
//  3. SECTOR / MACRO SCORE  (15%)
// ─────────────────────────────────────────────

function scoreBeta(beta) {
  // Beta near 1 is neutral, <1 defensive, >1 aggressive
  if (beta === null) return 50;
  if (beta < 0.5) return 70;  // Very defensive
  if (beta < 0.8) return 65;  // Defensive
  if (beta < 1.0) return 60;  // Slightly defensive
  if (beta < 1.2) return 55;  // Slightly aggressive
  if (beta < 1.5) return 45;  // Aggressive
  if (beta < 2.0) return 35;  // Very aggressive
  return 20; // Extremely volatile
}

function scoreMarketCap(mcap) {
  // Larger companies are generally safer
  if (mcap === null) return 50;
  const billions = mcap / 1e9;
  if (billions > 200) return 85; // Mega cap
  if (billions > 50) return 75;  // Large cap
  if (billions > 10) return 65;  // Mid cap
  if (billions > 2) return 50;   // Small cap
  if (billions > 0.3) return 35; // Micro cap
  return 20; // Nano cap
}

function scoreDividendYield(dy) {
  if (dy === null || dy === 0) return 40; // No dividend
  const pct = dy * 100;
  if (pct > 6) return 50;  // Very high - could be unsustainable
  if (pct > 4) return 75;  // Strong dividend
  if (pct > 2.5) return 80; // Good dividend
  if (pct > 1) return 60;  // Modest dividend
  return 45;
}

export function computeSectorScore(overview) {
  if (!overview || !overview.Symbol) {
    return { score: 50, breakdown: {}, sector: 'Unknown', industry: 'Unknown' };
  }

  const beta = safeFloat(overview.Beta);
  const mcap = safeFloat(overview.MarketCapitalization);
  const dy = safeFloat(overview.DividendYield);
  const pegRatio = safeFloat(overview.PEGRatio);

  // PEG < 1 is undervalued relative to growth
  let pegScore = 50;
  if (pegRatio !== null) {
    if (pegRatio < 0) pegScore = 30;
    else if (pegRatio < 0.5) pegScore = 95;
    else if (pegRatio < 1.0) pegScore = 80;
    else if (pegRatio < 1.5) pegScore = 65;
    else if (pegRatio < 2.0) pegScore = 50;
    else if (pegRatio < 3.0) pegScore = 35;
    else pegScore = 20;
  }

  const scores = {
    beta: { value: beta, score: scoreBeta(beta) },
    marketCap: { value: mcap, score: scoreMarketCap(mcap) },
    dividendYield: { value: dy, score: scoreDividendYield(dy) },
    pegRatio: { value: pegRatio, score: pegScore }
  };

  const values = Object.values(scores).map(s => s.score);
  const avgScore = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    score: Math.round(avgScore),
    breakdown: scores,
    sector: overview.Sector || 'Unknown',
    industry: overview.Industry || 'Unknown'
  };
}

// ─────────────────────────────────────────────
//  4. SENTIMENT SCORE  (10%)
// ─────────────────────────────────────────────

export async function computeSentimentScore(symbol, overview) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { score: 55, breakdown: { source: 'default' }, note: 'Gemini API not available' };
  }

  try {
    const companyName = overview?.Name || symbol;
    const sector = overview?.Sector || 'Unknown';

    const prompt = `Rate the current market sentiment for ${companyName} (${symbol}) in the ${sector} sector.

Consider: recent news, analyst consensus, earnings momentum, market trends.

Return ONLY a JSON object (no markdown):
{
  "sentimentScore": <number 0-100>,
  "newsPolarity": <number 0-100>,
  "analystSentiment": <number 0-100>,
  "earningsTone": <number 0-100>,
  "brief": "<one sentence summary>"
}

Score guide: 0=very bearish, 50=neutral, 100=very bullish.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 300 }
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini error ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const parsed = JSON.parse(jsonMatch[0]);

    const newsScore = clamp(safeFloat(parsed.newsPolarity) || 55);
    const analystScore = clamp(safeFloat(parsed.analystSentiment) || 55);
    const earningsScore = clamp(safeFloat(parsed.earningsTone) || 55);
    const overallScore = clamp(safeFloat(parsed.sentimentScore) || 55);

    const avgScore = Math.round((newsScore + analystScore + earningsScore + overallScore) / 4);

    return {
      score: avgScore,
      breakdown: {
        newsPolarity: { score: newsScore },
        analystSentiment: { score: analystScore },
        earningsTone: { score: earningsScore },
        overall: { score: overallScore }
      },
      brief: parsed.brief || '',
      source: 'gemini'
    };
  } catch (error) {
    console.error('[factor-model] Sentiment analysis failed:', error.message);
    // Neutral fallback
    return {
      score: 55,
      breakdown: { source: 'fallback' },
      note: 'Sentiment data unavailable',
      brief: 'Unable to assess sentiment - using neutral baseline'
    };
  }
}

// ─────────────────────────────────────────────
//  5. PORTFOLIO FIT SCORE  (20%)
// ─────────────────────────────────────────────

export function computePortfolioFitScore(intent, portfolio) {
  if (!portfolio || portfolio.length === 0) {
    // No existing portfolio - new position is always diversifying
    return {
      score: 75,
      breakdown: {
        diversification: { score: 90, note: 'First position - good start' },
        concentration: { score: 80, note: 'No concentration risk' },
        correlationImpact: { score: 70, note: 'No correlation data' },
        drawdownImpact: { score: 60, note: 'No historical drawdown data' }
      }
    };
  }

  const symbol = intent.symbol;

  // 1. Diversification: is this a new stock?
  const existingSymbols = [...new Set(portfolio.map(t => t.name?.toUpperCase()))];
  const isNewStock = !existingSymbols.includes(symbol.toUpperCase());
  const uniqueStocks = existingSymbols.length;
  const diversificationScore = isNewStock
    ? Math.min(95, 60 + uniqueStocks * 5) // New stock improves diversification
    : Math.max(20, 70 - uniqueStocks * 3); // Existing stock adds concentration

  // 2. Concentration: how many trades in this stock vs total
  const tradesInSymbol = portfolio.filter(t => t.name?.toUpperCase() === symbol.toUpperCase()).length;
  const totalTrades = portfolio.length;
  const concentrationRatio = tradesInSymbol / totalTrades;
  let concentrationScore = 80;
  if (concentrationRatio > 0.5) concentrationScore = 15;
  else if (concentrationRatio > 0.3) concentrationScore = 30;
  else if (concentrationRatio > 0.2) concentrationScore = 50;
  else if (concentrationRatio > 0.1) concentrationScore = 65;

  // 3. P&L correlation: does this stock's P&L correlate with portfolio?
  const symbolTrades = portfolio.filter(t => t.name?.toUpperCase() === symbol.toUpperCase());
  let correlationScore = 60;
  if (symbolTrades.length >= 3) {
    const avgPL = symbolTrades.reduce((s, t) => s + (t.pl || 0), 0) / symbolTrades.length;
    const portfolioAvgPL = portfolio.reduce((s, t) => s + (t.pl || 0), 0) / totalTrades;
    // If both positive or both negative, high correlation (bad for diversification)
    if ((avgPL > 0 && portfolioAvgPL > 0) || (avgPL < 0 && portfolioAvgPL < 0)) {
      correlationScore = 40; // Correlated
    } else {
      correlationScore = 75; // Uncorrelated - good
    }
  }

  // 4. Drawdown impact: losing streak detection
  const recentTrades = portfolio.slice(0, 5);
  const recentLosses = recentTrades.filter(t => (t.pl || 0) < 0).length;
  let drawdownScore = 70;
  if (recentLosses >= 4) drawdownScore = 25; // In a losing streak - be cautious
  else if (recentLosses >= 3) drawdownScore = 40;
  else if (recentLosses >= 2) drawdownScore = 55;
  else drawdownScore = 80; // Recent winners

  const avgScore = Math.round(
    (diversificationScore + concentrationScore + correlationScore + drawdownScore) / 4
  );

  return {
    score: avgScore,
    breakdown: {
      diversification: { score: diversificationScore, note: isNewStock ? 'New stock adds diversity' : 'Already in portfolio' },
      concentration: { score: concentrationScore, note: `${tradesInSymbol}/${totalTrades} trades in ${symbol}` },
      correlationImpact: { score: correlationScore, note: symbolTrades.length >= 3 ? 'Based on historical P&L' : 'Limited data' },
      drawdownImpact: { score: drawdownScore, note: `${recentLosses}/5 recent trades were losses` }
    }
  };
}

// ─────────────────────────────────────────────
//  AGGREGATE QUANT SCORE
// ─────────────────────────────────────────────

const WEIGHTS = {
  fundamental: 0.30,
  technical: 0.25,
  sector: 0.15,
  sentiment: 0.10,
  portfolioFit: 0.20
};

export function computeQuantScore(fundamentalScore, technicalScore, sectorScore, sentimentScore, portfolioFitScore) {
  const totalScore = Math.round(
    fundamentalScore * WEIGHTS.fundamental +
    technicalScore * WEIGHTS.technical +
    sectorScore * WEIGHTS.sector +
    sentimentScore * WEIGHTS.sentiment +
    portfolioFitScore * WEIGHTS.portfolioFit
  );

  let recommendation, confidence;
  if (totalScore >= 80) {
    recommendation = 'STRONG BUY';
    confidence = 'HIGH';
  } else if (totalScore >= 65) {
    recommendation = 'BUY';
    confidence = 'MODERATE';
  } else if (totalScore >= 50) {
    recommendation = 'NEUTRAL';
    confidence = 'LOW';
  } else {
    recommendation = 'AVOID';
    confidence = 'HIGH';
  }

  return {
    totalScore: clamp(totalScore),
    weights: WEIGHTS,
    breakdown: {
      fundamental: { score: fundamentalScore, weight: WEIGHTS.fundamental, weighted: Math.round(fundamentalScore * WEIGHTS.fundamental) },
      technical: { score: technicalScore, weight: WEIGHTS.technical, weighted: Math.round(technicalScore * WEIGHTS.technical) },
      sector: { score: sectorScore, weight: WEIGHTS.sector, weighted: Math.round(sectorScore * WEIGHTS.sector) },
      sentiment: { score: sentimentScore, weight: WEIGHTS.sentiment, weighted: Math.round(sentimentScore * WEIGHTS.sentiment) },
      portfolioFit: { score: portfolioFitScore, weight: WEIGHTS.portfolioFit, weighted: Math.round(portfolioFitScore * WEIGHTS.portfolioFit) }
    },
    recommendation,
    confidence
  };
}
