import prisma from "@/lib/db/prisma";
import { UserJobsView } from "./UserJobsView";
import { Job } from "../../admin/jobs/providers/JobsProvider";

export default async function UserJobsPage({
    searchParams,
}: {
    searchParams: Promise<{ barangay?: string }>;
}) {
    const { barangay } = await searchParams;
    const isFiltered = barangay && barangay !== "All";

    const jobs = await (prisma as any).job.findMany({
        where: { 
            isActive: true,
            ...(isFiltered ? { barangay } : {})
        } as any,
        orderBy: { createdAt: "desc" }
    });

    const activeBarangays = await prisma.barangayInfo.findMany({
        orderBy: { name: "asc" },
        select: { name: true }
    });

    return (
        <UserJobsView 
            initialJobs={jobs as any} 
            activeBarangays={activeBarangays.map(b => b.name)}
        />
    );
}
