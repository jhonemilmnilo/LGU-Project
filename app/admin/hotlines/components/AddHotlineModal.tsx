"use client";

import { useHotlines } from "../providers/HotlinesProvider";
import { useHotlinesForm } from "../hooks/useHotlinesForm";
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
import { Loader2, Phone, PhoneCall, MapPin, Hash } from "lucide-react";
import type { CSSProperties } from "react";

export function AddHotlineModal() {
    const { isAddModalOpen, setIsAddModalOpen, editingData, setEditingData, themeColor } = useHotlines();
    const { handleSubmit, loading } = useHotlinesForm();

    return (
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) setEditingData(null);
        }}>
            <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-[2.5rem]">
                <div className="flex flex-col h-[90vh] sm:max-h-[85vh]">
                    <DialogHeader
                        className="p-6 pb-4 sticky top-0 z-50 border-b border-slate-200 dark:border-[#2a3040] relative overflow-hidden shrink-0"
                        style={{ backgroundColor: `${themeColor}14` }}
                    >
                        <div className="flex items-center space-x-3">
                            <div 
                                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" 
                                style={{ backgroundColor: themeColor, boxShadow: `0 12px 30px -12px ${themeColor}` }}
                            >
                                <Phone className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                                    {editingData ? "Edit Hotline Entry" : "Add New Hotline"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium italic text-sm">
                                    Add important contact numbers for emergency response or public service.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 p-6 pb-20 overflow-y-auto custom-scrollbar">
                        <form id="hotlineForm" onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 min-w-0">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Agency / Department Name</Label>
                                        <Input
                                            name="name"
                                            required
                                            defaultValue={editingData?.name || ""}
                                            placeholder="e.g. Mapandan Police Station"
                                            className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold italic focus:ring-2"
                                            style={{ "--tw-ring-color": `${themeColor}40` } as CSSProperties}
                                        />
                                    </div>
                                    <div className="space-y-2 min-w-0">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category</Label>
                                        <Input
                                            name="category"
                                            required
                                            defaultValue={editingData?.category || ""}
                                            placeholder="e.g. Police, Health, Fire"
                                            className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold italic focus:ring-2"
                                            style={{ "--tw-ring-color": `${themeColor}40` } as CSSProperties}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 min-w-0">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center">
                                            <Phone className="w-3.5 h-3.5 mr-1" style={{ color: themeColor }} /> Mobile Number
                                        </Label>
                                        <Input
                                            name="mobileNumber"
                                            defaultValue={editingData?.mobileNumber || ""}
                                            placeholder="e.g. 0912 345 6789"
                                            className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold italic"
                                        />
                                    </div>
                                    <div className="space-y-2 min-w-0">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center">
                                            <PhoneCall className="w-3.5 h-3.5 mr-1" style={{ color: themeColor }} /> Telephone / Landline
                                        </Label>
                                        <Input
                                            name="telephone"
                                            defaultValue={editingData?.telephone || ""}
                                            placeholder="e.g. (075) 123-4567"
                                            className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold italic"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center">
                                        <MapPin className="w-3.5 h-3.5 mr-1" style={{ color: themeColor }} /> Address Location
                                    </Label>
                                    <Input
                                        name="address"
                                        defaultValue={editingData?.address || ""}
                                        placeholder="Where is this agency located?"
                                        className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold italic"
                                    />
                                </div>

                                <div className="space-y-2 max-w-[200px]">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center">
                                        <Hash className="w-3.5 h-3.5 mr-1" style={{ color: themeColor }} /> Priority Order
                                    </Label>
                                    <Input
                                        type="number"
                                        name="order"
                                        defaultValue={editingData?.order || 0}
                                        className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold italic focus:ring-2"
                                        style={{ "--tw-ring-color": `${themeColor}40` } as CSSProperties}
                                    />
                                    <p className="text-xs text-slate-500">Lower numbers appear first</p>
                                </div>
                            </div>
                        </form>
                    </div>

                    <DialogFooter className="p-6 pt-0 bg-white dark:bg-[#0f1117] border-none shrink-0">
                        <Button
                            type="submit"
                            form="hotlineForm"
                            disabled={loading}
                            className="w-full h-12 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{ backgroundColor: themeColor, boxShadow: `0 14px 28px -14px ${themeColor}` }}
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                editingData ? "Apply Changes" : "Add Hotline"
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}