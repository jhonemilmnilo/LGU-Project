import prisma from "@/lib/db/prisma";
import { UserAccommodationView, type Accommodation } from "./UserAccommodationView";

export default async function UserAccommodationPage() {
    const accommodations = await prisma.accommodation.findMany({
        orderBy: { createdAt: "desc" },
    });

    return <UserAccommodationView initialAccommodations={accommodations as Accommodation[]} />;
}
