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
import { clerkMiddleware, clerkClient } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute) {

    if (!userId) {
      return Response.redirect(new URL("/login", req.url));
    }


    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const role = user.publicMetadata?.role;

    console.log("ROLE:", role);
    console.log("USER:", user.publicMetadata);


    if (role !== "admin") {
      return Response.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
