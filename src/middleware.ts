import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimit } from "@/lib/rate-limit";

// Routes that require authentication
const AUTH_ROUTES = [
  "/dashboard",
  "/patients",
  "/audit",
  "/repertory",
  "/lgpd",
  "/settings",
  "/agenda",
  "/financial",
  "/ai",
  "/onboarding",
];

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Rate limiting for API routes ---
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(req);

    // Stricter limit for auth endpoints (5 req/min)
    if (pathname.startsWith("/api/auth/")) {
      const result = rateLimit(`auth:${ip}`, 5, 60_000);
      if (!result.success) {
        return NextResponse.json(
          { error: "Muitas tentativas. Tente novamente em 1 minuto." },
          {
            status: 429,
            headers: {
              "Retry-After": "60",
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }
    } else {
      // General API limit (30 req/min)
      const result = rateLimit(`api:${ip}`, 30, 60_000);
      if (!result.success) {
        return NextResponse.json(
          { error: "Limite de requisições excedido. Tente novamente em breve." },
          {
            status: 429,
            headers: {
              "Retry-After": "60",
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }
    }

    return NextResponse.next();
  }

  // --- Auth protection for app routes ---
  const isProtected = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/patients/:path*",
    "/audit/:path*",
    "/repertory/:path*",
    "/lgpd/:path*",
    "/settings/:path*",
    "/agenda/:path*",
    "/financial/:path*",
    "/ai/:path*",
    "/onboarding/:path*",
  ],
};
