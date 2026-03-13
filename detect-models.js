const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const models = Object.keys(prisma).filter(k => !k.startsWith('_'));
  console.log('Available models:', models);
  if (models.includes('systemSetting')) {
    console.log('SUCCESS: systemSetting found');
  } else {
    console.log('FAILURE: systemSetting NOT found');
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
