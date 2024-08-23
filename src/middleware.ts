import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware"

export default withAuth(
  async function middleware(req) {
    console.log("auth", req.kindeAuth)
  },
  {
    isReturnToCurrentPage: false,
    loginPage: "/signin",
    isAuthorized: ({token}) => {
      return token.permissions.includes("admin:admin");
    }
  }
)

export const config = {
  matcher: [
    // "/admin/:path*",
    "/empty",
  ]
}