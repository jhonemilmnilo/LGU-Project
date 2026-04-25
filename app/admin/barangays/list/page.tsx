import prisma from "@/lib/db/prisma";
import { BarangaysListWorkspace } from "./BarangaysListWorkspace";

export const dynamic = "force-dynamic";

export default async function BarangaysPage() {
    const barangays = await prisma.barangayInfo.findMany({
        orderBy: { name: 'asc' }
    });

    return <BarangaysListWorkspace initialData={barangays} />;
}
