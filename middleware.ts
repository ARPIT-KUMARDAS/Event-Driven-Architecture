import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Define public and admin routes
const publicRoutes = [
  "/",
  "/api/webhook/register",
  "/sign-in",
  "/sign-up"
];

// Protect all /admin routes
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
// Protect all dashboard routes
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
// Public route matcher
const isPublicRoute = createRouteMatcher(publicRoutes);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  const pathname = req.nextUrl.pathname;
  type SessionClaimsWithRole = typeof sessionClaims & { publicMetadata?: { role?: string } };
  const claims = sessionClaims as SessionClaimsWithRole;
  const role = claims?.publicMetadata?.role as string | undefined;

  // 1. Unauthenticated users trying to access protected routes
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // 2. Authenticated users
  if (userId) {
    // Admin accessing /admin base
    if (role === "admin" && pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Non-admin accessing any /admin route
    if (role !== "admin" && isAdminRoute(req)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Auth user accessing a public route (redirect to dashboard)
    if (isPublicRoute(req)) {
      return NextResponse.redirect(
        new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url)
      );
    }
  }
  // Otherwise, allow through
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
