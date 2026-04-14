import prisma from "@/lib/db/prisma";
import { AnnouncementPage } from "../content/Announcements/AnnouncementPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page({ searchParams }: { searchParams: Promise<{ barangay?: string }> }) {
    const session = await getServerSession(authOptions);
    const params = await searchParams;
    const barangayParam = params.barangay || null;

     
    const user = session?.user as any;
    const isBarangayAdmin = user?.role === "BARANGAY_ADMIN";

     
    const announcementDelegate = (prisma as any).announcement;
    
    if (!announcementDelegate) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600">
                    Database model &apos;announcement&apos; not found. Please restart the dev server.
                </div>
            </div>
        );
    }

    const announcements = await announcementDelegate.findMany({
        where: isBarangayAdmin 
            ? { barangay: user.managedBarangay } 
            : (barangayParam ? { barangay: barangayParam } : {}),
        orderBy: [
            { isPinned: "desc" },
            { createdAt: "desc" }
        ],
    });

    const activeBarangays = await prisma.barangayInfo.findMany({
        orderBy: { name: "asc" },
        select: { name: true }
    });

    return <AnnouncementPage 
        initialData={announcements} 
        currentBarangay={isBarangayAdmin ? user.managedBarangay : (barangayParam || undefined)}
        activeBarangays={activeBarangays.map(b => b.name)}
    />;
}
