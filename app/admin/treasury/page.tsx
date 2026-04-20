import React from "react";
import TreasuryDashboard from "./TreasuryDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Treasury Hub | Agno Portal",
    description: "Official administrative dashboard for treasury services and financial processing.",
};

export default function TreasuryPage() {
    return (
        <div className="min-h-screen pb-20">
            {/* Elegant Header */}
            <div className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-white/5 py-12 px-8 mb-10">
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-primary rounded-full" />
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                            Treasury <span className="text-primary tracking-normal italic">Hub</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium italic text-lg max-w-2xl leading-relaxed">
                        Securely manage municipal financial applications, evaluate tax declarations, and issue official community certificates.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                <TreasuryDashboard />
            </div>
        </div>
    );
}
