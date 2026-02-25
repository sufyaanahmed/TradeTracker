// Macro Analysis Service
// Server-side analysis of macroeconomic conditions

/**
 * Compute sentiment for US macro environment
 * Returns: { sentiment: 'bullish'|'neutral'|'bearish', score: Number, factors: [] }
 */
export function analyzeUSMacro(macro) {
  const factors = [];
  let score = 50; // neutral baseline

  // Interest Rate analysis
  if (macro.usInterestRate <= 3.0) {
    score += 15;
    factors.push({ factor: 'US Interest Rate', value: `${macro.usInterestRate}%`, impact: 'bullish', detail: 'Accommodative monetary policy supports equities' });
  } else if (macro.usInterestRate <= 5.0) {
    score += 0;
    factors.push({ factor: 'US Interest Rate', value: `${macro.usInterestRate}%`, impact: 'neutral', detail: 'Rates normalizing — watch for Fed pivot signals' });
  } else {
    score -= 15;
    factors.push({ factor: 'US Interest Rate', value: `${macro.usInterestRate}%`, impact: 'bearish', detail: 'Restrictive policy dampens risk appetite' });
  }

  // Inflation
  if (macro.usInflation <= 2.5) {
    score += 10;
    factors.push({ factor: 'US Inflation', value: `${macro.usInflation}%`, impact: 'bullish', detail: 'Inflation under control — Fed may ease' });
  } else if (macro.usInflation <= 4.0) {
    score += 0;
    factors.push({ factor: 'US Inflation', value: `${macro.usInflation}%`, impact: 'neutral', detail: 'Inflation elevated but manageable' });
  } else {
    score -= 15;
    factors.push({ factor: 'US Inflation', value: `${macro.usInflation}%`, impact: 'bearish', detail: 'High inflation — tightening risk persists' });
  }

  // 10Y Bond Yield
  if (macro.usBondYield10y <= 3.5) {
    score += 10;
    factors.push({ factor: '10Y Bond Yield', value: `${macro.usBondYield10y}%`, impact: 'bullish', detail: 'Low yields favor equities over bonds' });
  } else if (macro.usBondYield10y <= 4.5) {
    score -= 5;
    factors.push({ factor: '10Y Bond Yield', value: `${macro.usBondYield10y}%`, impact: 'neutral', detail: 'Yields competing with equity risk premium' });
  } else {
    score -= 15;
    factors.push({ factor: '10Y Bond Yield', value: `${macro.usBondYield10y}%`, impact: 'bearish', detail: 'High yields attract capital away from equities' });
  }

  // Dollar Index
  if (macro.dollarIndex <= 100) {
    score += 5;
    factors.push({ factor: 'Dollar Index (DXY)', value: macro.dollarIndex.toFixed(1), impact: 'bullish', detail: 'Weak dollar supports EM flows including India' });
  } else if (macro.dollarIndex <= 106) {
    score += 0;
    factors.push({ factor: 'Dollar Index (DXY)', value: macro.dollarIndex.toFixed(1), impact: 'neutral', detail: 'Dollar in normal range' });
  } else {
    score -= 10;
    factors.push({ factor: 'Dollar Index (DXY)', value: macro.dollarIndex.toFixed(1), impact: 'bearish', detail: 'Strong dollar pressures EM capital flows' });
  }

  const sentiment = score >= 65 ? 'bullish' : score >= 40 ? 'neutral' : 'bearish';

  return { sentiment, score: Math.max(0, Math.min(100, score)), factors };
}

/**
 * Compute sentiment for India macro environment
 */
