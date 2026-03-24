import prisma from "@/lib/db/prisma";
import { JobsPage } from "./JobsPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    const isBarangayAdmin = user?.role === "BARANGAY_ADMIN";

    const jobs = await prisma.job.findMany({
        where: isBarangayAdmin ? { barangay: user.managedBarangay } : {},
        orderBy: { createdAt: "desc" },
    });

    return <JobsPage initialData={jobs} />;
}
