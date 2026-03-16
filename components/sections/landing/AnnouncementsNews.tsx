"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Megaphone, Newspaper, ArrowUpRight, Clock, Tag, Pin, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";

interface Announcement {
    id: string;
    title: string;
    content: string;
    priority: string;
    category: string;
    isPinned: boolean;
    createdAt: Date;
}

interface News {
    id: string;
    title: string;
    content: string;
    imageUrl: string | null;
    publishDate: Date;
    category: string;
    author: string | null;
}

interface AnnouncementsNewsProps {
    announcements: Announcement[];
    news: News[];
}

export function AnnouncementsNews({ announcements, news }: AnnouncementsNewsProps) {
    return (
        <section id="news" className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left Column: Public Announcements */}
            <div className="space-y-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/10">
                            <Megaphone className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Citizens Broadcast</span>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Announcements</h2>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {announcements.length === 0 ? (
                        <div className="bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] p-12 text-center">
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">No urgent notices today.</p>
                        </div>
                    ) : (
                        announcements.map((item, idx) => (
                            <Link key={item.id} href={`/user/announcements/${item.id}`} className="block">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group bg-slate-50 dark:bg-white/5 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {item.isPinned && (
                                                    <span className="bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                                                        <Pin className="w-2.5 h-2.5" />
                                                        Pinned
                                                    </span>
                                                )}
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                                    item.priority === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    item.priority === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                    'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                    {item.priority} Priority
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest">
                                                {format(new Date(item.createdAt), "MMM d")}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight group-hover:text-orange-600 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2">
                                                {item.content}
                                            </p>
                                        </div>
                                        <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Tag className="w-3 h-3 text-orange-500" />
                                            {item.category}
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-600/10 transition-colors" />
                                </motion.div>
                            </Link>
                        ))
                    )}
                </div>
                
                <Link href="/user/updates">
                    <Button variant="ghost" className="w-full h-14 border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400 font-black uppercase tracking-widest text-[9px] rounded-3xl hover:bg-orange-50 dark:hover:bg-orange-500/5 hover:text-orange-600 hover:border-orange-500 transition-all mt-6">
                        Archived Broadcasts
                    </Button>
                </Link>
            </div>

            {/* Right Column: Latest News */}
            <div className="space-y-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                            <Newspaper className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Municipality News</span>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Latest Stories</h2>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    {news.length === 0 ? (
                        <div className="bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] p-12 text-center">
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">No news updates posted.</p>
                        </div>
                    ) : (
                        news.map((item, idx) => (
                            <Link key={item.id} href={`/user/news/${item.id}`} className="block">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex flex-col md:flex-row items-center gap-8 group cursor-pointer bg-white dark:bg-[#0f1117] p-8 rounded-[2.5rem] border border-slate-200 dark:border-[#2a3040] hover:border-blue-500 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden"
                                >
                                    <div className="relative min-w-[140px] w-full md:w-auto h-40 md:h-32 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-slate-200 dark:border-white/10 shrink-0 ring-1 ring-slate-200 dark:ring-white/5">
                                        <Image
                                            src={item.imageUrl || "/news/default.png"}
                                            alt={item.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors" />
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-500/20">
                                                <Calendar className="w-2.5 h-2.5" />
                                                {format(new Date(item.publishDate), "MMM d, yyyy")}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Tag className="w-2.5 h-2.5" />
                                                {item.category}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center justify-between gap-4">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2">
                                                {item.content}
                                            </p>
                                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <ArrowUpRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors" />
                                </motion.div>
                            </Link>
                        ))
                    )}
                </div>

                <Link href="/user/news">
                    <Button className="w-full h-14 bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 group">
                        Explore All Stories
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
