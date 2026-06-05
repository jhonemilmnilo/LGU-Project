"use client";

import { OfficialsProvider, Official } from "./providers/OfficialsProvider";
import {
    OfficialsCards,
    OfficialsFilters,
    OfficialsTable,
    AddOfficialModal
} from "./components";
import { Users } from "lucide-react";

interface OfficialsPageProps {
    initialData: Official[];
    barangays: string[];
    managedBarangay?: string | null;
}

export function OfficialsPage({ initialData, barangays, managedBarangay }: OfficialsPageProps) {
    return (
        <OfficialsProvider 
            initialData={initialData} 
            barangays={barangays} 
            managedBarangay={managedBarangay}
        >
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center">
                            <Users className="mr-3 w-10 h-10" style={{ color: 'var(--primary-theme)' }} />
                            Council Officials
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage the profiles, roles, and hierarchy of the municipal government leaders.</p>
                    </div>
                </div>

                <OfficialsCards />

                <div className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-2xl shadow-primary/5 overflow-hidden ring-1 ring-slate-200 dark:ring-white/5">
                    <OfficialsFilters />
                    <OfficialsTable />
                </div>

                <AddOfficialModal />
            </div>
        </OfficialsProvider>
    );
}
