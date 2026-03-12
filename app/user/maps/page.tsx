import prisma from "@/lib/db/prisma";
import { UserMapsView } from "./UserMapsView";

export default async function UserMapsPage() {
    const hazardMaps = await prisma.disasterMap.findMany({
        orderBy: { title: "asc" }
    });

    return <UserMapsView initialHazardMaps={hazardMaps as any} />;
}
