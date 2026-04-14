"use client";

import { motion } from "framer-motion";
import { FolderKanban, Home, Clock, MapPin, Gauge } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React from "react";

 
export function UserProjectsView({ initialProjects = [] }: { initialProjects: any[] }) {
    const filteredProjects = initialProjects;

    const pageTitle = "Municipal Initiatives";

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
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic truncate max-w-[200px]">{pageTitle}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-[22px] flex items-center justify-center shadow-2xl shadow-primary/40 transform -rotate-3 hover:rotate-0 transition-transform">
                            <FolderKanban className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{pageTitle}</h1>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] ml-1">LGU Infrastructure</p>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-2xl text-lg leading-relaxed">
                        Monitor the infrastructure and social development projects shaping the future of Mapandan. Transparency and progress in every brick laid.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project, idx) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Link 
                            href={`/user/projects/${project.id}`}
                            className="group block bg-white dark:bg-[#0f1117] rounded-[3rem] border border-slate-200 dark:border-[#2a3040] overflow-hidden hover:border-primary/40 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col h-full active:scale-[0.98]"
                        >
                            {/* Image Header */}
                            <div className="relative h-64 w-full overflow-hidden">
                                <Image
                                    src={project.imageUrl || "/projects/default.png"}
                                    alt={project.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                
                                <div className="absolute top-6 left-6">
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-sm border shadow-lg",
                                        project.status === "Completed" 
                                            ? "bg-emerald-500/90 text-white border-emerald-400/30"
                                            : "bg-primary/90 text-white border-white/20"
                                    )}>
                                        {project.status || "Planned"}
                                    </span>
                                </div>

                                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white/90">
                                        <MapPin className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">
                                            {project.location}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                                        <Gauge className="w-3 h-3 text-primary" />
                                        <span className="text-[10px] font-black text-white">{project.progress}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-4 flex-1 flex flex-col">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                        <Clock className="w-2.5 h-2.5" />
                                        {project.updatedAt ? `Updated ${format(new Date(project.updatedAt), "MMM d, yyyy")}` : "Recently Added"}
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{project.category}</span>
                                </div>

                                <div className="space-y-2 flex-1">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-3 leading-relaxed">
                                        {project.description}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                                    <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden shadow-inner">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${project.progress}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-primary rounded-full shadow-[0_0_10px_var(--primary-theme)] opacity-80"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {filteredProjects.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] bg-white dark:bg-black/10">
                    <FolderKanban className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic">Infrastructure roadmap is being updated...</p>
                </div>
            )}
        </div>
    );
}
