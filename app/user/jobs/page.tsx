import prisma from "@/lib/db/prisma";
import { UserJobsView } from "./UserJobsView";

export default async function UserJobsPage() {
    const jobs = await prisma.job.findMany({
        where: { status: "OPEN" }, // Only show open jobs
        orderBy: { createdAt: "desc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <UserJobsView initialJobs={jobs as any} />;
}
