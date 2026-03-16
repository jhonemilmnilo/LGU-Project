// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log("DATABASE_URL_LOADED:", !!process.env.DATABASE_URL);
console.log("PRISMA_MODELS:", Object.keys(prisma).filter(k => !k.startsWith('_')));
prisma.$disconnect();
