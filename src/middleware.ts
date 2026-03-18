import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimit } from "@/lib/rate-limit";
import { isSuperAdmin } from "@/lib/superadmin";

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
  "/admin",
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

  // Skip internal Next.js routes (HMR, static assets)
  if (pathname.startsWith("/_next/") || pathname.startsWith("/__nextjs")) {
    return NextResponse.next();
  }

  // --- Rate limiting for API routes ---
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(req);

    // Stricter limit for auth sign-in/callback (10 req/min)
    // Internal NextAuth routes (session, csrf, providers) use the general API limit
    const isAuthSignIn =
      pathname.startsWith("/api/auth/signin") ||
      pathname.startsWith("/api/auth/callback");
    if (isAuthSignIn) {
      const result = rateLimit(`auth:${ip}`, 10, 60_000);
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
      // General API limit (120 req/min)
      const result = rateLimit(`api:${ip}`, 120, 60_000);
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

    // Public API routes that don't require authentication
    const isPublicApi =
      pathname.startsWith("/api/auth/") ||
      pathname.startsWith("/api/billing/webhook") ||
      pathname.startsWith("/api/invites/");

    if (!isPublicApi) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

      // Block unauthenticated access to all non-public API routes
      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Block data API routes for canceled/past_due subscriptions
      // Allow: billing routes (so user can reactivate)
      const isBillingApi = pathname.startsWith("/api/billing/");
      if (!isBillingApi) {
        const subStatus = (token.subscriptionStatus as string) ?? "trialing";
        if (subStatus === "canceled" || subStatus === "past_due") {
          return NextResponse.json(
            { error: "Assinatura inativa. Acesse configurações de faturamento para reativar." },
            { status: 403 }
          );
        }
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

    // Superadmin routes — check email, skip subscription check
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      if (!isSuperAdmin(token.email as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // Redirect to onboarding if clinic not configured (first access)
    const isOnboardingPage = pathname === "/onboarding";
    if (!isOnboardingPage && token.needsOnboarding) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Allow access to billing page even with expired trial (so user can upgrade)
    const isBillingPage = pathname.startsWith("/settings/billing");
    if (!isBillingPage) {
      const subStatus = (token.subscriptionStatus as string) ?? "trialing";
      if (subStatus === "canceled" || subStatus === "past_due") {
        return NextResponse.redirect(new URL("/trial-expired", req.url));
      }
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
    "/admin/:path*",
  ],
};
