"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface TransactionInfoCardProps {
    transactionName: string;
    categoryLabel: string;
    themeColor: string;
}

export default function TransactionInfoCard({ transactionName, categoryLabel, themeColor }: TransactionInfoCardProps) {
    return (
        <div className="bg-[#111827] border border-slate-800 rounded-[2rem] p-8 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors"
                    style={{ 
                        backgroundColor: `${themeColor}10`, 
                        borderColor: `${themeColor}20`,
                        color: themeColor 
                    }}
                >
                    <Info className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <span 
                        className="text-[9px] font-black uppercase tracking-[0.25em] block leading-none italic"
                        style={{ color: themeColor }}
                    >
                        Transaction Information
                    </span>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mt-1 leading-none">
                        {transactionName}
                    </h2>
                </div>
            </div>
            <Badge 
                variant="outline" 
                className="font-mono text-xs font-black italic uppercase tracking-widest px-4 py-2 rounded-xl border transition-colors shrink-0"
                style={{ 
                    color: themeColor,
                    backgroundColor: `${themeColor}10`,
                    borderColor: `${themeColor}20`
                }}
            >
                Category: {categoryLabel}
            </Badge>
        </div>
    );
}
