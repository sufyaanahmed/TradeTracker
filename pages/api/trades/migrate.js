// POST /api/trades/migrate — One-time migration of legacy trades to new schema
// Converts old { name, date, pl, reason, exchange } → new { symbol, status: CLOSED, ... }
import { authenticate } from '../../../lib/auth';
import { connectToDatabase, ensureIndexes } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const auth = await authenticate(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });
  const userId = auth.uid;

  try {
    const { db } = await connectToDatabase();

    // Ensure indexes first
    await ensureIndexes();

    // Find legacy trades (no status field)
    const legacyTrades = await db
      .collection('trades')
      .find({ userId, status: { $exists: false } })
      .toArray();

    if (legacyTrades.length === 0) {
      return res.status(200).json({ message: 'No legacy trades to migrate', migrated: 0 });
    }

    let migrated = 0;
    const bulkOps = legacyTrades.map((trade) => {
      const pl = trade.pl || 0;
      return {
        updateOne: {
          filter: { _id: trade._id },
          update: {
            $set: {
              symbol: (trade.name || trade.symbol || 'UNKNOWN').toUpperCase(),
              type: pl >= 0 ? 'LONG' : 'LONG', // Default to LONG for legacy
              entryPrice: Math.abs(pl) > 0 ? 100 : 100, // placeholder entry
              exitPrice: Math.abs(pl) > 0 ? 100 + pl : 100,
              quantity: 1,
              status: 'CLOSED',
              entryDate: trade.date || trade.createdAt || new Date().toISOString(),
              exitDate: trade.date || trade.createdAt || new Date().toISOString(),
              realizedPnL: pl,
              exchange: trade.exchange || 'NASDAQ',
              reason: trade.reason || '',
            },
            $unset: {
              name: '',  // remove legacy fields
            }
          },
        },
      };
    });

    const result = await db.collection('trades').bulkWrite(bulkOps);
    migrated = result.modifiedCount;

    console.log(`[migrate] ✅ Migrated ${migrated} legacy trades for user: ${userId}`);

    return res.status(200).json({
      message: `Successfully migrated ${migrated} trades to new schema`,
      migrated,
      total: legacyTrades.length,
    });
  } catch (error) {
    console.error('[migrate] ❌ Error:', error.message);
    return res.status(500).json({ error: 'Migration failed', details: error.message });
  }
}
