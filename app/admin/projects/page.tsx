import prisma from "@/lib/db/prisma";
import { ProjectsPage } from "./ProjectsPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page({ searchParams }: { searchParams: Promise<{ barangay?: string }> }) {
    const session = await getServerSession(authOptions);
    const params = await searchParams;
    const barangayParam = params.barangay || null;

     
    const user = session?.user as any;
    const isBarangayAdmin = user?.role === "BARANGAY_ADMIN";

    const projects = await prisma.project.findMany({
        where: isBarangayAdmin 
            ? { barangay: user.managedBarangay } 
            : (barangayParam ? { barangay: barangayParam } : {}),
        orderBy: { createdAt: "desc" },
    });

    const activeBarangays = await prisma.barangayInfo.findMany({
        orderBy: { name: "asc" },
        select: { name: true }
    });

    return (
        <ProjectsPage 
            initialData={projects} 
            currentBarangay={isBarangayAdmin ? user.managedBarangay : (barangayParam || undefined)}
            activeBarangays={activeBarangays.map(b => b.name)}
        />
    );
}
