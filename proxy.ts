// Next.js 16: "proxy" substitui o antigo "middleware".
// Regra: sem login, só "/" (home), "/login" e "/redefinir-senha" são acessíveis.
// Qualquer outra rota redireciona para /login.
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/session";

const PUBLIC_PAGES = new Set(["/", "/login", "/redefinir-senha"]);

export async function proxy(req: NextRequest) {
  const raw = req.nextUrl.pathname;
  const pathname = raw.length > 1 ? raw.replace(/\/$/, "") : raw;
  const authed = (await verifySession(req.cookies.get(COOKIE_NAME)?.value)) !== null;

  // Rotas de autenticação são sempre abertas
  if (pathname.startsWith("/api/auth/")) return NextResponse.next();

  // Demais APIs exigem login
  if (pathname.startsWith("/api/")) {
    if (!authed) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    return NextResponse.next();
  }

  // Já logado não precisa ver o login
  if (authed && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (PUBLIC_PAGES.has(pathname) || authed) return NextResponse.next();

  const url = new URL("/login", req.url);
  url.searchParams.set("next", pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  // Ignora arquivos internos do Next e arquivos estáticos da pasta public
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|webp|svg|ico|gif|mp3|wav|ogg)$).*)"],
};
