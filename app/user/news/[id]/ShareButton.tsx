"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ShareButton() {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy link.");
        }
    };

    return (
        <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-primary/20 group"
        >
            {copied ? (
                <Check className="w-4 h-4 text-green-500 group-hover:text-white" />
            ) : (
                <Share2 className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Share Article"}
        </button>
    );
}
