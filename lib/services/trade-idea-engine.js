// Trade Idea Engine
// Generates swing trade ideas based on multi-factor analysis

import { analyzeCompany } from './company-analysis.js';

/**
 * Generate swing trade ideas based on:
 * - sector strength
 * - macro conditions
 * - fundamental score
 * - FII/DII accumulation
 * - existing open trades (avoid over-concentration)
 */
export function generateTradeIdeas({ companies, sectors, macroSentiment, activeTrades }) {
  const ideas = [];

  // Build sector strength map
  const sectorStrength = {};
  (sectors || []).forEach(s => {
    sectorStrength[s.sectorName] = {
      performance: s.sectorIndexPerformance || 0,
      avgGrowth: s.avgGrowth || 0,
    };
  });

  // Count active trades per sector to avoid over-concentration
  const sectorExposure = {};
  (activeTrades || []).forEach(trade => {
    const sector = trade.sector || 'Unknown';
    sectorExposure[sector] = (sectorExposure[sector] || 0) + 1;
  });

  // Active symbols to avoid suggesting already-held stocks
  const activeSymbols = new Set((activeTrades || []).map(t => t.symbol?.toUpperCase()));

  for (const company of companies) {
    // Skip if already holding
    if (activeSymbols.has(company.symbol?.toUpperCase())) continue;

    // Skip if sector over-exposed (>= 3 positions in same sector)
    const sectorCount = sectorExposure[company.sector] || 0;
    if (sectorCount >= 3) continue;

    const analysis = analyzeCompany(company);
    const sectorData = sectorStrength[company.sector] || { performance: 0, avgGrowth: 0 };

    // Compute idea score (0-100)
    const fundamentalWeight = 0.35;
    const sectorWeight = 0.25;
    const macroWeight = 0.20;
    const institutionalWeight = 0.20;

    const sectorScore = normalizeScore(sectorData.performance, -20, 40);
    const macroScore = macroSentiment?.combined?.score || 50;

    let institutionalScore = 50;
    if (analysis.institutionalFlow.pattern === 'strong_accumulation') institutionalScore = 90;
    else if (analysis.institutionalFlow.pattern === 'accumulation') institutionalScore = 75;
    else if (analysis.institutionalFlow.pattern === 'neutral') institutionalScore = 50;
    else if (analysis.institutionalFlow.pattern === 'distribution') institutionalScore = 25;
    else institutionalScore = 10;

    const ideaScore = Math.round(
      analysis.fundamentalScore * fundamentalWeight +
      sectorScore * sectorWeight +
      macroScore * macroWeight +
      institutionalScore * institutionalWeight
    );

    // Only suggest if score >= 55
    if (ideaScore < 55) continue;

    // Build reason string
    const reasons = [];
    if (analysis.fundamentalScore >= 60) reasons.push('Strong fundamentals');
    if (sectorData.performance >= 10) reasons.push(`${company.sector} sector outperforming`);
    if (macroScore >= 55) reasons.push('Supportive macro environment');
    if (analysis.institutionalFlow.pattern.includes('accumulation')) reasons.push('Institutional buying');
    if (analysis.growthTrend.revenue === 'accelerating') reasons.push('Accelerating revenue growth');
    if (company.pegRatio && company.pegRatio < 1.5) reasons.push('Attractive valuation (PEG)');

    ideas.push({
      symbol: company.symbol,
      companyName: company.companyName,
      sector: company.sector,
      industry: company.industry,
      ideaScore,
      fundamentalScore: analysis.fundamentalScore,
      sectorStrength: parseFloat(sectorData.performance.toFixed(1)),
      macroSupport: macroScore >= 50,
      reason: reasons.join('. '),
      reasons,
      sentiment: analysis.sentiment,
      keyMetrics: {
        peRatio: company.peRatio,
        pegRatio: company.pegRatio,
        revenueGrowth: company.revenueGrowth,
        ROE: company.ROE,
        debtToEquity: company.debtToEquity,
      },
      institutionalFlow: analysis.institutionalFlow.pattern,
      tradeType: 'swing',
      suggestedHorizon: '2-8 weeks',
    });
  }

  // Sort by score descending, return top 10
  ideas.sort((a, b) => b.ideaScore - a.ideaScore);
  return ideas.slice(0, 10);
}

function normalizeScore(value, min, max) {
  const clamped = Math.max(min, Math.min(max, value));
  return Math.round(((clamped - min) / (max - min)) * 100);
}
