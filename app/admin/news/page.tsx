import prisma from "@/lib/db/prisma";
import { NewsPage } from "../content/News";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page({ searchParams }: { searchParams: Promise<{ barangay?: string }> }) {
    const session = await getServerSession(authOptions);
    const params = await searchParams;
    const barangayParam = params.barangay || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    const isBarangayAdmin = user?.role === "BARANGAY_ADMIN";

    const news = await prisma.news.findMany({
        where: isBarangayAdmin 
            ? { barangay: user.managedBarangay } 
            : (barangayParam ? { barangay: barangayParam } : {}),
        orderBy: { publishDate: "desc" },
    });

    const activeBarangays = await prisma.barangayInfo.findMany({
        orderBy: { name: "asc" },
        select: { name: true }
    });

    return (
        <NewsPage 
            initialData={news} 
            currentBarangay={isBarangayAdmin ? user.managedBarangay : (barangayParam || undefined)} 
            activeBarangays={activeBarangays.map(b => b.name)}
        />
    );
}
