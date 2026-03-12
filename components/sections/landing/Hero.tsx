"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Compass, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/agno_hero_cinematic_coastline.png" // Pointing to the generated asset path contextually
                    alt="Agno Coastline"
                    fill
                    className="object-cover scale-105"
                    priority
                />
                {/* Multi-layered Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10" />
                <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay z-10" />
            </div>

            {/* Content Container */}
            <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8"
                >
                    <div className="space-y-4">
                        <motion.span 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-4 py-1.5 bg-blue-600/20 backdrop-blur-md border border-blue-400/30 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-blue-100"
                        >
                            The Home of the Umbrella Rocks
                        </motion.span>
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase italic tracking-tighter leading-[0.85]">
                            Welcome <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">To Agno</span>
                        </h1>
                    </div>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-200 font-medium leading-relaxed italic">
                        Discover the pristine beauty of the Umbrella Rocks, our vibrant 
                        community, and the rich heritage of our municipality.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                            <Compass className="w-5 h-5" />
                            Explore Tourism
                        </Button>
                        <Button variant="outline" className="h-16 px-10 bg-white/10 backdrop-blur-md hover:bg-white/20 border-white/20 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                            Municipal Services
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent z-20" />

            {/* Floating Indicators */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4">
                <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 vertical-text">Scroll</span>
            </div>
        </section>
    );
}
