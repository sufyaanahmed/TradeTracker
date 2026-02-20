// Cache clearing utility for portfolio data
// Called when trades are added/modified to ensure fresh data

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear the cache by removing the file
    const cachePath = '/tmp/portfolio-cache.json';
    if (require('fs').existsSync(cachePath)) {
      require('fs').unlinkSync(cachePath);
    }
    
    res.status(200).json({ success: true, message: 'Cache cleared' });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
}