"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Briefcase, PhilippinePeso, Clock, Share2, Home, CheckCircle2, Circle, PlayCircle, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { format } from "date-fns";
import { Project } from "../../../admin/projects/providers/ProjectsProvider";
import { toast } from "sonner";

function getStatusIcon(status: string) {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "completed") return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (lowerStatus === "ongoing" || lowerStatus === "in progress") return <PlayCircle className="w-5 h-5 text-blue-500" />;
    if (lowerStatus === "pending" || lowerStatus === "planned") return <Circle className="w-5 h-5 text-yellow-500" />;
    if (lowerStatus === "cancelled" || lowerStatus === "on hold") return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-slate-500" />;
}

function getStatusColor(status: string) {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "completed") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (lowerStatus === "ongoing" || lowerStatus === "in progress") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    if (lowerStatus === "pending" || lowerStatus === "planned") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    if (lowerStatus === "cancelled" || lowerStatus === "on hold") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
}

export function ProjectDetailView({ project }: { project: Project }) {
    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Project link copied to clipboard!");
        } catch {
            toast.error("Failed to copy link.");
        }
    };

    return (
        <div className="space-y-12 pb-24">
            {/* Breadcrumb section */}
            <Breadcrumb>
                <BreadcrumbList className="bg-black/20 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/10 w-fit shadow-sm">
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                                <Home className="w-3.5 h-3.5 mb-0.5" />
                                Home
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-white/50" />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/user/projects" className="text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                                Projects Feed
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-white/50" />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">
                            {project.title}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Image */}
                    {project.imageUrl ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-white/5"
                        >
                            <Image
                                src={project.imageUrl || ""}
                                alt={project.title}
                                fill
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-slate-100 dark:border-white/5"
                        >
                            <Briefcase className="w-24 h-24 text-primary/30" />
                        </motion.div>
                    )}

                    {/* Title and Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <span className="inline-block px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-primary text-white shadow-lg shadow-primary/20">
                                    {project.category}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-none uppercase italic tracking-tighter">
                                    {project.title}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleShare}
                                    className="p-3.5 rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-white/10 shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all group"
                                >
                                    <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className={`flex items-center gap-2 px-5 py-2 rounded-full font-black uppercase tracking-widest text-[10px] italic border border-current opacity-90 ${getStatusColor(project.status).replace('bg-green-100', 'border-green-500/20 bg-green-500/10').replace('bg-blue-100', 'border-blue-500/20 bg-blue-500/10').replace('bg-yellow-100', 'border-yellow-500/20 bg-yellow-500/10').replace('bg-red-100', 'border-red-500/20 bg-red-500/10')}`}>
                                {getStatusIcon(project.status)}
                                {project.status}
                            </div>
                            <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest italic border border-slate-200 dark:border-white/10">
                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                {project.location}
                            </div>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-400 italic">
                                {project.description}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Project Progress Card - Relocated here */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-[#111622] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Project Progress</h2>
                            <span className="text-primary font-black italic">{project.progress}%</span>
                        </div>
                        <div className="space-y-4">
                            <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 p-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                                />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic text-center">
                                Overall Completion Status
                            </p>
                        </div>
                    </motion.div>

                    {/* Project Details Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-[#111622] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-xl"
                    >
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-6">Execution Details</h2>
                        <div className="space-y-6">
                            {project.budget && (
                                <div className="flex items-start gap-4 group">
                                    <div className="p-3 rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                        <PhilippinePeso className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Allocated Budget</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{project.budget}</p>
                                    </div>
                                </div>
                            )}

                            {project.contractor && (
                                <div className="flex items-start gap-4 group">
                                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Implementing Partner</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{project.contractor}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-4 group">
                                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 transition-colors group-hover:bg-purple-500 group-hover:text-white">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Site Location</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{project.location}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Timeline Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-[#111622] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-xl"
                    >
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-6">Project Timeline</h2>
                        <div className="space-y-6">
                            {project.startDate && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Commencement Date</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white italic">
                                            {format(new Date(project.startDate), "MMMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {project.endDate && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-full bg-red-500/10 text-red-500">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Target Completion</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white italic">
                                            {format(new Date(project.endDate), "MMMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
