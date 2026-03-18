"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
    LayoutDashboard, Users, Newspaper,
    Briefcase, MapPin, Map,
    UtensilsCrossed, Calendar, Phone, FolderKanban, BedDouble, AlertTriangle, Settings, ShieldAlert, Layers, Megaphone, UserCheck,
    ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarProps {
    session: {
        user?: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    };
}

export function Sidebar({ session }: SidebarProps) {
    const pathname = usePathname();
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(pathname.startsWith("/admin/settings"));

    const menuItems = [
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
            ]
        },
        { href: "/admin/announcements", label: "Announcements", icon: Megaphone, category: "Content" },
        { href: "/admin/news", label: "News & Updates", icon: Newspaper },
        { href: "/admin/events", label: "Events", icon: Calendar },
        { href: "/admin/projects", label: "LGU Projects", icon: FolderKanban },
        { href: "/admin/dining", label: "Kainan (Dining)", icon: UtensilsCrossed },
        { href: "/admin/accommodation", label: "Tuluyan (Stay)", icon: BedDouble },
        { href: "/admin/tourism", label: "Gallery", icon: Map },
        { href: "/admin/reports", label: "Public Reports", icon: AlertTriangle, category: "Management", badge: 3 },
        { href: "/admin/jobs", label: "Job Postings", icon: Briefcase },
        { href: "/admin/officials", label: "Council Members", icon: Users },
        { href: "/admin/hotlines", label: "Hotlines", icon: Phone },
        { href: "/admin/residents", label: "Resident Registry", icon: Users, category: "Citizens & Services" },
        { href: "/admin/households", label: "Household Map", icon: MapPin, category: "Data & Analysis" },
        { href: "/admin/disasters/manage", label: "Disaster Maps", icon: Layers },
        { href: "/admin/users", label: "User Accounts", icon: UserCheck, category: "Security & Accounts" },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-[#1e2330] border-r border-slate-200 dark:border-[#2a3040] flex flex-col justify-between hidden md:flex transition-colors duration-300">
            <div className="overflow-y-auto custom-scrollbar">
                {/* Logo & Branding */}
                <div className="p-6 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        <Map className="text-blue-600 w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-slate-900 dark:text-slate-100 font-bold text-lg leading-tight">E-Mapandan</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Admin Portal</p>
                    </div>
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
                                            item.isOpen ? "bg-slate-50 dark:bg-white/5 text-blue-600" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon size={18} className={cn(item.isOpen ? "text-blue-600" : "text-slate-500")} />
                                            <span>{item.label}</span>
                                        </div>
                                        {item.isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>

                                    {item.isOpen && (
                                        <div className="mt-1 ml-4 pl-4 border-l border-slate-200 dark:border-[#2a3040] space-y-1">
                                            {item.subItems?.map((sub) => {
                                                const isSubActive = pathname + (window.location.search || "") === sub.href;
                                                return (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        className={cn(
                                                            "block px-3 py-2 text-xs font-medium rounded-lg transition-all",
                                                            isSubActive 
                                                                ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10 font-bold" 
                                                                : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                                                        )}
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
                            <div key={item.href}>
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
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-bold"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#2a3040]"
                                    )}
                                >
                                    <div className="flex items-center space-x-3">
                                        {Icon && <Icon size={18} className={cn(isActive ? "text-white" : "text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300")} />}
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                            isActive ? "bg-white text-blue-600" : "bg-red-500 text-white"
                                        )}>
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
                <div className="flex items-center justify-between px-3 pt-2">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/30">
                            {session.user?.name?.charAt(0) || "A"}
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-slate-200 leading-none uppercase italic tracking-tighter">
                                {session.user?.name}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 hover:text-blue-600 cursor-pointer transition-colors font-bold uppercase tracking-widest">Logout</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
