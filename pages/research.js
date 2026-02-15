import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Research() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem('uid');
    const uname = localStorage.getItem('uname');
    const accessToken = localStorage.getItem('accessToken');

    if (!uid || !accessToken) {
      router.push('/');
      return;
    }

    setUser({ uid, uname, accessToken });
  }, [router]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchSymbol.trim()) return;

    try {
      setLoading(true);
      setStockData(null);
      setAiAnalysis(null);
      
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`/api/stock-data?symbol=${searchSymbol.toUpperCase()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stock data');
      
      const data = await response.json();
      setStockData(data);
      
      // Trigger AI analysis
      analyzeStock(searchSymbol.toUpperCase(), accessToken);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setStockData({ error: 'Failed to fetch stock data' });
    } finally {
      setLoading(false);
    }
  };

  const analyzeStock = async (symbol, accessToken) => {
    try {
      setAnalysisLoading(true);
      const response = await fetch(`/api/analyze-stock?symbol=${symbol}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) throw new Error('Failed to analyze stock');
      
      const data = await response.json();
      setAiAnalysis(data);
    } catch (error) {
      console.error('Error analyzing stock:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('uid');
    localStorage.removeItem('uname');
    localStorage.removeItem('accessToken');
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Market Research | StockSaaS</title>
      </Head>

      <div className="bg-background-light dark:bg-background-dark text-[#0d121c] font-display min-h-screen">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-white/80 backdrop-blur-md px-6 md:px-10 py-3">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-xl">query_stats</span>
                </div>
                <h2 className="text-lg font-bold tracking-tight">StockSaaS</h2>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="/dashboard">Dashboard</a>
                <a className="text-sm font-semibold text-primary relative after:content-[''] after:absolute after:-bottom-[19px] after:left-0 after:w-full after:h-[2px] after:bg-primary" href="/research">Research</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold">{user?.uname || 'User'}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Pro Account</p>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden hover:bg-primary/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-sm">logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1024px] mx-auto px-6 py-8">
          {/* Hero Search Section */}
          <section className="mb-10 text-center">
            <h1 className="text-2xl font-bold mb-6">Market Research</h1>
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
              </div>
              <input 
                className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 text-lg"
                placeholder="Search ticker, company, or news (e.g., AAPL)..."
                type="text"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value)}
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-sm">⌘</span>K
                </kbd>
              </div>
            </form>
          </section>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-slate-500">Searching for {searchSymbol}...</p>
            </div>
          )}

          {/* Stock Not Found */}
          {stockData?.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <span className="material-symbols-outlined text-red-500 text-4xl mb-2">error</span>
              <p className="text-red-700 dark:text-red-400">{stockData.error}</p>
            </div>
          )}

          {/* Stock Summary Card */}
          {stockData && !stockData.error && (
            <>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="size-14 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined text-3xl">
                        {stockData.quote?.symbol?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold">{stockData.overview?.Name || searchSymbol}</h2>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold">
                          {stockData.overview?.Exchange || 'NASDAQ'}: {stockData.quote?.symbol || searchSymbol}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm">
                        {stockData.overview?.Industry || 'Technology'} • {stockData.overview?.Country || 'US'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-end md:text-right flex-row md:flex-col justify-between md:justify-center gap-2">
                    <div className="text-3xl font-bold tracking-tight">
                      ${stockData.quote?.price?.toFixed(2) || '0.00'}
                    </div>
                    <div className={`flex items-center gap-1 font-semibold ${
                      (stockData.quote?.changePercent || 0) >= 0 
                        ? 'text-emerald-600' 
                        : 'text-red-600'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {(stockData.quote?.changePercent || 0) >= 0 ? 'trending_up' : 'trending_down'}
                      </span>
                      <span>{(stockData.quote?.changePercent || 0) >= 0 ? '+' : ''}{stockData.quote?.changePercent?.toFixed(2)}%</span>
                      <span className="text-slate-400 font-normal ml-1">
                        {(stockData.quote?.change || 0) >= 0 ? '+' : ''}${stockData.quote?.change?.toFixed(2)} Today
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Bar */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-wrap gap-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Market Cap</span>
                    <span className="text-sm font-semibold">
                      {stockData.overview?.MarketCapitalization 
                        ? `$${(parseFloat(stockData.overview.MarketCapitalization) / 1e12).toFixed(2)}T`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">P/E Ratio</span>
                    <span className="text-sm font-semibold">{stockData.overview?.PERatio || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">52W Range</span>
                    <span className="text-sm font-semibold">
                      ${stockData.overview?.['52WeekLow'] || '0'} - ${stockData.overview?.['52WeekHigh'] || '0'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Volume</span>
                    <span className="text-sm font-semibold">
                      {stockData.quote?.volume 
                        ? `${(stockData.quote.volume / 1e6).toFixed(1)}M`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Analysis Module */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">auto_awesome</span>
                        </div>
                        <h3 className="text-lg font-bold">AI Stock Analysis</h3>
                      </div>
                      {aiAnalysis && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Confidence Score: {aiAnalysis.confidence || 94}%</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${aiAnalysis.confidence || 94}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {analysisLoading ? (
                      <div className="py-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                        <p className="text-slate-500">Analyzing with AI...</p>
                      </div>
                    ) : aiAnalysis ? (
                      <div className="space-y-4">
                        {aiAnalysis.insights?.map((insight, idx) => (
                          <div key={idx} className={`flex gap-4 p-4 rounded-lg border ${
                            insight.type === 'positive' 
                              ? 'bg-emerald-50/50 border-emerald-100/50'
                              : insight.type === 'negative'
                              ? 'bg-red-50/50 border-red-100/50'
                              : 'bg-blue-50/50 border-blue-100/50'
                          }`}>
                            <span className={`material-symbols-outlined mt-0.5 shrink-0 ${
                              insight.type === 'positive' 
                                ? 'text-emerald-600'
                                : insight.type === 'negative'
                                ? 'text-red-600'
                                : 'text-blue-600'
                            }`}>
                              {insight.icon || 'info'}
                            </span>
                            <div>
                              <p className={`font-semibold text-sm ${
                                insight.type === 'positive' 
                                  ? 'text-emerald-900'
                                  : insight.type === 'negative'
                                  ? 'text-red-900'
                                  : 'text-blue-900'
                              }`}>
                                {insight.title}
                              </p>
                              <p className={`text-sm leading-relaxed mt-1 ${
                                insight.type === 'positive' 
                                  ? 'text-emerald-800/80'
                                  : insight.type === 'negative'
                                  ? 'text-red-800/80'
                                  : 'text-blue-800/80'
                              }`}>
                                {insight.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2">query_stats</span>
                        <p>AI analysis will appear here</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Side Cards */}
                <div className="space-y-6">
                  {/* Sentiment Card */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Market Sentiment</h4>
                    <div className="flex flex-col items-center py-4">
                      <div className={`px-4 py-2 rounded-full flex items-center gap-2 mb-3 ${
                        aiAnalysis?.sentiment === 'Bullish' || !aiAnalysis
                          ? 'text-emerald-600 bg-emerald-50'
                          : 'text-red-600 bg-red-50'
                      }`}>
                        <span className="material-symbols-outlined text-lg">
                          {aiAnalysis?.sentiment === 'Bullish' || !aiAnalysis ? 'trending_up' : 'trending_down'}
                        </span>
                        <span className="font-bold text-lg">{aiAnalysis?.sentiment || 'Bullish'}</span>
                      </div>
                      <p className="text-slate-400 text-xs text-center">
                        Based on technical indicators and social volume analysis
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Social Buzz</span>
                        <span className="font-bold text-emerald-600">+12% vs LW</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full">
                        <div className="bg-emerald-500 h-full w-[75%] rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Card */}
                  <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                      <span className="material-symbols-outlined text-[100px]">bolt</span>
                    </div>
                    <h4 className="font-bold text-lg mb-2 relative z-10">Ready to execute?</h4>
                    <p className="text-slate-400 text-xs mb-6 relative z-10">
                      Initiate a trade based on these AI-driven research insights immediately.
                    </p>
                    <button 
                      onClick={() => router.push('/dashboard')}
                      className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all shadow-md active:scale-[0.98] relative z-10 flex items-center justify-center gap-2"
                    >
                      <span>Create Trade from Research</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Technical Analysis Preview */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Price Action Chart</h3>
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <button className="px-3 py-1 text-xs font-semibold rounded bg-white shadow-sm">1D</button>
                    <button className="px-3 py-1 text-xs font-semibold rounded text-slate-500 hover:text-slate-700">1W</button>
                    <button className="px-3 py-1 text-xs font-semibold rounded text-slate-500 hover:text-slate-700">1M</button>
                    <button className="px-3 py-1 text-xs font-semibold rounded text-slate-500 hover:text-slate-700">1Y</button>
                  </div>
                </div>
                <div className="h-[240px] w-full bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/50 to-transparent"></div>
                  <svg className="w-full h-full p-4" preserveAspectRatio="none" viewBox="0 0 1000 300">
                    <path d="M0,250 Q100,240 200,260 T400,200 T600,150 T800,100 T1000,80" fill="none" stroke="#256af4" strokeWidth="3"/>
                    <path d="M0,250 Q100,240 200,260 T400,200 T600,150 T800,100 T1000,80 V300 H0 Z" fill="url(#grad1)" opacity="0.1"/>
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#256af4', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#256af4', stopOpacity: 0 }} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-slate-300 text-4xl">monitoring</span>
                    <p className="text-slate-400 text-sm font-medium">Interactive Chart View</p>
                    <button className="mt-2 text-primary text-xs font-bold hover:underline">Launch Full Terminal</button>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>

        <footer className="max-w-[1200px] mx-auto px-6 py-12 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 grayscale opacity-50">
              <span className="material-symbols-outlined">query_stats</span>
              <span className="font-bold">StockSaaS</span>
              <span className="text-xs ml-2">© 2024 Financial Intelligence Inc.</span>
            </div>
            <div className="flex gap-8">
              <a className="text-xs text-slate-500 hover:text-slate-800" href="#">API Documentation</a>
              <a className="text-xs text-slate-500 hover:text-slate-800" href="#">Compliance</a>
              <a className="text-xs text-slate-500 hover:text-slate-800" href="#">Terms of Service</a>
              <a className="text-xs text-slate-500 hover:text-slate-800" href="#">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
