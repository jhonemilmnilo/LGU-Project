"use client";

import { motion } from "framer-motion";
import { Briefcase, Building, Timer, UserCheck, ArrowRight, Search, Filter, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UserJobsView({ initialJobs = [] }: { initialJobs: any[] }) {
    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Economic Hub</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        Build your career within the Agno Municipal Government. Explore current openings and join our mission to serve.
                    </p>
                </div>
            </div>

            {/* Job Board Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {initialJobs.map((job, idx) => (
                    <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 bg-white dark:bg-[#0a0c10] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row gap-8 group hover:border-blue-500 transition-all"
                    >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 dark:bg-blue-500/10 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                            <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">{job.type || "Full-Time"}</span>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest">{job.department}</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter transition-colors group-hover:text-blue-600">{job.title}</h3>
                            </div>
                            
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2">{job.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Timer className="w-3.5 h-3.5" />
                                    Posted {new Date(job.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <UserCheck className="w-3.5 h-3.5" />
                                    {job.openings || 1} Openings
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col justify-end pt-4 sm:pt-0">
                            <Button className="h-16 px-8 bg-slate-900 text-white hover:bg-blue-600 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center gap-2 group/btn">
                                Apply
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {initialJobs.length === 0 && (
                <div className="py-20 text-center space-y-4 opacity-50 italic">
                    <Briefcase className="w-16 h-16 mx-auto text-slate-300" />
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">No current job openings</h3>
                    <p className="text-sm">Check back later for new opportunities.</p>
                </div>
            )}
        </div>
    );
}
