import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { withAuth, useAuth } from '../../../lib/AuthContext';
import { getAuth, signOut } from 'firebase/auth';

function SectorDetail() {
  const router = useRouter();
  const { user } = useAuth();
  const { sector: sectorSlug } = router.query;
  const [sectorData, setSectorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('firebase_token');

  useEffect(() => {
    if (sectorSlug) fetchSector(sectorSlug);
  }, [sectorSlug]);

  const fetchSector = async (name) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/research/sectors/${encodeURIComponent(name)}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Sector not found');
      const data = await res.json();
      setSectorData(data.sector);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try { const auth = getAuth(); await signOut(auth); router.push('/'); } catch (err) { console.error(err); }
  };

  return (
    <>
      <Head>
        <title>{sectorData?.sectorName || 'Sector'} | Palrin</title>
      </Head>

      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
        {/* Top Nav */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-3xl font-bold">rocket_launch</span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Palrin</h2>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" href="/dashboard">Dashboard</a>
              <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" href="/research/company">Company</a>
              <a className="text-primary text-sm font-semibold border-b-2 border-primary pb-4 mt-4" href="/research/sectors">Sectors</a>
              <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" href="/research/macro">Macro</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleSignOut} className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-lg text-slate-600 dark:text-slate-400">logout</span>
            </button>
          </div>
        </header>

        <main className="p-6 lg:px-12 max-w-[1400px] mx-auto w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <a href="/research/sectors" className="hover:text-primary transition-colors">Sectors</a>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">{sectorData?.sectorName || sectorSlug}</span>
          </div>

          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <p className="text-red-700 dark:text-red-400">{error}</p>
              <a href="/research/sectors" className="text-primary text-sm font-bold mt-2 inline-block hover:underline">← Back to Sectors</a>
            </div>
          )}

          {sectorData && !loading && (
            <div className="space-y-6">
              {/* Sector Header */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{sectorData.sectorName}</h1>
                  <span className={`px-4 py-2 rounded-lg text-lg font-bold ${
                    sectorData.sectorIndexPerformance >= 10 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    sectorData.sectorIndexPerformance >= 0 ? 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {sectorData.sectorIndexPerformance >= 0 ? '+' : ''}{sectorData.sectorIndexPerformance?.toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatBox label="Avg PE" value={sectorData.avgPE?.toFixed(1)} />
                  <StatBox label="Avg Growth" value={`${sectorData.avgGrowth?.toFixed(1)}%`} />
                  <StatBox label="Market Cap Weight" value={sectorData.marketCapWeight ? `${sectorData.marketCapWeight}%` : '—'} />
                  <StatBox label="Stocks Tracked" value={(sectorData.topPerformingStocks?.length || 0) + (sectorData.worstPerformingStocks?.length || 0)} />
                </div>
              </div>

              {/* Top & Worst Performers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">trending_up</span>
                    Top Performers
                  </h3>
                  <div className="space-y-3">
                    {(sectorData.topPerformingStocks || []).map((stock) => (
                      <a key={stock.symbol} href={`/research/company?symbol=${stock.symbol}`} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors">
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{stock.symbol}</p>
                          <p className="text-[10px] text-slate-400">{stock.companyName || stock.symbol}</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">+{stock.performance?.toFixed(1)}%</span>
                      </a>
                    ))}
                    {(!sectorData.topPerformingStocks || sectorData.topPerformingStocks.length === 0) && (
                      <p className="text-sm text-slate-400 text-center py-4">No data available</p>
                    )}
                  </div>
                </div>

                {/* Worst */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">trending_down</span>
                    Worst Performers
                  </h3>
                  <div className="space-y-3">
                    {(sectorData.worstPerformingStocks || []).map((stock) => (
                      <a key={stock.symbol} href={`/research/company?symbol=${stock.symbol}`} className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{stock.symbol}</p>
                          <p className="text-[10px] text-slate-400">{stock.companyName || stock.symbol}</p>
                        </div>
                        <span className="text-sm font-bold text-red-500">{stock.performance?.toFixed(1)}%</span>
                      </a>
                    ))}
                    {(!sectorData.worstPerformingStocks || sectorData.worstPerformingStocks.length === 0) && (
                      <p className="text-sm text-slate-400 text-center py-4">No data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{value || '—'}</p>
    </div>
  );
}

export default withAuth(SectorDetail);
