import { withAuth } from "next-auth/middleware";

export default withAuth(
  function proxy() {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token) {
          return false;
        }

        const pathname = req.nextUrl.pathname;
        if (pathname.startsWith("/admin")) {
          return (
            token.roles?.includes("admin") === true ||
            token.roles?.includes("staff") === true
          );
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
