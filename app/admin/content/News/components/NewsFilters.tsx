"use client";

import { useNews } from "../providers/NewsProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, MapPin } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, type CSSProperties } from "react";

export function NewsFilters() {
    const { searchTerm, setSearchTerm, setIsAddModalOpen, selectedCategory, setSelectedCategory, currentBarangay, activeBarangays = [], themeColor } = useNews();
    const [locationSearch, setLocationSearch] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const filteredBarangays = activeBarangays.filter((barangay) =>
        barangay.toLowerCase().includes(locationSearch.toLowerCase())
    );

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
                <div className="flex flex-wrap flex-1 gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 min-w-[260px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Find articles, press releases..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold italic focus-visible:ring-2"
                            style={{ "--tw-ring-color": `${themeColor}40` } as CSSProperties}
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[190px] h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-black uppercase tracking-widest text-[9px] focus:ring-2">
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
                            <SelectTrigger className="w-full sm:w-[190px] h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold italic focus:ring-2">
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
                                {filteredBarangays.map(b => (
                                    <SelectItem key={b} value={b} className="font-bold italic">{b}</SelectItem>
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
                    className="w-full sm:w-auto h-12 text-white font-black uppercase tracking-widest text-[10px] px-8 rounded-xl shadow-xl flex items-center gap-2"
                    style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}40` }}
                >
                    <Plus className="w-4 h-4" />
                    Publish Article
                </Button>
            </div>
        </div>
    );
}
