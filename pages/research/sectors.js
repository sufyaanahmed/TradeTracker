import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { withAuth, useAuth } from '../../lib/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import SectorHeatmap from '../../components/research/SectorHeatmap';

function SectorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [sectors, setSectors] = useState([]);
  const [rotation, setRotation] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = async () => {
    const auth = getAuth();
    if (auth.currentUser) return await auth.currentUser.getIdToken(true);
    return localStorage.getItem('firebase_token');
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch('/api/research/sectors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch sectors');
      const data = await res.json();
      setSectors(data.rankedSectors || []);
      setRotation(data.rotation || null);
      setHeatmap(data.heatmap || []);
    } catch (err) {
      console.error('[SectorDashboard] Error:', err);
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

  const rotationPhaseConfig = {
    early_expansion: { icon: 'trending_up', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', desc: 'Economy expanding, broad participation' },
    mid_expansion: { icon: 'speed', color: 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800/30 dark:text-neutral-400', desc: 'Selective growth, leadership emerging' },
    late_expansion: { icon: 'warning', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', desc: 'Narrowing leadership, defensive tilt' },
    contraction: { icon: 'trending_down', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', desc: 'Broad weakness, risk-off environment' },
  };

  return (
    <>
      <Head>
        <title>Sector Analysis | Palrin</title>
      </Head>

      <div className="relative flex min-h-screen w-full flex-col bg-neutral-50 dark:bg-neutral-950 font-display text-neutral-950 dark:text-white">
        {/* Top Nav */}
        <header className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <img src="/Palrin.png" alt="Palrin" width="28" height="28" className="rounded" />
              <h2 className="text-xl font-semibold tracking-tight text-neutral-950 dark:text-white">Palrin</h2>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a className="text-neutral-600 dark:text-neutral-400 text-sm font-medium hover:text-neutral-900 transition-colors" href="/dashboard">Dashboard</a>
              <a className="text-neutral-600 dark:text-neutral-400 text-sm font-medium hover:text-neutral-900 transition-colors" href="/research/company">Company</a>
              <a className="text-black text-sm font-medium border-b-2 border-black pb-4 mt-4" href="/research/sectors">Sectors</a>
              <a className="text-neutral-600 dark:text-neutral-400 text-sm font-medium hover:text-neutral-900 transition-colors" href="/research/macro">Macro</a>
              <a className="text-neutral-600 dark:text-neutral-400 text-sm font-medium hover:text-neutral-900 transition-colors" href="/research">Research Hub</a>
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
          <h1 className="text-2xl font-bold mb-6">Sector & Industry Analysis</h1>

          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <p className="mt-4 text-slate-500">Loading sector data...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              {/* Sector Rotation Phase */}
              {rotation && (
                <div className={`p-6 rounded-xl border-2 ${rotationPhaseConfig[rotation.phase]?.color || 'bg-slate-100 text-slate-700'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-3xl">{rotationPhaseConfig[rotation.phase]?.icon || 'help'}</span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider opacity-70">Market Cycle Phase</p>
                      <p className="text-xl font-bold">{rotation.phase?.replace(/_/g, ' ').toUpperCase()}</p>
                    </div>
                  </div>
                  <p className="text-sm opacity-80 mt-1">{rotation.description || rotationPhaseConfig[rotation.phase]?.desc}</p>
                </div>
              )}

              {/* Top & Bottom Sectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strongest */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">trending_up</span>
                    Strongest Sectors
                  </h3>
                  <div className="space-y-3">
                    {sectors.slice(0, 3).map((s, i) => (
                      <a key={s.sectorName} href={`/research/sectors/${encodeURIComponent(s.sectorName)}`} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-emerald-600">#{i + 1}</span>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{s.sectorName}</p>
                            <p className="text-[10px] text-slate-400">Score: {s.compositeScore}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">+{s.sectorIndexPerformance?.toFixed(1)}%</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Weakest */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-lg">trending_down</span>
                    Weakest Sectors
                  </h3>
                  <div className="space-y-3">
                    {sectors.slice(-3).reverse().map((s, i) => (
                      <a key={s.sectorName} href={`/research/sectors/${encodeURIComponent(s.sectorName)}`} className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-red-500">#{sectors.length - i}</span>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{s.sectorName}</p>
                            <p className="text-[10px] text-slate-400">Score: {s.compositeScore}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-red-500">{s.sectorIndexPerformance?.toFixed(1)}%</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Sector Heatmap */}
              <SectorHeatmap sectors={sectors} heatmap={heatmap} />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default withAuth(SectorDashboard);
