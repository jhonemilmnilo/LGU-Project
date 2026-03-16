import prisma from "@/lib/db/prisma";
import { UserHotlinesView } from "./UserHotlinesView";

export default async function UserHotlinesPage() {
    const hotlines = await prisma.hotline.findMany({
        orderBy: { order: "asc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <UserHotlinesView initialHotlines={hotlines as any} />;
}
