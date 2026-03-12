import prisma from "@/lib/db/prisma";
import UserDiningView from "./UserDiningView";

export default async function UserDiningPage() {
    const diningData = await prisma.dining.findMany({
        orderBy: { createdAt: "desc" }
    });

    return <UserDiningView initialDining={diningData as any} />;
}
