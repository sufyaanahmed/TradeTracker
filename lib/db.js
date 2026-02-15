// MongoDB Connection Module - Robust connection with caching
import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

const MONGO_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  maxIdleTimeMS: 30000,
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
};

export async function connectToDatabase() {
  // Return cached connection if alive
  if (cachedClient && cachedDb) {
    try {
      await cachedDb.admin().ping();
      return { client: cachedClient, db: cachedDb };
    } catch (e) {
      console.log('[db] Cached connection stale, reconnecting...');
      cachedClient = null;
      cachedDb = null;
    }
  }

  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error('MONGO_URL environment variable is not set');
  }

  console.log('[db] Connecting to MongoDB...');
  const client = new MongoClient(uri, MONGO_OPTIONS);
  await client.connect();

  const db = client.db(); // uses database from connection string
  await db.admin().ping();
  console.log('[db] ✅ Connected! Database:', db.databaseName);

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

export async function getTradesCollection() {
  const { db } = await connectToDatabase();
  return db.collection('trades');
}
