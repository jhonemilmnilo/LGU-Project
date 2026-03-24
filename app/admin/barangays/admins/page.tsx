import prisma from "@/lib/db/prisma";
import { BarangayAdminsWorkspace } from "./BarangayAdminsWorkspace";

export default async function BarangayAdminsPage() {
    const [admins, barangays] = await Promise.all([
        prisma.user.findMany({
            where: { role: 'BARANGAY_ADMIN' },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.barangayInfo.findMany({
            orderBy: { name: 'asc' },
            select: { name: true, id: true }
        })
    ]);

    return <BarangayAdminsWorkspace initialAdmins={admins} barangays={barangays.map(b => b.name)} />;
}
