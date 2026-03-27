// import { cookies } from "next/headers";
// import jwt from "jsonwebtoken";

// export async function getUserFromToken() {
//   const cookieStore = await cookies();

//   const token = cookieStore.get("token")?.value;

//   if (!token) {
//     throw new Error("Unauthorized");
//   }

//   const secret = process.env.JWT_SECRET;

//   if (!secret) {
//     throw new Error("JWT_SECRET not configured");
//   }

//   return jwt.verify(token, secret) as { id: string };
// }


// lib/auth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getUserFromToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null; // Error шидэхгүй, null буцаана

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is missing");
      return null;
    }

    return jwt.verify(token, secret) as { id: string };
  } catch (error) {
    return null; // Токен хүчингүй бол null буцаана
  }
}