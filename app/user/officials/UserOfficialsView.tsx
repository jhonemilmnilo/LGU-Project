"use client";

import { motion } from "framer-motion";
 
import { Users, ShieldCheck, Home, User, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Official {
    id: string;
    name: string;
    position: string;
    imageUrl?: string | null;
    category?: string;
    barangay?: string | null;
    order: number;
}

export function UserOfficialsView({ initialOfficials = [], activeBarangays = [], currentView = "LGU" }: { initialOfficials: Official[], activeBarangays?: string[], currentView?: string }) {
    const [selectedView, setSelectedView] = useState(currentView === "All" ? "LGU" : currentView);

    const barangayList = useMemo(() => ["LGU", ...activeBarangays.sort()], [activeBarangays, currentView]);

    const displayedOfficials = useMemo(() => {
        if (selectedView === "LGU") {
            return initialOfficials.filter(o => o.category === "LGU" || !o.barangay);
        } else {
            return initialOfficials.filter(o => o.barangay === selectedView);
        }
    }, [initialOfficials, selectedView]);

    const isLGU = selectedView === "LGU";
    
    // Core LGU logic
    const lguMayor = isLGU ? displayedOfficials.find(o => o.order === 1) || displayedOfficials.find(o => 
        o.position.toLowerCase().includes('mayor') && !o.position.toLowerCase().includes('vice')
    ) : null;
    const lguOthers = isLGU ? displayedOfficials.filter(o => o.id !== lguMayor?.id) : [];

    // Barangay Logic
    const kapitan = !isLGU ? displayedOfficials.find(o => 
        o.category === "Barangay Council" && o.order === 1
    ) || displayedOfficials.find(o => 
        o.category === "Barangay Council" && (o.position.toLowerCase().includes('captain') || o.position.toLowerCase().includes('chairman'))
    ) : null;
    const brgyMembers = !isLGU ? displayedOfficials.filter(o => o.category === "Barangay Council" && o.id !== kapitan?.id) : [];

    // SK Logic
    const skChairman = !isLGU ? displayedOfficials.find(o => 
        o.category === "SK Council" && o.order === 1
    ) || displayedOfficials.find(o => 
        o.category === "SK Council" && (o.position.toLowerCase().includes('chairman') || o.position.toLowerCase().includes('president'))
    ) : null;
    const skMembers = !isLGU ? displayedOfficials.filter(o => o.category === "SK Council" && o.id !== skChairman?.id) : [];

    // Determine the main "Head" for the top section
    const leadOfficial = isLGU ? lguMayor : kapitan;

    const titleText = isLGU ? "Municipal Government" : `Barangay ${selectedView}`;
    const subtitleText = isLGU ? "The dedicated leaders of Mapandan, committed to serving the town with transparency." : `The dedicated leaders of Barangay ${selectedView}.`;

    return (
        <div className="space-y-16 pb-20">
            <Breadcrumb>
                <BreadcrumbList className="bg-black/20 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/10 w-fit shadow-sm">
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
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">Town Officials</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary rounded-[22px] flex items-center justify-center shadow-2xl shadow-primary/40 transform -rotate-2">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{titleText}</h1>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] ml-1">The Leadership</p>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl text-lg mt-2">
                        {subtitleText}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="w-full sm:w-[250px]">
                        <Select value={selectedView} onValueChange={setSelectedView}>
                            <SelectTrigger className="h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold italic focus:ring-primary/20 shadow-sm">
                                <Filter className="w-4 h-4 mr-2 text-primary" />
                                <SelectValue placeholder="Select Area" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-2xl">
                                {barangayList.map(b => (
                                    <SelectItem key={b} value={b} className="font-bold italic">
                                        {b === "LGU" ? "Municipal Government" : `Bgy. ${b}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center space-y-24">
                {/* Main Head Highlight (Mayor or Kapitan) */}
                {leadOfficial && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group flex flex-col items-center text-center space-y-10 w-full max-w-4xl px-6"
                    >
                        <Link href={`/user/leadership/${leadOfficial.id}`} className="block relative">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary rounded-full blur-[100px] opacity-10 group-hover:opacity-25 transition-opacity duration-700" />
                                <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-full border-8 border-white dark:border-slate-900 shadow-2xl overflow-hidden ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all duration-700 mx-auto">
                                    {leadOfficial.imageUrl ? (
                                        <Image
                                            src={leadOfficial.imageUrl}
                                            alt={leadOfficial.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                                            <User className="w-32 h-32 text-slate-200 dark:text-slate-800" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-primary text-white px-10 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 z-10">
                                    <ShieldCheck className="w-5 h-5 text-primary dark:text-white" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">
                                        {isLGU ? "Head of Government" : "Barangay Captain"}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="pt-12 space-y-4">
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none group-hover:text-primary transition-colors">
                                    {leadOfficial.name}
                                </h2>
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-primary font-black uppercase tracking-[0.4em] text-sm md:text-base italic">{leadOfficial.position}</p>
                                    <div className="w-24 h-1.5 bg-primary/20 rounded-full" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* Council Members Grid */}
                <div className="w-full space-y-12">
                    <div className="flex items-center gap-4 px-4 child:shrink-0">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                        <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 italic">
                            {isLGU ? "Municipal Council" : "Sangguniang Barangay"}
                        </h2>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full px-4">
                        {(isLGU ? lguOthers : brgyMembers).map((member, idx) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                viewport={{ once: true }}
                            >
                                <Link href={`/user/leadership/${member.id}`} className="group flex flex-col items-center text-center space-y-6 p-6 rounded-[2.5rem] hover:bg-white dark:hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-slate-100 dark:hover:border-white/5 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none">
                                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden ring-2 ring-slate-100 dark:ring-white/5 transition-all duration-500 group-hover:ring-primary/30 group-hover:scale-105">
                                        {member.imageUrl ? (
                                            <Image
                                                src={member.imageUrl}
                                                alt={member.name}
                                                fill
                                                className="object-cover transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                                <User className="w-12 h-12 text-slate-200 dark:text-slate-800" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-tight italic line-clamp-2">
                                            {member.name}
                                        </h3>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] italic leading-relaxed px-2">
                                            {member.position}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                    
                    {/* SK Council Render if Not LGU */}
                    {!isLGU && (skChairman || skMembers.length > 0) && (
                        <div className="pt-24 space-y-16">
                            <div className="flex items-center gap-4 px-4 child:shrink-0">
                                <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 italic">
                                    Sangguniang Kabataan
                                </h2>
                                <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                            </div>
                            
                            {/* SK Chairman Highlight */}
                            {skChairman && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="group flex flex-col items-center text-center space-y-8 w-full max-w-4xl px-6 mx-auto"
                                >
                                    <Link href={`/user/leadership/${skChairman.id}`} className="block relative">
                                        <div className="relative mx-auto">
                                            <div className="absolute inset-0 bg-amber-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
                                            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-white dark:border-slate-900 shadow-2xl overflow-hidden ring-4 ring-amber-500/10 group-hover:ring-amber-500/30 transition-all duration-700">
                                                {skChairman.imageUrl ? (
                                                    <Image
                                                        src={skChairman.imageUrl}
                                                        alt={skChairman.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                                                        <User className="w-24 h-24 text-slate-200 dark:text-slate-800" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-amber-500 px-8 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/5 z-10 w-max">
                                                <ShieldCheck className="w-4 h-4 text-amber-500" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">SK Chairman</span>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-10 space-y-3">
                                            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none group-hover:text-amber-500 transition-colors">
                                                {skChairman.name}
                                            </h2>
                                            <div className="flex flex-col items-center gap-2">
                                                <p className="text-amber-500 font-black uppercase tracking-[0.3em] text-xs md:text-sm italic">{skChairman.position}</p>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )}

                            {/* SK Members Grid */}
                            {skMembers.length > 0 && (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full px-4">
                                    {skMembers.map((member, idx) => (
                                        <motion.div
                                            key={member.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            viewport={{ once: true }}
                                        >
                                            <Link href={`/user/leadership/${member.id}`} className="group flex flex-col items-center text-center space-y-6 p-6 rounded-[2.5rem] hover:bg-white dark:hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-slate-100 dark:hover:border-white/5 hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-none">
                                                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden ring-2 ring-slate-100 dark:ring-white/5 transition-all duration-500 group-hover:ring-amber-500/30 group-hover:scale-105">
                                                    {member.imageUrl ? (
                                                        <Image
                                                            src={member.imageUrl}
                                                            alt={member.name}
                                                            fill
                                                            className="object-cover transition-transform duration-700"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                                            <User className="w-12 h-12 text-slate-200 dark:text-slate-800" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-amber-500 transition-colors leading-tight italic line-clamp-2">
                                                        {member.name}
                                                    </h3>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] italic leading-relaxed px-2">
                                                        {member.position}
                                                    </p>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {displayedOfficials.length === 0 && (
                <div className="py-32 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] bg-white dark:bg-black/10">
                    <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic">The Council is convening...</p>
                </div>
            )}
        </div>
    );
}
