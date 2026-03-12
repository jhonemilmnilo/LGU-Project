import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { DisasterMapDashboard } from "./DisasterMapDashboard";

export const dynamic = "force-dynamic";

export default async function ManageDisastersPage() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/auth/login");
    }

    // Use a delegate-like access if Prisma hasn't been regenerated yet, 
    // safer way: check if model exists onto the prisma client
    const mapData = (prisma as any).disasterMap 
        ? await (prisma as any).disasterMap.findMany({ orderBy: { createdAt: "desc" } })
        : [];

    return (
        <div className="flex-1 overflow-y-auto">
            <DisasterMapDashboard initialData={mapData} />
        </div>
    );
}
