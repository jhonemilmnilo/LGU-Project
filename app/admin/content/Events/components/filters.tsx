"use client";

import { useEvents } from "../providers/EventsProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, SlidersHorizontal, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function EventsFilters() {
    const { searchTerm, setSearchTerm, setIsAddModalOpen, selectedCategory, setSelectedCategory, currentBarangay, activeBarangays = [] } = useEvents();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Re-use logic to update URL params
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

    const categories = ["All", "Festival", "Community", "Religious", "Sports", "Other"];

    return (
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#151b2b] border-b border-slate-200 dark:border-[#2a3040]">
            <div className="flex flex-1 items-center gap-3">
                <div className="relative w-full max-w-sm group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
                    <Input
                        placeholder="Search events, venues..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px] h-11 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]">
                        <SlidersHorizontal className="w-4 h-4 mr-2 text-slate-400" />
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Barangay Filter for Super Admins */}
                {activeBarangays.length > 0 && (
                    <Select 
                        value={currentBarangay || "All"} 
                        onValueChange={handleBarangayChange}
                    >
                        <SelectTrigger className="w-[180px] h-11 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] font-bold italic">
                            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                            <SelectValue placeholder="Barangay" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            <SelectItem value="All" className="font-bold italic text-blue-600">All Locations</SelectItem>
                            {activeBarangays.map(b => (
                                <SelectItem key={b} value={b} className="font-bold italic">{b}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <Button
                onClick={() => setIsAddModalOpen(true)}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                <Plus className="w-5 h-5 mr-2" />
                Add New Event
            </Button>
        </div>
    );
}
