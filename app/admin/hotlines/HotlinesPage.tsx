"use client";

import { HotlinesProvider } from "./providers";
import {
    HotlinesCards,
    HotlinesFilters,
    HotlinesTable,
    AddHotlineModal
} from "./components";
import { Home, Phone } from "lucide-react";

interface HotlinesPageProps {
     
    initialData: any[];
}

export function HotlinesPage({ initialData }: HotlinesPageProps) {
    return (
        <HotlinesProvider initialData={initialData}>
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-2 bg-slate-100 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50">
                            <Home size={12} className="text-blue-500" />
                            <span className="opacity-50">/</span>
                            <span>Management</span>
                            <span className="opacity-50">/</span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">Hotline Directory</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center">
                            <Phone className="mr-3 text-blue-600 w-10 h-10" />
                            Emergency & Hotlines
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage and organize important contact numbers for public service and emergencies.</p>
                    </div>
                </div>

                <HotlinesCards />

                <div className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-2xl shadow-blue-500/5 overflow-hidden ring-1 ring-slate-200 dark:ring-white/5">
                    <HotlinesFilters />
                    <HotlinesTable />
                </div>

                <AddHotlineModal />
            </div>
        </HotlinesProvider>
    );
}
