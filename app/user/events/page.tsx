import prisma from "@/lib/db/prisma";
import { UserEventsView } from "./UserEventsView";

export default async function UserEventsPage() {
    const events = await prisma.event.findMany({
        orderBy: { startDate: "asc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <UserEventsView initialEvents={events as any} />;
}
