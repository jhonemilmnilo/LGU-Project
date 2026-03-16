"use client";

import { useResident } from "../providers";
import { Search, Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

export function ResidentFilters() {
    const {
        searchQuery, setSearchQuery,
        setIsAddModalOpen,
        selectedBarangay, setSelectedBarangay,
        selectedGender, setSelectedGender
    } = useResident();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        if (!mounted) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMounted(true);
        }
    }, [mounted]);

    const barangays = ["All", "Aloleng", "Bangan-Oda", "Baruan", "Boboy", "Cayungnan", "Dangley", "Gayusan", "Macaboboni", "Magsaysay", "Namuac", "Poblacion East", "Poblacion West", "Patar", "Sablig", "San Juan", "Tupa"];
    const genders = ["All", "Male", "Female", "Other"];

    if (!mounted) {
        return <div className="p-4 h-[76px] bg-slate-50 dark:bg-[#151b2b] animate-pulse border-b border-slate-200 dark:border-[#2a3040]"></div>;
    }

    return (
        <div className="p-4 flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2a3040] bg-slate-50/50 dark:bg-[#151b2b]">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                <div className="relative w-full sm:w-[350px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Search resident name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] focus-visible:ring-blue-500 rounded-xl"
                    />
                </div>

                <div className="w-full sm:w-[200px] flex gap-2">
                    <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
                        <SelectTrigger className="h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] rounded-xl flex items-center flex-1">
                            <Filter className="w-4 h-4 mr-2 text-slate-400" />
                            <SelectValue placeholder="Barangay" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040] max-h-[300px]">
                            {barangays.map(bg => (
                                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedGender} onValueChange={setSelectedGender}>
                        <SelectTrigger className="h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] rounded-xl flex items-center flex-1">
                            <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            {genders.map(g => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
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
                    <Plus className="w-4 h-4 mr-2" /> Register Resident
                </Button>
            </div>
        </div>
    );
}
