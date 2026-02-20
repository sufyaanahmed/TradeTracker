// ExitTradeModal — Confirm closing an active position
import { useState } from 'react';
import { X } from 'lucide-react';

export default function ExitTradeModal({ isOpen, onClose, trade, onExited }) {
  const [exitPrice, setExitPrice] = useState('');
  const [useMarket, setUseMarket] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !trade) return null;

  const previewPnL = () => {
    if (useMarket && trade.currentPrice) {
      const price = trade.currentPrice;
      if (trade.type === 'LONG') return ((price - trade.entryPrice) * trade.quantity).toFixed(2);
      return ((trade.entryPrice - price) * trade.quantity).toFixed(2);
    }
    if (!useMarket && exitPrice) {
      const price = parseFloat(exitPrice);
      if (trade.type === 'LONG') return ((price - trade.entryPrice) * trade.quantity).toFixed(2);
      return ((trade.entryPrice - price) * trade.quantity).toFixed(2);
    }
    return null;
  };

  const handleExit = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('firebase_token');
      const body = { tradeId: trade._id };
      if (!useMarket && exitPrice) {
        body.exitPrice = parseFloat(exitPrice);
      }

      const res = await fetch('/api/trades/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        if (onExited) onExited(data);
        onClose();
      } else {
        setError(data.error || 'Failed to close position');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const pnlPreview = previewPnL();
  const pnlNum = pnlPreview ? parseFloat(pnlPreview) : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 text-xl">logout</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Close Position</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Trade Summary */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-bold text-lg text-slate-900 dark:text-white">{trade.symbol}</p>
              <p className="text-xs text-slate-500">
                <span className={trade.type === 'LONG' ? 'text-emerald-500' : 'text-red-500'}>{trade.type}</span>
                {' · '}{trade.quantity} shares @ ${trade.entryPrice.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase">Current</p>
              <p className="font-bold text-slate-900 dark:text-white">${trade.currentPrice?.toFixed(2) || '—'}</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          {/* Exit Price Option */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={useMarket} onChange={() => setUseMarket(true)} className="accent-primary" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Exit at market price (${trade.currentPrice?.toFixed(2) || '—'})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={!useMarket} onChange={() => setUseMarket(false)} className="accent-primary" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Custom exit price</span>
            </label>
            {!useMarket && (
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="Exit price"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            )}
          </div>

          {/* P&L Preview */}
          {pnlNum !== null && (
            <div className={`p-4 rounded-lg border text-center ${
              pnlNum >= 0
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Estimated Realized P&L</p>
              <p className={`text-2xl font-bold ${pnlNum >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {pnlNum >= 0 ? '+' : ''}${pnlPreview}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleExit}
              disabled={loading || (!useMarket && !exitPrice)}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors"
            >
              {loading ? 'Closing...' : 'Confirm Exit'}
            </button>
            <button onClick={onClose} className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
