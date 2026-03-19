import prisma from "@/lib/db/prisma";
import { UserJobsView } from "./UserJobsView";

export default async function UserJobsPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobs = await (prisma as any).job.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
    });

    return <UserJobsView initialJobs={jobs} />;
}
