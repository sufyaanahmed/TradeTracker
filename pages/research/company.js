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
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingComprehensive, setLoadingComprehensive] = useState(false);
  const [error, setError] = useState(null);

  const getToken = async () => {
    const auth = getAuth();
    if (auth.currentUser) return await auth.currentUser.getIdToken(true);
    return localStorage.getItem('firebase_token');
  };

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
      setComprehensiveAnalysis(null);

      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch data & analysis in parallel
      const [dataRes, analysisRes] = await Promise.all([
        fetch(`/api/research/company/${symbol.toUpperCase()}`, { headers }),
        fetch(`/api/research/company/${symbol.toUpperCase()}/analysis`, { headers }),
      ]);

      if (!dataRes.ok) throw new Error('Failed to fetch company data');
      const company = await dataRes.json();
      setCompany(company);

      if (analysisRes.ok) {
        const analysisJson = await analysisRes.json();
        setAnalysis(analysisJson.analysis);
      }

      // Fetch comprehensive analysis (with AI)
      fetchComprehensiveAnalysis(symbol);
    } catch (err) {
      console.error('[CompanyResearch] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComprehensiveAnalysis = async (symbol) => {
    try {
      setLoadingComprehensive(true);
      const token = await getToken();
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch('/api/research/comprehensive-analysis', {
        method: 'POST',
        headers,
        body: JSON.stringify({ symbol: symbol.toUpperCase() })
      });

      if (response.ok) {
        const data = await response.json();
        setComprehensiveAnalysis(data);
      }
    } catch (err) {
      console.error('[Comprehensive Analysis] Error:', err);
      // Don't show error - this is enhancement feature
    } finally {
      setLoadingComprehensive(false);
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
              <a className="text-black text-sm font-medium border-b-2 border-black pb-4 mt-4" href="/research/company">Company</a>
              <a className="text-neutral-600 dark:text-neutral-400 text-sm font-medium hover:text-neutral-900 transition-colors" href="/research/sectors">Sectors</a>
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
          {/* Search section */}
          <section className="mb-8">
            <h1 className="text-2xl font-bold mb-4">Company Fundamental Research</h1>

            <form onSubmit={handleSearch} className="relative max-w-xl group mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-neutral-400 text-xl">🔍</span>
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 transition-all placeholder:text-neutral-400 text-neutral-900 dark:text-white"
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
                    searchSymbol === sym ? 'bg-black text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-600'
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
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <p className="mt-4 text-neutral-500">Analyzing {searchSymbol}...</p>
            </div>
          )}

          {/* Comprehensive Analysis Card */}
          {company && comprehensiveAnalysis && !loading && (
            <div className="bg-gradient-to-br from-neutral-100 to-white dark:from-blue-950/20 dark:to-neutral-900 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 p-6 mb-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-950 dark:text-white mb-1">
                    {comprehensiveAnalysis.companyName}
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {comprehensiveAnalysis.sector} • ₹{comprehensiveAnalysis.currentPrice?.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-4xl font-bold text-black">
                      {comprehensiveAnalysis.analysis.rating.score}
                    </span>
                    <span className="text-sm text-neutral-500">/10</span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    comprehensiveAnalysis.analysis.rating.score >= 7 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : comprehensiveAnalysis.analysis.rating.score >= 5
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {comprehensiveAnalysis.analysis.rating.label}
                  </span>
                </div>
              </div>

              {/* AI Summary */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>🤖</span> AI-Powered Analysis
                </h3>
                <div className="prose max-w-none text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed whitespace-pre-line bg-white/50 dark:bg-neutral-800/30 rounded-lg p-4">
                  {comprehensiveAnalysis.analysis.summary}
                </div>
              </div>

              {/* Signal Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500 mb-1">Valuation</p>
                  <p className="text-lg font-bold text-neutral-950 dark:text-white">
                    {comprehensiveAnalysis.analysis.rating.components.valuation}
                    <span className="text-xs text-neutral-400">/10</span>
                  </p>
                  <p className="text-xs font-semibold text-black mt-1">
                    {comprehensiveAnalysis.analysis.signals.valuation.signal}
                  </p>
                </div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500 mb-1">Technical</p>
                  <p className="text-lg font-bold text-neutral-950 dark:text-white">
                    {comprehensiveAnalysis.analysis.rating.components.technical}
                    <span className="text-xs text-neutral-400">/10</span>
                  </p>
                  <p className="text-xs font-semibold text-black mt-1">
                    {comprehensiveAnalysis.analysis.signals.technical.signal}
                  </p>
                </div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500 mb-1">Macro</p>
                  <p className="text-lg font-bold text-neutral-950 dark:text-white">
                    {comprehensiveAnalysis.analysis.rating.components.macro}
                    <span className="text-xs text-neutral-400">/10</span>
                  </p>
                  <p className="text-xs font-semibold text-black mt-1">
                    {comprehensiveAnalysis.analysis.signals.macro.signal}
                  </p>
                </div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500 mb-1">Portfolio Fit</p>
                  <p className="text-lg font-bold text-neutral-950 dark:text-white">
                    {comprehensiveAnalysis.analysis.rating.components.portfolioFit}
                    <span className="text-xs text-neutral-400">/10</span>
                  </p>
                  <p className="text-xs font-semibold text-black mt-1">
                    {comprehensiveAnalysis.analysis.signals.portfolioFit.signal}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              {comprehensiveAnalysis.analysis.recommendations?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-3">
                    Recommendations
                  </h3>
                  <div className="space-y-2">
                    {comprehensiveAnalysis.analysis.recommendations.map((rec, i) => (
                      <div key={i} className={`flex gap-3 p-3 rounded-lg border ${
                        rec.priority === 'HIGH' 
                          ? 'bg-neutral-100 dark:bg-neutral-900/20 border-neutral-200 dark:border-neutral-800'
                          : rec.priority === 'MEDIUM'
                          ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900'
                          : 'bg-neutral-50 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-700'
                      }`}>
                        <span className="text-lg">{
                          rec.priority === 'HIGH' ? '⚡' :
                          rec.priority === 'MEDIUM' ? '💡' : 'ℹ️'
                        }</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-neutral-950 dark:text-white">
                            {rec.action}
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                            {rec.rationale}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Context */}
              {comprehensiveAnalysis.analysis.portfolio?.hasPortfolio && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                    <span>Current Sector Exposure: {comprehensiveAnalysis.analysis.portfolio.currentSectorExposure}%</span>
                    <span>Portfolio Value: ₹{comprehensiveAnalysis.analysis.portfolio.totalValue}</span>
                    <span>Positions: {comprehensiveAnalysis.analysis.portfolio.existingPositions}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comprehensive Analysis Loading */}
          {company && loadingComprehensive && !comprehensiveAnalysis && (
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-8 mb-6 text-center">
              <div className="inline-block animate-pulse">
                <span className="text-3xl">🤖</span>
              </div>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                Generating comprehensive analysis with AI...
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Analyzing fundamentals, macro factors, and portfolio fit
              </p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <span className="text-4xl mb-2 block">⚠️</span>
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
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                  <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Revenue Trend</h3>
                  <RevenueGrowthChart data={revenueChartData} />
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                  <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Net Profit Trend</h3>
                  <ProfitGrowthChart data={profitChartData} />
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                  <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Operating Margin Trend</h3>
                  <MarginTrendChart data={marginChartData} />
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                  <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Ownership Breakdown</h3>
                  <FIIDIIChart company={company} />
                </div>
              </div>

              {/* Catalysts */}
              {analysis?.catalysts?.length > 0 && (
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>⚡</span>
                    Upcoming Catalysts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.catalysts.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <span className="text-sm">📅</span>
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
              <span className="text-6xl mb-4 block">📊</span>
              <p className="text-neutral-500 text-lg">Search for a stock symbol to view comprehensive analysis</p>
              <p className="text-neutral-400 text-sm mt-1">AI-powered insights • Fundamentals • Macro • Portfolio fit</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default withAuth(CompanyResearch);
