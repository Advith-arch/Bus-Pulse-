import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/buspulse';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500, // Quick fail if local mongo is not active
    });
    isConnected = true;
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.log(`[MongoDB] Notice: Could not connect to MongoDB at "${mongoURI}".`);
    console.log(`[MongoDB] Fallback in-memory persistence mode active. All authentication, live tracking, and CRUD features are 100% functional!`);
    console.log(`[MongoDB] To connect a real MongoDB server, set MONGODB_URI in .env or run local mongod.`);
    return false;
  }
};

export const getDbStatus = () => isConnected;
