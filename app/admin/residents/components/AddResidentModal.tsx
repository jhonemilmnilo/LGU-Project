"use client";

import { useResident } from "../providers";
import { useResidentForm } from "../hooks/useResidentForm";
import { Upload, User, MapPin, Phone, HeartPulse, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export function AddResidentModal() {
    const { isAddModalOpen, setIsAddModalOpen, editingData, setEditingData } = useResident();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { handleSubmit, loading, imageFile, setImageFile } = useResidentForm();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const barangays = ["Aloleng", "Bangan-Oda", "Baruan", "Boboy", "Cayungnan", "Dangley", "Gayusan", "Macaboboni", "Magsaysay", "Namuac", "Poblacion East", "Poblacion West", "Patar", "Sablig", "San Juan", "Tupa"];

    useEffect(() => {
        const url = editingData?.imageUrl || null;
        if (previewUrl !== url) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPreviewUrl(url);
        }
        setImageFile(null);
    }, [editingData, setImageFile, isAddModalOpen, previewUrl]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    return (
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) {
                setEditingData(null);
                setImageFile(null);
                setPreviewUrl(null);
            }
        }}>
            <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-2xl">
                <div className="flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">
                    <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-[#151b2b] sticky top-0 z-50 border-b border-slate-200 dark:border-[#2a3040]">
                        <div className="flex items-center space-x-3 mb-1">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {editingData ? "Edit Resident Profile" : "Register New Resident"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                    Fill in the details to register a citizen to the central database.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        <form id="residentForm" onSubmit={handleSubmit} className="space-y-8">
                            {/* Profile Photo Section */}
                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-32 rounded-full border-4 border-slate-100 dark:border-[#2a3040] overflow-hidden bg-slate-50 dark:bg-[#0f1117] flex items-center justify-center group mb-4 shadow-sm">
                                    {previewUrl ? (
                                        <Image src={previewUrl} alt="Preview" layout="fill" objectFit="cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                    )}
                                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                                        <Upload className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-medium">Upload ID Photo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Click to upload photo</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Personal Information */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-[#2a3040] pb-2 mb-4">
                                        <User className="w-5 h-5 text-blue-500" /> Personal Information
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">First Name *</label>
                                            <Input name="firstName" defaultValue={editingData?.firstName} required className="bg-slate-50 dark:bg-[#0f1117]" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Last Name *</label>
                                            <Input name="lastName" defaultValue={editingData?.lastName} required className="bg-slate-50 dark:bg-[#0f1117]" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Middle Name</label>
                                            <Input name="middleName" defaultValue={editingData?.middleName || ""} className="bg-slate-50 dark:bg-[#0f1117]" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Birth *</label>
                                            <Input name="dateOfBirth" type="date" defaultValue={editingData?.dateOfBirth ? format(new Date(editingData.dateOfBirth), "yyyy-MM-dd") : ""} required className="bg-slate-50 dark:bg-[#0f1117]" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gender *</label>
                                            <Select name="gender" defaultValue={editingData?.gender || "Male"}>
                                                <SelectTrigger className="bg-slate-50 dark:bg-[#0f1117]">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-[#151b2b]">
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Civil Status *</label>
                                            <Select name="civilStatus" defaultValue={editingData?.civilStatus || "Single"}>
                                                <SelectTrigger className="bg-slate-50 dark:bg-[#0f1117]">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-[#151b2b]">
                                                    <SelectItem value="Single">Single</SelectItem>
                                                    <SelectItem value="Married">Married</SelectItem>
                                                    <SelectItem value="Widowed">Widowed</SelectItem>
                                                    <SelectItem value="Separated">Separated</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Contact & Location */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-[#2a3040] pb-2 mb-4">
                                        <MapPin className="w-5 h-5 text-rose-500" /> Location & Contact
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Mobile Number</label>
                                            <Input name="contactNumber" defaultValue={editingData?.contactNumber || ""} placeholder="09XX XXX XXXX" className="bg-slate-50 dark:bg-[#0f1117]" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                                            <Input name="email" type="email" defaultValue={editingData?.email || ""} placeholder="juan@example.com" className="bg-slate-50 dark:bg-[#0f1117]" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Barangay *</label>
                                        <Select name="barangay" defaultValue={editingData?.barangay || barangays[0]}>
                                            <SelectTrigger className="bg-slate-50 dark:bg-[#0f1117]">
                                                <SelectValue placeholder="Select barangay" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-[#151b2b] max-h-[250px]">
                                                {barangays.map(bg => (
                                                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                                            <span>Detailed Address *</span>
                                            <span className="text-xs text-slate-500 font-normal">House No., Street, Purok</span>
                                        </label>
                                        <Textarea name="address" defaultValue={editingData?.address} required className="bg-slate-50 dark:bg-[#0f1117] min-h-[100px] resize-none" placeholder="Enter detailed address..." />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-200 dark:border-[#2a3040] pt-6">
                                {/* Additional & Emergency */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-[#2a3040] pb-2 mb-4">
                                        <HardHat className="w-5 h-5 text-amber-500" /> Additional Info
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Blood Type</label>
                                            <Select name="bloodType" defaultValue={editingData?.bloodType || ""}>
                                                <SelectTrigger className="bg-slate-50 dark:bg-[#0f1117]">
                                                    <SelectValue placeholder="Select blood type" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-[#151b2b]">
                                                    <SelectItem value="A+">A+</SelectItem>
                                                    <SelectItem value="A-">A-</SelectItem>
                                                    <SelectItem value="B+">B+</SelectItem>
                                                    <SelectItem value="B-">B-</SelectItem>
                                                    <SelectItem value="AB+">AB+</SelectItem>
                                                    <SelectItem value="AB-">AB-</SelectItem>
                                                    <SelectItem value="O+">O+</SelectItem>
                                                    <SelectItem value="O-">O-</SelectItem>
                                                    <SelectItem value="Unknown">Unknown</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Occupation</label>
                                            <Input name="occupation" defaultValue={editingData?.occupation || ""} className="bg-slate-50 dark:bg-[#0f1117]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-[#2a3040] pb-2 mb-4">
                                        <HeartPulse className="w-5 h-5 text-red-500" /> Emergency Details
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Emergency Contact Name</label>
                                        <Input name="emergencyContactName" defaultValue={editingData?.emergencyContactName || ""} className="bg-slate-50 dark:bg-[#0f1117]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Emergency Contact Number</label>
                                        <Input name="emergencyContactNumber" defaultValue={editingData?.emergencyContactNumber || ""} className="bg-slate-50 dark:bg-[#0f1117]" />
                                    </div>
                                </div>
                            </div>

                        </form>
                    </div>

                    <DialogFooter className="p-8 bg-white dark:bg-[#151b2b] sticky bottom-0 z-50 border-t border-slate-200 dark:border-[#2a3040] flex justify-end gap-3 rounded-b-2xl">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsAddModalOpen(false)}
                            className="h-12 px-8 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="residentForm"
                            disabled={loading}
                            className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                editingData ? "Update Details" : "Register Resident"
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
