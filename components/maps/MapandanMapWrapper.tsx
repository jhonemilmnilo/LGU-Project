"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the real Leaflet component, turning off SSR
const MapandanMap = dynamic(() => import("./MapandanMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse text-slate-500">
            <Loader2 className="animate-spin mb-2" size={32} />
            <span className="font-bold text-sm tracking-widest uppercase">Loading Satellite Map...</span>
        </div>
    )
});

export default function MapandanMapWrapper() {
    return (
        <div className="w-full h-full rounded-[2rem] md:rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-200 dark:border-white/5 relative z-0">
            <MapandanMap />
        </div>
    );
}
