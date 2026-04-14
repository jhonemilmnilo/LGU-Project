"use client";

import * as React from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogTitle,
    DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Info, CheckCircle2 } from "lucide-react";
import { useBarangay } from "@/components/providers/BarangayProvider";
import { cn } from "@/lib/utils";

interface BarangaySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    barangays: string[];
    themeColor?: string;
}

export function BarangaySelectionModal({ 
    isOpen, 
    onClose, 
    barangays,
    themeColor = "#2563eb" 
}: BarangaySelectionModalProps) {
    const { selectedBarangay, setSelectedBarangay } = useBarangay();
    const [search, setSearch] = React.useState("");

    const filteredBarangays = ["All", ...barangays].filter(b => 
        b.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (barangay: string) => {
        setSelectedBarangay(barangay);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-slate-950 shadow-2xl">
                {/* Header Section */}
                <div className="p-8 sm:p-10 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5 relative">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: themeColor }}>
                            <MapPin className="w-7 h-7" />
                        </div>
                        <div>
                            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                                Select Barangay
                            </DialogTitle>
                            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
                                Explore Localized Content & Hubs
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Important Note */}
                    <div className="flex items-start gap-4 p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-3xl mb-8">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                            <Info className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                        </div>
                        <p className="text-[11px] sm:text-xs font-bold text-amber-900/80 dark:text-amber-400 italic leading-relaxed">
                            &quot;After selecting a barangay all the details will be base in that barangay only. This filters events, announcements, and local services specifically for your community.&quot;
                        </p>
                    </div>

                    {/* Search Input */}
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Find your barangay..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-16 pl-14 pr-6 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-inner text-lg font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700"
                        />
                    </div>
                </div>

                {/* Grid Grid Area */}
                <div className="p-6 sm:p-10 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredBarangays.map((b) => {
                            const isSelected = selectedBarangay === b;
                            return (
                                <button
                                    key={b}
                                    onClick={() => handleSelect(b)}
                                    className={cn(
                                        "group relative h-28 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden active:scale-95",
                                        isSelected 
                                            ? "border-primary bg-primary/5 dark:bg-primary/10" 
                                            : "border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/50 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900"
                                    )}
                                    style={{ 
                                        borderColor: isSelected ? themeColor : undefined,
                                        backgroundColor: isSelected ? `${themeColor}10` : undefined
                                    }}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                        isSelected ? "bg-primary text-white" : "bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-primary/20 group-hover:text-primary"
                                    )} style={{ backgroundColor: isSelected ? themeColor : undefined }}>
                                        {isSelected ? <CheckCircle2 className="w-5 h-5" /> : <MapPin className="w-4 h-4" />}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.15em] text-center px-4",
                                        isSelected ? "text-primary dark:text-white" : "text-slate-500 dark:text-slate-400"
                                    )} style={{ color: isSelected ? themeColor : undefined }}>
                                        {b === "All" ? "Municipality" : b}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {filteredBarangays.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                            <MapPin className="w-12 h-12 opacity-20" />
                            <p className="text-xs font-black uppercase tracking-widest">No matching barangay found</p>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="p-8 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-white/5 flex items-center justify-center">
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                        className="rounded-full px-10 h-10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                        Dismiss
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
