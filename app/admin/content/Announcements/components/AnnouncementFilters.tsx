"use client";

import { useAnnouncements } from "../providers/AnnouncementProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";

export function AnnouncementFilters() {
    const { 
        searchTerm, 
        setSearchTerm, 
        setIsAddModalOpen, 
        selectedCategory, 
        setSelectedCategory,
        selectedPriority,
        setSelectedPriority
    } = useAnnouncements();

    return (
        <div className="p-6 border-b border-slate-200 dark:border-[#2a3040] bg-white dark:bg-[#151b2b]">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex flex-wrap flex-1 gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Find notices, alerts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus-visible:ring-blue-600 rounded-xl font-bold italic"
                        />
                    </div>
                    
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[160px] h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-black uppercase tracking-widest text-[9px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            <SelectItem value="All">All Types</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="Weather">Weather</SelectItem>
                            <SelectItem value="Public Service">Public Service</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                            <SelectItem value="Health">Health</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                        <SelectTrigger className="w-[160px] h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-black uppercase tracking-widest text-[9px]">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            <SelectItem value="All">All Priorities</SelectItem>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto h-12 bg-blue-600 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] px-8 rounded-xl transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Notice
                </Button>
            </div>
        </div>
    );
}
