// GET /api/research/sectors
// Fetch all sector data with analysis
import { authenticate } from '../../../../lib/auth';
import { connectToDatabase } from '../../../../lib/db';
import { generateSeedSectors } from '../../../../lib/schemas/sector-data';
import { analyzeSectorStrength, detectSectorRotation, buildSectorHeatmap } from '../../../../lib/services/sector-analysis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const auth = await authenticate(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  try {
    const { db } = await connectToDatabase();
    const col = db.collection('sector_data');

    let sectors = await col.find({}).toArray();

    // Seed if empty
    if (sectors.length === 0) {
      const seedSectors = generateSeedSectors();
      await col.insertMany(seedSectors);
      sectors = seedSectors;
      console.log('[research/sectors] Seeded sector data');
    }

    // Clean _id
    const cleanSectors = sectors.map(({ _id, ...rest }) => rest);

    // Run analysis
    const rankedSectors = analyzeSectorStrength(cleanSectors);
    const rotation = detectSectorRotation(cleanSectors);
    const heatmap = buildSectorHeatmap(cleanSectors);

    return res.status(200).json({
      sectors: rankedSectors,
      rotation,
      heatmap,
      count: rankedSectors.length,
    });
  } catch (error) {
    console.error('[research/sectors] Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch sector data', details: error.message });
  }
}
