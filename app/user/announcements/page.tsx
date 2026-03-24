import prisma from "@/lib/db/prisma";
import { UserAnnouncementsView, type Announcement } from "./UserAnnouncementsView";

export default async function UserAnnouncementsPage() {
    const announcements = await prisma.announcement.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" }
    });

    return <UserAnnouncementsView initialAnnouncements={announcements as Announcement[]} />;
}
