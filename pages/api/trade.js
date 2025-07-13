// This is a serverless function for creating trades (POST /trade)
import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  const mongoUri = process.env.MONGO_URL;

  if (req.method === 'POST') {
    try {
      const { name, date, reason, pl, exchange, userId } = req.body;
      
      // Validate required fields including userId
      if (!name || !date || !reason || pl === undefined) {
        return res.status(400).json({ error: 'Missing required fields: name, date, reason, or pl' });
      }
      
      // Validate userId is present and not null/empty
      if (!userId) {
        return res.status(400).json({ error: 'Missing required field: userId' });
      }

      if (!mongoUri) {
        console.error('MONGO_URL environment variable is not set');
        return res.status(500).json({ error: 'Database connection not configured' });
      }
      
      // MongoDB connection options optimized for serverless
      const client = new MongoClient(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        maxIdleTimeMS: 30000,
      });

      await client.connect();
      const db = client.db(); // Use default database from connection string
      const trade = await db.collection('trades').insertOne({
        name,
        date,
        reason,
        pl: parseFloat(pl),
        exchange,
        userId: userId // Always use the userId from request body
      });
      await client.close();
      
      res.status(201).json(trade);
    } catch (error) {
      console.error('Error adding trade:', error);
      console.error('MongoDB URI exists:', !!mongoUri);
      res.status(500).json({ 
        error: 'Failed to add trade', 
        details: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 