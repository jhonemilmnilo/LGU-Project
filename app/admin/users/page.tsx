import prisma from "@/lib/db/prisma";
import { UsersPage } from "./UsersPage";

export const dynamic = "force-dynamic";

export default async function Page() {
    const [users, themeColorSetting] = await Promise.all([
        prisma.user.findMany({
            include: {
                residentProfile: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        }),
        prisma.systemSetting.findUnique({
            where: { key: "theme_color" }
        })
    ]);

    const themeColor = themeColorSetting?.value;

    return <UsersPage users={users} themeColor={themeColor} />;
}
