"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EventContactButtonProps {
    contactNumber: string;
}

export function EventContactButton({ contactNumber }: EventContactButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleAction = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(contactNumber);
            } else {
                // Fallback for non-HTTPS or older browsers
                const textArea = document.createElement("textarea");
                textArea.value = contactNumber;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            setCopied(true);
            toast.success("Number copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy number.");
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-2">
            <Button 
                variant="outline" 
                onClick={handleAction}
                className={cn(
                    "h-10 md:h-14 px-4 md:px-10 rounded-lg md:rounded-xl border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[8px] md:text-[10px] flex items-center gap-2 md:gap-4 shadow-sm transition-all active:scale-95",
                    copied ? "border-green-500 text-green-500" : "hover:border-primary"
                )}
            >
                {copied ? (
                    <Check className="w-3 h-3 md:w-5 md:h-5" />
                ) : (
                    <Phone className="w-3 h-3 md:w-5 md:h-5 text-primary" />
                )}
                {copied ? "Number Copied!" : contactNumber}
            </Button>
        </div>
    );
}
