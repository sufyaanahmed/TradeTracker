import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import QuantEvaluator from '../components/QuantEvaluator';
import AddTradeModal from '../components/modals/AddTradeModal';
import { getApiUrl, getApiHeaders } from '../lib/api';
import { withAuth, useAuth } from '../lib/AuthContext';
import { getAuth, signOut } from 'firebase/auth';

function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [stats, setStats] = useState({
    totalPL: 0,
    winRate: 0,
    totalTrades: 0,
    plChange: 0,
    winRateChange: 0,
    tradesChange: 0
  });

  useEffect(() => {
    if (user) {
      fetchTrades();
    }
  }, [user]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('firebase_token');
      const url = getApiUrl('/trades');
      const headers = getApiHeaders(token);
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trades');
      }

      const data = await response.json();
      setTrades(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tradesData) => {
    if (!tradesData || tradesData.length === 0) {
      return;
    }

    const totalPL = tradesData.reduce((sum, trade) => sum + (trade.pl || 0), 0);
    const winningTrades = tradesData.filter(trade => (trade.pl || 0) > 0).length;
    const winRate = (winningTrades / tradesData.length) * 100;

    // Mock changes (in production, compare with previous period)
    const plChange = totalPL > 0 ? 12.5 : -5.2;
    const winRateChange = 2.1;
    const tradesChange = 5.4;

    setStats({
      totalPL,
      winRate,
      totalTrades: tradesData.length,
      plChange,
      winRateChange,
      tradesChange
    });
  };

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAddTrade = (newTrade) => {
    setTrades([newTrade, ...trades]);
    calculateStats([newTrade, ...trades]);
  };

  return (
    <>
      <Head>
        <title>Dashboard | AlphaTrade</title>
      </Head>

      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-3xl font-bold">rocket_launch</span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">AlphaTrade</h2>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a className="text-primary text-sm font-semibold border-b-2 border-primary pb-4 mt-4" href="/dashboard">Dashboard</a>
              <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" href="/research">Research</a>
            </nav>
          </div>

          <div className="flex flex-1 justify-end gap-4 items-center">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input 
                className="w-64 pl-10 pr-4 py-2 text-sm rounded-lg border-none bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-500"
                placeholder="Search markets..."
                type="text"
              />
            </div>
            <button 
              onClick={() => setShowAddTradeModal(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add Trade</span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
            <button onClick={handleSignOut} className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        </header>

        <main className="p-6 lg:px-12 max-w-[1600px] mx-auto w-full">
          {/* Key Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* P/L Widget */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Profit / Loss</p>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  stats.plChange >= 0 
                    ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' 
                    : 'text-red-500 bg-red-50 dark:bg-red-500/10'
                }`}>
                  {stats.plChange >= 0 ? '+' : ''}{stats.plChange.toFixed(1)}%
                </span>
              </div>
              <h3 className={`text-2xl font-bold ${
                stats.totalPL >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stats.totalPL >= 0 ? '+' : ''}${stats.totalPL.toFixed(2)}
              </h3>
              <div className="mt-4 h-12 w-full">
                <svg className={`w-full h-full ${stats.totalPL >= 0 ? 'text-emerald-500' : 'text-red-500'}`} preserveAspectRatio="none" viewBox="0 0 100 30">
                  <path d="M0,25 Q10,20 20,22 T40,15 T60,18 T80,5 T100,10" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M0,25 Q10,20 20,22 T40,15 T60,18 T80,5 T100,10 V30 H0 Z" fill="currentColor" fillOpacity="0.1"/>
                </svg>
              </div>
            </div>

            {/* Win Rate Widget */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Win Rate</p>
                <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs font-bold">
                  +{stats.winRateChange.toFixed(1)}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.winRate.toFixed(1)}%
              </h3>
              <div className="mt-4 h-12 w-full">
                <svg className="w-full h-full text-primary" preserveAspectRatio="none" viewBox="0 0 100 30">
                  <path d="M0,20 Q20,20 40,25 T60,15 T80,20 T100,15" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M0,20 Q20,20 40,25 T60,15 T80,20 T100,15 V30 H0 Z" fill="currentColor" fillOpacity="0.1"/>
                </svg>
              </div>
            </div>

            {/* Total Trades Widget */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Trades</p>
                <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-bold">
                  +{stats.tradesChange.toFixed(1)}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalTrades}
              </h3>
              <div className="mt-4 h-12 w-full">
                <svg className="w-full h-full text-emerald-500" preserveAspectRatio="none" viewBox="0 0 100 30">
                  <path d="M0,28 L10,22 L20,25 L30,18 L40,20 L50,12 L60,15 L70,8 L80,10 L90,2 L100,5" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M0,28 L10,22 L20,25 L30,18 L40,20 L50,12 L60,15 L70,8 L80,10 L90,2 L100,5 V30 H0 Z" fill="currentColor" fillOpacity="0.1"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Trade List Table */}
            <div className="flex-grow">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Trades</h2>
                  <button className="text-sm font-medium text-primary hover:underline">View History</button>
                </div>
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="p-12 text-center text-slate-500">Loading trades...</div>
                  ) : trades.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                      <p>No trades yet. Add your first trade to get started!</p>
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Symbol</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Result</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">P/L</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {trades.slice(0, 10).map((trade, idx) => {
                          const isProfit = (trade.pl || 0) > 0;
                          const symbol = trade.name || trade.symbol || 'N/A';
                          const firstLetter = symbol.charAt(0).toUpperCase();
                          
                          return (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                    isProfit 
                                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                                      : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                                  }`}>
                                    {firstLetter}
                                  </div>
                                  <span className="font-bold text-slate-900 dark:text-white">{symbol}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                {trade.date ? new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  isProfit
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                }`}>
                                  {isProfit ? 'Long' : 'Short'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className={`flex items-center gap-1.5 text-sm font-medium ${
                                  isProfit
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  <span className="material-symbols-outlined text-sm">
                                    {isProfit ? 'check_circle' : 'cancel'}
                                  </span>
                                  {isProfit ? 'Profit' : 'Loss'}
                                </div>
                              </td>
                              <td className={`px-6 py-4 text-right font-bold ${
                                isProfit
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {isProfit ? '+' : ''}${(trade.pl || 0).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* AI Analysis Panel - QuantEvaluator */}
            <aside className="w-full lg:w-80 flex-shrink-0">
              <QuantEvaluator />
              
              {/* Performance Tip Card */}
              <div className="mt-6 p-6 bg-primary/10 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <span className="material-symbols-outlined text-xl">lightbulb</span>
                  <span className="font-bold text-sm">Trader Tip</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  Your win rate is {stats.winRate > 0 ? '15%' : '5%'} higher during NY session. Consider focusing on these hours for maximum efficiency.
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* Add Trade Modal */}
      {showAddTradeModal && (
        <AddTradeModal
          onClose={() => setShowAddTradeModal(false)}
          onTradeAdded={handleAddTrade}
        />
      )}
    </>
  );
}

export default withAuth(Dashboard);
