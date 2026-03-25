"use client";

import { useProjects } from "../providers/ProjectsProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, MapPin } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function ProjectsFilters() {
    const { searchTerm, setSearchTerm, setIsAddModalOpen, selectedCategory, setSelectedCategory, selectedStatus, setSelectedStatus, currentBarangay, activeBarangays = [] } = useProjects();
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

    const categories = ["Infrastructure", "Health", "Education", "Social Services", "Economic", "Environment", "Other"];
    const statuses = ["Planned", "Ongoing", "Completed", "Suspended"];

    return (
        <div className="p-6 border-b border-slate-200 dark:border-[#2a3040] bg-white dark:bg-[#151b2b]">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col sm:flex-row flex-1 gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-11 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus-visible:ring-blue-500"
                        />
                    </div>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[160px] h-11 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]">
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
                        <SelectTrigger className="w-full sm:w-[150px] h-11 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            <SelectItem value="All">All Statuses</SelectItem>
                            {statuses.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Barangay Filter for Super Admins */}
                    {activeBarangays.length > 0 && (
                        <Select 
                            value={currentBarangay || "All"} 
                            onValueChange={handleBarangayChange}
                        >
                            <SelectTrigger className="w-full sm:w-[160px] h-11 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] font-bold italic text-[11px] uppercase tracking-wider">
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
                    className="w-full lg:w-auto h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 px-6 rounded-xl transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Button>
            </div>
        </div>
    );
}
