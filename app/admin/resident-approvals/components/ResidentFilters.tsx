"use client";

import { useResident, ResidentCategory } from "../providers/ResidentProvider";
import { Search, Plus, Filter, Clock, CheckCircle, XCircle, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { getResidentCategories } from "../../actions";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
    { value: "All", label: "All", icon: Users, color: "text-slate-600", activeColor: "bg-slate-900 text-white dark:bg-white dark:text-slate-900" },
    { value: "PENDING", label: "Pending", icon: Clock, color: "text-amber-600", activeColor: "bg-amber-500 text-white" },
    { value: "APPROVED", label: "Approved", icon: CheckCircle, color: "text-emerald-600", activeColor: "bg-emerald-500 text-white" },
    { value: "REJECTED", label: "Rejected", icon: XCircle, color: "text-red-500", activeColor: "bg-red-500 text-white" },
];

export function ResidentFilters() {
    const {
        searchQuery, setSearchQuery,
        selectedBarangay, setSelectedBarangay,
        selectedGender, setSelectedGender,
        selectedCategory, setSelectedCategory,
        selectedStatus, setSelectedStatus,
        residents,
    } = useResident();

    const [mounted, setMounted] = useState(false);
    const [categories, setCategories] = useState<ResidentCategory[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
            getResidentCategories().then(res => {
                if (res.success && res.categories) {
                    setCategories(res.categories);
                }
            });
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const barangays = ["All", "Aloleng", "Bangan-Oda", "Baruan", "Boboy", "Cayungnan", "Dangley", "Gayusan", "Macaboboni", "Magsaysay", "Namuac", "Poblacion East", "Poblacion West", "Patar", "Sablig", "San Juan", "Tupa"];
    const genders = ["All", "Male", "Female", "Other"];

    const getCount = (status: string) => {
        if (status === "All") return residents.length;
        return residents.filter(r => r.registrationStatus === status).length;
    };

    if (!mounted) {
        return <div className="p-4 h-[76px] bg-slate-50 dark:bg-[#151b2b] animate-pulse border-b border-slate-200 dark:border-[#2a3040]"></div>;
    }

    return (
        <div className="flex flex-col border-b border-slate-200 dark:border-[#2a3040] bg-slate-50/50 dark:bg-[#151b2b]">
            {/* Status Tabs */}
            <div className="px-4 pt-4 flex items-center gap-2 flex-wrap">
                {STATUS_TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = selectedStatus === tab.value;
                    const count = getCount(tab.value);
                    return (
                        <button
                            key={tab.value}
                            onClick={() => setSelectedStatus(tab.value)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200",
                                isActive
                                    ? tab.activeColor
                                    : `bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-[#2a3040] ${tab.color} hover:border-slate-300 dark:hover:border-slate-600`
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                            <span className={cn(
                                "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                                isActive ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            )}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Filters Row */}
            <div className="p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
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

                    <div className="w-full sm:w-auto flex flex-wrap gap-2">
                        <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
                            <SelectTrigger className="h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] rounded-xl flex items-center min-w-[130px]">
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
                            <SelectTrigger className="h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] rounded-xl flex items-center min-w-[100px]">
                                <SelectValue placeholder="Gender" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                                {genders.map(g => (
                                    <SelectItem key={g} value={g}>{g}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] rounded-xl flex items-center min-w-[140px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                                <SelectItem value="All">All Categories</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}
