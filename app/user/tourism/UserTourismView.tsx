"use client";

import { motion } from "framer-motion";
import { Compass, Home } from "lucide-react";
import Image from "next/image";
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
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export function UserTourismView({ initialTourism = [] }: { initialTourism: TourismSpot[] }) {
    return (
        <div className="space-y-8 pb-20">
            {/* Breadcrumb section */}
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
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic">Explore Mapandan / Gallery</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary rounded-[22px] flex items-center justify-center shadow-2xl shadow-primary/40 transform -rotate-3 hover:rotate-0 transition-transform">
                            <Compass className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Gallery</h1>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] ml-1">The natural wonders</p>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-2xl text-lg leading-relaxed">
                        Explore the natural wonders and cultural landmarks of Mapandan.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {initialTourism.map((spot, idx) => (
                    <Link key={spot.id} href={`/user/tourism/${spot.id}`}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative aspect-auto md:aspect-[4/5] min-h-[500px] rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-white/5"
                        >
                            <Image
                                src={spot.imageUrl || "https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&q=80&w=800"}
                                alt={spot.name || "Tourism Spot"}
                                fill
                                className="object-cover"
                                priority={idx < 3}
                            />
                            
                            {/* Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
                            
                            {/* Content */}
                            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 space-y-2 sm:space-y-3 z-20">
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-tight">
                                    {spot.name}
                                </h3>
                                <div className="space-y-3">
                                    <p className="text-primary text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2">
                                        {spot.address}
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

            {initialTourism.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] bg-white dark:bg-black/10">
                    <Compass className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic">Tourism registry is being updated...</p>
                </div>
            )}
        </div>
    );
}
