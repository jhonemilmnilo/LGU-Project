"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GENDERS, CIVIL_STATUSES } from "../../constants";
import { useState, useEffect } from "react";
import { getResidentCategories } from "../../../actions";
import { useResident, Resident } from "../../providers/ResidentProvider";

interface ResidentCategory {
    id: string;
    name: string;
}

export function PersonalInfoSection({ data }: { data?: Partial<Resident> }) {
    const { 
        formCategoryId: selectedId, 
        setFormCategoryId: setSelectedId,
        setFormCategoryName,
        themeColor
    } = useResident();

    const [genderVal, setGenderVal] = useState(() => {
        if (!data?.gender) return "Male";
        return GENDERS.includes(data.gender) ? data.gender : "Other";
    });
    const [civilStatusVal, setCivilStatusVal] = useState(() => {
        if (!data?.civilStatus) return "Single";
        return CIVIL_STATUSES.includes(data.civilStatus) ? data.civilStatus : "Other";
    });

    const [dob, setDob] = useState(data?.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : "");

    const calculateAge = (birthDateStr: string) => {
        if (!birthDateStr) return "";
        const birth = new Date(birthDateStr);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age.toString();
    };

    const age = calculateAge(dob);
    const [categories, setCategories] = useState<ResidentCategory[]>([]);

    useEffect(() => {
        getResidentCategories().then((res: { success: boolean; categories?: ResidentCategory[]; error?: string }) => {
            if (res.success && res.categories) {
                setCategories(res.categories);
            }
        });
    }, []);

    const selectCategory = (id: string, name: string) => {
        if (selectedId === id) {
            setSelectedId(null);
            setFormCategoryName(null);
        } else {
            setSelectedId(id);
            setFormCategoryName(name);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Last Name *</label>
                    <Input name="lastName" defaultValue={data?.lastName || ""} placeholder="e.g. DELA CRUZ" required className="uppercase" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">First Name *</label>
                    <Input name="firstName" defaultValue={data?.firstName || ""} placeholder="e.g. JUAN" required className="uppercase" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Middle Name</label>
                    <Input name="middleName" defaultValue={data?.middleName || ""} placeholder="e.g. RAMOS" className="uppercase" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Suffix</label>
                    <Input name="suffix" defaultValue={data?.suffix || ""} placeholder="e.g. JR, III" className="uppercase" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-1.5">
                        Gender <span className="text-red-500">*</span>
                    </label>
                    {genderVal === "Other" ? (
                        <div className="relative flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                            <Input 
                                name="gender" 
                                placeholder="Specify gender" 
                                defaultValue={(data?.gender === "Other" ? "" : data?.gender) || ""}
                                required 
                                style={{ borderColor: themeColor, backgroundColor: `${themeColor}0d` }}
                                className="h-10 uppercase font-bold focus-visible:ring-1"
                                autoFocus
                            />
                            <button 
                                type="button" 
                                onClick={() => setGenderVal(GENDERS[0])}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                                style={{ color: themeColor }}
                                title="Back to list"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="m3 12 9-9"/><path d="m3 12 9 9"/></svg>
                            </button>
                        </div>
                    ) : (
                        <Select 
                            name="gender" 
                            onValueChange={(val) => setGenderVal(val)}
                            defaultValue={data?.gender || "Male"}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Date of Birth *</label>
                    <Input 
                        name="dateOfBirth" 
                        type="date" 
                        value={dob} 
                        onChange={(e) => setDob(e.target.value)} 
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Age</label>
                    <Input name="age" type="number" value={age} readOnly style={{ color: themeColor }} className="bg-slate-50 cursor-not-allowed font-bold" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-1.5">
                        Civil Status <span className="text-red-500">*</span>
                    </label>
                    {civilStatusVal === "Other" ? (
                        <div className="relative flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                            <Input 
                                name="civilStatus" 
                                placeholder="Specify status" 
                                defaultValue={(data?.civilStatus === "Other" ? "" : data?.civilStatus) || ""}
                                required 
                                style={{ borderColor: themeColor, backgroundColor: `${themeColor}0d` }}
                                className="h-10 uppercase font-bold focus-visible:ring-1"
                                autoFocus
                            />
                            <button 
                                type="button" 
                                onClick={() => setCivilStatusVal(CIVIL_STATUSES[0])}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                                style={{ color: themeColor }}
                                title="Back to list"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="m3 12 9-9"/><path d="m3 12 9 9"/></svg>
                            </button>
                        </div>
                    ) : (
                        <Select 
                            name="civilStatus" 
                            onValueChange={(val) => setCivilStatusVal(val)}
                            defaultValue={data?.civilStatus || "Single"}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {CIVIL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Place of Birth</label>
                    <Input name="placeOfBirth" defaultValue={data?.placeOfBirth || ""} placeholder="City/Municipality, Province" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Citizenship</label>
                    <Input name="citizenship" defaultValue={data?.citizenship || "Filipino"} placeholder="e.g. Filipino" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Religion</label>
                    <Input name="religion" defaultValue={data?.religion || ""} placeholder="e.g. Catholic" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Blood Type</label>
                    <Input name="bloodType" defaultValue={data?.bloodType || ""} placeholder="e.g. O+" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Height (cm)</label>
                    <Input name="height" type="number" defaultValue={data?.height || ""} placeholder="e.g. 170" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Weight (kg)</label>
                    <Input name="weight" type="number" defaultValue={data?.weight || ""} placeholder="e.g. 65" />
                </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Resident Categories</label>
                    <span style={{ color: themeColor }} className="text-[10px] font-bold uppercase">Select a category</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => {
                        const isSelected = selectedId === cat.id;
                        return (
                            <div 
                                key={cat.id} 
                                onClick={(e) => {
                                    e.preventDefault();
                                    selectCategory(cat.id, cat.name);
                                }}
                                style={isSelected ? { backgroundColor: themeColor, borderColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}33` } : undefined}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer select-none group ${
                                    isSelected
                                    ? 'text-white scale-105'
                                    : 'bg-white border-slate-200 text-slate-600 dark:bg-[#1a1f2e] dark:border-[#2a3040] dark:text-slate-400 opacity-80 hover:opacity-100'
                                }`}
                            >
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isSelected ? 'bg-white border-white' : 'border-slate-300 dark:border-slate-600'
                                }`}>
                                    {isSelected && <div style={{ backgroundColor: themeColor }} className="w-2 h-2 rounded-full animate-in zoom-in-50 duration-200" />}
                                </div>
                                <span className="text-xs font-black uppercase tracking-tight">
                                    {cat.name}
                                </span>
                                {/* Hidden input for FormData to capture values */}
                                {isSelected && (
                                    <input type="hidden" name="categories" value={cat.id} />
                                )}
                            </div>
                        );
                    })}
                    {categories.length === 0 && (
                        <div className="flex items-center gap-2 text-slate-400 italic text-xs py-2">
                             Initializing system categories...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
