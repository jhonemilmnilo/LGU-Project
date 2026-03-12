"use client";

import { motion } from "framer-motion";
import { LayoutGrid, ArrowRight, Layers, BarChart3, Clock, MapPin, Search, Filter } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UserProjectsView({ initialProjects = [] }: { initialProjects: any[] }) {
    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <LayoutGrid className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Growth Engine</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        Monitor the infrastructure and social development projects shaping the future of Agno. Transparency in action.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {initialProjects.map((project, idx) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-[#0a0c10] rounded-[3rem] p-6 border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col group hover:border-blue-500 transition-all"
                    >
                        <div className="relative aspect-[16/10] sm:aspect-video rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden mb-8">
                            <Image
                                src={project.imageUrl || "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800"}
                                alt={project.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-4 right-4 animate-pulse">
                                <span className={cn(
                                    "px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-md",
                                    project.status === "COMPLETED" && "text-green-600 bg-green-50/90",
                                    project.status === "ONGOING" && "text-blue-600 bg-blue-50/90"
                                )}>
                                    {project.status || "Planned"}
                                </span>
                            </div>
                        </div>
                        
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{project.category || "Infrastructure"}</p>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{project.progress || 0}% Complete</span>
                            </div>
                            
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight group-hover:text-blue-600 transition-colors leading-tight">
                                {project.title}
                            </h3>
                            
                            <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                                <motion.div 
                                    className="h-full bg-blue-600 rounded-full"
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${project.progress || 0}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                            
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2 mt-4">{project.description}</p>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Clock className="w-4 h-4 text-blue-600" />
                                Updated {new Date(project.updatedAt).toLocaleDateString()}
                            </div>
                            <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-blue-600 font-black uppercase tracking-widest flex items-center gap-2 group/read">
                                Track Project
                                <ArrowRight className="w-4 h-4 group-hover/read:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {initialProjects.length === 0 && (
                <div className="py-20 text-center opacity-50 italic">Compiling municipal roadmap...</div>
            )}
        </div>
    );
}


