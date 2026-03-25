import prisma from "@/lib/db/prisma";
import { UserOfficialsView, type Official } from "./UserOfficialsView";

export default async function UserOfficialsPage({
    searchParams,
}: {
    searchParams: Promise<{ barangay?: string }>;
}) {
    const { barangay } = await searchParams;
    const selectedBarangay = typeof barangay === "string" ? barangay : "All";
    const isFiltered = selectedBarangay !== "All";

    const officials = await prisma.official.findMany({
        where: {
            isActive: true,
            ...(isFiltered ? { barangay: selectedBarangay, category: { in: ['Barangay Council', 'SK Council', 'Barangay', 'SK'] } } : {})
        } as any,
        orderBy: { order: "asc" },
    });

    const activeBarangays = Array.from(
        new Set(
            officials
                .map((o: any) => o.barangay)
                .filter(Boolean)
        )
    ) as string[];

    return <UserOfficialsView 
        initialOfficials={officials as Official[]} 
        activeBarangays={activeBarangays} 
        currentView={selectedBarangay}
    />;
}
