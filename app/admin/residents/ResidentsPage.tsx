"use client";

import {
    ResidentCards,
    ResidentFilters,
    ResidentTable,
    AddResidentModal
} from "./components";
import { Home } from "lucide-react";
import { useResident } from "./providers/ResidentProvider";

export function ResidentsPage() {
    const { themeColor } = useResident();

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-2 bg-slate-100 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50">
                        <Home size={12} style={{ color: themeColor }} />
                        <span className="opacity-50">/</span>
                        <span>Registry</span>
                        <span className="opacity-50">/</span>
                        <span className="font-bold" style={{ color: themeColor }}>Residents</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Resident Registry</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">A centralized database for managing citizen records, demographic data, and emergency information.</p>
                </div>
            </div>

            <ResidentCards />

            <div 
                style={{ boxShadow: `0 25px 50px -12px ${themeColor}1a` }}
                className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] overflow-hidden ring-1 ring-slate-200 dark:ring-white/5"
            >
                <ResidentFilters />
                <ResidentTable />
            </div>

            <AddResidentModal />
        </div>
    );
}
