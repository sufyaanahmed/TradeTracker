import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { withAuth, useAuth } from '../../lib/AuthContext';
import { getAuth, signOut } from 'firebase/auth';

function TradeIdeas() {
  const router = useRouter();
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [macroSentiment, setMacroSentiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('firebase_token');

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/research/trade-ideas', {
        headers: { Authorization: `Bearer ${getToken()}` },
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

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      router.push('/');
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <Head>
        <title>Trade Ideas | Palrin</title>
      </Head>

      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
        {/* Top Nav */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-black">
              <span className="material-symbols-outlined text-3xl font-bold">rocket_launch</span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Palrin</h2>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-neutral-900 transition-colors" href="/dashboard">Dashboard</a>
              <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-neutral-900 transition-colors" href="/research/company">Company</a>
              <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-neutral-900 transition-colors" href="/research/sectors">Sectors</a>
              <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-neutral-900 transition-colors" href="/research/macro">Macro</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{user?.uname || 'User'}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Palrin</p>
            </div>
            <button onClick={handleSignOut} className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-lg text-slate-600 dark:text-slate-400">logout</span>
            </button>
          </div>
        </header>

        <main className="p-6 lg:px-12 max-w-[1400px] mx-auto w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Swing Trade Ideas</h1>
              <p className="text-sm text-slate-500">AI-generated opportunities based on multi-factor analysis</p>
            </div>
            {macroSentiment && (
              <div className={`px-4 py-2 rounded-lg ${
                macroSentiment.sentiment === 'bullish' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                macroSentiment.sentiment === 'bearish' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                <p className="text-xs font-bold uppercase">Macro Sentiment</p>
                <p className="text-lg font-bold">{macroSentiment.sentiment} ({macroSentiment.score}/100)</p>
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <p className="mt-4 text-slate-500">Generating trade ideas...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {ideas.length === 0 ? (
                <div className="text-center py-20">
                  <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">lightbulb_outline</span>
                  <p className="text-slate-500 text-lg">No trade ideas match current criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {ideas.map((idea, i) => (
                    <IdeaCard key={idea.symbol} idea={idea} rank={i + 1} />
                  ))}
                </div>
              )}

              {/* Methodology */}
              <div className="mt-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-black">psychology</span>
                  Scoring Methodology
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MethodCard title="Fundamental (35%)" items={['PE ratio, growth rates', 'ROE, ROCE profitability', 'Debt levels, free cash flow']} />
                  <MethodCard title="Sector Strength (25%)" items={['Sector performance', 'Market rotation phase', 'Industry momentum']} />
                  <MethodCard title="Macro Environment (20%)" items={['US + India sentiment', 'Interest rates, inflation', 'Currency, commodity prices']} />
                  <MethodCard title="Institutional Flow (20%)" items={['FII/DII accumulation', 'Ownership trends', 'Divergence signals']} />
                </div>
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">info</span>
                    <span>Ideas are filtered to avoid concentration: max 1 idea per stock, max 3 per sector</span>
                  </p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

function IdeaCard({ idea, rank }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:border-neutral-900/50 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900/10 flex items-center justify-center text-black font-bold">
            #{rank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{idea.symbol}</h3>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {idea.sector}
              </span>
            </div>
            <p className="text-xs text-slate-500">{idea.companyName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Score</p>
          <p className={`text-2xl font-bold ${
            idea.ideaScore >= 70 ? 'text-emerald-600' :
            idea.ideaScore >= 55 ? 'text-amber-600' :
            'text-slate-600'
          }`}>{idea.ideaScore}</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{idea.reason}</p>

      {/* Score breakdown */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <ScoreBar label="Fundamental" value={idea.fundamentalScore} />
        <ScoreBar label="Sector" value={idea.sectorStrength} />
        <ScoreBar label="Macro" value={idea.macroSupport ? 75 : 50} />
        <ScoreBar label="Inst. Flow" value={idea.institutionalFlow?.includes('accumulation') ? 80 : 50} />
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <MetricBox label="PE" value={idea.keyMetrics?.peRatio?.toFixed(1)} />
        <MetricBox label="Growth" value={`${idea.keyMetrics?.revenueGrowth?.toFixed(1)}%`} />
        <MetricBox label="ROE" value={`${idea.keyMetrics?.ROE?.toFixed(1)}%`} />
        <MetricBox label="D/E" value={idea.keyMetrics?.debtToEquity?.toFixed(2)} />
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2 py-1 rounded text-xs font-bold bg-neutral-900/10 text-black">{idea.tradeType}</span>
        <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {idea.suggestedHorizon}
        </span>
        {idea.macroSupport && (
          <span className="px-2 py-1 rounded text-xs font-bold bg-neutral-100 dark:bg-neutral-800/30 text-neutral-900 dark:text-neutral-400">
            Macro ✓
          </span>
        )}
      </div>

      <a
        href={`/research/company?symbol=${idea.symbol}`}
        className="block w-full text-center py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-lg transition-colors"
      >
        View Full Research →
      </a>
    </div>
  );
}

function ScoreBar({ label, value }) {
  const color = value >= 70 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-slate-500 uppercase font-bold">{label}</span>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{value}</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MetricBox({ label, value }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2 text-center">
      <p className="text-[9px] text-slate-400 uppercase">{label}</p>
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{value || '—'}</p>
    </div>
  );
}

function MethodCard({ title, items }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
            <span className="text-black mt-0.5">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default withAuth(TradeIdeas);
