import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

// Apply CSP headers to all responses
function applyCSPHeaders(response: NextResponse) {
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.googleapis.com https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.googleusercontent.com https://*.google.com; connect-src 'self' https://*.googleapis.com https://accounts.google.com; frame-src 'self' https://accounts.google.com https://*.google.com; font-src 'self'; object-src 'none';"
  );
  return response;
}

// Apply withAuth middleware to protected routes
export default withAuth(
  // Function that's called after authentication succeeds
  function middleware(req) {
    // Apply CSP headers to the response
    return applyCSPHeaders(NextResponse.next());
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/",
    },
  }
);

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Only apply to dashboard routes
    "/dashboard/:path*",
  ],
};
