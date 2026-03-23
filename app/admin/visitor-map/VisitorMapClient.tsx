"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Navigation, Plus, Map as MapIcon, RotateCcw } from "lucide-react";

// Dynamically input Map Component to avoid SSR issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AdminMapComponent = dynamic<any>(() => import("@/app/admin/visitor-map/AdminMapComponent"), { ssr: false });

export default function VisitorMapClient() {
    // We start with a completely empty array of routes to keep the map clean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [routes, setRoutes] = useState<any[]>([]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center">
                        <Navigation className="mr-3 text-blue-600 w-10 h-10" />
                        Visitor Map
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
                        Exclusively display the Mapandan Municipality territory and boundary.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-xl p-6">
                        <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-black uppercase tracking-tight mb-4">
                            <MapIcon className="text-blue-500" size={20} />
                            <h2>Active Routes</h2>
                        </div>
                        <div className="space-y-3">
                            {routes.map(r => (
                                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-white/5">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                                        <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{r.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-6 italic">Note: The map outside Mapandan is masked to keep visitors focused entirely on the municipality.</p>
                    </div>
                </div>

                {/* Map Interface */}
                <div className="lg:col-span-3 bg-slate-100 dark:bg-[#0c101a] rounded-3xl border-2 border-slate-200 dark:border-[#2a3040] shadow-2xl overflow-hidden h-[600px] relative z-0 ring-1 ring-white/10">
                    <AdminMapComponent routes={routes} />
                </div>
            </div>
        </div>
    );
}
