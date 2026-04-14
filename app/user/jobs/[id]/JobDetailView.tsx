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
import { Job } from "../../../admin/jobs/providers/JobsProvider";
import { toast } from "sonner";

export function JobDetailView({ job }: { job: Job }) {
    const links = Array.isArray(job.links) ? job.links : [];
    const mapLink = job.mapUrl;

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Job opportunity link copied!");
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
                            <Link href="/user/jobs" className="text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                                Careers Feed
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-white/50" />
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
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-4 py-1.5 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">{job.employmentType}</span>
                                <span className="px-4 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 italic font-bold">{job.department}</span>
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{job.title}</h1>
                            
                            <div className="flex flex-wrap items-center gap-8 text-slate-500 font-medium italic">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <span>{job.location || "Municipal Government Office, Mapandan"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm">
                                    <Clock className="w-5 h-5" />
                                    <span>{job.salary || "Salary Grade TBD"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <div className="bg-white dark:bg-[#111622] p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl space-y-10">
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
                            <div className="bg-white dark:bg-[#111622] rounded-[3rem] p-10 overflow-hidden shadow-xl border border-slate-100 dark:border-white/5 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Navigation className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Location Map</h3>
                                </div>
                                <div className="aspect-video w-full bg-slate-100 dark:bg-white/5 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-inner relative group/map">
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
                                    
                                    {/* Floating Get Directions Button */}
                                    <div className="absolute top-4 right-4 z-20">
                                        <Link href={job.mapUrl || `https://maps.google.com/maps?q=${encodeURIComponent(`${job.location || 'Municipal Office'}, Mapandan`)}`} target="_blank">
                                            <Button className="bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 px-6 h-10 shadow-2xl">
                                                <Navigation className="w-3.5 h-3.5" />
                                                Get Directions
                                            </Button>
                                        </Link>
                                    </div>
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
                        className="bg-white dark:bg-[#111622] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6 shadow-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Share2 className="w-5 h-5 text-primary" />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Share Opportunity</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic leading-relaxed">Help friends and colleagues build their careers. Spread the word!</p>
                        <Button 
                            onClick={handleShare}
                            className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
                        >
                            Copy Job Link
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
