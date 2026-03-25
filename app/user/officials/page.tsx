import prisma from "@/lib/db/prisma";
import { UserOfficialsView, type Official } from "./UserOfficialsView";

export default async function UserOfficialsPage() {
    const officials = await prisma.official.findMany({
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
    />;
}
