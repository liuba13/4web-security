import { createApp } from "./app.js";
import { connectDB } from "./lib/db.js";
import { config } from "./config.js";
import { User } from "./models/index.js";
import { seedDatabase } from "./lib/seedData.js";

await connectDB();

// Порожня база наповнюється автоматично. 
// Це потрібно для тимчасового MongoDB у пам'яті:
// він існує лише поки працює процес, 
// тож дані з окремого `npm run seed` до сервера не доживають.
if ((await User.countDocuments({})) === 0) {
  const n = await seedDatabase();
  console.log(`[seed] порожню базу наповнено: користувачів ${n.users}, станцій ${n.stations}`);
}

const app = createApp();
app.listen(config.port, () => {
  console.log(`[api] http://localhost:${config.port}  (DB_DRIVER=${process.env.DB_DRIVER || "mongo"})`);
});
