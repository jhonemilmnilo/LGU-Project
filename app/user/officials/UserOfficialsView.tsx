"use client";

import { motion } from "framer-motion";
 
import { Users, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface Official {
    id: string;
    name: string;
    position: string;
    imageUrl?: string | null;
}

export function UserOfficialsView({ initialOfficials = [] }: { initialOfficials: Official[] }) {
    const mayor = initialOfficials.find(o => o.position.toLowerCase().includes('mayor') && !o.position.toLowerCase().includes('vice'));
    const others = initialOfficials.filter(o => o.id !== mayor?.id);

    return (
        <div className="space-y-16 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Town Officials</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        The dedicated leaders of Mapandan, committed to serving the community with transparency and integrity.
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center space-y-20">
                {/* Mayor Highlight */}
                {mayor && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group flex flex-col items-center text-center space-y-8"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-600 rounded-full blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity duration-700" />
                            <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full border-8 border-white dark:border-slate-900 shadow-2xl overflow-hidden ring-4 ring-blue-600/20 group-hover:scale-105 transition-transform duration-700">
                                <Image
                                    src={mayor.imageUrl || "https://i.pravatar.cc/400?u=mayor"}
                                    alt={mayor.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 fill-white" />
                                <span className="text-xs font-black uppercase tracking-widest">Leadership</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{mayor.name}</h2>
                            <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-sm italic">{mayor.position}</p>
                        </div>
                    </motion.div>
                )}

                {/* Council Members Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 w-full pt-10 px-4">
                    {others.map((member, idx) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="group flex flex-col items-center text-center space-y-6"
                        >
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden ring-2 ring-slate-100 dark:ring-white/5 transition-all duration-500 group-hover:ring-blue-600/20 group-hover:scale-110">
                                <Image
                                    src={member.imageUrl || `https://i.pravatar.cc/300?u=${member.id}`}
                                    alt={member.name}
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                            <div className="space-y-1 px-4">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-tight">{member.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{member.position}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {initialOfficials.length === 0 && (
                <div className="py-20 text-center opacity-50 italic">Directory under preparation...</div>
            )}
        </div>
    );
}
