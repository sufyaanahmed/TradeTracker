// Company Analysis Service
// Server-side analysis of company fundamentals

/**
 * Compute growth trend from a history array
 * Returns: 'accelerating' | 'stable' | 'decelerating' | 'declining'
 */
function computeGrowthTrend(history) {
  if (!history || history.length < 3) return 'insufficient_data';

  const values = history.map(h => h.value);
  const recentHalf = values.slice(Math.floor(values.length / 2));
  const olderHalf = values.slice(0, Math.floor(values.length / 2));

  const recentAvg = recentHalf.reduce((s, v) => s + v, 0) / recentHalf.length;
  const olderAvg = olderHalf.reduce((s, v) => s + v, 0) / olderHalf.length;

  const growthRate = ((recentAvg - olderAvg) / olderAvg) * 100;

  // Check acceleration (compare growth rates)
  const recentGrowths = [];
  for (let i = 1; i < values.length; i++) {
    recentGrowths.push(((values[i] - values[i - 1]) / values[i - 1]) * 100);
  }

  const firstHalfGrowth = recentGrowths.slice(0, Math.floor(recentGrowths.length / 2));
  const secondHalfGrowth = recentGrowths.slice(Math.floor(recentGrowths.length / 2));

  const avgFirstGrowth = firstHalfGrowth.reduce((s, v) => s + v, 0) / firstHalfGrowth.length;
  const avgSecondGrowth = secondHalfGrowth.reduce((s, v) => s + v, 0) / secondHalfGrowth.length;

  if (growthRate < -5) return 'declining';
  if (avgSecondGrowth > avgFirstGrowth + 1) return 'accelerating';
  if (avgSecondGrowth < avgFirstGrowth - 1) return 'decelerating';
  return 'stable';
}

/**
 * Compute profitability trend
 * Returns: 'improving' | 'stable' | 'deteriorating'
 */
function computeProfitabilityTrend(company) {
  const { marginHistory, ROE, ROCE, operatingMargin } = company;

  // Use margin history for trend
  const marginTrend = computeGrowthTrend(marginHistory);

  // Current profitability score (0-100)
  let score = 0;
  if (operatingMargin > 20) score += 30;
  else if (operatingMargin > 10) score += 20;
  else score += 10;

  if (ROE > 15) score += 25;
  else if (ROE > 10) score += 15;
  else score += 5;

  if (ROCE > 15) score += 25;
  else if (ROCE > 10) score += 15;
  else score += 5;

  if (marginTrend === 'accelerating' || marginTrend === 'stable') score += 20;
  else if (marginTrend === 'decelerating') score += 10;

  let trend = 'stable';
  if (marginTrend === 'accelerating') trend = 'improving';
  else if (marginTrend === 'declining') trend = 'deteriorating';

  return { trend, score: Math.min(score, 100) };
}

/**
 * Assess debt risk level
 * Returns: 'low' | 'moderate' | 'high' | 'critical'
 */
function assessDebtRisk(company) {
  const { debtToEquity, freeCashFlow, netProfit, sector } = company;

  // Banks naturally have high D/E, adjust thresholds
  const isFinancial = sector === 'Financial Services' || sector === 'Banking';
  const deThreshold = isFinancial ? { low: 8, moderate: 12, high: 16 } : { low: 0.5, moderate: 1.0, high: 2.0 };

  let riskLevel = 'low';
  let riskScore = 0;

  if (debtToEquity > deThreshold.high) {
    riskLevel = 'critical';
    riskScore = 90;
  } else if (debtToEquity > deThreshold.moderate) {
    riskLevel = 'high';
    riskScore = 70;
  } else if (debtToEquity > deThreshold.low) {
    riskLevel = 'moderate';
    riskScore = 40;
  } else {
    riskLevel = 'low';
    riskScore = 15;
  }

  // Adjust for FCF coverage
  if (freeCashFlow && netProfit) {
    const fcfCoverage = freeCashFlow / netProfit;
    if (fcfCoverage > 0.8) riskScore -= 10;
    else if (fcfCoverage < 0.3) riskScore += 10;
  }

  return { level: riskLevel, score: Math.max(0, Math.min(100, riskScore)) };
}

/**
 * Analyze institutional (FII/DII) accumulation patterns
 * Returns: 'strong_accumulation' | 'accumulation' | 'neutral' | 'distribution' | 'strong_distribution'
 */
function analyzeInstitutionalFlow(company) {
  const { fiiHolding, fiiChange, diiHolding, diiChange } = company;

  const totalInstitutional = (fiiHolding || 0) + (diiHolding || 0);
  const netChange = (fiiChange || 0) + (diiChange || 0);

  let pattern = 'neutral';
  let signal = 'neutral';

  if (netChange > 1.5) {
    pattern = 'strong_accumulation';
    signal = 'bullish';
  } else if (netChange > 0.5) {
    pattern = 'accumulation';
    signal = 'bullish';
  } else if (netChange < -1.5) {
    pattern = 'strong_distribution';
    signal = 'bearish';
  } else if (netChange < -0.5) {
    pattern = 'distribution';
    signal = 'bearish';
  }

  // FII vs DII divergence insight
  let divergence = null;
  if (fiiChange > 0.5 && diiChange < -0.5) {
    divergence = 'FII buying while DII selling - potential re-rating';
  } else if (fiiChange < -0.5 && diiChange > 0.5) {
    divergence = 'FII selling while DII buying - domestic support';
  }

  return {
    pattern,
    signal,
    totalInstitutional: parseFloat(totalInstitutional.toFixed(1)),
    netChange: parseFloat(netChange.toFixed(1)),
    fii: { holding: fiiHolding, change: fiiChange },
    dii: { holding: diiHolding, change: diiChange },
    divergence,
  };
}

