import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { withAuth, useAuth } from '../../lib/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import dynamic from 'next/dynamic';

// Dynamic imports for chart components
const RevenueGrowthChart = dynamic(() => import('../../components/research/ResearchCharts').then(m => ({ default: m.RevenueGrowthChart })), { ssr: false });
const ProfitGrowthChart = dynamic(() => import('../../components/research/ResearchCharts').then(m => ({ default: m.ProfitGrowthChart })), { ssr: false });
const MarginTrendChart = dynamic(() => import('../../components/research/ResearchCharts').then(m => ({ default: m.MarginTrendChart })), { ssr: false });
const FIIDIIChart = dynamic(() => import('../../components/research/ResearchCharts').then(m => ({ default: m.FIIDIIChart })), { ssr: false });

import CompanyOverview from '../../components/research/CompanyOverview';
import ValuationMetrics from '../../components/research/ValuationMetrics';
import ProfitabilityMetrics from '../../components/research/ProfitabilityMetrics';
import FIIDIIFlows from '../../components/research/FIIDIIFlows';

const QUICK_SYMBOLS = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'WIPRO', 'TATAMOTORS', 'SUNPHARMA'];

function CompanyResearch() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchSymbol, setSearchSymbol] = useState('');
  const [company, setCompany] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('firebase_token');

  useEffect(() => {
    const { symbol } = router.query;
    if (symbol) {
      setSearchSymbol(symbol);
      fetchCompany(symbol);
    }
  }, [router.query]);

  const fetchCompany = async (symbol) => {
    if (!symbol?.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setCompany(null);
      setAnalysis(null);

      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch data & analysis in parallel
      const [dataRes, analysisRes] = await Promise.all([
        fetch(`/api/research/company/${symbol.toUpperCase()}`, { headers }),
        fetch(`/api/research/company/${symbol.toUpperCase()}/analysis`, { headers }),
      ]);

      if (!dataRes.ok) throw new Error('Failed to fetch company data');
      const dataJson = await dataRes.json();
      setCompany(dataJson.company);

      if (analysisRes.ok) {
        const analysisJson = await analysisRes.json();
        setAnalysis(analysisJson.analysis);
      }
    } catch (err) {
      console.error('[CompanyResearch] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchSymbol.trim()) {
      router.push(`/research/company?symbol=${searchSymbol.toUpperCase()}`, undefined, { shallow: true });
      fetchCompany(searchSymbol);
    }
  };

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Build chart data from analysis
  const revenueChartData = analysis?.historicalData?.revenueHistory?.map(h => ({ period: h.period, value: h.revenue })) || [];
  const profitChartData = analysis?.historicalData?.profitHistory?.map(h => ({ period: h.period, value: h.netProfit })) || [];
  const marginChartData = analysis?.historicalData?.marginHistory?.map(h => ({ period: h.period, value: h.operatingMargin })) || [];

  return (
    <>
      <Head>
        <title>Company Research | Palrin</title>
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
              <a className="text-primary text-sm font-semibold border-b-2 border-primary pb-4 mt-4" href="/research/company">Company</a>
              <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" href="/research/sectors">Sectors</a>
              <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" href="/research/macro">Macro</a>
              <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" href="/research">Legacy Research</a>
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
          {/* Search section */}
          <section className="mb-8">
            <h1 className="text-2xl font-bold mb-4">Company Fundamental Research</h1>

            <form onSubmit={handleSearch} className="relative max-w-xl group mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
                placeholder="Enter stock symbol (e.g., RELIANCE, TCS, INFY)..."
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
              />
            </form>

            {/* Quick access chips */}
            <div className="flex flex-wrap gap-2">
              {QUICK_SYMBOLS.map((sym) => (
                <button
                  key={sym}
                  onClick={() => { setSearchSymbol(sym); fetchCompany(sym); router.push(`/research/company?symbol=${sym}`, undefined, { shallow: true }); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    searchSymbol === sym ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </section>

          {/* Loading */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-slate-500">Analyzing {searchSymbol}...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <span className="material-symbols-outlined text-red-500 text-4xl mb-2">error</span>
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Results */}
          {company && !loading && (
            <div className="space-y-6">
              {/* Overview */}
              <CompanyOverview company={company} />

              {/* Valuation + Profitability row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ValuationMetrics company={company} analysis={analysis} />
                <ProfitabilityMetrics company={company} analysis={analysis} />
              </div>

              {/* FII/DII Flows */}
              <FIIDIIFlows company={company} analysis={analysis} />

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Revenue Trend</h3>
                  <RevenueGrowthChart data={revenueChartData} />
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Net Profit Trend</h3>
                  <ProfitGrowthChart data={profitChartData} />
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Operating Margin Trend</h3>
                  <MarginTrendChart data={marginChartData} />
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Ownership Breakdown</h3>
                  <FIIDIIChart company={company} />
                </div>
              </div>

              {/* Catalysts */}
              {analysis?.catalysts?.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">bolt</span>
                    Upcoming Catalysts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.catalysts.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <span className="material-symbols-outlined text-amber-500 text-sm">schedule</span>
                        <span className="text-xs text-amber-800 dark:text-amber-300">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!company && !loading && !error && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">query_stats</span>
              <p className="text-slate-500 text-lg">Search for a stock symbol to view fundamental research</p>
              <p className="text-slate-400 text-sm mt-1">Revenue, valuation, profitability, institutional flows & more</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default withAuth(CompanyResearch);
