"use client";

import React, { useState, useEffect } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useBarangay } from "../providers/BarangayProvider";

interface BarangaySelectorProps {
    barangays: string[];
    themeColor: string;
}

export function BarangaySelector({ barangays, themeColor }: BarangaySelectorProps) {
    const { selectedBarangay, setSelectedBarangay } = useBarangay();
    const [isOpen, setIsOpen] = useState(false);

    // List of options including "All Barangays"
    const options = ["All", ...barangays];

    // Close selector when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setIsOpen(false);
        if (isOpen) {
            window.addEventListener("click", handleClickOutside);
        }
        return () => window.removeEventListener("click", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 border h-10 sm:h-12",
                    "bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200 dark:border-white/10",
                    "hover:border-slate-300 dark:hover:border-white/20 shadow-sm"
                )}
            >
                <div 
                    className="p-1.5 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${themeColor}15` }}
                >
                    <MapPin className="w-3.5 h-3.5" style={{ color: themeColor }} />
                </div>
                
                <div className="flex flex-col items-start min-w-[80px] sm:min-w-[100px]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 leading-none">
                        Viewing Area
                    </span>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                        {selectedBarangay === "All" ? "All Barangays" : `Brgy. ${selectedBarangay}`}
                    </span>
                </div>

                <ChevronDown 
                    className={cn(
                        "w-4 h-4 text-slate-400 transition-transform duration-300",
                        isOpen && "rotate-180"
                    )} 
                />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden z-[110] backdrop-blur-xl"
                    >
                        <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 py-2">Select Community</p>
                            {options.map((b) => (
                                <button
                                    key={b}
                                    onClick={() => {
                                        setSelectedBarangay(b);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group",
                                        selectedBarangay === b 
                                            ? "bg-slate-100 dark:bg-white/10" 
                                            : "hover:bg-slate-50 dark:hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full transition-all",
                                            selectedBarangay === b ? "scale-125" : "bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-300"
                                        )} style={{ backgroundColor: selectedBarangay === b ? themeColor : undefined }} />
                                        <span className={cn(
                                            "text-[12px] font-bold transition-colors",
                                            selectedBarangay === b ? "text-slate-900 dark:text-white" : "text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                                        )}>
                                            {b === "All" ? "All Barangays" : b}
                                        </span>
                                    </div>
                                    {selectedBarangay === b && (
                                        <Check className="w-4 h-4" style={{ color: themeColor }} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
