// Перевірка цілісності seed-даних. Запуск: npm run seed
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "data");
for (const f of ["stations.json", "measurements.json", "users.json"]) {
  const arr = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
  console.log(`${f}: OK, records = ${arr.length}`);
}
