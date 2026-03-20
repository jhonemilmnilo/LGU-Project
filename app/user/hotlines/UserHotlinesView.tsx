"use client";

import { motion } from "framer-motion";
 
 
 
 
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PhoneCall, Shield, Activity, Flame, Wind, Waves, ArrowRight, Copy, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";

export interface Hotline {
    id: string;
    title: string;
    description?: string | null;
    number: string;
}

export function UserHotlinesView({ initialHotlines = [] }: { initialHotlines: Hotline[] }) {
    return (
        <div className="space-y-12 pb-20">
            <Breadcrumb>
                <BreadcrumbList className="bg-white/50 dark:bg-white/5 backdrop-blur-sm px-6 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5 w-fit shadow-sm">
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors">
                                <Home className="w-3.5 h-3.5 mb-0.5" />
                                Home
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-red-600 italic max-w-[200px] truncate">Emergency Hotlines</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30 animate-pulse">
                            <PhoneCall className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Emergency Hub</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        Critical contacts for police, fire, medical, and disaster response. These lines are monitored 24/7.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {initialHotlines.map((hotline, idx) => (
                    <motion.div
                        key={hotline.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 bg-white dark:bg-[#0a0c10] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center text-center group hover:border-red-500 transition-all"
                    >
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 overflow-hidden relative">
                             <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                             <PhoneCall className="w-8 h-8 text-red-600 group-hover:text-white transition-colors relative z-10" />
                        </div>
                        
                        <div className="space-y-2 flex-1">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{hotline.title}</h3>
                            <p className="text-sm text-slate-500 font-medium italic mb-4">{hotline.description || "Official Emergency Service"}</p>
                            <h4 className="text-3xl font-black text-red-600 uppercase tracking-tighter">{hotline.number}</h4>
                        </div>
                        
                        <div className="w-full flex gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                            <Button className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">
                                Call Now
                            </Button>
                            <Button variant="outline" className="w-14 h-14 rounded-2xl border-slate-200 dark:border-white/10 flex items-center justify-center group/copy">
                                <Copy className="w-5 h-5 text-slate-400 group-hover/copy:text-blue-600 transition-colors" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {initialHotlines.length === 0 && (
                <div className="py-20 text-center opacity-50 italic">Compiling directory...</div>
            )}
        </div>
    );
}
