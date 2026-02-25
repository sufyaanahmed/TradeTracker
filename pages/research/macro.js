import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { withAuth, useAuth } from '../../lib/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import MacroIndicators from '../../components/research/MacroIndicators';

function MacroDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [macroData, setMacroData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('firebase_token');

  useEffect(() => {
    fetchMacro();
  }, []);

  const fetchMacro = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/research/macro', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to fetch macro data');
      const data = await res.json();
      setMacroData(data.data);
      setAnalysis(data.analysis);
    } catch (err) {
      console.error('[MacroDashboard] Error:', err);
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
        <title>Macro Economics | Palrin</title>
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
              <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" href="/research/sectors">Sectors</a>
              <a className="text-primary text-sm font-semibold border-b-2 border-primary pb-4 mt-4" href="/research/macro">Macro</a>
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
          <h1 className="text-2xl font-bold mb-6">Macro Economics Dashboard</h1>

          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-slate-500">Loading macro data...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              <MacroIndicators data={macroData} analysis={analysis} />

              {/* Key Rates Table */}
              {macroData && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">table_chart</span>
                    Key Indicators at a Glance
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <IndicatorCard label="🇺🇸 Fed Rate" value={`${macroData.usInterestRate}%`} />
                    <IndicatorCard label="🇺🇸 CPI" value={`${macroData.usInflation}%`} />
                    <IndicatorCard label="🇺🇸 10Y Yield" value={`${macroData.usBondYield10y}%`} />
                    <IndicatorCard label="DXY Index" value={macroData.dollarIndex?.toFixed(1)} />
                    <IndicatorCard label="🇮🇳 RBI Rate" value={`${macroData.rbiInterestRate}%`} />
                    <IndicatorCard label="🇮🇳 CPI" value={`${macroData.indiaInflation}%`} />
                    <IndicatorCard label="🇮🇳 GDP Growth" value={`${macroData.indiaGDPGrowth}%`} />
                    <IndicatorCard label="Crude Oil" value={`$${macroData.crudeOilPrice}`} />
                    <IndicatorCard label="USD/INR" value={`₹${macroData.usdInr}`} />
                    <IndicatorCard label="🇮🇳 10Y Bond" value={`${macroData.indiaBondYield10y || 7.2}%`} />
                  </div>
                </div>
              )}

              {/* Impact on Trading */}
              {analysis && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                    Trading Implications
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImplicationCard
                      title="For Indian Equities"
                      sentiment={analysis.india?.sentiment}
                      items={[
                        analysis.india?.sentiment === 'bullish' ? 'Favorable macro backdrop for equity positions' : 'Cautious approach recommended for Indian equities',
                        macroData?.indiaGDPGrowth > 6 ? 'Strong GDP growth supports corporate earnings' : 'Moderate GDP may limit earnings upside',
                        macroData?.rbiInterestRate < 6.5 ? 'Accommodative monetary policy is supportive' : 'Tight monetary policy may cap valuations',
                      ]}
                    />
                    <ImplicationCard
                      title="For US-linked Stocks"
                      sentiment={analysis.us?.sentiment}
                      items={[
                        analysis.us?.sentiment === 'bullish' ? 'US macro supports IT & export plays' : 'US headwinds may impact export-oriented sectors',
                        macroData?.dollarIndex > 105 ? 'Strong dollar is negative for emerging markets' : 'Stable dollar environment for EM flows',
                        macroData?.crudeOilPrice > 85 ? 'High crude is a headwind for import-heavy India' : 'Oil prices supportive for Indian current account',
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function IndicatorCard({ label, value }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold text-slate-900 dark:text-white">{value || '—'}</p>
    </div>
  );
}

function ImplicationCard({ title, sentiment, items }) {
  const sentimentColors = {
    bullish: 'border-l-emerald-500',
    neutral: 'border-l-amber-500',
    bearish: 'border-l-red-500',
  };

  return (
    <div className={`p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-l-4 ${sentimentColors[sentiment] || 'border-l-slate-300'}`}>
      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
            <span className="text-slate-300 mt-0.5">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default withAuth(MacroDashboard);
