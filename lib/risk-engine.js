// Portfolio Risk Engine
// Computes risk metrics for proposed trades against the existing portfolio
//
// Outputs:
//   sectorExposureAfter  - sector weights after trade
//   positionSizePercent  - % of portfolio this trade represents
//   betaImpact           - how trade shifts portfolio beta
//   concentrationRisk    - Herfindahl-Hirschman Index based
//   riskViolation        - true if max risk rule breached

function safeFloat(val) {
  if (val === null || val === undefined || val === 'None' || val === '-') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

/**
 * Estimate portfolio value from trades (sum of absolute P&L as proxy)
 * In a real system this would use position cost basis * current price
 */
function estimatePortfolioValue(trades) {
  if (!trades || trades.length === 0) return 10000; // Default $10k for new portfolios
  const totalAbsPL = trades.reduce((sum, t) => sum + Math.abs(t.pl || 0), 0);
  // Use a multiplier since P&L is only a fraction of position value
  return Math.max(totalAbsPL * 5, 10000);
}

/**
 * Get sector allocation from existing trades
 */
function getSectorAllocation(trades) {
  const sectors = {};
  const tradesBySymbol = {};

  trades.forEach(t => {
    const sym = (t.name || '').toUpperCase();
    if (!tradesBySymbol[sym]) tradesBySymbol[sym] = [];
    tradesBySymbol[sym].push(t);
  });

  // Without sector data per trade, use symbol as proxy for sector grouping
  Object.entries(tradesBySymbol).forEach(([symbol, symbolTrades]) => {
    const totalPL = symbolTrades.reduce((s, t) => s + Math.abs(t.pl || 0), 0);
    sectors[symbol] = totalPL;
  });

  const totalValue = Object.values(sectors).reduce((s, v) => s + v, 0) || 1;
  const allocation = {};
  Object.entries(sectors).forEach(([sym, val]) => {
    allocation[sym] = parseFloat((val / totalValue * 100).toFixed(2));
  });

  return allocation;
}

/**
 * Herfindahl-Hirschman Index for concentration risk
 * Range: 0 (perfectly diversified) to 10000 (single position)
 * < 1500 = low concentration
 * 1500-2500 = moderate
 * > 2500 = high concentration
 */
function computeHHI(allocation) {
  const weights = Object.values(allocation);
  if (weights.length === 0) return 0;
  return weights.reduce((sum, w) => sum + w * w, 0);
}

/**
 * Main risk computation function
 */
export function computeRiskMetrics(intent, portfolio, quote, overview, config = {}) {
  const {
    maxPositionPct = 20,   // Max single position as % of portfolio
    maxRiskPerTrade = 2,   // Max risk per trade (% of portfolio)
    maxSectorPct = 40      // Max sector exposure
  } = config;

  const symbol = intent.symbol;
  const quantity = intent.quantity || 1;
  const currentPrice = safeFloat(quote?.['05. price']) || 0;
  const tradeValue = currentPrice * quantity;

  const portfolioValue = estimatePortfolioValue(portfolio);
  const newPortfolioValue = portfolioValue + tradeValue;

  // 1. Position size as % of portfolio
  const positionSizePercent = portfolioValue > 0
    ? parseFloat((tradeValue / portfolioValue * 100).toFixed(2))
    : 100;

  // 2. Current sector allocation
  const currentAllocation = getSectorAllocation(portfolio);

  // 3. Allocation after trade
  const allocationAfter = { ...currentAllocation };
  const currentSymbolPct = allocationAfter[symbol] || 0;
  const addedPct = tradeValue / (portfolioValue + tradeValue) * 100;
  allocationAfter[symbol] = parseFloat((currentSymbolPct + addedPct).toFixed(2));

  // Renormalize
  const totalAfter = Object.values(allocationAfter).reduce((s, v) => s + v, 0);
  if (totalAfter > 0 && totalAfter !== 100) {
    Object.keys(allocationAfter).forEach(k => {
      allocationAfter[k] = parseFloat((allocationAfter[k] / totalAfter * 100).toFixed(2));
    });
  }

  // 4. Concentration risk (HHI)
  const hhiBefore = computeHHI(currentAllocation);
  const hhiAfter = computeHHI(allocationAfter);
  let concentrationRisk = 'LOW';
  if (hhiAfter > 2500) concentrationRisk = 'HIGH';
  else if (hhiAfter > 1500) concentrationRisk = 'MODERATE';

  // 5. Beta impact
  const stockBeta = safeFloat(overview?.Beta) || 1.0;
  const existingPositions = Object.keys(currentAllocation).length || 1;
  // Simplified portfolio beta: weighted average
  const currentBeta = 1.0; // Assume market-neutral starting point
  const weightNew = tradeValue / newPortfolioValue;
  const weightExisting = 1 - weightNew;
  const portfolioBetaAfter = parseFloat(
    (currentBeta * weightExisting + stockBeta * weightNew).toFixed(3)
  );

  // 6. Risk violations
  const violations = [];
  if (positionSizePercent > maxPositionPct) {
    violations.push(`Position size (${positionSizePercent}%) exceeds max ${maxPositionPct}%`);
  }
  if ((allocationAfter[symbol] || 0) > maxSectorPct) {
    violations.push(`${symbol} allocation (${allocationAfter[symbol]}%) exceeds max ${maxSectorPct}%`);
  }

  // Estimated risk per trade (using ATR proxy or 2% stop loss)
  const atrProxy = currentPrice * 0.02; // 2% stop loss
  const riskAmount = atrProxy * quantity;
  const riskPct = parseFloat((riskAmount / portfolioValue * 100).toFixed(2));
  if (riskPct > maxRiskPerTrade) {
    violations.push(`Trade risk (${riskPct}%) exceeds max ${maxRiskPerTrade}% per trade`);
  }

  // Kelly criterion (simplified)
  const winRate = portfolio.length > 0
    ? portfolio.filter(t => (t.pl || 0) > 0).length / portfolio.length
    : 0.5;
  const avgWin = portfolio.filter(t => (t.pl || 0) > 0).reduce((s, t) => s + t.pl, 0) /
    Math.max(1, portfolio.filter(t => (t.pl || 0) > 0).length);
  const avgLoss = Math.abs(portfolio.filter(t => (t.pl || 0) < 0).reduce((s, t) => s + t.pl, 0)) /
    Math.max(1, portfolio.filter(t => (t.pl || 0) < 0).length);
  const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : 1;
  const kellyPct = parseFloat(
    Math.max(0, Math.min(25, (winRate - (1 - winRate) / winLossRatio) * 100)).toFixed(2)
  );

  return {
    tradeValue: parseFloat(tradeValue.toFixed(2)),
    currentPrice,
    portfolioValue: parseFloat(portfolioValue.toFixed(2)),
    positionSizePercent,
    sectorExposureBefore: currentAllocation,
    sectorExposureAfter: allocationAfter,
    betaStock: stockBeta,
    betaPortfolioAfter: portfolioBetaAfter,
    concentrationRisk,
    hhiBefore: Math.round(hhiBefore),
    hhiAfter: Math.round(hhiAfter),
    riskPerTradePct: riskPct,
    kellyOptimalPct: kellyPct,
    riskViolation: violations.length > 0,
    violations,
    maxPositionPct,
    maxRiskPerTrade
  };
}
