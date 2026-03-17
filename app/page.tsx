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
import { getSystemSetting, isMaintenanceMode } from "@/lib/settings";
import { redirect } from "next/navigation";

export default async function Home() {
    // 1. Check Maintenance Mode
    const maintenance = await isMaintenanceMode();
    if (maintenance) {
        redirect("/maintenance");
    }

    // 2. Fetch Dynamic Content
    const [slides, logoUrl, tourismSpots, dining, lodging, announcements, events, news, projects] = await Promise.all([
        prisma.heroSlide.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        }),
        getSystemSetting("site_logo", ""),
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
        <main className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-blue-600/30">
            <Navbar logoUrl={logoUrl} />
            
            <Hero slides={slides} />
            
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
            <Footer />
        </main>
    );
}
