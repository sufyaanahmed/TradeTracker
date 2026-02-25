// GET /api/research/macro
// Fetch macro economic data with analysis
import { authenticate } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/db';
import { generateSeedMacro } from '../../../lib/schemas/macro-data';
import { analyzeUSMacro, analyzeIndiaMacro, analyzeCombinedMacro } from '../../../lib/services/macro-analysis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const auth = await authenticate(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  try {
    const { db } = await connectToDatabase();
    const col = db.collection('macro_data');

    let macro = await col.findOne({ type: 'latest' });

    // Seed if empty
    if (!macro) {
      macro = generateSeedMacro();
      await col.insertOne(macro);
      console.log('[research/macro] Seeded macro data');
    }

    const { _id, ...macroData } = macro;

    // Run analysis
    const analysis = analyzeCombinedMacro(macroData);

    return res.status(200).json({
      data: macroData,
      analysis,
    });
  } catch (error) {
    console.error('[research/macro] Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch macro data', details: error.message });
  }
}
