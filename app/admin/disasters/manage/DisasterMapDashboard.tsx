    "use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit2, ShieldAlert, Map as MapIcon, Layers, ImageIcon, X, Loader2, Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter 
} from "@/components/ui/dialog";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { addDisasterMap, updateDisasterMap, deleteDisasterMap, toggleDisasterMapStatus } from "../../actions";

export interface DisasterMap {
    id: string;
    title: string;
    location: string;
    description: string | null;
    imagePath: string | null;
    riskLevel: string;
    isPublished: boolean;
}

export function DisasterMapDashboard({ initialData }: { initialData: DisasterMap[] }) {
    const [maps, setMaps] = useState<DisasterMap[]>(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMap, setEditingMap] = useState<DisasterMap | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Reset preview when modal closes
    const handleModalOpenChange = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            setPreviewUrl(null);
            setEditingMap(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this map? All associated data will be removed.")) return;
        const result = await deleteDisasterMap(id);
        if (result.success) {
            setMaps(maps.filter(m => m.id !== id));
            toast.success("Disaster Map deleted.");
        } else {
            toast.error("Failed to delete.");
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const result = await toggleDisasterMapStatus(id, !currentStatus);
        if (result.success) {
            setMaps(maps.map(m => m.id === id ? { ...m, isPublished: !currentStatus } : m));
            toast.success(`Map ${!currentStatus ? 'published' : 'unpublished'}.`);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        let result;
        if (editingMap) {
            result = await updateDisasterMap(editingMap.id, formData);
        } else {
            result = await addDisasterMap(formData);
        }

        if (result.success) {
            toast.success(editingMap ? "Map Updated!" : "New Map Added!");
            // This is a bit lazy, should ideally update local state more precisely
            // but for a quick demo it suffices since we revalidate path.
            // Actually let's just window.location.reload() or refresh data properly.
            window.location.reload();
        } else {
            toast.error(result.error || "Something went wrong.");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-2 bg-slate-100 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50">
                        <MapIcon size={12} className="text-blue-500" />
                        <span className="opacity-50">/</span>
                        <span>Registry</span>
                        <span className="opacity-50">/</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">Disaster Maps</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-3">
                        <Layers className="w-10 h-10 text-blue-600" />
                        Disaster Maps
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
                        Control center for regional hazard visibility and static analysis layers.
                    </p>
                </div>

                <Button
                    onClick={() => {
                        setEditingMap(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-8 py-6 rounded-3xl text-lg font-bold transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-3" />
                    Add Disaster Map
                </Button>
            </div>

            {/* Maps Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                {maps.length > 0 ? maps.map((map) => (
                    <div 
                        key={map.id} 
                        className="group bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col"
                    >
                        {/* Preview Image */}
                        <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900">
                            {map.imagePath ? (
                                <Image 
                                    src={map.imagePath} 
                                    alt={map.title} 
                                    fill 
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                    <ImageIcon className="w-16 h-16 opacity-10" />
                                </div>
                            )}
                            
                            {/* Status Badge */}
                            <div className="absolute top-6 left-6 flex gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${
                                    map.isPublished 
                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                        : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                }`}>
                                    {map.isPublished ? "Live" : "Draft"}
                                </span>
                            </div>

                            {/* Risk Badge */}
                            <div className="absolute top-6 right-6">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${
                                    map.riskLevel === "High" || map.riskLevel === "Critical"
                                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                }`}>
                                    {map.riskLevel} Risk
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex-1 flex flex-col">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{map.location}</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{map.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-3 mb-8">
                                {map.description || "No description provided for this analysis layer."}
                            </p>

                            <div className="mt-auto flex items-center gap-4">
                                <Button 
                                    onClick={() => {
                                        setEditingMap(map);
                                        setIsModalOpen(true);
                                    }}
                                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/5 dark:hover:bg-white/10 rounded-2xl py-6 font-bold flex items-center justify-center gap-2 border border-transparent dark:border-white/5"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit
                                </Button>
                                <Button 
                                    onClick={() => handleToggleStatus(map.id, map.isPublished)}
                                    className={`flex-1 rounded-2xl py-6 font-bold flex items-center justify-center gap-2 border transition-all ${
                                        map.isPublished 
                                            ? "bg-red-50/50 text-red-600 border-red-100 hover:bg-red-50 dark:bg-red-500/5 dark:border-red-500/10" 
                                            : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/10"
                                    }`}
                                >
                                    {map.isPublished ? "Unpublish" : "Publish"}
                                </Button>
                                <button 
                                    onClick={() => handleDelete(map.id)}
                                    className="p-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all dark:bg-red-500/10 dark:hover:bg-red-500/20"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] text-center">
                        <Layers className="w-20 h-20 text-slate-200 dark:text-white/5 mb-6" />
                        <h3 className="text-2xl font-black text-slate-400">Environment Empty</h3>
                        <p className="text-slate-400 mt-2 font-medium">Create your first disaster analysis layer to begin.</p>
                    </div>
                )}
            </div>

            {/* Premium Modal (Shared Design System) */}
            <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
                <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-2xl">
                    <div className="flex flex-col max-h-[90vh]">
                        <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-[#151b2b] border-b border-slate-200 dark:border-[#2a3040]">
                            <div className="flex items-center space-x-3 mb-1">
                                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                                    <Layers className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                                        {editingMap ? "Update Analysis Node" : "Initialize New Spatial Layer"}
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                        Configure hazard modeling parameters and geospatial visualization settings.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <form id="disasterMapForm" onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                                                Map Title *
                                            </label>
                                            <Input 
                                                name="title"
                                                defaultValue={editingMap?.title}
                                                required
                                                className="h-12 bg-slate-50 dark:bg-[#111420] border-slate-200 dark:border-white/5 font-bold"
                                                placeholder="e.g. Agno River Flood Zone"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <MapIcon className="w-3.5 h-3.5 text-blue-500" />
                                                Location Context
                                            </label>
                                            <Input 
                                                name="location"
                                                defaultValue={editingMap?.location || ""}
                                                className="h-12 bg-slate-50 dark:bg-[#111420] border-slate-200 dark:border-white/5 font-bold"
                                                placeholder="e.g. Brgy. Patar, Agno"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                                                Risk Severity Index
                                            </label>
                                            <Select name="riskLevel" defaultValue={editingMap?.riskLevel || ""}>
                                                <SelectTrigger className="h-12 bg-slate-50 dark:bg-[#111420] border-slate-200 dark:border-white/5 font-bold">
                                                    <SelectValue placeholder="Calibrate Risk" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-white/5">
                                                    <SelectItem value="Low">Low Risk</SelectItem>
                                                    <SelectItem value="Moderate">Moderate Risk</SelectItem>
                                                    <SelectItem value="High">High Risk</SelectItem>
                                                    <SelectItem value="Critical">Critical Risk</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Technical Description</label>
                                            <Textarea 
                                                name="description"
                                                defaultValue={editingMap?.description || ""}
                                                rows={5}
                                                className="bg-slate-50 dark:bg-[#111420] border-slate-200 dark:border-white/5 min-h-[148px] resize-none font-medium text-sm leading-relaxed"
                                                placeholder="Enter detailed hazard analysis and historical indicators..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Satellite Analysis Mockup (16:9 Image)</label>
                                    <div className="flex flex-col sm:flex-row items-center gap-8">
                                        <div className="relative w-full sm:w-64 h-36 rounded-2xl bg-slate-50 dark:bg-[#111420] border-2 border-dashed border-slate-200 dark:border-white/10 overflow-hidden group shadow-inner">
                                            {(editingMap?.imagePath || previewUrl) ? (
                                                <Image src={previewUrl || editingMap?.imagePath || ""} alt="Preview" fill className="object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <ImageIcon className="w-10 h-10 text-slate-200 dark:text-slate-800" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                                                <Upload className="w-8 h-8 mb-1" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Replace Imagery</span>
                                            </div>
                                            <input 
                                                type="file" 
                                                name="imageFile" 
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                                                    }
                                                } }
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">
                                                Visual context is critical for hazard identification. Please upload a clear topographical mockup of the affected sector.
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended: 1920x1080px</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <DialogFooter className="p-8 bg-slate-50/50 dark:bg-[#151b2b] border-t border-slate-200 dark:border-[#2a3040] flex justify-end gap-3 rounded-b-2xl">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleModalOpenChange(false)}
                                className="h-12 px-8 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={isSubmitting}
                                type="submit"
                                form="disasterMapForm"
                                className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-tight italic shadow-lg shadow-blue-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Committing...</>
                                ) : (
                                    <>{editingMap ? "Commit Changes" : "Initialize Layer"}</>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
