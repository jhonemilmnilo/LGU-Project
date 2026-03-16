import prisma from "@/lib/db/prisma";
import { UserExperienceView } from "./UserExperienceView";

export default async function UserExperiencePage() {
    const dining = await prisma.dining.findMany({
        where: { isPublished: true },
        orderBy: { name: "asc" }
    });
    
    const accommodations = await prisma.accommodation.findMany({
        where: { isPublished: true },
        orderBy: { name: "asc" }
    });

     
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <UserExperienceView initialDining={dining as any} initialAccommodations={accommodations as any} />;
}
