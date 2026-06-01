"use client";

import { useAccommodation } from "../providers/AccommodationProvider";
import { Search, Plus, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function AccommodationFilters() {
    const {
        searchTerm,
        setSearchTerm,
        setIsAddModalOpen,
        accommodationData,
        selectedType,
        setSelectedType,
        selectedStatus,
        setSelectedStatus,
        currentBarangay,
        activeBarangays = [],
        themeColor
    } = useAccommodation();
    const [locationSearch, setLocationSearch] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const typeOptions = useMemo(() => {
        const types = accommodationData
            .map(item => item.type?.trim())
            .filter((value): value is string => Boolean(value));
        return Array.from(new Set(types)).sort((a, b) => a.localeCompare(b));
    }, [accommodationData]);

    const filteredBarangays = activeBarangays.filter((barangay) =>
        barangay.toLowerCase().includes(locationSearch.toLowerCase())
    );

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value === "All") {
                params.delete(name);
            } else {
                params.set(name, value);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleBarangayChange = (value: string) => {
        router.push(pathname + "?" + createQueryString("barangay", value));
    };

    return (
        <div className="p-4 border-b border-slate-200 dark:border-[#2a3040] bg-slate-50/50 dark:bg-[#151b2b]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap flex-1 items-center gap-3">
                    <div className="relative flex-1 min-w-[260px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="Search by name, address or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] rounded-xl"
                        />
                    </div>

                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-full sm:w-[170px] h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] rounded-xl">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            <SelectItem value="All">All Types</SelectItem>
                            {typeOptions.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full sm:w-[150px] h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] rounded-xl">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="Published">Published</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>

                    {activeBarangays.length > 0 && (
                        <Select value={currentBarangay || "All"} onValueChange={handleBarangayChange}>
                            <SelectTrigger className="w-full sm:w-[170px] h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold italic text-[11px] uppercase tracking-wider">
                                <MapPin className="w-4 h-4 mr-2" style={{ color: themeColor }} />
                                <SelectValue placeholder="Barangay" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                                <div className="p-2 border-b border-slate-100 dark:border-white/10">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <Input
                                            value={locationSearch}
                                            onChange={(e) => setLocationSearch(e.target.value)}
                                            onPointerDown={(e) => e.stopPropagation()}
                                            onKeyDown={(e) => e.stopPropagation()}
                                            placeholder="Search locations..."
                                            className="h-9 pl-9 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-lg text-[11px] font-bold italic"
                                        />
                                    </div>
                                </div>
                                <SelectItem value="All" className="font-bold italic" style={{ color: themeColor }}>All Locations</SelectItem>
                                {filteredBarangays.map(barangay => (
                                    <SelectItem key={barangay} value={barangay} className="font-bold italic">{barangay}</SelectItem>
                                ))}
                                {filteredBarangays.length === 0 && (
                                    <div className="px-3 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 italic text-center">
                                        No locations found
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full lg:w-auto h-11 text-white shadow-lg px-6 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}40` }}
                >
                    <Plus className="w-4 h-4 mr-2" /> Add New Accommodation
                </Button>
            </div>
        </div>
    );
}
