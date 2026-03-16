"use client";

import { motion } from "framer-motion";
 
 
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Bed, MapPin, Search, Star, Clock, Info, Phone, ArrowRight, Wind, Waves, Coffee } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserAccommodationView({ initialAccommodations = [] }: { initialAccommodations: any[] }) {
    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <Bed className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Stay in Agno</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        From beachfront resorts to hillside villas. Find your home away from home in the coastal breeze of Agno.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {initialAccommodations.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-[#0a0c10] rounded-[3.5rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col group hover:border-blue-500 transition-all"
                    >
                        <div className="relative aspect-[16/10] sm:aspect-video overflow-hidden">
                            <Image
                                src={item.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-blue-600 shadow-md">
                                    {item.status || "AVAILABLE"}
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-8 space-y-6 flex-1 flex flex-col">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.type || "Resort"}</p>
                                    <div className="flex items-center gap-1.5 text-orange-400">
                                        <Star className="w-3 h-3 fill-orange-400" />
                                        <span className="text-[10px] font-black">{item.rating || "4.8"}</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter transition-colors group-hover:text-blue-600 leading-tight">
                                    {item.name}
                                </h3>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <MapPin className="w-4 h-4 text-slate-300" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.location}</span>
                                </div>
                            </div>
                            
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2 leading-relaxed flex-1">
                                {item.description}
                            </p>
                            
                            <div className="flex items-center gap-4 pt-4 mb-4">
                               <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                    <Waves className="w-4 h-4" />
                               </div>
                               <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                    <Wind className="w-4 h-4" />
                               </div>
                               <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                    <Coffee className="w-4 h-4" />
                               </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                <Button className="h-14 px-8 bg-blue-600 text-white hover:bg-slate-900 rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 group/cta shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                                    Book Now
                                    <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {initialAccommodations.length === 0 && (
                <div className="py-20 text-center opacity-50 italic">Seasonal bookings under preparation...</div>
            )}
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn } from "@/lib/utils";
