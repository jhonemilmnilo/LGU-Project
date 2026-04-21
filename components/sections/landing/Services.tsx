"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileText, ArrowUpRight, ShieldCheck, Briefcase, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Service {
    id: string;
    code: string;
    name: string;
    description: string;
    fee: number;
}

interface ServicesProps {
    services: Service[];
    themeColor?: string;
}

const colors = [
    { color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10" },
    { color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
];

export function Services({ services = [], themeColor }: ServicesProps) {
    const displayServices = services.length > 0 ? services : [];

    return (
        <section id="services" className="py-12 px-6 max-w-7xl mx-auto space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-0.5 rounded-full" style={{ backgroundColor: themeColor || "var(--primary-theme)" }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: themeColor || "var(--primary-theme)" }}>Public Portal</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                        Services
                    </h2>
                </div>
                
                <Link href="/user/services">
                    <Button 
                        style={{ 
                            backgroundColor: themeColor || "var(--primary-theme)",
                            borderColor: themeColor || "var(--primary-theme)",
                            color: "white"
                        }}
                        className="rounded-full px-8 font-black uppercase tracking-widest text-[10px] h-12 gap-2 border-2 transition-all hover:opacity-90 shadow-lg shadow-primary/20"
                    >
                        Access All Services
                        <ArrowUpRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>

            {displayServices.length === 0 ? (
                <div className="py-20 text-center bg-slate-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 italic">
                    <ShieldCheck className="w-12 h-12 text-slate-200 dark:text-white/5 mx-auto mb-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">No Active Services Published</h3>
                    <p className="text-slate-500 font-medium text-sm mt-1">Select a specific Barangay to view available community services.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                    {displayServices.map((service, idx) => {
                        const style = colors[idx % colors.length];
                        return (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="group bg-white dark:bg-[#0f1117] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none hover:border-blue-500 hover:-translate-y-2 transition-all overflow-hidden relative"
                            >
                                <Link href={service.code.startsWith("CEDULA") ? "/user/services/cedula" : `/user/services/${service.id}`} className="block p-8 h-full">
                                    <div 
                                        className="absolute top-0 right-0 w-24 h-24 blur-2xl -mr-12 -mt-12 transition-all opacity-10 group-hover:opacity-20" 
                                        style={{ backgroundColor: themeColor || "var(--primary-theme)" }}
                                    />
                                    
                                    <div className="space-y-6 relative z-10">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:bg-blue-600 group-hover:scale-110", style.bg)}>
                                            {idx % 3 === 0 ? <FileText className={cn("w-7 h-7 group-hover:text-white transition-colors", style.color)} /> : 
                                             idx % 3 === 1 ? <Briefcase className={cn("w-7 h-7 group-hover:text-white transition-colors", style.color)} /> :
                                             <Zap className={cn("w-7 h-7 group-hover:text-white transition-colors", style.color)} />}
                                        </div>
                                        <div className="space-y-2">
                                            <h3 
                                                className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-tight transition-colors"
                                                style={{ "--hover-color": themeColor || "var(--primary-theme)" } as any}
                                            >
                                                {service.name}
                                            </h3>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic line-clamp-2">
                                                {service.description}
                                            </p>
                                        </div>
                                        <div className="pt-4 flex items-center justify-end border-t border-slate-50 dark:border-white/5">
                                            <span 
                                                className="text-[10px] font-black uppercase tracking-widest transition-opacity"
                                                style={{ color: themeColor || "var(--primary-theme)" }}
                                            >
                                                Request Now
                                            </span>
                                            <ArrowUpRight 
                                                className="w-4 h-4 text-slate-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" 
                                                style={{ "--hover-color": themeColor || "var(--primary-theme)" } as any}
                                            />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}


