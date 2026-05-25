"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

interface PageBreadcrumbProps {
    items?: {
        label: string;
        href?: string;
    }[];
}

const FRIENDLY_SEGMENTS: Record<string, string> = {
    admin: "Admin",
    dashboard: "Dashboard",
    treasury: "Treasury Hub",
    residents: "Resident Registry",
    "resident-approvals": "Resident Approvals",
    transactions: "Transactions",
    users: "User Accounts",
    settings: "Settings",
    announcements: "Announcements",
    news: "News & Updates",
    events: "Events",
    projects: "LGU Projects",
    reports: "Public Reports",
    logistics: "Logistics",
    jobs: "Job Postings",
    officials: "Council Members",
    hotlines: "Hotlines",
    households: "Household Map",
    barangays: "Barangays",
    about: "About Us",
    services: "Barangay Services",
    content: "Content Management",
    accommodation: " Tuluyan (Stay)",
    dining: "Kainan (Dining)",
    tourism: "Tourism Gallery",
};

export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
    const pathname = usePathname();

    // Render static override items if provided
    if (items && items.length > 0) {
        return (
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-2 bg-slate-100 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50 shrink-0">
                <Link href="/admin/dashboard" className="hover:text-blue-500 transition-colors">
                    <Home size={12} className="text-blue-500" />
                </Link>
                {items.map((item, idx) => (
                    <React.Fragment key={idx}>
                        <span className="opacity-50">/</span>
                        {item.href ? (
                            <Link href={item.href} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                                {item.label}
                            </Link>
                        ) : (
                            <span className={idx === items.length - 1 ? "text-blue-600 dark:text-blue-400 font-bold" : ""}>
                                {item.label}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    }

    // Auto-generate based on current URL path segments
    const segments = (pathname || "").split("/").filter(Boolean);

    // Filter out dynamic IDs like database keys, indices, or UUIDs
    const isId = (s: string) => {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) || 
               /^\d+$/.test(s) ||
               (s.length >= 20 && /^[a-zA-Z0-9]+$/.test(s));
    };

    const filteredSegments = segments.filter(s => !isId(s));

    const crumbs = filteredSegments.map((seg, i) => {
        const friendly = FRIENDLY_SEGMENTS[seg] ?? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const href = "/" + filteredSegments.slice(0, i + 1).join("/");
        const isLast = i === filteredSegments.length - 1;
        return { seg, label: friendly, href, isLast };
    });

    // Filter out base segments to avoid redundancy ('admin' and 'dashboard')
    const nonAdminCrumbs = crumbs.filter(c => c.seg !== "admin" && c.seg !== "dashboard");

    return (
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-2 bg-slate-100 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50 shrink-0">
            <Link href="/admin/dashboard" className="hover:text-blue-500 transition-colors">
                <Home size={12} className="text-blue-500" />
            </Link>
            
            {nonAdminCrumbs.length === 0 ? (
                <>
                    <span className="opacity-50">/</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">Dashboard</span>
                </>
            ) : (
                nonAdminCrumbs.map((crumb) => (
                    <React.Fragment key={crumb.href}>
                        <span className="opacity-50">/</span>
                        {crumb.isLast ? (
                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                                {crumb.label}
                            </span>
                        ) : (
                            <Link href={crumb.href} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                                {crumb.label}
                            </Link>
                        )}
                    </React.Fragment>
                ))
            )}
        </div>
    );
}
