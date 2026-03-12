"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
    LayoutDashboard, 
    ShieldAlert, 
    ArrowUpRight, 
    Newspaper, 
    Calendar, 
    Briefcase,
    ChevronRight,
    MapPin,
    AlertCircle,
    Info,
    Layers,
    Waves,
    Wind
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const stats = [
    { label: "Active Alerts", value: "0", icon: ShieldAlert, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
    { label: "Reports Filed", value: "2", icon: Info, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Job Openings", value: "8", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
    { label: "Town Events", value: "3", icon: Calendar, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
];

export default function UserDashboard() {
    const { data: session } = useSession();

    return (
        <div className="space-y-12 pb-20">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden group rounded-[3rem] bg-blue-600 p-12 text-white shadow-2xl shadow-blue-500/30"
            >
                <div className="absolute top-0 right-0 w-[40%] h-full bg-white/10 skew-x-12 translate-x-20 transition-transform duration-1000 group-hover:translate-x-10" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Citizen Persona</span>
                        </div>
                        <h1 className="text-5xl font-black uppercase italic tracking-tighter">
                            Hello, {session?.user?.name || "Citizen"}!
                        </h1>
                        <p className="max-w-xl text-blue-100 font-medium italic opacity-80">
                            Welcome to your personalized Citizen Hub. Stay informed, stay safe, and engage with your local government effortlessly.
                        </p>
                    </div>
                    <Button className="h-16 px-10 bg-white text-blue-600 hover:bg-white/90 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-black/10 transition-all hover:scale-105">
                        Complete Profile
                    </Button>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-stats gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white dark:bg-[#0a0c10] p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-6 group hover:border-blue-500 transition-all"
                    >
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-600", stat.bg)}>
                            <stat.icon className={cn("w-7 h-7 group-hover:text-white transition-colors", stat.color)} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none italic">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Mid Section: Safety & News (2 spans) */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Live Hazard Map Preview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-[3rem] bg-slate-900 overflow-hidden relative group aspect-[21/9]"
                    >
                        <Image 
                            src="https://images.unsplash.com/photo-1524660958328-46c876ec608d?auto=format&fit=crop&q=80&w=1200"
                            alt="Map Preview"
                            fill
                            className="object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                        
                        <div className="absolute top-8 left-8 flex items-center gap-2">
                             <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Agno Monitoring: System Normal</span>
                        </div>

                        <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Layers className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Live Hazard Maps</h3>
                                </div>
                                <p className="text-slate-300 text-sm font-medium italic">Explore flood zones and landslide risks in your area.</p>
                            </div>
                            <Link href="/user/disasters">
                                <Button className="h-14 px-8 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white text-white hover:text-blue-600 font-black uppercase tracking-widest transition-all">
                                    Analyze Area
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Status Floaties */}
                        <div className="absolute right-10 top-10 flex flex-col gap-4">
                            <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-3">
                                <Waves className="w-4 h-4 text-blue-400" />
                                <span className="text-[9px] font-black uppercase text-slate-100">Sea Level 0.2m</span>
                            </div>
                            <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-3">
                                <Wind className="w-4 h-4 text-slate-400" />
                                <span className="text-[9px] font-black uppercase text-slate-100">Wind 5km/h</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bulletin Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 bg-white dark:bg-[#0a0c10] rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center">
                                        <Newspaper className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Recent News</h3>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-slate-300" />
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Today</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Umbrella Rock Restoration Project 2024</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Yesterday</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Mobile Dental Clinic Schedule Announced</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white dark:bg-[#0a0c10] rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Town Events</h3>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-slate-300" />
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Jan 15</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Grand Town Fiesta - Parade & Feast</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Feb 14</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Serenade at the Park: Valentine's Concert</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions & Notifications */}
                <div className="space-y-10">
                    <div className="p-8 bg-white dark:bg-[#0a0c10] rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-10 h-10 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/5">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Incident Reports</h3>
                        </div>
                        <p className="text-sm text-slate-500 font-medium italic leading-relaxed">Is there an issue in your barangay? Report it directly to the municipality and track the resolution status.</p>
                        <Button className="w-full h-14 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest italic group hover:bg-blue-600 transition-all">
                            Submit New Report
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    <div className="p-8 bg-blue-50/50 dark:bg-white/5 rounded-[2.5rem] border border-blue-100 dark:border-white/5 space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Latest Announcements</h4>
                        <div className="space-y-6">
                           <div className="flex gap-4">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic">NBI Clearance Mobile Service arrives on March 20th.</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Municipal Hall Atrium</p>
                                </div>
                           </div>
                           <div className="flex gap-4">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Disaster preparedness training for Sabangan residents.</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Brgy Hall, 2PM</p>
                                </div>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { cn } from "@/lib/utils";