export function analyzeIndiaMacro(macro) {
  const factors = [];
  let score = 50;

  // RBI Rate
  if (macro.rbiInterestRate <= 5.5) {
    score += 15;
    factors.push({ factor: 'RBI Repo Rate', value: `${macro.rbiInterestRate}%`, impact: 'bullish', detail: 'Low rates support borrowing and capex' });
  } else if (macro.rbiInterestRate <= 6.5) {
    score += 0;
    factors.push({ factor: 'RBI Repo Rate', value: `${macro.rbiInterestRate}%`, impact: 'neutral', detail: 'Rates at neutral — growth supported' });
  } else {
    score -= 10;
    factors.push({ factor: 'RBI Repo Rate', value: `${macro.rbiInterestRate}%`, impact: 'bearish', detail: 'Tight monetary policy slowing credit growth' });
  }

  // India Inflation
  if (macro.indiaInflation <= 4.0) {
    score += 10;
    factors.push({ factor: 'India CPI', value: `${macro.indiaInflation}%`, impact: 'bullish', detail: 'Inflation within RBI comfort zone' });
  } else if (macro.indiaInflation <= 6.0) {
    score += 0;
    factors.push({ factor: 'India CPI', value: `${macro.indiaInflation}%`, impact: 'neutral', detail: 'Inflation above target but within tolerance band' });
  } else {
    score -= 15;
    factors.push({ factor: 'India CPI', value: `${macro.indiaInflation}%`, impact: 'bearish', detail: 'High inflation — RBI likely to tighten' });
  }

  // GDP Growth
  if (macro.indiaGDPGrowth >= 7.0) {
    score += 15;
    factors.push({ factor: 'India GDP Growth', value: `${macro.indiaGDPGrowth}%`, impact: 'bullish', detail: 'Strong GDP growth supports corporate earnings' });
  } else if (macro.indiaGDPGrowth >= 5.0) {
    score += 5;
    factors.push({ factor: 'India GDP Growth', value: `${macro.indiaGDPGrowth}%`, impact: 'neutral', detail: 'Moderate growth — selective opportunities' });
  } else {
    score -= 10;
    factors.push({ factor: 'India GDP Growth', value: `${macro.indiaGDPGrowth}%`, impact: 'bearish', detail: 'Slowing economy — risk of earnings miss' });
  }

  // Crude Oil
  if (macro.crudeOilPrice <= 65) {
    score += 10;
    factors.push({ factor: 'Crude Oil (Brent)', value: `$${macro.crudeOilPrice}`, impact: 'bullish', detail: 'Low oil supports India\'s import bill & margins' });
  } else if (macro.crudeOilPrice <= 85) {
    score += 0;
    factors.push({ factor: 'Crude Oil (Brent)', value: `$${macro.crudeOilPrice}`, impact: 'neutral', detail: 'Oil in manageable range for India' });
  } else {
    score -= 10;
    factors.push({ factor: 'Crude Oil (Brent)', value: `$${macro.crudeOilPrice}`, impact: 'bearish', detail: 'High oil prices widen current account deficit' });
  }

  // USD/INR
  if (macro.usdInr <= 82) {
    score += 5;
    factors.push({ factor: 'USD/INR', value: `₹${macro.usdInr}`, impact: 'bullish', detail: 'Stable rupee supports FII flows' });
  } else if (macro.usdInr <= 85) {
    score += 0;
    factors.push({ factor: 'USD/INR', value: `₹${macro.usdInr}`, impact: 'neutral', detail: 'Rupee in managed range' });
  } else {
    score -= 10;
    factors.push({ factor: 'USD/INR', value: `₹${macro.usdInr}`, impact: 'bearish', detail: 'Depreciating rupee signals capital outflows' });
  }

  const sentiment = score >= 65 ? 'bullish' : score >= 40 ? 'neutral' : 'bearish';

  return { sentiment, score: Math.max(0, Math.min(100, score)), factors };
}

/**
 * Combined macro sentiment
 */
export function analyzeCombinedMacro(macro) {
  const us = analyzeUSMacro(macro);
  const india = analyzeIndiaMacro(macro);

  // Weighted: India 60%, US 40% (since users primarily trade Indian equities)
  const combinedScore = Math.round(india.score * 0.6 + us.score * 0.4);
  const combinedSentiment = combinedScore >= 65 ? 'bullish' : combinedScore >= 40 ? 'neutral' : 'bearish';

  return {
    combined: { sentiment: combinedSentiment, score: combinedScore },
    us,
    india,
  };
}
