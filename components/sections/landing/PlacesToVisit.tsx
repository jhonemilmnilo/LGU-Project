"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera, Map as MapIcon, Compass } from "lucide-react";

const destinations = [
    {
        id: 1,
        title: "Umbrella Rocks",
        location: "Sabangan",
        image: "https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&q=80&w=1200", // Representative
        description: "Agno's most iconic landmark, famed for mushroom-shaped rock formations sculpted by the relentless waves of the West Philippine Sea.",
        span: "col-span-1 lg:col-span-2"
    },
    {
        id: 2,
        title: "Agno River",
        location: "Town Proper",
        image: "https://images.unsplash.com/photo-1437482012496-100b11f2ee2d?auto=format&fit=crop&q=80&w=800",
        description: "Explore the lifeblood of our town through breathtaking river tours.",
        span: "col-span-1"
    }
];

export function PlacesToVisit() {
    return (
        <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
            <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                    Places to Visit
                </h2>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        Unveil the hidden gems and breathtaking landscapes that Agno has to offer.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {destinations.map((dest, idx) => (
                    <motion.div
                        key={dest.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.2 }}
                        viewport={{ once: true }}
                        className={cn(
                            "group relative aspect-[16/10] md:aspect-auto min-h-[400px] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl",
                            dest.id === 1 ? "md:col-span-2" : "col-span-1"
                        )}
                    >
                        <Image
                            src={dest.image}
                            alt={dest.title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        
                        {/* Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                        <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay z-10" />

                        {/* Content */}
                        <div className="absolute bottom-8 left-8 right-8 z-20 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{dest.title}</h3>
                                    <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <MapIcon className="w-3 h-3" />
                                        {dest.location}
                                    </p>
                                </div>
                            </div>
                            <p className="text-slate-200 text-sm font-medium leading-relaxed max-w-md italic">
                                {dest.description}
                            </p>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute top-8 right-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40">
                                <Compass className="w-5 h-5 text-white animate-spin-slow" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

import { cn } from "@/lib/utils";
