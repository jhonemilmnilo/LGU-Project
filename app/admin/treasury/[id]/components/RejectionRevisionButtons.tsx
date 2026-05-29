"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface RejectionRevisionButtonsProps {
    onReject: () => void;
    onRevision: () => void;
    actionLoading?: boolean;
    className?: string;
}

export default function RejectionRevisionButtons({
    onReject,
    onRevision,
    actionLoading = false,
    className = ""
}: RejectionRevisionButtonsProps) {
    return (
        <div className={`flex gap-4 ${className}`}>
            <Button
                type="button"
                onClick={onRevision}
                disabled={actionLoading}
                className="flex-1 h-14 bg-orange-500 hover:bg-orange-600 text-white font-black italic uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-orange-500/10 active:scale-95 transition-all"
            >
                Request Revision
            </Button>
            <Button
                type="button"
                onClick={onReject}
                disabled={actionLoading}
                className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-red-600/10 active:scale-95 transition-all"
            >
                Reject Application
            </Button>
        </div>
    );
}
