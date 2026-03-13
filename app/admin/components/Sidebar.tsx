"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, Newspaper,
    Briefcase, MapPin, Map,
    UtensilsCrossed, Calendar, Phone, FolderKanban, BedDouble, AlertTriangle, Settings, ShieldAlert, Layers, Megaphone
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

    const menuItems = [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/settings", label: "Website Settings", icon: Settings, category: "Website Control" },
        { href: "/admin/announcements", label: "Announcements", icon: Megaphone, category: "Content" },
        { href: "/admin/news", label: "News & Updates", icon: Newspaper },
        { href: "/admin/events", label: "Events", icon: Calendar },
        { href: "/admin/projects", label: "LGU Projects", icon: FolderKanban },
        { href: "/admin/dining", label: "Kainan (Dining)", icon: UtensilsCrossed },
        { href: "/admin/accommodation", label: "Tuluyan (Stay)", icon: BedDouble },
        { href: "/admin/tourism", label: "Tourism Spots", icon: Map },
        { href: "/admin/reports", label: "Public Reports", icon: AlertTriangle, category: "Management", badge: 3 },
        { href: "/admin/jobs", label: "Job Postings", icon: Briefcase },
        { href: "/admin/officials", label: "Council Members", icon: Users },
        { href: "/admin/hotlines", label: "Hotlines", icon: Phone },
        { href: "/admin/residents", label: "Resident Registry", icon: Users, category: "Citizens & Services" },
        { href: "/admin/households", label: "Household Map", icon: MapPin, category: "Data & Analysis" },
        { href: "/admin/disasters/manage", label: "Disaster Maps", icon: Layers },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-[#1e2330] border-r border-slate-200 dark:border-[#2a3040] flex flex-col justify-between hidden md:flex transition-colors duration-300">
            <div>
                {/* Logo & Branding */}
                <div className="p-6 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        <Map className="text-teal-600 w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-slate-900 dark:text-slate-100 font-bold text-lg leading-tight">Agno Admin</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Municipality of Agno</p>
                    </div>
                </div>

                <nav className="px-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <div key={item.href}>
                                {item.category && (
                                    <div className="pt-4 pb-2">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">{item.category}</p>
                                    </div>
                                )}
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#2a3040]"
                                    )}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Icon size={18} className={cn(isActive ? "text-white" : "text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300")} />
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

            <div className="p-4 space-y-2">
                <ThemeToggle />
                <Link
                    href="/admin/settings"
                    className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                        pathname === "/admin/settings"
                            ? "bg-slate-100 dark:bg-[#2a3040] text-slate-900 dark:text-slate-100"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#2a3040]"
                    )}
                >
                    <Settings size={18} />
                    <span>Settings</span>
                </Link>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-[#2a3040] flex items-center justify-between px-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            {session.user?.name?.charAt(0) || "A"}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-200 leading-none">{session.user?.name}</p>
                            <p className="text-xs text-slate-500 mt-1 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors">Logout</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
