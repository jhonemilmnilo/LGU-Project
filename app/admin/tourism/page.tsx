import prisma from "@/lib/db/prisma";
import { TourismPage } from "../content/Tourism";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page({ searchParams }: { searchParams: Promise<{ barangay?: string }> }) {
    const session = await getServerSession(authOptions);
     
    const user = session?.user as any;
    const isBarangayAdmin = user?.role === "BARANGAY_ADMIN";

    // Await searchParams for Next.js 15 compatibility
    const params = await searchParams;
    const currentBarangay = isBarangayAdmin ? user.managedBarangay : params.barangay;

    const tourismSpots = await prisma.tourismSpot.findMany({
        where: currentBarangay ? { barangay: currentBarangay } : {},
        orderBy: { createdAt: "desc" },
    });

    return <TourismPage initialData={tourismSpots as any} currentBarangay={currentBarangay} />;
}
