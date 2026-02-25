// GET /api/research/company/[symbol]/analysis
// Compute full fundamental analysis for a company
import { authenticate } from '../../../../../lib/auth';
import { connectToDatabase } from '../../../../../lib/db';
import { generateSampleCompany } from '../../../../../lib/schemas/company-fundamentals';
import { analyzeCompany } from '../../../../../lib/services/company-analysis';

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

    let company = await col.findOne({ symbol: symbol.toUpperCase() });

    if (!company) {
      company = generateSampleCompany(symbol);
      await col.updateOne(
        { symbol: company.symbol },
        { $set: company },
        { upsert: true }
      );
    }

    // Run analysis
    const analysis = analyzeCompany(company);

    // Include historical data for charts
    analysis.historicalData = {
      revenueHistory: company.revenueHistory || [],
      profitHistory: company.profitHistory || [],
      marginHistory: company.marginHistory || [],
    };

    return res.status(200).json(analysis);
  } catch (error) {
    console.error('[research/company/analysis] Error:', error.message);
    return res.status(500).json({ error: 'Failed to analyze company', details: error.message });
  }
}
