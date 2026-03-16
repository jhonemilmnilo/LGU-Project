import prisma from "@/lib/db/prisma";
import { UserLeadershipView } from "./UserLeadershipView";

export default async function UserLeadershipPage() {
    const officials = await prisma.official.findMany({
        orderBy: { order: "asc" }
    });
    
    const hotlines = await prisma.hotline.findMany({
        orderBy: { name: "asc" }
    });

     
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <UserLeadershipView initialOfficials={officials as any} initialHotlines={hotlines as any} />;
}
