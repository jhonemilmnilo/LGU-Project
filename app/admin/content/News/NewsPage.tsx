"use client";

import { NewsProvider, News } from "./providers/NewsProvider";
import {
    NewsCards,
    NewsFilters,
    NewsTable,
    AddNewsModal
} from "./components";
import { Newspaper } from "lucide-react";


interface NewsPageProps {
    initialData: News[];
    currentBarangay?: string;
    activeBarangays?: string[];
}

export function NewsPage({ initialData, currentBarangay, activeBarangays }: NewsPageProps) {
    return (
        <NewsProvider 
            initialData={initialData} 
            currentBarangay={currentBarangay}
            activeBarangays={activeBarangays}
        >
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center">
                            <Newspaper className="mr-3 w-10 h-10" style={{ color: 'var(--primary-theme)' }} />
                            News Management
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Publish transparent municipal updates, advisories, and public interest stories.</p>
                    </div>
                </div>

                <NewsCards />

                <div 
                    style={{ boxShadow: '0 25px 50px -12px color-mix(in srgb, var(--primary-theme) 10%, transparent)' }}
                    className="bg-white dark:bg-[#151b2b] rounded-[2.5rem] border border-slate-200 dark:border-[#2a3040] overflow-hidden ring-1 ring-slate-200 dark:ring-white/5"
                >
                    <NewsFilters />
                    <NewsTable />
                </div>


                <AddNewsModal />
            </div>
        </NewsProvider>
    );
}
