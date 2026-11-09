// Якщо MONGO_URL не задано — піднімає тимчасовий MongoDB у пам'яті
// (mongodb-memory-server): без Docker і без окремо встановленого сервера.
import mongoose from "mongoose";

let memoryServer = null;

export async function connectDB() {
  let uri = process.env.MONGO_URL;
  if (!uri) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create({ instance: { dbName: "ecomonitoring" } });
    uri = memoryServer.getUri();
    console.log("[db] піднято тимчасовий MongoDB у пам'яті");
  }
  await mongoose.connect(uri, { dbName: "ecomonitoring" });
  console.log("[db] MongoDB підключено");
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

export const rawSqlite = null;

export { mongoose };
