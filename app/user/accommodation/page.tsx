import prisma from "@/lib/db/prisma";
import { UserAccommodationView, type Accommodation } from "./UserAccommodationView";

export default async function UserAccommodationPage({
    searchParams,
}: {
    searchParams: Promise<{ barangay?: string }>;
}) {
    const { barangay } = await searchParams;
    const isFiltered = barangay && barangay !== "All";

    const accommodations = await prisma.accommodation.findMany({
        where: { 
            isPublished: true,
            ...(isFiltered ? { barangay } : {})
        } as any,
        orderBy: { createdAt: "desc" },
    });

    const activeBarangays = await prisma.barangayInfo.findMany({
        orderBy: { name: "asc" },
        select: { name: true }
    });

    return (
        <UserAccommodationView 
            initialAccommodations={accommodations as any} 
            activeBarangays={activeBarangays.map(b => b.name)}
        />
    );
}
