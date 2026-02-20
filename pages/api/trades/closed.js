// GET /api/trades/closed — Fetch CLOSED trades with realized P&L
import { authenticate } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const auth = await authenticate(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });
  const userId = auth.uid;

  try {
    const { db } = await connectToDatabase();
    const trades = await db
      .collection('trades')
      .find({ userId, status: 'CLOSED' })
      .sort({ exitDate: -1 })
      .toArray();

    // Compute aggregate stats
    let totalRealizedPnL = 0;
    let wins = 0;

    const closedTrades = trades.map((trade) => {
      const pnl = trade.realizedPnL || 0;
      totalRealizedPnL += pnl;
      if (pnl > 0) wins++;

      // Compute holding duration
      const entryMs = new Date(trade.entryDate).getTime();
      const exitMs = new Date(trade.exitDate).getTime();
      const holdingMs = exitMs - entryMs;
      const holdingDays = Math.max(0, Math.floor(holdingMs / (1000 * 60 * 60 * 24)));
      const holdingHours = Math.max(0, Math.floor((holdingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

      return {
        _id: trade._id,
        symbol: trade.symbol,
        type: trade.type,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        quantity: trade.quantity,
        exchange: trade.exchange,
        reason: trade.reason,
        entryDate: trade.entryDate,
        exitDate: trade.exitDate,
        realizedPnL: pnl,
        holdingDuration: holdingDays > 0 ? `${holdingDays}d ${holdingHours}h` : `${holdingHours}h`,
        holdingDays,
      };
    });

    console.log(`[trades/closed] ✅ ${closedTrades.length} closed trades for user: ${userId}`);

    return res.status(200).json({
      trades: closedTrades,
      totals: {
        realizedPnL: parseFloat(totalRealizedPnL.toFixed(2)),
        totalTrades: closedTrades.length,
        winRate: closedTrades.length > 0 ? parseFloat(((wins / closedTrades.length) * 100).toFixed(1)) : 0,
        wins,
        losses: closedTrades.length - wins,
      },
    });
  } catch (error) {
    console.error('[trades/closed] ❌ Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch closed trades', details: error.message });
  }
}
