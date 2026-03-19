"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Briefcase, PhilippinePeso, Clock, Share2, Home, CheckCircle2, Circle, PlayCircle, XCircle } from "lucide-react";
import Link from "next/link";
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
    return (
        <div className="space-y-12 pb-24">
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
                        <BreadcrumbLink asChild>
                            <Link href="/user/projects" className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Projects
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
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
                            className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <img
                                src={project.imageUrl || ""}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
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
                            <div>
                                <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary mb-3">
                                    {project.category}
                                </span>
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
                                    {project.title}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
                                    <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(project.status)}`}>
                                {getStatusIcon(project.status)}
                                <span className="text-sm font-bold">{project.status}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm font-medium">{project.location}</span>
                            </div>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                                {project.description}
                            </p>
                        </div>
                    </motion.div>

                    {/* Progress Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-slate-200 dark:border-white/10"
                    >
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Project Progress</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm font-medium">
                                <span className="text-slate-600 dark:text-slate-400">Completion Status</span>
                                <span className="text-slate-900 dark:text-white">{project.progress}%</span>
                            </div>
                            <div className="h-4 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress}%` }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Project Details Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-200 dark:border-white/10"
                    >
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Project Details</h2>
                        <div className="space-y-4">
                            {project.budget && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <PhilippinePeso className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{project.budget}</p>
                                    </div>
                                </div>
                            )}

                            {project.contractor && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contractor</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{project.contractor}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{project.location}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Timeline Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-200 dark:border-white/10"
                    >
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Timeline</h2>
                        <div className="space-y-4">
                            {project.startDate && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                        <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Date</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {format(new Date(project.startDate), "MMMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {project.endDate && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                        <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Completion</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {format(new Date(project.endDate), "MMMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!project.startDate && !project.endDate && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">Timeline not specified</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Back to Projects */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <Link
                            href="/user/projects"
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors"
                        >
                            <Briefcase className="w-5 h-5" />
                            View All Projects
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
