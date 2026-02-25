// GET /api/research/company/[symbol]
// Fetch company fundamental data
import { authenticate } from '../../../../lib/auth';
import { connectToDatabase } from '../../../../lib/db';
import { getCompanyFundamentalsCollection, generateSampleCompany } from '../../../../lib/schemas/company-fundamentals';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const auth = await authenticate(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  const { symbol } = req.query;
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const col = db.collection('company_fundamentals');

    // Try to find in DB first
    let company = await col.findOne({ symbol: symbol.toUpperCase() });

    if (!company) {
      // Generate seed data and upsert
      company = generateSampleCompany(symbol);
      await col.updateOne(
        { symbol: company.symbol },
        { $set: company },
        { upsert: true }
      );
      console.log(`[research/company] Seeded data for ${symbol}`);
    }

    // Remove MongoDB _id for clean response
    const { _id, ...data } = company;

    return res.status(200).json(data);
  } catch (error) {
    console.error('[research/company] Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch company data', details: error.message });
  }
}
