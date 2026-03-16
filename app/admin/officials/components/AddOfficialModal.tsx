"use client";

import { useState, useEffect, useRef } from "react";
import { useOfficials } from "../providers/OfficialsProvider";
import { useOfficialsForm } from "../hooks/useOfficialsForm";
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
import { Image as ImageIcon, X, Loader2, Users, Phone, Facebook, Calendar, Hash } from "lucide-react";

export function AddOfficialModal() {
    const { isAddModalOpen, setIsAddModalOpen, editingData, setEditingData } = useOfficials();
    const { handleSubmit, loading } = useOfficialsForm();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingData?.imageUrl) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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

    const formatDateForInput = (dateString: string | undefined) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    return (
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) {
                setEditingData(null);
                setImagePreview(null);
            }
        }}>
            <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-2xl">
                <div className="flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">
                    <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-[#151b2b] sticky top-0 z-50 border-b border-slate-200 dark:border-[#2a3040]">
                        <div className="flex items-center space-x-3 mb-1">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {editingData ? "Edit Official Profile" : "Add Municipal Official"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                    Manage the details of elected or appointed council members.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        <form id="officialForm" onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* Profile Photo Upload */}
                                <div className="lg:col-span-1 space-y-6">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold block text-center">Portrait Photo</Label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="group relative w-48 h-64 mx-auto rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50 dark:bg-[#1a1f2e] transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center shadow-sm"
                                    >
                                        {imagePreview ? (
                                            <>
                                                { }
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button type="button" variant="secondary" size="sm" className="font-bold">Change</Button>
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
                                            <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-500 transition-colors p-4 text-center">
                                                <ImageIcon className="w-10 h-10 mb-2" />
                                                <p className="text-xs font-bold uppercase tracking-wide">Upload Portrait</p>
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

                                    <div className="space-y-2 mt-6">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center">
                                            <Hash className="w-4 h-4 mr-1" /> Display Order (Hierarchy)
                                        </Label>
                                        <Input
                                            type="number"
                                            name="order"
                                            defaultValue={editingData?.order || 0}
                                            className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                        />
                                        <p className="text-xs text-slate-500">Lower numbers appear first (e.g. Mayor = 1)</p>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold">Full Name (including title)</Label>
                                        <Input
                                            name="name"
                                            required
                                            defaultValue={editingData?.name}
                                            placeholder="e.g. Hon. Juan Dela Cruz"
                                            className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold">Position / Role</Label>
                                        <Input
                                            name="position"
                                            required
                                            defaultValue={editingData?.position}
                                            placeholder="e.g. Municipal Mayor, SB Member"
                                            className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center">
                                                <Phone className="w-3.5 h-3.5 mr-1" /> Contact Number
                                            </Label>
                                            <Input
                                                name="contactNumber"
                                                defaultValue={editingData?.contactNumber}
                                                placeholder="e.g. 09123456789"
                                                className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center">
                                                <Facebook className="w-3.5 h-3.5 mr-1 text-blue-600" /> Facebook Profile Link
                                            </Label>
                                            <Input
                                                name="facebookUrl"
                                                defaultValue={editingData?.facebookUrl}
                                                placeholder="https://facebook.com/..."
                                                className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center">
                                                <Calendar className="w-3.5 h-3.5 mr-1" /> Term Start Date
                                            </Label>
                                            <Input
                                                type="datetime-local"
                                                name="termStart"
                                                defaultValue={formatDateForInput(editingData?.termStart)}
                                                className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center">
                                                <Calendar className="w-3.5 h-3.5 mr-1" /> Term End Date
                                            </Label>
                                            <Input
                                                type="datetime-local"
                                                name="termEnd"
                                                defaultValue={formatDateForInput(editingData?.termEnd)}
                                                className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold">Biography or Message (Optional)</Label>
                                        <Textarea
                                            name="bio"
                                            defaultValue={editingData?.bio}
                                            placeholder="Write a short background or public message..."
                                            className="min-h-[120px] bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] resize-y"
                                        />
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
                            form="officialForm"
                            disabled={loading}
                            className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                editingData ? "Update Profile" : "Add Official"
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
