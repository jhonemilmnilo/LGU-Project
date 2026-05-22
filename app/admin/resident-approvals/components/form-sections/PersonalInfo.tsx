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
        setFormCategoryName
    } = useResident();

    const [genderVal, setGenderVal] = useState(data?.gender || "Male");
    const [civilStatusVal, setCivilStatusVal] = useState(data?.civilStatus || "Single");
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
                    <label className="text-sm font-semibold">Last Name <span className="text-red-500">*</span></label>
                    <Input name="lastName" defaultValue={data?.lastName || ""} placeholder="e.g. DELA CRUZ" required className="uppercase" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">First Name <span className="text-red-500">*</span></label>
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
                    
                    {genderVal === "Other" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-1">
                            <Input 
                                name="otherGender" 
                                placeholder="Please specify gender" 
                                defaultValue={data?.otherGender || ""}
                                required 
                                className="h-10 border-blue-200 focus:border-blue-500 bg-blue-50/30"
                            />
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Date of Birth <span className="text-red-500">*</span></label>
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
                    <Input name="age" type="number" value={age} readOnly className="bg-slate-50 cursor-not-allowed font-bold text-blue-600" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-1.5">
                        Civil Status <span className="text-red-500">*</span>
                    </label>
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
                    
                    {civilStatusVal === "Other" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-1">
                            <Input 
                                name="otherCivilStatus" 
                                placeholder="Please specify status" 
                                defaultValue={data?.otherCivilStatus || ""}
                                required 
                                className="h-10 border-blue-200 focus:border-blue-500 bg-blue-50/30"
                            />
                        </div>
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
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Resident Categories <span className="text-red-500">*</span></label>
                    <span className="text-[10px] font-bold text-blue-500 uppercase">Select a category</span>
                </div>
                <div className="flex flex-wrap gap-2 p-1 transition-all duration-300 rounded-2xl">
                    {categories.map(cat => {
                        const isSelected = selectedId === cat.id;
                        return (
                            <div 
                                key={cat.id} 
                                onClick={(e) => {
                                    e.preventDefault();
                                    selectCategory(cat.id, cat.name);
                                }}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer select-none group ${
                                    isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 dark:bg-[#1a1f2e] dark:border-[#2a3040] dark:text-slate-400 opacity-80 hover:opacity-100'
                                }`}
                            >
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isSelected ? 'bg-white border-white' : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'
                                }`}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600 animate-in zoom-in-50 duration-200" />}
                                </div>
                                <span className="text-xs font-black uppercase tracking-tight">
                                    {cat.name}
                                </span>
                            </div>
                        );
                    })}
                    {categories.length === 0 && (
                        <div className="flex items-center gap-2 text-slate-400 italic text-xs py-2">
                             Initializing system categories...
                        </div>
                    )}
                    <input type="hidden" name="categories" value={selectedId || ""} />
                </div>
            </div>
        </div>
    );
}
