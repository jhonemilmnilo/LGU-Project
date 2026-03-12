"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Newspaper, 
    Map, 
    ShieldAlert, 
    AlertTriangle, 
    Settings, 
    Home,
    LogOut,
    UserCircle,
    Bell,
    Layers,
    UtensilsCrossed,
    BedDouble,
    Calendar,
    Briefcase,
    Phone,
    FolderKanban,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

interface UserSidebarProps {
    session: any;
}

export function UserSidebar({ session }: UserSidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        { href: "/user/dashboard", label: "Hub Home", icon: LayoutDashboard },
        { href: "/user/news", label: "News & Bulletins", icon: Newspaper, category: "Citizenship" },
        { href: "/user/events", label: "Town Events", icon: Calendar },
        { href: "/user/disasters", label: "Hazard Mapping", icon: Layers, category: "Safety & Defense" },
        { href: "/user/hotlines", label: "Emergency Lines", icon: Phone },
        { href: "/user/projects", label: "LGU Projects", icon: FolderKanban, category: "Development" },
        { href: "/user/jobs", label: "Opportunities", icon: Briefcase },
        { href: "/user/tourism", label: "Explore Agno", icon: Map, category: "Tourism" },
        { href: "/user/dining", label: "Kainan (Dining)", icon: UtensilsCrossed },
        { href: "/user/accommodation", label: "Tuluyan (Stay)", icon: BedDouble },
        { href: "/user/officials", label: "Town Officials", icon: Users },
    ];

    return (
        <aside className="w-80 bg-white dark:bg-[#0a0c10] border-r border-slate-100 dark:border-white/5 flex flex-col justify-between hidden lg:flex h-screen sticky top-0 z-50">
            <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
                {/* Brand Header */}
                <div className="p-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                            <Home className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                                Citizen<span className="text-blue-600">Hub</span>
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Municipality of Agno</p>
                        </div>
                    </Link>
                </div>

                {/* Profile Snapshot */}
                <div className="px-8 mb-10">
                    <div className="bg-slate-50 dark:bg-white/5 rounded-[2.5rem] p-6 border border-slate-100 dark:border-white/5 group hover:bg-blue-600 transition-all duration-500 cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/10 flex items-center justify-center overflow-hidden">
                                    <UserCircle className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-slate-50 dark:border-slate-900 rounded-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-white transition-colors">
                                    {session?.user?.name || "Citizen User"}
                                </p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-100 transition-colors">
                                    Verified Resident
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="px-8 space-y-1 pb-10">
                    {menuItems.map((item, idx) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <motion.div 
                                key={item.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                {item.category && (
                                    <div className="pt-8 pb-3 px-4">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">{item.category}</p>
                                    </div>
                                )}
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center justify-between px-5 py-4 rounded-[1.5rem] font-black uppercase tracking-tight transition-all duration-300 group text-sm",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-2xl shadow-blue-500/40 italic"
                                            : "text-slate-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <Icon className={cn("w-5 h-5 transition-transform", isActive ? "scale-110" : "group-hover:scale-110 group-hover:rotate-6")} />
                                        <span>{item.label}</span>
                                    </div>
                                    {isActive && (
                                        <motion.div 
                                            layoutId="active-nav-indicator"
                                            className="w-1.5 h-1.5 bg-white rounded-full"
                                        />
                                    )}
                                </Link>
                            </motion.div>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="p-8 border-t border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interface Mode</span>
                    <ThemeToggle />
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group text-xs"
                >
                    <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>Terminate Session</span>
                </button>
            </div>
        </aside>
    );
}
