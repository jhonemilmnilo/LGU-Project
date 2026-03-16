import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import DiningPageWrapper from "@/app/admin/content/Dining/DiningPage";

export const dynamic = "force-dynamic";

export default async function DiningPage() {
    const session = await getServerSession(authOptions);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/auth/login");
    }

    const diningData = await prisma.dining.findMany({
        orderBy: { createdAt: "desc" }
    });

    return <DiningPageWrapper diningData={diningData} />;
}
