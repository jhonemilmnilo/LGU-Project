"use client";

import { motion } from "framer-motion";
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Newspaper, Bell, Search, Tag, Calendar, User, ArrowRight, Home } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn } from "@/lib/utils";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserNewsView({ initialNews = [] }: { initialNews: any[] }) {
    return (
        <div className="space-y-12 pb-20">
            <Breadcrumb>
                <BreadcrumbList className="bg-black/20 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/10 w-fit shadow-sm mb-6">
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                                <Home className="w-3.5 h-3.5 mb-0.5" />
                                Home
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-white/50" />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">Municipal News</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30">
                            <Newspaper className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Municipal News</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        Official updates, press releases, and community stories directly from the Mapandan Municipal Information Office.
                    </p>
                </div>
            </div>

            {/* Featured Article (First one) */}
            {initialNews.length > 0 && (
                <Link href={`/user/news/${initialNews[0].id}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative aspect-auto md:aspect-[21/9] min-h-[500px] md:min-h-0 rounded-[2rem] md:rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl"
                    >
                        <Image
                            src={initialNews[0].imageUrl || "https://images.unsplash.com/photo-150471142745a-5099af501997?auto=format&fit=crop&q=80&w=1200"}
                            alt={initialNews[0].title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                        
                        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6 z-20">
                            <div className="space-y-4 max-w-2xl">
                                <span className="inline-block px-3 py-1 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg italic">Featured Bulletin</span>
                                <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter leading-tight">{initialNews[0].title}</h2>
                                <p className="text-slate-200 md:text-slate-300 font-medium italic line-clamp-2 text-sm">{initialNews[0].content}</p>
                            </div>
                            <div className="text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shrink-0 transition-opacity hover:opacity-80">
                                Read Full Story
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </motion.div>
                </Link>
            )}

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {initialNews.slice(1).map((item, idx) => (
                    <Link href={`/user/news/${item.id}`} key={item.id}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-[#0a0c10] h-full rounded-[2.5rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col group transition-all"
                        >
                            <div className="relative aspect-video overflow-hidden">
                                <Image
                                    src={item.imageUrl || "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=800"}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-md flex items-center gap-1.5">
                                        <Tag className="w-3 h-3 text-primary" />
                                        Updates
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-8 space-y-4 flex-1 flex flex-col">
                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest">
                                        <Calendar className="w-3.5 h-3.5 text-primary" />
                                        {new Date(item.publishDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest">
                                        <User className="w-3.5 h-3.5 text-primary" />
                                        Admin
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight line-clamp-2">
                                    {item.title}
                                </h3>
                                
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic line-clamp-3 leading-relaxed flex-1">
                                    {item.content}
                                </p>
                                
                                <div className="p-0 h-auto self-start text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-opacity hover:opacity-80">
                                    Read Story
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
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
