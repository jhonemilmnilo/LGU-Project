import prisma from "@/lib/db/prisma";
import { EventsPage } from "../content/Events";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page({ searchParams }: { searchParams: Promise<{ barangay?: string }> }) {
    const session = await getServerSession(authOptions);
    const params = await searchParams;
    const barangayParam = params.barangay || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    const isBarangayAdmin = user?.role === "BARANGAY_ADMIN";

    const events = await prisma.event.findMany({
        where: isBarangayAdmin 
            ? { barangay: user.managedBarangay } 
            : (barangayParam ? { barangay: barangayParam } : {}),
        orderBy: { startDate: "asc" },
    });

    return <EventsPage 
        initialData={events} 
        currentBarangay={isBarangayAdmin ? user.managedBarangay : (barangayParam || undefined)} 
    />;
}
