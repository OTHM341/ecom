import { MongoClient, Db, ServerApiVersion } from 'mongodb';

// URI for connecting to MongoDB
// Use a local MongoDB instance by default, which falls back more gracefully
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/oanshop';
const dbName = process.env.MONGODB_DB_NAME || 'oanshop';

// Connection variables
let client: MongoClient | null = null;
let db: Db | null = null;
let connectionFailed = false;

// Initialize MongoDB connection
export async function connectToMongoDB(): Promise<Db | null> {
  // If we've already tried and failed, don't try again
  if (connectionFailed) {
    console.log('Using in-memory storage (previous MongoDB connection failed)');
    return null;
  }
  
  // If already connected, return the existing connection
  if (db) return db;

  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  };

  try {
    console.log('Attempting to connect to MongoDB...');
    client = new MongoClient(uri, options);
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    db = client.db(dbName);
    
    // Test the connection by accessing a collection
    await db.collection('users').findOne({});
    
    return db;
  } catch (error) {
    connectionFailed = true;
    console.error('Error connecting to MongoDB:', error);
    console.log('Falling back to in-memory storage');
    
    // Clean up any partial connection
    try {
      if (client) await client.close();
    } catch (e) {
      // Ignore errors during cleanup
    }
    
    client = null;
    db = null;
    
    return null;
  }
}

// Close MongoDB connection
export async function closeMongoDBConnection(): Promise<void> {
  if (client) {
    try {
      await client.close();
      console.log('MongoDB connection closed');
      client = null;
      db = null;
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }
}

// Get MongoDB database instance
export function getDb(): Db | null {
  return db;
}

// Check if MongoDB connection is available
export function isMongoDBConnected(): boolean {
  return db !== null && client !== null && !connectionFailed;
}