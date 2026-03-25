import prisma from "@/lib/db/prisma";
import { UserNewsView, type News } from "./UserNewsView";

export default async function UserNewsPage({
    searchParams,
}: {
    searchParams: Promise<{ barangay?: string }>;
}) {
    const { barangay } = await searchParams;
    const isFiltered = barangay && barangay !== "All";

    const news = await prisma.news.findMany({
        where: { 
            isPublished: true,
            ...(isFiltered ? { barangay } : {})
        } as any,
        orderBy: { publishDate: "desc" }
    });

    const activeBarangays = await prisma.barangayInfo.findMany({
        orderBy: { name: "asc" },
        select: { name: true }
    });

    return (
        <UserNewsView 
            initialNews={news as News[]} 
            activeBarangays={activeBarangays.map(b => b.name)}
        />
    );
}
