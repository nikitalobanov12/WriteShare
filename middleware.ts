import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Define protected routes (all routes except login and auth API routes)
  const isProtectedRoute = !request.nextUrl.pathname.startsWith("/login") &&
                          !request.nextUrl.pathname.startsWith("/api/auth");

  // If the user is not authenticated and trying to access a protected route
  if (!session && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    // Add the current URL as a callback parameter for post-login redirect
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If the user is authenticated and trying to access the login page, redirect to home
  if (session && request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files and API routes that should be public
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}; 