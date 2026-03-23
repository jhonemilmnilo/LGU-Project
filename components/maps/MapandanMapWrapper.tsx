"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the real Leaflet component, turning off SSR
const MapandanMap = dynamic(() => import("./MapandanMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse text-slate-500">
            <Loader2 className="animate-spin mb-2" size={32} />
            <span className="font-bold text-sm tracking-widest uppercase">Loading Satellite Map...</span>
        </div>
    )
});

export default function MapandanMapWrapper() {
    return (
        <div className="w-full h-[500px] rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-200 dark:border-white/5 relative z-0">
            {/* The dynamically loaded Map */}
            <MapandanMap />
            
            {/* Cool Overlays over the Map */}
            <div className="absolute top-4 left-4 z-50 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs font-black tracking-widest uppercase text-white shadow-sm">Mapandan Territory</span>
            </div>
            
            <div className="absolute bottom-4 right-4 z-50 pointer-events-none">
                <div className="bg-red-500/90 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg border border-red-400">
                    Live Satellite Imagery
                </div>
            </div>
        </div>
    );
}
