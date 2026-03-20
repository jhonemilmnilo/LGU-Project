"use client";

import { motion } from "framer-motion";
import { 
    MapPin, 
    Clock, 
    Utensils, 
    Home, 
    ArrowRight
} from "lucide-react";
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

export interface Dining {
    id: string;
    name: string;
    description: string;
    address: string;
    imageUrl?: string | null;
    openingHours?: string | null;
    cuisineType?: string | null;
    contactNumber?: string | null;
    facebookUrl?: string | null;
    googleMapsUrl?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export default function UserDiningView({ initialDining = [] }: { initialDining: Dining[] }) {
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
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic">Dining Hub</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-[22px] flex items-center justify-center shadow-2xl shadow-primary/40 transform hover:rotate-3 transition-transform">
                            <Utensils className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Dining Hub</h1>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] ml-1">Kainan at Sarap</p>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-2xl text-lg leading-relaxed">
                        Explore Mapandan&apos;s diverse culinary landscape. From beachfront grills to cozy town center cafes, discover the true taste of our municipality.
                    </p>
                </div>
            </div>

            {/* Content section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
                {initialDining.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="group bg-white dark:bg-[#0f1117] rounded-[3.5rem] border border-slate-200 dark:border-[#2a3040] hover:border-primary/40 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col h-full active:scale-[0.98]"
                    >
                        {/* Image Container - No search icon */}
                        <div className="relative aspect-[16/10] overflow-hidden">
                            <Image
                                src={item.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800"}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                priority={idx < 3}
                            />
                            
                            {/* Badges */}
                            <div className="absolute top-6 left-6 z-20 flex flex-col items-start gap-2">
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    <Utensils className="w-3.5 h-3.5" />
                                    Kainan
                                </span>
                                {item.cuisineType && (
                                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.15em] text-slate-900 shadow-lg">
                                        {item.cuisineType}
                                    </span>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>

                        {/* Details - More visible with background and themed border */}
                        <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter group-hover:text-primary transition-colors leading-tight">
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-500 transition-colors">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span className="text-[11px] font-bold uppercase tracking-widest truncate italic">{item.address}</span>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2 leading-relaxed h-10">
                                    {item.description}
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-white/5">
                                <Link href={`/user/dining/${item.id}`} className="flex-1">
                                    <Button className="h-12 px-8 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 shadow-md">
                                        Explore
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 italic ml-4 shrink-0">
                                    <Clock className="w-4 h-4 text-primary" />
                                    {item.openingHours || "TBA"}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {initialDining.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center space-y-4 opacity-40">
                    <Utensils className="w-12 h-12" />
                    <p className="font-black uppercase tracking-widest text-xs italic">Paluto pa lang kami... Stay tuned!</p>
                </div>
            )}
        </div>
    );
}
