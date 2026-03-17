"use client";

import { motion } from "framer-motion";
import { 
    MapPin, 
    Clock, 
    Utensils, 
    Home, 
    ArrowRight, 
    Search,
    Filter
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
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function UserDiningView({ initialDining = [] }: { initialDining: any[] }) {
    return (
        <div className="space-y-10 pb-20">
            {/* Breadcrumb section */}
            <Breadcrumb>
                <BreadcrumbList className="bg-white/50 dark:bg-white/5 backdrop-blur-sm px-6 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5 w-fit shadow-sm">
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <Home className="w-3.5 h-3.5 mb-0.5" />
                                Home
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-blue-600 italic">Explore Agno / Dining Hub</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-sky-600 rounded-[22px] flex items-center justify-center shadow-2xl shadow-blue-500/40 transform hover:rotate-3 transition-transform">
                            <Utensils className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Dining Hub</h1>
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] ml-1">Kainan at Sarap</p>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-2xl text-lg leading-relaxed">
                        Explore Agno&apos;s diverse culinary landscape. From beachfront grills to cozy town center cafes, discover the true taste of our municipality.
                    </p>
                </div>
            </div>

            {/* Content section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {initialDining.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="group flex flex-col space-y-6"
                    >
                        {/* Image Container matching landing page style */}
                        <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-slate-200 dark:ring-white/5 transition-transform duration-500 group-hover:scale-[1.02]">
                            <Image
                                src={item.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800"}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
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

                            {/* View Overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                <div className="p-4 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 text-white scale-90 group-hover:scale-100 transition-transform">
                                    <Search className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4 px-2">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter group-hover:text-orange-500 transition-colors">
                                    {item.name}
                                </h3>
                                <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-500 transition-colors">
                                    <MapPin className="w-4 h-4 text-orange-500" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest truncate italic">{item.address}</span>
                                </div>
                            </div>
                            
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2 leading-relaxed h-10">
                                {item.description}
                            </p>
                            
                            <div className="flex items-center justify-between pt-4">
                                <Link href={`/user/dining/${item.id}`} className="flex-1">
                                    <Button className="h-12 px-8 bg-slate-900 dark:bg-white/5 dark:hover:bg-orange-500 text-white dark:hover:text-white rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 group/btn transition-all shadow-md">
                                        Explore Showcase
                                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 italic ml-4">
                                    <Clock className="w-4 h-4 text-orange-400" />
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
