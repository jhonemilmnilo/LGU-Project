import prisma from "@/lib/db/prisma";
import { AccommodationPage } from "../content/Accommodation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page({ searchParams }: { searchParams: Promise<{ barangay?: string }> }) {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    const isBarangayAdmin = user?.role === "BARANGAY_ADMIN";
    
    // Await searchParams for Next.js 15 compatibility
    const params = await searchParams;
    const currentBarangay = isBarangayAdmin ? user.managedBarangay : params.barangay;

    const accommodations = await prisma.accommodation.findMany({
        where: currentBarangay ? { barangay: currentBarangay } : {},
        orderBy: { createdAt: "desc" },
    });

    return <AccommodationPage initialData={accommodations as any} currentBarangay={currentBarangay} />;
}
