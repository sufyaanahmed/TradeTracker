// GET /api/trades/active — Fetch ACTIVE positions with live prices + unrealised P&L
import { authenticate } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/db';
import { getBatchPrices, computeUnrealisedPnL } from '../../../lib/price-service';

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
      .find({ userId, status: 'ACTIVE' })
      .sort({ createdAt: -1 })
      .toArray();

    if (trades.length === 0) {
      return res.status(200).json({ positions: [], totals: { unrealizedPnL: 0, totalValue: 0 } });
    }

    // Batch fetch current prices
    const items = trades.map((t) => ({ symbol: t.symbol, entryPrice: t.entryPrice }));
    const priceMap = await getBatchPrices(items);

    // Enrich each trade with live data
    let totalUnrealized = 0;
    let totalValue = 0;

    const positions = trades.map((trade) => {
      const priceData = priceMap.get(trade.symbol) || { price: trade.entryPrice, change: 0, changePct: 0, source: 'fallback' };
      const unrealizedPnL = computeUnrealisedPnL(trade.type, trade.entryPrice, priceData.price, trade.quantity);
      const marketValue = priceData.price * trade.quantity;

      totalUnrealized += unrealizedPnL;
      totalValue += marketValue;

      return {
        _id: trade._id,
        symbol: trade.symbol,
        type: trade.type,
        entryPrice: trade.entryPrice,
        quantity: trade.quantity,
        exchange: trade.exchange,
        reason: trade.reason,
        entryDate: trade.entryDate,
        currentPrice: priceData.price,
        priceChange: priceData.change,
        priceChangePct: priceData.changePct,
        priceSource: priceData.source,
        unrealizedPnL,
        marketValue,
      };
    });

    console.log(`[trades/active] ✅ ${positions.length} active positions for user: ${userId}`);

    return res.status(200).json({
      positions,
      totals: {
        unrealizedPnL: parseFloat(totalUnrealized.toFixed(2)),
        totalValue: parseFloat(totalValue.toFixed(2)),
        positionCount: positions.length,
      },
    });
  } catch (error) {
    console.error('[trades/active] ❌ Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch active positions', details: error.message });
  }
}
