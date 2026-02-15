import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, TrendingUp, TrendingDown, ArrowLeft, Zap } from 'lucide-react';
import axios from 'axios';

export default function Research() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

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
  }, [router]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchSymbol.trim()) return;

    try {
      setLoading(true);
      setStockData(null);
      setAiAnalysis(null);
      
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(`/api/stock-data?symbol=${searchSymbol.toUpperCase()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      setStockData(response.data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      let errorMessage = 'Failed to fetch stock data. Please check the symbol and try again.';
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAIAnalysis = async () => {
    if (!stockData) return;

    try {
      setAnalysisLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.post('/api/analyze-stock', {
        stockSymbol: stockData.symbol,
        exchange: 'NSE' // You can make this dynamic
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      setAiAnalysis(response.data.rawAnalysis);
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      let errorMessage = 'Failed to get AI analysis';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      alert(errorMessage);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const addTradeFromResearch = async (pl) => {
    if (!stockData) return;
    
    try {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        alert('Please log in again');
        router.push('/');
        return;
      }
      
      const tradeData = {
        name: stockData.symbol,
        date: new Date().toISOString().split('T')[0],
        reason: `Research-based trade from stock analysis`,
        pl: parseFloat(pl || 0),
        exchange: 'NSE',
        userId: uid
      };

      const accessToken = localStorage.getItem('accessToken');
      await axios.post('/api/trade', tradeData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      alert('Trade added successfully!');
    } catch (error) {
      console.error('Error adding trade:', error);
      alert('Failed to add trade');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-darker p-4">
      <div className="max-w-4xl mx-auto">
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
              <h1 className="text-3xl font-bold glow-text">Stock Research</h1>
              <p className="text-muted-foreground">Research stocks with real-time data and comprehensive AI analysis</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Stock</CardTitle>
            <CardDescription>
              Enter a stock symbol to get real-time data and professional-grade analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter stock symbol (e.g., AAPL, MSFT, RELIANCE)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                <Search size={20} />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stock Data */}
        {stockData && (
          <div className="space-y-6">
            {/* Stock Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{stockData.symbol}</span>
                  <span className="text-sm text-muted-foreground">
                    Last updated: {stockData.timestamp}
                  </span>
                </CardTitle>
                <CardDescription>
                  Real-time stock information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">${stockData.price}</div>
                    <div className={`text-sm flex items-center justify-center gap-1 ${
                      stockData.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stockData.change >= 0 ? 
                        <TrendingUp size={16} /> : 
                        <TrendingDown size={16} />
                      }
                      {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent})
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Current Price</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold">${stockData.open}</div>
                    <div className="text-xs text-muted-foreground">Open</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold">${stockData.high}</div>
                    <div className="text-xs text-muted-foreground">High</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold">${stockData.low}</div>
                    <div className="text-xs text-muted-foreground">Low</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border">
                  <div className="text-center">
                    <div className="text-xl font-bold">${stockData.previousClose}</div>
                    <div className="text-xs text-muted-foreground">Previous Close</div>
                  </div>

                  <div className="text-center">
                    <div className="text-xl font-bold">{stockData.volume.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Volume</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional AI Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Equity Research Report</CardTitle>
                <CardDescription>
                  Get investment bank-grade analysis with real market data, financial metrics, and actionable recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={getAIAnalysis} 
                    disabled={analysisLoading}
                    className="flex items-center gap-2"
                  >
                    <Zap size={20} />
                    {analysisLoading ? 'Generating Professional Analysis...' : 'Generate Equity Research Report'}
                  </Button>
                  
                  {aiAnalysis && (
                    <div className="glass-effect p-6 rounded-lg">
                      <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed">{aiAnalysis}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trading Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Add to Trading Journal</CardTitle>
                <CardDescription>
                  Record this stock analysis in your trading journal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => router.push('/trades')}
                    className="flex-1"
                  >
                    Open Trading Journal
                  </Button>
                  <Button 
                    onClick={() => addTradeFromResearch(100)}
                    variant="outline"
                    className="flex-1"
                  >
                    Mark as Watchlist
                  </Button>
                  <Button 
                    onClick={() => router.push(`/trades?symbol=${stockData.symbol}`)}
                    variant="outline"
                    className="flex-1"
                  >
                    Record Trade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Popular Stocks */}
        {!stockData && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>Popular Stocks</CardTitle>
              <CardDescription>
                Click to research these popular stocks with comprehensive analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'].map(symbol => (
                  <Button
                    key={symbol}
                    variant="outline"
                    onClick={() => {
                      setSearchSymbol(symbol);
                      handleSearch({ preventDefault: () => {} });
                    }}
                    className="text-center"
                  >
                    {symbol}
                  </Button>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold mb-4">Indian Stocks</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'HINDUNILVR', 'ITC', 'SBIN'].map(symbol => (
                    <Button
                      key={symbol}
                      variant="outline"
                      onClick={() => {
                        setSearchSymbol(symbol);
                        handleSearch({ preventDefault: () => {} });
                      }}
                      className="text-center"
                    >
                      {symbol}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 