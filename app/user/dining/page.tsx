import prisma from "@/lib/db/prisma";
import UserDiningView from "./UserDiningView";

export default async function UserDiningPage() {
    const diningData = await prisma.dining.findMany({
        orderBy: { createdAt: "desc" }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <UserDiningView initialDining={diningData as any} />;
}
