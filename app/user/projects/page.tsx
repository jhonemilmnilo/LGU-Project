import prisma from "@/lib/db/prisma";
import { UserProjectsView } from "./UserProjectsView";

export default async function UserProjectsPage({
    searchParams,
}: {
    searchParams: Promise<{ barangay?: string }>;
}) {
    const { barangay } = await searchParams;
    const isFiltered = barangay && barangay !== "All";

    const projects = await prisma.project.findMany({
        where: {
            isPublished: true,
            ...(isFiltered ? { barangay } : {})
        } as any,
        orderBy: { createdAt: "desc" }
    });

    return <UserProjectsView initialProjects={projects} />;
}
