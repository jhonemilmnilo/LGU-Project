import prisma from "@/lib/db/prisma";
import { UserNewsView } from "./UserNewsView";

export default async function UserNewsPage() {
    const news = await prisma.news.findMany({
        orderBy: { publishDate: "desc" },
    });

    return <UserNewsView initialNews={news as any} />;
}
