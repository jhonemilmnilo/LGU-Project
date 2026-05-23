const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.$executeRaw`UPDATE "Transaction" SET "status" = 'FOR_REQUESTING' WHERE "status" = 'FOR_INSPECTION'`;
    console.log('Updated rows to FOR_REQUESTING:', result);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
