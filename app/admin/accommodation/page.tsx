import prisma from "@/lib/db/prisma";
import { AccommodationPage } from "../content/Accommodation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    const isBarangayAdmin = user?.role === "BARANGAY_ADMIN";

    const accommodations = await prisma.accommodation.findMany({
        where: isBarangayAdmin ? { barangay: user.managedBarangay } : {},
        orderBy: { createdAt: "desc" },
    });

    return <AccommodationPage initialData={accommodations} />;
}
