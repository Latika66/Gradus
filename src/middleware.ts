export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/roadmap/:path*", "/doubt-solver/:path*", "/profile/:path*"],
};
