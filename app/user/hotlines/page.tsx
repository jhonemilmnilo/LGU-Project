import prisma from "@/lib/db/prisma";
import { UserHotlinesView } from "./UserHotlinesView";

export default async function UserHotlinesPage() {
    const hotlines = await prisma.hotline.findMany({
        orderBy: { order: "asc" },
    });

    return <UserHotlinesView initialHotlines={hotlines as any} />;
}
