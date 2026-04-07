// import { clerkMiddleware } from "@clerk/nextjs/server";

// export default clerkMiddleware();

// export const config = {
//   matcher: ["/((?!_next|.*\\..*).*)"],
// };
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/chat(.*)"]);

async function proxy(auth: any, req: any) {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
}

export default clerkMiddleware(proxy);

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
