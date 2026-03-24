import prisma from "@/lib/db/prisma";
import UserDiningView, { type Dining } from "./UserDiningView";

export default async function UserDiningPage() {
    const diningData = await prisma.dining.findMany({
        where: { isPublished: true },
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
