"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
 
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Shield, Award, Users, Star } from "lucide-react";

const council = [
    { name: "Hon. Gualberto R. Sison", role: "Municipal Mayor", priority: true, image: "https://i.pravatar.cc/300?u=mayor" },
    { name: "Hon. Alex Meyer", role: "Vice Mayor", image: "https://i.pravatar.cc/300?u=vice" },
    { name: "Hon. Councilor One", role: "Council Member", image: "https://i.pravatar.cc/300?u=c1" },
    { name: "Hon. Councilor Two", role: "Council Member", image: "https://i.pravatar.cc/300?u=c2" },
    { name: "Hon. Councilor Three", role: "Council Member", image: "https://i.pravatar.cc/300?u=c3" },
    { name: "Hon. Councilor Four", role: "Council Member", image: "https://i.pravatar.cc/300?u=c4" },
];

export function Government() {
    const mayor = council[0];
    const rest = council.slice(1);

    return (
        <section className="py-16 px-6 max-w-7xl mx-auto space-y-20">
            <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-12 bg-blue-600/20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">The Leadership</span>
                    <div className="h-px w-12 bg-blue-600/20" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                    Municipal Government
                </h2>
                <p className="text-slate-500 font-medium italic max-w-xl mx-auto">
                    A dedicated team working together for a sustainable and prosperous Mapandan.
                </p>
            </div>

            <div className="flex flex-col items-center space-y-16">
                {/* Mayor Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group flex flex-col items-center space-y-6 text-center"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden ring-4 ring-blue-600/20">
                            <Image
                                src={mayor.image}
                                alt={mayor.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg">
                            <Star className="w-5 h-5 fill-white" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{mayor.name}</h3>
                        <p className="text-blue-600 font-black uppercase tracking-[0.2em] text-xs underline underline-offset-8 decoration-2">{mayor.role}</p>
                    </div>
                </motion.div>

                {/* Council Members */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 xl:gap-12 w-full pt-10">
                    {rest.map((member, idx) => (
                        <motion.div
                            key={member.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="group flex flex-col items-center space-y-4 text-center"
                        >
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-2 border-white dark:border-slate-800 shadow-xl overflow-hidden ring-2 ring-slate-100 dark:ring-white/5">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[12px] sm:text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{member.name.replace('Hon. ', '')}</h4>
                                <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
