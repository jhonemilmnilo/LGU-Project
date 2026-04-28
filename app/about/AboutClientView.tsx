"use client";

import * as React from "react";
import { motion, Variants } from "framer-motion";
import { Target, Eye, Quote, HeartHandshake, Building2, Home, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { PastMayorsExhibit } from "./PastMayorsExhibit";

interface PastMayor {
    id: string;
    name: string;
    termStart: string;
    termEnd: string;
    description: string | null;
    imageUrl: string | null;
    order: number;
}

interface AboutClientViewProps {
    aboutData: {
        geographyOrDemographics?: string | null;
        mayorImageUrl?: string | null;
        mayorMessage?: string | null;
        history?: string | null;
        mission?: string | null;
        vision?: string | null;
        coreValues?: string | null;
    };
    pastMayors: PastMayor[];
    themeColor: string;
    brandWord1: string;
    brandWord2: string;
    isBarangayView?: boolean;
}



export function AboutClientView({ aboutData, pastMayors, themeColor, brandWord1, brandWord2, isBarangayView }: AboutClientViewProps) {
    const fadeIn: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };
    
    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    return (
        <div className="flex-1 pb-32 overflow-hidden">
            {/* Hero Header with Framer Motion */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative pt-32 pb-24 px-4 md:px-8 overflow-hidden border-b border-slate-200 dark:border-white/5"
            >
                {/* Background Blobs for Shadcn/Premium feel */}
                <div 
                    className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: themeColor }}
                />
                <div 
                    className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-10 pointer-events-none"
                    style={{ backgroundColor: themeColor }}
                />
                
                <div className="max-w-7xl mx-auto relative z-10 flex text-center flex-col items-center">
                    {/* Breadcrumbs */}
                    {/* Breadcrumb section */}
                    <Breadcrumb className="mb-8 relative z-10">
                        <BreadcrumbList className="bg-black/20 backdrop-blur-md px-6 py-2.5 rounded-[2rem] border border-white/10 shadow-sm inline-flex">
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white transition-colors flex items-center gap-2">
                                        <Home className="w-3.5 h-3.5" />
                                        Home
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-white/50" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic">{isBarangayView ? "About Our Barangay" : "About Our Town"}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border shadow-sm mb-6"
                        style={{ borderColor: `${themeColor}40` }}
                    >
                        <Globe className="w-4 h-4" style={{ color: themeColor }} />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">
                            Discover Our Heritage
                        </span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.9]"
                    >
                        Welcome to
                        <br />
                        <span style={{ color: themeColor }}>{isBarangayView ? `Barangay ${brandWord2}` : `${brandWord1} ${brandWord2}`}</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 md:mt-8 text-base md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-medium leading-relaxed"
                    >
                        {aboutData.geographyOrDemographics || "Learn about our rich history, deep-rooted core values, and our shared vision towards progress."}
                    </motion.p>
                </div>
            </motion.div>

            {/* Main Content Blocks */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-20 md:mt-32 space-y-24 md:space-y-40">
                
                {/* Mayor's Message - Now the First Primary Block */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeIn}
                >
                    <Card className="rounded-[3rem] shadow-2xl border-none bg-white dark:bg-slate-950 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-100 dark:to-slate-900/50 pointer-events-none" />
                        
                        <div className="flex flex-col lg:flex-row items-stretch h-full w-full">
                            {/* Photo Section */}
                            {aboutData.mayorImageUrl ? (
                                <div className="lg:w-2/5 relative min-h-[300px] md:min-h-[400px] lg:self-stretch p-4 md:p-6 pb-0 lg:pb-6 lg:pr-0">
                                    <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src={aboutData.mayorImageUrl || ""} 
                                            alt="Mayor" 
                                            className="absolute inset-0 w-full h-full object-cover" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    </div>
                                </div>
                            ) : (
                                 <div className="lg:w-1/3 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-12">
                                    <div className="text-center opacity-50 space-y-4">
                                        <Building2 className="w-20 h-20 mx-auto" />
                                        <p className="text-xs font-bold uppercase tracking-widest">{isBarangayView ? "Barangay Office" : "Office of the Mayor"}</p>
                                    </div>
                                </div>
                            )}

                            {/* Message Section */}
                            <div className="lg:w-3/5 p-6 md:p-16 lg:p-20 relative z-10 flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-4 md:mb-6">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
                                        <Quote className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] text-slate-500">Message from the Office</h2>
                                </div>
                                
                                <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 md:mb-10 tracking-tighter leading-none">
                                    {isBarangayView ? "Captain's" : "Mayor's"} <br/><span style={{ color: themeColor }}>Message</span>
                                </h3>
                                
                                <div className="relative">
                                    <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 leading-loose italic font-medium whitespace-pre-wrap">
                                        {aboutData.mayorMessage}
                                    </p>
                                </div>

                                {/* Button removed as requested */}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Historical Background */}
                <motion.div                     initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeIn}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center"
                >
                    <div className="lg:col-span-5 space-y-6 relative">
                        {/* Decorative Icon */}
                        <div className="absolute -top-10 -left-10 opacity-5 dark:opacity-10 pointer-events-none">
                            <Building2 className="w-48 h-48" style={{ color: themeColor }} />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-px" style={{ backgroundColor: themeColor }} />
                            <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-[0.3em] text-slate-500">Origins</h2>
                        </div>
                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                            Historical <br/><span style={{ color: themeColor }}>Background</span>
                        </h3>
                    </div>
                    <div className="lg:col-span-7">
                        <Card className="border-none shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: themeColor }} />
                            <CardContent className="p-6 md:p-12">
                                <p className="text-base md:text-xl text-slate-700 dark:text-slate-300 leading-loose whitespace-pre-wrap font-medium">
                                    {aboutData.history}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>



                {/* Mission & Vision Cards */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
                >
                    {/* Mission Card */}
                    <motion.div variants={fadeIn} className="h-full">
                        <Card className="h-full border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300 group bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 pointer-events-none">
                                <Target className="w-48 h-48" style={{ color: themeColor }} />
                            </div>
                            <CardContent className="p-6 md:p-14 flex flex-col h-full relative z-10">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
                                    <Target className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] text-slate-400 mb-2">Our Goal</h2>
                                <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 md:mb-6">Mission</h3>
                                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-wrap flex-grow">
                                    {aboutData.mission}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Vision Card */}
                    <motion.div variants={fadeIn} className="h-full">
                        <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden relative" style={{ backgroundColor: themeColor }}>
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 pointer-events-none">
                                <Eye className="w-48 h-48 text-white" />
                            </div>
                            <CardContent className="p-6 md:p-14 flex flex-col h-full relative z-10">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 md:mb-8 shadow-lg text-white backdrop-blur-md">
                                    <Eye className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] text-white/70 mb-2">Our Future</h2>
                                <h3 className="text-3xl md:text-4xl font-black text-white mb-4 md:mb-6">Vision</h3>
                                <p className="text-base md:text-lg text-white/90 leading-relaxed font-medium whitespace-pre-wrap flex-grow">
                                    {aboutData.vision}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Core Values */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeIn}
                    className="max-w-5xl mx-auto"
                >
                    <div className="relative p-6 md:p-16 rounded-[2rem] md:rounded-[3rem] text-center border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 shadow-inner overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)` }} />
                        
                        <HeartHandshake className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-6 md:mb-8 opacity-80" style={{ color: themeColor }} />
                        <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-[0.3em] text-slate-400 mb-4 md:mb-6">Guiding Principles</h2>
                        <h3 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 md:mb-10 tracking-tight">Core Values</h3>
                        
                        <div className="relative">
                            <Quote className="absolute -top-4 md:-top-8 -left-2 md:-left-8 w-10 h-10 md:w-16 md:h-16 opacity-10 rotate-180" style={{ color: themeColor }} />
                            <p className="text-lg md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-bold whitespace-pre-wrap italic relative z-10 px-4 md:px-0">
                                {aboutData.coreValues}
                            </p>
                            <Quote className="absolute -bottom-4 md:-bottom-8 -right-2 md:-right-8 w-10 h-10 md:w-16 md:h-16 opacity-10" style={{ color: themeColor }} />
                        </div>
                    </div>
                </motion.div>



                {/* Past Mayors exhibit section imported cleanly */}
            </div>

            {pastMayors && pastMayors.length > 0 && (
                <div className="w-full mt-24">
                    <PastMayorsExhibit 
                        mayors={pastMayors} 
                        brandWord1={brandWord1} 
                        brandWord2={brandWord2} 
                        isBarangayView={isBarangayView}
                    />
                </div>
            )}
        </div>
    );
}
