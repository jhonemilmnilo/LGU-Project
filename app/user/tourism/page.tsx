import { UserTourismView, type TourismSpot } from "./UserTourismView";

export default async function UserTourismPage() {
    const tourismSpots = await prisma.tourismSpot.findMany({
        orderBy: { name: "asc" }
    });

    return <UserTourismView initialTourism={tourismSpots as TourismSpot[]} />;
}
