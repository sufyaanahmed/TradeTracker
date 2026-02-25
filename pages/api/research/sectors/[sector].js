// GET /api/research/sectors/[sector]
// Fetch specific sector data with details
import { authenticate } from '../../../../lib/auth';
import { connectToDatabase } from '../../../../lib/db';
import { generateSeedSectors } from '../../../../lib/schemas/sector-data';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const auth = await authenticate(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  const { sector: sectorParam } = req.query;
  if (!sectorParam) {
    return res.status(400).json({ error: 'Sector name is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const col = db.collection('sector_data');

    // Normalize sector name (URL-encoded spaces, case-insensitive)
    const sectorName = decodeURIComponent(sectorParam).replace(/-/g, ' ');

    let sectorData = await col.findOne({
      sectorName: { $regex: new RegExp(`^${sectorName}$`, 'i') },
    });

    // Seed if not found
    if (!sectorData) {
      const allSectors = await col.find({}).toArray();
      if (allSectors.length === 0) {
        const seedSectors = generateSeedSectors();
        await col.insertMany(seedSectors);
        sectorData = seedSectors.find(s =>
          s.sectorName.toLowerCase() === sectorName.toLowerCase()
        );
      }
    }

    if (!sectorData) {
      return res.status(404).json({ error: `Sector "${sectorName}" not found` });
    }

    const { _id, ...data } = sectorData;
    return res.status(200).json(data);
  } catch (error) {
    console.error('[research/sectors/sector] Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch sector data', details: error.message });
  }
}
