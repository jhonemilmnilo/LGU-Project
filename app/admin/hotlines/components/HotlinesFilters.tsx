"use client";

import { useHotlines } from "../providers/HotlinesProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import type { CSSProperties } from "react";

export function HotlinesFilters() {
    const { searchTerm, setSearchTerm, setIsAddModalOpen, selectedCategory, setSelectedCategory, selectedStatus, setSelectedStatus, hotlinesData, themeColor } = useHotlines();

    // Get unique categories from current hotlines to populate the dropdown
    const categories = Array.from(new Set(hotlinesData.map(h => h.category))).filter(Boolean);

    return (
        <div className="p-4 border-b border-slate-200 dark:border-[#2a3040] bg-slate-50/50 dark:bg-[#151b2b]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap flex-1 items-center gap-3">
                    <div className="relative flex-1 min-w-[260px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search agencies or departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] rounded-xl focus-visible:ring-2"
                            style={{ "--tw-ring-color": `${themeColor}40` } as CSSProperties}
                        />
                    </div>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[170px] h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] rounded-xl">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            <SelectItem value="All">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full sm:w-[150px] h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] rounded-xl">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Hidden">Hidden</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full lg:w-auto h-11 text-white shadow-lg px-6 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}40` }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hotline
                </Button>
            </div>
        </div>
    );
}