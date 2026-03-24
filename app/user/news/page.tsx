import prisma from "@/lib/db/prisma";
import { UserNewsView, type News } from "./UserNewsView";

export default async function UserNewsPage() {
    const news = await prisma.news.findMany({
        where: { isPublished: true },
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
