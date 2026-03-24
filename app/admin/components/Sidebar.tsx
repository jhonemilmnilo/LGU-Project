"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
    LayoutDashboard, Users, Newspaper, Navigation,
    Briefcase, MapPin, Map,
    UtensilsCrossed, Calendar, Phone, FolderKanban, BedDouble, AlertTriangle, Settings, Layers, Megaphone, UserCheck, CloudLightning,
    ChevronDown, ChevronUp, LogOut, Menu, X, Info, Church
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarProps {
    session: {
        user?: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string;
            managedBarangay?: string | null;
        };
    };
    logoUrl?: string;
    brandWord1?: string;
    brandWord2?: string;
    themeColor?: string;
    pendingReportsCount?: number;
    pendingResidentsCount?: number;
}

export function Sidebar({
    session,
    logoUrl,
    brandWord1 = "E",
    brandWord2 = "Mapandan",
    themeColor = "#2563eb",
    pendingReportsCount = 0,
    pendingResidentsCount = 0
}: SidebarProps) {
    const pathname = usePathname();
    const role = session?.user?.role || "ADMIN";
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(pathname.startsWith("/admin/settings"));
    const [isAboutOpen, setIsAboutOpen] = React.useState(pathname.startsWith("/admin/about"));
    const [isBarangaysOpen, setIsBarangaysOpen] = React.useState(pathname.startsWith("/admin/barangays"));
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const allMenuItems = [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        {
            label: "Website Settings",
            icon: Settings,
            category: "Website Control",
            isDropdown: true,
            isOpen: isSettingsOpen,
            onToggle: () => setIsSettingsOpen(!isSettingsOpen),
            subItems: [
                { href: "/admin/settings?tab=general", label: "General" },
                { href: "/admin/settings?tab=login", label: "Login Branding" },
                { href: "/admin/settings?tab=hero", label: "Hero Carousel" },
                { href: "/admin/settings?tab=credentials", label: "Credentials" },
                { href: "/admin/settings?tab=sections", label: "Landing Sections" },
            ]
        },
        {
            label: "About Us Content",
            icon: Info,
            category: "Website Control",
            isDropdown: true,
            isOpen: isAboutOpen,
            onToggle: () => setIsAboutOpen(!isAboutOpen),
            subItems: [
                { href: "/admin/about", label: "Platform Info" },
                { href: "/admin/about/past-mayors", label: "Past Mayors" },
            ]
        },
        {
            label: "Barangays Mgmt",
            icon: Map,
            category: "Infrastructure",
            isDropdown: true,
            isOpen: isBarangaysOpen,
            onToggle: () => setIsBarangaysOpen(!isBarangaysOpen),
            subItems: [
                { href: "/admin/barangays/list", label: "Add/Edit Barangays" },
                { href: "/admin/barangays/admins", label: "Add Barangay Admins" },
            ]
        },
        { href: "/admin/announcements", label: "Announcements", icon: Megaphone, category: "Content" },
        { href: "/admin/news", label: "News & Updates", icon: Newspaper },
        { href: "/admin/events", label: "Events", icon: Calendar },
        { href: "/admin/projects", label: "LGU Projects", icon: FolderKanban },
        { href: "/admin/dining", label: "Kainan (Dining)", icon: UtensilsCrossed },
        { href: "/admin/accommodation", label: "Tuluyan (Stay)", icon: BedDouble },
        { href: "/admin/tourism", label: "Gallery", icon: Map },
        { href: "/admin/church", label: "Church Management", icon: Church },
        { href: "/admin/reports", label: "Public Reports", icon: AlertTriangle, category: "Management", badge: pendingReportsCount },
        { href: "/admin/jobs", label: "Job Postings", icon: Briefcase },
        { href: "/admin/officials", label: "Council Members", icon: Users },
        { href: "/admin/hotlines", label: "Hotlines", icon: Phone },
        { href: "/admin/resident-approvals", label: "Resident Approvals", icon: UserCheck, category: "Citizens & Services", badge: pendingResidentsCount },
        { href: "/admin/residents", label: "Resident Registry", icon: Users },
        { href: "/admin/households", label: "Household Map", icon: MapPin, category: "Data & Analysis" },
        { href: "/admin/users", label: "User Accounts", icon: UserCheck, category: "Security & Accounts" },
    ];

    const contentAdminAllowed = [
        "Dashboard",
        "About Us Content",
        "Announcements",
        "News & Updates",
        "Events",
        "LGU Projects",
        "Kainan (Dining)",
        "Tuluyan (Stay)",
        "Gallery",
        "Job Postings",
        "Typhoon Alerts"
    ];

    const barangayAdminAllowed = [
        "Dashboard",
        "Announcements",
        "News & Updates",
        "Events",
        "LGU Projects",
        "Kainan (Dining)",
        "Tuluyan (Stay)",
        "Gallery",
        "Church Management",
        "Job Postings",
        "Council Members",
        "Resident Approvals",
        "Resident Registry",
    ];

    let menuItems = allMenuItems;
    if (role === "CONTENT_ADMIN") {
        menuItems = allMenuItems.filter(item => contentAdminAllowed.includes(item.label));
    } else if (role === "BARANGAY_ADMIN") {
        menuItems = allMenuItems.filter(item => barangayAdminAllowed.includes(item.label));
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Toggle Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={cn(
                    "fixed z-50 p-2 bg-white dark:bg-[#1e2330] rounded-lg shadow-md border border-slate-200 dark:border-[#2a3040] transition-all duration-300 text-slate-600 dark:text-slate-300 hover:text-primary",
                    isSidebarOpen ? "opacity-0 pointer-events-none -translate-x-full" : "top-4 left-4 opacity-100 translate-x-0"
                )}
            >
                <Menu size={20} />
            </button>

            <aside className={cn(
                "fixed md:static inset-y-0 left-0 flex-shrink-0 z-40 bg-white dark:bg-[#1e2330] border-r border-slate-200 dark:border-[#2a3040] transition-all duration-300 overflow-hidden",
                isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:translate-x-0 md:w-0"
            )}>
                <div className="w-64 h-full flex flex-col justify-between">
                    <div className="overflow-y-auto custom-scrollbar flex-1 pb-4">
                        {/* Logo & Branding */}
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg"
                                    style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}33` }}
                                >
                                    {logoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover p-1.5" />
                                    ) : (
                                        <Map className="text-white w-5 h-5 transition-transform group-hover:rotate-12" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-slate-900 dark:text-slate-100 font-bold text-lg leading-tight">
                                        {brandWord1}<span style={{ color: themeColor }}>{brandWord2}</span>
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Admin Control</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <nav className="px-4 space-y-1">
                            {menuItems.map((item, idx) => {
                                const Icon = item.icon;
                                const hasCategory = item.category;

                                if (item.isDropdown) {
                                    return (
                                        <div key={idx}>
                                            {hasCategory && (
                                                <div className="pt-4 pb-2">
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">{item.category}</p>
                                                </div>
                                            )}
                                            <button
                                                onClick={item.onToggle}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group",
                                                    item.isOpen ? "bg-slate-50 dark:bg-white/5" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                                                )}
                                                style={{ color: item.isOpen ? themeColor : undefined }}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Icon size={18} style={{ color: item.isOpen ? themeColor : undefined }} className={cn(!item.isOpen && "text-slate-500")} />
                                                    <span>{item.label}</span>
                                                </div>
                                                {item.isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </button>

                                            {item.isOpen && (
                                                <div className="mt-1 ml-4 pl-4 border-l border-slate-200 dark:border-[#2a3040] space-y-1">
                                                    {item.subItems?.map((sub) => {
                                                        const isSubActive = pathname?.includes(sub.href.split("?")[0]) && (pathname?.includes("tab=") ? pathname?.includes(sub.href.split("tab=")[1] || "general") : true);
                                                        return (
                                                            <Link
                                                                key={sub.href}
                                                                href={sub.href}
                                                                className={cn(
                                                                    "block px-3 py-2 text-xs font-medium rounded-lg transition-all",
                                                                    isSubActive
                                                                        ? "font-bold"
                                                                        : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                                                                )}
                                                                style={{
                                                                    color: isSubActive ? themeColor : undefined,
                                                                    backgroundColor: isSubActive ? `${themeColor}15` : undefined
                                                                }}
                                                            >
                                                                {sub.label}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                const isActive = pathname === item.href;
                                return (
                                    <div key={item.href || idx}>
                                        {hasCategory && (
                                            <div className="pt-4 pb-2">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">{hasCategory}</p>
                                            </div>
                                        )}
                                        <Link
                                            href={item.href || "#"}
                                            className={cn(
                                                "flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group",
                                                isActive
                                                    ? "text-white shadow-lg font-bold"
                                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#2a3040]"
                                            )}
                                            style={{
                                                backgroundColor: isActive ? themeColor : undefined,
                                                boxShadow: isActive ? `0 10px 15px -3px ${themeColor}44` : undefined
                                            }}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {Icon && <Icon size={18} className={cn(isActive ? "text-white" : "text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300")} />}
                                                <span>{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                                    isActive ? "bg-white" : "bg-red-500 text-white"
                                                )} style={{ color: isActive ? themeColor : undefined }}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </div>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-4 space-y-2 border-t border-slate-200 dark:border-[#2a3040]">
                        <ThemeToggle />
                        <div className="flex items-center justify-between px-3 pt-4">
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-lg relative overflow-hidden"
                                    style={{ backgroundColor: themeColor, boxShadow: `0 4px 6px -1px ${themeColor}44` }}
                                >
                                    {session.user?.name?.charAt(0) || "A"}
                                    <div className="absolute inset-0 bg-white/10" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-slate-200 leading-none uppercase italic tracking-tighter">
                                        {session.user?.name}
                                    </p>
                                    <p
                                        className="text-[10px] text-slate-500 mt-1 hover:opacity-80 cursor-pointer transition-colors font-bold uppercase tracking-widest"
                                        style={{ color: themeColor }}
                                    >
                                        {role === "CONTENT_ADMIN" ? "Content Admin" : role === "BARANGAY_ADMIN" ? `Brgy. ${session?.user?.managedBarangay || "Admin"}` : "Admin System"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                                className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Log Out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
