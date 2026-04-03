import { useState } from 'react';
import { getAuth } from 'firebase/auth';

export default function QuantEvaluator() {
  const [tradeIntent, setTradeIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [news, setNews] = useState(null);
  const [newsLoading, setNewsLoading] = useState(false);

  // Get a fresh Firebase token (auto-refreshes if expired)
  const getFreshToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Not signed in. Please sign in again.');
    return await user.getIdToken(true);
  };

  const analyzeIntent = async () => {
    if (!tradeIntent.trim()) return;
    
    setLoading(true);
    setError(null);
    setNews(null);
    
    try {
      const token = await getFreshToken();
      const response = await fetch('/api/evaluate-trade-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: tradeIntent }),
      });

      if (response.status === 401) {
        throw new Error('Session expired. Please refresh the page and sign in again.');
      }
      if (response.status === 429) {
        const data = await response.json();
        throw new Error(data.error || 'API rate limit reached. Try again later.');
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);

      // Fetch news for the parsed symbol
      if (data.parsedIntent?.symbol) {
        fetchNews(data.parsedIntent.symbol, token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async (symbol, token) => {
    setNewsLoading(true);
    try {
      const response = await fetch(`/api/stock-news?symbol=${encodeURIComponent(symbol)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNews(data.articles || []);
      }
    } catch (err) {
      console.error('News fetch error:', err);
    } finally {
      setNewsLoading(false);
    }
  };

  const getRecommendationColor = (recommendation) => {
    const colors = {
      'STRONG BUY': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      'BUY': 'bg-neutral-100 dark:bg-neutral-800/30 text-neutral-900 dark:text-neutral-400',
      'NEUTRAL': 'bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-400',
      'AVOID': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return colors[recommendation] || colors['NEUTRAL'];
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-black dark:text-neutral-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-black">auto_awesome</span>
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
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-black transition-all resize-none text-slate-900 dark:text-white placeholder:text-slate-500"
          rows={3}
        />
        <button
          onClick={analyzeIntent}
          disabled={loading || !tradeIntent.trim()}
          className="w-full py-3 bg-black hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold text-white transition-colors"
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
                className="h-full bg-black rounded-full transition-all duration-500"
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
                <span className="material-symbols-outlined text-black text-lg">account_balance</span>
                <span>Position Size: {(result.riskMetrics.positionSizePercent || 0).toFixed(1)}% of portfolio</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="material-symbols-outlined text-black text-lg">pie_chart</span>
                <span>Risk Level: {result.riskMetrics.concentrationRisk || 'UNKNOWN'}</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="material-symbols-outlined text-black text-lg">analytics</span>
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

          {/* Stock News */}
          {(newsLoading || (news && news.length > 0)) && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                Latest News — {result.parsedIntent.symbol}
              </h3>
              {newsLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-black rounded-full"></div>
                  Loading news...
                </div>
              ) : (
                <ul className="space-y-3">
                  {news.map((article, idx) => (
                    <li key={idx} className="group">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-black dark:group-hover:text-slate-200 line-clamp-2">
                              {article.title}
                            </p>
                            {article.summary && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{article.summary}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] font-medium text-slate-400 uppercase">{article.source}</span>
                              {article.sentiment && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  article.sentiment === 'Bullish' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                  article.sentiment === 'Bearish' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                  'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                }`}>
                                  {article.sentiment}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">{article.timePublished}</span>
                            </div>
                          </div>
                          {article.bannerImage && (
                            <img 
                              src={article.bannerImage} 
                              alt="" 
                              className="w-16 h-16 rounded object-cover flex-shrink-0"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
