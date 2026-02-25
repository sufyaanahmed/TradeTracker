// GET /api/research/trade-ideas
// Generate swing trade ideas
import { authenticate } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/db';
import { generateSeedSectors } from '../../../lib/schemas/sector-data';
import { generateSampleCompany } from '../../../lib/schemas/company-fundamentals';
import { analyzeCombinedMacro } from '../../../lib/services/macro-analysis';
import { generateSeedMacro } from '../../../lib/schemas/macro-data';
import { generateTradeIdeas } from '../../../lib/services/trade-idea-engine';

// Universe of stocks to scan for ideas
const STOCK_UNIVERSE = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
  'WIPRO', 'TATAMOTORS', 'SUNPHARMA', 'TATASTEEL', 'HINDALCO',
  'M&M', 'MARUTI', 'DRREDDY', 'CIPLA', 'SBIN',
  'ADANIPORTS', 'LT', 'ITC', 'ONGC', 'DLF',
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const auth = await authenticate(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  try {
    const { db } = await connectToDatabase();

    // 1. Get all company fundamentals
    const companiesCol = db.collection('company_fundamentals');
    let companies = await companiesCol.find({
      symbol: { $in: STOCK_UNIVERSE },
    }).toArray();

    // Seed missing companies
    if (companies.length < STOCK_UNIVERSE.length) {
      const existingSymbols = new Set(companies.map(c => c.symbol));
      const missingSymbols = STOCK_UNIVERSE.filter(s => !existingSymbols.has(s));

      if (missingSymbols.length > 0) {
        const newCompanies = missingSymbols.map(s => generateSampleCompany(s));
        await companiesCol.insertMany(newCompanies);
        companies = [...companies, ...newCompanies];
      }
    }

    // 2. Get sector data
    const sectorsCol = db.collection('sector_data');
    let sectors = await sectorsCol.find({}).toArray();
    if (sectors.length === 0) {
      sectors = generateSeedSectors();
      await sectorsCol.insertMany(sectors);
    }

    // 3. Get macro data
    const macroCol = db.collection('macro_data');
    let macro = await macroCol.findOne({ type: 'latest' });
    if (!macro) {
      macro = generateSeedMacro();
      await macroCol.insertOne(macro);
    }
    const macroSentiment = analyzeCombinedMacro(macro);

    // 4. Get user's active trades
    const activeTrades = await db.collection('trades').find({
      userId: auth.uid,
      status: 'ACTIVE',
    }).toArray();

    // Map active trades to include sector info
    const activeTradesWithSector = activeTrades.map(t => {
      const companyData = companies.find(c => c.symbol === t.symbol);
      return {
        ...t,
        sector: companyData?.sector || 'Unknown',
      };
    });

    // 5. Generate ideas
    const ideas = generateTradeIdeas({
      companies,
      sectors,
      macroSentiment,
      activeTrades: activeTradesWithSector,
    });

    return res.status(200).json({
      ideas,
      count: ideas.length,
      macroSentiment: macroSentiment.combined,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[research/trade-ideas] Error:', error.message);
    return res.status(500).json({ error: 'Failed to generate trade ideas', details: error.message });
  }
}
