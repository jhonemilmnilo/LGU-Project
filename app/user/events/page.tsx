import prisma from "@/lib/db/prisma";
import { UserEventsView } from "./UserEventsView";

export default async function UserEventsPage() {
    const events = await prisma.event.findMany({
        where: { isPublished: true },
        orderBy: { startDate: "asc" }
    });

    const activeBarangays = await prisma.barangayInfo.findMany({
        orderBy: { name: "asc" },
        select: { name: true }
    });

    return (
        <UserEventsView 
            initialEvents={events} 
            activeBarangays={activeBarangays.map(b => b.name)}
        />
    );
}
