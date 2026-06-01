"use client";

import React, { useState, useEffect, type CSSProperties } from "react";
import { UploadCloud, Save, Building2, MapPin, Globe, CreditCard, List } from "lucide-react";
import { useAccommodation } from "../providers/AccommodationProvider";
import { useAccommodationForm } from "../hooks/useAccommodationForm";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AddAccommodationModal() {
    const { isAddModalOpen, setIsAddModalOpen, editingData, setEditingData, currentBarangay, themeColor } = useAccommodation();
    const { handleSubmit, loading } = useAccommodationForm();
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Sync preview with existing image ONLY when editingData changes initially
    useEffect(() => {
        if (editingData?.imageUrl) {
            setImagePreview(editingData.imageUrl);
        } else {
            setImagePreview(null);
        }
    }, [editingData]);

    return (
        <Dialog
            open={isAddModalOpen}
            onOpenChange={(open) => {
                if (!open) {
                    setEditingData(null);
                }
                setIsAddModalOpen(open);
            }}
        >
            <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-2xl">
                <div className="relative flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">
                    {/* Header */}
                    <DialogHeader
                        className="p-8 pb-4 sticky top-0 z-50 border-b border-slate-200 dark:border-[#2a3040]"
                        style={{ backgroundColor: `${themeColor}14` }}
                    >
                        <div className="flex items-center space-x-3 mb-1">
                            <div className="p-2 rounded-lg shadow-lg" style={{ backgroundColor: themeColor, boxShadow: `0 12px 30px -12px ${themeColor}` }}>
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {editingData ? "Edit Tuluyan Details" : "Add New Accommodation"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                    {editingData ? "Modify the details of this stay listing below." : "Enter the details for the new stay listing below. It will be published immediately."}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Scrollable Form Body */}
                    <div className="p-6 pb-28 overflow-y-auto custom-scrollbar">
                        <form id="accommodationForm" onSubmit={handleSubmit} className="space-y-6">

                            {/* Inner Boxed Container */}
                            <div className="border border-slate-200 dark:border-[#2a3040] rounded-xl p-6 bg-slate-50/50 dark:bg-[#1e2330]/50 space-y-8">

                                {/* Section 1: Basic Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 text-sm font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-200 dark:border-[#2a3040]">
                                        <List className="w-4 h-4" />
                                        <span>Basic Information</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Name of Place <span className="text-red-500">*</span></Label>
                                            <Input id="name" name="name" defaultValue={editingData?.name || ""} required className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] h-11" placeholder="e.g. Mapandan Beach Resort" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Type of Stay <span className="text-red-500">*</span></Label>
                                            <Select name="type" defaultValue={editingData?.type || "Resort"}>
                                                <SelectTrigger
                                                    className="!w-full !h-11 min-h-11 bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040]"
                                                    style={{ "--tw-ring-color": `${themeColor}40` } as CSSProperties}
                                                >
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent position="popper" className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                                                    <SelectItem value="Resort">Resort</SelectItem>
                                                    <SelectItem value="Hotel">Hotel</SelectItem>
                                                    <SelectItem value="Homestay">Homestay</SelectItem>
                                                    <SelectItem value="Transient">Transient</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</Label>
                                        <Textarea id="description" name="description" defaultValue={editingData?.description || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] min-h-[100px] resize-none" placeholder="What makes this place special? Mention views, rooms, etc..." />
                                    </div>
                                </div>

                                {/* Section 2: Pricing & Contact */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 text-sm font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-200 dark:border-[#2a3040]">
                                        <CreditCard className="w-4 h-4" />
                                        <span>Details & Contact</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="priceRange" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Price Range / Rate</Label>
                                            <Input id="priceRange" name="priceRange" defaultValue={editingData?.priceRange || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] h-11" placeholder="e.g. ₱1,500 - ₱3,000 / night" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contactNumber" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Contact Number</Label>
                                            <Input id="contactNumber" name="contactNumber" defaultValue={editingData?.contactNumber || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] h-11" placeholder="0912 345 6789" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="websiteUrl" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Website or Booking URL</Label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                                <Input id="websiteUrl" name="websiteUrl" defaultValue={editingData?.websiteUrl || ""} className="pl-9 bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] h-11" placeholder="https://..." />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="amenities" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Amenities (Comma separated)</Label>
                                            <Input id="amenities" name="amenities" defaultValue={editingData?.amenities || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] h-11" placeholder="WiFi, Pool, Breakfast, Parking..." />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Location */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 text-sm font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-200 dark:border-[#2a3040]">
                                        <MapPin className="w-4 h-4" />
                                        <span>Location</span>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Complete Address <span className="text-red-500">*</span></Label>
                                        <Input id="address" name="address" defaultValue={editingData?.address || ""} required className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] h-11" placeholder="Street, Barangay, Mapandan" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="latitude" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Latitude</Label>
                                            <Input id="latitude" name="latitude" type="number" step="any" defaultValue={editingData?.latitude || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] h-11 font-mono text-sm" placeholder="16.123..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="longitude" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Longitude</Label>
                                            <Input id="longitude" name="longitude" type="number" step="any" defaultValue={editingData?.longitude || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] h-11 font-mono text-sm" placeholder="119.876..." />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="googleMapsUrl" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Google Maps URL</Label>
                                        <Input id="googleMapsUrl" name="googleMapsUrl" defaultValue={editingData?.googleMapsUrl || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] h-11" placeholder="https://maps.google.com/..." />
                                    </div>
                                </div>

                                {/* Section 4: Image */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2" style={{ color: themeColor }}>
                                        <UploadCloud className="w-4 h-4" />
                                        <input type="hidden" name="storageFolder" value="accommodations" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Accommodation Image</h3>
                                    </div>
                                    {(currentBarangay || editingData?.barangay) && (
                                        <input 
                                            type="hidden" 
                                            name="barangay" 
                                            value={editingData?.barangay || currentBarangay || ""} 
                                        />
                                    )}
                                    <label
                                        htmlFor="imageFile"
                                        className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-100 dark:hover:bg-[#2a3040]/30 transition-all cursor-pointer group relative overflow-hidden min-h-[200px]"
                                        style={{ borderColor: `${themeColor}40` }}
                                    >
                                        {imagePreview ? (
                                            <div className="absolute inset-0 w-full h-full">
                                                { }
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-70 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="bg-slate-900/80 text-white px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm">Change Cover Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: `${themeColor}1a` }}>
                                                    <UploadCloud className="w-8 h-8" style={{ color: themeColor }} />
                                                </div>
                                                <p className="text-slate-900 dark:text-slate-200 font-bold text-lg mb-1 tracking-tight">Click to upload photo</p>
                                                <p className="text-slate-500 dark:text-slate-500 text-sm">Support PNG, JPG or WEBP for resort highlights</p>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            id="imageFile"
                                            name="imageFile"
                                            accept="image/*"
                                            className="opacity-0 absolute w-0 h-0"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const url = URL.createObjectURL(file);
                                                    setImagePreview(url);
                                                }
                                            }}
                                        />
                                        <input type="hidden" name="imageUrl" value={editingData?.imageUrl || ""} />
                                    </label>
                                </div>

                            </div>
                        </form>
                    </div>

                    <div className="absolute left-0 right-0 bottom-0 z-50 p-6 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-[#0f1117] dark:via-[#0f1117]/95">
                        <Button
                            type="submit"
                            form="accommodationForm"
                            disabled={loading}
                            className="w-full h-12 text-white font-bold shadow-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{ backgroundColor: themeColor, boxShadow: `0 14px 28px -14px ${themeColor}` }}
                        >
                            {loading ? (
                                "Saving..."
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {editingData ? "Update Listing" : "Save Listing"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
