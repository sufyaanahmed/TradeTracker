// Profitability Metrics component
export default function ProfitabilityMetrics({ company, analysis }) {
  if (!company) return null;

  const profitMetrics = [
    { label: 'Operating Margin', value: company.operatingMargin, suffix: '%', good: 15 },
    { label: 'ROE', value: company.ROE, suffix: '%', good: 15 },
    { label: 'ROCE', value: company.ROCE, suffix: '%', good: 15 },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">account_balance</span>
        Profitability
      </h3>

      <div className="space-y-4">
        {profitMetrics.map((m) => (
          <div key={m.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{m.label}</span>
              <span className={`text-sm font-bold ${m.value >= m.good ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {m.value?.toFixed(1)}{m.suffix}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${m.value >= m.good ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, (m.value / 40) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Growth Trends */}
      {analysis && (
        <div className="mt-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Growth Trends</p>
          <div className="grid grid-cols-3 gap-2">
            <TrendBadge label="Revenue" trend={analysis.growthTrend?.revenue} />
            <TrendBadge label="Profit" trend={analysis.growthTrend?.profit} />
            <TrendBadge label="Margin" trend={analysis.growthTrend?.margin} />
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      {analysis && (
        <div className="mt-6 space-y-3">
          {analysis.strengths?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Strengths</p>
              <ul className="space-y-1">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="text-emerald-500 text-sm">+</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.weaknesses?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Weaknesses</p>
              <ul className="space-y-1">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="text-red-500 text-sm">-</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TrendBadge({ label, trend }) {
  const config = {
    accelerating: { icon: 'trending_up', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30', text: 'Accel' },
    stable: { icon: 'trending_flat', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30', text: 'Stable' },
    decelerating: { icon: 'trending_down', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', text: 'Decel' },
    declining: { icon: 'arrow_downward', color: 'text-red-600 bg-red-100 dark:bg-red-900/30', text: 'Decline' },
    insufficient_data: { icon: 'help', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800', text: 'N/A' },
  };

  const c = config[trend] || config.insufficient_data;

  return (
    <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${c.color}`}>
      <span className="material-symbols-outlined text-xs">{c.icon}</span>
      <div>
        <p className="text-[9px] uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-[10px] font-bold">{c.text}</p>
      </div>
    </div>
  );
}
