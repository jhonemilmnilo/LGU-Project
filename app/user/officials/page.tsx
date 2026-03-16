import prisma from "@/lib/db/prisma";
import { UserOfficialsView } from "./UserOfficialsView";

export default async function UserOfficialsPage() {
    const officials = await prisma.official.findMany({
        orderBy: { order: "asc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <UserOfficialsView initialOfficials={officials as any} />;
}
