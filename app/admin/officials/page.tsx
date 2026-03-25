import prisma from "@/lib/db/prisma";
import { OfficialsPage } from "./OfficialsPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const managedBarangay = (session?.user as any)?.managedBarangay;

    const where: any = {};
    if (role === "BARANGAY_ADMIN") {
        where.barangay = managedBarangay;
    } else {
        // If LGU admin, maybe only show LGU officials? 
        // No, user said the planning is for barangay admin to add.
        // Let's keep it global for LGU admin so they can oversee.
    }

    const officials = await prisma.official.findMany({
        where,
        orderBy: { order: "asc" },
    });

    return <OfficialsPage initialData={officials as any[]} />;
}
