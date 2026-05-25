import prisma from "@/lib/db/prisma";
import { UsersPage } from "./UsersPage";

export const dynamic = "force-dynamic";

export default async function Page() {
    const users = await prisma.user.findMany({
        include: {
            residentProfile: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return <UsersPage users={users} />;
}
