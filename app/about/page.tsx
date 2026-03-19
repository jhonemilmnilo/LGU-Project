import prisma from "@/lib/db/prisma";
import { getMultipleSystemSettings } from "@/lib/settings";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { AboutClientView } from "./AboutClientView";

export default async function AboutPage() {
    const settings = await getMultipleSystemSettings([
        "site_logo",
        "brand_word_1",
        "brand_word_2",
        "theme_color"
    ]);

    const themeColor = settings.get("theme_color") || "#2563eb";

    const aboutData = await prisma.aboutPage.findFirst();
    const pastMayors = await prisma.pastMayor.findMany({
        orderBy: { order: 'asc' }
    });

    if (!aboutData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar 
                    logoUrl={settings.get("site_logo") || ""} 
                    brandWord1={settings.get("brand_word_1") || "LGU"} 
                    brandWord2={settings.get("brand_word_2") || "Portal"} 
                    themeColor={themeColor} 
                />
                <main className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <h1 className="text-3xl font-bold mb-4">About Page Not Setup</h1>
                    <p>The Administrator has not provided any content for the about page yet.</p>
                </main>
                <Footer 
                    logoUrl={settings.get("site_logo") || ""} 
                    brandWord1={settings.get("brand_word_1") || "LGU"} 
                    brandWord2={settings.get("brand_word_2") || "Portal"} 
                    themeColor={themeColor} 
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col selection:bg-primary/30 font-sans" style={{ "--primary-theme": themeColor } as React.CSSProperties}>
            <Navbar 
                logoUrl={settings.get("site_logo") || ""} 
                brandWord1={settings.get("brand_word_1") || "LGU"} 
                brandWord2={settings.get("brand_word_2") || "Portal"} 
                themeColor={themeColor} 
            />
            
            <AboutClientView 
                aboutData={aboutData} 
                pastMayors={pastMayors}
                themeColor={themeColor} 
                brandWord1={settings.get("brand_word_1") || "LGU"} 
                brandWord2={settings.get("brand_word_2") || "Portal"} 
            />

            <Footer 
                logoUrl={settings.get("site_logo") || ""} 
                brandWord1={settings.get("brand_word_1") || "LGU"} 
                brandWord2={settings.get("brand_word_2") || "Portal"} 
                themeColor={themeColor} 
            />
        </div>
    );
}
