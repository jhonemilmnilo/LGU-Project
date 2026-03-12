"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, MapPin, ArrowRight, Utensils, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";

const items = [
    {
        id: 1,
        title: "Seaside Grill",
        category: "Dining",
        image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80&w=800",
        description: "Fresh seafood caught daily, served with panoramic ocean views.",
        rating: 4.8,
        price: "$$",
        icon: Utensils
    },
    {
        id: 2,
        title: "Agno Beach Resort",
        category: "Hotel",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800",
        description: "Experience luxury and serenity at our premier coastal retreat.",
        rating: 4.9,
        price: "$$$",
        icon: Bed
    },
    {
        id: 3,
        title: "Kainan ni Nanay",
        category: "Dining",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
        description: "Authentic Agno home-cooked meals featuring local delicacies.",
        rating: 4.7,
        price: "$",
        icon: Utensils
    },
    {
        id: 4,
        title: "Umbrella Lodge",
        category: "Guesthouse",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
        description: "Cozy accommodations perfect for families and nature enthusiasts.",
        rating: 4.5,
        price: "$",
        icon: Bed
    }
];

export function DiningLodging() {
    return (
        <section id="tourism" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                        Kainan & Tuluyan
                    </h2>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        Experience local flavors and comfortable stays in the heart of Agno.
                    </p>
                </div>
                <Button variant="ghost" className="group font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 flex items-center gap-2">
                    View All Locations
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {items.map((item, idx) => {
                    const CategoryIcon = item.icon;
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative flex flex-col space-y-4"
                        >
                            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-slate-200 dark:ring-white/5 transition-transform duration-500 group-hover:scale-[1.02]">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 z-20">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-lg">
                                        <CategoryIcon className="w-3 h-3 text-blue-600" />
                                        {item.category}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 px-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</h3>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.rating}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium italic">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
