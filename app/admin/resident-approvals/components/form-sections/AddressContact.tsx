"use client";

import { Users, X as XIcon } from "lucide-react";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { BARANGAYS } from "../../constants";
import { HeadSearch } from "../HeadSearch";
import { ResidentSearch } from "../ResidentSearch";
import { toast } from "sonner";
import { useResident, Resident } from "../../providers/ResidentProvider";

export function AddressContactSection({ data }: { data?: Partial<Resident> }) {
    const { 
        currentFamilyMembers: familyMembers, 
        setCurrentFamilyMembers: setFamilyMembers 
    } = useResident();

    const [isHead, setIsHead] = useState(data?.isHead || false);
    const [headInfo, setHeadInfo] = useState({ 
        id: data?.headId || "", 
        name: data?.headName || "" 
    });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">House Number</label>
                    <Input name="houseNumber" defaultValue={data?.houseNumber || ""} placeholder="e.g. 123" className="uppercase" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Street</label>
                    <Input name="street" defaultValue={data?.street || ""} placeholder="e.g. RIZAL ST." className="uppercase" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Sitio</label>
                    <Input name="sitio" defaultValue={data?.sitio || ""} placeholder="e.g. MALIGAYA" className="uppercase" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Purok</label>
                    <Input name="purok" defaultValue={data?.purok || ""} placeholder="e.g. 1" className="uppercase" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Barangay *</label>
                    <Select name="barangay" defaultValue={data?.barangay}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Barangay" />
                        </SelectTrigger>
                        <SelectContent>
                            {BARANGAYS.map(b => (
                                <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Municipality</label>
                    <Input name="municipality" defaultValue={data?.municipality || "MAPANDAN"} readOnly className="bg-slate-50 cursor-not-allowed font-bold" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Province</label>
                    <Input name="province" defaultValue={data?.province || "PANGASINAN"} readOnly className="bg-slate-50 cursor-not-allowed font-bold" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Mobile Number</label>
                    <Input name="contactNumber" defaultValue={data?.contactNumber || ""} placeholder="09XX XXX XXXX" />
                </div>
            </div>

            {/* Household Selection */}
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl space-y-4 border border-blue-100 dark:border-blue-800">
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="isHead" 
                        name="isHead" 
                        checked={isHead}
                        onCheckedChange={(checked) => setIsHead(!!checked)}
                    />
                    <label htmlFor="isHead" className="text-sm font-bold text-blue-900 dark:text-blue-100 italic uppercase">
                        Check if this person is the HEAD OF THE HOUSEHOLD
                    </label>
                </div>

                {!isHead ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600">Relationship to Head</label>
                            <Input name="relationshipToHead" defaultValue={data?.relationshipToHead || ""} placeholder="e.g. SPOUSE, SON, DAUGHTER" className="uppercase" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600">Search Household Head</label>
                            <HeadSearch 
                                onSelect={(id, name) => setHeadInfo({ id, name })} 
                                defaultValue={headInfo.name} 
                            />
                            <input type="hidden" name="headId" value={headInfo.id} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                Link Existing Family Members
                            </label>
                            <ResidentSearch 
                                onSelect={(resident) => {
                                    if (familyMembers.find(m => m.id === resident.id)) {
                                        toast.error("Resident already added to family list");
                                        return;
                                    }
                                    setFamilyMembers([...familyMembers, {
                                        id: resident.id,
                                        fullName: `${resident.firstName} ${resident.lastName}`,
                                        relationship: "",
                                        age: resident.age?.toString() || ""
                                    }]);
                                    toast.success(`${resident.firstName} added to family list`);
                                }}
                                placeholder="Search for a resident to add as family member..."
                                excludeIds={data?.id ? [data.id] : []}
                            />
                        </div>

                        {familyMembers.length > 0 && (
                            <div className="bg-white dark:bg-black/20 rounded-xl border border-blue-100 dark:border-blue-900/30 overflow-hidden">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-900 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                                        <tr>
                                            <th className="px-4 py-2">Name</th>
                                            <th className="px-4 py-2">Relationship</th>
                                            <th className="px-4 py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {familyMembers.map((member, idx) => (
                                            <tr key={member.id || idx}>
                                                <td className="px-4 py-2 font-bold">{member.fullName}</td>
                                                <td className="px-4 py-2">
                                                    <Input 
                                                        className="h-7 text-[10px] uppercase font-bold" 
                                                        placeholder="SPOUSE, SON, etc."
                                                        value={member.relationship}
                                                        onChange={(e) => {
                                                            const updated = [...familyMembers];
                                                            updated[idx].relationship = e.target.value;
                                                            setFamilyMembers(updated);
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-6 w-6 text-red-500"
                                                        onClick={() => setFamilyMembers(familyMembers.filter((_, i) => i !== idx))}
                                                    >
                                                        <XIcon className="w-3 h-3" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <input type="hidden" name="familyMembers" value={JSON.stringify(familyMembers)} />
                    </div>
                )}
            </div>
        </div>
    );
}

