import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        await prisma.$executeRawUnsafe(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='Transaction' AND column_name='revisionCount'
                ) THEN
                    ALTER TABLE "Transaction" ADD COLUMN "revisionCount" INTEGER DEFAULT 0;
                END IF;
            END
            $$;
        `);
        return NextResponse.json({ success: true, message: "Migration complete" });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
