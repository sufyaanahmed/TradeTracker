// Valuation Metrics component
export default function ValuationMetrics({ company, analysis }) {
  if (!company) return null;

  const metrics = [
    {
      label: 'P/E Ratio',
      value: company.peRatio?.toFixed(1),
      benchmark: 'Nifty avg: ~22',
      rating: company.peRatio < 15 ? 'undervalued' : company.peRatio < 25 ? 'fair' : company.peRatio < 40 ? 'premium' : 'expensive',
    },
    {
      label: 'P/B Ratio',
      value: company.pbRatio?.toFixed(1),
      benchmark: 'Below 3 is attractive',
      rating: company.pbRatio < 2 ? 'undervalued' : company.pbRatio < 5 ? 'fair' : 'expensive',
    },
    {
      label: 'EV/EBITDA',
      value: company.evEbitda?.toFixed(1),
      benchmark: 'Below 15 is attractive',
      rating: company.evEbitda ? (company.evEbitda < 12 ? 'undervalued' : company.evEbitda < 20 ? 'fair' : 'expensive') : null,
    },
    {
      label: 'PEG Ratio',
      value: company.pegRatio?.toFixed(2),
      benchmark: 'Below 1 = growth at reasonable price',
      rating: company.pegRatio ? (company.pegRatio < 1 ? 'undervalued' : company.pegRatio < 2 ? 'fair' : 'expensive') : null,
    },
  ];

  const ratingColors = {
    undervalued: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
    fair: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
    premium: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
    expensive: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-black">analytics</span>
        Valuation Metrics
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{m.label}</p>
              {m.rating && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ratingColors[m.rating] || ''}`}>
                  {m.rating}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{m.value || '—'}</p>
            <p className="text-[11px] text-slate-400 mt-1">{m.benchmark}</p>
          </div>
        ))}
      </div>

      {/* Fundamental Score */}
      {analysis && (
        <div className="mt-4 p-4 rounded-lg bg-neutral-900/5 border border-black/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fundamental Score</p>
              <p className="text-3xl font-bold text-black mt-1">{analysis.fundamentalScore}/100</p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
              analysis.sentiment === 'bullish' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
              analysis.sentiment === 'cautiously_bullish' ? 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400' :
              analysis.sentiment === 'bearish' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}>
              {analysis.sentiment?.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
