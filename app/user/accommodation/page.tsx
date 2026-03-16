import prisma from "@/lib/db/prisma";
import { UserAccommodationView } from "./UserAccommodationView";

export default async function UserAccommodationPage() {
    const accommodations = await prisma.accommodation.findMany({
        orderBy: { createdAt: "desc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <UserAccommodationView initialAccommodations={accommodations as any} />;
}
