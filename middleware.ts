import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { env } from "@/lib/env";

const COOKIE_NAME = "admin_token";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Helper function to build clean redirect URLs safely
  const redirectToLogin = () => {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    const response = NextResponse.redirect(loginUrl);
    
    // Clear invalid cookie if present
    if (token) {
      response.cookies.delete(COOKIE_NAME);
    }
    return response;
  };

  // If no token exists, redirect straight to /login
  if (!token) {
    return redirectToLogin();
  }

  try {
    const secret = env.jwtSecret();
    
    // Verify token with jose
    await jwtVerify(token, new TextEncoder().encode(secret));
    
    // Valid token -> allow access
    return NextResponse.next();
  } catch (error) {
    // Verification failed (expired or invalid token)
    return redirectToLogin();
  }
}

// Strictly guard only /admin routes
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};