import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const url = req.nextUrl.clone();
    const token = req.nextauth.token;

    // Guard: USER role is never allowed to access admin routes
    if (token?.role === "USER" && url.pathname.startsWith("/admin")) {
      const redirectUrl = new URL("/", req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Check custom page overrides if set
    const accessiblePages = token?.accessiblePages as string[] | undefined;
    if (accessiblePages && accessiblePages.length > 0 && url.pathname.startsWith("/admin")) {
      const isPathAllowed = accessiblePages.some(page => {
        // Exact match
        if (page === url.pathname) return true;
        
        // Match with query params (e.g. category=Birth Certificate)
        if (page.includes("?")) {
          const [pagePath, pageQuery] = page.split("?");
          if (pagePath === url.pathname) {
            const [paramKey, paramVal] = pageQuery.split("=");
            if (url.searchParams.get(paramKey) === decodeURIComponent(paramVal)) {
              return true;
            }
          }
        }
        
        // Allow sub-routes (e.g. /admin/residents/create if /admin/residents is allowed)
        if (!page.includes("?") && url.pathname.startsWith(page + "/")) {
          return true;
        }

        return false;
      });

      if (!isPathAllowed) {
        // Force logout: Clear session cookies and redirect to login page
        const redirectUrl = new URL("/auth/login", req.url);
        const response = NextResponse.redirect(redirectUrl);
        response.cookies.delete("next-auth.session-token");
        response.cookies.delete("__Secure-next-auth.session-token");
        response.cookies.delete("active_portal");
        return response;
      }
    }

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
