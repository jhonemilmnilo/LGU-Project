import prisma from "@/lib/db/prisma";
import { UserTourismView } from "./UserTourismView";

export default async function UserTourismPage() {
    const tourismSpots = await prisma.tourismSpot.findMany({
        orderBy: { name: "asc" }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <UserTourismView initialTourism={tourismSpots as any} />;
}
