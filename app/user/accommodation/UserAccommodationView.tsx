"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
    Bed, 
    MapPin, 
    Home, 
    ArrowRight,
    Search,
    Filter
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn } from "@/lib/utils";

export interface Accommodation {
    id: string;
    name: string;
    description: string;
    address: string;
    imageUrl?: string | null;
    priceRange?: string | null;
    type?: string | null;
    contactNumber?: string | null;
    websiteUrl?: string | null;
    barangay?: string | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface UserAccommodationViewProps {
    initialAccommodations: Accommodation[];
    activeBarangays?: string[];
}

export function UserAccommodationView({ 
    initialAccommodations = [], 
    activeBarangays = [] 
}: UserAccommodationViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBarangay, setSelectedBarangay] = useState("All");

    const barangayList = useMemo(() => {
        return ["All", ...activeBarangays.sort()];
    }, [activeBarangays]);

    const filteredAccommodations = useMemo(() => {
        return initialAccommodations.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesBarangay = selectedBarangay === "All" || item.barangay === selectedBarangay;
            return matchesSearch && matchesBarangay;
        });
    }, [initialAccommodations, searchQuery, selectedBarangay]);

    return (
        <div className="space-y-4 md:space-y-10 pb-20">
            {/* Breadcrumb section */}
            <Breadcrumb className="px-4 md:px-0">
                <BreadcrumbList className="bg-white/50 dark:bg-white/5 backdrop-blur-sm px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl border border-slate-100 dark:border-white/5 w-fit shadow-sm">
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
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic">Accommodations</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header section */}
            <div className="sticky md:static top-[70px] md:top-auto z-40 bg-white/95 dark:bg-[#0a0c10]/95 md:bg-transparent md:dark:bg-transparent px-4 md:px-0 pt-4 pb-3 md:py-0 -mx-4 md:mx-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-8 border-b border-slate-200/50 dark:border-white/5 md:border-none shadow-sm md:shadow-none">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl md:rounded-[22px] flex items-center justify-center shadow-lg md:shadow-2xl shadow-primary/40 transform hover:rotate-3 transition-transform shrink-0">
                            <Bed className="w-5 h-5 md:w-7 md:h-7 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Stay & Relax</h1>
                            <p className="text-[8px] md:text-[10px] font-bold text-primary uppercase tracking-[0.3em] ml-1">Tuluyan at Resorts</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-row items-center gap-2 md:gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-[300px] group">
                        <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2">
                            <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="pl-9 md:pl-11 h-10 md:h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl md:rounded-2xl font-bold italic text-xs md:text-sm placeholder:text-slate-400 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    <div className="w-[130px] md:w-[200px] shrink-0">
                        <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
                            <SelectTrigger className="h-10 md:h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl md:rounded-2xl font-bold italic text-[10px] md:text-sm focus:ring-primary/20">
                                <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-primary" />
                                <SelectValue placeholder="Barangay" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-2xl">
                                {barangayList.map(b => (
                                    <SelectItem key={b} value={b} className="font-bold italic">
                                        {b === "All" ? "All Locations" : b}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Content section */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-10 px-4 md:px-0 pt-2 md:pt-0">
                {filteredAccommodations.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="group bg-white dark:bg-[#0f1117] rounded-xl md:rounded-[3.5rem] border border-slate-200 dark:border-[#2a3040] hover:border-primary/40 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col h-full active:scale-[0.98]"
                    >
                        <Link href={`/user/accommodation/${item.id}`} className="flex flex-col h-full">
                            {/* Image Container */}
                            <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
                                <Image
                                    src={item.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"}
                                    alt={item.name}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    priority={idx < 3}
                                />
                                
                                {/* Badges */}
                                <div className="absolute top-2 left-2 md:top-6 md:left-6 z-20 flex flex-col items-start gap-1 md:gap-2">
                                    <span className="inline-flex items-center gap-1 md:gap-2 px-2 py-1 md:px-4 md:py-2 bg-primary text-white rounded-full text-[6px] md:text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        <Bed className="w-2 h-2 md:w-3.5 md:h-3.5" />
                                        Tuluyan
                                    </span>
                                    {item.type && (
                                        <span className="inline-flex items-center gap-1 md:gap-2 px-2 py-1 md:px-4 md:py-1.5 bg-white/95 backdrop-blur-none md:backdrop-blur-md rounded-full text-[5px] md:text-[9px] font-black uppercase tracking-[0.15em] text-slate-900 shadow-lg">
                                            {item.type}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            {/* Details */}
                            <div className="p-3 md:p-8 space-y-2 md:space-y-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-1.5 md:space-y-4">
                                    <div className="space-y-0.5 md:space-y-2">
                                        <h3 className="text-[11px] md:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter group-hover:text-primary transition-colors leading-tight line-clamp-1">
                                            {item.name}
                                        </h3>
                                        <div className="flex items-center gap-1 md:gap-2 text-slate-400 group-hover:text-slate-500 transition-colors">
                                            <MapPin className="w-2.5 h-2.5 md:w-4 md:h-4 text-primary shrink-0" />
                                            <span className="text-[6px] md:text-[11px] font-bold uppercase tracking-widest truncate italic">
                                                {item.address}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-[8px] md:text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2 md:line-clamp-2 leading-relaxed h-6 md:h-10">
                                        {item.description}
                                    </p>
                                </div>
                                
                                <div className="flex items-center justify-between md:justify-between pt-2 md:pt-8 mt-auto border-t border-slate-100 dark:border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[6px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 md:mb-1">Starts at</span>
                                        <span className="text-[9px] md:text-lg font-black text-primary italic tracking-tighter leading-none">{item.priceRange || "Inquire"}</span>
                                    </div>
                                    <div className="hidden md:block">
                                        <Button className="h-9 md:h-12 px-4 md:px-8 bg-primary text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[9px] flex items-center gap-1.5 md:gap-2 shadow-md hover:shadow-lg transition-shadow">
                                            Explore
                                            <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {filteredAccommodations.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center space-y-4 opacity-40">
                    <Bed className="w-12 h-12" />
                    <p className="font-black uppercase tracking-widest text-xs italic">Preparations in progress... Beachfront soon!</p>
                </div>
            )}
        </div>
    );
}
