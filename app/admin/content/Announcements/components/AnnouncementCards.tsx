"use client";

import { useAnnouncements } from "../providers/AnnouncementProvider";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Megaphone, Bell, AlertTriangle, Pin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AnnouncementCards() {
    const { announcements } = useAnnouncements();

    const total = announcements.length;
    const critical = announcements.filter(a => a.priority === "Critical" && a.isActive).length;
    const pinned = announcements.filter(a => a.isPinned && a.isActive).length;

    const cards = [
        {
            title: "Total Notices",
            value: total,
            icon: Megaphone,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/20",
        },
        {
            title: "Pinned Briefs",
            value: pinned,
            icon: Pin,
            color: "text-orange-600",
            bg: "bg-orange-100 dark:bg-orange-900/20",
        },
        {
            title: "Critical Alerts",
            value: critical,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-100 dark:bg-red-900/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card key={index} className="border-none shadow-md shadow-slate-200/50 dark:shadow-none bg-white dark:bg-[#151b2b] rounded-3xl overflow-hidden relative group ring-1 ring-slate-200 dark:ring-white/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5 -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-1">
                                        {card.title}
                                    </p>
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">
                                        {card.value}
                                    </h3>
                                </div>
                                <div className={`p-4 rounded-2xl ${card.bg} shadow-inner`}>
                                    <Icon className={`w-7 h-7 ${card.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
