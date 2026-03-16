"use client";

import React, { useState } from "react";
import { Store, UploadCloud, Save } from "lucide-react";
import { useDining } from "../providers/DiningProvider";
import { useDiningForm } from "../hooks/useDiningForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// removed unused containerVariants

export function AddDiningModal() {
    const { isAddModalOpen, setIsAddModalOpen, editingData, setEditingData } = useDining();
    const { handleSubmit, loading } = useDiningForm();
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Sync preview with existing image when editing data changes
    React.useEffect(() => {
        const url = editingData?.imageUrl || null;
        if (imagePreview !== url) {
            setImagePreview(url);
        }
    }, [editingData, imagePreview]);

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
                <div className="flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">
                    {/* Header */}
                    <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-[#151b2b] sticky top-0 z-50 border-b border-slate-200 dark:border-[#2a3040]">
                        <div className="flex items-center space-x-3 mb-1">
                            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                                <Store className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {editingData ? "Edit Dining Place" : "Add New Dining"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                    {editingData ? "Modify the details of this dining listing below." : "Enter the details for the new dining listing below. It will be published immediately."}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Scrollable Form Body */}
                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        <form id="diningForm" onSubmit={handleSubmit} className="space-y-6">

                            {/* Inner Boxed Container imitating the image */}
                            <div className="border border-slate-200 dark:border-[#2a3040] rounded-xl p-6 bg-slate-50/50 dark:bg-[#1e2330]/50 space-y-6">

                                {/* Row 1: Name & Category */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                            Dining Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input id="name" name="name" defaultValue={editingData?.name || ""} required className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] text-slate-900 dark:text-white h-11" placeholder="e.g. Agno Seafood Restaurant" />
                                    </div>
                                    <div>
                                        <Label htmlFor="cuisineType" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                            Cuisine Type / Category
                                        </Label>
                                        <Input id="cuisineType" name="cuisineType" defaultValue={editingData?.cuisineType || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] text-slate-900 dark:text-white h-11" placeholder="Filipino, Seafood, Cafe..." />
                                    </div>
                                </div>

                                {/* Row 2: Description */}
                                <div>
                                    <Label htmlFor="description" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                        Description
                                    </Label>
                                    <Textarea id="description" name="description" defaultValue={editingData?.description || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] text-slate-900 dark:text-white min-h-[100px] resize-none" placeholder="Describe the offerings, specialties, and ambiance..." />
                                </div>

                                {/* Row 3: Location & Maps */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="address" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                            Location / Complete Address <span className="text-red-500">*</span>
                                        </Label>
                                        <Input id="address" name="address" defaultValue={editingData?.address || ""} required className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] text-slate-900 dark:text-white h-11" placeholder="Brgy. Poblacion, Agno" />
                                    </div>
                                    <div>
                                        <Label htmlFor="googleMapsUrl" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                            Google Maps Link
                                        </Label>
                                        <Input id="googleMapsUrl" name="googleMapsUrl" defaultValue={editingData?.googleMapsUrl || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] text-slate-900 dark:text-white h-11" placeholder="https://maps.google.com/..." />
                                    </div>
                                </div>

                                {/* Row 4: Contact & Socials */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="contactNumber" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                            Contact Number
                                        </Label>
                                        <Input id="contactNumber" name="contactNumber" defaultValue={editingData?.contactNumber || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] text-slate-900 dark:text-white h-11" placeholder="0912 345 6789" />
                                    </div>
                                    <div>
                                        <Label htmlFor="facebookUrl" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                            Facebook Page Link
                                        </Label>
                                        <Input id="facebookUrl" name="facebookUrl" defaultValue={editingData?.facebookUrl || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] text-slate-900 dark:text-white h-11" placeholder="https://facebook.com/..." />
                                    </div>
                                </div>

                                {/* Row 5: Coordinates & Hours */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <Label htmlFor="latitude" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                            Latitude
                                        </Label>
                                        <Input id="latitude" name="latitude" type="number" step="any" defaultValue={editingData?.latitude || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] text-slate-900 dark:text-white h-11" placeholder="16.123..." />
                                    </div>
                                    <div>
                                        <Label htmlFor="longitude" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                            Longitude
                                        </Label>
                                        <Input id="longitude" name="longitude" type="number" step="any" defaultValue={editingData?.longitude || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] text-slate-900 dark:text-white h-11" placeholder="119.876..." />
                                    </div>
                                    <div>
                                        <Label htmlFor="openingHours" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                            Operating Hours
                                        </Label>
                                        <Input id="openingHours" name="openingHours" defaultValue={editingData?.openingHours || ""} className="bg-white dark:bg-[#0f1117] border-slate-300 dark:border-[#2a3040] text-slate-900 dark:text-white h-11" placeholder="8:00 AM - 10:00 PM" />
                                    </div>
                                </div>

                                {/* Row 6: Image Upload UI Representation */}
                                <div>
                                    <Label htmlFor="imageFile" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                        Dining Image
                                    </Label>
                                    <label htmlFor="imageFile" className="border-2 border-dashed border-slate-300 dark:border-[#2a3040] rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-100 dark:hover:bg-[#2a3040]/30 transition-colors cursor-pointer group relative overflow-hidden">
                                        {imagePreview ? (
                                            <div className="absolute inset-0 w-full h-full">
                                                { }
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="bg-slate-900/70 text-white px-3 py-1 rounded-md text-sm font-medium">Change Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    <UploadCloud className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                                                </div>
                                                <p className="text-slate-900 dark:text-slate-200 font-medium text-sm mb-1">Click to upload or drag and drop</p>
                                                <p className="text-slate-500 dark:text-slate-500 text-xs">PNG, JPG or WEBP</p>
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

                    {/* Footer Actions */}
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
                            form="diningForm"
                            disabled={loading}
                            className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
