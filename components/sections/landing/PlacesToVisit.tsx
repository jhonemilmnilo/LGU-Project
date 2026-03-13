"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Map as MapIcon, Compass, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TourismSpot } from "@prisma/client";

interface PlacesToVisitProps {
    spots?: TourismSpot[];
}

export function PlacesToVisit({ spots }: PlacesToVisitProps) {
    const displaySpots = spots && spots.length > 0 ? spots : [
        {
            id: 'mock-1',
            name: "Umbrella Rocks",
            address: "Sabangan, Agno",
            imageUrl: "/place_to_visits/umbrella_rocks.png",
            description: "Agno's most iconic landmark, famed for mushroom-shaped rock formations sculpted by the relentless waves of the West Philippine Sea.",
        },
        {
            id: 'mock-2',
            name: "Sabangan Beach",
            address: "Sabangan, Agno",
            imageUrl: "/place_to_visits/sabangan_beach.png",
            description: "Boasts a diverse marine ecosystem with beautiful corals and crystal-clear blue waters, ideal for snorkeling and diving.",
        },
        {
            id: 'mock-3',
            name: "Abagatanen Beach",
            address: "Abagatanen, Agno",
            imageUrl: "/place_to_visits/abagatanen_beach.png",
            description: "A serene beach known for its clear waters and fine sand, offering a peaceful escape for swimming and camping.",
        },
        {
            id: 'mock-4',
            name: "Death Pool",
            address: "Sabangan, Agno",
            imageUrl: "/place_to_visits/death_pool.png",
            description: "Isang natural rock pool na bilog at talagang maganda tignan sa personal, matatagpuan malapit sa Umbrella Rocks.",
        },
        {
            id: 'mock-5',
            name: "Payad Beach",
            address: "Payad, Agno",
            imageUrl: "/place_to_visits/payad_beach.png",
            description: "Rustic and charming destination offering a tranquil environment for relaxation by the sea.",
        }
    ];

    const [activeIndex, setActiveIndex] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);

    // Auto-cycle logic
    React.useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % displaySpots.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isPaused, displaySpots.length]);

    return (
        <section className="py-16 px-6 max-w-7xl mx-auto space-y-12">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-0.5 bg-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Discover Agno</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                    Places to Visit
                </h2>
                <p className="text-slate-500 font-medium italic max-w-xl">
                    Unveil the hidden gems and breathtaking landscapes that Agno has to offer through our rotating spotlight.
                </p>
            </div>

            {/* Horizontal Accordion Container */}
            <div 
                className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[550px]"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {displaySpots.map((spot, idx) => {
                    const isActive = activeIndex === idx;

                    return (
                        <motion.div
                            key={spot.id}
                            onClick={() => setActiveIndex(idx)}
                            initial={false}
                            animate={{ 
                                flex: isActive ? 4 : 1,
                                height: isActive ? "550px" : "550px", // Fixed height on desktop
                            }}
                            transition={{ 
                                duration: 0.8, 
                                ease: [0.16, 1, 0.3, 1] 
                            }}
                            className={cn(
                                "group relative overflow-hidden rounded-[2.5rem] cursor-pointer transition-all duration-500",
                                !isActive && "lg:opacity-80 hover:opacity-100",
                                "h-[400px] lg:h-full w-full" // Mobile height vs Desktop full height
                            )}
                        >
                            <Image
                                src={spot.imageUrl || "/place_to_visits/umbrella_rocks.png"}
                                alt={spot.name}
                                fill
                                className={cn(
                                    "object-cover transition-transform duration-1000",
                                    isActive ? "scale-105" : "scale-110 grayscale-[0.3] group-hover:scale-105 group-hover:grayscale-0"
                                )}
                            />
                            
                            {/* Overlay */}
                            <div className={cn(
                                "absolute inset-0 transition-opacity duration-700",
                                isActive 
                                    ? "bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100" 
                                    : "bg-black/40 opacity-100"
                            )} />

                            {/* Shrunk Content (Vertical Text) */}
                            <AnimatePresence mode="wait">
                                {!isActive && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center lg:items-end lg:justify-start lg:p-10 pointer-events-none"
                                    >
                                        <h3 className="text-xl lg:text-3xl font-black text-white/50 uppercase italic tracking-tighter lg:rotate-[-90deg] lg:origin-left whitespace-nowrap">
                                            {spot.name}
                                        </h3>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                        className="absolute bottom-10 left-10 right-10 z-20 space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                                                    <Compass className="w-5 h-5 text-white animate-spin-slow" />
                                                </div>
                                                <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[8px] font-black uppercase tracking-widest text-blue-400">
                                                    Spotlight
                                                </span>
                                            </div>
                                            <h3 className="text-4xl lg:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                                                {spot.name}
                                            </h3>
                                            <p className="text-blue-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                                <MapIcon className="w-3.5 h-3.5" />
                                                {spot.address}
                                            </p>
                                        </div>

                                        <p className="text-slate-200 text-sm lg:text-lg font-medium leading-relaxed max-w-2xl italic line-clamp-3 lg:line-clamp-none">
                                            {spot.description}
                                        </p>

                                        <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-blue-400 transition-colors pt-4 group/btn">
                                            Explore Spot
                                            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover/btn:border-blue-400 group-hover/btn:translate-x-2 transition-all">
                                                <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Progress Bar (Only visible for active) */}
                            {isActive && (
                                <motion.div 
                                    className="absolute bottom-0 left-0 h-1.5 bg-blue-600 z-30"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 5, ease: "linear" }}
                                    key={`progress-${idx}`}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Pagination Indicators */}
            <div className="flex justify-center gap-3 pt-4">
                {displaySpots.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={cn(
                            "h-1.5 transition-all duration-500 rounded-full",
                            activeIndex === idx ? "w-12 bg-blue-600" : "w-3 bg-slate-200 dark:bg-white/10"
                        )}
                    />
                ))}
            </div>
        </section>
    );
}
