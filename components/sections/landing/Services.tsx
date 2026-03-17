"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileText, HeartPulse, Users, Trash2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
    {
        title: "Permits & Licenses",
        desc: "Business & Building permits.",
        icon: FileText,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-500/10"
    },
    {
        title: "Health Services",
        desc: "Maternal & Health Programs.",
        icon: HeartPulse,
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-500/10"
    },
    {
        title: "Social Welfare",
        desc: "Locally Funded Assistance.",
        icon: Users,
        color: "text-green-600",
        bg: "bg-green-50 dark:bg-green-500/10"
    },
    {
        title: "Waste Management",
        desc: "Collection Schedule.",
        icon: Trash2,
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-500/10"
    }
];

export function Services() {
    return (
        <section id="services" className="py-12 px-6 max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                    Services & Projects
                </h2>
                <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map((service, idx) => {
                    const Icon = service.icon;
                    return (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="group p-6 md:p-8 bg-white dark:bg-[#0f1117] rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none hover:border-blue-500 hover:-translate-y-2 transition-all cursor-pointer"
                        >
                            <div className="space-y-6">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-blue-600", service.bg)}>
                                    <Icon className={cn("w-7 h-7 group-hover:text-white transition-colors", service.color)} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                        {service.title}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic">
                                        {service.desc}
                                    </p>
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}


