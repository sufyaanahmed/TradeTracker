import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Plus, Zap } from 'lucide-react';

export default function AddTradeModal({ isOpen, onClose, onTradeAdded }) {
  const [form, setForm] = useState({
    symbol: '',
    type: 'LONG',
    entryPrice: '',
    quantity: '',
    exchange: 'NASDAQ',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('firebase_token');
      if (!token) {
        setError('Please log in again');
        return;
      }

      const response = await fetch('/api/trades/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: form.symbol,
          type: form.type,
          entryPrice: parseFloat(form.entryPrice),
          quantity: parseInt(form.quantity),
          exchange: form.exchange,
          reason: form.reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setForm({ symbol: '', type: 'LONG', entryPrice: '', quantity: '', exchange: 'NASDAQ', reason: '' });
        setAiAnalysis(null);
        if (onTradeAdded) onTradeAdded(data);
        onClose();
      } else {
        setError(data.error || data.details?.join(', ') || 'Failed to create trade');
      }
    } catch (err) {
      console.error('Error creating trade:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAIAnalysis = async () => {
    if (!form.symbol.trim()) return;
    setAnalysisLoading(true);
    try {
      const token = localStorage.getItem('firebase_token');
      const response = await fetch('/api/analyze-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stockSymbol: form.symbol, exchange: form.exchange }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error('AI analysis error:', err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">add_chart</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Open New Position</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Row 1: Symbol + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Symbol *</label>
              <Input
                value={form.symbol}
                onChange={(e) => update('symbol', e.target.value.toUpperCase())}
                placeholder="AAPL"
                required
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Position Type *</label>
              <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => update('type', 'LONG')}
                  className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
                    form.type === 'LONG'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  LONG
                </button>
                <button
                  type="button"
                  onClick={() => update('type', 'SHORT')}
                  className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
                    form.type === 'SHORT'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  SHORT
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Entry Price + Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Entry Price *</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={form.entryPrice}
                onChange={(e) => update('entryPrice', e.target.value)}
                placeholder="150.00"
                required
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Quantity *</label>
              <Input
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(e) => update('quantity', e.target.value)}
                placeholder="10"
                required
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Row 3: Exchange */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Exchange</label>
            <select
              value={form.exchange}
              onChange={(e) => update('exchange', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="NASDAQ">NASDAQ</option>
              <option value="NYSE">NYSE</option>
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
            </select>
          </div>

          {/* Reason + AI */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trade Thesis</label>
              <button
                type="button"
                onClick={getAIAnalysis}
                disabled={analysisLoading || !form.symbol.trim()}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {analysisLoading ? (
                  <><div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent"></div> Analyzing...</>
                ) : (
                  <><Zap className="h-3 w-3" /> AI Analysis</>
                )}
              </button>
            </div>
            <textarea
              value={form.reason}
              onChange={(e) => update('reason', e.target.value)}
              placeholder="Why are you entering this trade?"
              rows={2}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder:text-slate-400"
            />
          </div>

          {/* AI Analysis Result */}
          {aiAnalysis && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">AI Analysis — {form.symbol}</h3>
              <div className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {aiAnalysis.rawAnalysis}
              </div>
            </div>
          )}

          {/* Trade Value Preview */}
          {form.entryPrice && form.quantity && (
            <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Position Value</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                ${(parseFloat(form.entryPrice || 0) * parseInt(form.quantity || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Opening...</>
              ) : (
                <><Plus className="h-4 w-4" /> Open Position</>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 