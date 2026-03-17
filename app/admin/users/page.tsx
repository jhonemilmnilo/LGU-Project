import prisma from "@/lib/db/prisma";
import { UsersPage } from "./UsersPage";

export default async function Page() {
    const users = await prisma.user.findMany({
        where: { role: 'USER' },
        include: {
            residentProfile: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return <UsersPage users={users} />;
}
