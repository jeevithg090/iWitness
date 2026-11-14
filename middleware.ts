import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isStaffRole } from "@/lib/roles";

/** Only ADMIN and MODERATOR accounts may open the dashboard. */
export default withAuth(
  function middleware(req) {
    if (!isStaffRole(req.nextauth.token?.role)) {
      const url = new URL("/auth/signin", req.url);
      url.searchParams.set("error", "AccessDenied");
      url.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: "/auth/signin" },
  },
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
