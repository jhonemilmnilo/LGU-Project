"use client";

import React from "react";
import MapandanMapWrapper from "@/components/maps/MapandanMapWrapper";
import { CloudLightning } from "lucide-react";

interface MapandanMapSectionProps {
    latestAlert?: any;
}

export function MapandanMapSection({ latestAlert }: MapandanMapSectionProps) {
    return (
        <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-bold text-sm uppercase tracking-widest mb-6 border border-red-200 dark:border-red-500/20 shadow-sm animate-pulse">
                        <CloudLightning size={16} />
                        Disaster Monitoring
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight italic">
                        Mapandan Territory
                    </h2>
                    
                    {latestAlert ? (
                        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 mb-8 text-left shadow-xl">
                            <h3 className="text-2xl font-black text-red-700 dark:text-red-400 uppercase">{latestAlert.name} - Signal No. {latestAlert.signalNumber}</h3>
                            <p className="text-slate-700 dark:text-slate-300 mt-2 font-medium">{latestAlert.description}</p>
                        </div>
                    ) : (
                        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium mb-8">
                            Real-time visualization of the municipality&apos;s boundaries. Currently, there are no active typhoon threats in the area.
                        </p>
                    )}
                </div>

                <div className="max-w-6xl mx-auto">
                    {/* The Interactive Map Component */}
                    <MapandanMapWrapper />
                </div>
            </div>
        </section>
    );
}
