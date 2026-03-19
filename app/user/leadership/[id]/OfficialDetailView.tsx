"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, Facebook, Phone, Calendar, Home, Mail, Globe, Trophy, GraduationCap, Quote, Copy, Check } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Official {
    id: string;
    name: string;
    position: string;
    imageUrl?: string | null;
    contactNumber?: string | null;
    email?: string | null;
    links?: { label: string; url: string }[];
    termStart?: string | Date | null;
    termEnd?: string | Date | null;
    bio?: string | null;
    motto?: string | null;
    education?: string | null;
    achievements?: string | null;
}

export function OfficialDetailView({ official, themeColor = "#2563eb" }: { official: Official; themeColor?: string }) {
    const [idCopied, setIdCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setIdCopied(true);
        toast.success("Contact number copied to clipboard!");
        setTimeout(() => setIdCopied(false), 2000);
    };

    const formatDate = (date: string | Date | null | undefined) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    };

    return (
        <div 
            className="space-y-12 pb-24"
            style={{ "--primary-theme": themeColor } as React.CSSProperties}
        >
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
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">{official.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Profile Card Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-[#0f1117] rounded-[3rem] overflow-hidden border border-slate-200 dark:border-[#2a3040] shadow-2xl relative group"
                    >
                        <div className="aspect-[3/4] relative overflow-hidden">
                            {official.imageUrl ? (
                                <Image 
                                    src={official.imageUrl} 
                                    alt={official.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <User className="w-20 h-20 text-slate-300" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                        </div>
                        
                        <div className="p-8 space-y-6 relative">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{official.name}</h1>
                                </div>
                                {official.motto && (
                                    <div className="flex gap-2 p-4 bg-primary/5 rounded-2xl border border-primary/10 italic">
                                        <Quote className="w-4 h-4 text-primary shrink-0 opacity-40" />
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                                            &quot;{official.motto}&quot;
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12"
                    >
                        {/* Term Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-white dark:bg-[#0f1117] rounded-[3rem] border border-slate-200 dark:border-[#2a3040] shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Calendar className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Terms</h3>
                                </div>
                                <div className="space-y-2 pl-13 text-sm">
                                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start</span>
                                        <span className="font-black text-slate-700 dark:text-slate-300 italic">{formatDate(official.termStart) || "----"}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End</span>
                                        <span className="font-black text-slate-700 dark:text-slate-300 italic">{formatDate(official.termEnd) || "Present"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-[2.5rem] border border-primary/10 dark:border-primary/20 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Shield className="w-4 h-4 text-primary" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Government Role</h3>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-black italic tracking-tighter text-primary uppercase leading-tight">
                                        {official.position}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Hierarchy Member</p>
                                </div>
                            </div>
                        </div>

                        {/* Education & Achievements */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-[#0f1117] p-8 rounded-[2.5rem] border border-slate-200 dark:border-[#2a3040] shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                        <GraduationCap className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Education</h3>
                                </div>
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm italic whitespace-pre-wrap">
                                        {official.education || "Educational details not specified for this profile."}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#0f1117] p-8 rounded-[2.5rem] border border-slate-200 dark:border-[#2a3040] shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Trophy className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Achievements</h3>
                                </div>
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm italic whitespace-pre-wrap">
                                        {official.achievements || "Notable projects and achievements are being updated."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bio Section */}
                        <div className="bg-white dark:bg-[#0f1117] p-10 rounded-[3rem] border border-slate-200 dark:border-[#2a3040] shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter flex items-center gap-4">
                                <div className="w-2 h-8 bg-primary rounded-full" />
                                Biography & Vision
                            </h3>
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-base italic whitespace-pre-wrap">
                                    {official.bio || `Hon. ${official.name} serves as the ${official.position} of Mapandan, Pangasinan. Dedicated to public service and community development, working towards a brighter future for all residents.`}
                                </p>
                            </div>
                        </div>

                        {/* Public Service Hotline Area */}
                        <div 
                            className="p-12 rounded-[3.5rem] text-white relative overflow-hidden group shadow-2xl shadow-primary/20"
                            style={{ backgroundColor: themeColor }}
                        >
                             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                <Shield className="w-32 h-32 rotate-12" />
                            </div>
                            <div className="relative space-y-8">
                                <div>
                                    <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-4">Public Service Hotline</h3>
                                    <p className="text-white/70 font-medium italic max-w-md text-sm">
                                        Reach out for official business, constituent concerns, and governance matters.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Contact & Email */}
                                    <div className="space-y-4">
                                        {official.contactNumber && (
                                            <div 
                                                onClick={() => handleCopy(official.contactNumber!)}
                                                className="flex items-center gap-4 group/item cursor-pointer w-fit"
                                            >
                                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                                                    <Phone className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Call / Text</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-lg font-black italic tracking-tighter transition-colors">{official.contactNumber}</p>
                                                        {idCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover/item:opacity-100" />}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {official.email && (
                                            <Link href={`mailto:${official.email}`} className="flex items-center gap-4 group/item w-fit">
                                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                                                    <Mail className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Official Email</p>
                                                    <p className="text-lg font-black italic tracking-tighter lowercase transition-colors">{official.email}</p>
                                                </div>
                                            </Link>
                                        )}
                                    </div>

                                    {/* Social Media Links */}
                                    <div className="space-y-4">
                                        {Array.isArray(official.links) && official.links.length > 0 && (
                                            <div className="grid grid-cols-1 gap-3">
                                                {(official.links as { label: string; url: string }[]).map((link, idx) => (
                                                    <Link 
                                                        key={idx}
                                                        href={link.url} 
                                                        target="_blank"
                                                        className="flex items-center gap-4 group/link w-fit"
                                                    >
                                                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 group-hover/link:bg-white/30 transition-colors">
                                                            {link.label.toLowerCase().includes('facebook') ? (
                                                                <Facebook className="w-5 h-5 text-white" />
                                                            ) : (
                                                                <Globe className="w-5 h-5 text-white" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Connect via</p>
                                                            <p className="text-lg font-black italic tracking-tighter transition-colors">{link.label}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
