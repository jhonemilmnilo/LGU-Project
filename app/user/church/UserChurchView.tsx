/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { Church, Home, Clock, Download, TrendingUp, ArrowRight, Info, Calendar, Navigation } from "lucide-react";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { format } from "date-fns";
import * as React from "react";

import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface UserChurchViewProps {
    info: any;
    schedules: any[];
    collections: any[];
    availableBarangays?: string[];
    currentBarangay?: string;
}

export function UserChurchView({
    info,
    schedules = [],
    collections = [],
    availableBarangays = [],
    currentBarangay
}: UserChurchViewProps) {
    const router = useRouter();
    const latest = collections[0];
    const [selectedMonth, setSelectedMonth] = React.useState<string>("all");

    const onSectorChange = (val: string) => {
        if (val === "global") {
            router.push("/user/church");
        } else {
            router.push(`/user/church?barangay=${val}`);
        }
    };

    const availableMonths = React.useMemo(() => {
        const safeCollections = [...collections];
        const months = new Set<string>();
        safeCollections.forEach(c => months.add(format(new Date(c.date), "MMMM")));
        return Array.from(months).sort((a, b) => {
            const monthsOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            return monthsOrder.indexOf(a) - monthsOrder.indexOf(b);
        });
    }, [collections]);

    const filteredCollections = React.useMemo(() => {
        const safeCollections = [...collections];
        if (selectedMonth === "all") return safeCollections;
        return safeCollections.filter(c => format(new Date(c.date), "MMMM") === selectedMonth);
    }, [collections, selectedMonth]);

    const groupedSchedules = React.useMemo(() => {
        const result: { day: string, slots: any[], isPriority: boolean }[] = [];

        schedules.forEach(s => {
            const isPriority = (s.prio || 0) > 0;
            const dayKey = s.date ? format(new Date(s.date), "MMMM dd, yyyy") : s.day;

            const existing = result.find(g => g.day === dayKey && g.isPriority === isPriority);
            if (existing) {
                existing.slots.push(s);
            } else {
                result.push({ day: dayKey, slots: [s], isPriority });
            }
        });

        result.forEach(g => {
            g.slots.sort((a, b) => (b.prio || 0) - (a.prio || 0));
        });

        const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        return result.sort((a, b) => {
            // Priority First
            if (a.isPriority && !b.isPriority) return -1;
            if (!a.isPriority && b.isPriority) return 1;

            const idxA = dayOrder.indexOf(a.day);
            const idxB = dayOrder.indexOf(b.day);

            if (idxA !== -1 && idxB !== -1) {
                return idxA - idxB;
            }
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return 0;
        });
    }, [schedules]);

    const addressSuffix = info.address?.toLowerCase().includes("mapandan") ? "" : ", Mapandan, Pangasinan";
    const mapQuery = info.latitude && info.longitude
        ? `${info.latitude},${info.longitude}`
        : `${info.name}${info.address ? `, ${info.address}` : ""}${addressSuffix}`;

    // Updated to use same zoom (15) and added iwloc=A to force the pin
    const publicMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=A&output=embed`;

    return (
        <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Breadcrumb section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <Breadcrumb>
                    <BreadcrumbList className="bg-slate-950/90 backdrop-blur-xl px-6 py-2.5 rounded-2xl border border-white/10 w-fit shadow-2xl">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-80 transition-opacity">
                                    <Home className="w-3.5 h-3.5 mb-0.5" />
                                    Home
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="text-white/20" />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/user/church" className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors italic">Main Parish</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {info.barangay && (
                            <>
                                <BreadcrumbSeparator className="text-white/20" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic">Sector: {info.barangay}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Sector Switcher UI */}
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-xl">
                    <div className="px-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Exploring Locations</p>
                    </div>
                    <Select value={currentBarangay || "global"} onValueChange={onSectorChange}>
                        <SelectTrigger className="w-[180px] bg-slate-950 text-white border-white/10 rounded-xl font-bold uppercase italic text-[10px] tracking-widest h-10 shadow-2xl">
                            <SelectValue placeholder="Select Parish Sector" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 text-white border-white/10 rounded-xl">
                            <SelectItem value="global" className="font-bold uppercase italic text-[10px] tracking-widest">Mapandan Main Parish</SelectItem>
                            {availableBarangays.map((b) => (
                                <SelectItem key={b} value={b} className="font-bold uppercase italic text-[10px] tracking-widest">
                                    Sector: {b}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Premium Header Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[22px] flex items-center justify-center shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform" style={{ background: `linear-gradient(to bottom right, ${info.themeColor || '#2563eb'}, ${info.themeColor || '#1e40af'}dd)`, boxShadow: `0 25px 50px -12px ${info.themeColor}66` }}>
                            {info.barangay ? (
                                <Navigation className="w-8 h-8 text-white" />
                            ) : (
                                <Church className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                                {info.name || (info.barangay ? `${info.barangay} Sector` : "Holy Rosary Parish")}
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] ml-1" style={{ color: info.themeColor || '#2563eb' }}>
                                {info.barangay ? `Community Outreach • ${info.barangay}` : "The Mother Parish of Mapandan"}
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium italic max-w-3xl text-lg leading-relaxed">
                        The heartbeat of our spiritual community. Located at <span className="text-slate-900 dark:text-white font-black">{info.address}</span>.
                        We welcome everyone to join our celebrations and foster stewardship together.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {info.locationUrl && (
                        <a
                            href={info.locationUrl}
                            target="_blank"
                            className="flex items-center gap-2.5 px-5 py-2.5 bg-primary text-white rounded-full font-black uppercase italic tracking-wider text-[10px] transition-all shadow-lg shadow-primary/25 group border-none"
                        >
                            <Navigation className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Navigate</span>
                        </a>
                    )}
                    {info.flyerUrl && (
                        <a
                            href={info.flyerUrl}
                            download
                            className="flex items-center space-x-3 bg-primary hover:opacity-90 text-white px-8 py-4 rounded-[1.8rem] font-black uppercase italic tracking-tighter text-sm shadow-xl shadow-primary/25 transition-all active:scale-95 group"
                        >
                            <Download size={18} className="group-hover:bounce" />
                            <span>Download Weekly Flyer</span>
                        </a>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* LEFT: Schedules and Info */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Mass Schedule Card */}
                    <div className="bg-white dark:bg-[#0f1117] rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden p-10 ring-1 ring-slate-200 dark:ring-white/5">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${info.themeColor || '#2563eb'}1a` }}>
                                    <Clock className="w-5 h-5" style={{ color: info.themeColor || '#2563eb' }} />
                                </div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Mass Schedule</h3>
                            </div>
                        </div>

                        <div className="space-y-6 max-h-[650px] overflow-y-auto custom-scrollbar pr-2 pb-6">
                            {groupedSchedules.map((group, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`rounded-[2.5rem] border overflow-hidden ${group.isPriority ? 'bg-slate-900 border-white/10 ring-2 ring-amber-500/20' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'}`}
                                >
                                    <div className={`${group.isPriority ? 'bg-white/5' : 'bg-slate-100 dark:bg-white/5'} px-8 py-4 flex items-center justify-between border-b border-white/5`}>
                                        <div className="flex items-center gap-2">
                                            <Calendar className={`w-4 h-4 ${group.isPriority ? 'text-amber-500' : ''}`} style={group.isPriority ? {} : { color: info.themeColor || '#2563eb' }} />
                                            <span className={`text-[10px] font-black uppercase italic tracking-widest ${group.isPriority ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                                                {group.day} {group.isPriority ? '• Liturgical Highlight' : ''}
                                            </span>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest italic ${group.isPriority ? 'text-white/30' : 'text-slate-400'}`}>
                                            ECCLESIASTICAL ORDER
                                        </span>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        {group.slots.map((s, sIdx) => {
                                            const isPriority = (s.prio || 0) > 0;
                                            return (
                                                <div key={sIdx} className={`relative pl-8 border-l-2 last:border-0 pb-4 ${isPriority ? 'border-amber-500/50' : 'border-primary/20'}`}>
                                                    <div className={`absolute top-0 left-[-5px] w-2.5 h-2.5 rounded-full ${isPriority ? 'bg-amber-500 scale-125 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} />
                                                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                                                        <div className="space-y-2 max-w-xl">
                                                            <div className="flex items-center gap-3">
                                                                <p className={`text-4xl font-black tracking-tighter uppercase italic leading-none ${group.isPriority ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{s.time}</p>
                                                            </div>
                                                            {s.description && (
                                                                <div className="flex items-start gap-2 opacity-90">
                                                                    <Info className="w-3.5 h-3.5 text-primary mt-1 shrink-0" />
                                                                    <p className={`text-xs italic font-medium leading-relaxed ${group.isPriority ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>{s.description}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-right">
                                                                <span className="block text-[10px] font-black uppercase tracking-widest text-primary italic leading-none">{s.language || "English"}</span>
                                                                <span className={`block text-[10px] font-bold uppercase tracking-widest mt-1 ${group.isPriority ? 'text-white/30' : 'text-slate-400'}`}>{s.type || "Holy Mass"}</span>
                                                            </div>
                                                            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${group.isPriority ? 'bg-white/5 border-white/10 text-white/50' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400'}`}>
                                                                <ArrowRight size={14} className="-rotate-45" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* PDF Download link at the bottom of the card content area */}
                        {info.flyerUrl && (
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col items-center">
                                <a
                                    href={info.flyerUrl}
                                    download
                                    className="group flex items-center gap-4 px-8 py-4 bg-slate-100 dark:bg-white/5 hover:bg-primary hover:text-white rounded-[2rem] transition-all duration-500 border border-slate-200 dark:border-white/10 shadow-sm"
                                >
                                    <div className="w-10 h-10 bg-primary/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                                        <Download className="w-5 h-5 text-primary group-hover:text-white group-hover:bounce" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/70 italic">Digital Litany</p>
                                        <p className="text-sm font-black italic uppercase tracking-tighter leading-none">Download Weekly Mass Flyer</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-white transition-transform group-hover:translate-x-1" />
                                </a>
                                <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-50">Official Schedule PDF</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Transparency Records */}
                <div className="space-y-8">

                    {/* Latest Financial Card */}
                    <div className="bg-primary rounded-[3.5rem] p-10 text-white shadow-2xl shadow-primary/25 relative overflow-hidden group border border-white/5">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-6 h-6 text-emerald-200" />
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Collection</h3>
                                </div>
                                <span className="p-2 bg-white/10 rounded-xl"><Info size={16} /></span>
                            </div>

                            {latest ? (
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 opacity-80">Week ending {format(new Date(latest.date), "MMMM dd, yyyy")}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-7xl font-black tracking-tighter italic">₱{latest.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Sunday Mass Breakdown */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-white/20 pb-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 italic">Sunday Masses ({format(new Date(latest.date), "MMM dd")})</p>
                                            <p className="text-xs font-black italic">₱{(latest.sundayMassJson as any[]).reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-2">
                                            {(latest.sundayMassJson as any[]).map((m, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs font-bold italic opacity-80 bg-white/5 px-4 py-2 rounded-2xl">
                                                    <span>{m.time}</span>
                                                    <span>₱{Number(m.amount).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-100 mb-1 italic">2nd Basket</p>
                                            <p className="text-xl font-bold italic">₱{Number(latest.secondBasket).toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-100 mb-1 italic">Envelopes</p>
                                            <p className="text-xl font-bold italic">₱{Number(latest.envelopes).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {(latest.donationsJson as any[]).length > 0 && (
                                        <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-100 mb-1 italic">Generous Donations</p>
                                            <p className="text-xl font-bold italic">₱{(latest.donationsJson as any[]).reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-emerald-100 font-bold italic">Stewardship report coming soon...</p>
                            )}
                        </div>
                    </div>

                    {/* Historical Logs List */}
                    <div className="bg-white dark:bg-[#0f1117] rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl p-10 ring-1 ring-slate-200 dark:ring-white/5 flex flex-col max-h-[700px] min-h-[300px]">
                        <div className="flex items-center justify-between mb-8 shrink-0">
                            <div className="space-y-1">
                                <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Financial History</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{filteredCollections.length} Records found</p>
                            </div>
                            <Info size={14} className="text-slate-400" />
                        </div>

                        {/* Month Filter Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-6 mb-4 shrink-0 no-scrollbar">
                            <button
                                onClick={() => setSelectedMonth("all")}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedMonth === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                            >
                                All Time
                            </button>
                            {availableMonths.map(month => (
                                <button
                                    key={month}
                                    onClick={() => setSelectedMonth(month)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedMonth === month ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                                >
                                    {month}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                            {filteredCollections.length > 0 ? filteredCollections.map((c, idx) => (
                                <div key={c.id} className="group p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest group-hover:opacity-100 transition-colors italic" style={{ color: info.themeColor || '#2563eb' }}>Report Log</p>
                                        <h5 className="text-sm font-bold text-slate-900 dark:text-slate-200">{format(new Date(c.date), "MMMM dd, yyyy")}</h5>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black italic tracking-tighter text-slate-900 dark:text-white group-hover:scale-110 transition-transform origin-right">₱{c.totalAmount.toLocaleString()}</p>
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic opacity-0 group-hover:opacity-100 transition-opacity">Full Transparency</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center py-20 text-slate-400 font-bold italic uppercase text-xs border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2rem]">No records log available for {selectedMonth}.</p>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 text-center shrink-0">
                            <p className="text-[10px] text-slate-400 font-medium italic">Authenticated transparency ledger for the community of Mapandan.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
