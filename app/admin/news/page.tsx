import prisma from "@/lib/db/prisma";
import { NewsPage } from "../content/News";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page({ searchParams }: { searchParams: { barangay?: string } }) {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    const isBarangayAdmin = user?.role === "BARANGAY_ADMIN";
    const barangayParam = searchParams.barangay || null;

    const news = await prisma.news.findMany({
        where: isBarangayAdmin 
            ? { barangay: user.managedBarangay } 
            : (barangayParam ? { barangay: barangayParam } : {}),
        orderBy: { publishDate: "desc" },
    });

    return <NewsPage initialData={news} currentBarangay={isBarangayAdmin ? user.managedBarangay : (barangayParam || undefined)} />;
}
