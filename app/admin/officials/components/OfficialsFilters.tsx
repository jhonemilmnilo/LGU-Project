"use client";

import { useOfficials } from "../providers/OfficialsProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";

export function OfficialsFilters() {
    const { 
        searchTerm, setSearchTerm, setIsAddModalOpen, 
        selectedPosition, setSelectedPosition, 
        selectedCategory, setSelectedCategory,
        selectedBarangay, setSelectedBarangay,
        barangays, officialsData 
    } = useOfficials();

    // Get unique positions from current officials to populate the dropdown filter dynamically
    const positions = Array.from(new Set(officialsData.map(o => o.position))).filter(Boolean);

    return (
        <div className="p-6 border-b border-slate-200 dark:border-[#2a3040] bg-white dark:bg-[#151b2b]">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex flex-1 gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search names..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-11 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus-visible:ring-primary"
                        />
                    </div>

                    <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
                        <SelectTrigger className="w-[180px] h-11 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] font-bold italic">
                            <SelectValue placeholder="Select Area" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            <SelectItem value="LGU" className="font-bold italic text-primary">Municipal (LGU)</SelectItem>
                            {barangays.map(b => (
                                <SelectItem key={b} value={b} className="font-bold italic">Bgy. {b}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                        <SelectTrigger className="w-[180px] h-11 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]">
                            <SelectValue placeholder="Position" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            <SelectItem value="All">Positions</SelectItem>
                            {positions.map(pos => (
                                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px] h-11 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            <SelectItem value="All">All Categories</SelectItem>
                            <SelectItem value="LGU">Municipal (LGU)</SelectItem>
                            <SelectItem value="Barangay Council">Brgy Council</SelectItem>
                            <SelectItem value="SK Council">SK Members</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto h-11 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 px-6 rounded-xl transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Official
                </Button>
            </div>
        </div>
    );
}
