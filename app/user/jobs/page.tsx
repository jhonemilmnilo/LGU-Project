import prisma from "@/lib/db/prisma";
import { UserJobsView } from "./UserJobsView";
import { Job } from "../../admin/jobs/providers/JobsProvider";

export default async function UserJobsPage() {
    const jobs = await prisma.job.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" }
    });

    return <UserJobsView initialJobs={jobs as Job[]} />;
}
