import prisma from "@/lib/db/prisma";
import UserDiningView, { type Dining } from "./UserDiningView";

export default async function UserDiningPage() {
    const diningData = await prisma.dining.findMany({
        orderBy: { createdAt: "desc" }
    });

    return <UserDiningView initialDining={diningData as Dining[]} />;
}
