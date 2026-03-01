// Sector Heatmap component
export default function SectorHeatmap({ sectors, heatmap }) {
  if (!sectors || sectors.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500">
        No sector data available
      </div>
    );
  }

  const sorted = [...sectors].sort((a, b) => b.sectorIndexPerformance - a.sectorIndexPerformance);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-black">grid_view</span>
        Sector Heatmap
      </h3>

      {/* Visual Heatmap Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
        {sorted.map((sector) => {
          const perf = sector.sectorIndexPerformance || 0;
          const bgColor = perf >= 20 ? 'bg-emerald-600' :
            perf >= 10 ? 'bg-emerald-500' :
            perf >= 5 ? 'bg-emerald-400' :
            perf >= 0 ? 'bg-emerald-300 text-emerald-900' :
            perf >= -5 ? 'bg-red-300 text-red-900' :
            perf >= -10 ? 'bg-red-400' :
            'bg-red-600';

          return (
            <a
              key={sector.sectorName}
              href={`/research/sectors/${encodeURIComponent(sector.sectorName)}`}
              className={`${bgColor} text-white rounded-lg p-3 text-center hover:opacity-90 transition-opacity cursor-pointer`}
            >
              <p className="text-xs font-bold truncate">{sector.sectorName}</p>
              <p className="text-lg font-bold mt-1">{perf >= 0 ? '+' : ''}{perf.toFixed(1)}%</p>
              <p className="text-[10px] opacity-80">PE: {sector.avgPE?.toFixed(1)}</p>
            </a>
          );
        })}
      </div>

      {/* Detailed Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Sector</th>
              <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Performance</th>
              <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Avg PE</th>
              <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Avg Growth</th>
              <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Signal</th>
              <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sorted.map((sector) => {
              const signalColors = {
                strong_buy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                buy: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
                neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                underweight: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                avoid: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
              };

              return (
                <tr key={sector.sectorName} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <a href={`/research/sectors/${encodeURIComponent(sector.sectorName)}`} className="font-medium text-sm text-slate-900 dark:text-white hover:text-neutral-900">
                      {sector.sectorName}
                    </a>
                  </td>
                  <td className={`px-4 py-3 text-right text-sm font-bold ${sector.sectorIndexPerformance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {sector.sectorIndexPerformance >= 0 ? '+' : ''}{sector.sectorIndexPerformance?.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-400">{sector.avgPE?.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-400">{sector.avgGrowth?.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${signalColors[sector.signal] || signalColors.neutral}`}>
                      {sector.signal?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-white">{sector.compositeScore}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
