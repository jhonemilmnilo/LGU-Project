"use client";

import { useEvents } from "../providers/EventsProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle2, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";

export function EventsCards() {
    const { events } = useEvents();

    const totalEvents = events.length;
    const publishedEvents = events.filter(e => e.isPublished).length;
    const upcomingEvents = events.filter(e => new Date(e.startDate) > new Date()).length;
    const festivals = events.filter(e => e.category === "Festival").length;

    const stats = [
        {
            label: "Total Events",
            value: totalEvents,
            icon: Calendar,
            color: "text-primary",
            bg: "bg-primary/10 dark:bg-primary/20",
        },
        {
            label: "Live on Portal",
            value: publishedEvents,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
        },
        {
            label: "Upcoming",
            value: upcomingEvents,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-900/20",
        },
        {
            label: "Festivals",
            value: festivals,
            icon: Star,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-900/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="overflow-hidden border-none shadow-md shadow-slate-200/50 dark:shadow-none hover:shadow-xl transition-all duration-300 group rounded-2xl bg-white dark:bg-[#151b2b]">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
