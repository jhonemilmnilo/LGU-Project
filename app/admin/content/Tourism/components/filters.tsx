"use client";

import { useTourism } from "../providers/TourismProvider";
import { Search, Plus, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TourismFilters() {
    const { searchTerm, setSearchTerm, setIsAddModalOpen, selectedCategory, setSelectedCategory } = useTourism();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
         
        setMounted(true);
    }, []);

    const categories = ["All", "Beach", "Falls", "Island", "Historical", "Park", "Other"];

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
                        placeholder="Search landmark or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] focus-visible:ring-blue-500 rounded-xl"
                    />
                </div>

                <div className="w-full sm:w-[200px]">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] rounded-xl flex items-center">
                            <Filter className="w-4 h-4 mr-2 text-slate-400" />
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-6 rounded-xl w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add New Tourism Spot
                </Button>
            </div>
        </div>
    );
}
