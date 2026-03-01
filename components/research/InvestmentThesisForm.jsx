// Investment Thesis Form component
// Extends the trade entry with thesis fields
import { useState } from 'react';

const TRADE_TYPES = [
  { value: 'swing', label: 'Swing Trade', desc: '2-8 weeks' },
  { value: 'positional', label: 'Positional', desc: '1-6 months' },
  { value: 'intraday', label: 'Intraday', desc: 'Same day' },
];

const THESIS_CATEGORIES = [
  { value: 'macro_driven', label: 'Macro Driven', icon: 'public' },
  { value: 'sector_momentum', label: 'Sector Momentum', icon: 'donut_small' },
  { value: 'fundamental_growth', label: 'Fundamental Growth', icon: 'trending_up' },
  { value: 'value_investing', label: 'Value Investing', icon: 'savings' },
  { value: 'technical_breakout', label: 'Technical Breakout', icon: 'candlestick_chart' },
  { value: 'mean_reversion', label: 'Mean Reversion', icon: 'swap_vert' },
];

export default function InvestmentThesisForm({ thesis, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const updateField = (field, value) => {
    onChange({ ...thesis, [field]: value });
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-black text-lg">psychology</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Investment Thesis</span>
          <span className="text-[10px] text-slate-400">(Optional)</span>
        </div>
        <span className="material-symbols-outlined text-slate-400 text-lg transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : '' }}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Trade Type */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Trade Type</label>
            <div className="grid grid-cols-3 gap-2">
              {TRADE_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => updateField('tradeType', t.value)}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    thesis?.tradeType === t.value
                      ? 'border-black bg-neutral-900/10 text-black'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-neutral-900/50'
                  }`}
                >
                  <p className="text-xs font-bold">{t.label}</p>
                  <p className="text-[10px] opacity-60">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Thesis Category */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Thesis Category</label>
            <div className="grid grid-cols-2 gap-2">
              {THESIS_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => updateField('thesisCategory', c.value)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors ${
                    thesis?.thesisCategory === c.value
                      ? 'border-black bg-neutral-900/10 text-black'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-neutral-900/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{c.icon}</span>
                  <span className="text-xs font-medium">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Thesis Description */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Thesis Description</label>
            <textarea
              value={thesis?.thesisDescription || ''}
              onChange={(e) => updateField('thesisDescription', e.target.value)}
              placeholder="Why are you taking this trade? What's your conviction?"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-black resize-none h-20 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Reason Fields */}
          <div className="grid grid-cols-1 gap-3">
            <ThesisInput
              label="Macro Reason"
              value={thesis?.macroReason || ''}
              onChange={(v) => updateField('macroReason', v)}
              placeholder="How do macro conditions support this trade?"
            />
            <ThesisInput
              label="Sector Reason"
              value={thesis?.sectorReason || ''}
              onChange={(v) => updateField('sectorReason', v)}
              placeholder="What sector dynamics favor this trade?"
            />
            <ThesisInput
              label="Fundamental Reason"
              value={thesis?.fundamentalReason || ''}
              onChange={(v) => updateField('fundamentalReason', v)}
              placeholder="What fundamental factors support the thesis?"
            />
          </div>

          {/* Risk & Catalyst */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ThesisInput
              label="Risk Factors"
              value={thesis?.riskFactors || ''}
              onChange={(v) => updateField('riskFactors', v)}
              placeholder="What could go wrong?"
            />
            <ThesisInput
              label="Expected Catalyst"
              value={thesis?.expectedCatalyst || ''}
              onChange={(v) => updateField('expectedCatalyst', v)}
              placeholder="What event will trigger the move?"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ThesisInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-black text-slate-900 dark:text-white placeholder:text-slate-400"
      />
    </div>
  );
}

/**
 * Display component for viewing thesis on trade detail
 */
export function ThesisDisplay({ thesis }) {
  if (!thesis) return null;

  const categoryLabels = {
    macro_driven: 'Macro Driven',
    sector_momentum: 'Sector Momentum',
    fundamental_growth: 'Fundamental Growth',
    value_investing: 'Value Investing',
    technical_breakout: 'Technical Breakout',
    mean_reversion: 'Mean Reversion',
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mt-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
        <span className="material-symbols-outlined text-sm text-black">psychology</span>
        Investment Thesis
      </p>

      <div className="flex items-center gap-2 mb-2">
        {thesis.tradeType && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900/10 text-black uppercase">
            {thesis.tradeType}
          </span>
        )}
        {thesis.thesisCategory && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {categoryLabels[thesis.thesisCategory] || thesis.thesisCategory}
          </span>
        )}
      </div>

      {thesis.thesisDescription && (
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{thesis.thesisDescription}</p>
      )}

      <div className="space-y-1">
        {thesis.macroReason && <ThesisLine label="Macro" value={thesis.macroReason} />}
        {thesis.sectorReason && <ThesisLine label="Sector" value={thesis.sectorReason} />}
        {thesis.fundamentalReason && <ThesisLine label="Fundamental" value={thesis.fundamentalReason} />}
        {thesis.riskFactors && <ThesisLine label="Risks" value={thesis.riskFactors} color="text-red-500" />}
        {thesis.expectedCatalyst && <ThesisLine label="Catalyst" value={thesis.expectedCatalyst} color="text-neutral-700" />}
      </div>
    </div>
  );
}

function ThesisLine({ label, value, color = 'text-slate-500' }) {
  return (
    <div className="flex gap-2">
      <span className={`text-[10px] font-bold uppercase w-20 flex-shrink-0 ${color}`}>{label}</span>
      <span className="text-[11px] text-slate-600 dark:text-slate-400">{value}</span>
    </div>
  );
}
