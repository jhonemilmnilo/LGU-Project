"use client";

import { useJobs } from "../providers/JobsProvider";
import { useJobsForm } from "../hooks/useJobsForm";
import { useState, useEffect } from "react";
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
import { Loader2, Briefcase, GraduationCap, Building2, Calendar, MapPin, Globe, Plus, Trash2 } from "lucide-react";

export function AddJobModal() {
    const { isAddModalOpen, setIsAddModalOpen, editingData, setEditingData } = useJobs();
    const { handleSubmit, loading } = useJobsForm();
    const [links, setLinks] = useState<{ label: string; url: string }[]>([]);

    const employmentTypes = ["Permanent", "Contractual", "Casual", "Job Order", "Part-Time"];

    useEffect(() => {
        if (isAddModalOpen) {
            setTimeout(() => {
                if (editingData?.links) {
                    // Handle both array and old object format
                    if (Array.isArray(editingData.links)) {
                        setLinks([...editingData.links]);
                    } else {
                        // Convert old fixed object to dynamic array
                        const converted = [];
                        if (editingData.links.website) converted.push({ label: "Website", url: editingData.links.website });
                        if (editingData.links.facebook) converted.push({ label: "Facebook", url: editingData.links.facebook });
                        if (editingData.links.instagram) converted.push({ label: "Instagram", url: editingData.links.instagram });
                        if (editingData.links.mapUrl) converted.push({ label: "Map URL", url: editingData.links.mapUrl });
                        setLinks(converted);
                    }
                } else {
                    setLinks([]);
                }
            }, 0);
        }
    }, [isAddModalOpen, editingData]);

    const addLink = () => {
        setLinks([...links, { label: "", url: "" }]);
    };

    const removeLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const updateLink = (index: number, field: "label" | "url", value: string) => {
        const newLinks = [...links];
        newLinks[index][field] = value;
        setLinks(newLinks);
    };

    const formatDateForInput = (dateValue: Date | string | null | undefined) => {
        if (!dateValue) return "";
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().slice(0, 16);
    };

    return (
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) setEditingData(null);
        }}>
            <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-2xl">
                <div className="flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">
                    <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-[#151b2b] sticky top-0 z-50 border-b border-slate-200 dark:border-[#2a3040]">
                        <div className="flex items-center space-x-3 mb-1">
                            <div className="p-2 bg-primary rounded-lg">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {editingData ? "Edit Job Posting" : "Post New Job"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                    Create an open application for a position in the municipal government.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        <form id="jobForm" onSubmit={handleSubmit} className="space-y-8">
                            <input type="hidden" name="linksJson" value={JSON.stringify(links)} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Basic Details */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Job Title</Label>
                                        <Input
                                            name="title"
                                            required
                                            defaultValue={editingData?.title}
                                            placeholder="e.g. Municipal Engineer"
                                            className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] font-bold"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center text-xs uppercase tracking-widest">
                                                <Building2 className="w-3 h-3 mr-1" /> Office
                                            </Label>
                                            <Input
                                                name="department"
                                                required
                                                defaultValue={editingData?.department}
                                                placeholder="e.g. Mayor's Office"
                                                className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Type</Label>
                                            <Select name="employmentType" defaultValue={editingData?.employmentType || "Permanent"}>
                                                <SelectTrigger className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                                                    {employmentTypes.map(type => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Salary</Label>
                                            <Input
                                                name="salary"
                                                defaultValue={editingData?.salary || ""}
                                                placeholder="Optional"
                                                className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center text-xs uppercase tracking-widest">
                                                <MapPin className="w-3 h-3 mr-1" /> Location
                                            </Label>
                                            <Input
                                                name="location"
                                                defaultValue={editingData?.location || ""}
                                                placeholder="Optional"
                                                className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center text-xs uppercase tracking-widest">
                                            <MapPin className="w-3 h-3 mr-1" /> Embed Map URL
                                        </Label>
                                        <Input
                                            name="mapUrl"
                                            defaultValue={editingData?.mapUrl || ""}
                                            placeholder="https://www.google.com/maps/embed?pb=..."
                                            className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center text-xs uppercase tracking-widest">
                                            <Calendar className="w-3 h-3 mr-1" /> Deadline
                                        </Label>
                                        <Input
                                            type="datetime-local"
                                            name="deadline"
                                            defaultValue={formatDateForInput(editingData?.deadline)}
                                            className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Description & Qualifications */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Job Description</Label>
                                        <Textarea
                                            name="description"
                                            required
                                            defaultValue={editingData?.description}
                                            placeholder="..."
                                            className="min-h-[80px] bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] resize-y"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center text-xs uppercase tracking-widest">
                                            <GraduationCap className="w-3 h-3 mr-1" /> Qualifications
                                        </Label>
                                        <Textarea
                                            name="qualifications"
                                            required
                                            defaultValue={editingData?.qualifications}
                                            placeholder="..."
                                            className="min-h-[80px] bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] resize-y"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Requirements</Label>
                                        <Textarea
                                            name="requirements"
                                            required
                                            defaultValue={editingData?.requirements}
                                            placeholder="..."
                                            className="min-h-[60px] bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] resize-y"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Dynamic Links Section */}
                            <div className="pt-6 border-t border-slate-200 dark:border-[#2a3040]">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-primary/10 rounded-md">
                                            <Globe className="w-4 h-4 text-primary" />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-primary">External Links & Socials</h3>
                                    </div>
                                    <Button 
                                        type="button" 
                                        onClick={addLink}
                                        variant="outline"
                                        className="h-9 px-4 border-primary/20 text-primary hover:bg-primary/5 font-bold rounded-xl flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Add Link
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {links.length === 0 ? (
                                        <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-center">
                                            <p className="text-slate-400 text-sm font-medium">No links added. Add maps, facebook, or websites.</p>
                                        </div>
                                    ) : (
                                        links.map((link, index) => (
                                            <div key={index} className="flex gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="flex-1 grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-[#1a1f2e] rounded-xl border border-slate-200 dark:border-[#2a3040]">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Label</Label>
                                                        <Input
                                                            value={link.label}
                                                            onChange={(e) => updateLink(index, "label", e.target.value)}
                                                            placeholder="e.g. Facebook"
                                                            className="h-10 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040]"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">URL</Label>
                                                        <Input
                                                            value={link.url}
                                                            onChange={(e) => updateLink(index, "url", e.target.value)}
                                                            placeholder="https://..."
                                                            className="h-10 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040]"
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => removeLink(index)}
                                                    className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 mb-4"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
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
                            form="jobForm"
                            disabled={loading}
                            className="h-12 px-10 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                editingData ? "Update Job" : "Post Job"
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
