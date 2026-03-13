import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  console.log("Prisma keys:", Object.keys(prisma).filter(k => !k.startsWith('_')));
  if ('announcement' in prisma) {
    console.log("SUCCESS: announcement model found in Prisma Client");
  } else {
    console.log("ERROR: announcement model NOT found in Prisma Client");
  }
  await prisma.$disconnect();
}

main();
