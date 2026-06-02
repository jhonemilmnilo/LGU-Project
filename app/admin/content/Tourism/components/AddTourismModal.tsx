"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
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
    const { isAddModalOpen, setIsAddModalOpen, editingData, setEditingData, currentBarangay, themeColor } = useTourism();
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
            <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-[2.5rem]">
                <div className="flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">
                    <DialogHeader
                        className="p-6 pb-4 sticky top-0 z-50 border-b border-slate-200 dark:border-[#2a3040] relative overflow-hidden"
                        style={{ backgroundColor: `${themeColor}14` }}
                    >
                        <div className="flex items-center space-x-3">
                            <div 
                                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" 
                                style={{ backgroundColor: themeColor, boxShadow: `0 12px 30px -12px ${themeColor}` }}
                            >
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                                    {editingData ? "Edit Gallery Item" : "Add New Gallery Image"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium italic text-sm">
                                    Fill in the details to showcase another beautiful spot in Mapandan.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-10 overflow-y-auto custom-scrollbar">
                        <form id="tourismForm" onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Left Column: Basic Info */}
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-2" style={{ color: themeColor }}>
                                        <Info className="w-4 h-4" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">General Information</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Image Title</Label>
                                        <Input
                                            name="name"
                                            required
                                            defaultValue={editingData?.name || ""}
                                            placeholder="e.g. Umaguit Island Sunset"
                                            className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus:ring-2 rounded-xl font-bold italic"
                                            style={{ "--tw-ring-color": `${themeColor}40` } as CSSProperties}
                                        />
                                    </div>

                                    <input type="hidden" name="category" value="Other" />

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</Label>
                                        <Textarea
                                            name="description"
                                            defaultValue={editingData?.description || ""}
                                            placeholder="Tell something amazing about this place..."
                                            className="min-h-[120px] bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus:ring-2 rounded-2xl p-5 font-medium italic resize-none"
                                            style={{ "--tw-ring-color": `${themeColor}40` } as CSSProperties}
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Location & Image */}
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-2" style={{ color: themeColor }}>
                                        <MapPin className="w-4 h-4" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Location & Media</h3>
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
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Address / Barangay</Label>
                                        <Input
                                            name="address"
                                            required
                                            defaultValue={editingData?.address || ""}
                                            placeholder=""
                                            className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold italic"
                                        />
                                    </div>

                                    <div className="hidden">
                                        <Input name="latitude" type="hidden" defaultValue={editingData?.latitude || ""} />
                                        <Input name="longitude" type="hidden" defaultValue={editingData?.longitude || ""} />
                                        <Input name="entranceFee" type="hidden" defaultValue={editingData?.entranceFee || ""} />
                                        <Input name="bestTimeToVisit" type="hidden" defaultValue={editingData?.bestTimeToVisit || ""} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Google Maps URL</Label>
                                        <Input
                                            name="googleMapsUrl"
                                            defaultValue={editingData?.googleMapsUrl || ""}
                                            placeholder="https://goo.gl/maps/..."
                                            className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold italic"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Image Upload</Label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="group relative h-80 rounded-[2rem] border-2 border-dashed bg-slate-50 dark:bg-[#1a1f2e] transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-2"
                                            style={{ borderColor: `${themeColor}30` }}
                                        >
                                            {imagePreview ? (
                                                <>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-[1.8rem]" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button type="button" variant="secondary" size="sm" className="font-bold rounded-xl">Change Image</Button>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-4 right-4 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                                                <div className="flex flex-col items-center text-slate-400 transition-colors">
                                                    <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                                        <ImageIcon className="w-8 h-8" />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Upload Photo</p>
                                                    <p className="text-[9px] font-medium mt-1 italic">Click or drag image file</p>
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
                        </form>
                    </div>

                    <DialogFooter className="p-6 pt-0 bg-white dark:bg-[#0f1117] border-none shrink-0">
                        <Button
                            type="submit"
                            form="tourismForm"
                            disabled={loading}
                            className="w-full h-12 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{ backgroundColor: themeColor, boxShadow: `0 14px 28px -14px ${themeColor}` }}
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                editingData ? "Apply Changes" : "Post to Gallery"
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}