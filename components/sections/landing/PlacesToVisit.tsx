"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Camera, Map as MapIcon, Compass, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { TourismSpot } from "@prisma/client";

interface PlacesToVisitProps {
    spots?: TourismSpot[];
}

export function PlacesToVisit({ spots }: PlacesToVisitProps) {
    const router = useRouter();
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

    const handleCardClick = (id: string, idx: number) => {
        if (activeIndex === idx) {
            router.push(`/user/places-to-visit/${id}`);
        } else {
            setActiveIndex(idx);
        }
    };

    return (
        <section className="py-12 px-6 max-w-7xl mx-auto space-y-10">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-0.5 bg-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Spotlight</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                    Places to Visit
                </h2>
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
                            onClick={() => handleCardClick(spot.id, idx)}
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
                                isActive ? "md:col-span-2 ring-2 ring-blue-600 shadow-blue-500/20" : "col-span-1 ring-1 ring-slate-200 dark:ring-white/5 opacity-80 hover:opacity-100"
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
                            <div className="absolute inset-0 bg-blue-600/5 mix-blend-overlay z-10" />

                            {/* Content */}
                            <div className="absolute bottom-6 left-6 right-6 z-20 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-500",
                                        isActive ? "bg-blue-600 border-blue-500 shadow-lg" : "bg-white/10 backdrop-blur-md border-white/20"
                                    )}>
                                        {isActive ? <Compass className="w-4 h-4 text-white animate-spin-slow" /> : <Camera className="w-4 h-4 text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl lg:text-2xl font-black text-white uppercase italic tracking-tighter leading-tight truncate">
                                            {spot.name}
                                        </h3>
                                        <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
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
                                    className="absolute bottom-0 left-0 h-1 bg-blue-600 z-30"
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
                            activeIndex === idx ? "w-10 bg-blue-600" : "w-2.5 bg-slate-200 dark:bg-white/10"
                        )}
                    />
                ))}
            </div>
        </section>
    );
}
