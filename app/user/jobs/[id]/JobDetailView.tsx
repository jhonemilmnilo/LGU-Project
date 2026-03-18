"use client";

import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, Globe, Home, Share2, Navigation } from "lucide-react";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function JobDetailView({ job }: { job: any }) {
    const links = Array.isArray(job.links) ? job.links : [];
    const mapLink = job.mapUrl;

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
                            <Link href="/user/jobs" className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Careers
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">{job.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">{job.employmentType}</span>
                                <span className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10">{job.department}</span>
                            </div>
                            
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{job.title}</h1>
                            
                            <div className="flex flex-wrap items-center gap-8 text-slate-500 font-medium italic">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <span>{job.location || "Municipal Government Office, Mapandan"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-primary">
                                    <Clock className="w-5 h-5" />
                                    <span>{job.salary || "Salary Grade TBD"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <div className="bg-white dark:bg-[#0f1117] p-10 rounded-[3rem] border border-slate-200 dark:border-[#2a3040] shadow-xl shadow-slate-200/50 dark:shadow-none space-y-10">
                                <section className="space-y-4">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        Job Description
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg italic whitespace-pre-wrap">{job.description}</p>
                                </section>

                                <section className="space-y-4">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        Minimum Qualifications
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg italic whitespace-pre-wrap">{job.qualifications}</p>
                                </section>

                                <section className="space-y-4">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        Application Requirements
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg italic whitespace-pre-wrap">{job.requirements}</p>
                                </section>
                            </div>
                        </div>

                        {mapLink && (
                            <div className="bg-white dark:bg-[#0f1117] rounded-[3rem] p-6 sm:p-10 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-[#2a3040] space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                            <Navigation className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Location Map</h3>
                                    </div>
                                    <Link href={mapLink} target="_blank">
                                        <Button variant="outline" className="w-full sm:w-auto rounded-xl font-black uppercase tracking-widest text-[9px] border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-colors">
                                            Open in Google Maps
                                        </Button>
                                    </Link>
                                </div>
                                <div className="aspect-video w-full bg-slate-100 dark:bg-[#1a1f2e] rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-inner">
                                    <iframe 
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0 }}
                                        src={mapLink?.includes("embed") ? mapLink : `https://maps.google.com/maps?q=${encodeURIComponent(job.location ? `${job.location}, Mapandan, Pangasinan` : 'Mapandan, Pangasinan')}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
                                        allowFullScreen 
                                        loading="lazy" 
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-primary p-10 rounded-[3rem] text-white space-y-8 shadow-2xl shadow-primary/40 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Briefcase className="w-32 h-32 rotate-12" />
                        </div>
                        
                        <div className="relative space-y-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 italic">Deadline for Submission</p>
                                <h3 className="text-3xl font-black italic tracking-tighter">
                                    {job.deadline ? format(new Date(job.deadline), "MMMM d, yyyy") : "Until Position Filled"}
                                </h3>
                            </div>
                            
                            <hr className="border-white/10" />
                            
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 italic">External Links & Application</p>
                                <div className="flex flex-col gap-3">
                                    {links.length > 0 ? links.map((
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        link: any, idx: number) => (
                                        <Link 
                                            key={idx}
                                            href={link.url}
                                            target="_blank"
                                            className="w-full h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-between px-6 transition-colors border border-white/10 group/link"
                                        >
                                            <span className="text-sm font-black uppercase tracking-widest">{link.label}</span>
                                            <Globe className="w-4 h-4 text-white/60 group-hover/link:text-white transition-colors" />
                                        </Link>
                                    )) : (
                                        <div className="py-4 text-center opacity-40 text-[10px] font-black uppercase tracking-widest bg-white/5 rounded-2xl border border-dashed border-white/20">
                                            Apply personally at the LGU Office
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-[#0f1117] p-8 rounded-[2.5rem] border border-slate-200 dark:border-[#2a3040] space-y-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
                                <Share2 className="w-5 h-5 text-primary" />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Share Opportunity</h4>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Help friends and colleagues build their careers. Spread the word!</p>
                        <Button className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-transform">
                            Copy Link
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