/**
 * Compute overall fundamental score (0-100)
 */
function computeFundamentalScore(company) {
  let score = 0;
  let maxScore = 0;

  // Growth (25 points)
  maxScore += 25;
  if (company.revenueGrowth > 15) score += 25;
  else if (company.revenueGrowth > 8) score += 18;
  else if (company.revenueGrowth > 0) score += 10;
  else score += 3;

  // Profitability (25 points)
  maxScore += 25;
  if (company.ROE > 20) score += 12;
  else if (company.ROE > 12) score += 8;
  else score += 3;

  if (company.operatingMargin > 20) score += 13;
  else if (company.operatingMargin > 10) score += 8;
  else score += 3;

  // Valuation (20 points)
  maxScore += 20;
  if (company.pegRatio && company.pegRatio < 1) score += 20;
  else if (company.pegRatio && company.pegRatio < 2) score += 14;
  else if (company.peRatio < 15) score += 12;
  else if (company.peRatio < 25) score += 8;
  else score += 3;

  // Debt health (15 points)
  maxScore += 15;
  const debtRisk = assessDebtRisk(company);
  if (debtRisk.level === 'low') score += 15;
  else if (debtRisk.level === 'moderate') score += 10;
  else if (debtRisk.level === 'high') score += 5;
  else score += 0;

  // Institutional flow (15 points)
  maxScore += 15;
  const flow = analyzeInstitutionalFlow(company);
  if (flow.pattern === 'strong_accumulation') score += 15;
  else if (flow.pattern === 'accumulation') score += 12;
  else if (flow.pattern === 'neutral') score += 8;
  else if (flow.pattern === 'distribution') score += 4;
  else score += 0;

  return Math.round((score / maxScore) * 100);
}

/**
 * Full company analysis — main export
 */
export function analyzeCompany(company) {
  const growthTrend = {
    revenue: computeGrowthTrend(company.revenueHistory),
    profit: computeGrowthTrend(company.profitHistory),
    margin: computeGrowthTrend(company.marginHistory),
  };

  const profitability = computeProfitabilityTrend(company);
  const debtRisk = assessDebtRisk(company);
  const institutionalFlow = analyzeInstitutionalFlow(company);
  const fundamentalScore = computeFundamentalScore(company);

  // Generate summary
  const strengths = [];
  const weaknesses = [];
  const catalysts = [];

  if (company.revenueGrowth > 15) strengths.push('Strong revenue growth');
  if (company.ROE > 20) strengths.push('High return on equity');
  if (company.operatingMargin > 20) strengths.push('Healthy operating margins');
  if (debtRisk.level === 'low') strengths.push('Low debt levels');
  if (institutionalFlow.pattern.includes('accumulation')) strengths.push('Institutional accumulation');
  if (company.pegRatio && company.pegRatio < 1) strengths.push('Attractive PEG ratio');

  if (company.revenueGrowth < 5) weaknesses.push('Slow revenue growth');
  if (company.ROE < 10) weaknesses.push('Below-average ROE');
  if (debtRisk.level === 'high' || debtRisk.level === 'critical') weaknesses.push('High debt burden');
  if (institutionalFlow.pattern.includes('distribution')) weaknesses.push('Institutional selling');
  if (company.peRatio > 40) weaknesses.push('Expensive valuation');
  if (company.netProfitGrowth < 0) weaknesses.push('Declining profits');

  if (growthTrend.revenue === 'accelerating') catalysts.push('Accelerating revenue growth');
  if (growthTrend.margin === 'accelerating') catalysts.push('Expanding margins');
  if (institutionalFlow.divergence) catalysts.push(institutionalFlow.divergence);

  // Overall sentiment
  let sentiment = 'neutral';
  if (fundamentalScore >= 70) sentiment = 'bullish';
  else if (fundamentalScore >= 50) sentiment = 'cautiously_bullish';
  else if (fundamentalScore >= 30) sentiment = 'cautiously_bearish';
  else sentiment = 'bearish';

  return {
    symbol: company.symbol,
    companyName: company.companyName,
    sector: company.sector,
    industry: company.industry,
    fundamentalScore,
    sentiment,
    growthTrend,
    profitability,
    debtRisk,
    institutionalFlow,
    strengths,
    weaknesses,
    catalysts,
    metrics: {
      revenue: company.revenue,
      revenueGrowth: company.revenueGrowth,
      netProfit: company.netProfit,
      netProfitGrowth: company.netProfitGrowth,
      operatingMargin: company.operatingMargin,
      ROE: company.ROE,
      ROCE: company.ROCE,
      debtToEquity: company.debtToEquity,
      freeCashFlow: company.freeCashFlow,
      peRatio: company.peRatio,
      pbRatio: company.pbRatio,
      evEbitda: company.evEbitda,
      pegRatio: company.pegRatio,
    },
  };
}
