import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/landing/Hero";
import { DiningLodging } from "@/components/sections/landing/DiningLodging";
import { PlacesToVisit } from "@/components/sections/landing/PlacesToVisit";
import { NewsEvents } from "@/components/sections/landing/NewsEvents";
import { JobBoard } from "@/components/sections/landing/JobBoard";
import { Government } from "@/components/sections/landing/Government";
import { Services } from "@/components/sections/landing/Services";
import { EmergencyReport } from "@/components/sections/landing/EmergencyReport";
import prisma from "@/lib/db/prisma";
import { getSystemSetting, isMaintenanceMode } from "@/lib/settings";
import { redirect } from "next/navigation";

export default async function Home() {
    // 1. Check Maintenance Mode
    const maintenance = await isMaintenanceMode();
    if (maintenance) {
        redirect("/maintenance");
    }

    // 2. Fetch Dynamic Content
    const [slides, logoUrl, tourismSpots, dining, lodging] = await Promise.all([
        prisma.heroSlide.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        }),
        getSystemSetting("site_logo", ""),
        prisma.tourismSpot.findMany({
            where: { isPublished: true },
            take: 3
        }),
        prisma.dining.findMany({
            where: { isPublished: true },
            take: 4
        }),
        prisma.accommodation.findMany({
            where: { isPublished: true },
            take: 4
        })
    ]);

    // Merge and shuffle or simply combine discovery items
    const discoveryItems = [
        ...dining.map(d => ({ 
            ...d, 
            itemType: "kainan" as const,
            cuisineType: d.cuisineType || undefined 
        })),
        ...lodging.map(l => ({ 
            ...l, 
            itemType: "tuluyan" as const,
            type: l.type || undefined 
        }))
    ].sort(() => Math.random() - 0.5); // Shuffle for that organic field

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-blue-600/30">
            <Navbar logoUrl={logoUrl} />
            
            <Hero slides={slides} />
            
            <div className="space-y-32 pb-32">
                <DiningLodging items={discoveryItems} />
                <PlacesToVisit spots={tourismSpots} />
                <NewsEvents />
                <JobBoard />
                <Government />
                <Services />
            </div>
            
            <EmergencyReport />
            <Footer />
        </main>
    );
}
