"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Briefcase, Building, Timer, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function JobBoard({ jobs = [] }: { jobs: any[] }) {
    const hasJobs = jobs.length > 0;

    if (!hasJobs) {
        return (
            <section id="careers" className="py-24 px-6 bg-slate-50 dark:bg-white/5 border-y border-slate-100 dark:border-white/5">
                <div className="max-w-7xl mx-auto text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                        Serve the Community
                    </h2>
                    <p className="text-slate-400 font-medium italic">No active opportunities at the moment. Please check back later.</p>
                </div>
            </section>
        );
    }

    // Only take the first 3 (closest to deadline)
    const limitedJobs = jobs.slice(0, 3);

    return (
        <section id="careers" className="py-24 px-6 bg-slate-50 dark:bg-white/5 border-y border-slate-100 dark:border-white/5">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                        Serve the Community
                    </h2>
                    <p className="text-slate-500 font-medium italic max-w-xl mx-auto text-lg">
                        Explore immediate career opportunities within the Mapandan Municipal Government.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {limitedJobs.map((job, idx) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link
                                href={`/user/jobs/${job.id}`}
                                className="bg-white dark:bg-[#0f1117] p-8 md:p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-primary/40 transition-all group flex flex-col justify-between h-[420px] relative overflow-hidden active:scale-[0.98]"
                            >
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-1">
                                            {job.deadline && (
                                                <div className="flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-[9px] italic mb-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Deadline: {format(new Date(job.deadline), "MMM d, yyyy")}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-slate-400 font-bold italic text-[9px]">
                                                <Timer className="w-3 h-3 text-primary" />
                                                <span>Posted {format(new Date(job.createdAt), "MMM d, yyyy")}</span>
                                            </div>
                                        </div>
                                        <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                            {job.employmentType}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-tight line-clamp-2 min-h-[3rem]">
                                            {job.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Building className="w-4 h-4 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest truncate italic">{job.department}</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-3 leading-relaxed">
                                        {job.description}
                                    </p>
                                </div>

                                <div className="pt-6 relative z-20">
                                    <Button asChild className="w-full py-4 h-auto bg-primary hover:bg-primary/90 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary/25 pointer-events-none">
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="w-4 h-4" />
                                            Learn More
                                        </div>
                                    </Button>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center pt-2">
                    <Button asChild className="px-12 py-5 h-auto bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] rounded-[2rem] transition-all shadow-xl shadow-primary/25 active:scale-95 flex items-center justify-center gap-3 mx-auto">
                        <Link href="/user/jobs">
                            <Briefcase className="w-4 h-4" />
                            View All Open Positions
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
