import { useState } from 'react';

export default function QuantEvaluator() {
  const [tradeIntent, setTradeIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyzeIntent = async () => {
    if (!tradeIntent.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('firebase_token');
      const response = await fetch('/api/evaluate-trade-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: tradeIntent }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation) => {
    const colors = {
      'STRONG BUY': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      'BUY': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'NEUTRAL': 'bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-400',
      'AVOID': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return colors[recommendation] || colors['NEUTRAL'];
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">auto_awesome</span>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Quant Decision Engine</h2>
      </div>

      {/* Input Section */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Trade Intent (Natural Language)
        </label>
        <textarea
          value={tradeIntent}
          onChange={(e) => setTradeIntent(e.target.value)}
          placeholder="e.g., Buy 20 shares of AAPL at market price"
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-slate-900 dark:text-white placeholder:text-slate-500"
          rows={3}
        />
        <button
          onClick={analyzeIntent}
          disabled={loading || !tradeIntent.trim()}
          className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold text-white transition-colors"
        >
          {loading ? 'Analyzing...' : 'Analyze Trade Intent'}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Parsed Intent */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Parsed Intent</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                result.parsedIntent.action === 'BUY' 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {result.parsedIntent.action}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {result.parsedIntent.quantity} shares of <span className="font-bold text-slate-900 dark:text-white">{result.parsedIntent.symbol}</span>
              {result.parsedIntent.targetPrice && ` at $${result.parsedIntent.targetPrice}`}
            </p>
          </div>

          {/* Recommendation Badge */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Recommendation</span>
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${getRecommendationColor(result.quantScore.recommendation)}`}>
              {result.quantScore.recommendation}
            </span>
          </div>

          {/* Total Score */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-slate-500 dark:text-slate-400">QUANT SCORE</span>
              <span className={getScoreColor(result.quantScore.totalScore)}>
                {result.quantScore.totalScore.toFixed(1)}/100
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${result.quantScore.totalScore}%` }}
              ></div>
            </div>
          </div>

          {/* Factor Breakdown */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Factor Breakdown</h3>
            <ul className="flex flex-col gap-3">
              {Object.entries(result.quantScore.breakdown).map(([factor, data]) => (
                <li key={factor} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-300 capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className={`font-bold ${getScoreColor(data.score)}`}>
                    {data.score.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risk Violations */}
          {result.riskMetrics.riskViolation && (
            <div className="p-4 bg-amber-900/20 border border-amber-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-400 text-lg">warning</span>
                <span className="font-bold text-sm text-amber-400">Risk Warnings</span>
              </div>
              <ul className="space-y-1">
                {result.riskMetrics.violations.map((violation, idx) => (
                  <li key={idx} className="text-xs text-amber-300">{violation}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Insights */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Key Insights</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex gap-3 text-sm">
                <span className="material-symbols-outlined text-primary text-lg">account_balance</span>
                <span>Position Size: {(result.riskMetrics.positionSizePercent || 0).toFixed(1)}% of portfolio</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="material-symbols-outlined text-primary text-lg">pie_chart</span>
                <span>Risk Level: {result.riskMetrics.concentrationRisk || 'UNKNOWN'}</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="material-symbols-outlined text-primary text-lg">analytics</span>
                <span>HHI Index: {result.riskMetrics.hhiAfter || 'N/A'}</span>
              </li>
              {result.portfolioStats && result.portfolioStats.winRate !== undefined && (
                <li className="flex gap-3 text-sm">
                  <span className="material-symbols-outlined text-emerald-400 text-lg">trending_up</span>
                  <span>Portfolio Win Rate: {result.portfolioStats.winRate.toFixed(1)}%</span>
                </li>
              )}
            </ul>
          </div>

          {/* Summary */}
          {result.summary && (
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400 italic">&quot;{result.summary}&quot;</p>
              <p className="text-right text-[10px] text-slate-500 mt-2 uppercase">
                Updated {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
