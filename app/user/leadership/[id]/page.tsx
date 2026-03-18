import prisma from "@/lib/db/prisma";
import { OfficialDetailView } from "./OfficialDetailView";
import { notFound } from "next/navigation";
import { getSystemSetting } from "@/lib/settings";

export default async function OfficialDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    if (!id) {
        notFound();
    }

    const [official, themeColor] = await Promise.all([
        prisma.official.findUnique({
            where: { id: id },
        }),
        getSystemSetting("theme_color", "#2563eb")
    ]);

    if (!official || !official.isActive) {
        notFound();
    }

    return <OfficialDetailView official={official} themeColor={themeColor} />;
}
