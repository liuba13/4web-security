// Фабрика моделей, що працює з обома драйверами.
// Для sqlite повертає Mongoose-подібну модель із db.sqlite.js.
// Для mongo створює справжню mongoose-модель за переданою схемою.
import { DB_DRIVER, sqliteModel } from "../lib/db.js";

export async function defineModel(name, schemaDefinition) {
  if (DB_DRIVER === "sqlite") {
    return sqliteModel(name);
  }
  const { mongoose } = await import("../lib/db.mongo.js");
  if (mongoose.models[name]) return mongoose.models[name];
  const schema = new mongoose.Schema(schemaDefinition, { timestamps: true });
  return mongoose.model(name, schema);
}
