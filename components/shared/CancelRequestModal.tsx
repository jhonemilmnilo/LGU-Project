"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, AlertTriangle } from "lucide-react";

interface CancelRequestModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void | Promise<void>;
    isCancelling?: boolean;
    serviceName: string;
}

export const CancelRequestModal: React.FC<CancelRequestModalProps> = ({
    isOpen,
    onOpenChange,
    onConfirm,
    isCancelling = false,
    serviceName,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {/* 
              By setting bg-transparent, p-0, and border-none on DialogContent, we let Radix's default viewport 
              centering styles run perfectly without tailwind-merge width conflicts. The custom styling lives 
              safely inside the wrapped div.
            */}
            <DialogContent 
                showCloseButton={false}
                className="p-0 border-none bg-transparent shadow-none w-[92vw] sm:max-w-[380px] z-[150] overflow-hidden"
            >
                <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 dark:from-slate-950 dark:to-black text-white border border-white/10 rounded-[2rem] shadow-2xl p-8 relative overflow-hidden flex flex-col items-center">
                    
                    {/* Ambient glow in background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />

                    <DialogHeader className="space-y-4 text-center flex flex-col items-center">
                        {/* Animated Warning Icon with Glow */}
                        <div className="relative flex items-center justify-center w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 shadow-inner transition-transform duration-500 mb-2">
                            <AlertTriangle className="w-8 h-8 animate-pulse text-red-500" />
                            <div className="absolute inset-0 rounded-3xl bg-red-500/5 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
                        </div>

                        <div className="space-y-2 flex flex-col items-center">
                            <DialogTitle className="text-xl font-black uppercase italic tracking-tight text-white leading-none">
                                Cancel <span className="text-red-500">Application?</span>
                            </DialogTitle>
                            
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500/70 italic bg-red-500/5 border border-red-500/10 px-3 py-1 rounded-full w-fit mx-auto">
                                Action Cannot Be Undone
                            </p>
                        </div>

                        <DialogDescription className="text-xs font-bold text-slate-400 italic leading-relaxed text-center px-2">
                            This will permanently abort your <span className="text-white not-italic font-black underline decoration-red-500/50 decoration-2">{serviceName}</span> request. All filled details and progress will be deleted from active inspection lists.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Staggered Modern Action Buttons */}
                    <div className="flex flex-col gap-3 pt-6 w-full relative z-10">
                        <button
                            onClick={onConfirm}
                            disabled={isCancelling}
                            className="w-full h-12 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black italic uppercase tracking-widest text-[10px] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 border border-red-500/20"
                        >
                            {isCancelling ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Cancelling...</span>
                                </>
                            ) : (
                                <span>Yes, Cancel Application</span>
                            )}
                        </button>

                        <button
                            onClick={() => onOpenChange(false)}
                            disabled={isCancelling}
                            className="w-full h-12 rounded-2xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-black italic uppercase tracking-widest text-[10px] transition-all duration-300 active:scale-[0.98] flex items-center justify-center"
                        >
                            Keep My Application
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
