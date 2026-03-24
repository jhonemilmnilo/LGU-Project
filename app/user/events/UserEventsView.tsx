"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Tag, ArrowRight, Home, Search, Filter } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { format } from "date-fns";

interface UserEventsViewProps {
    initialEvents: any[];
    activeBarangays?: string[];
}

export function UserEventsView({ 
    initialEvents = [], 
    activeBarangays = [] 
}: UserEventsViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBarangay, setSelectedBarangay] = useState("All");

    const barangayList = useMemo(() => {
        return ["All", ...activeBarangays.sort()];
    }, [activeBarangays]);

    const filteredEvents = useMemo(() => {
        return initialEvents.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (item.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 item.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesBarangay = selectedBarangay === "All" || item.barangay === selectedBarangay;
            return matchesSearch && matchesBarangay;
        });
    }, [initialEvents, searchQuery, selectedBarangay]);

    const pageTitle = "Community Events";

    return (
        <div className="space-y-12 pb-20">
            {/* Breadcrumb section */}
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
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">{pageTitle}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            {/* Header section with Search/Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-primary rounded-[22px] flex items-center justify-center shadow-2xl shadow-primary/40 transform rotate-3 hover:rotate-0 transition-transform">
                            <Calendar className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{pageTitle}</h1>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] ml-1">Festivals & Gatherings</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-[300px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search festivals or sports..."
                            className="pl-11 h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold italic focus:ring-primary/20 transition-all shadow-sm"
                        />
                    </div>

                    <div className="w-full sm:w-[200px]">
                        <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
                            <SelectTrigger className="h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold italic shadow-sm text-[10px] uppercase tracking-widest">
                                <Filter className="w-4 h-4 mr-2 text-primary" />
                                <SelectValue placeholder="Barangay" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-2xl">
                                {barangayList.map(b => (
                                    <SelectItem key={b} value={b} className="font-bold italic text-[10px] uppercase tracking-widest">
                                        {b === "All" ? "All Locations" : b}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <p className="text-slate-500 font-medium italic max-w-2xl text-lg leading-relaxed">
                Discover the vibrant community life in Mapandan. From municipal festivals to local sports leagues, there&apos;s always something happening.
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-[#0a0c10] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col group hover:border-primary transition-all relative h-full overflow-hidden"
                    >
                        {item.imageUrl && (
                            <div className="relative h-56 w-full overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={item.imageUrl} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                                <div className="absolute top-4 left-4">
                                    <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary shadow-xl">
                                        {item.category}
                                    </div>
                                </div>
                                {item.barangay && (
                                    <div className="absolute top-4 right-4">
                                        <div className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                                            {item.barangay}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="p-8 flex-1 flex flex-col space-y-6">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary italic">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(item.startDate), "MMMM d, yyyy")} • {format(new Date(item.startDate), "h:mm aa")}
                                </div>
                                
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-tight italic">
                                    {item.title}
                                </h3>
                                
                                <div className="flex items-start gap-2 text-slate-400">
                                    <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest italic leading-relaxed">
                                        {item.venueName}<br />
                                        {item.address}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-3 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                                <Link href={`/user/events/${item.id}`} className="block w-full">
                                    <button className="w-full py-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:bg-primary group-hover:text-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 italic">
                                        View Event Details
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            
            {filteredEvents.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] bg-white dark:bg-black/10">
                    <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic">No events scheduled at the moment...</p>
                </div>
            )}
        </div>
    );
}
