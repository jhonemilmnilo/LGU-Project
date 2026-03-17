"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Utensils, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CombinedItem {
    id: string;
    name: string;
    description: string | null;
    address: string;
    imageUrl: string | null;
    itemType: "kainan" | "tuluyan";
    type?: string; // for Accommodation
    cuisineType?: string; // for Dining
}

interface DiningLodgingProps {
    items: CombinedItem[];
}

export function DiningLodging({ items }: DiningLodgingProps) {
    if (!items || items.length === 0) return null;

    return (
        <section id="experience" className="py-16 px-6 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                        Kainan at Tuluyan
                    </h2>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        Discover the authentic flavors and premium retreats of Mapandan in one mixed experience.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/user/dining">
                        <Button className="h-12 px-6 bg-slate-100 dark:bg-white/5 hover:bg-orange-500 hover:text-white text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 group/btn transition-all shadow-sm">
                            <Utensils className="w-4 h-4" />
                            Kainan Hub
                            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link href="/user/accommodation">
                        <Button className="h-12 px-6 bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 group/btn transition-all shadow-sm">
                            <Bed className="w-4 h-4" />
                            Tuluyan & Resorts
                            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {items.map((item, idx) => {
                    const isDining = item.itemType === "kainan";
                    const CategoryIcon = isDining ? Utensils : Bed;
                    const subCategory = isDining ? item.cuisineType : item.type;
                    const detailHref = isDining ? `/user/dining/${item.id}` : `/user/accommodation/${item.id}`;

                    return (
                        <Link key={item.id} href={detailHref}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative flex flex-col space-y-4 cursor-pointer"
                            >
                                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-slate-200 dark:ring-white/5 transition-transform duration-500 group-hover:scale-[1.02]">
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                                            <CategoryIcon className="w-12 h-12 text-slate-300" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${isDining ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'} rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                                            <CategoryIcon className="w-3 h-3" />
                                            {item.itemType}
                                        </span>
                                        {subCategory && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-slate-900 shadow-lg">
                                                {subCategory}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 px-1">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors">
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <MapPin className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase truncate">{item.address}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium italic pt-1">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
