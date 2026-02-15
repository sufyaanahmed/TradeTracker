// GET /api/trades - Fetch authenticated user's trades
// Security: userId extracted from verified JWT token
import { authenticate } from '../../lib/auth';
import { connectToDatabase } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const auth = await authenticate(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }
  const userId = auth.uid;

  try {
    const { db } = await connectToDatabase();
    const trades = await db.collection('trades').find({ userId }).sort({ date: -1 }).toArray();
    console.log('[trades] ✅ Found', trades.length, 'trades for user:', userId);
    res.status(200).json(trades);
  } catch (error) {
    console.error('[trades] ❌ Error:', error.message);
    res.status(500).json({
      error: 'Database connection failed',
      details: error.message
    });
  }
} 