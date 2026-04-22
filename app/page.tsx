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
import ParishCorner from "../components/sections/landing/ParishCorner";
import prisma from "@/lib/db/prisma";
import { getMultipleSystemSettings } from "@/lib/settings";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ barangay?: string | string[] }>;
}) {
    const { barangay } = await searchParams;
    const selectedBarangay = typeof barangay === "string" ? barangay : "All";
    const isFiltered = selectedBarangay !== "All";

    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;

    // Completely block any Admin/Content Admin from the landing page.
    if (session && role && role !== "USER") {
        redirect("/admin/dashboard");
    }

    // 0. Cinematic Delay - specifically for seeing the full animation as requested
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 1. Fetch all needed system settings first in one query
    const settings = await getMultipleSystemSettings([
        "maintenance_mode",
        "site_logo",
        "brand_word_1",
        "brand_word_2",
        "theme_color",
        "section_dining_lodging",
        "section_places_to_visit",
        "section_events",
        "section_announcements",
        "section_lgu_projects",
        "section_jobs",
        "section_government",
        "section_services",
        "section_emergency",
        "section_church",
        "section_map"
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

    // Section visibility settings (default to true if not set)
    const showDiningLodging = settings.get("section_dining_lodging") !== "false";
    const showPlacesToVisit = settings.get("section_places_to_visit") !== "false";
    const showEvents = settings.get("section_events") !== "false";
    const showAnnouncements = settings.get("section_announcements") !== "false";
    const showLGUProjects = settings.get("section_lgu_projects") !== "false";
    const showJobs = settings.get("section_jobs") !== "false";
    const showGovernment = settings.get("section_government") !== "false";
    const showServices = settings.get("section_services") !== "false";
    const showEmergency = settings.get("section_emergency") !== "false";
    const showChurch = settings.get("section_church") !== "false";
    const showMap = settings.get("section_map") !== "false";

    const [
        slides, tourismSpots, dining, lodging,
        announcements, events, news, projects,
        jobs, officials, hotlines,
        churchInfo, churchSchedules, latestCollection,
        barangays, transactionTypes
    ] = await Promise.all([
        prisma.heroSlide.findMany({
            where: { 
                isActive: true,
                ...(isFiltered ? { barangay: selectedBarangay } : { OR: [{ barangay: null }, { barangay: "" }] })
            } as any,
            orderBy: { order: 'asc' }
        }),
        prisma.tourismSpot.findMany({
            where: { 
                isPublished: true,
                ...(isFiltered ? { barangay: selectedBarangay } : {})
            } as any,
            take: 5
        }),
        prisma.dining.findMany({
            where: { 
                isPublished: true,
                ...(isFiltered ? { barangay: selectedBarangay } : {})
            } as any,
            take: 4
        }),
        prisma.accommodation.findMany({
            where: { 
                isPublished: true,
                ...(isFiltered ? { barangay: selectedBarangay } : {})
            } as any,
            take: 4
        }),
        prisma.announcement.findMany({
            where: {
                isActive: true,
                ...(isFiltered ? { barangay: selectedBarangay } : {})
            } as any,
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' }
            ],
            take: 3
        }),
        prisma.event.findMany({
            where: {
                isPublished: true,
                ...(isFiltered ? { barangay: selectedBarangay } : {})
            } as any,
            orderBy: { startDate: 'asc' }
        }),
        prisma.news.findMany({
            where: {
                isPublished: true,
                ...(isFiltered ? { barangay: selectedBarangay } : {})
            } as any,
            orderBy: { publishDate: 'desc' },
            take: 4
        }),
        prisma.project.findMany({
            where: {
                isPublished: true,
                 ...(isFiltered ? { barangay: selectedBarangay } : {})
            } as any,
            orderBy: { createdAt: 'desc' },
            take: 3
        }),
         
        (prisma as any).job.findMany({
            where: {
                isActive: true,
                 ...(isFiltered ? { barangay: selectedBarangay } : {})
            },
            orderBy: [
                { deadline: 'asc' },
                { createdAt: 'desc' }
            ],
            take: 3
        }),
        prisma.official.findMany({
            where: {
                isActive: true,
                ...(isFiltered ? { barangay: selectedBarangay, category: { in: ['Barangay Council', 'SK Council', 'Barangay', 'SK'] } } : {})
            } as any,
            orderBy: [
                { order: "asc" },
                { createdAt: "asc" }
            ]
        }),
        prisma.hotline.findMany({
            where: { isActive: true },
            orderBy: { order: "asc" }
        }),
        // Fetch ONLY Main Church (Global) context for the Landing Page
         
        (prisma as any).churchInfo.findFirst({
            where: { 
                ...(isFiltered ? { barangay: selectedBarangay } : { OR: [{ barangay: null }, { barangay: "" }] })
            } as any,
            include: { schedules: true }
        }),
        (prisma as any).churchSchedule.findMany({
            where: {
                churchInfo: { 
                    ...(isFiltered ? { barangay: selectedBarangay } : { OR: [{ barangay: null }, { barangay: "" }] })
                }
            } as any,
            orderBy: [{ day: "asc" }, { time: "asc" }]
        }),
        (prisma as any).churchCollection.findMany({
            where: {
                churchInfo: { 
                    ...(isFiltered ? { barangay: selectedBarangay } : { OR: [{ barangay: null }, { barangay: "" }] })
                }
            } as any,
            orderBy: { date: "desc" },
            take: 4
        }),
        (prisma as any).barangayInfo.findMany({
            select: { name: true },
            orderBy: { name: 'asc' }
        }).then((list: any[]) => list.map((b: any) => b.name)),
        prisma.transactionType.findMany({
            where: {
                isActive: true,
                code: "CEDULA_IND",
                level: isFiltered ? 2 : 1
            },
            orderBy: { name: "asc" }
        })
    ]);

    const services = (transactionTypes as any[]).map(t => ({
        id: t.id,
        code: t.code,
        name: t.name,
        description: t.description || "",
        fee: t.baseFee
    }));

    // Merge and shuffle discovery items
    const discoveryItems = [
         
        ...dining.map((d: any) => ({
            ...d,
            itemType: "kainan" as const,
            cuisineType: d.cuisineType || undefined
        })),
         
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
                barangays={barangays}
            />

            <Hero slides={slides} themeColor={themeColor} />

            <div className="space-y-4 pb-20">
                {showDiningLodging && <DiningLodging items={discoveryItems} />}
                {showPlacesToVisit && <PlacesToVisit spots={tourismSpots} />}

                {/* Major Updates: Events with Calendar */}
                {showEvents && <EventsCalendarSection events={events} />}

                {/* Announcements & News Section */}
                {showAnnouncements && <AnnouncementsNews announcements={announcements} news={news} />}

                {/* Infrastructure Projects Section */}
                {showLGUProjects && <LGUProjects projects={projects} />}

                {showJobs && <JobBoard jobs={jobs} />}
                {showGovernment && <Government officials={officials} barangay={selectedBarangay} />}
                {showServices && <Services services={services} themeColor={themeColor} />}
            </div>

            {showChurch && (
                <ParishCorner
                    info={churchInfo}
                    schedules={churchSchedules}
                    collections={latestCollection}
                />
            )}
            {showEmergency && <EmergencyReport initialHotlines={hotlines} showMap={showMap} />}
            <Footer
                logoUrl={logoUrl}
                brandWord1={brandWord1}
                brandWord2={brandWord2}
                themeColor={themeColor}
            />
        </main>
    );
}

