// Macro Indicators component
export default function MacroIndicators({ data, analysis }) {
  if (!data || !analysis) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500">
        Loading macro data...
      </div>
    );
  }

  const sentimentColors = {
    bullish: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    neutral: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    bearish: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  const sentimentIcons = {
    bullish: 'trending_up',
    neutral: 'trending_flat',
    bearish: 'trending_down',
  };

  return (
    <div className="space-y-6">
      {/* Combined Sentiment */}
      <div className={`p-6 rounded-xl border-2 ${sentimentColors[analysis.combined?.sentiment] || sentimentColors.neutral}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Overall Macro Sentiment</p>
            <p className="text-3xl font-bold mt-1">{analysis.combined?.sentiment?.toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-4xl">{sentimentIcons[analysis.combined?.sentiment]}</span>
            <span className="text-4xl font-bold">{analysis.combined?.score}/100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* US Macro */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-xl">🇺🇸</span>
              US Macro
            </h3>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${sentimentColors[analysis.us?.sentiment]}`}>
              {analysis.us?.sentiment?.toUpperCase()} ({analysis.us?.score})
            </span>
          </div>

          <div className="space-y-3">
            {analysis.us?.factors?.map((factor, i) => (
              <FactorRow key={i} factor={factor} />
            ))}
          </div>
        </div>

        {/* India Macro */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-xl">🇮🇳</span>
              India Macro
            </h3>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${sentimentColors[analysis.india?.sentiment]}`}>
              {analysis.india?.sentiment?.toUpperCase()} ({analysis.india?.score})
            </span>
          </div>

          <div className="space-y-3">
            {analysis.india?.factors?.map((factor, i) => (
              <FactorRow key={i} factor={factor} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FactorRow({ factor }) {
  const impactColors = {
    bullish: 'text-emerald-600 dark:text-emerald-400',
    neutral: 'text-amber-600 dark:text-amber-400',
    bearish: 'text-red-600 dark:text-red-400',
  };

  const impactIcons = {
    bullish: 'arrow_upward',
    neutral: 'remove',
    bearish: 'arrow_downward',
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <span className={`material-symbols-outlined text-lg mt-0.5 ${impactColors[factor.impact]}`}>
        {impactIcons[factor.impact]}
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 dark:text-white">{factor.factor}</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{factor.value}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{factor.detail}</p>
      </div>
    </div>
  );
}
