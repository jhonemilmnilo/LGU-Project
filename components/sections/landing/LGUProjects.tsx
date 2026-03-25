"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FolderKanban, MapPin, Gauge, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    location: string;
    progress: number;
    imageUrl: string | null;
    startDate: Date | null;
}

interface LGUProjectsProps {
    projects: Project[];
}

export function LGUProjects({ projects }: LGUProjectsProps) {
    const filteredProjects = projects;

    if (!projects || filteredProjects.length === 0) return null;

    return (
        <section id="projects" className="py-12 px-6 max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-0.5 bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Infrastructure</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                        LGU Projects
                    </h2>
                </div>

                <Link href="/user/projects">
                    <Button 
                        className="px-8 py-4 h-auto bg-primary hover:opacity-90 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary/25 active:scale-95 group flex items-center gap-3"
                    >
                        <FolderKanban className="w-4 h-4" />
                        View All Projects
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project, idx) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Link 
                            href={`/user/projects/${project.id}`}
                            className="group block bg-white dark:bg-[#0f1117] rounded-[2.5rem] border border-slate-200 dark:border-[#2a3040] overflow-hidden hover:border-primary/40 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col h-full active:scale-[0.98]"
                        >
                            {/* Image Header */}
                            <div className="relative h-56 w-full overflow-hidden">
                                <Image
                                    src={project.imageUrl || "/projects/default.png"}
                                    alt={project.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                
                                <div className="absolute top-6 left-6">
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md border shadow-lg",
                                        project.status === "Completed" 
                                            ? "bg-emerald-500/90 text-white border-emerald-400/30"
                                            : "bg-primary/90 text-white border-white/20"
                                    )}>
                                        {project.status}
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
                                        <Calendar className="w-2.5 h-2.5" />
                                        {project.startDate ? format(new Date(project.startDate), "MMM yyyy") : "TBA"}
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{project.category}</span>
                                </div>

                                <div className="space-y-2 flex-1">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic line-clamp-3 leading-relaxed">
                                        {project.description}
                                    </p>
                                </div>

                                <div className="pt-6">
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
        </section>
    );
}
