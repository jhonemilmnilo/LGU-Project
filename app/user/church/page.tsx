import prisma from "@/lib/db/prisma";
import { UserChurchView } from "./UserChurchView";

export default async function UserChurchPage() {
    const [churchInfo, schedules, collections] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).churchInfo.findFirst(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).churchSchedule.findMany({
            orderBy: [{ day: "asc" }, { time: "asc" }]
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).churchCollection.findMany({
            orderBy: { date: "desc" }
        })
    ]);

    return (
        <UserChurchView 
            info={churchInfo} 
            schedules={schedules} 
            collections={collections} 
        />
    );
}
