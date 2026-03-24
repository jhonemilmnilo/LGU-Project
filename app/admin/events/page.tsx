import prisma from "@/lib/db/prisma";
import { EventsPage } from "../content/Events";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    const isBarangayAdmin = user?.role === "BARANGAY_ADMIN";

    const events = await prisma.event.findMany({
        where: isBarangayAdmin ? { barangay: user.managedBarangay } : {},
        orderBy: { startDate: "asc" },
    });

    return <EventsPage initialData={events} />;
}
