"use client";

import { useTourism } from "../providers/TourismProvider";
import { Trees, CheckCircle2, FileEdit, Map as MapIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";

export function TourismCards() {
    const { tourismData, themeColor } = useTourism();

    const total = tourismData.length;
    const published = tourismData.filter(item => item.isPublished).length;
    const drafts = total - published;
    const natural = tourismData.filter(item => ["Beach", "Falls", "Island"].includes(item.category)).length;

    const cards = [
        {
            title: "Total Tourism Spots",
            value: total,
            icon: MapIcon,
            color: "text-white",
            bg: themeColor,
        },
        {
            title: "Published Spots",
            value: published,
            icon: CheckCircle2,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
        },
        {
            title: "Under Review / Draft",
            value: drafts,
            icon: FileEdit,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-500/10",
        },
        {
            title: "Natural Wonders",
            value: natural,
            icon: Trees,
            color: "text-teal-600 dark:text-teal-400",
            bg: "bg-teal-50 dark:bg-teal-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-[#151b2b] p-6 rounded-3xl shadow-md shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200 dark:ring-white/5 group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5 -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-1">{card.title}</p>
                            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{card.value}</p>
                        </div>
                        <div 
                            className={`p-4 rounded-2xl shadow-inner ${card.bg}`}
                            style={card.bg === themeColor ? { boxShadow: `inset 0 2px 4px rgba(0,0,0,0.1)` } as CSSProperties : {}}
                        >
                            <card.icon className={`${card.color} w-7 h-7`} />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}