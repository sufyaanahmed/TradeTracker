// Company Overview section component
export default function CompanyOverview({ company }) {
  if (!company) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">{company.symbol?.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{company.symbol}</h2>
              <p className="text-sm text-slate-500">{company.companyName}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {company.sector}
          </span>
          <p className="text-xs text-slate-400 mt-1">{company.industry}</p>
        </div>
      </div>

      {/* Key Financial Snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <MetricBox label="Revenue" value={formatCr(company.revenue)} subtext={`${company.revenueGrowth > 0 ? '+' : ''}${company.revenueGrowth}% YoY`} positive={company.revenueGrowth > 0} />
        <MetricBox label="Net Profit" value={formatCr(company.netProfit)} subtext={`${company.netProfitGrowth > 0 ? '+' : ''}${company.netProfitGrowth}% YoY`} positive={company.netProfitGrowth > 0} />
        <MetricBox label="Free Cash Flow" value={formatCr(company.freeCashFlow)} />
        <MetricBox label="Debt/Equity" value={company.debtToEquity?.toFixed(2)} subtext={company.debtToEquity < 0.5 ? 'Low debt' : company.debtToEquity < 1.5 ? 'Moderate' : 'High debt'} positive={company.debtToEquity < 1} />
      </div>
    </div>
  );
}

function MetricBox({ label, value, subtext, positive }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{value || '—'}</p>
      {subtext && (
        <p className={`text-xs mt-0.5 font-medium ${positive === true ? 'text-emerald-600' : positive === false ? 'text-red-500' : 'text-slate-400'}`}>
          {subtext}
        </p>
      )}
    </div>
  );
}

function formatCr(value) {
  if (!value && value !== 0) return '—';
  if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L Cr`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K Cr`;
  return `₹${value.toFixed(0)} Cr`;
}
