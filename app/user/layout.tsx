import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getMultipleSystemSettings } from "@/lib/settings";
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

    const settings = await getMultipleSystemSettings([
        "site_logo", 
        "brand_word_1", 
        "brand_word_2", 
        "theme_color"
    ]);

    return (
        <UserLayoutClient 
            logoUrl={settings.get("site_logo") || ""}
            brandWord1={settings.get("brand_word_1") || "E"}
            brandWord2={settings.get("brand_word_2") || "Mapandan"}
            themeColor={settings.get("theme_color") || "#2563eb"}
        >
            {children}
        </UserLayoutClient>
    );
}
