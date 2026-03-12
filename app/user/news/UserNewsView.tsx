"use client";

import { motion } from "framer-motion";
import { Newspaper, Bell, Search, Tag, Calendar, User, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UserNewsView({ initialNews = [] }: { initialNews: any[] }) {
    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <Newspaper className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Municipal News</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        Official updates, press releases, and community stories directly from the Agno Municipal Information Office.
                    </p>
                </div>
            </div>

            {/* Featured Article (First one) */}
            {initialNews.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative aspect-[21/9] rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl"
                >
                    <Image
                        src={initialNews[0].imageUrl || "https://images.unsplash.com/photo-150471142745a-5099af501997?auto=format&fit=crop&q=80&w=1200"}
                        alt={initialNews[0].title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4 max-w-2xl">
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Featured Bulletin</span>
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-tight">{initialNews[0].title}</h2>
                            <p className="text-slate-300 font-medium italic line-clamp-2">{initialNews[0].content}</p>
                        </div>
                        <Button className="h-14 px-8 bg-white text-blue-600 hover:bg-white/90 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center gap-2 group/btn">
                            Read Full Story
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {initialNews.slice(1).map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-[#0a0c10] rounded-[2.5rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col group hover:border-blue-500 transition-all"
                    >
                        <div className="relative aspect-video overflow-hidden">
                            <Image
                                src={item.imageUrl || "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=800"}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-md flex items-center gap-1.5">
                                    <Tag className="w-3 h-3 text-blue-600" />
                                    Updates
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-8 space-y-4 flex-1 flex flex-col">
                            <div className="flex items-center gap-4 text-slate-400">
                                <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(item.publishDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest">
                                    <User className="w-3.5 h-3.5" />
                                    Admin
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-tight">
                                {item.title}
                            </h3>
                            
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-3 leading-relaxed flex-1">
                                {item.content}
                            </p>
                            
                            <Button variant="link" className="p-0 h-auto self-start text-blue-600 font-black uppercase tracking-widest flex items-center gap-2 group/read">
                                Read Story
                                <ArrowRight className="w-4 h-4 group-hover/read:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>
            
            {initialNews.length === 0 && (
                <div className="py-20 text-center space-y-4 opacity-50">
                    <Newspaper className="w-16 h-16 mx-auto text-slate-300" />
                    <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">No news available</h3>
                </div>
            )}
        </div>
    );
}
