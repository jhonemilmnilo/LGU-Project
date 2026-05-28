"use client";

import { Search } from "lucide-react";
import { useDining } from "../providers/DiningProvider";
import { Input } from "@/components/ui/input";

export function DiningFilters() {
    const { searchTerm, setSearchTerm } = useDining();

    return (
        <div className="p-4 border-b border-slate-200 dark:border-[#2a3040] flex items-center justify-between bg-white dark:bg-[#1e2330]">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <Input
                    placeholder="Search restaurants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] text-slate-900 dark:text-white placeholder:text-slate-500 w-full focus:border-primary transition-colors"
                />
            </div>
        </div>
    );
}
