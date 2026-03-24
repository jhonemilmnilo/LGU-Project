import prisma from "@/lib/db/prisma";
import { JobsPage } from "./JobsPage";
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

    const jobs = await prisma.job.findMany({
        where: currentBarangay ? { barangay: currentBarangay } : {},
        orderBy: { createdAt: "desc" },
    });

    const activeBarangays = await prisma.barangayInfo.findMany({
        orderBy: { name: "asc" },
        select: { name: true }
    });

    return (
        <JobsPage 
            initialData={jobs as any} 
            currentBarangay={currentBarangay} 
            activeBarangays={activeBarangays.map(b => b.name)}
        />
    );
}
