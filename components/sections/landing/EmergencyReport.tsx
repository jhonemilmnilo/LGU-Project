"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Siren, Flame, HeartPulse, AlertCircle, Info, Copy, Smartphone, Phone, MapPin, CloudLightning } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import MapandanMapWrapper from "@/components/maps/MapandanMapWrapper";

import { ReportForm } from "./ReportForm";

interface InitialHotline {
    id: string;
    name: string;
    category: string;
    mobileNumber: string | null;
    telephone: string | null;
    address: string | null;
}

export function EmergencyReport({ initialHotlines = [] }: { initialHotlines?: InitialHotline[] }) {
    const [copied, setCopied] = React.useState<string | null>(null);

    const getIcon = (category: string) => {
        const cat = category?.toLowerCase() || "";
        if (cat.includes("police") || cat.includes("pnp")) return Siren;
        if (cat.includes("fire") || cat.includes("bfp")) return Flame;
        if (cat.includes("health") || cat.includes("hospital") || cat.includes("rhu")) return HeartPulse;
        if (cat.includes("mdrrmo") || cat.includes("disaster")) return AlertCircle;
        return Info;
    };

    const copyToClipboard = (number: string, name: string) => {
        if (!number) return;
        navigator.clipboard.writeText(number);
        setCopied(number);
        toast.success(`Copied ${name}'s number: ${number}`);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <section id="hotlines" className="pt-0 pb-24 px-6 bg-slate-950 text-white relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-red-600/5 blur-[100px] rounded-full" />

            {/* Disaster Monitoring (Side by Side Maps) */}
            <div className="max-w-7xl mx-auto mb-24 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <CloudLightning className="w-8 h-8 text-blue-500 animate-pulse" />
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">Map Monitoring</h2>
                        </div>
                        <p className="text-slate-400 font-medium italic max-w-lg">
                            Real-time visualization of weather patterns and municipal boundaries.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Mapandan Border Map (Left Side) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden h-[500px] relative bg-[#050505]"
                    >
                        <div className="absolute top-6 left-6 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 pointer-events-none">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="text-xs font-black tracking-widest uppercase text-white shadow-sm">Mapandan Territory</span>
                        </div>
                        <MapandanMapWrapper />
                    </motion.div>

                    {/* Live Weather / Typhoon Map (Right Side) */}
                    <motion.div 
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden h-[500px] relative"
                    >
                        <div className="absolute top-6 left-6 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 pointer-events-none">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="text-xs font-black tracking-widest uppercase text-white shadow-sm">Live Weather Radar</span>
                        </div>
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=5&overlay=wind&product=ecmwf&level=surface&lat=12.8797&lon=121.7740" 
                            frameBorder="0"
                            title="Live Weather Map"
                            className="absolute inset-0"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Emergency Hotlines Container */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 relative z-10">
                <div className="space-y-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Siren className="w-6 h-6 md:w-8 md:h-8 text-red-500 animate-pulse" />
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">Emergency Hotlines</h2>
                        </div>
                        <p className="text-slate-400 font-medium italic max-w-lg">
                            In case of emergency, please contact the appropriate department immediately. 
                            Lines are open 24/7. Click to copy the number.
                        </p>
                    </div>

                    <div className="overflow-y-auto max-h-[500px] pr-4 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TooltipProvider>
                                {initialHotlines.length > 0 ? initialHotlines.map((hotline, idx) => {
                                    const Icon = getIcon(hotline.category);
                                    const primaryNumber = hotline.mobileNumber || hotline.telephone || "N/A";
                                    
                                    return (
                                        <Tooltip key={hotline.id}>
                                            <TooltipTrigger asChild>
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    whileInView={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    onClick={() => copyToClipboard(primaryNumber, hotline.name)}
                                                    className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center gap-4 hover:bg-white/10 transition-all group cursor-pointer relative"
                                                >
                                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                                                        <Icon className="w-6 h-6 text-slate-300 group-hover:text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors truncate">{hotline.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-lg font-black tracking-tighter text-white">{primaryNumber}</p>
                                                            {copied === primaryNumber && (
                                                                <span className="text-[10px] font-bold text-emerald-500 italic animate-in fade-in zoom-in">Copied!</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                                                    </div>
                                                </motion.div>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-900 border-white/10 p-4 rounded-2xl max-w-xs shadow-2xl">
                                                <div className="space-y-3">
                                                    <p className="text-xs font-black uppercase tracking-widest text-primary italic border-b border-white/10 pb-2">{hotline.name}</p>
                                                    
                                                    {hotline.mobileNumber && (
                                                        <div className="flex items-center gap-2">
                                                            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                                                            <span className="text-[11px] font-bold text-slate-300">Mobile: {hotline.mobileNumber}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {hotline.telephone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-3.5 h-3.5 text-blue-500" />
                                                            <span className="text-[11px] font-bold text-slate-300">Tele: {hotline.telephone}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {hotline.address && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                                                            <span className="text-[11px] font-medium italic text-slate-400 leading-snug">{hotline.address}</span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="pt-1">
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Click any card to copy the primary number</p>
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                }) : (
                                    <div className="col-span-full py-12 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                                        <Info className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">No active hotlines listed...</p>
                                    </div>
                                )}
                            </TooltipProvider>
                        </div>
                    </div>

                    <div className="p-8 bg-primary/10 border border-primary/20 rounded-[2.5rem] flex items-start gap-4">
                        <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
                        <p className="text-sm text-primary/80 font-medium italic text-primary/80">
                            Non-emergency reports can be submitted using the form on the right. 
                            For life-threatening situations, always call the hotlines first.
                        </p>
                    </div>
                </div>

                {/* Report Form Component */}
                <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <ReportForm />
                </motion.div>
            </div>
        </section>
    );
}
