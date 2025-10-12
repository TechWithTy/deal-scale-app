import { marketingRedirect } from "@/lib/middleware/marketingRedirect";
import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => marketingRedirect(request));

export const config = {
        matcher: ["/", "/dashboard/:path*", "/admin/:path*"],
};
