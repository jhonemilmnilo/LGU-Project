"use client";

import * as React from "react";
import { toast } from "sonner";
import { upsertAboutPage } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon } from "lucide-react";

export default function AboutClient({ initialData }: { initialData: any }) {
    const [isSaving, setIsSaving] = React.useState(false);
    const [previewImage, setPreviewImage] = React.useState(initialData?.mayorImageUrl || "");

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        
        try {
            const res = await upsertAboutPage(formData);
            if (res.success) {
                toast.success("About Page updated successfully!");
            } else {
                toast.error(res.error || "Failed to update");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-8 bg-white dark:bg-[#1e2330] p-6 lg:p-10 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5">
            <div className="space-y-4">
                <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Historical Background</h2>
                <Textarea 
                    name="history" 
                    defaultValue={initialData?.history || ""} 
                    rows={8}
                    placeholder="Enter the history of the municipality..."
                    className="resize-none font-medium leading-relaxed bg-slate-50 dark:bg-black/20"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Mission</h2>
                    <Textarea 
                        name="mission" 
                        defaultValue={initialData?.mission || ""} 
                        rows={6}
                        placeholder="Our Mission..."
                        className="bg-slate-50 dark:bg-black/20"
                        required
                    />
                </div>
                <div className="space-y-4">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Vision</h2>
                    <Textarea 
                        name="vision" 
                        defaultValue={initialData?.vision || ""} 
                        rows={6}
                        placeholder="Our Vision..."
                        className="bg-slate-50 dark:bg-black/20"
                        required
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Core Values</h2>
                <Textarea 
                    name="coreValues" 
                    defaultValue={initialData?.coreValues || ""} 
                    rows={4}
                    placeholder="Integrity, Excellence, Service..."
                    className="bg-slate-50 dark:bg-black/20"
                    required
                />
            </div>

            <div className="border-t border-slate-200 dark:border-white/10 pt-10 grid grid-cols-1 md:grid-cols-5 gap-10">
                <div className="space-y-4 md:col-span-3">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Mayor's Message</h2>
                    <Textarea 
                        name="mayorMessage" 
                        defaultValue={initialData?.mayorMessage || ""} 
                        rows={10}
                        placeholder="Welcome to our municipality..."
                        className="bg-slate-50 dark:bg-black/20"
                        required
                    />
                </div>
                <div className="space-y-4 md:col-span-2">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Mayor's Photo</h2>
                    <div className="flex flex-col items-center sm:items-start gap-4">
                        {previewImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={previewImage} alt="Mayor" className="w-56 h-56 object-cover rounded-2xl border-4 border-slate-100 dark:border-slate-800 shadow-xl" />
                        ) : (
                            <div className="w-56 h-56 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border-4 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                                <ImageIcon size={32} className="mb-2 opacity-50" />
                                <span className="text-xs font-bold uppercase tracking-wider">No Image</span>
                            </div>
                        )}
                        <input type="hidden" name="mayorImageUrl" value={initialData?.mayorImageUrl || ""} />
                        <Input 
                            type="file" 
                            name="mayorImageFile" 
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full cursor-pointer file:cursor-pointer file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:border-0 file:rounded-xl file:px-4 file:py-2 file:font-bold file:mr-4 file:transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 border-t border-slate-200 dark:border-white/10 pt-10">
                <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Geography / Demographics</h2>
                <Textarea 
                    name="geographyOrDemographics" 
                    defaultValue={initialData?.geographyOrDemographics || ""} 
                    rows={5}
                    placeholder="Population, land area, geographic facts..."
                    className="bg-slate-50 dark:bg-black/20"
                />
            </div>

            <div className="pt-8 flex justify-end">
                <Button type="submit" disabled={isSaving} className="w-full md:w-auto px-10 h-14 rounded-xl font-bold uppercase tracking-wide text-sm shadow-xl hover:scale-105 transition-all">
                    {isSaving ? "Saving Content..." : "Publish About Information"}
                </Button>
            </div>
        </form>
    );
}
