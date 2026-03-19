"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Gauge, Calendar, Building2, CircleDollarSign, ArrowLeft } from "lucide-react";
import Image from "next/image";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    location: string;
    budget?: string | null;
    contractor?: string | null;
    progress: number;
    imageUrl?: string | null;
    startDate?: string | Date | null;
    updatedAt: string | Date;
}

export function ProjectDetailView({ project }: { project: Project }) {
    return (
        <div className="space-y-10 pb-20">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <Link href="/user/projects">
                    <Button variant="ghost" className="group flex items-center gap-2 font-black uppercase tracking-widest text-[9px] text-slate-500 hover:text-primary transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        Back to Hub
                    </Button>
                </Link>
                <Breadcrumb className="hidden sm:block">
                    <BreadcrumbList className="bg-white/50 dark:bg-white/5 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-slate-100 dark:border-white/5 w-fit shadow-sm">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/user/projects" className="text-[9px] font-black uppercase tracking-widest text-slate-500">Projects</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-[9px] font-black uppercase tracking-widest text-primary italic">{project.title.slice(0, 20)}...</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Compact Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
                
                {/* Left side: Smaller Image Column */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-200 dark:ring-white/5"
                    >
                        <Image
                            src={project.imageUrl || "/projects/default.png"}
                            alt={project.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute top-4 left-4">
                            <span className={cn(
                                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl",
                                project.status === "Completed" ? "bg-emerald-500 text-white" : "bg-primary text-white"
                            )}>
                                {project.status}
                            </span>
                        </div>

                        {/* Progress Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-2">
                                        <Gauge className="w-4 h-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Progress</span>
                                    </div>
                                    <span className="text-xl font-black italic">{project.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-white/20 backdrop-blur-md rounded-full overflow-hidden border border-white/10 p-0.5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${project.progress}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-primary rounded-full shadow-[0_0_15px_var(--primary-theme)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right side: Details Column */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-0.5 bg-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">{project.category}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                            {project.title}
                        </h1>
                        <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest italic">{project.location}</span>
                        </div>
                    </div>

                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium italic leading-relaxed whitespace-pre-line border-l-4 border-primary/20 pl-6 py-2">
                        {project.description}
                    </p>

                    {/* Small Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] space-y-2 border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2 text-primary">
                                <Building2 className="w-4 h-4" />
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Executing Entity</h3>
                            </div>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">{project.contractor || "LGU Mapandan"}</p>
                        </div>

                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] space-y-2 border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <CircleDollarSign className="w-4 h-4" />
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Allocated Budget</h3>
                            </div>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">{project.budget || "Confidential TBD"}</p>
                        </div>

                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] space-y-2 border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2 text-amber-600">
                                <Calendar className="w-4 h-4" />
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Roadmap</h3>
                            </div>
                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">
                                Start: {project.startDate ? format(new Date(project.startDate), "MMM d, yyyy") : "N/A"}
                            </p>
                        </div>

                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] space-y-2 border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Clock className="w-4 h-4" />
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Last Update</h3>
                            </div>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{format(new Date(project.updatedAt), "MMM d, yyyy")}</p>
                        </div>
                    </div>

                    {/* Transparency Section */}
                    <div className="p-6 bg-primary/10 rounded-[1.5rem] border border-primary/20 text-primary dark:text-primary">
                        <p className="text-[10px] font-medium italic leading-relaxed">
                            This project record is maintained for public transparency and accountability. Citizens of Mapandan can track municipal developments in real-time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
