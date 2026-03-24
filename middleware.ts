import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const url = req.nextUrl.clone();
    const token = req.nextauth.token;

    // Check if user is a BARANGAY_ADMIN and accessing admin pages
    if (
      token?.role === "BARANGAY_ADMIN" &&
      token?.managedBarangay &&
      url.pathname.startsWith("/admin")
    ) {
      const currentBarangay = url.searchParams.get("barangay");

      // Check if we already have the correct barangay in the URL
      // If not, redirect to the same URL but with the barangay parameter
      if (currentBarangay !== token.managedBarangay) {
        url.searchParams.set("barangay", token.managedBarangay as string);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    // Add other protected routes if needed
  ],
};
