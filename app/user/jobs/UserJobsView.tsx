"use client";

import { motion } from "framer-motion";
import { Briefcase, Building, Timer, UserCheck, ArrowRight, Home, MapPin, Search, Calendar } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Job } from "../../admin/jobs/providers/JobsProvider";

export function UserJobsView({ initialJobs = [] }: { initialJobs: Job[] }) {
    return (
        <div className="space-y-10 pb-20">
            {/* Breadcrumb section */}
            <Breadcrumb>
                <BreadcrumbList className="bg-white/50 dark:bg-white/5 backdrop-blur-sm px-6 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5 w-fit shadow-sm">
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <Home className="w-3.5 h-3.5 mb-0.5" />
                                Home
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic">Careers & Opportunities</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="space-y-0.5 pt-2">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Career Hub</h1>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] ml-1">LGU Recruitment</p>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-2xl text-lg leading-relaxed">
                        Build your future while serving the community. Explore diverse career opportunities within the Mapandan Municipal Government.
                    </p>
                </div>
            </div>

            {/* Job Board Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {initialJobs.map((job, idx) => (
                    <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Link
                            href={`/user/jobs/${job.id}`}
                            className="p-8 bg-white dark:bg-[#0f1117] rounded-[3rem] border border-slate-200 dark:border-[#2a3040] shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row gap-8 group hover:border-primary/40 transition-all active:scale-[0.98] h-full"
                        >

                            
                            <div className="flex-1 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">{job.employmentType}</span>
                                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">{job.department}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter transition-colors group-hover:text-primary leading-tight">{job.title}</h3>
                                    {job.location && (
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{job.location}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2 leading-relaxed">{job.description}</p>
                                
                                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Timer className="w-3.5 h-3.5 text-primary" />
                                        Posted {format(new Date(job.createdAt), "MMM d, yyyy")}
                                    </div>
                                    {job.deadline && (
                                        <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Deadline: {format(new Date(job.deadline), "MMM d, yyyy")}
                                        </div>
                                    )}
                                </div>
                            </div>
                            

                        </Link>
                    </motion.div>
                ))}
            </div>

            {initialJobs.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] bg-white dark:bg-black/10">
                    <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic">No active opportunities at the moment...</p>
                </div>
            )}
        </div>
    );
}
