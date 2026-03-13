"use client";

import { useAnnouncements } from "../providers/AnnouncementProvider";
import { useAnnouncementForm } from "../hooks/useAnnouncementForm";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Info, Calendar, Pin, AlertTriangle, Loader2 } from "lucide-react";

export function AddAnnouncementModal() {
    const { isAddModalOpen, setIsAddModalOpen, editingData, setEditingData } = useAnnouncements();
    const { handleSubmit, loading } = useAnnouncementForm();

    const formatDateForInput = (dateInput: Date | string | null | undefined) => {
        if (!dateInput) return "";
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        return date.toISOString().split('T')[0];
    };

    return (
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) setEditingData(null);
        }}>
            <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-[2.5rem]">
                <DialogHeader className="p-10 pb-6 bg-slate-50/50 dark:bg-[#151b2b] border-b border-slate-200 dark:border-[#2a3040] relative">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Megaphone className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                                {editingData ? "Edit Announcement" : "Create New Announcement"}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium italic">
                                Broadcast important updates to the citizens of Agno.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-10 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <form id="announcementForm" onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Primary Details */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Info className="w-4 h-4" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Primary Content</h3>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notice Headline</Label>
                                    <Input
                                        name="title"
                                        required
                                        defaultValue={editingData?.title || ""}
                                        placeholder="e.g. Schedule for Coastal Clean-up"
                                        className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus:ring-2 focus:ring-blue-600/20 rounded-xl font-bold italic"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notice Description</Label>
                                    <Textarea
                                        name="content"
                                        required
                                        defaultValue={editingData?.content || ""}
                                        placeholder="Enter the full details of the announcement..."
                                        className="min-h-[180px] bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus:ring-2 focus:ring-blue-600/20 rounded-2xl p-5 font-medium italic resize-none"
                                    />
                                </div>
                            </div>

                            {/* Settings & Metadata */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <AlertTriangle className="w-4 h-4" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Notice Settings</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category</Label>
                                        <Select name="category" defaultValue={editingData?.category || "General"}>
                                            <SelectTrigger className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-black uppercase tracking-widest text-[9px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                                                <SelectItem value="General">General</SelectItem>
                                                <SelectItem value="Weather">Weather</SelectItem>
                                                <SelectItem value="Health">Health</SelectItem>
                                                <SelectItem value="Emergency">Emergency</SelectItem>
                                                <SelectItem value="Public Service">Public Service</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Priority</Label>
                                        <Select name="priority" defaultValue={editingData?.priority || "Normal"}>
                                            <SelectTrigger className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-black uppercase tracking-widest text-[9px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                                                <SelectItem value="Normal">Normal</SelectItem>
                                                <SelectItem value="High">High Priority</SelectItem>
                                                <SelectItem value="Critical">Critical Alert</SelectItem>
                                                <SelectItem value="Low">Low Priority</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> Expiry Date (Optional)
                                    </Label>
                                    <Input
                                        type="date"
                                        name="expiryDate"
                                        defaultValue={formatDateForInput(editingData?.expiryDate)}
                                        className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold"
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <div className="space-y-0.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                                                <Pin className="w-3 h-3 text-orange-500" /> Pin to Top
                                            </Label>
                                            <p className="text-[9px] font-medium italic text-slate-400">Lock this notice to the top of the feed.</p>
                                        </div>
                                        <Switch name="isPinned" defaultChecked={editingData?.isPinned || false} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <div className="space-y-0.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Active Status</Label>
                                            <p className="text-[9px] font-medium italic text-slate-400">Make this notice visible to the public.</p>
                                        </div>
                                        <Switch name="isActive" defaultChecked={editingData?.isActive ?? true} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter className="p-10 bg-slate-50/50 dark:bg-[#151b2b] border-t border-slate-200 dark:border-[#2a3040] flex items-center justify-end gap-4 rounded-b-[2.5rem]">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsAddModalOpen(false)}
                        className="h-14 px-8 font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-slate-200 rounded-xl"
                    >
                        Discard
                    </Button>
                    <Button
                        type="submit"
                        form="announcementForm"
                        disabled={loading}
                        className="h-14 px-12 bg-blue-600 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Transmitting...</>
                        ) : (
                            editingData ? "Apply Changes" : "Broadcast Now"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
