// lib/connectToDB.ts

// import dns from "dns"

import mongoose from "mongoose"

// dns.setServers(["8.8.8.8", "1.1.1.1"])

const connection: { isConnected?: number } = {};

export const connectToDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }
    const db = await mongoose.connect(uri);
    connection.isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB!");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to connect to MongoDB:", message);
    throw new Error(message || "Failed to connect to MongoDB");
  }
};