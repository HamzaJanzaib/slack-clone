import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isAuthPage = createRouteMatcher([
  "/auth",
  "/forgot-password",
  "/reset-password",
]);

const isProtectedRoute = createRouteMatcher([
  "/((?!auth|forgot-password|reset-password|_next|.*\\.).*)",
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();

  // Proxy: Allow auth pages but redirect authenticated users
  if (isAuthPage(request)) {
    if (isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/");
    }
    // Pass through auth pages for unauthenticated users
    return NextResponse.next();
  }

  // Proxy: Protect routes - redirect unauthenticated users
  if (isProtectedRoute(request)) {
    if (!isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/auth");
    }
    // Pass through protected routes for authenticated users
    return NextResponse.next();
  }

  // Default: Allow request to proceed
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
