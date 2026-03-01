// FII/DII Flows component
export default function FIIDIIFlows({ company, analysis }) {
  if (!company) return null;

  const flow = analysis?.institutionalFlow;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-black">groups</span>
        Institutional Ownership
      </h3>

      {/* Holdings bars */}
      <div className="space-y-4">
        {/* FII */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">FII Holding</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{company.fiiHolding?.toFixed(1)}%</span>
              <span className={`text-xs font-bold ${company.fiiChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {company.fiiChange >= 0 ? '+' : ''}{company.fiiChange?.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-neutral-1000 transition-all"
              style={{ width: `${Math.min(100, company.fiiHolding)}%` }}
            />
          </div>
        </div>

        {/* DII */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">DII Holding</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{company.diiHolding?.toFixed(1)}%</span>
              <span className={`text-xs font-bold ${company.diiChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {company.diiChange >= 0 ? '+' : ''}{company.diiChange?.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-violet-500 transition-all"
              style={{ width: `${Math.min(100, company.diiHolding)}%` }}
            />
          </div>
        </div>

        {/* Combined */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Institutional</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {((company.fiiHolding || 0) + (company.diiHolding || 0)).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Flow pattern signal */}
      {flow && (
        <div className="mt-6">
          <div className={`p-3 rounded-lg border ${
            flow.signal === 'bullish'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
              : flow.signal === 'bearish'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`material-symbols-outlined text-sm ${
                flow.signal === 'bullish' ? 'text-emerald-600' : flow.signal === 'bearish' ? 'text-red-600' : 'text-slate-500'
              }`}>
                {flow.signal === 'bullish' ? 'trending_up' : flow.signal === 'bearish' ? 'trending_down' : 'trending_flat'}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {flow.pattern?.replace(/_/g, ' ')}
              </span>
            </div>
            {flow.divergence && (
              <p className="text-xs text-slate-600 dark:text-slate-400">{flow.divergence}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
