import prisma from "@/lib/db/prisma";
import { UserProjectsView } from "./UserProjectsView";

export default async function UserProjectsPage() {
    const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <UserProjectsView initialProjects={projects as any} />;
}
