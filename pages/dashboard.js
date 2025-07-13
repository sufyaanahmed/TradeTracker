import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TrendingUp, DollarSign, Activity, LogOut, TrendingDown } from 'lucide-react';
import { getApiUrl, getApiHeaders } from '../lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const uid = localStorage.getItem('uid');
    const uname = localStorage.getItem('uname');
    const accessToken = localStorage.getItem('accessToken');

    if (!uid || !accessToken) {
      router.push('/');
      return;
    }

    setUser({ uid, uname, accessToken });
    fetchTrades(uid);
  }, [router]);

  const fetchTrades = async (userId) => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.error('No access token found');
        router.push('/');
        return;
      }

      const url = getApiUrl('/trades');
      const headers = getApiHeaders(accessToken);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch trades: ${response.status}`);
      }
      
      const tradesData = await response.json();
      setTrades(tradesData || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
      // Don't show alert on dashboard, just log the error
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalTrades = trades.length;
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pl || 0), 0);
    const profitableTrades = trades.filter(t => t.pl > 0).length;
    const winRate = totalTrades > 0 ? Math.round((profitableTrades / totalTrades) * 100) : 0;

    return {
      totalTrades,
      totalPnL,
      winRate
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('uid');
    localStorage.removeItem('uname');
    localStorage.removeItem('accessToken');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-cyber-darker p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold glow-text">TradeTracker Pro</h1>
            <p className="text-muted-foreground">Welcome back, {user.uname}!</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut size={20} />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.totalTrades}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTrades === 0 ? 'Start by adding your first trade' : 'Total positions recorded'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              {loading ? 
                <DollarSign className="h-4 w-4 text-muted-foreground" /> :
                (stats.totalPnL >= 0 ? 
                  <TrendingUp className="h-4 w-4 text-green-500" /> : 
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )
              }
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${loading ? '' : (stats.totalPnL >= 0 ? 'profit-text' : 'loss-text')}`}>
                {loading ? '...' : (
                  `${stats.totalPnL >= 0 ? '+' : ''}$${stats.totalPnL.toFixed(2)}`
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Your trading performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : `${stats.winRate}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTrades === 0 ? 'Track your success rate' : 'Profitable trades ratio'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:bg-card/80 transition-colors" onClick={() => router.push('/trades')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-neon-blue" />
                Trading Journal
              </CardTitle>
              <CardDescription>
                View and manage your trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Open Journal</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-card/80 transition-colors" onClick={() => router.push('/research')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-neon-purple" />
                Stock Research
              </CardTitle>
              <CardDescription>
                Research stocks with real-time data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Research</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-card/80 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-neon-green" />
                Portfolio
              </CardTitle>
              <CardDescription>
                View your portfolio performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>Coming Soon</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trades Preview */}
        {!loading && trades.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recent Trades</h2>
              <Button variant="outline" onClick={() => router.push('/trades')}>
                View All
              </Button>
            </div>
            <div className="grid gap-4">
              {trades.slice(0, 3).map((trade, index) => (
                <Card key={index}>
                  <CardContent className="flex justify-between items-center p-4">
                    <div>
                      <h3 className="font-semibold">{trade.name}</h3>
                      <p className="text-sm text-muted-foreground">{new Date(trade.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${trade.pl >= 0 ? 'profit-text' : 'loss-text'}`}>
                        {trade.pl >= 0 ? '+' : ''}${trade.pl.toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">{trade.exchange}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Coming Soon Features */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center glow-text">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-effect p-4 rounded-lg text-center">
              <h3 className="font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground">Detailed performance metrics</p>
            </div>
            <div className="glass-effect p-4 rounded-lg text-center">
              <h3 className="font-semibold mb-2">Risk Management</h3>
              <p className="text-sm text-muted-foreground">Portfolio risk assessment</p>
            </div>
            <div className="glass-effect p-4 rounded-lg text-center">
              <h3 className="font-semibold mb-2">Trade Alerts</h3>
              <p className="text-sm text-muted-foreground">Smart trading notifications</p>
            </div>
            <div className="glass-effect p-4 rounded-lg text-center">
              <h3 className="font-semibold mb-2">Export Reports</h3>
              <p className="text-sm text-muted-foreground">Download trading reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 