"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Siren, Flame, HeartPulse, Send, AlertCircle, Info, Copy, Smartphone, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

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
        <section id="hotlines" className="py-24 px-6 bg-slate-950 text-white relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-red-600/5 blur-[100px] rounded-full" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 relative z-10">
                {/* Hotlines */}
                <div className="space-y-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Siren className="w-6 h-6 md:w-8 md:h-8 text-red-500 animate-pulse" />
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Emergency Hotlines</h2>
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
                        <p className="text-sm text-primary/80 font-medium italic">
                            Non-emergency reports can be submitted using the form on the right. 
                            For life-threatening situations, always call the hotlines first.
                        </p>
                    </div>
                </div>

                {/* Report Form */}
                <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl relative"
                >
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Report an Issue</h3>
                            <p className="text-slate-400 text-sm font-medium italic">Help us maintain a better Mapandan for everyone.</p>
                        </div>

                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Issue Category</label>
                                <Select>
                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold transition-all focus:ring-primary">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 rounded-2xl text-white">
                                        <SelectItem value="waste" className="py-3 font-bold hover:bg-white/5 transition-colors">Waste Management</SelectItem>
                                        <SelectItem value="road" className="py-3 font-bold hover:bg-white/5 transition-colors">Road Repair</SelectItem>
                                        <SelectItem value="lighting" className="py-3 font-bold hover:bg-white/5 transition-colors">Street Lighting</SelectItem>
                                        <SelectItem value="other" className="py-3 font-bold hover:bg-white/5 transition-colors">Other Concerns</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Detail Description</label>
                                <Textarea 
                                    placeholder="Describe the issue in detail..." 
                                    className="min-h-[140px] bg-white/5 border-white/10 rounded-3xl p-5 font-bold transition-all focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <Button className="w-full py-4 h-auto bg-primary hover:opacity-90 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] italic shadow-xl shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-3">
                                <Send className="w-4 h-4" />
                                Submit Report
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
