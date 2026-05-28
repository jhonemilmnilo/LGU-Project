"use client";

import { useAccommodation } from "../providers/AccommodationProvider";
import { BedDouble, CheckCircle2, FileEdit, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export function AccommodationCards() {
    const { accommodationData } = useAccommodation();

    const total = accommodationData.length;
    const published = accommodationData.filter(item => item.isPublished).length;
    const drafts = total - published;
    const resorts = accommodationData.filter(item => item.type?.toLowerCase() === "resort").length;

    const cards = [
        {
            title: "Total Accommodations",
            value: total,
            icon: Building2,
            color: "text-primary dark:text-primary",
            bg: "bg-primary/10 dark:bg-primary/10",
        },
        {
            title: "Published Listings",
            value: published,
            icon: CheckCircle2,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
        },
        {
            title: "Draft Entries",
            value: drafts,
            icon: FileEdit,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-500/10",
        },
        {
            title: "Resorts & Hotels",
            value: resorts,
            icon: BedDouble,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-500/10",
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
                    className="bg-white dark:bg-[#151b2b] p-6 rounded-2xl border border-slate-200 dark:border-[#2a3040] shadow-sm hover:shadow-md transition-shadow group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 group-hover:scale-105 transition-transform duration-300 origin-left">{card.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                            <card.icon className={`${card.color} w-6 h-6`} />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
