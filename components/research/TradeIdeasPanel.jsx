// Trade Ideas Panel component
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';

const getFreshToken = async () => {
  const auth = getAuth();
  if (auth.currentUser) return await auth.currentUser.getIdToken(true);
  return localStorage.getItem('firebase_token');
};

export default function TradeIdeasPanel({ compact = false }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [macroSentiment, setMacroSentiment] = useState(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const token = await getFreshToken();
      const res = await fetch('/api/research/trade-ideas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch trade ideas');
      const data = await res.json();
      setIdeas(data.ideas || []);
      setMacroSentiment(data.macroSentiment);
    } catch (err) {
      console.error('[TradeIdeas] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-black">lightbulb</span>
          Trade Ideas
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-black border-t-transparent"></div>
          <span className="ml-3 text-sm text-slate-500">Generating ideas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Trade Ideas</h3>
        <p className="text-sm text-red-500">{error}</p>
        <button onClick={fetchIdeas} className="mt-2 text-xs text-black font-bold hover:underline">Retry</button>
      </div>
    );
  }

  const displayIdeas = compact ? ideas.slice(0, 5) : ideas;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-black">lightbulb</span>
          Swing Trade Ideas
        </h3>
        {macroSentiment && (
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
            macroSentiment.sentiment === 'bullish' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
            macroSentiment.sentiment === 'bearish' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          }`}>
            Macro: {macroSentiment.sentiment}
          </span>
        )}
      </div>

      {displayIdeas.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No ideas match current criteria</p>
      ) : (
        <div className="space-y-3">
          {displayIdeas.map((idea, i) => (
            <IdeaCard key={idea.symbol} idea={idea} rank={i + 1} />
          ))}
        </div>
      )}

      {compact && ideas.length > 5 && (
        <a href="/research/trade-ideas" className="block text-center text-xs text-black font-bold mt-4 hover:underline">
          View all {ideas.length} ideas →
        </a>
      )}
    </div>
  );
}

function IdeaCard({ idea, rank }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:border-neutral-900/50 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900/10 flex items-center justify-center text-black font-bold text-xs">
            #{rank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">{idea.symbol}</span>
              <span className="text-[10px] text-slate-400">{idea.sector}</span>
            </div>
            <p className="text-[11px] text-slate-500">{idea.companyName}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <span className={`text-sm font-bold ${
              idea.ideaScore >= 70 ? 'text-emerald-600' :
              idea.ideaScore >= 55 ? 'text-amber-600' :
              'text-slate-600'
            }`}>{idea.ideaScore}</span>
            <span className="text-[10px] text-slate-400">/100</span>
          </div>
          <p className="text-[10px] text-slate-400">{idea.suggestedHorizon}</p>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{idea.reason}</p>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <MiniMetric label="PE" value={idea.keyMetrics?.peRatio?.toFixed(1)} />
            <MiniMetric label="Growth" value={`${idea.keyMetrics?.revenueGrowth?.toFixed(1)}%`} />
            <MiniMetric label="ROE" value={`${idea.keyMetrics?.ROE?.toFixed(1)}%`} />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
              idea.institutionalFlow?.includes('accumulation')
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : idea.institutionalFlow?.includes('distribution')
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {idea.institutionalFlow?.replace(/_/g, ' ')}
            </span>
            {idea.macroSupport && (
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-neutral-100 text-neutral-900 dark:bg-neutral-800/30 dark:text-neutral-400">
                Macro Support
              </span>
            )}
          </div>

          <a
            href={`/research/company?symbol=${idea.symbol}`}
            className="block text-xs text-black font-bold mt-2 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View Full Research →
          </a>
        </div>
      )}
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded px-2 py-1.5 text-center">
      <p className="text-[9px] text-slate-400 uppercase">{label}</p>
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{value || '—'}</p>
    </div>
  );
}
