import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/landing/Hero";
import { DiningLodging } from "@/components/sections/landing/DiningLodging";
import { PlacesToVisit } from "@/components/sections/landing/PlacesToVisit";
import { EventsCalendarSection } from "@/components/sections/landing/EventsCalendarSection";
import { AnnouncementsNews } from "@/components/sections/landing/AnnouncementsNews";
import { JobBoard } from "@/components/sections/landing/JobBoard";
import { LGUProjects } from "@/components/sections/landing/LGUProjects";
import { Government } from "@/components/sections/landing/Government";
import { Services } from "@/components/sections/landing/Services";
import { EmergencyReport } from "@/components/sections/landing/EmergencyReport";
import prisma from "@/lib/db/prisma";
import { getMultipleSystemSettings } from "@/lib/settings";
import { redirect } from "next/navigation";

export default async function Home() {
    // 1. Fetch all needed system settings first in one query
    const settings = await getMultipleSystemSettings([
        "maintenance_mode", 
        "site_logo",
        "brand_word_1",
        "brand_word_2",
        "theme_color"
    ]);
    
    // Check Maintenance Mode
    const maintenance = settings.get("maintenance_mode") === "true";
    if (maintenance) {
        redirect("/maintenance");
    }

    const logoUrl = settings.get("site_logo") || "";
    const brandWord1 = settings.get("brand_word_1") || "E";
    const brandWord2 = settings.get("brand_word_2") || "Mapandan";
    const themeColor = settings.get("theme_color") || "#2563eb";

    // 2. Fetch Content
    const [slides, tourismSpots, dining, lodging, announcements, events, news, projects] = await Promise.all([
        prisma.heroSlide.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        }),
        prisma.tourismSpot.findMany({
            where: { isPublished: true },
            take: 5
        }),
        prisma.dining.findMany({
            where: { isPublished: true },
            take: 4
        }),
        prisma.accommodation.findMany({
            where: { isPublished: true },
            take: 4
        }),
        // Fetch real data for News & Announcements
        prisma.announcement.findMany({
            where: { isActive: true },
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' }
            ],
            take: 3
        }),
        prisma.event.findMany({
            where: { isPublished: true },
            orderBy: { startDate: 'asc' }
        }),
        prisma.news.findMany({
            where: { isPublished: true },
            orderBy: { publishDate: 'desc' },
            take: 4
        }),
        prisma.project.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: 'desc' },
            take: 3
        })
    ]);


    // Merge and shuffle discovery items
    const discoveryItems = [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...dining.map((d: any) => ({ 
            ...d, 
            itemType: "kainan" as const,
            cuisineType: d.cuisineType || undefined 
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...lodging.map((l: any) => ({ 
            ...l, 
            itemType: "tuluyan" as const,
            type: l.type || undefined 
        }))
// eslint-disable-next-line react-hooks/purity
    ].sort(() => Math.random() - 0.5);

    return (
        <main 
            className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-primary/30"
            style={{ "--primary-theme": themeColor } as React.CSSProperties}
        >
            <Navbar 
                logoUrl={logoUrl} 
                brandWord1={brandWord1} 
                brandWord2={brandWord2} 
                themeColor={themeColor} 
            />
            
            <Hero slides={slides} themeColor={themeColor} />
            
            <div className="space-y-4 pb-32">
                <DiningLodging items={discoveryItems} />
                <PlacesToVisit spots={tourismSpots} />
                
                {/* Major Updates: Events with Calendar */}
                <EventsCalendarSection events={events} />
                
                {/* Announcements & News Section */}
                <AnnouncementsNews announcements={announcements} news={news} />

                {/* Infrastructure Projects Section */}
                <LGUProjects projects={projects} />
                
                <JobBoard />
                <Government />
                <Services />
            </div>
            
            <EmergencyReport />
            <Footer 
                logoUrl={logoUrl} 
                brandWord1={brandWord1} 
                brandWord2={brandWord2} 
                themeColor={themeColor} 
            />
        </main>
    );
}
