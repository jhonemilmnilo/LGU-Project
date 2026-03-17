import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getSystemSetting } from "@/lib/settings";
import UserLayoutClient from "./UserLayoutClient";
import * as React from "react";

export default async function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    const logoUrl = await getSystemSetting("site_logo", "");

    return (
        <UserLayoutClient logoUrl={logoUrl}>
            {children}
        </UserLayoutClient>
    );
}
