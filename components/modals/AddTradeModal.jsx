import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Plus, Zap } from 'lucide-react';

export default function AddTradeModal({ isOpen, onClose, onTradeAdded }) {
  const [newTrade, setNewTrade] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    pl: '',
    exchange: 'NASDAQ'
  });
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const handleAddTrade = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        alert('Please log in again');
        return;
      }

      const tradeData = {
        ...newTrade,
        pl: parseFloat(newTrade.pl) || 0
      };

      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(tradeData)
      });

      if (response.ok) {
        setNewTrade({
          name: '',
          date: new Date().toISOString().split('T')[0],
          reason: '',
          pl: '',
          exchange: 'NASDAQ'
        });
        setAiAnalysis(null);
        onTradeAdded();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to add trade'}`);
      }
    } catch (error) {
      console.error('Error adding trade:', error);
      alert('Error adding trade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAIAnalysis = async () => {
    if (!newTrade.name.trim()) {
      alert('Please enter a stock symbol first');
      return;
    }

    setAnalysisLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch('/api/analyze-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          stockSymbol: newTrade.name,
          exchange: newTrade.exchange
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data);
      } else {
        console.error('Failed to get AI analysis');
      }
    } catch (error) {
      console.error('Error getting AI analysis:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Add New Trade</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleAddTrade} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Stock Symbol *
                </label>
                <Input
                  type="text"
                  value={newTrade.name}
                  onChange={(e) => setNewTrade({...newTrade, name: e.target.value.toUpperCase()})}
                  placeholder="e.g., AAPL, TSLA"
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Exchange
                </label>
                <select
                  value={newTrade.exchange}
                  onChange={(e) => setNewTrade({...newTrade, exchange: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NSE">NSE</option>
                  <option value="BSE">BSE</option>
                  <option value="NASDAQ">NASDAQ</option>
                  <option value="NYSE">NYSE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Date *
                </label>
                <Input
                  type="date"
                  value={newTrade.date}
                  onChange={(e) => setNewTrade({...newTrade, date: e.target.value})}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  P&L ($) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={newTrade.pl}
                  onChange={(e) => setNewTrade({...newTrade, pl: e.target.value})}
                  placeholder="Enter profit/loss"
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-300">
                  Trading Reason
                </label>
                <Button
                  type="button"
                  onClick={getAIAnalysis}
                  disabled={analysisLoading || !newTrade.name.trim()}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  {analysisLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3" />
                      AI Analysis
                    </>
                  )}
                </Button>
              </div>
              <textarea
                value={newTrade.reason}
                onChange={(e) => setNewTrade({...newTrade, reason: e.target.value})}
                placeholder="Why did you make this trade? (Optional)"
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {aiAnalysis && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-white mb-2">AI Analysis for {newTrade.name}</h3>
                <div className="text-sm text-gray-300 whitespace-pre-wrap">
                  {aiAnalysis.rawAnalysis}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Trade
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 