// lib/dbConnect.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI; // Stelle sicher, dass diese Variable in deiner .env.local definiert ist

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
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => {
        return mongoose;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
