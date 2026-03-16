import prisma from "@/lib/db/prisma";
import { UserInitiativesView } from "./UserInitiativesView";

export default async function UserInitiativesPage() {
    const projects = await prisma.project.findMany({
        orderBy: { updatedAt: "desc" }
    });
    
    const jobs = await prisma.job.findMany({
        orderBy: { createdAt: "desc" }
    });

     
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <UserInitiativesView initialProjects={projects as any} initialJobs={jobs as any} />;
}
