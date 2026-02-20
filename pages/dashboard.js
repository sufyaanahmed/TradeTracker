import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import QuantEvaluator from '../components/QuantEvaluator';
import AddTradeModal from '../components/modals/AddTradeModal';
import ExitTradeModal from '../components/modals/ExitTradeModal';
import { withAuth, useAuth } from '../lib/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import dynamic from 'next/dynamic';

const PortfolioChart = dynamic(() => import('../components/Charts').then(mod => ({ default: mod.PortfolioChart })), { ssr: false });
const MonthlyPLChart = dynamic(() => import('../components/Charts').then(mod => ({ default: mod.MonthlyPLChart })), { ssr: false });
const AssetAllocationChart = dynamic(() => import('../components/Charts').then(mod => ({ default: mod.AssetAllocationChart })), { ssr: false });
const WinRateChart = dynamic(() => import('../components/Charts').then(mod => ({ default: mod.WinRateChart })), { ssr: false });

// Polling interval for live P&L (ms)
const POLL_INTERVAL = 10_000;

function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();

  // Core state
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'closed'
  const [activePositions, setActivePositions] = useState([]);
  const [closedTrades, setClosedTrades] = useState([]);
  const [activeTotals, setActiveTotals] = useState({ unrealizedPnL: 0, totalValue: 0, positionCount: 0 });
  const [closedTotals, setClosedTotals] = useState({ realizedPnL: 0, totalTrades: 0, winRate: 0 });
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migrationDone, setMigrationDone] = useState(false);

  // Modals
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [exitTrade, setExitTrade] = useState(null); // trade object to exit

  // Polling ref
  const pollRef = useRef(null);

  const getToken = () => localStorage.getItem('firebase_token');

  // ─── Fetch Active Positions ──────────────────────────────
  const fetchActive = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch('/api/trades/active', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setActivePositions(data.positions || []);
      setActiveTotals(data.totals || { unrealizedPnL: 0, totalValue: 0, positionCount: 0 });
    } catch (err) {
      console.error('[dashboard] Active fetch error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // ─── Fetch Closed Trades ─────────────────────────────────
  const fetchClosed = useCallback(async () => {
    try {
      const res = await fetch('/api/trades/closed', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setClosedTrades(data.trades || []);
      setClosedTotals(data.totals || { realizedPnL: 0, totalTrades: 0, winRate: 0 });
    } catch (err) {
      console.error('[dashboard] Closed fetch error:', err);
    }
  }, []);

  // ─── Migrate legacy trades (runs once) ───────────────────
  const runMigration = useCallback(async () => {
    try {
      setMigrating(true);
      const res = await fetch('/api/trades/migrate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      console.log('[migration]', data.message);
      setMigrationDone(true);
    } catch (err) {
      console.error('[migration] error:', err);
    } finally {
      setMigrating(false);
    }
  }, []);

  // ─── Initial load + polling ──────────────────────────────
  useEffect(() => {
    if (!user) return;

    // Run migration first, then fetch
    (async () => {
      if (!migrationDone) await runMigration();
      await Promise.all([fetchActive(), fetchClosed()]);
    })();

    // Live polling for active positions
    pollRef.current = setInterval(() => {
      fetchActive(true); // silent refresh
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user, migrationDone, fetchActive, fetchClosed, runMigration]);

  // ─── Handlers ────────────────────────────────────────────
  const handleTradeAdded = () => {
    fetchActive();
    fetchClosed();
  };

  const handleTradeExited = () => {
    fetchActive();
    fetchClosed();
  };

  const handleSignOut = async () => {
    try {
      if (pollRef.current) clearInterval(pollRef.current);
      const auth = getAuth();
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // ─── Compute combined stats ──────────────────────────────
  const totalPortfolioValue = activeTotals.totalValue + closedTotals.realizedPnL;

  // Build chart-compatible data from closed trades for legacy charts
  const chartTrades = closedTrades.map((t) => ({
    name: t.symbol,
    symbol: t.symbol,
    pl: t.realizedPnL || 0,
    date: t.exitDate || t.entryDate,
    exchange: t.exchange,
  }));

  return (
    <>
      <Head>
        <title>Dashboard | AlphaTrade</title>
      </Head>

      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
        {/* ─── Top Nav ──────────────────────────────────────── */}
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
              <input className="w-64 pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white placeholder:text-slate-500" placeholder="Search markets..." type="text" />
            </div>
            <button onClick={() => setShowAddTrade(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm">
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Open Position</span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
            <button onClick={handleSignOut} className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-lg text-slate-600 dark:text-slate-400">logout</span>
            </button>
          </div>
        </header>

        <main className="p-6 lg:px-12 max-w-[1600px] mx-auto w-full">
          {/* ─── Key Stats Row ──────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Unrealised P&L */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Unrealized P&L</p>
              <h3 className={`text-2xl font-bold ${activeTotals.unrealizedPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {activeTotals.unrealizedPnL >= 0 ? '+' : ''}${activeTotals.unrealizedPnL.toFixed(2)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{activeTotals.positionCount} open position{activeTotals.positionCount !== 1 ? 's' : ''}</p>
            </div>

            {/* Realised P&L */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Realized P&L</p>
              <h3 className={`text-2xl font-bold ${closedTotals.realizedPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {closedTotals.realizedPnL >= 0 ? '+' : ''}${closedTotals.realizedPnL.toFixed(2)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{closedTotals.totalTrades} closed trade{closedTotals.totalTrades !== 1 ? 's' : ''}</p>
            </div>

            {/* Win Rate */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Win Rate</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{closedTotals.winRate?.toFixed(1) || '0.0'}%</h3>
              <p className="text-xs text-slate-400 mt-1">{closedTotals.wins || 0}W / {closedTotals.losses || 0}L</p>
            </div>

            {/* Portfolio Value */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Portfolio Value</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${activeTotals.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
              <p className="text-xs text-slate-400 mt-1">Active positions market value</p>
            </div>
          </div>

          {/* ─── Main Content: Table + Sidebar ──────────────── */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            {/* Left: Trade tables */}
            <div className="flex-grow">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Tab Switcher */}
                <div className="flex border-b border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 text-center py-3.5 text-sm font-bold transition-colors relative ${
                      activeTab === 'active'
                        ? 'text-primary'
                        : 'text-slate-500 dark:text-slate-400 hover:text-primary'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-lg">monitoring</span>
                      Active Positions
                      {activePositions.length > 0 && (
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{activePositions.length}</span>
                      )}
                    </span>
                    {activeTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
                  </button>
                  <button
                    onClick={() => setActiveTab('closed')}
                    className={`flex-1 text-center py-3.5 text-sm font-bold transition-colors relative ${
                      activeTab === 'closed'
                        ? 'text-primary'
                        : 'text-slate-500 dark:text-slate-400 hover:text-primary'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-lg">inventory_2</span>
                      Closed Trades
                      {closedTrades.length > 0 && (
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">{closedTrades.length}</span>
                      )}
                    </span>
                    {activeTab === 'closed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
                  </button>
                </div>

                {/* Active Positions Table */}
                {activeTab === 'active' && (
                  <div className="overflow-x-auto">
                    {loading && activePositions.length === 0 ? (
                      <div className="p-12 text-center text-slate-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-3"></div>
                        Loading positions...
                      </div>
                    ) : activePositions.length === 0 ? (
                      <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3 block">monitoring</span>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No active positions</p>
                        <p className="text-sm text-slate-400 mt-1">Open your first position to start tracking live P&L</p>
                        <button onClick={() => setShowAddTrade(true)} className="mt-4 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors">
                          Open Position
                        </button>
                      </div>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                          <tr>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Symbol</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Entry</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Current</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Qty</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Unrealized P&L</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {activePositions.map((pos) => {
                            const isProfit = pos.unrealizedPnL >= 0;
                            return (
                              <tr key={pos._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                      isProfit ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                                    }`}>{pos.symbol.charAt(0)}</div>
                                    <div>
                                      <span className="font-bold text-slate-900 dark:text-white">{pos.symbol}</span>
                                      <p className="text-[10px] text-slate-400">{pos.exchange}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    pos.type === 'LONG' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  }`}>{pos.type}</span>
                                </td>
                                <td className="px-5 py-4 text-right text-sm font-medium text-slate-700 dark:text-slate-300">${pos.entryPrice.toFixed(2)}</td>
                                <td className="px-5 py-4 text-right">
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">${pos.currentPrice.toFixed(2)}</span>
                                  {pos.priceChangePct !== 0 && (
                                    <span className={`ml-1.5 text-xs font-medium ${pos.priceChangePct >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                      {pos.priceChangePct >= 0 ? '+' : ''}{pos.priceChangePct.toFixed(2)}%
                                    </span>
                                  )}
                                </td>
                                <td className="px-5 py-4 text-right text-sm text-slate-600 dark:text-slate-400">{pos.quantity}</td>
                                <td className={`px-5 py-4 text-right font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                  <span>{isProfit ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}</span>
                                  {pos.priceSource === 'mock' && (
                                    <span className="ml-1 text-[9px] text-slate-400 font-normal align-super" title="Simulated price">SIM</span>
                                  )}
                                </td>
                                <td className="px-5 py-4 text-center">
                                  <button
                                    onClick={() => setExitTrade(pos)}
                                    className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-800"
                                  >
                                    Exit
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                    {/* Live indicator */}
                    {activePositions.length > 0 && (
                      <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Live — updates every 10s</span>
                        </div>
                        <button onClick={() => fetchActive(true)} className="text-xs text-primary font-bold hover:underline">Refresh now</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Closed Trades Table */}
                {activeTab === 'closed' && (
                  <div className="overflow-x-auto">
                    {closedTrades.length === 0 ? (
                      <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3 block">inventory_2</span>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No closed trades yet</p>
                        <p className="text-sm text-slate-400 mt-1">Exit an active position to see it here</p>
                      </div>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                          <tr>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Symbol</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Entry</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Exit</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Qty</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Realized P&L</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {closedTrades.map((trade) => {
                            const isProfit = (trade.realizedPnL || 0) >= 0;
                            return (
                              <tr key={trade._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                      isProfit ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                                    }`}>{trade.symbol.charAt(0)}</div>
                                    <div>
                                      <span className="font-bold text-slate-900 dark:text-white">{trade.symbol}</span>
                                      <p className="text-[10px] text-slate-400">{trade.exchange || ''}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    trade.type === 'LONG' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  }`}>{trade.type}</span>
                                </td>
                                <td className="px-5 py-4 text-right text-sm text-slate-600 dark:text-slate-400">${trade.entryPrice?.toFixed(2) || '—'}</td>
                                <td className="px-5 py-4 text-right text-sm text-slate-600 dark:text-slate-400">${trade.exitPrice?.toFixed(2) || '—'}</td>
                                <td className="px-5 py-4 text-right text-sm text-slate-600 dark:text-slate-400">{trade.quantity || 1}</td>
                                <td className={`px-5 py-4 text-right font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {isProfit ? '+' : ''}${(trade.realizedPnL || 0).toFixed(2)}
                                </td>
                                <td className="px-5 py-4 text-right text-sm text-slate-500">{trade.holdingDuration || '—'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: AI Quant + Tip */}
            <aside className="w-full lg:w-80 flex-shrink-0">
              <QuantEvaluator />
              <div className="mt-6 p-6 bg-primary/10 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <span className="material-symbols-outlined text-xl">lightbulb</span>
                  <span className="font-bold text-sm">Trader Tip</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  Active positions update every 10 seconds. Use the Exit button to lock in profits or cut losses. Unrealized P&L is never stored — always computed live.
                </p>
              </div>
            </aside>
          </div>

          {/* ─── Charts Section ─────────────────────────────── */}
          {closedTrades.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Portfolio Performance</h3>
                <PortfolioChart trades={chartTrades} />
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Monthly P&L</h3>
                <MonthlyPLChart trades={chartTrades} />
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Asset Allocation</h3>
                <AssetAllocationChart trades={chartTrades} />
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Win Rate Trend</h3>
                <WinRateChart trades={chartTrades} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─── Modals ─────────────────────────────────────────── */}
      <AddTradeModal isOpen={showAddTrade} onClose={() => setShowAddTrade(false)} onTradeAdded={handleTradeAdded} />
      <ExitTradeModal isOpen={!!exitTrade} onClose={() => setExitTrade(null)} trade={exitTrade} onExited={handleTradeExited} />
    </>
  );
}

export default withAuth(Dashboard);
