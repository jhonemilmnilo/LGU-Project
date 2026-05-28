"use client";

import { AccommodationProvider } from "./providers";
import {
    AccommodationCards,
    AccommodationFilters,
    AccommodationTable,
    AddAccommodationModal
} from "./components";


import { Accommodation } from "./providers/AccommodationProvider";

interface AccommodationPageProps {
    initialData: Accommodation[];
    currentBarangay?: string | null;
}

export function AccommodationPage({ initialData, currentBarangay }: AccommodationPageProps) {
    return (
        <AccommodationProvider initialData={initialData} currentBarangay={currentBarangay}>
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Tuluyan Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage resorts, hotels, and homestays in Mapandan.</p>
                    </div>
                </div>

                <AccommodationCards />

                <div 
                    style={{ boxShadow: '0 25px 50px -12px color-mix(in srgb, var(--primary-theme) 10%, transparent)' }}
                    className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] overflow-hidden ring-1 ring-slate-200 dark:ring-white/5"
                >
                    <AccommodationFilters />
                    <AccommodationTable />
                </div>

                <AddAccommodationModal />
            </div>
        </AccommodationProvider>
    );
}
