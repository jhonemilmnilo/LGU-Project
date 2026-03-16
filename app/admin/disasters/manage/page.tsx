import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { DisasterMapDashboard } from "./DisasterMapDashboard";

export const dynamic = "force-dynamic";

export default async function ManageDisastersPage() {
    const session = await getServerSession(authOptions);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/auth/login");
    }

    // Use a delegate-like access if Prisma hasn't been regenerated yet, 
    // safer way: check if model exists onto the prisma client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapData = (prisma as any).disasterMap 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? await (prisma as any).disasterMap.findMany({ orderBy: { createdAt: "desc" } })
        : [];

    return (
        <div className="flex-1 overflow-y-auto">
            <DisasterMapDashboard initialData={mapData} />
        </div>
    );
}
