// utils/connectDB.ts
import mongoose from "mongoose";

interface ConnectionObject {
  isConnected: number | boolean;
}

const connection: ConnectionObject = { isConnected: false };

async function connectDB(): Promise<void> {
  if (connection.isConnected) {
    // Bereits verbunden, nichts tun
    return;
  }

  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState;
    if (connection.isConnected === 1) {
      // Verbindung ist bereits da, nutze diese
      return;
    }
    // Trenne die bestehende Verbindung
    await mongoose.disconnect();
  }

  // Verbinde mit MongoDB
  const mongoURI = process.env.MONGODB_URI as string;
  if (!mongoURI) {
    throw new Error("MONGODB_URI Umgebungsvariable ist nicht gesetzt!");
  }

  const db = await mongoose.connect(mongoURI, {
    // Diese Options sind für MongoDB 6.0 und neuere Versionen
  });

  connection.isConnected = db.connections[0].readyState;
}

export default connectDB;
