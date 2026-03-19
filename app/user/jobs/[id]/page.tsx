import prisma from "@/lib/db/prisma";
import { JobDetailView } from "@/app/user/jobs/[id]/JobDetailView";
import { notFound } from "next/navigation";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    if (!id) {
        notFound();
    }

    const job = await prisma.job.findUnique({
        where: { id: id },
    });

    if (!job || !job.isActive) {
        notFound();
    }

    return <JobDetailView job={job} />;
}
