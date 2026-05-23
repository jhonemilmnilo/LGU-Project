import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const engineer = await prisma.user.upsert({
    where: { email: 'engineer@admin.com' },
    update: {
      password: hashedPassword,
      role: 'ENGINEER'
    },
    create: {
      email: 'engineer@admin.com',
      name: 'Municipal Engineer',
      password: hashedPassword,
      role: 'ENGINEER',
      isEmailVerified: true
    }
  });

  console.log('Engineer user created/updated:', engineer.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
