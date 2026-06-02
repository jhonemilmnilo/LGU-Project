"use client";

import { TourismProvider, Tourism } from "./providers/TourismProvider";
import {
    TourismCards,
    TourismFilters,
    TourismTable,
    AddTourismModal
} from "./components";



interface TourismPageProps {
    initialData: Tourism[];
    currentBarangay?: string | null;
    activeBarangays: string[];
}

export function TourismPage({ initialData, currentBarangay, activeBarangays }: TourismPageProps) {
    return (
        <TourismProvider initialData={initialData} currentBarangay={currentBarangay} activeBarangays={activeBarangays}>
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Gallery Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Curate the most amazing landmarks and hidden gems of Mapandan.</p>
                    </div>
                </div>

                <TourismCards />

                <div 
                    style={{ boxShadow: '0 25px 50px -12px color-mix(in srgb, var(--primary-theme) 10%, transparent)' }}
                    className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] overflow-hidden ring-1 ring-slate-200 dark:ring-white/5"
                >
                    <TourismFilters />
                    <TourismTable />
                </div>

                <AddTourismModal />
            </div>
        </TourismProvider>
    );
}
