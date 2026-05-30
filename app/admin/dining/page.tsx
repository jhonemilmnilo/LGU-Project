import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import DiningPageWrapper from "@/app/admin/content/Dining/DiningPage";

export const dynamic = "force-dynamic";

export default async function DiningPage({ searchParams }: { searchParams: Promise<{ barangay?: string }> }) {
    const session = await getServerSession(authOptions);
    const params = await searchParams;
    const barangayParam = params.barangay || null;

     
    const user = session?.user as any;
    if (!session || (user.role !== "ADMIN" && user.role !== "BARANGAY_ADMIN")) {
        redirect("/auth/login");
    }

    const isBarangayAdmin = user?.role === "BARANGAY_ADMIN";

    const diningData = await prisma.dining.findMany({
        where: isBarangayAdmin 
            ? { barangay: user.managedBarangay } 
            : (barangayParam ? { barangay: barangayParam } : {}),
        orderBy: { createdAt: "desc" }
    });

    const activeBarangays = await prisma.barangayInfo.findMany({
        orderBy: { name: "asc" },
        select: { name: true }
    });

    return <DiningPageWrapper 
        diningData={diningData} 
        currentBarangay={isBarangayAdmin ? user.managedBarangay : (barangayParam || undefined)}
        activeBarangays={isBarangayAdmin ? [] : activeBarangays.map(b => b.name)}
    />;
}
