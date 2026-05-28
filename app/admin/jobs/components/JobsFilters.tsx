"use client";

import { useJobs } from "../providers/JobsProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, MapPin } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function JobsFilters() {
    const { searchTerm, setSearchTerm, setIsAddModalOpen, selectedDepartment, setSelectedDepartment, jobsData, currentBarangay, activeBarangays = [] } = useJobs();
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

    // Get unique departments from current jobs to populate the dropdown filter dynamically
    const departments = Array.from(new Set(jobsData.map(job => job.department))).filter(Boolean);

    return (
        <div className="p-6 border-b border-slate-200 dark:border-[#2a3040] bg-white dark:bg-[#151b2b]">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex flex-1 gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search job titles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-11 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus-visible:ring-primary"
                        />
                    </div>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger className="w-[180px] h-11 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]">
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            <SelectItem value="All">All Departments</SelectItem>
                            {departments.map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
                                <MapPin className="w-4 h-4 mr-2 text-primary" />
                                <SelectValue placeholder="Barangay" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                                <SelectItem value="All" className="font-bold italic text-primary">All Locations</SelectItem>
                                {activeBarangays.map(b => (
                                    <SelectItem key={b} value={b} className="font-bold italic">{b}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto h-11 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 px-6 rounded-xl transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                </Button>
            </div>
        </div>
    );
}
