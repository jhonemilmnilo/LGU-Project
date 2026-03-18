"use client";

import dynamic from "next/dynamic";
import { Activity } from "lucide-react";

const Map = dynamic(() => import("./ReportMap"), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex flex-col items-center justify-center gap-4 animate-pulse">
            <Activity className="w-8 h-8 text-primary/40 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Positioning Map...</p>
        </div>
    )
});

export default function ReportMapWrapper({ lat, lng, address }: { lat: number; lng: number; address?: string }) {
    return <Map lat={lat} lng={lng} address={address} />;
}
