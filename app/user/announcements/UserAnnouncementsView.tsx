"use client";

import { motion } from "framer-motion";
import { Megaphone, Calendar, Tag, ArrowRight, Pin, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";

export interface Announcement {
    id: string;
    title: string;
    content: string;
    priority: string;
    category: string;
    isPinned: boolean;
    isActive: boolean;
    expiryDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export function UserAnnouncementsView({ initialAnnouncements = [] }: { initialAnnouncements: Announcement[] }) {
    return (
        <div className="space-y-12 pb-20">
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
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">Public Announcements</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30">
                            <Megaphone className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Announcements</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        Important notices, alerts, and priority bulletins from the municipal government.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {initialAnnouncements.map((item, idx) => {
                    const priorityColors = {
                        Critical: "bg-red-600 text-white",
                        High: "bg-orange-600 text-white",
                        Normal: "bg-blue-600 text-white",
                        Low: "bg-slate-600 text-white",
                    };
                    const priorityClass = priorityColors[item.priority as keyof typeof priorityColors] || priorityColors.Normal;

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-[#0a0c10] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col group hover:border-red-500 transition-all relative"
                        >
                            {item.isPinned && (
                                <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1.5 bg-yellow-400 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                    <Pin className="w-3.5 h-3.5" />
                                    Pinned
                                </div>
                            )}
                            <div className="space-y-6 flex-1 flex flex-col pt-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${priorityClass}`}>
                                        {item.priority}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5 text-red-600" />
                                        {item.category}
                                    </span>
                                </div>
                                
                                <div className="space-y-4 flex-1">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-red-600 transition-colors leading-tight">
                                        {item.title}
                                    </h3>
                                    
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-4 leading-relaxed">
                                        {item.content}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <Link href={`/user/announcements/${item.id}`}>
                                        <Button variant="ghost" className="p-0 h-auto text-red-600 hover:text-red-700 bg-transparent hover:bg-transparent font-black uppercase tracking-widest flex items-center gap-2 group/read">
                                            Read
                                            <ArrowRight className="w-4 h-4 group-hover/read:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            
            {initialAnnouncements.length === 0 && (
                <div className="py-20 text-center space-y-4 opacity-50">
                    <Megaphone className="w-16 h-16 mx-auto text-slate-300" />
                    <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">No announcements</h3>
                </div>
            )}
        </div>
    );
}
