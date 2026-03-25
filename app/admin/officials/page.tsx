import prisma from "@/lib/db/prisma";
import { OfficialsPage } from "./OfficialsPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Official } from "./providers/OfficialsProvider";

export default async function Page() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const managedBarangay = (session?.user as any)?.managedBarangay;

    const where: Record<string, unknown> = {};
    if (role === "BARANGAY_ADMIN") {
        where.barangay = managedBarangay;
    }

    const [officials, barangays] = await Promise.all([
        prisma.official.findMany({
            where: where as any,
            orderBy: { order: "asc" },
        }),
        prisma.barangayInfo.findMany({
            select: { name: true },
            orderBy: { name: "asc" },
        }).then(list => list.map(b => b.name))
    ]);

    return <OfficialsPage 
        initialData={officials as Official[]} 
        barangays={barangays} 
        managedBarangay={managedBarangay} 
    />;
}
