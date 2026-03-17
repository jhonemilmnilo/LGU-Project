"use client";

import * as React from "react";
import { motion } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Phone, Siren, Flame, HeartPulse, Send, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const hotlines = [
    { name: "PNP Mapandan", number: "0912-345-6789", icon: Siren },
    { name: "Fire Station", number: "0912-345-6788", icon: Flame },
    { name: "MDRRMO", number: "0912-345-6787", icon: AlertCircle },
    { name: "Rural Health Unit", number: "0912-345-6786", icon: HeartPulse },
];

export function EmergencyReport() {
    return (
        <section id="hotlines" className="py-24 px-6 bg-slate-950 text-white relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
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
                            Lines are open 24/7.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {hotlines.map((hotline, idx) => (
                            <motion.div
                                key={hotline.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center gap-4 hover:bg-white/10 transition-all group cursor-pointer"
                            >
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                    <hotline.icon className="w-6 h-6 text-slate-300 group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-300 transition-colors">{hotline.name}</p>
                                    <p className="text-lg font-black tracking-tighter text-white">{hotline.number}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] flex items-start gap-4">
                        <Info className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                        <p className="text-sm text-blue-200 font-medium italic">
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
                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold transition-all focus:ring-blue-600">
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
                                    className="min-h-[140px] bg-white/5 border-white/10 rounded-3xl p-5 font-bold transition-all focus:ring-blue-600 focus:border-blue-600"
                                />
                            </div>

                            <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] italic shadow-2xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3">
                                Submit Report
                                <Send className="w-5 h-5" />
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
