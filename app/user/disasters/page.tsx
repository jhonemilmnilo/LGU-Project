import prisma from "@/lib/db/prisma";
import { UserDisasterWorkspace } from "./UserDisasterWorkspace";

export default async function UserDisastersPage() {
    // For citizens, we might not need all household data, but maybe some context
    // Actually, we'll fetch published maps
     
    const mapDelegate = (prisma as any).disasterMap;
    const publishedMaps = mapDelegate 
        ? await mapDelegate.findMany({
            where: { isPublished: true },
            orderBy: { title: 'asc' }
        })
        : [];

     
    return <UserDisasterWorkspace initialMaps={publishedMaps as any} />;
}
