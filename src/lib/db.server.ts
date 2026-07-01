import mongoose from "mongoose";

import { getServerConfig } from "@/lib/config.server";

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn: Promise<typeof mongoose> | undefined;
}

/**
 * MongoDB via Mongoose requires a Node.js runtime (not Cloudflare Workers edge).
 * Use `nitro: { preset: 'node-server' }` or deploy to a Node host for production.
 */
export async function connectDB() {
  const { mongodbUri } = getServerConfig();

  if (!mongodbUri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env and configure your MongoDB connection.",
    );
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!global.__mongooseConn) {
    global.__mongooseConn = mongoose
      .connect(mongodbUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10_000,
        // Windows dev only — on Linux (Vercel) this can hurt Atlas connectivity.
        ...(process.platform === "win32" ? { autoSelectFamily: false } : {}),
      })
      .catch((err) => {
        global.__mongooseConn = undefined;
        throw err;
      });
  }

  try {
    await global.__mongooseConn;
  } catch (err) {
    global.__mongooseConn = undefined;
    throw err;
  }

  return mongoose;
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    global.__mongooseConn = undefined;
  }
}
