require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function test() {
    process.stdout.write("DATABASE_URL Check: " + (process.env.DATABASE_URL ? "EXIST" : "MISSING") + "\n");
    
    let prisma;
    try {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });

        const keys = Object.keys(prisma).filter(k => !k.startsWith('_'));
        process.stdout.write("PROPERTIES: " + keys.join(", ") + "\n");
        
        process.stdout.write("Has systemSetting: " + (!!prisma.systemSetting) + "\n");
        process.stdout.write("Has SystemSetting: " + (!!prisma['SystemSetting']) + "\n");
        
    } catch (e) {
        process.stdout.write("ERROR: " + e.message + "\n");
    } finally {
        if (prisma) await prisma.$disconnect();
    }
}

test();
