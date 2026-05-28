import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Running manual migration for building permit revisions...");

    // Add revisionCount to Transaction table
    await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='Transaction' AND column_name='revisionCount'
            ) THEN
                ALTER TABLE "Transaction" ADD COLUMN "revisionCount" INTEGER DEFAULT 0;
                RAISE NOTICE 'Added revisionCount column to Transaction';
            ELSE
                RAISE NOTICE 'revisionCount already exists in Transaction';
            END IF;
        END
        $$;
    `);

    console.log("Migration complete!");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
