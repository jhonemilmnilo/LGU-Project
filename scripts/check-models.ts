import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
console.log("PRISMA_MODELS:", Object.keys(prisma).filter(k => !k.startsWith('_')));
prisma.$disconnect();
