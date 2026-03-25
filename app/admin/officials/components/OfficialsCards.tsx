"use client";

import { useOfficials } from "../providers/OfficialsProvider";
import { Users, UserCheck, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function OfficialsCards() {
    const { officialsData, selectedCategory } = useOfficials();

    // Filter by category first if not "All"
    const displayData = selectedCategory === "All" ? officialsData : officialsData.filter(o => o.category === selectedCategory);

    const totalOfficials = displayData.length;
    const activeOfficials = displayData.filter(o => o.isActive).length;
    const mayorsAndVice = displayData.filter(o => {
        const pos = o.position.toLowerCase();
        return pos.includes("mayor") || pos.includes("captain") || pos.includes("chairman");
    }).length;

    const cards = [
        {
            title: "Total Council Members",
            value: totalOfficials,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/20",
        },
        {
            title: "Active Term",
            value: activeOfficials,
            icon: UserCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-100 dark:bg-emerald-900/20",
        },
        {
            title: "Executive Officers",
            value: mayorsAndVice,
            icon: ShieldCheck,
            color: "text-amber-600",
            bg: "bg-amber-100 dark:bg-amber-900/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card key={index} className="border-none shadow-md shadow-slate-200/50 dark:shadow-none bg-white dark:bg-[#151b2b] rounded-2xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5 -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                        {card.title}
                                    </p>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {card.value}
                                    </h3>
                                </div>
                                <div className={`p-4 rounded-xl ${card.bg}`}>
                                    <Icon className={`w-6 h-6 ${card.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
