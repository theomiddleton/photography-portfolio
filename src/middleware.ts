import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware"

export default withAuth(
  async function middleware(req) {
    try { 
      console.log("auth", req.kindeAuth);
      
      // Logging to check the token and permissions
      const token = req.kindeAuth.token;
      console.log("Token:", token);

      if (token) {
        console.log("Permissions:", token.permissions);
      } else {
        console.log("No token found");
      }

      return true;
    } catch (error) {
      console.error('Middleware error:', error);
      throw error; // Ensure the error is thrown so the server can handle it properly
    }
  },
  {
    isReturnToCurrentPage: false,
    loginPage: "/signin",
    isAuthorized: ({token}) => {
      console.log("isAuthorized check");
      if (!token) {
        console.log("No token in isAuthorized");
        return false;
      }
      return token.permissions.includes("admin:admin");
    }
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
  ]
}