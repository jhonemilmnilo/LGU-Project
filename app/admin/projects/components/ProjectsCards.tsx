"use client";

import { useProjects } from "../providers/ProjectsProvider";
import { FolderKanban, CheckCircle2, Clock, PauseCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ProjectsCards() {
    const { projectsData } = useProjects();

    const totalProjects = projectsData.length;
    const completedProjects = projectsData.filter(p => p.status === "Completed").length;
    const ongoingProjects = projectsData.filter(p => p.status === "Ongoing").length;
    const plannedProjects = projectsData.filter(p => p.status === "Planned").length;

    const cards = [
        {
            title: "Total Projects",
            value: totalProjects,
            icon: FolderKanban,
            color: "text-primary",
            bg: "bg-primary/10 dark:bg-primary/20",
        },
        {
            title: "Ongoing",
            value: ongoingProjects,
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-100 dark:bg-orange-900/20",
        },
        {
            title: "Completed",
            value: completedProjects,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-100 dark:bg-emerald-900/20",
        },
        {
            title: "Planned",
            value: plannedProjects,
            icon: PauseCircle,
            color: "text-purple-600",
            bg: "bg-purple-100 dark:bg-purple-900/20",
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card key={index} className="border-none shadow-md shadow-slate-200/50 dark:shadow-none bg-white dark:bg-[#151b2b] rounded-2xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5 -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 truncate">
                                        {card.title}
                                    </p>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {card.value}
                                    </h3>
                                </div>
                                <div className={`p-4 rounded-xl ${card.bg} shrink-0`}>
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
