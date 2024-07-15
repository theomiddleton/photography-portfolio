import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware"

export default withAuth(
  async function middleware(req) {
    console.log("look at me", req.kindeAuth)
  },
  {
    isReturnToCurrentPage: false,
    loginPage: "/login",
    isAuthorized: ({token}) => {
      return token.permissions.includes("admin:admin");
    }
  }
)

export const config = {
  matcher: ["/admin"]
}