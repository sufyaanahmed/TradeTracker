import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { TrendingUp, TrendingDown, Plus, Zap, ArrowLeft, Calendar, Building, DollarSign, FileText } from 'lucide-react';
import { getApiUrl, getApiHeaders } from '../lib/api';

export default function Trades() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  
  // New trade form using original schema
  const [newTrade, setNewTrade] = useState({
    name: '', // Stock symbol
    date: new Date().toISOString().split('T')[0],
    reason: '', // Trading reason
    pl: '', // Profit/Loss
    exchange: 'NSE' // Exchange
  });

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
        alert('Please log in again');
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
      alert('Failed to fetch trades. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrade = async (e) => {
    e.preventDefault();
    try {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        console.error('No user ID found');
        alert('Please log in again');
        router.push('/');
        return;
      }

      const tradeData = {
        ...newTrade,
        pl: parseFloat(newTrade.pl),
        userId: uid
      };

      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.error('No access token found');
        alert('Please log in again');
        router.push('/');
        return;
      }

      const url = getApiUrl('/trade');
      const headers = getApiHeaders(accessToken);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(tradeData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to add trade: ${response.status}`);
      }
      
      // Reset form
      setNewTrade({
        name: '',
        date: new Date().toISOString().split('T')[0],
        reason: '',
        pl: '',
        exchange: 'NSE'
      });
      
      setShowAddTrade(false);
      fetchTrades(user.uid);
      alert('Trade added successfully!');
    } catch (error) {
      console.error('Error adding trade:', error);
      alert('Failed to add trade');
    }
  };

  const getAIAnalysis = async () => {
    try {
      setAnalysisLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.error('No access token found');
        alert('Please log in again');
        router.push('/');
        return;
      }

      const url = getApiUrl('/analyze-stock');
      const headers = getApiHeaders(accessToken);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          stockSymbol: 'PORTFOLIO',
          exchange: 'ANALYSIS'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to analyze stock: ${response.status}`);
      }

      const result = await response.json();
      setAiAnalysis(result.rawAnalysis);
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      alert('Failed to get AI analysis');
    } finally {
      setAnalysisLoading(false);
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

  const getTradeTypeIcon = (pl) => {
    if (pl > 0) return <TrendingUp className="h-5 w-5 text-green-400" />;
    if (pl < 0) return <TrendingDown className="h-5 w-5 text-red-400" />;
    return <DollarSign className="h-5 w-5 text-gray-400" />;
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
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.push('/dashboard')} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold glow-text">Trading Journal</h1>
              <p className="text-muted-foreground">Track and analyze your trades</p>
            </div>
          </div>
          <Button onClick={() => setShowAddTrade(true)} className="flex items-center gap-2">
            <Plus size={20} />
            Add Trade
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrades}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total positions recorded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              {stats.totalPnL >= 0 ? 
                <TrendingUp className="h-4 w-4 text-green-500" /> : 
                <TrendingDown className="h-4 w-4 text-red-500" />
              }
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'profit-text' : 'loss-text'}`}>
                {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Net trading performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.winRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Profitable trades ratio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="trades" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trades">All Trades</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="trades">
            <Card>
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>
                  Your complete trading activity with detailed insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="loading-spinner mx-auto"></div>
                    <p className="text-muted-foreground mt-4">Loading your trades...</p>
                  </div>
                ) : trades.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/10 flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No trades yet</h3>
                    <p className="text-muted-foreground mb-4">Start building your trading journal by adding your first trade</p>
                    <Button onClick={() => setShowAddTrade(true)} className="flex items-center gap-2">
                      <Plus size={20} />
                      Add Your First Trade
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trades.map((trade, index) => (
                      <Card key={trade._id || index} className="border-l-4 border-l-neon-blue hover:bg-card/80 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {/* Stock Symbol and Exchange */}
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-2">
                                  {getTradeTypeIcon(trade.pl)}
                                  <span className="font-bold text-xl">{trade.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Building size={14} />
                                  <span>{trade.exchange}</span>
                                </div>
                              </div>

                              {/* Trade Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar size={14} className="text-muted-foreground" />
                                  <span className="text-muted-foreground">Date:</span>
                                  <span className="font-medium">{new Date(trade.date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                  <FileText size={14} className="text-muted-foreground" />
                                  <span className="text-muted-foreground">Strategy:</span>
                                  <span className="font-medium truncate max-w-48" title={trade.reason}>
                                    {trade.reason}
                                  </span>
                                </div>
                              </div>

                              {/* Full Reason on Mobile */}
                              <div className="md:hidden mb-4">
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Trading Reason:</span>
                                  <p className="mt-1 text-sm bg-muted/10 p-2 rounded">{trade.reason}</p>
                                </div>
                              </div>
                            </div>

                            {/* P&L Display */}
                            <div className="text-right ml-4">
                              <div className={`text-2xl font-bold ${trade.pl >= 0 ? 'profit-text' : 'loss-text'}`}>
                                {trade.pl >= 0 ? '+' : ''}${Math.abs(trade.pl).toFixed(2)}
                              </div>
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                trade.pl > 0 ? 'bg-green-500/20 text-green-400' : 
                                trade.pl < 0 ? 'bg-red-500/20 text-red-400' : 
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {trade.pl > 0 ? 'PROFIT' : trade.pl < 0 ? 'LOSS' : 'BREAKEVEN'}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>AI Portfolio Analysis</CardTitle>
                <CardDescription>
                  Get comprehensive insights on your trading performance using advanced AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={getAIAnalysis} 
                    disabled={analysisLoading || trades.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Zap size={20} />
                    {analysisLoading ? 'Analyzing Your Performance...' : 'Generate AI Analysis'}
                  </Button>
                  
                  {aiAnalysis && (
                    <div className="glass-effect p-6 rounded-lg">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Zap size={16} className="text-neon-blue" />
                        AI Trading Performance Report
                      </h4>
                      <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed">{aiAnalysis}</pre>
                      </div>
                    </div>
                  )}
                  
                  {trades.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/10 flex items-center justify-center">
                        <Zap className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No Data for Analysis</h3>
                      <p className="text-muted-foreground">Add some trades to get AI-powered insights on your performance</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Trade Modal */}
        {showAddTrade && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add New Trade</CardTitle>
                <CardDescription>
                  Record your trading activity with detailed information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTrade} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock Symbol</label>
                    <Input
                      type="text"
                      placeholder="e.g., AAPL, RELIANCE, MSFT"
                      value={newTrade.name}
                      onChange={(e) => setNewTrade({...newTrade, name: e.target.value.toUpperCase()})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Exchange</label>
                    <select 
                      className="cyber-input"
                      value={newTrade.exchange}
                      onChange={(e) => setNewTrade({...newTrade, exchange: e.target.value})}
                    >
                      <option value="NSE">NSE (National Stock Exchange)</option>
                      <option value="BSE">BSE (Bombay Stock Exchange)</option>
                      <option value="NASDAQ">NASDAQ</option>
                      <option value="NYSE">NYSE (New York Stock Exchange)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Profit/Loss ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="150.00 for profit, -50.00 for loss"
                      value={newTrade.pl}
                      onChange={(e) => setNewTrade({...newTrade, pl: e.target.value})}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter positive for profit, negative for loss</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Trade Date</label>
                    <Input
                      type="date"
                      value={newTrade.date}
                      onChange={(e) => setNewTrade({...newTrade, date: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Trading Strategy/Reason</label>
                    <Input
                      type="text"
                      placeholder="Breakout above resistance, earnings play, technical analysis..."
                      value={newTrade.reason}
                      onChange={(e) => setNewTrade({...newTrade, reason: e.target.value})}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Describe your trading rationale</p>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Add Trade
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowAddTrade(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 