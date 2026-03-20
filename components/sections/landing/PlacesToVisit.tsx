"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
 
import { Camera, Map as MapIcon, Compass, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { TourismSpot } from "@prisma/client";

interface PlacesToVisitProps {
    spots?: TourismSpot[];
}

export function PlacesToVisit({ spots }: PlacesToVisitProps) {
    const router = useRouter();
    
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);

    const displaySpots = spots || [];

    // Auto-cycle logic
    React.useEffect(() => {
        if (!displaySpots.length || isPaused) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % displaySpots.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isPaused, displaySpots.length]);

    if (!spots || spots.length === 0) return null;



    return (
        <section id="tourism" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-0.5 bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Spotlight</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                        Gallery
                    </h2>
                </div>

                <div
                    onClick={() => router.push("/user/tourism")}
                    className="px-8 py-4 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all cursor-pointer shadow-xl shadow-primary/25 active:scale-95 group flex items-center gap-3"
                >
                    <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                    Explore Entire Gallery
                </div>
            </div>

            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-flow-dense"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {displaySpots.map((spot, idx) => {
                    const isActive = activeIndex === idx;

                    return (
                        <motion.div
                            key={spot.id}
                            layout
                            onClick={() => router.push(`/user/tourism/${spot.id}`)}
                            initial={false}
                            animate={{
                                filter: isActive ? "grayscale(0)" : "grayscale(0.4)"
                            }}
                            transition={{
                                duration: 0.6,
                                ease: "anticipate"
                            }}
                            className={cn(
                                "group relative h-[280px] rounded-[2rem] overflow-hidden shadow-xl cursor-pointer transition-all duration-700",
                                isActive ? "md:col-span-2 ring-2 ring-primary shadow-primary/20" : "col-span-1 ring-1 ring-slate-200 dark:ring-white/5 opacity-80 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={spot.imageUrl || "/place_to_visits/umbrella_rocks.png"}
                                alt={spot.name}
                                fill
                                className={cn(
                                    "object-cover transition-transform duration-1000",
                                    isActive ? "scale-105" : "scale-110"
                                )}
                            />

                            {/* Overlays */}
                            <div className={cn(
                                "absolute inset-0 transition-opacity duration-700",
                                isActive
                                    ? "bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-100"
                                    : "bg-black/50 opacity-100"
                            )} />
                            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />

                            {/* Content */}
                            <div className="absolute bottom-6 left-6 right-6 z-20 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-500",
                                        isActive ? "bg-primary border-primary/50 shadow-lg" : "bg-white/10 backdrop-blur-md border-white/20"
                                    )}>
                                        {isActive ? <Compass className="w-4 h-4 text-white animate-spin-slow" /> : <Camera className="w-4 h-4 text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl lg:text-2xl font-black text-white uppercase italic tracking-tighter leading-tight truncate">
                                            {spot.name}
                                        </h3>
                                        <p className="text-primary/90 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <MapIcon className="w-2.5 h-2.5" />
                                            {spot.address}
                                        </p>
                                    </div>
                                    {isActive && (
                                        <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {isActive && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-slate-200 text-xs lg:text-sm font-medium leading-relaxed max-w-2xl italic line-clamp-2 md:line-clamp-none"
                                        >
                                            {spot.description}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Active Progress Bar */}
                            {isActive && (
                                <motion.div
                                    className="absolute bottom-0 left-0 h-1 bg-primary z-30"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 5, ease: "linear" }}
                                    key={`progress-${activeIndex}`}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center gap-3">
                {displaySpots.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={cn(
                            "h-1 transition-all duration-500 rounded-full",
                            activeIndex === idx ? "w-10 bg-primary" : "w-2.5 bg-slate-200 dark:bg-white/10"
                        )}
                    />
                ))}
            </div>
        </section>
    );
}
