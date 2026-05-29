"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RejectionRevisionControlsProps {
    isRejecting: boolean;
    setIsRejecting: (open: boolean) => void;
    isRequestingRevision: boolean;
    setIsRequestingRevision: (open: boolean) => void;
    remarks: string;
    setRemarks: (val: string) => void;
    actionLoading: boolean;
    handleReject: () => Promise<void>;
    handleRequestRevision: () => Promise<void>;
    showButtons?: boolean;
}

export default function RejectionRevisionControls({
    isRejecting,
    setIsRejecting,
    isRequestingRevision,
    setIsRequestingRevision,
    remarks,
    setRemarks,
    actionLoading,
    handleReject,
    handleRequestRevision,
    showButtons = false
}: RejectionRevisionControlsProps) {
    return (
        <>
            {showButtons && (
                <div className="flex gap-4 pt-4 border-t border-dashed border-slate-100 dark:border-white/5">
                    <Button
                        onClick={() => {
                            setRemarks("");
                            setIsRequestingRevision(true);
                        }}
                        disabled={actionLoading}
                        className="flex-1 h-14 bg-amber-500 hover:bg-amber-600 text-white font-black italic uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-amber-500/10 active:scale-95 transition-all"
                    >
                        Request Revision
                    </Button>
                    <Button
                        onClick={() => {
                            setRemarks("");
                            setIsRejecting(true);
                        }}
                        disabled={actionLoading}
                        className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-red-600/10 active:scale-95 transition-all"
                    >
                        Reject Application
                    </Button>
                </div>
            )}

            {/* Rejection Modal */}
            <Dialog open={isRejecting} onOpenChange={setIsRejecting}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-950 border-none rounded-[2.5rem] shadow-2xl p-10">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                            Reject <span className="text-red-500">Application</span>
                        </DialogTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Official Rejection Protocol</p>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reason for Rejection</Label>
                            <Textarea
                                placeholder="Why is this application being rejected? (e.g. Fraudulent document, requirements invalid...)"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="min-h-[120px] rounded-2xl border-none bg-slate-50 dark:bg-white/5 font-bold italic p-6 text-sm text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleReject}
                        disabled={actionLoading || !remarks}
                        className="w-full h-14 bg-red-600 text-white font-black italic uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-red-600/20 active:scale-95 transition-all"
                    >
                        {actionLoading ? "Processing..." : "Confirm Rejection"}
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Revision Modal */}
            <Dialog open={isRequestingRevision} onOpenChange={setIsRequestingRevision}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-950 border-none rounded-[2.5rem] shadow-2xl p-10">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                            Request <span className="text-amber-500">Revision</span>
                        </DialogTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Request Correction Protocol</p>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correction Remarks</Label>
                            <Textarea
                                placeholder="What needs to be corrected? (e.g. Please re-upload a clearer image of your ID...)"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="min-h-[120px] rounded-2xl border-none bg-slate-50 dark:bg-white/5 font-bold italic p-6 text-sm text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleRequestRevision}
                        disabled={actionLoading || !remarks}
                        className="w-full h-14 bg-amber-500 text-white font-black italic uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                    >
                        {actionLoading ? "Processing..." : "Send Revision Request"}
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}
