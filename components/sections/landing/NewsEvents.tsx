"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Calendar, Newspaper, ArrowUpRight, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

const events = [
    {
        id: 1,
        date: "JAN 15",
        title: "Town Fiesta 2024",
        description: "Join us for a week-long celebration of culture and heritage.",
    },
    {
        id: 2,
        date: "JUN 01",
        title: "Labor Day Coastal Cleanup",
        description: "Community-led effort to keep our beaches pristine.",
    }
];

const news = [
    {
        id: 1,
        date: "October 10, 2023",
        title: "New Healthcare Facility Inaugurated",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400",
        summary: "The municipal government opens a new healthcare station to improve services."
    },
    {
        id: 2,
        date: "October 08, 2023",
        title: "Road Widening Project Begins",
        image: "https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&q=80&w=400",
        summary: "DPWH announces the start of the highway widening project to ease traffic."
    }
];

export function NewsEvents() {
    return (
        <section id="news" className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Upcoming Events */}
            <div className="space-y-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Upcoming Events</h2>
                    </div>
                    <Button variant="link" className="text-xs font-black uppercase tracking-widest text-blue-600 p-0">Calendar</Button>
                </div>

                <div className="space-y-6">
                    {events.map((event, idx) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group flex items-center gap-6 p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 hover:border-blue-200 transition-all cursor-pointer"
                        >
                            <div className="flex flex-col items-center justify-center min-w-[80px] h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-200">{event.date.split(' ')[0]}</span>
                                <span className="text-xl sm:text-2xl font-black italic tracking-tighter">{event.date.split(' ')[1]}</span>
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors">{event.title}</h3>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium italic">{event.description}</p>
                            </div>
                            <ArrowUpRight className="hidden sm:block w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Latest News */}
            <div className="space-y-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <Newspaper className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Latest News</h2>
                    </div>
                    <Button variant="link" className="text-xs font-black uppercase tracking-widest text-blue-600 p-0">View More</Button>
                </div>

                <div className="space-y-8">
                    {news.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-6 group cursor-pointer"
                        >
                            <div className="relative min-w-[100px] sm:min-w-[120px] h-20 sm:h-24 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-white/10 shrink-0">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{item.date}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        Municipal
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-tight">{item.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic line-clamp-1">{item.summary}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
