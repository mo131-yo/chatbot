import {prisma} from "@/lib/prisma";

export async function POST() {
  const store = await prisma.store.create({
    data: { name: "Test Store", ownerId: "user123" },
  });
  return Response.json(store);
}
