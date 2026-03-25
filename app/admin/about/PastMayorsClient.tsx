"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit2, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { upsertPastMayor, deletePastMayor } from "./actions";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PastMayorsClient({ initialMayors, isBarangayAdmin }: { initialMayors: any[], isBarangayAdmin?: boolean }) {
    const router = useRouter();
    const [mayors, setMayors] = useState(initialMayors);
    const [showAddModal, setShowAddModal] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingMayor, setEditingMayor] = useState<any | null>(null);

    useEffect(() => {
        setMayors(initialMayors);
    }, [initialMayors]);

    const handleDelete = async (id: string) => {
        if (!confirm(`Are you sure you want to delete this specific ${isBarangayAdmin ? "captain" : "mayor"} record?`)) return;

        const result = await deletePastMayor(id);
        if (result.success) {
            toast.success(`${isBarangayAdmin ? "Past Captain" : "Past Mayor"} removed`);
            setMayors(mayors.filter(s => s.id !== id));
        } else {
            toast.error("Failed to delete record");
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEdit = (mayor: any) => {
        setEditingMayor(mayor);
        setShowAddModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                        {isBarangayAdmin ? "Past Captains Timeline" : "Historical Leaders"}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">
                        {isBarangayAdmin ? "Manage the timeline of honorable captains who served." : "Manage the timeline of honorable mayors who served."}
                    </p>
                </div>
                <Button onClick={() => { setEditingMayor(null); setShowAddModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 gap-2 shadow-lg shadow-emerald-500/20">
                    <Plus className="w-4 h-4" />
                    {isBarangayAdmin ? "Add Captain" : "Add Leader"}
                </Button>
            </div>

            {mayors.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 font-medium">No results found for {isBarangayAdmin ? "past captains" : "past mayors"}.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mayors.map((mayor) => (
                        <Card key={mayor.id} className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden group hover:border-emerald-500/30 transition-colors">
                            <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-900 relative">
                                {mayor.imageUrl ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={mayor.imageUrl} alt={mayor.name} className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                                        <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">No Image</span>
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 drop-shadow-md">{mayor.termStart} - {mayor.termEnd}</span>
                                    <span className="text-white font-black uppercase tracking-tighter text-xl drop-shadow-lg leading-tight">
                                        {mayor.name}
                                    </span>
                                </div>
                            </div>
                            <CardContent className="p-4 bg-white dark:bg-slate-950 flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(mayor)} className="rounded-xl px-4 flex items-center gap-2">
                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(mayor.id)} className="rounded-xl px-4 flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <MayorEditorModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingMayor(null);
                    router.refresh();
                }}
                initialData={editingMayor}
                isBarangayAdmin={isBarangayAdmin}
            />
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MayorEditorModal({ isOpen, onClose, initialData, isBarangayAdmin }: { isOpen: boolean, onClose: () => void, initialData: any, isBarangayAdmin?: boolean }) {
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl || null);

    // Auto reset state on open/changes
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        termStart: initialData?.termStart || "",
        termEnd: initialData?.termEnd || "",
        description: initialData?.description || "",
        order: initialData?.order || 0,
        imageUrl: initialData?.imageUrl || "",
    });

    // Handle initialData changes (when editing)
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: initialData?.name || "",
                termStart: initialData?.termStart || "",
                termEnd: initialData?.termEnd || "",
                description: initialData?.description || "",
                order: initialData?.order || 0,
                imageUrl: initialData?.imageUrl || "",
            });
            setPreviewUrl(initialData?.imageUrl || null);
            setImageFile(null);
        }
    }, [isOpen, initialData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return toast.error("Name is required");

        const data = new FormData();
        data.append("name", formData.name);
        data.append("termStart", formData.termStart);
        data.append("termEnd", formData.termEnd);
        data.append("description", formData.description);
        data.append("order", formData.order.toString());
        data.append("imageUrl", formData.imageUrl);

        if (imageFile) {
            data.append("imageFile", imageFile);
        }

        setIsSaving(true);
        try {
            const result = await upsertPastMayor(initialData?.id || null, data);
            if (result.success) {
                toast.success(initialData ? "Updated successfully!" : "Added successfully!");
                onClose();
            } else {
                toast.error(`Failed: ${result.error}`);
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-2xl">
                <div className="flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">
                    <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-[#151b2b] sticky top-0 z-50 border-b border-slate-200 dark:border-[#2a3040]">
                        <div className="flex items-center space-x-3 mb-1">
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {initialData 
                                      ? (isBarangayAdmin ? "Edit Captain Profile" : "Edit Mayor Profile") 
                                      : (isBarangayAdmin ? "Add Past Captain" : "Add Past Mayor")}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                    {isBarangayAdmin 
                                      ? "Record the legacy of those who served our barangay." 
                                      : "Record the legacy of those who served our municipality."}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form id="mayorForm" onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Left side form fields */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold">
                                        Full Name
                                    </Label>
                                    <Input
                                        placeholder="e.g. Hon. Juan De La Cruz"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] font-bold"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold">
                                            Term Start
                                        </Label>
                                        <Input
                                            placeholder="1990"
                                            required
                                            value={formData.termStart}
                                            onChange={(e) => setFormData({ ...formData, termStart: e.target.value })}
                                            className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-slate-300 font-bold">
                                            Term End
                                        </Label>
                                        <Input
                                            placeholder="1995"
                                            required
                                            value={formData.termEnd}
                                            onChange={(e) => setFormData({ ...formData, termEnd: e.target.value })}
                                            className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold">
                                        Display Order
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                    />
                                    <p className="text-[10px] text-slate-500 italic">Determines the position in the public carousel.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold">
                                        Key Highlights
                                    </Label>
                                    <Textarea
                                        placeholder="• Accomplishment one&#10;• Accomplishment two"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="min-h-[160px] bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] font-medium leading-relaxed"
                                    />
                                    <p className="text-[9px] text-slate-400 font-medium">Tip: Use bullet points (•) for consistency.</p>
                                </div>
                            </div>

                            {/* Right side Portrait Upload */}
                            <div className="space-y-6">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold block text-center">Portrait Photo</Label>
                                <div 
                                    onClick={() => document.getElementById('mayorImageFileInput')?.click()}
                                    className="aspect-[3/4] rounded-2xl bg-slate-50 dark:bg-[#1a1f2e] overflow-hidden relative border-2 border-dashed border-slate-300 dark:border-[#2a3040] group cursor-pointer hover:border-blue-500 transition-all shadow-inner flex items-center justify-center mx-auto w-full max-w-[280px]"
                                >
                                    {previewUrl || formData.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={previewUrl || formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-slate-400 flex flex-col items-center">
                                            <span className="text-xs uppercase font-black tracking-widest opacity-50">Upload Portrait</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                        <Button type="button" variant="secondary" size="sm" className="font-bold">Change Image</Button>
                                    </div>
                                    <input
                                        id="mayorImageFileInput"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>

                    <DialogFooter className="p-8 bg-white dark:bg-[#151b2b] sticky bottom-0 z-50 border-t border-slate-200 dark:border-[#2a3040] flex justify-end gap-3 rounded-b-2xl">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="h-12 px-8 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="mayorForm"
                            disabled={isSaving}
                            className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isSaving ? (
                                "Saving..."
                            ) : (
                                initialData ? "Update Record" : "Add Record"
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
