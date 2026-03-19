"use client";

import { motion } from "framer-motion";
 
import { Users, ShieldCheck, Home, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export interface Official {
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
            <Breadcrumb>
                <BreadcrumbList className="bg-white/50 dark:bg-white/5 backdrop-blur-sm px-6 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5 w-fit shadow-sm">
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">
                                <Home className="w-3.5 h-3.5 mb-0.5" />
                                Home
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-blue-600 italic max-w-[200px] truncate">Town Officials</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
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

            <div className="flex flex-col items-center space-y-24">
                {/* Mayor Highlight */}
                {mayor && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group flex flex-col items-center text-center space-y-10 max-w-2xl px-6"
                    >
                        <Link href={`/user/leadership/${mayor.id}`} className="block relative">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-600 rounded-full blur-[100px] opacity-10 group-hover:opacity-25 transition-opacity duration-700" />
                                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-white dark:border-slate-900 shadow-2xl overflow-hidden ring-4 ring-blue-600/10 group-hover:ring-blue-600/30 transition-all duration-700">
                                    {mayor.imageUrl ? (
                                        <Image
                                            src={mayor.imageUrl}
                                            alt={mayor.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                                            <User className="w-32 h-32 text-slate-200 dark:text-slate-800" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-blue-600 text-white px-10 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
                                    <ShieldCheck className="w-5 h-5 text-blue-500 dark:text-white" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Head of Government</span>
                                </div>
                            </div>
                            
                            <div className="pt-12 space-y-4">
                                <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
                                    {mayor.name}
                                </h2>
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-blue-600 font-black uppercase tracking-[0.4em] text-sm italic">{mayor.position}</p>
                                    <div className="w-12 h-1 bg-blue-600/20 rounded-full" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* Council Members Grid */}
                <div className="w-full space-y-12">
                     <div className="flex items-center gap-4 px-4 child:shrink-0">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                        <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 italic">Municipal Council</h2>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 w-full px-4">
                        {others.map((member, idx) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                viewport={{ once: true }}
                            >
                                <Link href={`/user/leadership/${member.id}`} className="group flex flex-col items-center text-center space-y-6 p-8 rounded-[3rem] hover:bg-white dark:hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-slate-100 dark:hover:border-white/5 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none">
                                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden ring-2 ring-slate-100 dark:ring-white/5 transition-all duration-500 group-hover:ring-blue-600/30 group-hover:scale-105">
                                        {member.imageUrl ? (
                                            <Image
                                                src={member.imageUrl}
                                                alt={member.name}
                                                fill
                                                className="object-cover transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                                <User className="w-16 h-16 text-slate-200 dark:text-slate-800" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-tight italic">
                                            {member.name}
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] italic leading-relaxed px-4">
                                            {member.position}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {initialOfficials.length === 0 && (
                <div className="py-32 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] bg-white dark:bg-black/10">
                    <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic">The Council is convening...</p>
                </div>
            )}
        </div>
    );
}
