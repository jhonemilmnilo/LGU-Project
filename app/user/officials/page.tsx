import prisma from "@/lib/db/prisma";
import { UserOfficialsView, type Official } from "./UserOfficialsView";

export default async function UserOfficialsPage() {
    const officials = await prisma.official.findMany({
        orderBy: { order: "asc" },
    });

    return <UserOfficialsView initialOfficials={officials as Official[]} />;
}
