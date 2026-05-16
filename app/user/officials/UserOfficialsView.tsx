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

    const barangayList = useMemo(() => ["LGU", ...activeBarangays.sort()], [activeBarangays]);

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

    const titleText = isLGU ? "Town Officials" : `${selectedView}`;

    return (
        <div className="space-y-6 md:space-y-12 pb-20">
            {/* Breadcrumb section */}
            <div className="md:static -mx-4 md:mx-0 px-4 md:px-0 pt-2 md:pt-0">
                <Breadcrumb>
                    <BreadcrumbList className="bg-white/80 dark:bg-white/5 backdrop-blur-md px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-white/10 w-fit shadow-sm">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                                    <Home className="w-3.5 h-3.5 mb-0.5" />
                                    Home
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">Leadership Hub</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Header section with Select - STICKY on Mobile */}
            <div className="sticky md:static top-[70px] md:top-auto z-40 bg-white/95 dark:bg-[#0a0c10]/95 md:bg-transparent md:dark:bg-transparent px-4 md:px-0 pt-4 pb-3 md:py-0 -mx-4 md:mx-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-8 border-b border-slate-200/50 dark:border-white/5 md:border-none shadow-sm md:shadow-none">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-primary rounded-xl md:rounded-[22px] flex items-center justify-center shadow-lg md:shadow-2xl shadow-primary/40 transform -rotate-3 hover:rotate-0 transition-transform shrink-0">
                            <Users className="w-5 h-5 md:w-7 md:h-7 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{titleText}</h1>
                            <p className="text-[8px] md:text-[10px] font-bold text-primary uppercase tracking-[0.3em] ml-1">The Leadership</p>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-auto px-1 md:px-0">
                    <Select value={selectedView} onValueChange={setSelectedView}>
                        <SelectTrigger className="h-10 md:h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl md:rounded-2xl font-bold italic text-xs md:text-sm focus:ring-primary/20 shadow-sm">
                            <Filter className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2 text-primary" />
                            <SelectValue placeholder="Select Area" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl md:rounded-2xl">
                            {barangayList.map(b => (
                                <SelectItem key={b} value={b} className="font-bold italic text-xs md:text-sm uppercase tracking-widest">
                                    {b === "LGU" ? "Municipal Government" : `Bgy. ${b}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-col items-center space-y-12 md:space-y-24">
                {/* Main Head Highlight (Mayor or Kapitan) */}
                {leadOfficial && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group flex flex-col items-center text-center space-y-6 md:space-y-10 w-full max-w-4xl px-4 md:px-6"
                    >
                        <Link href={`/user/leadership/${leadOfficial.id}`} className="block relative w-full">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary rounded-full blur-[60px] md:blur-[100px] opacity-10 group-hover:opacity-25 transition-opacity duration-700" />
                                <div className="relative w-40 h-40 md:w-80 md:h-80 rounded-full border-4 md:border-8 border-white dark:border-slate-900 shadow-xl md:shadow-2xl overflow-hidden ring-2 md:ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all duration-700 mx-auto bg-slate-50 dark:bg-white/5">
                                    {leadOfficial.imageUrl ? (
                                        <Image
                                            src={leadOfficial.imageUrl}
                                            alt={leadOfficial.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-16 h-16 md:w-32 md:h-32 text-slate-200 dark:text-slate-800" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 md:-bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-primary text-white px-5 md:px-10 py-2 md:py-4 rounded-xl md:rounded-full shadow-xl flex items-center gap-2 md:gap-3 border border-white/10 z-10 w-max">
                                    <ShieldCheck className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary dark:text-white" />
                                    <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.3em] italic">
                                        {isLGU ? "Head of Government" : "Barangay Captain"}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="pt-6 md:pt-12 space-y-2 md:space-y-4">
                                <h2 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors">
                                    {leadOfficial.name}
                                </h2>
                                <div className="flex flex-col items-center gap-1 md:gap-2">
                                    <p className="text-primary font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-base italic">{leadOfficial.position}</p>
                                    <div className="w-12 md:w-24 h-1 md:h-1.5 bg-primary/20 rounded-full" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* Council Members Grid */}
                <div className="w-full space-y-8 md:space-y-12">
                    <div className="flex items-center gap-4 px-4 child:shrink-0">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                        <h2 className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-400 italic">
                            {isLGU ? "Municipal Council" : "Sangguniang Barangay"}
                        </h2>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 px-4">
                        {(isLGU ? lguOthers : brgyMembers).map((member, idx) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                viewport={{ once: true }}
                                className="group h-full"
                            >
                                <Link href={`/user/leadership/${member.id}`} className="block h-full p-4 md:p-8 bg-white dark:bg-[#0a0c10] rounded-2xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:border-primary transition-all active:scale-[0.98] shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col items-center text-center">
                                    <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full border-2 md:border-4 border-white dark:border-slate-800 shadow-md md:shadow-xl overflow-hidden ring-1 md:ring-2 ring-slate-100 dark:ring-white/5 transition-all duration-500 group-hover:ring-primary/30 group-hover:scale-105 shrink-0 bg-slate-50 dark:bg-slate-900">
                                        {member.imageUrl ? (
                                            <Image
                                                src={member.imageUrl}
                                                alt={member.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-8 h-8 md:w-12 md:h-12 text-slate-200 dark:text-slate-800" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-4 md:pt-6 space-y-1 md:space-y-2 flex-1">
                                        <h3 className="text-[11px] md:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-tight italic line-clamp-2">
                                            {member.name}
                                        </h3>
                                        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest italic leading-relaxed line-clamp-2">
                                            {member.position}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                    
                    {/* SK Council Render if Not LGU */}
                    {!isLGU && (skChairman || skMembers.length > 0) && (
                        <div className="pt-12 md:pt-24 space-y-8 md:space-y-16">
                            <div className="flex items-center gap-4 px-4 child:shrink-0">
                                <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                                <h2 className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-400 italic">
                                    Sangguniang Kabataan
                                </h2>
                                <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                            </div>
                            
                            {/* SK Chairman Highlight */}
                            {skChairman && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="group flex flex-col items-center text-center space-y-6 md:space-y-8 w-full max-w-4xl px-4 md:px-6 mx-auto"
                                >
                                    <Link href={`/user/leadership/${skChairman.id}`} className="block relative w-full">
                                        <div className="relative mx-auto">
                                            <div className="absolute inset-0 bg-amber-500 rounded-full blur-[60px] md:blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
                                            <div className="relative w-36 h-36 md:w-64 md:h-64 rounded-full border-4 md:border-8 border-white dark:border-slate-900 shadow-xl md:shadow-2xl overflow-hidden ring-2 md:ring-4 ring-amber-500/10 group-hover:ring-amber-500/30 transition-all duration-700 mx-auto bg-slate-50 dark:bg-white/5">
                                                {skChairman.imageUrl ? (
                                                    <Image
                                                        src={skChairman.imageUrl}
                                                        alt={skChairman.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User className="w-16 h-16 md:w-24 md:h-24 text-slate-200 dark:text-slate-800" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-3 md:-bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-amber-500 px-5 md:px-8 py-2 md:py-3 rounded-xl md:rounded-full shadow-xl flex items-center gap-2 border border-white/5 z-10 w-max">
                                                <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
                                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] italic">SK Chairman</span>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-6 md:pt-10 space-y-2 md:space-y-3">
                                            <h2 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none group-hover:text-amber-500 transition-colors">
                                                {skChairman.name}
                                            </h2>
                                            <div className="flex flex-col items-center gap-1 md:gap-2">
                                                <p className="text-amber-500 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[9px] md:text-sm italic">{skChairman.position}</p>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )}

                            {/* SK Members Grid */}
                            {skMembers.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 px-4">
                                    {skMembers.map((member, idx) => (
                                        <motion.div
                                            key={member.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            viewport={{ once: true }}
                                            className="group h-full"
                                        >
                                            <Link href={`/user/leadership/${member.id}`} className="block h-full p-4 md:p-8 bg-white dark:bg-[#0a0c10] rounded-2xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:border-amber-500 transition-all active:scale-[0.98] shadow-lg shadow-amber-500/10 dark:shadow-none flex flex-col items-center text-center">
                                                <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full border-2 md:border-4 border-white dark:border-slate-800 shadow-md md:shadow-xl overflow-hidden ring-1 md:ring-2 ring-slate-100 dark:ring-white/5 transition-all duration-500 group-hover:ring-amber-500/30 group-hover:scale-105 shrink-0 bg-slate-50 dark:bg-slate-900">
                                                    {member.imageUrl ? (
                                                        <Image
                                                            src={member.imageUrl}
                                                            alt={member.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <User className="w-8 h-8 md:w-12 md:h-12 text-slate-200 dark:text-slate-800" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="pt-4 md:pt-6 space-y-1 md:space-y-2 flex-1">
                                                    <h3 className="text-[11px] md:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-amber-500 transition-colors leading-tight italic line-clamp-2">
                                                        {member.name}
                                                    </h3>
                                                    <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest italic leading-relaxed line-clamp-2">
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
                <div className="mx-4 md:mx-0 py-32 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] md:rounded-[4rem] bg-white dark:bg-black/10">
                    <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic text-xs md:text-base">The Council is convening...</p>
                </div>
            )}
        </div>
    );
}
