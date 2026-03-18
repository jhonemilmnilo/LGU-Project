"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSlide } from "@prisma/client";
import Link from "next/link";

interface HeroProps {
    slides: HeroSlide[];
}

export function Hero({ slides }: HeroProps) {
    const [current, setCurrent] = React.useState(0);

    if (!slides || slides.length === 0) return null;

    const next = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    // Auto-advance
// eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(next, 8000);
        return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slides.length]);

    const activeSlide = slides[current];

    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-slate-950">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSlide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src={activeSlide.imageUrl}
                        alt={activeSlide.title}
                        fill
                        className="object-cover scale-105"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 z-10" />
                    <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay z-10" />
                </motion.div>
            </AnimatePresence>

            <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSlide.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-6 md:space-y-8"
                    >
                        <div className="space-y-3 md:space-y-4">
                            {activeSlide.tagline && (
                                <motion.span 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-blue-600/20 backdrop-blur-md border border-blue-400/30 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-blue-100"
                                >
                                    {activeSlide.tagline}
                                </motion.span>
                            )}
                            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white uppercase italic tracking-tighter leading-[0.9] md:leading-[0.85] whitespace-pre-line">
                                {activeSlide.title}
                            </h1>
                        </div>

                        {activeSlide.subtitle && (
                            <p className="max-w-xl md:max-w-2xl mx-auto text-base md:text-xl text-slate-200 font-medium leading-relaxed italic px-4">
                                {activeSlide.subtitle}
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            {activeSlide.primaryBtnText && (
                                <Link href={activeSlide.primaryBtnLink || "#"}>
                                    <Button className="px-10 py-4 h-auto bg-blue-600 hover:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-blue-500/25 active:scale-95 flex items-center gap-3">
                                        <Compass className="w-5 h-5" />
                                        {activeSlide.primaryBtnText}
                                    </Button>
                                </Link>
                            )}
                            {activeSlide.secondaryBtnText && (
                                <Link href={activeSlide.secondaryBtnLink || "#"}>
                                    <Button className="px-10 py-4 h-auto bg-blue-600 hover:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-blue-500/25 active:scale-95 flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-white" />
                                        {activeSlide.secondaryBtnText}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            {slides.length > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex justify-between px-4 md:px-10 pointer-events-none">
                    <button 
                        onClick={prev}
                        className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white backdrop-blur-md transition-all pointer-events-auto active:scale-90"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={next}
                        className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white backdrop-blur-md transition-all pointer-events-auto active:scale-90"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* Slide Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={cn(
                                "h-1.5 transition-all rounded-full",
                                current === i ? "w-10 bg-blue-600" : "w-3 bg-white/30"
                            )}
                        />
                    ))}
                </div>
            )}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
