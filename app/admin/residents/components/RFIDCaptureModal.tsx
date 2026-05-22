"use client";

import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Radio, CheckCircle2, AlertCircle } from "lucide-react";
import { updateResidentRFID } from "../../actions";
import { toast } from "sonner";
import { useResident } from "../providers";

interface RFIDCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    residentId: string;
    residentName: string;
}

export function RFIDCaptureModal({ isOpen, onClose, residentId, residentName }: RFIDCaptureModalProps) {
    const [rfid, setRfid] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"waiting" | "captured" | "error">("waiting");
    const inputRef = useRef<HTMLInputElement>(null);
    const { setResidents, themeColor } = useResident();

    useEffect(() => {
        if (isOpen) {
            setRfid("");
            setStatus("waiting");
            // Focus input after a short delay for dialog animation
            setTimeout(() => inputRef.current?.focus(), 500);
        }
    }, [isOpen]);

    const handleRFIDSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!rfid) return;

        setLoading(true);
        try {
            const res = await updateResidentRFID(residentId, rfid);
            if (res.success) {
                setResidents(prev => prev.map(r => r.id === residentId ? { ...r, rfid } : r));
                toast.success("RFID assigned successfully!");
                onClose();
            } else {
                setStatus("error");
                toast.error(res.error || "Failed to assign RFID.");
            }
        } catch {
            toast.error("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // Auto submit if RFID length is typical (e.g., 10 digits) or on Enter
    // Many readers send "Enter" at the end
    useEffect(() => {
        if (rfid.length >= 8 && status === "waiting") {
            setStatus("captured");
        }
    }, [rfid, status]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-3xl p-0 overflow-hidden">
                <div className="p-8 text-center">
                    <DialogHeader className="mb-6">
                        <div 
                            style={{ backgroundColor: `${themeColor}1a` }}
                            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        >
                            <Radio 
                                style={{ color: themeColor }}
                                className={`w-8 h-8 ${status === 'waiting' ? 'animate-pulse' : 'opacity-70'}`} 
                            />
                        </div>
                        <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                            Capture RFID Tag
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium tracking-tight mt-2">
                            Please scan the RFID card for <span className="font-bold" style={{ color: themeColor }}>{residentName}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="relative group">
                            <Input
                                ref={inputRef}
                                value={rfid}
                                onChange={(e) => setRfid(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRFIDSubmit()}
                                placeholder="Scan now..."
                                style={{
                                    borderColor: status === 'waiting' ? undefined : undefined
                                }}
                                className="h-16 text-center text-2xl font-mono font-black tracking-[0.3em] bg-slate-50 dark:bg-[#1a1f2e] border-2 border-slate-200 dark:border-[#2a3040] focus-visible:ring-0 rounded-2xl shadow-inner transition-all focus:border-slate-300 dark:focus:border-slate-700"
                                autoComplete="off"
                            />
                            {status === 'waiting' && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Waiting for reader input...</p>}
                            {status === 'captured' && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 py-2 px-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-xs font-black uppercase tracking-wider">Tag Detected: {rfid}</span>
                                    </div>
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 py-2 px-4 rounded-xl border border-red-100 dark:border-red-800">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-xs font-black uppercase tracking-wider">Invalid or Duplicate Tag</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 dark:bg-[#151b2b] border-t border-slate-200 dark:border-[#2a3040] flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleRFIDSubmit()}
                        disabled={!rfid || loading}
                        style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}33` }}
                        className="flex-1 h-12 text-white hover:opacity-90 active:scale-95 rounded-xl font-black uppercase tracking-widest text-xs gap-2 transition-all duration-200"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Assign Tag</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
