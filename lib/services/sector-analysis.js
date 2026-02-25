// Sector Analysis Service
// Server-side analysis of sector performance and rotation

/**
 * Analyze sector strength relative to market
 * Returns a ranked list of sectors with strength scores
 */
export function analyzeSectorStrength(sectors) {
  if (!sectors || sectors.length === 0) return [];

  // Compute relative strength
  const avgPerformance = sectors.reduce((s, sec) => s + (sec.sectorIndexPerformance || 0), 0) / sectors.length;

  return sectors.map(sector => {
    const relativeStrength = (sector.sectorIndexPerformance || 0) - avgPerformance;
    const growthScore = normalizeScore(sector.avgGrowth, 0, 30);
    const valuationScore = normalizeScore(50 - (sector.avgPE || 25), -30, 30); // Lower PE = better
    const momentumScore = normalizeScore(sector.sectorIndexPerformance || 0, -20, 40);

    const compositeScore = Math.round(
      growthScore * 0.3 + valuationScore * 0.2 + momentumScore * 0.5
    );

    let signal = 'neutral';
    if (compositeScore >= 70) signal = 'strong_buy';
    else if (compositeScore >= 55) signal = 'buy';
    else if (compositeScore >= 40) signal = 'neutral';
    else if (compositeScore >= 25) signal = 'underweight';
    else signal = 'avoid';

    return {
      sectorName: sector.sectorName,
      industry: sector.industry,
      avgPE: sector.avgPE,
      avgGrowth: sector.avgGrowth,
      sectorIndexPerformance: sector.sectorIndexPerformance,
      relativeStrength: parseFloat(relativeStrength.toFixed(1)),
      compositeScore,
      signal,
      topPerformingStocks: sector.topPerformingStocks || [],
      worstPerformingStocks: sector.worstPerformingStocks || [],
    };
  }).sort((a, b) => b.compositeScore - a.compositeScore);
}

/**
 * Detect sector rotation patterns
 * Classifies the market cycle phase based on sector performance
 */
export function detectSectorRotation(sectors) {
  if (!sectors || sectors.length === 0) {
    return { phase: 'unknown', description: 'Insufficient data' };
  }

  const sectorPerf = {};
  sectors.forEach(s => {
    sectorPerf[s.sectorName] = s.sectorIndexPerformance || 0;
  });

  // Classify market cycle based on which sectors lead
  // Early cycle: Financials, Consumer Discretionary lead
  // Mid cycle: Technology, Industrials lead
  // Late cycle: Energy, Materials lead
  // Recession: Healthcare, Consumer Staples, Utilities lead

  const cyclicalStrength = avg([
    sectorPerf['Financial Services'],
    sectorPerf['Automobile'],
    sectorPerf['Real Estate'],
  ].filter(v => v !== undefined));

  const growthStrength = avg([
    sectorPerf['Technology'],
    sectorPerf['Infrastructure'],
  ].filter(v => v !== undefined));

  const defensiveStrength = avg([
    sectorPerf['Healthcare'],
    sectorPerf['Consumer Goods'],
  ].filter(v => v !== undefined));

  const commodityStrength = avg([
    sectorPerf['Energy'],
    sectorPerf['Metals & Mining'],
  ].filter(v => v !== undefined));

  const phases = [
    { phase: 'early_expansion', score: cyclicalStrength, description: 'Early expansion — Financials & cyclicals leading. Market recovering from trough.' },
    { phase: 'mid_expansion', score: growthStrength, description: 'Mid expansion — Technology & industrials leading. Sustained growth phase.' },
    { phase: 'late_expansion', score: commodityStrength, description: 'Late expansion — Energy & materials leading. Commodity-driven cycle.' },
    { phase: 'contraction', score: defensiveStrength, description: 'Contraction signal — Defensives leading. Rotate to quality & low-beta.' },
  ];

  phases.sort((a, b) => b.score - a.score);
  const dominant = phases[0];

  return {
    phase: dominant.phase,
    description: dominant.description,
    sectorScores: {
      cyclical: parseFloat(cyclicalStrength.toFixed(1)),
      growth: parseFloat(growthStrength.toFixed(1)),
      defensive: parseFloat(defensiveStrength.toFixed(1)),
      commodity: parseFloat(commodityStrength.toFixed(1)),
    },
  };
}

/**
 * Build sector heatmap data
 */
export function buildSectorHeatmap(sectors) {
  return sectors.map(sector => ({
    name: sector.sectorName,
    performance: sector.sectorIndexPerformance || 0,
    avgPE: sector.avgPE || 0,
    avgGrowth: sector.avgGrowth || 0,
    stockCount: (sector.topPerformingStocks?.length || 0) + (sector.worstPerformingStocks?.length || 0),
    color: getHeatmapColor(sector.sectorIndexPerformance || 0),
  }));
}

// ─── Helpers ───────────────────────────────────────────────

function normalizeScore(value, min, max) {
  const clamped = Math.max(min, Math.min(max, value));
  return Math.round(((clamped - min) / (max - min)) * 100);
}

function avg(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function getHeatmapColor(performance) {
  if (performance >= 20) return '#15803d';      // strong green
  if (performance >= 10) return '#22c55e';      // green
  if (performance >= 0) return '#86efac';       // light green
  if (performance >= -10) return '#fca5a5';     // light red
  if (performance >= -20) return '#ef4444';     // red
  return '#991b1b';                              // dark red
}
