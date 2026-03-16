import prisma from "@/lib/db/prisma";
import { HouseholdProvider } from "./providers";
import { HouseholdsPage } from "./HouseholdsPage";
import { Household } from "./providers/HouseholdProvider";

export default async function Page() {
    const data = await prisma.household.findMany({
        include: {
            head: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const households: Household[] = (data as any[]).map(h => ({
        id: h.id,
        headId: h.headId,
        headOfFamily: h.head ? `${h.head.firstName} ${h.head.lastName}` : "No Head Assigned",
        barangay: h.barangay,
        latitude: h.latitude || 16.1158,
        longitude: h.longitude || 119.7997,
        householdSize: h.householdSize,
        contactNumber: h.contactNumber,
        riskLevel: h.riskLevel,
        notes: h.notes,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
    }));

    return (
        <HouseholdProvider initialHouseholds={households}>
            <HouseholdsPage />
        </HouseholdProvider>
    );
}
