import mongoose from 'mongoose';

export async function closeDB() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('[INFO] MongoDB connection closed gracefully.');
    }
  } catch (err) {
    console.error('[ERROR] Error while closing MongoDB connection:', err.message);
  }
}

export default async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('Missing MongoDB connection string. Set MONGODB_URI or MONGO_URI');
    }
    const conn = await mongoose.connect(mongoUri);
    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

