import * as React from "react";
import nextDynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/landing/Hero";
import { HashScrollHandler } from "@/components/shared/HashScrollHandler";
import { Skeleton } from "@/components/ui/skeleton";

function SectionSkeleton() {
  return (
    <div className="w-full py-12 px-6 max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="flex justify-center">
        <Skeleton className="h-12 w-[300px] rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[300px] rounded-3xl w-full" />
        <Skeleton className="h-[300px] rounded-3xl w-full" />
        <Skeleton className="h-[300px] rounded-3xl w-full hidden lg:block" />
      </div>
    </div>
  );
}

const DiningLodging = nextDynamic(() => import("@/components/sections/landing/DiningLodging").then(m => m.DiningLodging), { loading: () => <SectionSkeleton /> });
const PlacesToVisit = nextDynamic(() => import("@/components/sections/landing/PlacesToVisit").then(m => m.PlacesToVisit), { loading: () => <SectionSkeleton /> });
const EventsCalendarSection = nextDynamic(() => import("@/components/sections/landing/EventsCalendarSection").then(m => m.EventsCalendarSection), { loading: () => <SectionSkeleton /> });
const AnnouncementsNews = nextDynamic(() => import("@/components/sections/landing/AnnouncementsNews").then(m => m.AnnouncementsNews), { loading: () => <SectionSkeleton /> });
const JobBoard = nextDynamic(() => import("@/components/sections/landing/JobBoard").then(m => m.JobBoard), { loading: () => <SectionSkeleton /> });
const LGUProjects = nextDynamic(() => import("@/components/sections/landing/LGUProjects").then(m => m.LGUProjects), { loading: () => <SectionSkeleton /> });
const Government = nextDynamic(() => import("@/components/sections/landing/Government").then(m => m.Government), { loading: () => <SectionSkeleton /> });
const Services = nextDynamic(() => import("@/components/sections/landing/Services").then(m => m.Services), { loading: () => <SectionSkeleton /> });
const EmergencyReport = nextDynamic(() => import("@/components/sections/landing/EmergencyReport").then(m => m.EmergencyReport), { loading: () => <SectionSkeleton /> });
const ParishCorner = nextDynamic(() => import("../components/sections/landing/ParishCorner"), { loading: () => <SectionSkeleton /> });
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

    // Validate barangay: if a specific barangay is requested, check if it exists in the database
    if (isFiltered) {
        const exists = await prisma.barangayInfo.findUnique({
            where: { name: selectedBarangay },
            select: { id: true }
        });
        if (!exists) {
            redirect("/");
        }
    }

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
            <HashScrollHandler />
            <Navbar
                logoUrl={logoUrl}
                brandWord1={brandWord1}
                brandWord2={brandWord2}
                themeColor={themeColor}
                barangays={barangays}
            />

            <Hero slides={slides} themeColor={themeColor} />

            <div className="space-y-4 pb-6 md:pb-0">
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

