"use client";

import { motion } from "framer-motion";
import { LayoutGrid, Briefcase, ArrowRight, Clock, MapPin, Building, Timer, UserCheck, Layers, BarChart3 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UserInitiativesView({ initialProjects = [], initialJobs = [] }: { initialProjects: any[], initialJobs: any[] }) {
    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <LayoutGrid className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Municipal Initiatives</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        Monitor the infrastructure and economic development projects shaping the future of Agno. Transparency and opportunity in one hub.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="projects" className="space-y-10">
                <TabsList className="bg-slate-100 dark:bg-white/5 p-1 h-16 rounded-2xl w-full sm:w-auto">
                    <TabsTrigger value="projects" className="h-full px-8 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                        <Building className="w-4 h-4 mr-2" />
                        Infrastructure
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="h-full px-8 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Career Opportunities
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="projects" className="outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {initialProjects.map((project, idx) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-[#0a0c10] rounded-[3rem] p-6 border border-slate-100 dark:border-white/5 shadow-xl group hover:border-blue-500 transition-all flex flex-col"
                            >
                                <div className="relative aspect-[16/10] sm:aspect-video rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden mb-8">
                                    <Image
                                        src={project.imageUrl || "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800"}
                                        alt={project.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4">
                                        <span className={cn(
                                            "px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-md",
                                            project.status === "COMPLETED" ? "text-green-600" : "text-blue-600"
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
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight group-hover:text-blue-600 transition-colors leading-tight italic">{project.title}</h3>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                                        <motion.div 
                                            className="h-full bg-blue-600 rounded-full"
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${project.progress || 0}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2">{project.description}</p>
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                                    </div>
                                    <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-blue-600 font-black uppercase tracking-widest flex items-center gap-2 group/read">
                                        Track
                                        <ArrowRight className="w-4 h-4 group-hover/read:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="jobs" className="outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {initialJobs.map((job, idx) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 bg-white dark:bg-[#0a0c10] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl flex flex-col sm:flex-row gap-8 group hover:border-blue-500 transition-all"
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
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter transition-colors group-hover:text-blue-600 leading-tight italic">{job.title}</h3>
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
                                    <Button className="h-16 px-8 bg-slate-900 text-white hover:bg-blue-600 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center gap-2 group/btn active:scale-95 transition-all">
                                        Apply
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {initialJobs.length === 0 && (
                        <div className="py-20 text-center opacity-50 italic flex flex-col items-center gap-4">
                            <Briefcase className="w-16 h-16 text-slate-300" />
                            <p className="font-black uppercase tracking-widest text-xs">No career openings available at this time</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
