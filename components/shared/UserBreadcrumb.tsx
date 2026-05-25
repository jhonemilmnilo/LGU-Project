"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface UserBreadcrumbProps {
    items?: {
        label: string;
        href?: string;
    }[];
    themeColor?: string;
}

const USER_FRIENDLY_SEGMENTS: Record<string, string> = {
    user: "Portal",
    updates: "Civic Updates",
    tourism: "Tourism Gallery",
    services: "Services",
    requests: "My Requests",
    "civil-registry": "Civil Registry Services",
    "marriage-registration": "Marriage Registration",
    "marriage-license-application": "Marriage License Application",
    "death-registration": "Death Registration",
    "birth-registration": "Birth Registration",
    "death-certificate-request": "Death Certificate Request",
    "birth-certificate-request": "Birth Certificate Request",
    cedula: "Cedula Application",
    "business-permit": "Business Permit",
    "building-permit": "Building Permit",
    projects: "Municipal Projects",
    reports: "Public Reports",
    officials: "Council Directory",
    news: "News & Updates",
    leadership: "Leadership",
    hotlines: "Emergency Hotlines",
    jobs: "Job Opportunities",
    disasters: "Disaster Risk Workspace",
    events: "Events Bulletin",
    church: "Church Services",
    dining: "Kainan (Dining)",
    accommodation: "Tuluyan (Stay)",
};

export function UserBreadcrumb({ items, themeColor }: UserBreadcrumbProps) {
    const pathname = usePathname();

    const activeColorStyle = themeColor ? { color: themeColor } : undefined;

    // Render items if statically passed as props
    if (items && items.length > 0) {
        return (
            <Breadcrumb>
                <BreadcrumbList className="bg-white/50 dark:bg-white/5 backdrop-blur-sm px-6 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5 w-fit shadow-sm">
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                                <Home className="w-3.5 h-3.5 mb-0.5" />
                                Home
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {items.map((item, idx) => (
                        <React.Fragment key={idx}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {item.href ? (
                                    <BreadcrumbLink asChild>
                                        <Link href={item.href} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                                            {item.label}
                                        </Link>
                                    </BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage 
                                        className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate"
                                        style={activeColorStyle}
                                    >
                                        {item.label}
                                    </BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
        );
    }

    // Auto-generate from pathname
    const segments = (pathname || "").split("/").filter(Boolean);

    // Filter out dynamic IDs (such as UUIDs, purely numeric IDs, or CUIDs)
    const isId = (s: string) => {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) || 
               /^\d+$/.test(s) ||
               (s.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(s));
    };

    const filteredSegments = segments.filter(s => !isId(s));

    // Construct crumbs
    const crumbs = filteredSegments.map((seg, i) => {
        const friendly = USER_FRIENDLY_SEGMENTS[seg] ?? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const href = "/" + filteredSegments.slice(0, i + 1).join("/");
        const isLast = i === filteredSegments.length - 1;
        return { seg, label: friendly, href, isLast };
    });

    // Exclude 'user' segment if it's the base segment to avoid "Home / Portal / Barangay Services"
    const filteredCrumbs = crumbs.filter(c => c.seg !== "user");

    return (
        <Breadcrumb>
            <BreadcrumbList className="bg-white/50 dark:bg-white/5 backdrop-blur-sm px-6 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5 w-fit shadow-sm">
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                            <Home className="w-3.5 h-3.5 mb-0.5" />
                            Home
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {filteredCrumbs.length === 0 ? (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage 
                                className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate"
                                style={activeColorStyle}
                            >
                                Portal
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                ) : (
                    filteredCrumbs.map((crumb) => (
                        <React.Fragment key={crumb.href}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {crumb.isLast ? (
                                    <BreadcrumbPage 
                                        className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate"
                                        style={activeColorStyle}
                                    >
                                        {crumb.label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={crumb.href} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                                            {crumb.label}
                                        </Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    ))
                )}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
