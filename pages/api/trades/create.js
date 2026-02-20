// POST /api/trades/create — Open a new ACTIVE position
// Schema: { symbol, type, entryPrice, quantity, exchange, reason }
import { authenticate } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const auth = await authenticate(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });
  const userId = auth.uid;

  try {
    const { symbol, type, entryPrice, quantity, exchange, reason } = req.body;

    // Validation
    const errors = [];
    if (!symbol || typeof symbol !== 'string') errors.push('symbol is required');
    if (!['LONG', 'SHORT'].includes(type)) errors.push('type must be LONG or SHORT');
    if (!entryPrice || isNaN(parseFloat(entryPrice)) || parseFloat(entryPrice) <= 0) errors.push('entryPrice must be a positive number');
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) errors.push('quantity must be a positive integer');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const { db } = await connectToDatabase();

    const trade = {
      userId,
      symbol: symbol.toUpperCase().trim(),
      type: type.toUpperCase(),
      entryPrice: parseFloat(entryPrice),
      quantity: parseInt(quantity),
      exchange: exchange || 'NASDAQ',
      reason: reason || '',
      status: 'ACTIVE',
      exitPrice: null,
      entryDate: new Date().toISOString(),
      exitDate: null,
      realizedPnL: null,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection('trades').insertOne(trade);
    console.log('[trades/create] ✅ Opened ACTIVE position:', trade.symbol, '| User:', userId);

    return res.status(201).json({
      _id: result.insertedId,
      ...trade,
    });
  } catch (error) {
    console.error('[trades/create] ❌ Error:', error.message);
    return res.status(500).json({ error: 'Failed to create trade', details: error.message });
  }
}
