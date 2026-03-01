import { useRouter } from 'next/router';
import Head from 'next/head';
import { withAuth, useAuth } from '../../lib/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import TradeIdeasPanel from '../../components/research/TradeIdeasPanel';

const MODULES = [
  {
    title: 'Company Research',
    desc: 'Deep-dive into fundamentals, valuation, profitability & institutional flows',
    icon: 'query_stats',
    href: '/research/company',
    color: 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800/30 dark:text-neutral-400',
  },
  {
    title: 'Sector Analysis',
    desc: 'Sector heatmap, rotation phase, strongest & weakest industries',
    icon: 'donut_small',
    href: '/research/sectors',
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  },
  {
    title: 'Macro Economics',
    desc: 'US & India macro sentiment, interest rates, inflation, crude, USD/INR',
    icon: 'public',
    href: '/research/macro',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    title: 'Trade Ideas',
    desc: 'AI-generated swing trade opportunities based on multi-factor analysis',
    icon: 'lightbulb',
    href: '/research/trade-ideas',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    title: 'Legacy Research',
    desc: 'Stock search with AI analysis (original research tool)',
    icon: 'search',
    href: '/research-legacy',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  },
];

function ResearchHub() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try { const auth = getAuth(); await signOut(auth); router.push('/'); } catch (err) { console.error(err); }
  };

  return (
    <>
      <Head>
        <title>Research Hub | Palrin</title>
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Research Hub</h1>
            <p className="text-sm text-slate-500">Macro → Sector → Company → Thesis → Trade</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Module Cards */}
            <div className="flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {MODULES.map((m) => (
                  <a
                    key={m.title}
                    href={m.href}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:border-neutral-900/50 hover:shadow-md transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                      <span className="material-symbols-outlined text-2xl">{m.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{m.title}</h3>
                    <p className="text-sm text-slate-500">{m.desc}</p>
                  </a>
                ))}
              </div>

              {/* Workflow Guide */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-black">route</span>
                  Research-First Workflow
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {['Macro Scan', 'Sector Filter', 'Company Deep Dive', 'Build Thesis', 'Enter Trade', 'Monitor', 'Exit'].map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-neutral-900/10 text-black rounded-lg text-xs font-bold">{step}</span>
                      {i < 6 && <span className="material-symbols-outlined text-slate-300 text-sm">arrow_forward</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Trade Ideas */}
            <aside className="w-full lg:w-80 flex-shrink-0">
              <TradeIdeasPanel compact={false} />
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}

export default withAuth(ResearchHub);
