"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Compass, Home, Search, Filter } from "lucide-react";
import Image from "next/image";
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

export interface TourismSpot {
    id: string;
    name: string;
    description: string;
    address: string;
    imageUrl?: string | null;
    category?: string | null;
    entranceFee?: string | null;
    bestTimeToVisit?: string | null;
    googleMapsUrl?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    contactNumber?: string | null;
    barangay?: string | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface UserTourismViewProps {
    initialTourism: TourismSpot[];
    activeBarangays?: string[];
}

export function UserTourismView({ 
    initialTourism = [], 
    activeBarangays = [] 
}: UserTourismViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBarangay, setSelectedBarangay] = useState("All");

    const barangayList = useMemo(() => {
        return ["All", ...activeBarangays.sort()];
    }, [activeBarangays]);

    const filteredTourism = useMemo(() => {
        return initialTourism.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesBarangay = selectedBarangay === "All" || item.barangay === selectedBarangay;
            return matchesSearch && matchesBarangay;
        });
    }, [initialTourism, searchQuery, selectedBarangay]);

    return (
        <div className="space-y-10 pb-20">
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
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic">Explore Mapandan / Gallery</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary rounded-[22px] flex items-center justify-center shadow-2xl shadow-primary/40 transform hover:rotate-3 transition-transform">
                            <Compass className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Gallery</h1>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] ml-1">The natural wonders</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-[300px] group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search landmarks or gems..."
                            className="pl-11 h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold italic placeholder:text-slate-400 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    <div className="w-full sm:w-[200px]">
                        <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
                            <SelectTrigger className="h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold italic focus:ring-primary/20">
                                <Filter className="w-4 h-4 mr-2 text-primary" />
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

            <p className="text-slate-500 font-medium italic max-w-2xl text-lg leading-relaxed">
                Explore the natural wonders and cultural landmarks of Mapandan. Discover hidden gems and popular destinations across our beautiful town.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredTourism.map((spot, idx) => (
                    <Link key={spot.id} href={`/user/tourism/${spot.id}`}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative aspect-auto md:aspect-[4/5] min-h-[500px] rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-white/5 active:scale-[0.98] transition-transform"
                        >
                            <Image
                                src={spot.imageUrl || "https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&q=80&w=800"}
                                alt={spot.name || "Tourism Spot"}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                priority={idx < 3}
                            />
                            
                            {/* Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
                            
                            {/* Content */}
                            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 space-y-2 sm:space-y-3 z-20">
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors">
                                    {spot.name}
                                </h3>
                                <div className="space-y-3">
                                    <p className="text-primary text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2">
                                        {spot.address} {spot.barangay && `• Barangay ${spot.barangay}`}
                                    </p>
                                    <p className="text-sm text-slate-300 font-medium italic line-clamp-3 leading-relaxed">
                                        {spot.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {filteredTourism.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] bg-white dark:bg-black/10">
                    <Compass className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic">Tourism registry is being updated...</p>
                </div>
            )}
        </div>
    );
}
