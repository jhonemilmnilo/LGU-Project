"use client";

import { JobsProvider, Job } from "./providers/JobsProvider";
import {
    JobsCards,
    JobsFilters,
    JobsTable,
    AddJobModal
} from "./components";
import { Briefcase } from "lucide-react";

interface JobsPageProps {
    initialData: Job[];
    currentBarangay?: string | null;
    activeBarangays?: string[];
}

export function JobsPage({ initialData, currentBarangay, activeBarangays }: JobsPageProps) {
    return (
        <JobsProvider 
            initialData={initialData} 
            currentBarangay={currentBarangay}
            activeBarangays={activeBarangays}
        >
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center">
                            <Briefcase className="mr-3 w-10 h-10" style={{ color: 'var(--primary-theme)' }} />
                            Job Opportunities
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Publish and manage career openings within the municipal government.</p>
                    </div>
                </div>

                <JobsCards />

                <div 
                    style={{ boxShadow: '0 25px 50px -12px color-mix(in srgb, var(--primary-theme) 10%, transparent)' }}
                    className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] overflow-hidden ring-1 ring-slate-200 dark:ring-white/5"
                >
                    <JobsFilters />
                    <JobsTable />
                </div>


                <AddJobModal />
            </div>
        </JobsProvider>
    );
}
