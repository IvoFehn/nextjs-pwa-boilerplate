import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Bitte setze MONGODB_URI in .env.local");
}

/** Globale Variable, um Wiederverbindungen in der Entwicklungsumgebung zu vermeiden */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // Remove deprecated options
      bufferCommands: false, // Disable mongoose buffering
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("MongoDB connected successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise on connection failure
    throw error;
  }
}

export default dbConnect;
