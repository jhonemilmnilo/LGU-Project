"use client";

import * as React from "react";
import { motion } from "framer-motion";
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Briefcase, Building, MapPin, ArrowRight, UserCheck, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

const jobs = [
    {
        id: 1,
        title: "Civil Engineer I",
        dept: "Engineering Office",
        type: "Full-Time",
        posted: "Posted 3 days ago",
        status: "Open"
    },
    {
        id: 2,
        title: "Rural Health Midwife",
        dept: "Municipal Health Office",
        type: "Full-Time",
        posted: "Posted 1 week ago",
        status: "Open"
    },
    {
        id: 3,
        title: "Administrative Aide IV",
        dept: "Mayor's Office",
        type: "Part-Time",
        posted: "Posted 1 month ago",
        status: "Urgent"
    }
];

export function JobBoard() {
    return (
        <section id="careers" className="py-24 px-6 bg-slate-50 dark:bg-white/5 border-y border-slate-100 dark:border-white/5">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                        Job Opportunities
                    </h2>
                    <p className="text-slate-500 font-medium italic max-w-xl mx-auto">
                        Join the municipal team and serve the people of Agno.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {jobs.map((job, idx) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-[#0f1117] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-blue-500 transition-all group"
                        >
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                        <Briefcase className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                        job.status === "Urgent" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                                    )}>
                                        {job.status}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Building className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">{job.dept}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 pt-2">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Timer className="w-4 h-4" />
                                        <span className="text-xs font-bold italic">{job.type}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <UserCheck className="w-4 h-4" />
                                        <span className="text-xs font-bold italic">{job.posted}</span>
                                    </div>
                                </div>

                                <Button className="w-full bg-blue-50 dark:bg-white/5 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white h-14 rounded-2xl font-black uppercase tracking-widest transition-all">
                                    Apply Now
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center pt-8">
                    <Button variant="outline" className="h-14 px-12 rounded-2xl border-2 border-blue-600 text-blue-600 font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
                        View All Open Positions
                    </Button>
                </div>
            </div>
        </section>
    );
}

import { cn } from "@/lib/utils";
