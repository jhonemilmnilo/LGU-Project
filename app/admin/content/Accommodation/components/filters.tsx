"use client";

import { useAccommodation } from "../providers/AccommodationProvider";
import { Search, Plus, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AccommodationFilters() {
    const { searchTerm, setSearchTerm, setIsAddModalOpen } = useAccommodation();

    return (
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2a3040] bg-slate-50/50 dark:bg-[#151b2b]">
            <div className="relative w-full sm:w-[400px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                    placeholder="Search by name, address or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] focus-visible:ring-primary rounded-xl"
                />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" className="h-11 border-slate-200 dark:border-[#2a3040] text-slate-600 dark:text-slate-400 rounded-xl">
                    <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                </Button>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-11 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-6 rounded-xl flex-1 sm:flex-none"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add New Accommodation
                </Button>
            </div>
        </div>
    );
}
