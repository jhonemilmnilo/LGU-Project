"use client";

import { motion } from "framer-motion";
 
 
 
 
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Coffee, MapPin, Search, Star, Clock, Info, Phone, ArrowRight, Beef, Utensils } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function UserDiningView({ initialDining = [] }: { initialDining: any[] }) {
    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <Utensils className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Local Dining</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
{ }
{ }
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        Explore Agno's diverse culinary landscape. From beachfront grills to cozy town center cafes.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {initialDining.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-[#0a0c10] rounded-[3rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col group hover:border-blue-500 transition-all"
                    >
                        <div className="relative aspect-[16/10] sm:aspect-video overflow-hidden">
                            <Image
                                src={item.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
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
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">{item.type || "Local Special"}</span>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter transition-colors group-hover:text-blue-600 leading-tight">
                                    {item.name}
                                </h3>
                                <div className="flex items-center gap-2 pt-2 text-slate-400">
                                    <MapPin className="w-4 h-4 text-slate-300" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.location}</span>
                                </div>
                            </div>
                            
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2 leading-relaxed flex-1">
                                {item.description}
                            </p>
                            
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                <Button className="h-12 px-6 bg-slate-900 text-white hover:bg-blue-600 rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 group/cta shadow-lg">
                                    Order Direct
                                    <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-1 transition-transform" />
                                </Button>
                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    Until 10PM
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {initialDining.length === 0 && (
                <div className="py-20 text-center opacity-50 italic">Chef is preparing some updates...</div>
            )}
        </div>
    );
}

import { cn } from "@/lib/utils";
