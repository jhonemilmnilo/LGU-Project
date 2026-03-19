import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Running manual migration via session pooler...");

    // Add the 3 new columns to Resident table if they don't exist yet
    await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='Resident' AND column_name='rejectionRemarks'
            ) THEN
                ALTER TABLE "Resident" ADD COLUMN "rejectionRemarks" TEXT;
                RAISE NOTICE 'Added rejectionRemarks column';
            ELSE
                RAISE NOTICE 'rejectionRemarks already exists';
            END IF;

            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='Resident' AND column_name='reviewedAt'
            ) THEN
                ALTER TABLE "Resident" ADD COLUMN "reviewedAt" TIMESTAMP(3);
                RAISE NOTICE 'Added reviewedAt column';
            ELSE
                RAISE NOTICE 'reviewedAt already exists';
            END IF;

            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='Resident' AND column_name='reviewedBy'
            ) THEN
                ALTER TABLE "Resident" ADD COLUMN "reviewedBy" TEXT;
                RAISE NOTICE 'Added reviewedBy column';
            ELSE
                RAISE NOTICE 'reviewedBy already exists';
            END IF;
        END
        $$;
    `);

    console.log("Migration complete!");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
