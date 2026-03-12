"use client";

import Image from "next/image";
import { ShieldAlert, Maximize2, AlertTriangle, Map as MapIcon } from "lucide-react";

interface SimpleDisasterViewProps {
    title: string;
    description: string;
    imagePath: string;
    riskLevel: "Low" | "Moderate" | "High" | "Critical";
}

export function SimpleDisasterView({ title, description, imagePath, riskLevel }: SimpleDisasterViewProps) {
    const riskColors = {
        Low: "text-emerald-500 bg-emerald-50 border-emerald-100",
        Moderate: "text-amber-500 bg-amber-50 border-amber-100",
        High: "text-red-500 bg-red-50 border-red-100",
        Critical: "text-purple-500 bg-purple-50 border-purple-100",
    };

    return (
        <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Image Container */}
            <div className="relative group overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-900 aspect-[16/9] lg:aspect-auto lg:h-[700px]">
                <Image
                    src={imagePath}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
                    priority
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-920 via-transparent to-transparent opacity-60 pointer-events-none" />

                {/* Legend Overlay (Glassmorphism) */}
                <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-3xl text-white max-w-md shadow-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${riskColors[riskLevel]}`}>
                                {riskLevel} RISK
                            </div>
                            <span className="text-white/40 text-xs font-bold uppercase tracking-tighter">Satellite Analysis v1.0</span>
                        </div>
                        <h2 className="text-2xl font-black mb-2 tracking-tight">{title}</h2>
                        <p className="text-white/60 text-sm font-medium leading-relaxed">
                            {description}
                        </p>
                    </div>

                    <div className="hidden md:flex flex-col gap-3">
                        <button className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all shadow-xl">
                            <Maximize2 className="w-5 h-5" />
                        </button>
                        <button className="p-4 bg-blue-600 border border-blue-400 rounded-2xl text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40">
                            <MapIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Vulnerability Index", value: "84.2%", icon: ShieldAlert, color: "text-blue-500" },
                    { label: "Population at Risk", value: "12,450", icon: AlertTriangle, color: "text-amber-500" },
                    { label: "Flood Monitoring", value: "Active", icon: MapIcon, color: "text-emerald-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-3xl flex items-center gap-4 hover:border-blue-500/30 transition-all cursor-default group">
                        <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
