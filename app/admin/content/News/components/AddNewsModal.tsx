"use client";

import { useState, useEffect, useRef } from "react";
import { useNews } from "../providers/NewsProvider";
import { useNewsForm } from "../hooks/useNewsForm";
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
import { Image as ImageIcon, X, Loader2, Newspaper, Info, Calendar } from "lucide-react";

export function AddNewsModal() {
    const { isAddModalOpen, setIsAddModalOpen, editingData, setEditingData } = useNews();
    const { handleSubmit, loading } = useNewsForm();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const url = editingData?.imageUrl || null;
        if (imagePreview !== url) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setImagePreview(url);
        }
    }, [editingData, imagePreview]);

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

    const categories = ["Announcement", "Local News", "Advisory", "Project Update", "Other"];

    const formatDateForInput = (dateInput: Date | string | undefined) => {
        if (!dateInput) return "";
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
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
            <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-[2.5rem]">
                <div className="flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">
                    <DialogHeader className="p-10 pb-6 bg-slate-50/50 dark:bg-[#151b2b] sticky top-0 z-50 border-b border-slate-200 dark:border-[#2a3040]">
                        <div className="flex items-center space-x-4 mb-1">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Newspaper className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                                    {editingData ? "Edit News Article" : "Publish News Article"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium italic">
                                    Keep the community informed with the latest local news and stories.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-10 overflow-y-auto custom-scrollbar">
                        <form id="newsForm" onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Left Column: Article Logic */}
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-2 text-blue-600">
                                        <Info className="w-4 h-4" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Article Information</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Headline Title</Label>
                                        <Input
                                            name="title"
                                            required
                                            defaultValue={editingData?.title || ""}
                                            placeholder="e.g. Mapandan Suspends Classes During Typhoon"
                                            className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus:ring-2 focus:ring-blue-600/20 rounded-xl font-bold italic"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category</Label>
                                            <Select name="category" defaultValue={editingData?.category || "Local News"}>
                                                <SelectTrigger className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-black uppercase tracking-widest text-[9px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                                                    {categories.map(cat => (
                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Author</Label>
                                            <Input
                                                name="author"
                                                defaultValue={editingData?.author || "Municipal Office"}
                                                placeholder="e.g. Mayor's Office"
                                                className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold italic"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                            <Calendar className="w-3 h-3" /> Publish Date
                                        </Label>
                                        <Input
                                            type="datetime-local"
                                            name="publishDate"
                                            required
                                            defaultValue={formatDateForInput(editingData?.publishDate || new Date().toISOString())}
                                            className="h-14 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] rounded-xl font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2 flex-grow">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Article Content</Label>
                                        <Textarea
                                            name="content"
                                            required
                                            defaultValue={editingData?.content || ""}
                                            placeholder="Write the full news story here..."
                                            className="min-h-[200px] bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus:ring-2 focus:ring-blue-600/20 rounded-2xl p-5 font-medium italic resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Media */}
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-2 text-blue-600">
                                        <ImageIcon className="w-4 h-4" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Featured Image</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="group relative h-80 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-500 bg-slate-50 dark:bg-[#1a1f2e] transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-2"
                                        >
                                            {imagePreview ? (
                                                <>
                                                    { }
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
                                                <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-600 transition-colors">
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
                                    
                                    <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                        <p className="text-[10px] font-medium italic text-blue-700 dark:text-blue-400">
                                            Tip: Use high-quality landscape photos (16:9) to make the news article stand out on the main landing page.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <DialogFooter className="p-10 bg-slate-50/50 dark:bg-[#151b2b] sticky bottom-0 z-50 border-t border-slate-200 dark:border-[#2a3040] flex items-center justify-end gap-4 rounded-b-[2.5rem]">
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
                            form="newsForm"
                            disabled={loading}
                            className="h-14 px-12 bg-blue-600 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
                            ) : (
                                editingData ? "Apply Changes" : "Publish Article"
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
