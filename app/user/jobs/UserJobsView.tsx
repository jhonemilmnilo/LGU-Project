"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Briefcase, Timer, Home, MapPin, Calendar, Search, Filter } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Job } from "../../admin/jobs/providers/JobsProvider";

interface UserJobsViewProps {
    initialJobs: Job[];
    activeBarangays?: string[];
}

export function UserJobsView({ 
    initialJobs = [], 
    activeBarangays = [] 
}: UserJobsViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBarangay, setSelectedBarangay] = useState("All");

    const barangayList = useMemo(() => {
        return ["All", ...activeBarangays.sort()];
    }, [activeBarangays]);

    const filteredJobs = useMemo(() => {
        return initialJobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 job.department.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesBarangay = selectedBarangay === "All" || job.barangay === selectedBarangay;
            return matchesSearch && matchesBarangay;
        });
    }, [initialJobs, searchQuery, selectedBarangay]);

    const pageTitle = "Career Hub";

    return (
        <div className="space-y-10 pb-20">
            {/* Breadcrumb section */}
            <Breadcrumb>
                <BreadcrumbList className="bg-white/50 dark:bg-white/5 backdrop-blur-sm px-6 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5 w-fit shadow-sm">
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                                <Home className="w-3.5 h-3.5 mb-0.5" />
                                Home
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">{pageTitle}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header section with Search/Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary rounded-[22px] flex items-center justify-center shadow-2xl shadow-primary/40 transform -rotate-3 hover:rotate-0 transition-transform">
                            <Briefcase className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{pageTitle}</h1>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] ml-1">LGU Recruitment</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-[300px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search roles or offices..."
                            className="pl-11 h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold italic focus:ring-primary/20 transition-all shadow-sm"
                        />
                    </div>

                    <div className="w-full sm:w-[200px]">
                        <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
                            <SelectTrigger className="h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold italic shadow-sm">
                                <Filter className="w-4 h-4 mr-2 text-primary" />
                                <SelectValue placeholder="Barangay" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-2xl">
                                {barangayList.map(b => (
                                    <SelectItem key={b} value={b} className="font-bold italic">
                                        {b === "All" ? "All Locations" : b}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <p className="text-slate-500 font-medium italic max-w-2xl text-lg leading-relaxed">
                Empowering Mapandan through employment. Find your next opportunity within the municipal government and local industries across all sectors.
            </p>

            {/* Job Board Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {filteredJobs.map((job, idx) => (
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
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">{job.employmentType}</span>
                                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">{job.department}</span>
                                        {job.barangay && (
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10">Brgy. {job.barangay}</span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter transition-colors group-hover:text-primary leading-tight">{job.title}</h3>
                                        {(job.location) && (
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{job.location}</span>
                                            </div>
                                        )}
                                    </div>
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

            {filteredJobs.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] bg-white dark:bg-black/10">
                    <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic">No active opportunities at the moment...</p>
                </div>
            )}
        </div>
    );
}
