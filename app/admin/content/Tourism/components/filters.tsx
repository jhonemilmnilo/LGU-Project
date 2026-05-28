"use client";

import { useTourism } from "../providers/TourismProvider";
import { Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TourismFilters() {
    const { searchTerm, setSearchTerm, setIsAddModalOpen } = useTourism();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
         
        setMounted(true);
    }, []);


    if (!mounted) {
        return (
            <div className="p-4 flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2a3040] bg-slate-50/50 dark:bg-[#151b2b]">
                <div className="h-11 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="p-4 flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2a3040] bg-slate-50/50 dark:bg-[#151b2b]">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                <div className="relative w-full sm:w-[350px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Search gallery..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] focus-visible:ring-primary rounded-xl"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-11 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-6 rounded-xl w-full sm:w-auto font-bold uppercase tracking-wide"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add New Gallery Item
                </Button>
            </div>
        </div>
    );
}
