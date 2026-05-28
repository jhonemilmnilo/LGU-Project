"use client";

import { useJobs } from "../providers/JobsProvider";
import { Briefcase, Activity, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function JobsCards() {
    const { jobsData } = useJobs();

    const totalJobs = jobsData.length;
    const activeJobs = jobsData.filter(j => j.isActive).length;
    const closedJobs = totalJobs - activeJobs;

    const cards = [
        {
            title: "Total Job Postings",
            value: totalJobs,
            icon: Briefcase,
            color: "text-primary",
            bg: "bg-primary/10 dark:bg-primary/20",
        },
        {
            title: "Active Openings",
            value: activeJobs,
            icon: Activity,
            color: "text-emerald-600",
            bg: "bg-emerald-100 dark:bg-emerald-900/20",
        },
        {
            title: "Closed Positions",
            value: closedJobs,
            icon: FileText,
            color: "text-slate-600",
            bg: "bg-slate-100 dark:bg-slate-900/20",
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
