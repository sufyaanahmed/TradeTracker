// Serverless function for creating trades (POST /trade)
// Security: userId extracted from verified JWT token, never from request body
import { authenticate } from '../../lib/auth';
import { connectToDatabase } from '../../lib/db';

// Clear portfolio cache when trades are modified
function clearPortfolioCache(userId) {
  try {
    // This will be picked up by the evaluate-trade-intent cache system
    const { portfolioCache } = require('./evaluate-trade-intent');
    if (portfolioCache && portfolioCache.delete) {
      portfolioCache.delete(userId);
      console.log('[trade] Cache cleared for user:', userId);
    }
  } catch (error) {
    // Cache clearing is not critical, just log
    console.log('[trade] Cache clear not available:', error.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Authenticate and extract userId from token
  const auth = await authenticate(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }
  const userId = auth.uid;

  try {
    const { name, date, reason, pl, exchange } = req.body;

    if (!name || !date || !reason || pl === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, date, reason, or pl' });
    }

    const { db } = await connectToDatabase();
    const trade = await db.collection('trades').insertOne({
      name: name.toUpperCase(),
      date,
      reason,
      pl: parseFloat(pl),
      exchange: exchange || 'NASDAQ',
      userId, // Always from verified JWT
      createdAt: new Date().toISOString()
    });

    console.log('[trade] ✅ Trade added for user:', userId, '| Symbol:', name);
    
    // Clear portfolio cache to ensure fresh data for next analysis
    clearPortfolioCache(userId);
    
    res.status(201).json({ insertedId: trade.insertedId });
  } catch (error) {
    console.error('[trade] ❌ Error:', error.message);
    res.status(500).json({
      error: 'Database connection failed. Check MongoDB Atlas connection.',
      details: error.message,
      code: error.code
    });
  }
} 