import prisma from "@/lib/db/prisma";
import { UserUpdatesView } from "./UserUpdatesView";

export default async function UserUpdatesPage() {
    const news = await prisma.news.findMany({
        orderBy: { publishDate: "desc" },
    });
    
    const events = await prisma.event.findMany({
        orderBy: { startDate: "asc" },
        where: { startDate: { gte: new Date() } }
    });

     
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <UserUpdatesView initialNews={news as any} initialEvents={events as any} />;
}
