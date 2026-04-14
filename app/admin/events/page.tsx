import prisma from "@/lib/db/prisma";
import { EventsPage } from "../content/Events";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page({ searchParams }: { searchParams: Promise<{ barangay?: string }> }) {
    const session = await getServerSession(authOptions);
    const params = await searchParams;
    const barangayParam = params.barangay || null;

     
    const user = session?.user as any;
    const isBarangayAdmin = user?.role === "BARANGAY_ADMIN";

    const events = await prisma.event.findMany({
        where: isBarangayAdmin 
            ? { barangay: user.managedBarangay } 
            : (barangayParam ? { barangay: barangayParam } : {}),
        orderBy: { startDate: "asc" },
    });

    const activeBarangays = await prisma.barangayInfo.findMany({
        orderBy: { name: "asc" },
        select: { name: true }
    });

    return <EventsPage 
        initialData={events} 
        currentBarangay={isBarangayAdmin ? user.managedBarangay : (barangayParam || undefined)} 
        activeBarangays={activeBarangays.map(b => b.name)}
    />;
}
