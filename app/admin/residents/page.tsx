/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db/prisma";
import { ResidentProvider } from "./providers";
import { ResidentsPage } from "./ResidentsPage";

export default async function Page() {
    const residentsRaw = await (prisma.resident as any).findMany({
        include: {
            household: {
                include: {
                    members: true,
                    head: true
                }
            },
            familyHead: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Map virtual fields for frontend convenience
    const residents = residentsRaw.map((r: any) => ({
        ...r,
        headId: r.familyHeadId || r.household?.headId || null,
        headName: r.familyHead 
            ? `${r.familyHead.firstName} ${r.familyHead.lastName}` 
            : r.household?.head 
                ? `${r.household.head.firstName} ${r.household.head.lastName}` 
                : null
    }));

    return (
        <ResidentProvider initialResidents={residents}>
            <ResidentsPage />
        </ResidentProvider>
    );
}
