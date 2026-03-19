"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { 
    Send, 
    Image as ImageIcon, 
    MapPin, 
    X, 
    AlertCircle, 
    Loader2, 
    CheckCircle2, 
    LogIn,
    Map,
    Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { addCommunityReport } from "@/app/admin/actions";
import LocationPicker from "@/components/shared/LocationPicker";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ReportForm() {
    const { data: session, status } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [previews, setPreviews] = useState<string[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(previews[index]);
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const [selectedCategory, setSelectedCategory] = useState<string>("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!session) {
            toast.error("Please sign in first!");
            return;
        }

        setIsSubmitting(true);
        const formElement = e.currentTarget;
        const formData = new FormData(formElement);
        
        // Handle "Others" category
        if (selectedCategory === "Others") {
            const customCategory = formData.get("customCategory") as string;
            if (!customCategory || customCategory.trim() === "") {
                toast.error("Please specify your category!");
                setIsSubmitting(false);
                return;
            }
            formData.set("category", `Other: ${customCategory}`);
        }

        images.forEach(image => formData.append("images", image));
        if (location) {
            formData.append("latitude", location.lat.toString());
            formData.append("longitude", location.lng.toString());
            formData.append("address", location.address);
        }

        try {
            const res = await addCommunityReport(formData);
            if (res.success) {
                toast.success("Report submitted successfully!", {
                    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                });
                formElement.reset();
                setImages([]);
                setPreviews([]);
                setLocation(null);
                setShowMap(false);
                setSelectedCategory("");
            } else {
                toast.error(res.error || "Failed to submit report");
            }
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-[2.5rem] border border-white/10">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">Setting up...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-10 bg-white/5 rounded-[2.5rem] border border-white/10 text-center gap-6"
            >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-xl font-black uppercase italic tracking-tighter">Sign In Required</h4>
                    <p className="text-slate-400 text-sm font-medium italic max-w-xs">You need to be signed in to submit a local concern or report an issue.</p>
                </div>
                <Button 
                    onClick={() => window.location.href = "/auth/login"}
                    className="py-4 h-auto px-10 bg-primary hover:opacity-90 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] italic shadow-xl shadow-primary/25 flex items-center gap-3"
                >
                    <LogIn className="w-4 h-4" /> Login Now
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-8 shadow-2xl backdrop-blur-sm overflow-hidden transition-all duration-500">
            <div className="space-y-6">
                <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Report <span className="text-primary">an Issue</span></h3>
                    <p className="text-slate-400 text-[11px] font-medium italic">Your concerns help us maintain a better Mapandan.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 opacity-50">Issue Category</label>
                        <Select name="category" required onValueChange={setSelectedCategory} value={selectedCategory}>
                            <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold transition-all focus:ring-primary text-white italic">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white rounded-2xl">
                                <SelectItem value="Road Repair" className="font-bold italic py-3 cursor-pointer">Road Repair</SelectItem>
                                <SelectItem value="Waste Management" className="font-bold italic py-3 cursor-pointer">Waste Management</SelectItem>
                                <SelectItem value="Street Lights" className="font-bold italic py-3 cursor-pointer">Street Lights</SelectItem>
                                <SelectItem value="Drainage Issue" className="font-bold italic py-3 cursor-pointer">Drainage Issue</SelectItem>
                                <SelectItem value="Public Safety" className="font-bold italic py-3 cursor-pointer">Public Safety</SelectItem>
                                <SelectItem value="Others" className="font-bold italic py-3 cursor-pointer">Others</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <AnimatePresence>
                        {selectedCategory === "Others" && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-2 overflow-hidden"
                            >
                                <input 
                                    name="customCategory"
                                    required
                                    placeholder="Please specify the issue..."
                                    className="w-full h-12 bg-primary/10 border border-primary/20 rounded-2xl px-4 font-bold text-white italic text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 opacity-50">Detail Description</label>
                        <Textarea 
                            name="description"
                            required
                            placeholder="What's the issue? Give us the details..." 
                            className="min-h-[100px] bg-white/5 border-white/10 rounded-2xl p-4 font-bold transition-all focus:ring-primary text-white italic resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Compact Photo Attachment Area */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 opacity-50">Attach Photos</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="relative aspect-video rounded-2xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-all group overflow-hidden"
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    multiple 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleImageChange}
                                />
                                {previews.length > 0 ? (
                                    <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-1 bg-slate-950/80">
                                        {previews.slice(0, 4).map((preview, i) => (
                                            <div key={i} className="relative h-full w-full rounded-md overflow-hidden bg-slate-800">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={preview} alt="p" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeImage(i);
                                                    }}
                                                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white z-20"
                                                >
                                                    <X className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        ))}
                                        {previews.length > 4 && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
                                                <span className="text-[10px] font-black text-white">+{previews.length - 4} MORE</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300">Add Photos</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Compact Location Picker Trigger */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 opacity-50">Pin Location</label>
                            <div 
                                onClick={() => setShowMap(!showMap)}
                                className={cn(
                                    "aspect-video rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group",
                                    location ? "bg-primary/5 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                                )}
                            >
                                {location ? (
                                    <>
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                                            <MapPin className="w-4 h-4 shadow-3xl shadow-primary/50" />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest">Ready to go!</span>
                                    </>
                                ) : (
                                    <>
                                        <Map className="w-5 h-5 group-hover:text-primary transition-colors" />
                                        <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-slate-300 italic">{showMap ? "Close Map" : "Open Map"}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Inline Map Expansion */}
                    <AnimatePresence>
                        {showMap && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden bg-slate-900 rounded-3xl border border-white/10 p-2"
                            >
                                <LocationPicker 
                                    onSelect={(lat, lng) => {
                                        setLocation({ lat, lng, address: `Pinned at ${lat.toFixed(4)}, ${lng.toFixed(4)}` });
                                        setShowMap(false);
                                        toast.success("Location pinned!");
                                    }}
                                    onClose={() => setShowMap(false)}
                                    title="Move marker to adjust"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="pt-2 flex flex-col gap-4">
                        <Button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 h-auto bg-primary hover:opacity-90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] italic shadow-xl shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {isSubmitting ? "Submitting Report..." : "Submit Report"}
                        </Button>

                        <div className="flex items-center gap-4 py-2 opacity-50 hover:opacity-100 transition-opacity">
                            <div className="h-[1px] grow bg-white/10" />
                            <Link 
                                href="/user/reports" 
                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2 group italic"
                            >
                                <span>View My Reports</span>
                                <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                            </Link>
                            <div className="h-[1px] grow bg-white/10" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
