import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// proxy.ts (до Next.js 16 — middleware.ts) виконується до маршрутизації, на edge.
// Його завдання тут — лише перенаправити неавтентифікованих на сторінку входу.
//
// Це НЕ межа безпеки: наявність cookie тут не доводить, що токен дійсний, а заголовок
// запиту може дозволити оминути proxy. Тому реальну перевірку сесії й прав роблять
// у самих обробниках і на рівні доступу до даних, а не покладаються на цей файл.
export function proxy(req: NextRequest) {
  const hasCookie = req.cookies.has("accessToken");
  const path = req.nextUrl.pathname;
  const isProtected = path.startsWith("/stations");
  if (isProtected && !hasCookie) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/stations/:path*"] };
