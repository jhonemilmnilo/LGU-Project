"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit2, ShieldAlert, Map as MapIcon, Layers, ImageIcon, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 backdrop-blur-sm bg-slate-900/60 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#151b2b] w-full max-w-2xl rounded-[3rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500">
                        <div className="px-10 pt-10 pb-6 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">{editingMap ? "Modify Layer" : "Create Layer"}</h2>
                                <p className="text-slate-500 font-medium text-sm italic">Input spatial analysis details below.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-all text-slate-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Map Title</label>
                                    <input 
                                        name="title"
                                        defaultValue={editingMap?.title}
                                        required
                                        className="w-full px-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-3xl outline-none focus:border-blue-500/50 transition-all font-bold text-slate-800 dark:text-white"
                                        placeholder="e.g. Flood Analysis 2026"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Location (Optional)</label>
                                    <input 
                                        name="location"
                                        defaultValue={editingMap?.location || ""}
                                        className="w-full px-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-3xl outline-none focus:border-blue-500/50 transition-all font-bold text-slate-800 dark:text-white"
                                        placeholder="e.g. Agno, Pangasinan"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Risk Severity</label>
                                <select 
                                    name="riskLevel"
                                    defaultValue={editingMap?.riskLevel || ""}
                                    className="w-full px-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-3xl outline-none focus:border-blue-500/50 appearance-none font-bold text-slate-800 dark:text-white"
                                >
                                    <option value="">No Risk Specified</option>
                                    <option value="Low">Low Risk</option>
                                    <option value="Moderate">Moderate Risk</option>
                                    <option value="High">High Risk</option>
                                    <option value="Critical">Critical Risk</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Context Analysis</label>
                                <textarea 
                                    name="description"
                                    defaultValue={editingMap?.description || ""}
                                    rows={4}
                                    className="w-full px-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-[2rem] outline-none focus:border-blue-500/50 transition-all font-medium text-slate-700 dark:text-white"
                                    placeholder="Enter detailed hazard analysis and historical data indicators..."
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Satellite Visualization (Image)</label>
                                <div className="flex items-center gap-6">
                                    <div className="relative w-40 h-40 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 overflow-hidden group">
                                        {editingMap?.imagePath && (
                                            <Image src={editingMap.imagePath} alt="Preview" fill className="object-cover" />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity bg-slate-900/40 text-white cursor-pointer">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                        <input 
                                            type="file" 
                                            name="imageFile" 
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1 text-sm text-slate-400 font-medium italic">
                                        Upload a high-resolution map mockup. Recommended aspect ratio 16:9 for best visualization results.
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl py-8 text-xl font-black uppercase tracking-tight shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                                    {editingMap ? "Update Analysis" : "Initialize Layer"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
