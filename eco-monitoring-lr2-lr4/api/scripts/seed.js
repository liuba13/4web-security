// Наповнення бази тестовими даними (з очищенням). Запуск: npm run seed
import { connectDB, disconnectDB } from "../src/lib/db.js";
import { seedDatabase } from "../src/lib/seedData.js";

async function run() {
  await connectDB();
  const n = await seedDatabase();
  console.log(`[seed] користувачів: ${n.users}, станцій: ${n.stations}, вимірювань: ${n.measurements}`);
  await disconnectDB();
}

run().catch(e => { console.error(e); process.exit(1); });
