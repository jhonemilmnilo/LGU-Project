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

export function AddHotlineModal() {
    const { isAddModalOpen, setIsAddModalOpen, editingData, setEditingData } = useHotlines();
    const { handleSubmit, loading } = useHotlinesForm();

    return (
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) setEditingData(null);
        }}>
            <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-2xl">
                <div className="flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">
                    <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-[#151b2b] sticky top-0 z-50 border-b border-slate-200 dark:border-[#2a3040]">
                        <div className="flex items-center space-x-3 mb-1">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Phone className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {editingData ? "Edit Hotline Entry" : "Add New Hotline"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                    Add important contact numbers for emergency response or public service.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        <form id="hotlineForm" onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2 sm:col-span-1">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold">Agency / Department Name</Label>
                                        <Input
                                            name="name"
                                            required
                                            defaultValue={editingData?.name || ""}
                                            placeholder="e.g. Agno Police Station"
                                            className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2 sm:col-span-1">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold">Category</Label>
                                        <Input
                                            name="category"
                                            required
                                            defaultValue={editingData?.category || ""}
                                            placeholder="e.g. Police, Health, Fire"
                                            className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2 sm:col-span-1">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center">
                                            <Phone className="w-4 h-4 mr-1" /> Mobile Number
                                        </Label>
                                        <Input
                                            name="mobileNumber"
                                            defaultValue={editingData?.mobileNumber || ""}
                                            placeholder="e.g. 0912 345 6789"
                                            className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2 sm:col-span-1">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center">
                                            <PhoneCall className="w-4 h-4 mr-1" /> Telephone / Landline
                                        </Label>
                                        <Input
                                            name="telephone"
                                            defaultValue={editingData?.telephone || ""}
                                            placeholder="e.g. (075) 123-4567"
                                            className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" /> Address Location
                                    </Label>
                                    <Input
                                        name="address"
                                        defaultValue={editingData?.address || ""}
                                        placeholder="Where is this agency located?"
                                        className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                    />
                                </div>

                                <div className="space-y-2 max-w-[200px]">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center">
                                        <Hash className="w-4 h-4 mr-1" /> Priority Order
                                    </Label>
                                    <Input
                                        type="number"
                                        name="order"
                                        defaultValue={editingData?.order || 0}
                                        className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                    />
                                    <p className="text-xs text-slate-500">Lower numbers appear first</p>
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
                            form="hotlineForm"
                            disabled={loading}
                            className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                editingData ? "Update Entry" : "Add Hotline"
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
