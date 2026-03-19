"use client";

import { motion } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Calendar, MapPin, Clock, Tag, ArrowRight, Home } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserEventsView({ initialEvents = [] }: { initialEvents: any[] }) {
    return (
        <div className="space-y-8 pb-20">
            <Breadcrumb>
                <BreadcrumbList className="bg-black/20 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/10 w-fit shadow-sm">
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                                <Home className="w-3.5 h-3.5 mb-0.5" />
                                Home
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-white/50" />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">Community Pulse</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Community Pulse</h1>
                </div>
                <p className="text-slate-500 font-medium italic max-w-xl mx-auto">
                    Explore upcoming festivals, municipal celebrations, and community gatherings. Join the vibrant spirit of Mapandan.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {initialEvents.map((event, idx) => (
                    <Link key={event.id} href={`/user/events/${event.id}`}>
                        <motion.div
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-[#0a0c10] rounded-[3.5rem] p-4 flex flex-col md:flex-row gap-8 border border-slate-100 dark:border-white/5 shadow-2xl hover:border-primary/30 transition-all group overflow-hidden h-full"
                        >
                            <div className="relative aspect-[16/10] md:aspect-square md:w-[240px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shrink-0">
                                <Image
                                    src={event.imageUrl || "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800"}
                                    alt={event.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 flex flex-col items-center justify-center w-14 h-16 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl">
                                    <span className="text-[10px] font-black uppercase text-primary leading-none mb-1">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-xl font-black text-slate-900 leading-none italic">{new Date(event.startDate).getDate()}</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-center py-4 pr-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest">{event.category || "General Event"}</span>
                                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Clock className="w-3 h-3" />
                                        {event.time || "8:00 AM"}
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors mb-4">{event.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic mb-6 line-clamp-2">{event.description}</p>
                                
                                <div className="flex items-center gap-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors mb-8">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">{event.venueName}</span>
                                </div>
                                
                                <div className="flex gap-3">
                                    <Button className="flex-1 h-14 bg-slate-950 dark:bg-primary/20 text-white dark:text-primary rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 group/btn border border-transparent dark:border-primary/30">
                                        Join Celebration
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {initialEvents.length === 0 && (
                <div className="py-20 text-center opacity-50 italic">Seasonal updates coming soon...</div>
            )}
        </div>
    );
}
