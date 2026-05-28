"use client";

import {
    ResidentCards,
    ResidentFilters,
    ResidentTable,
    AddResidentModal
} from "./components";

import { useResident } from "./providers/ResidentProvider";

export function ResidentsPage() {
    const { themeColor } = useResident();

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
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
