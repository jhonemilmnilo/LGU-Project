"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Megaphone, Calendar, Tag, ArrowRight, Pin, Home, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    barangay?: string | null;
}

interface UserAnnouncementsViewProps {
    initialAnnouncements: Announcement[];
    activeBarangays?: string[];
}

export function UserAnnouncementsView({ 
    initialAnnouncements = [], 
    activeBarangays = [] 
}: UserAnnouncementsViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBarangay, setSelectedBarangay] = useState("All");

    const barangayList = useMemo(() => {
        return ["All", ...activeBarangays.sort()];
    }, [activeBarangays]);

    const filteredAnnouncements = useMemo(() => {
        return initialAnnouncements.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 item.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesBarangay = selectedBarangay === "All" || item.barangay === selectedBarangay;
            return matchesSearch && matchesBarangay;
        });
    }, [initialAnnouncements, searchQuery, selectedBarangay]);

    const pageTitle = "Public Announcements";

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
                        <div className="w-14 h-14 bg-red-600 rounded-[22px] flex items-center justify-center shadow-2xl shadow-red-500/40 transform -rotate-3 hover:rotate-0 transition-transform">
                            <Megaphone className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{pageTitle}</h1>
                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-[0.3em] ml-1">Municipality Bulletin</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-[300px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notices or alerts..."
                            className="pl-11 h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold italic focus:ring-red-600/20 transition-all shadow-sm"
                        />
                    </div>

                    <div className="w-full sm:w-[200px]">
                        <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
                            <SelectTrigger className="h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold italic shadow-sm text-[10px] uppercase tracking-widest">
                                <Filter className="w-4 h-4 mr-2 text-red-600" />
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
                Stay updated with the latest official notices, priority bulletins, and emergency alerts from the local government unit of Mapandan.
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAnnouncements.map((item, idx) => {
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
                            className="bg-white dark:bg-[#0a0c10] p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col group hover:border-red-500 transition-all relative h-full"
                        >
                            {item.isPinned && (
                                <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1.5 bg-yellow-400 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 z-10">
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
                                    {item.barangay && (
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-auto">
                                            Brgy. {item.barangay}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="space-y-4 flex-1">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-red-600 transition-colors leading-tight italic">
                                        {item.title}
                                    </h3>
                                    
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-4 leading-relaxed">
                                        {item.content}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest italic">
                                            <Calendar className="w-3.5 h-3.5 text-red-600" />
                                            {format(new Date(item.createdAt), "MMM d, yyyy")}
                                        </div>
                                    </div>
                                    <Link href={`/user/announcements/${item.id}`}>
                                        <Button variant="ghost" className="p-0 h-auto text-red-600 hover:text-red-700 bg-transparent hover:bg-transparent font-black uppercase tracking-widest flex items-center gap-2 group/read text-[10px] italic">
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
            
            {filteredAnnouncements.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] bg-white dark:bg-black/10">
                    <Megaphone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic">No active notices found...</p>
                </div>
            )}
        </div>
    );
}
