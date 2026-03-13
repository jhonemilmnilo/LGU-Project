const prisma = require('./lib/db/prisma').default;

async function check() {
  console.log('Prisma keys:', Object.keys(prisma).filter(k => !k.startsWith('_')));
}

check().catch(console.error);
