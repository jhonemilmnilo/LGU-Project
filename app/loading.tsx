import React from "react";
import { getMultipleSystemSettings } from "@/lib/settings";
import LoadingClientBody from "@/app/LoadingClientBody";

export default async function Loading() {
    // 1. Fetch live branding from Admin Settings
    const settings = await getMultipleSystemSettings([
        "site_logo",
        "brand_word_1",
        "brand_word_2",
        "theme_color"
    ]);

    const logoUrl = settings.get("site_logo") || "";
    const brand1 = settings.get("brand_word_1") || "MAPANDAN";
    const brand2 = settings.get("brand_word_2") || "PORTAL";
    const themeColor = settings.get("theme_color") || "#2563eb";

    // 2. Delegate to Client Component for animations and forced duration
    return (
        <LoadingClientBody 
            logoUrl={logoUrl} 
            brand1={brand1} 
            brand2={brand2} 
            themeColor={themeColor}
        />
    );
}
