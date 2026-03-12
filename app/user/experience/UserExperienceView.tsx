"use client";

import { motion } from "framer-motion";
import { Coffee, Bed, Star, MapPin, Clock, ArrowRight, Utensils, Waves, Wind } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UserExperienceView({ initialDining = [], initialAccommodations = [] }: { initialDining: any[], initialAccommodations: any[] }) {
    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <Utensils className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Kainan at Tuluyan</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        Discover Agno's culinary delights and comfortable stays. From beachfront grills to cozy local inns.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="dining" className="space-y-10">
                <TabsList className="bg-slate-100 dark:bg-white/5 p-1 h-16 rounded-2xl w-full sm:w-auto">
                    <TabsTrigger value="dining" className="h-full px-8 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                        <Coffee className="w-4 h-4 mr-2" />
                        Dining Hub
                    </TabsTrigger>
                    <TabsTrigger value="lodging" className="h-full px-8 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                        <Bed className="w-4 h-4 mr-2" />
                        Places to Stay
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dining" className="outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {initialDining.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-[#0a0c10] rounded-[3rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-xl group hover:border-blue-500 transition-all flex flex-col"
                            >
                                <div className="relative aspect-[16/10] sm:aspect-video overflow-hidden">
                                    <Image
                                        src={item.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"}
                                        alt={item.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className={cn(
                                            "px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-md",
                                            item.status === "OPEN" ? "text-green-600" : "text-red-500"
                                        )}>
                                            {item.status || "OPEN"}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6 flex-1 flex flex-col">
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.type || "Local Special"}</span>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h3>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{item.location}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2 leading-relaxed flex-1">{item.description}</p>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                        <Button className="h-12 px-6 bg-slate-900 text-white hover:bg-blue-600 rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 group/cta shadow-lg transition-all active:scale-95">
                                            Visit Now
                                            <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="lodging" className="outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {initialAccommodations.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-[#0a0c10] rounded-[3.5rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-xl group hover:border-blue-500 transition-all flex flex-col"
                            >
                                <div className="relative aspect-[16/10] sm:aspect-video overflow-hidden">
                                    <Image
                                        src={item.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"}
                                        alt={item.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-blue-600 shadow-md">
                                            {item.status || "AVAILABLE"}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6 flex-1 flex flex-col">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.type || "Resort"}</p>
                                            <div className="flex items-center gap-1.5 text-orange-400">
                                                <Star className="w-3.5 h-3.5 fill-orange-400" />
                                                <span className="text-[10px] font-black">{item.rating || "4.8"}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h3>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{item.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        {[Waves, Wind, Coffee].map((Icon, i) => (
                                            <div key={i} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2 leading-relaxed flex-1">{item.description}</p>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                        <Button className="h-14 px-8 bg-blue-600 text-white hover:bg-slate-900 rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 group/cta shadow-xl shadow-blue-500/10 transition-all active:scale-95">
                                            Book Stay
                                            <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
