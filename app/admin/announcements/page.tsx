import prisma from "@/lib/db/prisma";
import { AnnouncementPage } from "../content/Announcements/AnnouncementPage";

export default async function Page() {
    // We use (prisma as any) here just in case the generated types haven't
    // fully caught up in the IDE or dev server yet.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        orderBy: [
            { isPinned: "desc" },
            { createdAt: "desc" }
        ],
    });

    return <AnnouncementPage initialData={announcements} />;
}
