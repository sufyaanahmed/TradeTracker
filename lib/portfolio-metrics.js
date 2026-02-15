// Portfolio Metrics Module
// Computes aggregate portfolio statistics from trade history

/**
 * Core portfolio statistics
 */
export function computePortfolioStats(trades) {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      totalPnL: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      largestWin: 0,
      largestLoss: 0,
      sharpeProxy: 0,
      currentStreak: { type: 'none', count: 0 }
    };
  }

  const totalTrades = trades.length;
  const pnls = trades.map(t => t.pl || 0);
  const totalPnL = pnls.reduce((s, v) => s + v, 0);

  const winners = pnls.filter(p => p > 0);
  const losers = pnls.filter(p => p < 0);

  const winRate = parseFloat((winners.length / totalTrades * 100).toFixed(1));
  const avgWin = winners.length > 0 ? parseFloat((winners.reduce((s, v) => s + v, 0) / winners.length).toFixed(2)) : 0;
  const avgLoss = losers.length > 0 ? parseFloat((losers.reduce((s, v) => s + v, 0) / losers.length).toFixed(2)) : 0;
  const profitFactor = avgLoss !== 0 ? parseFloat(Math.abs(avgWin / avgLoss).toFixed(2)) : 0;
  const largestWin = winners.length > 0 ? Math.max(...winners) : 0;
  const largestLoss = losers.length > 0 ? Math.min(...losers) : 0;

  // Sharpe-like ratio proxy (mean / stddev of returns)
  const meanPL = totalPnL / totalTrades;
  const variance = pnls.reduce((s, v) => s + (v - meanPL) ** 2, 0) / totalTrades;
  const stdDev = Math.sqrt(variance);
  const sharpeProxy = stdDev > 0 ? parseFloat((meanPL / stdDev).toFixed(3)) : 0;

  // Current streak (win/loss)
  let streakType = 'none';
  let streakCount = 0;
  const sortedTrades = [...trades].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (sortedTrades.length > 0) {
    streakType = (sortedTrades[0].pl || 0) >= 0 ? 'win' : 'loss';
    for (const t of sortedTrades) {
      const isWin = (t.pl || 0) >= 0;
      if ((streakType === 'win' && isWin) || (streakType === 'loss' && !isWin)) {
        streakCount++;
      } else break;
    }
  }

  return {
    totalTrades,
    totalPnL: parseFloat(totalPnL.toFixed(2)),
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    largestWin: parseFloat(largestWin.toFixed(2)),
    largestLoss: parseFloat(largestLoss.toFixed(2)),
    sharpeProxy,
    currentStreak: { type: streakType, count: streakCount }
  };
}

/**
 * Group trades by symbol and compute per-symbol stats
 */
export function getHoldingsBreakdown(trades) {
  if (!trades || trades.length === 0) return [];

  const groups = {};
  trades.forEach(t => {
    const sym = (t.name || 'UNKNOWN').toUpperCase();
    if (!groups[sym]) groups[sym] = [];
    groups[sym].push(t);
  });

  return Object.entries(groups).map(([symbol, symbolTrades]) => {
    const totalPL = symbolTrades.reduce((s, t) => s + (t.pl || 0), 0);
    const tradeCount = symbolTrades.length;
    const wins = symbolTrades.filter(t => (t.pl || 0) > 0).length;

    return {
      symbol,
      tradeCount,
      totalPL: parseFloat(totalPL.toFixed(2)),
      winRate: parseFloat((wins / tradeCount * 100).toFixed(1)),
      avgPL: parseFloat((totalPL / tradeCount).toFixed(2)),
      lastTrade: symbolTrades.sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date
    };
  }).sort((a, b) => b.totalPL - a.totalPL);
}

/**
 * Compute monthly performance
 */
export function getMonthlyPerformance(trades) {
  const months = {};
  trades.forEach(t => {
    const month = new Date(t.date).toISOString().slice(0, 7);
    if (!months[month]) months[month] = { pnl: 0, trades: 0, wins: 0 };
    months[month].pnl += (t.pl || 0);
    months[month].trades++;
    if ((t.pl || 0) > 0) months[month].wins++;
  });

  return Object.entries(months)
    .map(([month, data]) => ({
      month,
      pnl: parseFloat(data.pnl.toFixed(2)),
      trades: data.trades,
      winRate: parseFloat((data.wins / data.trades * 100).toFixed(1))
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
