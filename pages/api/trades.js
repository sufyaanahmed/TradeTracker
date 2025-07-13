// This is a serverless function that will run on Vercel
// Environment variables for this function should NOT have NEXT_PUBLIC_ prefix
import { MongoClient } from 'mongodb';

// Simple authentication middleware for Next.js API routes
async function authenticate(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return { error: 'Unauthorized: No token provided', status: 401 };
  }
  
  const token = authHeader.split(' ')[1];

  if (!token) {
    return { error: 'Unauthorized: Invalid token format', status: 401 };
  }

  try {
    // Parse Firebase JWT token to extract user_id
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    // Firebase tokens use 'user_id' field
    const uid = payload.user_id || payload.sub || payload.uid;
    
    if (!uid) {
      return { error: 'Unauthorized: Invalid token - no user_id', status: 401 };
    }
    
    return { uid };
  } catch (error) {
    console.error('Error parsing token:', error);
    return { error: 'Unauthorized: Invalid token format', status: 401 };
  }
}

export default async function handler(req, res) {
  // Authenticate the request
  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.status).json({ error: authResult.error });
  }
  
  const userId = authResult.uid;

  // These environment variables are for server-side only
  const mongoUri = process.env.MONGO_URL;

  if (req.method === 'GET') {
    // Handle GET request - fetch trades for authenticated user (GET /trades)
    try {
      if (!mongoUri) {
        console.error('MONGO_URL environment variable is not set');
        return res.status(500).json({ error: 'Database connection not configured' });
      }

      if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
        console.error('Invalid MongoDB URI format:', mongoUri);
        return res.status(500).json({ error: 'Invalid database connection string format' });
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
      const trades = await db.collection('trades').find({ userId }).sort({ date: -1 }).toArray();
      
      await client.close();
      
      // Return trades in the same format as original backend
      res.status(200).json(trades);
    } catch (error) {
      console.error('Error fetching trades:', error);
      res.status(500).json({ 
        message: 'Internal Server Error', 
        error: error.message,
        details: 'Database connection failed'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 