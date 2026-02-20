// POST /api/trades/exit — Close an ACTIVE position
// Body: { tradeId, exitPrice? }
// If exitPrice not provided, fetches current market price
import { authenticate } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/db';
import { getCurrentPrice, computeUnrealisedPnL } from '../../../lib/price-service';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const auth = await authenticate(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });
  const userId = auth.uid;

  try {
    const { tradeId, exitPrice: manualExitPrice } = req.body;

    if (!tradeId) {
      return res.status(400).json({ error: 'tradeId is required' });
    }

    const { db } = await connectToDatabase();

    // Fetch the trade — ensure it belongs to the user and is ACTIVE
    let objectId;
    try {
      objectId = new ObjectId(tradeId);
    } catch {
      return res.status(400).json({ error: 'Invalid tradeId format' });
    }

    const trade = await db.collection('trades').findOne({
      _id: objectId,
      userId,
      status: 'ACTIVE',
    });

    if (!trade) {
      return res.status(404).json({ error: 'Active trade not found or does not belong to you' });
    }

    // Determine exit price
    let exitPrice;
    if (manualExitPrice && !isNaN(parseFloat(manualExitPrice)) && parseFloat(manualExitPrice) > 0) {
      exitPrice = parseFloat(manualExitPrice);
    } else {
      const priceData = await getCurrentPrice(trade.symbol, trade.entryPrice);
      exitPrice = priceData.price;
    }

    // Compute realized P&L
    const realizedPnL = computeUnrealisedPnL(trade.type, trade.entryPrice, exitPrice, trade.quantity);
    const exitDate = new Date().toISOString();

    // Update the trade in DB
    await db.collection('trades').updateOne(
      { _id: objectId },
      {
        $set: {
          status: 'CLOSED',
          exitPrice,
          exitDate,
          realizedPnL,
          // Also store legacy pl field for backward compat with portfolio-metrics
          pl: realizedPnL,
        },
      }
    );

    console.log(`[trades/exit] ✅ Closed ${trade.symbol} | P&L: ${realizedPnL >= 0 ? '+' : ''}${realizedPnL} | User: ${userId}`);

    return res.status(200).json({
      _id: trade._id,
      symbol: trade.symbol,
      type: trade.type,
      entryPrice: trade.entryPrice,
      exitPrice,
      quantity: trade.quantity,
      realizedPnL,
      entryDate: trade.entryDate,
      exitDate,
      status: 'CLOSED',
    });
  } catch (error) {
    console.error('[trades/exit] ❌ Error:', error.message);
    return res.status(500).json({ error: 'Failed to close trade', details: error.message });
  }
}
