"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Official {
    id: string;
    name: string;
    position: string;
    imageUrl: string | null;
}

export function Government({ officials = [] }: { officials?: Official[] }) {
    if (!officials || officials.length === 0) return null;

    const mayor = officials[0];
    const rest = officials.slice(1);

    return (
        <section id="leadership" className="py-24 px-6 max-w-7xl mx-auto space-y-20">
            <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-12 bg-primary/20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">The Leadership</span>
                    <div className="h-px w-12 bg-primary/20" />
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
                        <div className="absolute inset-0 bg-primary rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden ring-4 ring-primary/20 bg-slate-100 dark:bg-slate-800">
                            {mayor.imageUrl ? (
                                <Image
                                    src={mayor.imageUrl}
                                    alt={mayor.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <span className="text-4xl font-black uppercase italic tracking-tighter">{mayor.name.charAt(0)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight">{mayor.name}</h3>
                        <p className="text-primary font-black uppercase tracking-[0.2em] text-xs underline underline-offset-8 decoration-2">{mayor.position}</p>
                    </div>
                </motion.div>

                {/* Council Members */}
                <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-10 gap-y-12 w-full pt-10">
                    {rest.map((member, idx) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="group flex flex-col items-center space-y-4 text-center w-[140px] sm:w-[160px] md:w-[180px]"
                        >
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-2 border-white dark:border-slate-800 shadow-xl overflow-hidden ring-2 ring-slate-100 dark:ring-white/5 bg-slate-100 dark:bg-slate-800 transition-all duration-300">
                                {member.imageUrl ? (
                                    <Image
                                        src={member.imageUrl}
                                        alt={member.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-all duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <span className="text-2xl font-black uppercase italic tracking-tighter">{member.name.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[11px] sm:text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{member.name.replace('Hon. ', '')}</h4>
                                <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{member.position}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
