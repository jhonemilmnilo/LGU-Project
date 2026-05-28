"use client";

import { useState, useEffect, useRef } from "react";
import { useTourism } from "../providers/TourismProvider";
import { useTourismForm } from "../hooks/useTourismForm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Image as ImageIcon, X, Loader2, Camera, Info } from "lucide-react";

export function AddTourismModal() {
    const { isAddModalOpen, setIsAddModalOpen, editingData, setEditingData, currentBarangay } = useTourism();
    const { handleSubmit, loading } = useTourismForm();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync preview with existing image ONLY when editingData changes initially
    useEffect(() => {
        if (editingData?.imageUrl) {
            setImagePreview(editingData.imageUrl);
        } else {
            setImagePreview(null);
        }
    }, [editingData]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) {
                setEditingData(null);
                setImagePreview(null);
            }
        }}>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] p-0 gap-0 shadow-2xl rounded-2xl">
                <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-[#151b2b] sticky top-0 z-10 border-b border-slate-200 dark:border-[#2a3040]">
                    <div className="flex items-center space-x-3 mb-1">
                        <div className="p-2 bg-primary rounded-lg">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {editingData ? "Edit Gallery Item" : "Add New Gallery Image"}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                Fill in the details to showcase another beautiful spot in Mapandan.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Left Column: Basic Info */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 text-primary dark:text-primary mb-2">
                                <Info className="w-4 h-4" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">General Information</h3>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold">Image Title</Label>
                                <Input
                                    name="name"
                                    required
                                    defaultValue={editingData?.name || ""}
                                    placeholder="e.g. Umaguit Island Sunset"
                                    className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <input type="hidden" name="category" value="Other" />

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold">Description</Label>
                                <Textarea
                                    name="description"
                                    defaultValue={editingData?.description || ""}
                                    placeholder="Tell something amazing about this place..."
                                    className="min-h-[120px] bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] resize-none"
                                />
                            </div>
                        </div>

                        {/* Right Column: Location & Image */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 text-primary dark:text-primary mb-2">
                                <MapPin className="w-4 h-4" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Location & Media</h3>
                            </div>
                            <input type="hidden" name="storageFolder" value="tourism" />
                            {(currentBarangay || editingData?.barangay) && (
                                <input 
                                    type="hidden" 
                                    name="barangay" 
                                    value={editingData?.barangay || currentBarangay || ""} 
                                />
                            )}

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold">Address / Barangay</Label>
                                <Input
                                    name="address"
                                    required
                                    defaultValue={editingData?.address || ""}
                                    placeholder=""
                                    className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                />
                            </div>

                            <div className="hidden">
                                <Input name="latitude" type="hidden" defaultValue={editingData?.latitude || ""} />
                                <Input name="longitude" type="hidden" defaultValue={editingData?.longitude || ""} />
                                <Input name="entranceFee" type="hidden" defaultValue={editingData?.entranceFee || ""} />
                                <Input name="bestTimeToVisit" type="hidden" defaultValue={editingData?.bestTimeToVisit || ""} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold">Google Maps URL</Label>
                                <Input
                                    name="googleMapsUrl"
                                    defaultValue={editingData?.googleMapsUrl || ""}
                                    placeholder="https://goo.gl/maps/..."
                                    className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold">Image Upload</Label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group relative h-48 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-blue-400 bg-slate-50 dark:bg-[#1a1f2e] transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center"
                                >
                                    {imagePreview ? (
                                        <>
                                            { }
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button type="button" variant="secondary" size="sm" className="font-bold">Change Image</Button>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImagePreview(null);
                                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400 group-hover:text-primary transition-colors">
                                            <ImageIcon className="w-10 h-10 mb-2" />
                                            <p className="text-sm font-bold uppercase tracking-wide">Upload Photo</p>
                                            <p className="text-[10px]">JPG, PNG or WEBP (MAX 5MB)</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        name="imageFile"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                    />
                                    {editingData?.imageUrl && imagePreview === editingData.imageUrl && (
                                        <input type="hidden" name="imageUrl" value={editingData.imageUrl} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-8 border-t border-slate-200 dark:border-[#2a3040] flex flex-col sm:flex-row gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsAddModalOpen(false)}
                            className="h-12 px-8 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl order-2 sm:order-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-12 px-10 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] order-1 sm:order-2 min-w-[160px]"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                editingData ? "Update Image" : "Post to Gallery"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
