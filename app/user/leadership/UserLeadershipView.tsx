"use client";

import { motion } from "framer-motion";
import { Users, PhoneCall, Shield, ArrowRight, Copy, Facebook, Mail, Siren, Flame, AlertCircle, HeartPulse } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UserLeadershipView({ initialOfficials = [], initialHotlines = [] }: { initialOfficials: any[], initialHotlines: any[] }) {
    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Council & Safety</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        Connect with your local leaders and access essential emergency services. Your direct line to municipal governance and community security.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="officials" className="space-y-10">
                <TabsList className="bg-slate-100 dark:bg-white/5 p-1 h-16 rounded-2xl w-full sm:w-auto">
                    <TabsTrigger value="officials" className="h-full px-8 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                        <Shield className="w-4 h-4 mr-2" />
                        Town Council
                    </TabsTrigger>
                    <TabsTrigger value="safety" className="h-full px-8 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                        <PhoneCall className="w-4 h-4 mr-2" />
                        Emergency Hotlines
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="officials" className="outline-none">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
                        {initialOfficials.map((official, idx) => (
                            <motion.div
                                key={official.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative flex flex-col items-center text-center space-y-4"
                            >
                                <div className="relative w-full aspect-[4/5] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5">
                                    <Image
                                        src={official.imageUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"}
                                        alt={official.name}
                                        fill
                                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                                    
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                        <button className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all">
                                            <Facebook className="w-4 h-4" />
                                        </button>
                                        <button className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all">
                                            <Mail className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">{official.name}</h3>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{official.position}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="safety" className="outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {initialHotlines.map((hotline, idx) => (
                            <motion.div
                                key={hotline.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 bg-white dark:bg-[#0a0c10] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl flex flex-col items-center text-center group hover:border-red-500 transition-all"
                            >
                                <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 overflow-hidden relative">
                                     <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                     <PhoneCall className="w-8 h-8 text-red-600 group-hover:text-white transition-colors relative z-10" />
                                </div>
                                
                                <div className="space-y-2 flex-1">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight italic">{hotline.title}</h3>
                                    <p className="text-sm text-slate-500 font-medium italic mb-4">{hotline.description || "Official Emergency Service"}</p>
                                    <h4 className="text-3xl font-black text-red-600 uppercase tracking-tighter">{hotline.number}</h4>
                                </div>
                                
                                <div className="w-full flex gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                                    <Button className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                                        Call Signal
                                    </Button>
                                    <Button variant="outline" className="w-14 h-14 rounded-2xl border-slate-200 dark:border-white/10 flex items-center justify-center group/copy hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                                        <Copy className="w-5 h-5 text-slate-400 group-hover/copy:text-red-600 transition-colors" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
