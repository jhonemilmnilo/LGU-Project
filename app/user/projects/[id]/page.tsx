import prisma from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { ProjectDetailView } from "./ProjectDetailView";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const project = await prisma.project.findUnique({
        where: { id },
    });

    if (!project) {
        notFound();
    }

    return <ProjectDetailView project={project} />;
}
