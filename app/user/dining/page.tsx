import prisma from "@/lib/db/prisma";
import UserDiningView, { type Dining } from "./UserDiningView";

export default async function UserDiningPage({
    searchParams,
}: {
    searchParams: Promise<{ barangay?: string }>;
}) {
    const { barangay } = await searchParams;
    const isFiltered = barangay && barangay !== "All";

    const diningData = await prisma.dining.findMany({
        where: { 
            isPublished: true,
            ...(isFiltered ? { barangay } : {})
        } as any,
        orderBy: { createdAt: "desc" }
    });

    const barangays = await prisma.barangayInfo.findMany({
        select: { name: true },
        orderBy: { name: "asc" }
    });

    return <UserDiningView 
        initialDining={diningData as Dining[]} 
        activeBarangays={barangays.map(b => b.name)}
    />;
}
