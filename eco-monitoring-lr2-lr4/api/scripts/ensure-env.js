// Кросплатформне створення .env із .env.example, якщо .env ще немає.
// Запускається автоматично перед `npm run dev` і `npm run seed`
// (Windows cmd / PowerShell / Linux / macOS однаково).
import { existsSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = join(root, ".env");
if (!existsSync(env)) {
  copyFileSync(join(root, ".env.example"), env);
  console.log("[env] створено .env з .env.example");
}
