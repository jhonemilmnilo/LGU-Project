import prisma from "@/lib/db/prisma";
import { DisasterWorkspace } from "./DisasterWorkspace";

export default async function DisastersPage() {
    // Fetch all households once for the impact analysis
    const households = await prisma.household.findMany({
        orderBy: { createdAt: "desc" }
    });

    // Fetch published disaster maps
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapDelegate = (prisma as any).disasterMap;
    const publishedMaps = mapDelegate 
        ? await mapDelegate.findMany({
            where: { isPublished: true },
            orderBy: { title: 'asc' }
        })
        : [];

     
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <DisasterWorkspace initialHouseholds={households as any} initialMaps={publishedMaps as any} />;
}
