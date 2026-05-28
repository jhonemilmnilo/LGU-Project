"use client";

import { EventsProvider } from "./providers/EventsProvider";
import {
    EventsCards,
    EventsFilters,
    EventsTable,
    AddEventModal
} from "./components";



interface EventsPageProps {
    initialData: any[];
    currentBarangay?: string;
    activeBarangays?: string[];
}

export function EventsPage({ initialData, currentBarangay, activeBarangays }: EventsPageProps) {
    return (
        <EventsProvider 
            initialData={initialData} 
            currentBarangay={currentBarangay}
            activeBarangays={activeBarangays}
        >
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Events Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Coordinate and showcase local festivals, community gatherings, and more.</p>
                    </div>
                </div>

                <EventsCards />

                <div 
                    style={{ boxShadow: '0 25px 50px -12px color-mix(in srgb, var(--primary-theme) 10%, transparent)' }}
                    className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] overflow-hidden ring-1 ring-slate-200 dark:ring-white/5"
                >
                    <EventsFilters />
                    <EventsTable />
                </div>

                <AddEventModal />
            </div>
        </EventsProvider>
    );
}
