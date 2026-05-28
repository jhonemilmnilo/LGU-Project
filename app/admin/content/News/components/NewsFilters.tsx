"use client";

import { useNews } from "../providers/NewsProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, MapPin } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function NewsFilters() {
    const { searchTerm, setSearchTerm, setIsAddModalOpen, selectedCategory, setSelectedCategory, currentBarangay, activeBarangays = [] } = useNews();
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

    return (
        <div className="p-6 border-b border-slate-200 dark:border-[#2a3040] bg-white dark:bg-[#151b2b]">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex flex-1 gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Find articles, press releases..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus-visible:ring-primary rounded-xl font-bold italic"
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px] h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-black uppercase tracking-widest text-[9px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                            <SelectItem value="All">All Categories</SelectItem>
                            <SelectItem value="Announcement">Announcements</SelectItem>
                            <SelectItem value="Local News">Local News</SelectItem>
                            <SelectItem value="Advisory">Advisory</SelectItem>
                            <SelectItem value="Project Update">Project Update</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Barangay Filter for Super Admins */}
                    {activeBarangays.length > 0 && (
                        <Select 
                            value={currentBarangay || "All"} 
                            onValueChange={handleBarangayChange}
                        >
                            <SelectTrigger className="w-[180px] h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold italic">
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
                    className="w-full sm:w-auto h-12 bg-primary hover:bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] px-8 rounded-xl transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Publish Article
                </Button>
            </div>
        </div>
    );
}
